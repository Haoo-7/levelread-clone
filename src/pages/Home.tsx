import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import articles from '../data/articles.json'
import type { Article, Level } from '../types'
import { computeStreak, getState, useApp } from '../lib/store'
import { t } from '../i18n'
import type { Lang } from '../i18n'
import NewsCard from '../components/NewsCard'
import { KeyButton, Icon } from '../components/KeyButton'
import { lookupLocal } from '../lib/dict'

const ALL = articles as unknown as Article[]
const byDateDesc = [...ALL].sort((a, b) => b.date - a.date)

const WEEKDAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export default function Home({ lang }: { lang: Lang }) {
  const { state } = useApp()
  const myLevel = (state.myLevel ?? 1) as Level

  const nextRead = useMemo(
    () => byDateDesc.find((a) => !state.readLog[a.slug]) ?? byDateDesc[0],
    [state.readLog],
  )

  const streak = computeStreak()
  const wordsSaved = getState().wordbook.length
  const readCount = Object.keys(state.readLog).length
  // rough reading-minutes estimate, as the original tracks time spent
  const minutes = readCount * 2
  const daysStudied = new Set(Object.keys(state.activeDays)).size

  const dueWords = useMemo(
    () =>
      getState()
        .wordbook.filter((w) => w.strength < 3)
        .sort((a, b) => (a.lastReviewedAt ?? 0) - (b.lastReviewedAt ?? 0))
        .slice(0, 4),
    [state.wordbook],
  )

  // last 5 days for the streak circles
  const days = useMemo(() => {
    const out: { label: string; on: boolean }[] = []
    for (let i = 4; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      out.push({
        label: lang === 'zh' ? '周' + '日一二三四五六'[d.getDay()] : WEEKDAY_KEYS[d.getDay()],
        on: !!state.activeDays[key],
      })
    }
    return out
  }, [state.activeDays, lang])

  const moreNews = useMemo(
    () => byDateDesc.filter((a) => a.slug !== nextRead?.slug).slice(0, 4),
    [nextRead],
  )

  const wtlWords = useMemo(() => {
    // words to learn: from the next article at the user's level
    const a = nextRead
    if (!a) return []
    return a.levels[String(myLevel) as '1' | '2' | '3'].vocabulary.slice(0, 4).map((v) => {
      const d = lookupLocal(v.word, new Map())
      return { word: v.word, senses: d.senses.slice(0, 3), slug: a.slug }
    })
  }, [nextRead, myLevel])

  return (
    <div className="page-shell">
      <div className="main-col">
        <h3 className="sec-label">{t('next_to_read', lang)}</h3>
        {nextRead && (
          <div style={{ borderRadius: 16, background: 'var(--card)', padding: 20, border: '2px solid var(--line)' }}>
            <NewsCard article={nextRead} lang={lang} titleLevel={myLevel} meta="reads" />
          </div>
        )}

        <div style={{ marginTop: 40 }}>
          <h3 className="sec-label">{t('more_news', lang)}</h3>
          <div className="grid-collage">
            {moreNews.map((a) => (
              <NewsCard key={a.slug} article={a} lang={lang} titleLevel={myLevel} meta="reads" />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Link to={`/news/level-${myLevel}`}>
              <KeyButton size="lg">
                <span>{t('view_all_news', lang)}</span>
              </KeyButton>
            </Link>
          </div>
        </div>
      </div>

      <div className="sidebar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {/* streak — matches the original dashboard card */}
          <section>
            <h3 className="sec-label">{t('streak', lang)}</h3>
            <div className="streak-card2">
              <div className="streak-inner">
              <div className="streak-flame" aria-hidden>
                <svg viewBox="0 0 63 64" fill="none">
                  <path d="M8 40.5686V16.215C8 11.088 11.8919 11.0879 14.4865 12.3697L19.6757 14.9332C21.8378 11.9424 26.6811 5.44817 28.7568 3.39735C31.3514 0.833809 33.9459 2.11558 36.5405 4.67911C39.1351 7.24265 46.9189 17.4968 50.8108 22.6239C54.7027 27.7509 56 32.878 56 40.5686C56 48.2592 46.9189 61.0769 31.3514 61.0769C15.7838 61.0769 8 46.9775 8 40.5686Z" fill="#FF9600" />
                  <path d="M23.5675 36.7233C25.6432 33.6471 28.7567 29.46 30.054 27.7509C30.4864 26.8964 31.8703 25.7001 33.946 27.7509C36.5406 30.3145 39.1352 35.4416 40.4325 36.7233C41.7298 38.0051 43.0271 43.1322 40.4325 46.9775C37.8379 50.8228 33.946 52.1045 31.3514 52.1045C28.7568 52.1045 24.8648 49.541 23.5675 46.9775C22.2702 44.4139 20.9729 40.5686 23.5675 36.7233Z" fill="#FFC800" />
                </svg>
              </div>
              <div className="streak-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
                  <div className="streak-num">{streak}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="streak-label">{t('streak_days_label', lang)}</div>
                    <div className="streak-hint">{streak > 0 ? (lang === 'zh' ? '学习状态正佳！' : 'You are on a roll!') : t('streak_hint', lang)}</div>
                  </div>
                </div>
                <div className="streak-days">
                  {days.map((d, i) => (
                    <div className="sday" key={i}>
                      <span className={d.on ? 'on' : ''}>{d.label}</span>
                      <i className={d.on ? 'on' : ''}>
                        {d.on && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </i>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </div>
          </section>

          {/* statistics */}
          <section>
            <h3 className="sec-label">{t('stats', lang)}</h3>
            <div className="side-card stats-card">
              <div>
                <div className="v">{Icon.calendar} {daysStudied}</div>
                <div className="k">{t('stat_days', lang)}</div>
              </div>
              <div>
                <div className="v">{Icon.pen} {wordsSaved}</div>
                <div className="k">{t('stat_words', lang)}</div>
              </div>
              <div>
                <div className="v icon-blue">{Icon.bookOpen} {readCount}</div>
                <div className="k">{t('stat_articles', lang)}</div>
              </div>
              <div>
                <div className="v icon-orange">{Icon.clock} {minutes}</div>
                <div className="k">{t('stat_minutes', lang)}</div>
              </div>
            </div>
          </section>

          {/* words to review */}
          {dueWords.length > 0 && (
            <section>
              <h3 className="sec-label">{t('review_words_title', lang)}</h3>
              <div className="side-card" style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'var(--line)' }}>
                {dueWords.map((w) => (
                  <div className="review-row" style={{ background: 'var(--card)' }} key={w.word}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="w">{w.word}</div>
                      <ul className="senses" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {(w.zh || w.definition || '')
                          .split('；')
                          .slice(0, 3)
                          .map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                      </ul>
                    </div>
                    <div className="btns">
                      <KeyButton
                        onClick={() => {
                          import('../lib/speech').then(({ speakOnce }) => speakOnce(w.word))
                        }}
                        title="🔊"
                      >
                        <span style={{ display: 'inline-flex', width: 16, height: 16 }}>{Icon.speaker}</span>
                      </KeyButton>
                      <Link to="/wordbook">
                        <KeyButton>
                          <span>{t('review_btn', lang)}</span>
                        </KeyButton>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* words to learn */}
          {wtlWords.length > 0 && (
            <section>
              <h3 className="sec-label">{t('words_to_learn', lang)}</h3>
              <div className="side-card" style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'var(--line)' }}>
                {wtlWords.map((v) => (
                  <div className="wtl-row" style={{ background: 'var(--card)' }} key={v.word}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="w">{v.word}</div>
                      <ul className="senses" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {v.senses.map((s, i) => (
                          <li key={i}>
                            {s.pos ? `${s.pos}. ` : ''} {s.zh}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="btns">
                      <Link to={`/news/level-${myLevel}/${v.slug}#words`}>
                        <KeyButton>
                          <span>{t('learn', lang)}</span>
                        </KeyButton>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
