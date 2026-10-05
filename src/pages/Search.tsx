import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import articles from '../data/articles.json'
import type { Article, Level } from '../types'
import { paginate, formatDate } from '../lib/util'
import { t } from '../i18n'
import type { Lang } from '../i18n'
import Pagination from '../components/Pagination'

const ALL = articles as unknown as Article[]

function snippet(a: Article, q: string): string | null {
  for (const key of ['1', '2', '3'] as const) {
    const paras = a.levels[key].content.split(/\n\n+/)
    for (const p of paras) {
      const idx = p.toLowerCase().indexOf(q.toLowerCase())
      if (idx !== -1) {
        const start = Math.max(0, idx - 60)
        const frag = p.slice(start, idx + q.length + 90).trim()
        return (start > 0 ? '…' : '') + frag + '…'
      }
    }
  }
  return null
}

function Highlight({ text, q }: { text: string; q: string }) {
  const i = text.toLowerCase().indexOf(q.toLowerCase())
  if (i === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  )
}

export default function Search({ lang }: { lang: Lang }) {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const query = q.trim()

  const results = useMemo(() => {
    if (!query) return []
    return ALL.filter((a) => {
      const hay = [a.title, a.summary, a.levels['1'].content, a.levels['2'].content, a.levels['3'].content]
        .join('\n')
        .toLowerCase()
      return hay.includes(query.toLowerCase())
    }).sort((a, b) => b.date - a.date)
  }, [query])

  const { slice, total } = paginate(results, page)

  return (
    <div className="container-wide">
      <div className="hero" style={{ paddingBottom: 0 }}>
        <h1 style={{ fontSize: 26 }}>{t('search_title', lang)}</h1>
      </div>
      <div className="section" style={{ marginTop: 18 }}>
        <input
          className="search-box"
          value={q}
          autoFocus
          placeholder={t('search_placeholder', lang)}
          onChange={(e) => {
            setQ(e.target.value)
            setPage(1)
          }}
        />
      </div>
      {query && (
        <div className="skeleton" style={{ marginBottom: 14 }}>
          {t('search_results', lang, { n: results.length })}
        </div>
      )}
      {!query && <div className="empty">{t('search_empty', lang)}</div>}
      {query && results.length === 0 && <div className="empty">{t('search_none', lang)}</div>}
      {slice.map((a) => {
        const s = snippet(a, query)
        return (
          <article className="article-card" key={a.slug}>
            <span className="date">{formatDate(a.date, lang)}</span>
            <h3>
              <Link to={`/news/level-1/${a.slug}`}>{s ? <Highlight text={a.title} q={query} /> : a.title}</Link>
            </h3>
            {s && (
              <p className="summary">
                <Highlight text={s} q={query} />
              </p>
            )}
            <div className="card-meta">
              <span>{t('reads', lang, { n: a.reads })}</span>
              <div className="level-links">
                {([1, 2, 3] as Level[]).map((lv) => (
                  <Link key={lv} className={`ll-${lv}`} to={`/news/level-${lv}/${a.slug}`}>
                    {t('level_n', lang, { n: lv })}
                  </Link>
                ))}
              </div>
            </div>
          </article>
        )
      })}
      {results.length > 0 && (
        <Pagination
          page={Math.min(page, total)}
          total={total}
          from={(Math.min(page, total) - 1) * 8 + 1}
          to={Math.min(Math.min(page, total) * 8, results.length)}
          count={results.length}
          lang={lang}
          onChange={(p) => setPage(p)}
        />
      )}
    </div>
  )
}
