import { Link, NavLink } from 'react-router-dom'
import { t, type Lang } from '../i18n'

export default function Header({ lang }: { lang: Lang }) {
  const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '')
  return (
    <header className="site-header">
      <nav className="bar" aria-label="Global navigation">
        <Link to="/" className="logo">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Level Read" />
          <span className="logo-text">Level Read</span>
        </Link>
        <div className="nav">
          <NavLink to="/" end className={navClass}>
            {t('nav_home', lang)}
          </NavLink>
          <NavLink to="/news/level-1" className={navClass}>
            {lang === 'zh' ? '第 1 级' : 'Level 1'}
          </NavLink>
          <NavLink to="/news/level-2" className={navClass}>
            {lang === 'zh' ? '第 2 级' : 'Level 2'}
          </NavLink>
          <NavLink to="/news/level-3" className={navClass}>
            {lang === 'zh' ? '第 3 级' : 'Level 3'}
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'plus active' : 'plus')}>
            {t('nav_plus', lang)}
          </NavLink>
        </div>
        <div className="header-right">
          <Link to="/search" aria-label={t('search_aria', lang)} className="search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Link>
          <Link to="/wordbook" className="avatar" title={t('nav_wordbook', lang)} />
        </div>
      </nav>
    </header>
  )
}

export function Footer({ lang, onToggleLang }: { lang: Lang; onToggleLang: () => void }) {
  return (
    <footer className="site-footer">
      <div className="inner">
        <div className="cols">
          <div>
            <Link to="/" className="brand">
              <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Level Read" />
              <span>Level Read</span>
            </Link>
            <p className="tagline">{t('tagline', lang)}</p>
          </div>
          <div className="links">
            <div>
              <h2>{t('footer_explore', lang)}</h2>
              <ul>
                <li><Link to="/news/level-1">{lang === 'zh' ? '第 1 级' : 'Level 1'}</Link></li>
                <li><Link to="/news/level-2">{lang === 'zh' ? '第 2 级' : 'Level 2'}</Link></li>
                <li><Link to="/news/level-3">{lang === 'zh' ? '第 3 级' : 'Level 3'}</Link></li>
                <li><Link to="/search">{t('nav_search', lang)}</Link></li>
              </ul>
            </div>
            <div>
              <h2>{t('footer_learn', lang)}</h2>
              <ul>
                <li><Link to="/vocabulary-test">{t('nav_test', lang)}</Link></li>
                <li><Link to="/about">{t('nav_about', lang)}</Link></li>
                <li><Link to="/wordbook">{t('nav_wordbook', lang)}</Link></li>
                <li><Link to="/about" className="plus">{t('nav_plus', lang)}</Link></li>
              </ul>
            </div>
            <div>
              <h2>Level Read</h2>
              <ul>
                <li><Link to="/about">{lang === 'zh' ? '关于' : 'About'}</Link></li>
                <li><Link to="/about">{lang === 'zh' ? '帮助与联系' : 'Help & Contact'}</Link></li>
              </ul>
            </div>
            <div>
              <h2>{lang === 'zh' ? '法律' : 'Legal'}</h2>
              <ul>
                <li><Link to="/about">{lang === 'zh' ? '使用条款' : 'Terms of Use'}</Link></li>
                <li><Link to="/about">{lang === 'zh' ? '隐私政策' : 'Privacy Policy'}</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bottom">
          <span>
            © {new Date().getFullYear()} Level Read Clone · {t('footer_note', lang)}
          </span>
          <div className="lang-select">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
            </svg>
            <span className="cur">{lang === 'zh' ? '简体中文' : 'English'}</span>
            <select
              aria-label="Language"
              value={lang}
              onChange={(e) => {
                if ((e.target.value === 'zh') !== (lang === 'zh')) onToggleLang()
              }}
            >
              <option value="zh">简体中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  )
}
