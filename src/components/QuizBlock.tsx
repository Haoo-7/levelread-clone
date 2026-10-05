import { useState } from 'react'
import type { QuizItem } from '../types'
import { t } from '../i18n'
import type { Lang } from '../i18n'
import { KeyButton } from './KeyButton'

interface Props {
  quiz: QuizItem[]
  lang: Lang
  onScore?: (score: number, total: number) => void
}

export default function QuizBlock({ quiz, lang, onScore }: Props) {
  const [picks, setPicks] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)

  if (!quiz.length) return null
  const score = quiz.reduce((acc, q, i) => acc + (picks[i] === q.answer ? 1 : 0), 0)
  const allPicked = Object.keys(picks).length >= quiz.length

  const submit = () => {
    if (!allPicked) return
    setSubmitted(true)
    onScore?.(score, quiz.length)
  }

  const reset = () => {
    setPicks({})
    setSubmitted(false)
  }

  const feedback = () => {
    if (score === quiz.length) return t('quiz_perfect', lang)
    const key = score / quiz.length >= 0.5 ? 'quiz_good' : 'quiz_try'
    return t(key as 'quiz_good' | 'quiz_try', lang, { n: score })
  }

  return (
    <div className="quiz-block">
      <h3 className="sec-label">{t('quiz_section', lang)}</h3>
      <ol className="collage" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {quiz.map((q, qi) => (
          <li key={qi} className="quiz-item">
            <div className="quiz-num">{qi + 1}</div>
            <div style={{ flex: 1 }}>
              <h3 className="quiz-q">{q.question}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {q.options.map((opt, oi) => {
                  const picked = picks[qi] === oi
                  const isCorrect = submitted && oi === q.answer
                  const isWrongPick = submitted && picked && oi !== q.answer
                  return (
                    <label
                      key={oi}
                      className={`quiz-opt${isCorrect ? ' correct' : ''}${isWrongPick ? ' wrong' : ''}`}
                      style={submitted ? { cursor: 'default' } : undefined}
                    >
                      <input
                        type="radio"
                        name={`quiz-${qi}`}
                        checked={picked}
                        disabled={submitted}
                        onChange={() => setPicks((p) => ({ ...p, [qi]: oi }))}
                      />
                      <span>{opt}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </li>
        ))}
        {!submitted && (
          <li className="quiz-item" style={{ flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
              <KeyButton size="lg" onClick={submit}>
                <span>{t('submit_quiz', lang)}</span>
              </KeyButton>
              {!allPicked && <span className="skeleton">{t('answer_all', lang)}</span>}
            </div>
          </li>
        )}
        {submitted && (
          <li className="quiz-item" style={{ flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
              <span className="quiz-feedback">{feedback()}</span>
              <KeyButton size="lg" onClick={reset}>
                <span>{t('try_again', lang)}</span>
              </KeyButton>
            </div>
          </li>
        )}
      </ol>
    </div>
  )
}
