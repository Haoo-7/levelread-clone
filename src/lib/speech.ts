/** Web Speech API reader — TTS fallback + word pronunciation */

let currentUtterances: SpeechSynthesisUtterance[] = []

export function speakOnce(text: string, rate = 1): void {
  stopSpeaking()
  if (!('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = rate
  const v = pickVoice()
  if (v) u.voice = v
  window.speechSynthesis.speak(u)
}

/** speak an array of paragraphs in order; reports progress */
export function speakQueue(
  paragraphs: string[],
  opts: { rate?: number; onParagraph?: (i: number) => void; onEnd?: () => void; onStart?: () => void } = {},
): void {
  stopSpeaking()
  if (!('speechSynthesis' in window)) return
  const rate = opts.rate ?? 1
  let cancelled = false
  const speakAt = (i: number) => {
    if (cancelled || i >= paragraphs.length) {
      if (!cancelled) opts.onEnd?.()
      return
    }
    const u = new SpeechSynthesisUtterance(paragraphs[i])
    u.lang = 'en-US'
    u.rate = rate
    const v = pickVoice()
    if (v) u.voice = v
    u.onstart = () => opts.onParagraph?.(i)
    u.onend = () => speakAt(i + 1)
    u.onerror = () => speakAt(i + 1)
    currentUtterances.push(u)
    window.speechSynthesis.speak(u)
  }
  speakAt(0)
  opts.onStart?.()
  // remember how to cancel
  currentQueueCancel = () => {
    cancelled = true
    window.speechSynthesis.cancel()
  }
}

let currentQueueCancel: (() => void) | null = null

export function stopSpeaking(): void {
  currentQueueCancel?.()
  currentQueueCancel = null
  currentUtterances = []
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}

export function isSpeaking(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking
}

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  const prefer = ['en-US', 'en-GB', 'en-AU']
  for (const lang of prefer) {
    const v = voices.find((x) => x.lang === lang && /natural|google|samantha|daniel|aria/i.test(x.name))
    if (v) return v
  }
  for (const lang of prefer) {
    const v = voices.find((x) => x.lang.startsWith(lang.slice(0, 2)))
    if (v) return v
  }
  return null
}

export const RATES = [0.7, 0.8, 1.0, 1.2, 1.5]
