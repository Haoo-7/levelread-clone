import dictRaw from '../data/dict.json'

export interface Sense {
  pos: string
  zh: string
}

export interface LookupResult {
  word: string
  usphone?: string
  ukphone?: string
  /** POS + Chinese senses from the bundled dictionary */
  senses: Sense[]
  /** English definition from this article's word list (shown first when present) */
  en?: string
  /** dictionary example sentences [en, cn] */
  examples: [string, string][]
  source: 'vocab' | 'dict' | 'online' | 'none'
}

interface DictEntry {
  u?: string
  k?: string
  s: [string, string][]
  e?: [string, string][]
}

const DICT = dictRaw as unknown as Record<string, DictEntry>

export function dictHas(word: string): boolean {
  return Object.prototype.hasOwnProperty.call(DICT, word.toLowerCase())
}

export function dictSize(): number {
  return Object.keys(DICT).length
}

/** de-inflection following the original site's rules ('s, -ing, -ed, -ies, -es, -s, -ly) */
export function baseForms(word: string): string[] {
  const t = word.toLowerCase()
  const forms = new Set<string>([t])
  const add = (w: string) => {
    if (w && w.length >= 2) forms.add(w)
  }
  if (t.endsWith("'s")) add(t.slice(0, -2))
  if (t.endsWith('ing') && t.length > 3) {
    const stem = t.slice(0, -3)
    add(stem)
    add(stem + 'e')
    if (stem.length >= 2 && stem.slice(-1) === stem.slice(-2, -1)) add(stem.slice(0, -1))
    if (stem.endsWith('i')) add(stem.slice(0, -1) + 'y')
  }
  if (t.endsWith('ed') && t.length > 3) {
    const stem = t.slice(0, -2)
    add(stem)
    add(stem + 'e')
    if (stem.length >= 2 && stem.slice(-1) === stem.slice(-2, -1)) add(stem.slice(0, -1))
    if (stem.endsWith('i')) add(stem.slice(0, -1) + 'y')
  }
  if (t.endsWith('ies')) add(t.slice(0, -3) + 'y')
  if (t.endsWith('es')) add(t.slice(0, -2))
  if (t.endsWith('s') && !t.endsWith('ss')) add(t.slice(0, -1))
  if (t.endsWith('ly')) add(t.slice(0, -2))
  return [...forms]
}

const cache = new Map<string, LookupResult>()

/** bundled-dictionary lookup (instant, offline); EN definition from article vocab wins for display */
export function lookupLocal(raw: string, localVocab: Map<string, string>): LookupResult {
  const forms = baseForms(raw)
  const enDef = forms.map((f) => localVocab.get(f)).find(Boolean)

  for (const f of forms) {
    const hit = DICT[f]
    if (hit) {
      return {
        word: f,
        usphone: hit.u || undefined,
        ukphone: hit.k || undefined,
        senses: hit.s.map(([pos, zh]) => ({ pos, zh })),
        en: enDef,
        examples: hit.e ?? [],
        source: 'dict',
      }
    }
  }
  if (enDef) {
    return { word: forms[0], senses: [], en: enDef, examples: [], source: 'vocab' }
  }
  return { word: raw.toLowerCase(), senses: [], examples: [], source: 'none' }
}

/** async full lookup: local first, then online fallbacks (dictionaryapi.dev / MyMemory) */
export async function lookupWord(raw: string, localVocab: Map<string, string>): Promise<LookupResult> {
  const local = lookupLocal(raw, localVocab)
  if (local.source === 'dict' || local.source === 'vocab') return local

  const cached = cache.get(raw.toLowerCase())
  if (cached) return cached

  // online: dictionaryapi.dev for an English definition
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 6000)
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(raw.toLowerCase())}`, {
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    if (res.ok) {
      const data = await res.json()
      const entry = Array.isArray(data) ? data[0] : null
      if (entry) {
        const meaning = entry.meanings?.[0]
        const en = meaning?.definitions?.[0]?.definition
        const audioUrl: string | undefined = entry.phonetics?.find((p: any) => p.audio)?.audio
        const r: LookupResult = {
          word: entry.word ?? raw.toLowerCase(),
          usphone: entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text,
          senses: en && meaning?.partOfSpeech ? [{ pos: meaning.partOfSpeech, zh: '' }] : [],
          en,
          examples: [],
          source: 'online',
        }
        if (audioUrl) (r as any).audioUrl = audioUrl
        cache.set(raw.toLowerCase(), r)
        return r
      }
    }
  } catch {
    /* offline */
  }

  // last resort: MyMemory zh gloss of the bare word
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 6000)
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(raw.toLowerCase())}&langpair=en|zh-CN&de=study@local.app`,
      { signal: ctrl.signal },
    )
    clearTimeout(timer)
    const data = await res.json()
    const zh: string = data?.responseData?.translatedText ?? ''
    if (zh && !/^MYMEMORY WARNING/i.test(zh)) {
      const r: LookupResult = { word: raw.toLowerCase(), senses: [{ pos: '', zh }], examples: [], source: 'online' }
      cache.set(raw.toLowerCase(), r)
      return r
    }
  } catch {
    /* offline */
  }

  const none: LookupResult = { word: raw.toLowerCase(), senses: [], examples: [], source: 'none' }
  return none
}
