import { useMemo } from 'react'

export interface WordClickInfo {
  word: string
  anchor: DOMRect
}

/**
 * Renders text with every word tappable (matching the original site):
 * hover shows a cream background, vocabulary words are bold orange with a
 * dotted underline.
 */
export function RichText({
  text,
  vocab,
  onWordClick,
  activeWord,
  className,
}: {
  text: string
  /** lowercase vocabulary words to highlight (de-inflected match) */
  vocab: Set<string>
  onWordClick?: (info: WordClickInfo) => void
  activeWord?: string | null
  className?: string
}) {
  const tokens = useMemo(() => text.split(/(\p{L}[\p{L}'’-]*)/u).filter((p) => p !== ''), [text])
  return (
    <span className={className}>
      {tokens.map((tok, i) => {
        if (!/^[\p{L}][\p{L}'’-]*$/u.test(tok)) {
          return <span key={i}>{tok}</span>
        }
        return (
          <WordSpan
            key={i}
            word={tok}
            vocab={vocab}
            onWordClick={onWordClick}
            active={!!activeWord && activeWord.toLowerCase() === tok.toLowerCase()}
          />
        )
      })}
    </span>
  )
}

function isVocabWord(word: string, vocab: Set<string>): boolean {
  if (vocab.has(word.toLowerCase())) return true
  const w = word.toLowerCase()
  // quick de-inflection checks against the vocab set
  const tries: string[] = []
  if (w.endsWith("'s")) tries.push(w.slice(0, -2))
  if (w.endsWith('ing') && w.length > 3) tries.push(w.slice(0, -3), w.slice(0, -3) + 'e', w.slice(0, -4))
  if (w.endsWith('ed') && w.length > 3) tries.push(w.slice(0, -2), w.slice(0, -1), w.slice(0, -3) + 'y')
  if (w.endsWith('ies')) tries.push(w.slice(0, -3) + 'y')
  if (w.endsWith('es')) tries.push(w.slice(0, -2))
  if (w.endsWith('s') && !w.endsWith('ss')) tries.push(w.slice(0, -1))
  return tries.some((t) => vocab.has(t))
}

export function WordSpan({
  word,
  vocab,
  onWordClick,
  active,
}: {
  word: string
  vocab: Set<string>
  onWordClick?: (info: WordClickInfo) => void
  active?: boolean
}) {
  const hl = isVocabWord(word, vocab)
  return (
    <span className="wwrap">
      <span
        className={`wtxt${hl ? ' vocab' : ''}${active ? ' active' : ''}`}
        onClick={(e) => onWordClick?.({ word, anchor: e.currentTarget.getBoundingClientRect() })}
      >
        {word}
      </span>
    </span>
  )
}
