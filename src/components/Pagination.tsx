import { t } from '../i18n'
import type { Lang } from '../i18n'

interface Props {
  page: number
  total: number
  from: number
  to: number
  count: number
  lang: Lang
  onChange: (p: number) => void
}

export default function Pagination({ page, total, from, to, count, lang, onChange }: Props) {
  if (total <= 1 && count === 0) return null
  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← {t('prev', lang)}
      </button>
      <span>
        {t('page_info', lang, { from, to, total: count })}
        {total > 1 ? ` · ${page}/${total}` : ''}
      </span>
      <button disabled={page >= total} onClick={() => onChange(page + 1)}>
        {t('next', lang)} →
      </button>
    </div>
  )
}
