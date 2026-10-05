#!/usr/bin/env node
/**
 * Generate a new 3-level article from a news URL or text using an
 * OpenAI-compatible chat API, and append it to src/data/articles.json.
 *
 * Usage:
 *   node scripts/generate-article.mjs --url https://example.com/news \
 *        --original https://source.example/article
 *
 *   node scripts/generate-article.mjs --file ./news.txt
 *   node scripts/generate-article.mjs --text "Raw news text here ..."
 *
 * Environment (all overridable):
 *   LR_API_BASE  default https://open.bigmodel.cn/api/paas/v4   (Zhipu GLM, OpenAI-compatible)
 *   LR_API_KEY   your API key (required)
 *   LR_MODEL     default glm-4.6
 *
 * The fetched page is read for personal study; generated content is added to
 * your local corpus only.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE = process.env.LR_API_BASE || 'https://open.bigmodel.cn/api/paas/v4'
const KEY = process.env.LR_API_KEY
const MODEL = process.env.LR_MODEL || 'glm-4.6'

const args = process.argv.slice(2)
function arg(name) {
  const i = args.indexOf(name)
  return i !== -1 && args[i + 1] ? args[i + 1] : null
}

const DATA_FILE = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/articles.json')

const SYSTEM = `You convert a piece of news into a graded English reading article with three difficulty levels. Reply with STRICT JSON only (no markdown fences), matching exactly:
{
  "title": "headline in English, max 60 chars",
  "summary": "one-sentence summary in English, max 90 chars",
  "levels": {
    "1": {"content": "...", "vocabulary": [{"word":"...","definition":"simple English meaning"}], "quiz":[{"question":"...","options":["a","b","c"],"answer":0}]},
    "2": {...},
    "3": {...}
  }
}
Rules:
- Level 1: 100-120 words, very short sentences, present/past simple, CEFR A2 vocabulary.
- Level 2: 150-180 words, CEFR B1, natural everyday phrasing.
- Level 3: 200-260 words, CEFR B2-C1, close to real news prose.
- Paragraphs separated by \\n\\n. 4 paragraphs for L2/L3, 2-3 for L1.
- vocabulary: 3-5 entries per level (words actually used in that level's content).
- quiz: Level 1-2 get 1 question, Level 3 gets 2-3 questions; 3 options each; "answer" is the 0-based index of the correct option; wrong options must be clearly wrong, not tricky.
- Keep all facts faithful to the source. Neutral tone.`

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80)
}

async function fetchArticleText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`)
  const html = await res.text()
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 12000)
}

async function chat(userContent) {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: userContent },
      ],
      temperature: 0.3,
    }),
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = await res.json()
  return data.choices[0].message.content
}

function parseJsonLoose(text) {
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('no JSON found in model reply')
  return JSON.parse(m[0])
}

async function main() {
  if (!KEY) {
    console.error('Set LR_API_KEY (e.g. Zhipu BigModel key). See script header for usage.')
    process.exit(1)
  }

  let source = ''
  let originalUrl = arg('--original')
  if (arg('--url')) {
    const url = arg('--url')
    console.error(`fetching ${url} ...`)
    source = await fetchArticleText(url)
    originalUrl = originalUrl || url
  } else if (arg('--file')) {
    source = readFileSync(arg('--file'), 'utf8').slice(0, 12000)
  } else if (arg('--text')) {
    source = arg('--text')
  } else {
    console.error('Provide --url <news url>, --file <txt> or --text "..."')
    process.exit(1)
  }

  console.error('generating 3-level article ...')
  const raw = await chat(`Source material:\n\n${source}\n\n${originalUrl ? `Original article URL: ${originalUrl}` : ''}`)
  const gen = parseJsonLoose(raw)

  const slug = slugify(gen.title) || `article-${Date.now()}`
  const record = {
    slug,
    title: gen.title,
    summary: gen.summary,
    date: Date.now(),
    cover: null,
    originalUrl: originalUrl || null,
    reads: Math.floor(Math.random() * 300) + 40,
    levels: {
      '1': { ...gen.levels['1'], audio: null },
      '2': { ...gen.levels['2'], audio: null },
      '3': { ...gen.levels['3'], audio: null },
    },
  }

  const list = existsSync(DATA_FILE) ? JSON.parse(readFileSync(DATA_FILE, 'utf8')) : []
  const filtered = list.filter((a) => a.slug !== slug)
  filtered.push(record)
  filtered.sort((a, b) => (b.date || 0) - (a.date || 0))
  writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 1), 'utf8')
  console.log(`✓ added "${record.title}" (${slug}) — ${filtered.length} articles in corpus`)
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
