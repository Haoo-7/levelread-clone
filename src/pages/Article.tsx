import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import articles from '../data/articles.json'
import type { Article, Level } from '../types'
import { formatDate, levelContent, prevNext, readingMinutes, wordCount } from '../lib/util'
import { t } from '../i18n'
import type { Lang } from '../i18n'
import { addQuizResult, getState, markRead, saveWord, toggleFavorite, useApp } from '../lib/store'
import { translateAll } from '../lib/translate'
import { stopSpeaking } from '../lib/speech'
import { lookupLocal } from '../lib/dict'
import WordPopup from '../components/WordPopup'
import AudioBar from '../components/AudioBar'
import QuizBlock from '../components/QuizBlock'
import { KeyButton, Icon } from '../components/KeyButton'
import { RichText } from '../components/Words'

const ALL = articles as unknown as Article[]

export default function ArticlePage({ lang, level }: { lang: Lang; level: Level }) {
  const { slug } = useParams<{ slug: string }>()
  const lv = level
  const article = ALL.find((a) => a.slug === slug)
  const navigate = useNavigate()
  const { state } = useApp()
  const [popup, setPopup] = useState<{ word: string; anchor: DOMRect } | null>(null)
  const [activeWord, setActiveWord] = useState<string | null>(null)
  const [showZh, setShowZh] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [zhMenu, setZhMenu] = useState(false)
  const [translations, setTranslations] = useState<Record<number, string>>({})
  const [toast, setToast] = useState('')
  const [coverOk, setCoverOk] = useState(true)
  const toastTimer = useRef<number>()
  const zhWrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    setPopup(null)
    setActiveWord(null)
    setShowZh(false)
    setZhMenu(false)
    setTranslations({})
    setCoverOk(true)
    stopSpeaking()
    if (article) markRead(article.slug)
  }, [slug, lv])

  const paragraphs = useMemo(
    () => (article ? levelContent(article, lv).split(/\n\n+/).filter(Boolean) : []),
    [article, lv],
  )

  const localVocab = useMemo(() => {
    const m = new Map<string, string>()
    if (article) {
      for (const key of ['1', '2', '3'] as const) {
        for (const v of article.levels[key].vocabulary) {
          m.set(v.word.toLowerCase(), v.definition)
        }
      }
    }
    return m
  }, [article])

  const vocabSet = useMemo(
    () => new Set((article?.levels[String(lv) as '1' | '2' | '3'].vocabulary ?? []).map((v) => v.word.toLowerCase())),
    [article, lv],
  )

  if (!article) {
    return (
      <div className="container">
        <div className="empty">
          <p>404</p>
          <Link to="/" className="key-btn" style={{ marginTop: 12 }}>
            <span className="lbl">{t('nav_home', lang)}</span>
          </Link>
        </div>
      </div>
    )
  }

  const levelData = article.levels[String(lv) as '1' | '2' | '3']
  const { prev, next } = prevNext(ALL, article)
  const isFav = state.favorites.includes(article.slug)

  const showToast = (msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2200)
  }

  const openWord = (info: { word: string; anchor: DOMRect }) => {
    setPopup(info)
    setActiveWord(info.word)
  }

  const doTranslate = async () => {
    if (showZh) {
      setShowZh(false)
      return
    }
    setShowZh(true)
    if (Object.keys(translations).length) return
    setTranslating(true)
    const results: Record<number, string> = {}
    await translateAll(paragraphs, (i, zh) => {
      results[i] = zh
      setTranslations((prevT) => ({ ...prevT, [i]: zh }))
    })
    setTranslating(false)
    if (Object.values(results).every((v) => !v)) showToast(t('translate_fail', lang))
  }

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, url })
      } else {
        await navigator.clipboard.writeText(url)
        showToast(t('link_copied', lang))
      }
    } catch {
      /* cancelled */
    }
  }

  const openMp3 = () => {
    const url = levelData.audio
    if (url) window.open(url, '_blank')
    else document.getElementById('audio-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="article-shell">
      <div className="article-cols">
      <div className="main-col">
      <div className="article-card2">
        {/* level segmented tabs */}
        <div className="article-head-row">
          <div className="seg">
            {([1, 2, 3] as Level[]).map((n, i) => (
              <KeyButton
                key={n}
                seg={i === 0 ? 'first' : i === 2 ? 'last' : 'mid'}
                active={n === lv}
                onClick={() => navigate(`/news/level-${n}/${article.slug}`)}
              >
                <span>{t('level_n', lang, { n })}</span>
              </KeyButton>
            ))}
          </div>
        </div>

        {/* title — every word tappable */}
        <h1 className="article-title">
          <RichText text={article.title} vocab={vocabSet} onWordClick={openWord} activeWord={activeWord} />
        </h1>

        {/* meta */}
        <div className="article-meta">
          <span>{formatDate(article.date, lang)}</span>
          <span>{t('words_count', lang, { n: wordCount(levelData.content) })}</span>
          <span>{t('minutes', lang, { n: readingMinutes(levelData.content) })}</span>
          <span>{t('reads', lang, { n: article.reads + (getState().readBumps[article.slug] || 0) })}</span>
        </div>

        {/* body */}
        <div className="article-body">
          {paragraphs.map((p, i) => (
            <div key={i}>
              <p className="para" style={{ margin: 0, background: undefined }}>
                <RichText text={p} vocab={vocabSet} onWordClick={openWord} activeWord={activeWord} />
              </p>
              {showZh && (translations[i] || translating) && (
                <p className="zh-para">{translations[i] || '…'}</p>
              )}
            </div>
          ))}
        </div>

        {/* actions */}
        <div className="article-actions no-print" style={{ justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', gap: 8, flexGrow: 1 }}>
          <div className="dd-wrap" ref={zhWrap}>
            <KeyButton
              active={showZh}
              onClick={() => {
                if (showZh) setShowZh(false)
                else setZhMenu(true)
              }}
            >
              {Icon.sparkle}
              <span>{showZh && !translating ? t('hide_translation', lang) : t('translate', lang)}</span>
            </KeyButton>
            {zhMenu && (
              <div className="dd-menu">
                <div role="menu">
                  <button
                    onClick={() => {
                      doTranslate()
                      setZhMenu(false)
                    }}
                  >
                    简体中文
                  </button>
                </div>
              </div>
            )}
          </div>
          <KeyButton onClick={() => window.print()}>
            {Icon.download}
            <span>{t('pdf', lang)}</span>
          </KeyButton>
          <KeyButton onClick={openMp3}>
            {Icon.download}
            <span>MP3</span>
          </KeyButton>
          </div>
          <div className="actions-gap">
            <KeyButton active={isFav} onClick={() => toggleFavorite(article.slug)}>
              {Icon.bookmark}
              <span>{isFav ? t('favorited', lang) : t('favorite', lang)}</span>
            </KeyButton>
            <KeyButton onClick={share}>
              {Icon.share}
              <span>{t('share', lang)}</span>
            </KeyButton>
            {article.originalUrl && (
              <a href={article.originalUrl} target="_blank" rel="noreferrer" title={t('original', lang)}>
                <KeyButton as="a">
                  {Icon.link}
                  <span>{t('original', lang)}</span>
                </KeyButton>
              </a>
            )}
          </div>
        </div>

        {/* cover at the bottom of the card, like the original */}
        {article.cover && coverOk && (
          <img className="article-cover" src={article.cover} alt={article.title} onError={() => setCoverOk(false)} />
        )}
      </div>

      {/* prev / next */}
      <div className="pager2 no-print">
        {prev ? (
          <Link to={`/news/level-${lv}/${prev.slug}`}>
            <span className="chev">{Icon.chevL}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="dir" style={{ margin: 0 }}>
                ← {t('prev', lang)}
              </p>
              <p className="t" style={{ margin: 0 }}>
                {prev.title}
              </p>
            </div>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/news/level-${lv}/${next.slug}`} className="next-a">
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="dir" style={{ margin: 0 }}>
                {t('next', lang)} →
              </p>
              <p className="t" style={{ margin: 0 }}>
                {next.title}
              </p>
            </div>
            <span className="chev">{Icon.chevR}</span>
          </Link>
        )}
      </div>

      </div>

      {/* right sidebar: audio / words / quiz */}
      <div className="sidebar-col">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

      <section id="audio-section">
        <h3 className="sec-label">{t('audio', lang)}</h3>
        <AudioBar mp3Url={levelData.audio} paragraphs={paragraphs} lang={lang} />
      </section>


      {levelData.vocabulary.length > 0 && (
        <section id="words">
          <h3 className="sec-label">{t('words_section', lang)}</h3>
          <ul className="collage" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {levelData.vocabulary.map((v) => {
              const d = lookupLocal(v.word, localVocab)
              const zh = d.senses.map((s) => (s.pos ? `${s.pos}. ${s.zh}` : s.zh)).join('；')
              return (
                <li className="collage-row" key={v.word}>
                  <div className="word-row">
                    <div className="top">
                      <div>
                        <div className="w" onClick={(e) => openWord({ word: v.word, anchor: e.currentTarget.getBoundingClientRect() })} style={{ cursor: 'pointer' }}>
                          {v.word}
                        </div>
                        {d.usphone && <div className="phon">/{d.usphone}/</div>}
                      </div>
                      <div className="btns">
                        <KeyButton onClick={() => speakWord(v.word)} title="🔊">
                          <span style={{ display: 'inline-flex', width: 16, height: 16 }}>{Icon.speaker}</span>
                        </KeyButton>
                        <KeyButton
                          onClick={() => {
                            if (!inBook(v.word)) {
                              saveWord({ word: v.word, definition: v.definition, zh, sourceSlug: article.slug })
                              showToast(t('saved', lang))
                            } else {
                              showToast(t('in_book', lang))
                            }
                          }}
                          title={t('save_to_book', lang)}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              width: 16,
                              height: 16,
                              color: inBook(v.word)
                                ? 'var(--accent)'
                                : undefined,
                            }}
                          >
                            {Icon.bookmark}
                          </span>
                        </KeyButton>
                      </div>
                    </div>
                    <dl className="def" style={{ display: 'block' }}>
                      {v.definition && (
                        <div className="row">
                          <dt className="pos" style={{ marginRight: 8, flexShrink: 0 }}>en.</dt>
                          <dd style={{ margin: 0 }}>{v.definition}</dd>
                        </div>
                      )}
                      {d.senses.map((sn, si) => (
                        <div className="row" key={si} style={{ display: 'flex' }}>
                          <dt className="pos" style={{ marginRight: 8, flexShrink: 0 }}>{sn.pos ? `${sn.pos}.` : '•'}</dt>
                          <dd style={{ margin: 0 }}>{sn.zh}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </li>
              )
            })}
          </ul>
          <div style={{ marginTop: 2 }}>
            <div className="wb-btn-row" style={{ border: '2px solid var(--line)', borderRadius: 16 }}>
              <Link to="/wordbook" style={{ display: 'block' }}>
                <KeyButton size="lg">
                  <span style={{ width: '100%', justifyContent: 'center', display: 'inline-flex' }}>
                    {t('nav_wordbook', lang)}
                  </span>
                </KeyButton>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* quiz */}
      <section>
        <QuizBlock
          quiz={levelData.quiz}
          lang={lang}
          onScore={(score, total) =>
            addQuizResult({ slug: article.slug, level: lv, score, total, at: Date.now() })
          }
        />
      </section>

        </div>
      </div>
      </div>

      {popup && (
        <WordPopup
          word={popup.word}
          anchor={popup.anchor}
          localVocab={localVocab}
          corpus={ALL}
          sourceSlug={article.slug}
          onClose={() => {
            setPopup(null)
            setActiveWord(null)
          }}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function inBook(word: string): boolean {
  return getState().wordbook.some((x) => x.word.toLowerCase() === word.toLowerCase())
}

function speakWord(text: string) {
  import('../lib/speech').then(({ speakOnce }) => speakOnce(text))
}
