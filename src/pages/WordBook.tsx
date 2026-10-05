import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { KeyButton, Icon } from '../components/KeyButton'
import { exportData, importData, removeWord, resetData, reviewWord, useApp } from '../lib/store'
import { t } from '../i18n'
import type { Lang } from '../i18n'
import type { SavedWord } from '../types'

export default function WordBook({ lang }: { lang: Lang }) {
  const { state } = useApp()
  const [tab, setTab] = useState<'list' | 'review'>('list')
  const [toast, setToast] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [reviewIdx, setReviewIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const words = state.wordbook
  const due = useMemo(
    () => words.filter((w) => w.strength < 3).sort((a, b) => (a.lastReviewedAt ?? 0) - (b.lastReviewedAt ?? 0)),
    [words],
  )

  const showToast = (m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(''), 2000)
  }

  const doExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `levelread-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const doImport = async (file: File) => {
    const text = await file.text()
    showToast(importData(text) ? t('wb_import_ok', lang) : t('wb_import_fail', lang))
  }

  const current: SavedWord | undefined = due[reviewIdx]

  const answer = (correct: boolean) => {
    if (!current) return
    reviewWord(current.word, correct)
    setRevealed(false)
    setReviewIdx((i) => i + 1)
  }

  const restartReview = () => {
    setReviewIdx(0)
    setRevealed(false)
  }

  return (
    <div className="container">
      <div className="hero" style={{ paddingBottom: 0 }}>
        <h1>{t('wb_title', lang)}</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <div className="seg">
          <KeyButton seg="first" active={tab === 'list'} onClick={() => setTab('list')}>
            <span>
              {t('wb_title', lang)} · {words.length}
            </span>
          </KeyButton>
          <KeyButton
            seg="last"
            active={tab === 'review'}
            onClick={() => {
              setTab('review')
              restartReview()
            }}
          >
            <span>
              {t('wb_review', lang)} · {due.length}
            </span>
          </KeyButton>
        </div>
      </div>

      {tab === 'list' && (
        <section className="section">
          {words.length === 0 && <div className="empty">{t('wb_empty', lang)}</div>}
          {words.length > 0 && (
            <div className="collage">
              {words
                .slice()
                .sort((a, b) => b.addedAt - a.addedAt)
                .map((w) => (
                  <div className="wb-row" key={w.word}>
                    <span className="w">{w.word}</span>
                    <span className="d">
                      {w.zh && <div>{w.zh}</div>}
                      {w.definition && <div style={{ fontSize: 13, color: 'var(--muted)' }}>{w.definition}</div>}
                    </span>
                    <span className="meta">
                      <span className="strength-dots" title={t('wb_strength', lang)}>
                        {[0, 1, 2, 3, 4].map((i) => (
                          <i key={i} className={i < w.strength ? 'on' : ''} />
                        ))}
                      </span>
                      {w.sourceSlug && (
                        <Link to={`/news/level-1/${w.sourceSlug}`} title={t('wb_source', lang)} style={{ display: 'inline-flex', width: 16, height: 16, color: 'var(--muted)' }}>
                          {Icon.fileText}
                        </Link>
                      )}
                      <KeyButton onClick={() => removeWord(w.word)} title="✕">
                        <span style={{ display: 'inline-flex', width: 12, height: 12 }}>✕</span>
                      </KeyButton>
                    </span>
                  </div>
                ))}
            </div>
          )}

          <div className="article-actions no-print" style={{ marginTop: 18 }}>
            <KeyButton onClick={doExport}>
              <span style={{ display: 'inline-flex', width: 16, height: 16 }}>{Icon.download}</span>
              <span>{t('wb_export', lang)}</span>
            </KeyButton>
            <KeyButton onClick={() => fileRef.current?.click()}>
              <span style={{ display: 'inline-flex', width: 16, height: 16, transform: 'scaleY(-1)' }}>{Icon.download}</span>
              <span>{t('wb_import', lang)}</span>
            </KeyButton>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])}
            />
            <KeyButton
              onClick={() => {
                if (window.confirm(t('wb_reset_confirm', lang))) {
                  resetData()
                  showToast(lang === 'zh' ? '已清空' : 'Cleared')
                }
              }}
            >
              <span style={{ color: '#b91c1c' }}>{t('wb_reset', lang)}</span>
            </KeyButton>
          </div>
        </section>
      )}

      {tab === 'review' && (
        <section className="section">
          {due.length === 0 ? (
            <div className="card review-card">
              <div style={{ display: "flex", justifyContent: "center", color: "var(--accent)" }}><span style={{ display: "inline-flex", width: 44, height: 44 }}>{Icon.flame}</span></div>
              <p style={{ color: 'var(--text-2)' }}>{t('wb_all_done', lang)}</p>
            </div>
          ) : current ? (
            <div className="card review-card">
              <div className="skeleton">
                {reviewIdx + 1} / {due.length}
              </div>
              <div className="word">{current.word}</div>
              {revealed ? (
                <div className="meaning">
                  {current.zh && <div>{current.zh}</div>}
                  {current.definition && (
                    <div style={{ fontSize: 14.5, color: 'var(--muted)', marginTop: 4 }}>{current.definition}</div>
                  )}
                </div>
              ) : (
                <div className="meaning" />
              )}
              {!revealed ? (
                <KeyButton size="lg" onClick={() => setRevealed(true)}>
                  <span>{t('wb_show_answer', lang)}</span>
                </KeyButton>
              ) : (
                <div className="article-actions" style={{ justifyContent: 'center' }}>
                  <KeyButton onClick={() => answer(false)}>
                    <span>{t('wb_dont_know', lang)}</span>
                  </KeyButton>
                  <KeyButton onClick={() => answer(true)}>
                    <span>{t('wb_know', lang)}</span>
                  </KeyButton>
                </div>
              )}
            </div>
          ) : (
            <div className="card review-card">
              <div style={{ display: "flex", justifyContent: "center", color: "var(--accent)" }}><span style={{ display: "inline-flex", width: 44, height: 44 }}>{Icon.flame}</span></div>
              <p style={{ color: 'var(--text-2)' }}>{t('wb_all_done', lang)}</p>
              <KeyButton onClick={restartReview}>
                <span>↺</span>
              </KeyButton>
            </div>
          )}
        </section>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
