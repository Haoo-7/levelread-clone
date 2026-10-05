import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { setMyLevel, useApp } from '../lib/store'
import { KeyButton } from '../components/KeyButton'
import { t } from '../i18n'
import type { Lang } from '../i18n'
import type { Level } from '../types'

/** placement bands: everyday → mid-frequency → academic/news register */
const BANDS: { level: 1 | 2 | 3; words: string[] }[] = [
  { level: 1, words: ['airport', 'borrow', 'weather', 'decide', 'guest', 'repair'] },
  { level: 2, words: ['complain', 'estimate', 'rural', 'fund', 'promote', 'reluctant'] },
  { level: 3, words: ['jurisdiction', 'mitigate', 'predominant', 'ambassador', 'unilateral', 'infrastructure'] },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function VocabularyTest({ lang }: { lang: Lang }) {
  const { state } = useApp()
  const [known, setKnown] = useState<Set<string>>(new Set())
  const [done, setDone] = useState(false)
  const shuffled = useMemo(() => BANDS.map((b) => ({ ...b, words: shuffle(b.words) })), [done])

  const toggle = (w: string) => {
    const next = new Set(known)
    if (next.has(w)) next.delete(w)
    else next.add(w)
    setKnown(next)
  }

  const computeResult = (): Level => {
    const count = (lv: 1 | 2 | 3) =>
      BANDS.find((b) => b.level === lv)!.words.filter((w) => known.has(w)).length
    const c1 = count(1)
    const c2 = count(2)
    const c3 = count(3)
    if (c1 < 3) return 1
    if (c1 < 5) return (c2 >= 4 ? 2 : 1) as Level
    return (1 + (c2 >= 3 ? 1 : 0) + (c3 >= 3 ? 1 : 0)) as Level
  }

  const result = useMemo<Level | null>(() => (done ? computeResult() : null), [done, known])

  const submit = () => {
    const lv = computeResult()
    setMyLevel(lv)
    setDone(true)
    window.scrollTo(0, 0)
  }

  const retake = () => {
    setKnown(new Set())
    setDone(false)
    window.scrollTo(0, 0)
  }

  const RESULT_TEXT: Record<Level, string> = {
    1: t('test_result_l1', lang),
    2: t('test_result_l2', lang),
    3: t('test_result_l3', lang),
  }

  return (
    <div className="container">
      <div className="hero" style={{ paddingBottom: 0 }}>
        <h1>{t('test_title', lang)}</h1>
        <p style={{ maxWidth: 480, margin: '8px auto 0' }}>{t('test_intro', lang)}</p>
      </div>

      {!done ? (
        <div className="section">
          <div className="test-word-grid">
            {shuffled.flatMap((b) =>
              b.words.map((w) => (
                <button key={w} className={`test-word${known.has(w) ? ' on' : ''}`} onClick={() => toggle(w)}>
                  {w}
                </button>
              )),
            )}
          </div>
          <div className="article-actions" style={{ justifyContent: 'center' }}>
            <KeyButton size="lg" onClick={submit}>
              <span>
                {t('test_submit', lang)} ({known.size})
              </span>
            </KeyButton>
          </div>
        </div>
      ) : (
        result && (
          <div className="card test-result section">
            <div className="skeleton">{t('test_recommended', lang)}</div>
            <div className="big">Level {result}</div>
            <p style={{ color: 'var(--text-2)', maxWidth: 420, margin: '0 auto 20px' }}>{RESULT_TEXT[result]}</p>
            <div className="article-actions" style={{ justifyContent: 'center' }}>
              <Link to={`/news/level-${result}`}>
                <KeyButton size="lg">
                  <span>{t('go_level', lang, { n: result })}</span>
                </KeyButton>
              </Link>
              <KeyButton onClick={retake}>
                <span>{t('test_retake', lang)}</span>
              </KeyButton>
            </div>
            {state.myLevel && (
              <p className="skeleton" style={{ marginTop: 14 }}>
                {lang === 'zh' ? '已保存为你的默认级别' : 'Saved as your default level'}
              </p>
            )}
          </div>
        )
      )}
    </div>
  )
}
