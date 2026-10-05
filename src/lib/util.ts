import type { Article, Level } from '../types'
import { LOCALE, type Lang } from '../i18n'

export const PAGESIZE = 8

export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

export function readingMinutes(text: string): number {
  return Math.max(1, Math.ceil(wordCount(text) / 100))
}

export function formatDate(ms: number, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALE[lang], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(ms))
}

export function paginate<T>(items: T[], page: number): { slice: T[]; total: number } {
  const total = Math.max(1, Math.ceil(items.length / PAGESIZE))
  const p = Math.min(Math.max(1, page), total)
  return { slice: items.slice((p - 1) * PAGESIZE, p * PAGESIZE), total }
}

export function levelContent(a: Article, level: Level): string {
  return a.levels[String(level) as '1' | '2' | '3']?.content ?? ''
}

/** article title -> fragment used for the share link */
export function articlePath(a: Article, level: Level): string {
  return `/news/level-${level}/${a.slug}`
}

export function prevNext(articles: Article[], a: Article): { prev: Article | null; next: Article | null } {
  const idx = articles.findIndex((x) => x.slug === a.slug)
  if (idx === -1) return { prev: null, next: null }
  return { prev: articles[idx + 1] ?? null, next: articles[idx - 1] ?? null }
}

/** split a paragraph into word / non-word tokens for clickable text */
export function tokenize(text: string): { w: string; isWord: boolean }[] {
  return text.split(/(\p{L}[\p{L}'’-]*)/u).filter((p) => p !== '').map((p) => ({
    w: p,
    isWord: /^[\p{L}][\p{L}'’-]*$/u.test(p),
  }))
}

/** crude de-inflection so tapped words match dictionary / vocab entries */
export function baseForms(word: string): string[] {
  const w = word.toLowerCase()
  const forms = new Set<string>([w])
  if (w.endsWith('ies')) forms.add(w.slice(0, -3) + 'y')
  if (w.endsWith('es')) forms.add(w.slice(0, -2))
  if (w.endsWith('s') && !w.endsWith('ss')) forms.add(w.slice(0, -1))
  if (w.endsWith('ed')) {
    forms.add(w.slice(0, -1))
    forms.add(w.slice(0, -2))
  }
  if (w.endsWith('ing')) {
    forms.add(w.slice(0, -3))
    forms.add(w.slice(0, -3) + 'e')
  }
  if (w.endsWith('ly')) forms.add(w.slice(0, -2))
  return [...forms]
}
