import { Link } from 'react-router-dom'
import type { Article, Level } from '../types'
import { formatDate } from '../lib/util'
import { t } from '../i18n'
import type { Lang } from '../i18n'

interface Props {
  article: Article
  lang: Lang
  /** level used for the title link (defaults to 1) */
  titleLevel?: Level
}

export default function ArticleCard({ article, lang, titleLevel = 1 }: Props) {
  return (
    <article className="article-card">
      <span className="date">{formatDate(article.date, lang)}</span>
      <h3>
        <Link to={`/news/level-${titleLevel}/${article.slug}`}>{article.title}</Link>
      </h3>
      <p className="summary">{article.summary}</p>
      <div className="card-meta">
        <span>{t('reads', lang, { n: article.reads })}</span>
        <div className="level-links">
          {([1, 2, 3] as Level[]).map((lv) => (
            <Link key={lv} className={`ll-${lv}`} to={`/news/level-${lv}/${article.slug}`}>
              {t('level_n', lang, { n: lv })}
            </Link>
          ))}
        </div>
      </div>
    </article>
  )
}
