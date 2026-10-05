import type { Level } from './types'

export type Lang = 'zh' | 'en'

const dict = {
  // nav / header
  brand: { zh: 'Level Read', en: 'Level Read' },
  tagline: { zh: '从你的水平开始，用英语看世界。', en: 'Start at your level. See the world in English.' },
  nav_home: { zh: '首页', en: 'Home' },
  nav_level1: { zh: 'Level 1', en: 'Level 1' },
  nav_level2: { zh: 'Level 2', en: 'Level 2' },
  nav_level3: { zh: 'Level 3', en: 'Level 3' },
  nav_search: { zh: '搜索', en: 'Search' },
  nav_wordbook: { zh: '生词本', en: 'Word Book' },
  nav_test: { zh: '等级测试', en: 'Vocabulary Test' },
  nav_about: { zh: '使用说明', en: 'How to Use' },

  // home
  next_to_read: { zh: '接下来读', en: 'Next to read' },
  more_news: { zh: '更多新闻', en: 'More news' },
  your_level: { zh: '我的级别', en: 'Your level' },
  take_test_hint: { zh: '做一个 1 分钟词汇测试，找到适合你的级别。', en: 'Take a 1-minute vocabulary test to find your level.' },
  take_test: { zh: '开始测试', en: 'Test Your English Level' },
  stats_read: { zh: '已读文章', en: 'Articles read' },
  stats_streak: { zh: '连续打卡', en: 'Streak' },
  stats_words: { zh: '已存生词', en: 'Words saved' },
  stats_quiz: { zh: '测验平均分', en: 'Quiz average' },
  days: { zh: '天', en: 'days' },
  words_to_learn: { zh: '今日词汇', en: 'Words to Learn' },
  learn: { zh: '学习', en: 'Learn' },
  view_all: { zh: '查看全部', en: 'View all' },
  not_set: { zh: '未设置', en: 'Not set' },
  go_level: { zh: '去读 Level {n}', en: 'Read Level {n}' },
  retake_test: { zh: '重新测试', en: 'Retake test' },

  // list / article meta
  reads: { zh: '{n} 次阅读', en: '{n} reads' },
  words_count: { zh: '{n} 词', en: '{n} words' },
  minutes: { zh: '约 {n} 分钟', en: '{n} min read' },
  page_info: { zh: '第 {from}–{to} 篇，共 {total} 篇', en: 'Showing {from}–{to} of {total}' },
  prev: { zh: '上一页', en: 'Previous' },
  next: { zh: '下一页', en: 'Next' },
  empty_list: { zh: '没有文章。', en: 'No articles.' },
  favorites_only: { zh: '只看收藏', en: 'Favorites only' },

  // article page
  audio: { zh: '朗读', en: 'Audio' },
  translate: { zh: '翻译', en: 'Translate' },
  hide_translation: { zh: '隐藏翻译', en: 'Hide translation' },
  pdf: { zh: 'PDF', en: 'PDF' },
  favorite: { zh: '收藏', en: 'Favorite' },
  favorited: { zh: '已收藏', en: 'Saved' },
  share: { zh: '分享', en: 'Share' },
  original: { zh: '原文', en: 'Original' },
  link_copied: { zh: '链接已复制', en: 'Link copied' },
  words_section: { zh: '生词', en: 'Words' },
  quiz_section: { zh: '测验', en: 'Quiz' },
  other_news: { zh: '更多新闻', en: 'Other News' },
  submit_quiz: { zh: '提交', en: 'Submit' },
  try_again: { zh: '再试一次', en: 'Try again' },
  quiz_perfect: { zh: '满分！太棒了 🎉', en: 'Perfect score! 🎉' },
  quiz_good: { zh: '答对 {n} 题，继续加油！', en: '{n} correct. Keep going!' },
  quiz_try: { zh: '答对 {n} 题，再练练会更好 ✍️', en: '{n} correct. Keep practicing! ✍️' },
  answer_all: { zh: '请先回答所有问题。', en: 'Please answer all questions first.' },
  translating: { zh: '翻译中…', en: 'Translating…' },
  translate_fail: { zh: '翻译失败，请检查网络后重试。', en: 'Translation failed. Check your network and retry.' },
  loading_audio: { zh: '音频加载中…', en: 'Loading audio…' },
  audio_missing: { zh: '在线音频不可用，已切换为合成朗读。', en: 'Online audio unavailable, using built-in voice.' },
  tts_voice: { zh: '合成朗读', en: 'Synthetic voice' },

  // word popup
  meaning: { zh: '释义', en: 'Meaning' },
  save_to_book: { zh: '存入生词本', en: 'Save to Word Book' },
  saved: { zh: '已保存 ✓', en: 'Saved ✓' },
  lookup_fail: { zh: '暂无释义', en: 'No definition found' },
  loading_dict: { zh: '查询中…', en: 'Looking up…' },
  in_book: { zh: '已在生词本', en: 'Already in Word Book' },

  // vocabulary test
  test_title: { zh: '词汇等级测试', en: 'Vocabulary Test' },
  test_intro: {
    zh: '勾选你认识的单词（认识 = 能说出大意）。选出你的阅读级别，全程约 1 分钟。',
    en: 'Tick the words you know (know = can explain the gist). It takes about 1 minute.',
  },
  test_submit: { zh: '查看结果', en: 'See my level' },
  test_result_l1: { zh: '推荐从 Level 1 开始：短句和常用词，帮你建立阅读习惯。', en: 'Start with Level 1: short sentences and common words to build the habit.' },
  test_result_l2: { zh: '推荐 Level 2：更自然的表达，更多细节。', en: 'Go with Level 2: more natural expressions with more detail.' },
  test_result_l3: { zh: '推荐 Level 3：真实新闻英语，接近原生难度。', en: 'Level 3 fits you: real news English, close to native material.' },
  test_retake: { zh: '重新测试', en: 'Retake' },
  test_recommended: { zh: '你的推荐级别', en: 'Your recommended level' },

  // word book
  wb_title: { zh: '生词本', en: 'Word Book' },
  wb_empty: { zh: '还没有生词。阅读文章时点击生词即可保存。', en: 'No words yet. Tap any word while reading to save it.' },
  wb_review: { zh: '复习单词', en: 'Review Words' },
  wb_due: { zh: '{n} 个待复习', en: '{n} to review' },
  wb_all_done: { zh: '今日复习已完成 🎉', en: 'All caught up 🎉' },
  wb_show_answer: { zh: '显示答案', en: 'Show answer' },
  wb_know: { zh: '认识', en: 'I know it' },
  wb_dont_know: { zh: '不认识', en: 'Still learning' },
  wb_strength: { zh: '熟练度', en: 'Strength' },
  wb_export: { zh: '导出数据', en: 'Export data' },
  wb_import: { zh: '导入数据', en: 'Import data' },
  wb_import_ok: { zh: '导入成功', en: 'Imported' },
  wb_import_fail: { zh: '导入失败，文件格式不正确。', en: 'Import failed: bad file.' },
  wb_reset: { zh: '清空全部数据', en: 'Reset all data' },
  wb_reset_confirm: { zh: '确定要清空所有本地数据（生词、进度、收藏）吗？', en: 'Delete all local data (words, progress, favorites)?' },
  wb_source: { zh: '来源', en: 'From' },

  // search
  search_title: { zh: '搜索', en: 'Search' },
  search_placeholder: { zh: '搜索标题、摘要或正文…', en: 'Search titles, summaries or content…' },
  search_results: { zh: '{n} 条结果', en: '{n} results' },
  search_empty: { zh: '输入关键词开始搜索。', en: 'Type a keyword to search.' },
  search_none: { zh: '没有匹配的结果。', en: 'No results.' },

  // about
  about_title: { zh: '使用说明', en: 'How to Use' },
  about_l1: { zh: 'Level 1：短句 + 常用词，约 100–120 词，适合入门。', en: 'Level 1: short sentences, common words, ~100–120 words.' },
  about_l2: { zh: 'Level 2：更自然的表达，150–180 词。', en: 'Level 2: more natural language, 150–180 words.' },
  about_l3: { zh: 'Level 3：真实新闻英语，200+ 词。', en: 'Level 3: real news English, 200+ words.' },
  about_body: {
    zh: '先按你的级别阅读；遇到生词点击即可查义、发音并保存。听完朗读、做完测验，再到生词本复习。三档难度讲同一件事，你能清楚看到自己的进步。所有增值功能（查词、全文翻译、变速、PDF）在本站全部免费，数据保存在你自己的浏览器里。',
    en: 'Read at your level first. Tap any word for meaning, audio and saving. Listen, take the quiz, then review in the Word Book. All Plus-style features (lookup, full translation, speed control, PDF) are free here, and all data stays in your own browser.',
  },
  about_data_note: {
    zh: '本站为个人学习用的本地复刻。新闻语料与音频来自公开网络，版权归原发布方所有，请勿商用或再分发。',
    en: 'This is a personal, local study clone. News corpus and audio come from public sources and belong to their original publishers. Do not use commercially or redistribute.',
  },

  // footer
  footer_explore: { zh: '浏览', en: 'Explore' },
  footer_learn: { zh: '学习', en: 'Learn' },
  footer_about: { zh: '关于', en: 'About' },
  footer_note: { zh: '个人学习用途的本地复刻版 · 数据保存在浏览器本地', en: 'Local clone for personal study · data stays in your browser' },

  // original-matched home / sidebar / footer
  nav_plus: { zh: 'Level Read Plus', en: 'Level Read Plus' },
  membership: { zh: '会员', en: 'Membership' },
  membership_desc: { zh: '查词、翻译、PDF 等更多工具，助你更好地阅读和学习。', en: 'Word lookup, translations, PDFs, and more.' },
  get_plus: { zh: '获取 Plus', en: 'Get Plus' },
  plus_free_note: { zh: '本克隆版全部免费', en: 'All features free in this clone' },
  apps: { zh: '应用', en: 'Apps' },
  android_app: { zh: '安卓应用', en: 'Android App' },
  ios_app: { zh: 'iOS 应用', en: 'iOS App' },
  streak: { zh: '持续学习', en: 'Streak' },
  streak_days_label: { zh: '连续学习天数', en: 'Day streak' },
  streak_hint: { zh: '开始连续学习吧！', en: 'Start your streak today!' },
  stats: { zh: '学习统计', en: 'Statistics' },
  stat_days: { zh: '学习天数', en: 'Days studied' },
  stat_words: { zh: '已学单词', en: 'Words learned' },
  stat_articles: { zh: '已读新闻', en: 'Articles read' },
  stat_minutes: { zh: '阅读分钟', en: 'Minutes read' },
  review_words_title: { zh: '复习单词', en: 'Words to Review' },
  review_btn: { zh: '复习', en: 'Review' },
  about_level: { zh: '关于第 {n} 级', en: 'About Level {n}' },
  news_at_level: { zh: '第 {n} 级新闻', en: 'News at Level {n}' },
  test_your_level: { zh: '测试你的英语等级', en: 'Test Your English Level' },
  view_all_news: { zh: '查看全部新闻', en: 'View All News' },
  lv1_sub: { zh: '易读英语新闻', en: 'Easy English News' },
  lv1_desc: { zh: '你刚开始阅读，从这里建立读英文新闻的信心。', en: 'You are just starting to read English news with confidence.' },
  lv2_sub: { zh: '日常英语新闻', en: 'Everyday English News' },
  lv2_desc: { zh: '更自然的表达，更多的内容和细节。', en: 'More natural expressions, with more content and detail.' },
  lv3_sub: { zh: '真实英语新闻', en: 'Real English News' },
  lv3_desc: { zh: '接近原生难度的真实新闻英语。', en: 'Real news English, close to native material.' },
  lv1_b1: { zh: '句子短而简单', en: 'Short and simple sentences' },
  lv1_b2: { zh: '用词非常常见', en: 'Very common words' },
  lv1_b3: { zh: '轻松易读', en: 'Easy to read and relaxed' },
  lv2_b1: { zh: '更自然的表达', en: 'More natural expressions' },
  lv2_b2: { zh: '更多细节内容', en: 'More content and detail' },
  lv2_b3: { zh: '适合进阶阅读', en: 'A comfortable step up' },
  lv3_b1: { zh: '真实新闻语言', en: 'Real news language' },
  lv3_b2: { zh: '丰富的词汇', en: 'Rich vocabulary' },
  lv3_b3: { zh: '接近原生材料', en: 'Close to native material' },
  search_aria: { zh: '搜索', en: 'Search' },
  words_unit: { zh: '{n} 词', en: '{n} words' },

  // misc
  level_n: { zh: 'Level {n}', en: 'Level {n}' },
  close: { zh: '关闭', en: 'Close' },
  today: { zh: '今天', en: 'Today' },
} as const

export type TextKey = keyof typeof dict

export function t(key: TextKey, lang: Lang, vars?: Record<string, string | number>): string {
  let s: string = dict[key][lang]
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
  }
  return s
}

export const LOCALE: Record<Lang, string> = { zh: 'zh-CN', en: 'en-US' }

export function levelLabel(level: Level, lang: Lang): string {
  return t('level_n', lang, { n: level })
}
