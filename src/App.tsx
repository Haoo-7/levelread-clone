import { useEffect } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import Header, { Footer } from './components/Header'
import Home from './pages/Home'
import NewsList from './pages/NewsList'
import ArticlePage from './pages/Article'
import Search from './pages/Search'
import VocabularyTest from './pages/VocabularyTest'
import WordBook from './pages/WordBook'
import About from './pages/About'
import { toggleLang, useApp } from './lib/store'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const { state } = useApp()
  const lang = state.lang

  return (
    <HashRouter>
      <ScrollToTop />
      <Header lang={lang} />
      <main style={{ minHeight: '70vh' }}>
        <Routes>
          <Route path="/" element={<Home lang={lang} />} />
          <Route path="/news/level-1" element={<NewsList lang={lang} level={1} />} />
          <Route path="/news/level-2" element={<NewsList lang={lang} level={2} />} />
          <Route path="/news/level-3" element={<NewsList lang={lang} level={3} />} />
          <Route path="/news/level-1/:slug" element={<ArticlePage lang={lang} level={1} />} />
          <Route path="/news/level-2/:slug" element={<ArticlePage lang={lang} level={2} />} />
          <Route path="/news/level-3/:slug" element={<ArticlePage lang={lang} level={3} />} />
          <Route path="/search" element={<Search lang={lang} />} />
          <Route path="/vocabulary-test" element={<VocabularyTest lang={lang} />} />
          <Route path="/wordbook" element={<WordBook lang={lang} />} />
          <Route path="/about" element={<About lang={lang} />} />
          <Route path="*" element={<Home lang={lang} />} />
        </Routes>
      </main>
      <Footer lang={lang} onToggleLang={toggleLang} />
    </HashRouter>
  )
}
