import { t } from '../i18n'
import type { Lang } from '../i18n'
import { Link } from 'react-router-dom'
import { KeyButton } from '../components/KeyButton'
import { THEME_MODES, useThemeMode, type ThemeMode } from '../lib/theme'

const MODE_LABEL: Record<ThemeMode, { zh: string; en: string }> = {
  light: { zh: '浅色', en: 'Light' },
  dark: { zh: '深色', en: 'Dark' },
  auto: { zh: '跟随系统', en: 'System' },
}

function ThemeSettings({ lang }: { lang: Lang }) {
  const [mode, setMode] = useThemeMode()
  return (
    <div className="card section" style={{ padding: '6px 20px' }}>
      <div className="settings-row">
        <span className="k">{lang === 'zh' ? '主题外观' : 'Appearance'}</span>
        <span className="seg">
          {THEME_MODES.map((m, i) => (
            <KeyButton
              key={m}
              seg={i === 0 ? 'first' : i === THEME_MODES.length - 1 ? 'last' : 'mid'}
              active={mode === m}
              onClick={() => setMode(m)}
              title={MODE_LABEL[m][lang === 'zh' ? 'zh' : 'en']}
            >
              {MODE_LABEL[m][lang === 'zh' ? 'zh' : 'en']}
            </KeyButton>
          ))}
        </span>
      </div>
    </div>
  )
}

export default function About({ lang }: { lang: Lang }) {
  return (
    <div className="container">
      <div className="hero" style={{ paddingBottom: 0 }}>
        <h1 style={{ fontSize: 26 }}>{t('about_title', lang)}</h1>
      </div>

      <ThemeSettings lang={lang} />

      <div className="card card-pad section">
        <h2 className="section-title">
          {lang === 'zh' ? '1. 找到适合你的级别' : '1. Find the right level'}
        </h2>
        <p style={{ color: 'var(--text-2)' }}>{t('about_body', lang)}</p>
        <ul style={{ color: 'var(--text-2)', lineHeight: 2, paddingLeft: 20, margin: '14px 0 0' }}>
          <li>{t('about_l1', lang)}</li>
          <li>{t('about_l2', lang)}</li>
          <li>{t('about_l3', lang)}</li>
        </ul>
        <div className="article-actions">
          <Link to="/vocabulary-test"><KeyButton size="lg">
            {t('take_test', lang)}
          </KeyButton></Link>
        </div>
      </div>

      <div className="card card-pad section">
        <h2 className="section-title">{lang === 'zh' ? '2. 功能一览' : '2. Features'}</h2>
        <ul style={{ color: 'var(--text-2)', lineHeight: 2, paddingLeft: 20, margin: 0 }}>
          {(lang === 'zh'
            ? [
                '每篇新闻三个难度级别，一键切换',
                '点击任意单词查释义、听发音、存入生词本',
                '全文中文翻译（MyMemory 免费接口）',
                '文章朗读：站点音频 + 变速，或浏览器合成语音',
                '阅读理解测验并记录成绩',
                '收藏文章、生词本复习（间隔重复）、搜索全部内容',
                '阅读统计与连续打卡，数据保存在本地浏览器',
                'PDF 打印导出（Ctrl/Cmd+P）',
              ]
            : [
                'Every article in three levels with one-tap switching',
                'Tap any word for meaning, audio and saving to your Word Book',
                'Full Chinese translation (free MyMemory API)',
                'Read-aloud: site MP3 with speed control, or built-in speech',
                'Comprehension quizzes with saved scores',
                'Favorites, word review (spaced repetition), full-text search',
                'Reading stats & streak, all data stored locally',
                'PDF export via print (Ctrl/Cmd+P)',
              ]
          ).map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>

      <div className="card card-pad section">
        <h2 className="section-title">{lang === 'zh' ? '3. 关于数据' : '3. About the data'}</h2>
        <p style={{ color: 'var(--text-2)' }}>{t('about_data_note', lang)}</p>
        <p className="skeleton">
          {lang === 'zh'
            ? '扩充语料：运行 npm run new-article（需要配置 LLM API），或再次运行抓取脚本。'
            : 'To add articles: run npm run new-article (configure an LLM API key), or re-run the scraper.'}
        </p>
      </div>
    </div>
  )
}
