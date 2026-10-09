import { useEffect, useMemo, useRef, useState } from 'react'
import { RATES, speakQueue, stopSpeaking } from '../lib/speech'
import { KeyButton, Icon } from './KeyButton'
import { t } from '../i18n'
import type { Lang } from '../i18n'

interface Props {
  mp3Url: string | null
  paragraphs: string[]
  lang: Lang
}

function fmt(s: number): string {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

/** deterministic pseudo-waveform bars from the audio url */
function useWaveform(url: string | null, n = 64): number[] {
  return useMemo(() => {
    const seedStr = url ?? 'tts'
    let h = 2166136261
    for (let i = 0; i < seedStr.length; i++) {
      h ^= seedStr.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    const bars: number[] = []
    for (let i = 0; i < n; i++) {
      h ^= h << 13
      h ^= h >>> 17
      h ^= h << 5
      const r = ((h >>> 0) % 1000) / 1000
      bars.push(0.25 + r * 0.75)
    }
    return bars
  }, [url, n])
}

/** Audio player: waveform + play + time + speed menu + loop, like the original. */
export default function AudioBar({ mp3Url, paragraphs, lang }: Props) {
  const [rate, setRate] = useState(1)
  const [mode, setMode] = useState<'mp3' | 'tts'>(mp3Url ? 'mp3' : 'tts')
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [dur, setDur] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loop, setLoop] = useState(false)
  const [note, setNote] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)
  const ttsIdx = useRef(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const bars = useWaveform(mp3Url)
  const totalBars = mode === 'mp3' ? bars.length : paragraphs.length
  const progress = mode === 'mp3' ? (dur ? time / dur : 0) : ttsIdx.current / Math.max(1, paragraphs.length)

  useEffect(() => () => stopSpeaking(), [])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuOpen && wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  const applyRate = (r: number) => {
    setRate(r)
    if (audioRef.current) audioRef.current.playbackRate = r
    if (mode === 'tts' && playing) {
      stopSpeaking()
      startTts(ttsIdx.current)
    }
  }

  const startTts = (fromIdx: number) => {
    if (!paragraphs.length) return
    ttsIdx.current = fromIdx
    speakQueue(paragraphs.slice(fromIdx), {
      rate,
      onParagraph: (i) => {
        ttsIdx.current = fromIdx + i
      },
      onEnd: () => {
        setPlaying(false)
        if (loop) {
          ttsIdx.current = 0
          startTts(0)
        }
      },
    })
    setPlaying(true)
  }

  const toggle = () => {
    if (playing) {
      if (mode === 'mp3') audioRef.current?.pause()
      else stopSpeaking()
      setPlaying(false)
      return
    }
    if (mode === 'mp3') {
      audioRef.current?.play().catch(() => {
        setMode('tts')
        setNote(t('audio_missing', lang))
        startTts(0)
      })
    } else {
      startTts(ttsIdx.current >= paragraphs.length ? 0 : ttsIdx.current)
    }
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== 'mp3' || !audioRef.current || !dur) return
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    audioRef.current.currentTime = frac * dur
    setTime(audioRef.current.currentTime)
  }

  return (
    <div className="audio-card">
      <div className="audio-row">
        <KeyButton onClick={toggle} title="play/pause">
          <span style={{ display: 'inline-flex', width: 16, height: 16 }}>{playing ? Icon.pause : Icon.play}</span>
        </KeyButton>
        {mode === 'mp3' && mp3Url && (
          <audio
            ref={audioRef}
            src={mp3Url}
            preload="metadata"
            loop={loop}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
            onEnded={() => {
              setPlaying(false)
              if (loop) audioRef.current?.play().catch(() => setPlaying(false))
            }}
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
            onError={() => {
              setMode('tts')
              setNote(t('audio_missing', lang))
              setPlaying(false)
            }}
          />
        )}
        {/* waveform */}
        <div className="audio-wave" onClick={seek} title={mode === 'mp3' ? undefined : t('tts_voice', lang)}>
          {Array.from({ length: totalBars }, (_, i) => {
            const h = mode === 'mp3' ? bars[i % bars.length] : 0.35 + ((i * 37) % 60) / 100
            const on = i / totalBars <= progress
            return (
              <i
                key={i}
                style={{ height: `${Math.round(h * 100)}%`, background: on ? 'var(--accent)' : 'var(--wave-idle, #d6d3d1)' }}
              />
            )
          })}
        </div>
        <div className="audio-time">{mode === 'mp3' ? fmt(time) : `-${paragraphs.length - ttsIdx.current}`}</div>
        <div className="inline-flex" style={{ marginLeft: 2 }} ref={wrapRef}>
          <div className="dd-wrap">
            <KeyButton seg="first" onClick={() => setMenuOpen((o) => !o)}>
              <span className="font-din">{rate.toFixed(1)}x</span>
            </KeyButton>
          </div>
          <KeyButton seg="last" active={loop} onClick={() => setLoop((l) => !l)} title="loop">
            <span style={{ display: 'inline-flex', width: 15, height: 15 }}>{Icon.repeat}</span>
          </KeyButton>
        </div>
        {menuOpen && (
          <div className="dd-menu" style={{ right: 40, left: 'auto' }}>
            <div role="menu">
              {RATES.map((r) => (
                <button
                  key={r}
                  role="menuitemradio"
                  aria-checked={rate === r}
                  className={rate === r ? 'on' : ''}
                  onClick={() => {
                    applyRate(r)
                    setMenuOpen(false)
                  }}
                >
                  {r.toFixed(1)}x
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {note && <div className="audio-status">{note}</div>}
      {mode === 'tts' && !note && <div className="audio-status">{t('tts_voice', lang)}</div>}
    </div>
  )
}
