/** paragraph-level EN→zh translation via the free MyMemory API (no key required) */

const paraCache = new Map<string, string>()
const MAX_LEN = 450

async function rawTranslate(text: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN&de=study@local.app`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`translate http ${res.status}`)
  const data = await res.json()
  const out: string = data?.responseData?.translatedText ?? ''
  if (!out || /^MYMEMORY WARNING/i.test(out)) throw new Error('translate quota/parse')
  return out
}

function chunk(text: string): string[] {
  if (text.length <= MAX_LEN) return [text]
  const sentences = text.split(/(?<=[.!?])\s+/)
  const parts: string[] = []
  let cur = ''
  for (const s of sentences) {
    if ((cur + ' ' + s).trim().length > MAX_LEN) {
      if (cur) parts.push(cur.trim())
      cur = s
    } else {
      cur = (cur + ' ' + s).trim()
    }
  }
  if (cur) parts.push(cur.trim())
  return parts
}

export async function translateParagraph(text: string): Promise<string> {
  const key = text.trim()
  if (!key) return ''
  if (paraCache.has(key)) return paraCache.get(key)!
  const parts = chunk(key)
  const out: string[] = []
  for (const p of parts) {
    out.push(await rawTranslate(p))
    await new Promise((r) => setTimeout(r, 300)) // stay polite with the free API
  }
  const joined = out.join(' ')
  paraCache.set(key, joined)
  return joined
}

/** translate a whole article (array of paragraphs); calls onDone per paragraph */
export async function translateAll(paragraphs: string[], onDone: (i: number, zh: string) => void): Promise<void> {
  await Promise.all(
    paragraphs.map(async (p, i) => {
      try {
        const zh = await translateParagraph(p)
        onDone(i, zh)
      } catch {
        onDone(i, '')
      }
    }),
  )
}
