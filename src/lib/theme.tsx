import { useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'auto'

const KEY = 'levelread-theme'

export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'auto']

export function getThemeMode(): ThemeMode {
  const v = localStorage.getItem(KEY)
  return v === 'light' || v === 'dark' || v === 'auto' ? v : 'auto'
}

export function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'auto') return systemPrefersDark() ? 'dark' : 'light'
  return mode
}

export function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = resolveTheme(mode)
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', resolveTheme(mode) === 'dark' ? '#14161a' : '#f1efe4')
}

const listeners = new Set<() => void>()

export function setThemeMode(mode: ThemeMode) {
  localStorage.setItem(KEY, mode)
  applyTheme(mode)
  listeners.forEach((l) => l())
}

export function cycleThemeMode(): ThemeMode {
  const order: ThemeMode[] = ['light', 'dark', 'auto']
  const next = order[(order.indexOf(getThemeMode()) + 1) % order.length]
  setThemeMode(next)
  return next
}

/** Current theme mode, re-renders on change. */
export function useThemeMode(): [ThemeMode, (mode: ThemeMode) => void] {
  const [mode, setMode] = useState(getThemeMode)
  useEffect(() => {
    const l = () => setMode(getThemeMode())
    listeners.add(l)
    setMode(getThemeMode())
    return () => {
      listeners.delete(l)
    }
  }, [])
  return [mode, setThemeMode]
}

export const ThemeIcon = {
  light: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.06 17.94l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ),
  dark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  ),
  auto: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  ),
}

/** Applies the stored theme and follows system changes in 'auto' mode. Returns a cleanup fn. */
export function initTheme(): () => void {
  applyTheme(getThemeMode())
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const onChange = () => {
    if (getThemeMode() === 'auto') applyTheme('auto')
  }
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}
