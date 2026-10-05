# Level Read Clone

一个 [levelread.com](https://levelread.com/) 的**本地复刻版**：分级英语新闻阅读器。每天把新闻读成三个难度，从你的水平开始学英语 —— 原站收费的 Plus 功能（点词查义、全文翻译、变速、PDF 导出）在这里全部免费，所有数据保存在你自己的浏览器里。

## 运行

```bash
npm install
npm run dev        # 打开终端里显示的地址（默认 http://localhost:5173）
```

生产构建：`npm run build && npm run preview`。

## 功能对照

| 功能 | 原站 | 本复刻 |
| --- | --- | --- |
| 每篇新闻 3 个难度级别，一键切换 | ✅ | ✅ |
| 日期 / 词数 / 阅读时间 / 阅读数 | ✅ | ✅ |
| 点词查义 + 发音 | Plus（¥12/月） | ✅ 免费（内置 19k 词离线词典，秒出；含音标/词性/例句/新闻例句） |
| 全文中文翻译 | Plus | ✅ 免费（逐段对照，MyMemory 免费接口） |
| 朗读 + 变速（0.7x–1.5x） | Plus 变速 | ✅ 免费（站点 MP3；不可用时回退浏览器合成语音，支持逐段高亮） |
| 文章 PDF 导出 | Plus | ✅ 免费（打印样式，Ctrl/Cmd+P） |
| 阅读理解测验 + 记分 | ✅ | ✅ |
| 生词本 + 间隔复习 | ✅ | ✅（熟练度 0–5，认识/不认识自适应） |
| 等级测试（选认识的词→推荐级别） | ✅ | ✅ |
| 搜索（标题/摘要/正文，关键词高亮） | ✅ | ✅ |
| 收藏 / 阅读进度 / 连续打卡统计 | ✅ | ✅ |
| 跨端同步 | Plus | ✅ 本地 JSON 导出/导入（生词本页） |
| 界面语言 | 14 种 | 中/英双语（`src/i18n.ts` 可扩展） |
| 会员/登录/移动 App | ✅ | ➖ 不需要（本地单机） |

## 语料

- `src/data/articles.json`：39 篇近期文章 × 3 级别，含生词、测验（含答案）、音频与封面直链。
- 语料与音频来自 levelread.com 公开页面，**版权归原发布方（Level Read / Reuters 等）所有，仅限个人本地学习，勿商用或再分发**。原站全库约 898 篇，这里只导入了一小部分。

### 扩充语料

**方式一：LLM 生成（推荐，可持续）**

```bash
export LR_API_KEY=你的key        # 默认对接智谱 https://open.bigmodel.cn/api/paas/v4
export LR_MODEL=glm-4.6          # 任意 OpenAI 兼容模型
npm run new-article -- --url https://example.com/some-news
# 也支持 --file news.txt 或 --text "..."
```

脚本会抓取正文 → 生成三级别 + 生词 + 测验的 JSON → 合并进 `articles.json`。

**方式二：从原站导入**

```bash
python3 scripts/scrape-levelread.py --pages 5 --out src/data/articles.json   # 首次批量导入
python3 scripts/sync-levelread.py                                            # 每日增量同步（只抓新文章）
```

同步脚本扫描最新的列表页，跳过语料中已有的文章，只导入新发的 1-2 篇。仓库已配置每天 08:00 的定时任务自动执行（可在 ZCode 的 Automations 页面调整或删除）。注意：levelread 服务条款限制自动化采集，请保持个人本地学习用途、低频小量。

## 前端还原度

- **字体**：原站同款 DIN Next Rounded（300/400/500/700，`public/fonts/`，版权归字体权利人，仅限个人本地学习使用）
- **配色/结构**：#F1EFE4 米色底、2px #E5E5E5 边框白卡片拼贴、#EA580C 橙色强调、实体按键式按钮（按压位移 + 底部投影）、大写灰色区块标签 — 均按原站 DOM 提取
- **逐词交互**：正文与标题每个单词可点，hover 米色高亮；当级生词表词汇以橙色粗体 + 点状下划线标出；点词弹出固定定位查词卡（音标/词性多义/词典例句/**来自新闻库的例句**）
- **查词数据**：内置 19,000+ 词离线词典（音标 + 词性中文释义 + 例句，源自 GitHub kajweb/dict 词库），离线秒查；联网时再以 dictionaryapi.dev / MyMemory 兜底

## 技术栈

Vite + React 18 + TypeScript + React Router，无 UI 库、无后端；状态在 `localStorage`（`src/lib/store.ts`），界面文案在 `src/i18n.ts`。免费外部服务：dictionaryapi.dev（在线查词兜底）、MyMemory（翻译）、腾讯 COS（原站音频/封面直链，均无密钥）。

## 目录

```
src/
  data/articles.json    语料（slug/标题/摘要/日期/封面/3 级别正文+生词+测验+音频）
  lib/store.ts          本地状态：级别、收藏、生词本、阅读记录、打卡、导入导出
  lib/dict.ts           点词查义（本地词表 → dictionaryapi.dev → MyMemory 中文）
  lib/translate.ts      逐段翻译（分块 + 缓存）
  lib/speech.ts         Web Speech 朗读（队列/变速/回退）
  lib/util.ts           分词、词形还原、分页、日期
  components/           WordPopup / AudioBar / QuizBlock / ArticleCard / Pagination / Header
  pages/                Home / NewsList / Article / Search / VocabularyTest / WordBook / About
scripts/
  scrape-levelread.py   原站一次性导入（RSC flight 解析器）
  generate-article.mjs  LLM 生成新文章
```
