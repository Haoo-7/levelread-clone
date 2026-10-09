import { NavLink, useLocation } from 'react-router-dom'
import type { Lang } from '../i18n'

const BookIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 7v14" />
    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
  </svg>
)

const AzIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="700" fill="currentColor" stroke="none">
      Az
    </text>
  </svg>
)

const SmileyIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
)

export default function MobileTabBar({ lang }: { lang: Lang }) {
  const { pathname } = useLocation()
  const isNews = pathname === '/' || pathname.startsWith('/news') || pathname === '/search' || pathname.startsWith('/vocabulary')
  const cls = (active: boolean) => 'tab' + (active ? ' active' : '')
  return (
    <nav className="mobile-tabbar" aria-label="Mobile navigation">
      <NavLink to="/" className={cls(isNews)}>
        {BookIcon}
        <span>{lang === 'zh' ? '新闻' : 'News'}</span>
      </NavLink>
      <NavLink to="/wordbook" className={cls(pathname.startsWith('/wordbook'))}>
        {AzIcon}
        <span>{lang === 'zh' ? '单词' : 'Words'}</span>
      </NavLink>
      <NavLink to="/about" className={cls(pathname.startsWith('/about'))}>
        {SmileyIcon}
        <span>{lang === 'zh' ? '我的' : 'Me'}</span>
      </NavLink>
    </nav>
  )
}
