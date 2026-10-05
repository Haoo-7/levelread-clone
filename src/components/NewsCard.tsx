import { Link } from 'react-router-dom'
import type { Article, Level } from '../types'
import { formatDate, wordCount } from '../lib/util'
import { t } from '../i18n'
import type { Lang } from '../i18n'
import { KeyButton } from './KeyButton'

/**
 * News card exactly matching the original: cover with overlay link,
 * date, 24px semibold title, 2-line summary, three Level key-buttons + meta.
 * On the home page the meta shows read counts; on level pages it shows words.
 */
export default function NewsCard({
  article,
  lang,
  titleLevel = 1,
  meta = 'reads',
}: {
  article: Article
  lang: Lang
  titleLevel?: Level
  meta?: 'reads' | 'words'
}) {
  return (
    <article className="news-card">
      <div className="cover-wrap">
        {article.cover && (
          <img
            className="cover"
            src={article.cover}
            alt={article.title}
            loading="lazy"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        )}
        <Link className="cover-link" to={`/news/level-${titleLevel}/${article.slug}`} aria-label={article.title} />
      </div>
      <div className="body">
        <div className="date">{formatDate(article.date, lang)}</div>
        <h2>
          <Link to={`/news/level-${titleLevel}/${article.slug}`}>{article.title}</Link>
        </h2>
        <p className="summary">{article.summary}</p>
      </div>
      <div className="foot">
        <div className="levels">
          {([1, 2, 3] as Level[]).map((n) => (
            <Link key={n} to={`/news/level-${n}/${article.slug}`}>
              <KeyButton size="lg">
                <span>{t('level_n', lang, { n })}</span>
              </KeyButton>
            </Link>
          ))}
        </div>
        <div className="reads">
          {meta === 'reads'
            ? t('reads', lang, { n: article.reads })
            : t('words_count', lang, { n: wordCount(article.levels[String(titleLevel) as '1' | '2' | '3'].content) })}
        </div>
      </div>
    </article>
  )
}
