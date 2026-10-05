export interface WordItem {
  word: string
  definition: string
}

export interface QuizItem {
  question: string
  options: string[]
  /** 0-based index of the correct option */
  answer: number
}

export interface LevelData {
  content: string
  vocabulary: WordItem[]
  quiz: QuizItem[]
  audio: string | null
}

export interface Article {
  slug: string
  title: string
  summary: string
  /** epoch milliseconds */
  date: number
  cover: string | null
  originalUrl: string | null
  reads: number
  levels: Record<'1' | '2' | '3', LevelData>
}

export type Level = 1 | 2 | 3

export interface SavedWord {
  word: string
  definition: string
  /** zh meaning captured at save time (may be empty) */
  zh?: string
  sourceSlug?: string
  addedAt: number
  /** review strength 0–5 */
  strength: number
  lastReviewedAt?: number
}

export interface QuizResult {
  slug: string
  level: Level
  score: number
  total: number
  at: number
}
