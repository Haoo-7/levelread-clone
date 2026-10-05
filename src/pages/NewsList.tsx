import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import articles from '../data/articles.json'
import type { Article, Level } from '../types'
import { PAGESIZE } from '../lib/util'
import { t } from '../i18n'
import type { Lang } from '../i18n'
import NewsCard from '../components/NewsCard'
import { KeyButton } from '../components/KeyButton'
import { lookupLocal } from '../lib/dict'

const ALL = articles as unknown as Article[]

const LEVEL_META: Record<Level, { subKey: 'lv1_sub' | 'lv2_sub' | 'lv3_sub'; descKey: 'lv1_desc' | 'lv2_desc' | 'lv3_desc'; bullets: ('lv1_b1' | 'lv1_b2' | 'lv1_b3' | 'lv2_b1' | 'lv2_b2' | 'lv2_b3' | 'lv3_b1' | 'lv3_b2' | 'lv3_b3')[] }> = {
  1: { subKey: 'lv1_sub', descKey: 'lv1_desc', bullets: ['lv1_b1', 'lv1_b2', 'lv1_b3'] },
  2: { subKey: 'lv2_sub', descKey: 'lv2_desc', bullets: ['lv2_b1', 'lv2_b2', 'lv2_b3'] },
  3: { subKey: 'lv3_sub', descKey: 'lv3_desc', bullets: ['lv3_b1', 'lv3_b2', 'lv3_b3'] },
}

export default function NewsList({ lang, level }: { lang: Lang; level: Level }) {
  const lv = level
  const [page, setPage] = useState(1)

  const items = useMemo(
    () => ALL.filter((a) => a.levels[String(lv) as '1' | '2' | '3']).sort((a, b) => b.date - a.date),
    [lv],
  )
  const total = Math.max(1, Math.ceil(items.length / PAGESIZE))
  const p = Math.min(Math.max(1, page), total)
  const slice = items.slice((p - 1) * PAGESIZE, p * PAGESIZE)
  const from = items.length ? (p - 1) * PAGESIZE + 1 : 0
  const to = Math.min(p * PAGESIZE, items.length)

  const meta = LEVEL_META[lv]

  // words to learn: latest articles' vocabulary at this level
  const wtl = useMemo(() => {
    const out: { word: string; senses: { pos: string; zh: string }[]; slug: string }[] = []
    for (const a of slice) {
      for (const v of a.levels[String(lv) as '1' | '2' | '3'].vocabulary.slice(0, 1)) {
        if (out.length >= 4) break
        if (out.some((o) => o.word === v.word)) continue
        const d = lookupLocal(v.word, new Map())
        out.push({ word: v.word, senses: d.senses.slice(0, 3), slug: a.slug })
      }
    }
    return out
  }, [slice, lv])

  const goto = (n: number) => {
    setPage(n)
    window.scrollTo(0, 0)
  }

  return (
    <div className="page-shell">
      {/* left sidebar: about this level + words to learn */}
      <div className="sidebar" style={{ order: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          <section>
            <h3 className="sec-label">{t('about_level', lang, { n: lv })}</h3>
            <div className="side-card about-card">
              <div className="head">
                <div className="lv">{t('level_n', lang, { n: lv })}</div>
                <div className="sub">{t(meta.subKey, lang)}</div>
                <p className="desc" style={{ marginTop: 24, marginBottom: 0 }}>{t(meta.descKey, lang)}</p>
                <ul style={{ marginTop: 24 }}>
                  {meta.bullets.map((b) => (
                    <li key={b}>
                      <i />
                      <span>{t(b, lang)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="foot">
                <Link to="/vocabulary-test">
                  <KeyButton>
                    <span>{t('test_your_level', lang)}</span>
                  </KeyButton>
                </Link>
              </div>
            </div>
          </section>

          {wtl.length > 0 && (
            <section>
              <h3 className="sec-label">{t('words_to_learn', lang)}</h3>
              <div className="side-card" style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'var(--line)' }}>
                {wtl.map((v) => (
                  <div className="wtl-row" style={{ background: 'var(--card)' }} key={v.word}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="w">{v.word}</div>
                      <ul className="senses" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {v.senses.map((s, i) => (
                          <li key={i}>
                            {s.pos ? `${s.pos}.` : '•'} {s.zh}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="btns">
                      <Link to={`/news/level-${lv}/${v.slug}#words`}>
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

      {/* right: news grid */}
      <div className="main-col">
        <h3 className="sec-label">{t('news_at_level', lang, { n: lv })}</h3>
        <div className="grid-collage">
          {slice.map((a) => (
            <NewsCard key={a.slug} article={a} lang={lang} titleLevel={lv} meta="words" />
          ))}
        </div>
        <div className="pagebar">
          <p className="info" style={{ margin: 0 }}>
            {t('page_info', lang, { from, to, total: items.length })}
          </p>
          <nav aria-label="Pagination" style={{ display: 'flex', gap: 4 }}>
            <KeyButton seg="first" onClick={() => goto(p - 1)}>
              <span>← {t('prev', lang)}</span>
            </KeyButton>
            {Array.from({ length: total }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === total || Math.abs(n - p) <= 1)
              .map((n, i, arr) => (
                <span key={n} style={{ display: 'inline-flex', gap: 4 }}>
                  {i > 0 && arr[i - 1] !== n - 1 && (
                    <span className="pg-num" style={{ border: 'none', background: 'transparent' }}>
                      …
                    </span>
                  )}
                  <button className={`pg-num${n === p ? ' on' : ''}`} onClick={() => goto(n)}>
                    {n}
                  </button>
                </span>
              ))}
            <KeyButton seg="last" onClick={() => goto(p + 1)}>
              <span>{t('next', lang)} →</span>
            </KeyButton>
          </nav>
        </div>
      </div>
    </div>
  )
}
