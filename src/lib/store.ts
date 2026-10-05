import { useEffect, useState } from 'react'
import type { Level, QuizResult, SavedWord } from '../types'

const KEY = 'levelread-clone-state-v1'

export interface AppState {
  lang: 'zh' | 'en'
  /** placement test result */
  myLevel: Level | null
  favorites: string[]
  wordbook: SavedWord[]
  /** slug -> ISO date first read */
  readLog: Record<string, string>
  quizResults: QuizResult[]
  /** local read-count bumps per slug */
  readBumps: Record<string, number>
  /** YYYY-MM-DD days on which the user read anything */
  activeDays: Record<string, true>
}

const DEFAULT_STATE: AppState = {
  lang: 'zh',
  myLevel: null,
  favorites: [],
  wordbook: [],
  readLog: {},
  quizResults: [],
  readBumps: {},
  activeDays: {},
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_STATE
    return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_STATE
  }
}

let state: AppState = load()
const listeners = new Set<() => void>()

function emit() {
  localStorage.setItem(KEY, JSON.stringify(state))
  listeners.forEach((l) => l())
}

function patch(p: Partial<AppState>) {
  state = { ...state, ...p }
  emit()
}

export function useApp() {
  const [, force] = useState(0)
  useEffect(() => {
    const l = () => force((n) => n + 1)
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])

  return { state, patch }
}

// ---- granular helpers (operate on the shared store) ----

export function getState(): AppState {
  return state
}

export function setState(next: AppState) {
  state = next
  emit()
}

export function toggleLang() {
  patch({ lang: state.lang === 'zh' ? 'en' : 'zh' })
}

export function setMyLevel(level: Level) {
  patch({ myLevel: level })
}

export function toggleFavorite(slug: string) {
  const favorites = state.favorites.includes(slug)
    ? state.favorites.filter((s) => s !== slug)
    : [...state.favorites, slug]
  patch({ favorites })
}

export function markRead(slug: string) {
  const today = new Date().toISOString().slice(0, 10)
  patch({
    activeDays: { ...state.activeDays, [today]: true },
    readLog: state.readLog[slug]
      ? state.readLog
      : { ...state.readLog, [slug]: new Date().toISOString() },
    readBumps: { ...state.readBumps, [slug]: (state.readBumps[slug] || 0) + 1 },
  })
}

export function addQuizResult(r: QuizResult) {
  patch({ quizResults: [...state.quizResults, r] })
}

export function saveWord(w: Omit<SavedWord, 'addedAt' | 'strength'>) {
  const exists = state.wordbook.find((x) => x.word.toLowerCase() === w.word.toLowerCase())
  if (exists) return false
  patch({
    wordbook: [...state.wordbook, { ...w, addedAt: Date.now(), strength: 0 }],
  })
  return true
}

export function removeWord(word: string) {
  patch({ wordbook: state.wordbook.filter((w) => w.word !== word) })
}

export function reviewWord(word: string, correct: boolean) {
  patch({
    wordbook: state.wordbook.map((w) =>
      w.word === word
        ? {
            ...w,
            strength: correct ? Math.min(5, w.strength + 1) : 0,
            lastReviewedAt: Date.now(),
          }
        : w,
    ),
  })
}

/** consecutive days (ending today or yesterday) with at least one read */
export function computeStreak(): number {
  const days = new Set(Object.keys(state.activeDays))
  const dstr = (d: Date) => d.toISOString().slice(0, 10)
  let streak = 0
  const cur = new Date()
  if (!days.has(dstr(cur))) {
    cur.setDate(cur.getDate() - 1)
    if (!days.has(dstr(cur))) return 0
  }
  while (days.has(dstr(cur))) {
    streak++
    cur.setDate(cur.getDate() - 1)
  }
  return streak
}

export function exportData(): string {
  return JSON.stringify({ app: 'levelread-clone', exportedAt: new Date().toISOString(), state }, null, 2)
}

export function importData(json: string): boolean {
  try {
    const parsed = JSON.parse(json)
    const s = parsed.state ?? parsed
    if (typeof s !== 'object' || s === null) return false
    setState({ ...DEFAULT_STATE, ...s })
    return true
  } catch {
    return false
  }
}

export function resetData() {
  setState({ ...DEFAULT_STATE })
}
