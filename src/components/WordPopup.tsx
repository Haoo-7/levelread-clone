import { useEffect, useMemo, useRef, useState } from 'react'
import { lookupLocal, lookupWord, type LookupResult } from '../lib/dict'
import { speakOnce } from '../lib/speech'
import { getState, saveWord } from '../lib/store'
import { KeyButton, Icon } from './KeyButton'
import type { Article } from '../types'

interface Props {
  word: string
  anchor: DOMRect
  localVocab: Map<string, string>
  /** all articles, for "Examples from news" */
  corpus: Article[]
  sourceSlug?: string
  onClose: () => void
}

/** find up to `max` example sentences containing the word (de-inflected) in the corpus */
function findNewsExamples(word: string, corpus: Article[], max = 2): string[] {
  const forms = new Set(
    (function expand(w: string): string[] {
      const out = [w]
      if (w.endsWith('ing') && w.length > 3) out.push(w.slice(0, -3), w.slice(0, -3) + 'e')
      if (w.endsWith('ed') && w.length > 3) out.push(w.slice(0, -2), w.slice(0, -1))
      if (w.endsWith('s') && !w.endsWith('ss')) out.push(w.slice(0, -1))
      return out
    })(word.toLowerCase()),
  )
  const re = new RegExp(`\\b(${[...forms].map(esc).join('|')})\\b`, 'i')
  const out: string[] = []
  for (const a of corpus) {
    if (out.length >= max) break
    for (const key of ['1', '2', '3'] as const) {
      const paras = a.levels[key].content.split(/\n\n+/)
      for (const p of paras) {
        const sents = p.split(/(?<=[.!?])\s+/)
        for (const s of sents) {
          if (s.length > 12 && s.length < 220 && re.test(s)) {
            if (!out.includes(s.trim())) {
              out.push(s.trim())
              break
            }
          }
        }
        if (out.length >= max) break
      }
      if (out.length >= max) break
    }
  }
  return out
}

function esc(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function Highlighted({ sentence, word }: { sentence: string; word: string }) {
  const forms = (function expand(w: string): string[] {
    const out = [w]
    if (w.endsWith('ing') && w.length > 3) out.push(w.slice(0, -3), w.slice(0, -3) + 'e')
    if (w.endsWith('ed') && w.length > 3) out.push(w.slice(0, -2), w.slice(0, -1))
    if (w.endsWith('s') && !w.endsWith('ss')) out.push(w.slice(0, -1))
    return out
  })(word.toLowerCase())
  const re = new RegExp(`\\b(${forms.map(esc).join('|')})\\b`, 'ig')
  const parts = sentence.split(re)
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} className="hl">
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

export default function WordPopup({ word, anchor, localVocab, corpus, sourceSlug, onClose }: Props) {
  const [result, setResult] = useState<LookupResult | null>(null)
  const [saved, setSaved] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const newsExamples = useMemo(() => findNewsExamples(word, corpus), [word, corpus])

  useEffect(() => {
    let alive = true
    setResult(null)
    setSaved(getState().wordbook.some((w) => w.word.toLowerCase() === word.toLowerCase()))
    // instant local result, then async online enrichment if local had nothing
    const local = lookupLocal(word, localVocab)
    setResult(local.source === 'none' ? null : local)
    if (local.source === 'none') {
      lookupWord(word, localVocab).then((r) => alive && setResult(r))
    }
    return () => {
      alive = false
    }
  }, [word, localVocab])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  // fixed position right under the word, clamped to the viewport
  const width = Math.min(360, window.innerWidth - 24)
  let left = anchor.left + anchor.width / 2 - width / 2
  left = Math.max(8, Math.min(left, window.innerWidth - width - 8))
  const below = anchor.bottom + 8
  const style: React.CSSProperties =
    below + 200 > window.innerHeight && anchor.top > 220
      ? { left, top: anchor.top - 8, transform: 'translateY(-100%)', width }
      : { left, top: below, width }

  const speak = () => {
    const r = result
    const anyR = r as (LookupResult & { audioUrl?: string }) | null
    if (anyR?.audioUrl) {
      new Audio(anyR.audioUrl).play().catch(() => speakOnce(r?.word ?? word))
    } else {
      speakOnce(r?.word ?? word)
    }
  }

  const save = () => {
    if (!result) return
    const zh = result.senses.map((s) => (s.pos ? `${s.pos}. ${s.zh}` : s.zh)).join('；')
    const ok = saveWord({
      word: result.word,
      definition: result.en ?? result.senses.map((s) => s.zh).join('；'),
      zh,
      sourceSlug,
    })
    if (ok) setSaved(true)
  }

  const hasContent =
    result && (result.senses.length > 0 || result.en || result.examples.length > 0)

  return (
    <div className="word-pop" style={style} ref={ref}>
      <div className="head">
        <div>
          <div className="w">{result?.word ?? word}</div>
          {(result?.usphone || result?.ukphone) && (
            <div className="phon">/{result.usphone || result.ukphone}/</div>
          )}
        </div>
        <div className="btns">
          <KeyButton onClick={speak} title="🔊">
            <span style={{ display: 'inline-flex', width: 16, height: 16 }}>{Icon.speaker}</span>
          </KeyButton>
          <KeyButton onClick={save} title={saved ? '✓' : undefined}>
            <span style={{ display: 'inline-flex', width: 16, height: 16, color: saved ? 'var(--accent)' : undefined }}>
              {Icon.bookmark}
            </span>
          </KeyButton>
        </div>
      </div>

      {!result && (
        <div className="skel-row">
          <div className="skel" style={{ width: '80%' }} />
          <div className="skel" />
          <div className="skel" style={{ width: '60%' }} />
        </div>
      )}

      {result && (
        <>
          {result.en && (
            <div className="senses">
              <div className="row">
                <span className="pos">{result.source === 'vocab' ? '•' : 'en.'}</span>
                <dd>{result.en}</dd>
              </div>
            </div>
          )}
          {result.senses.length > 0 && (
            <dl className="senses">
              {result.senses.map((s, i) => (
                <div className="row" key={i}>
                  <dt className="pos">{s.pos ? `${s.pos}.` : '•'}</dt>
                  <dd>{s.zh}</dd>
                </div>
              ))}
            </dl>
          )}
          {!hasContent && <div className="nosense">No definition found · 暂无释义</div>}
          {result.examples.length > 0 && (
            <section className="examples">
              <h3>Examples</h3>
              {result.examples.slice(0, 2).map(([en, cn], i) => (
                <div className="ex" key={i}>
                  <Highlighted sentence={en} word={result.word} />
                  <div className="cn">{cn}</div>
                </div>
              ))}
            </section>
          )}
          {newsExamples.length > 0 && (
            <section className="examples">
              <h3>Examples from news</h3>
              {newsExamples.map((s, i) => (
                <div className="ex" key={i}>
                  <Highlighted sentence={s} word={result.word} />
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  )
}
