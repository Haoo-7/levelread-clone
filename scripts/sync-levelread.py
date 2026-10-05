#!/usr/bin/env python3
"""Daily incremental sync: pull NEW articles from levelread.com into src/data/articles.json.

Walks the newest listing pages, skips slugs already present in the corpus, and
imports only unseen articles (each article page fetched exactly once). Designed
to run once a day via a scheduled task — the site publishes ~2 articles on
weekdays and 1 on weekends, so one listing page is usually enough; --pages
controls how many pages to scan for gaps.

Usage:
  python3 scripts/sync-levelread.py [--pages 2] [--out src/data/articles.json]

Content belongs to Level Read / original publishers; for personal local study use only.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent


def load_scraper():
    spec = importlib.util.spec_from_file_location('scrape_levelread', HERE / 'scrape-levelread.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--pages', type=int, default=2, help='listing pages to scan (8 articles/page)')
    ap.add_argument('--out', default='src/data/articles.json')
    args = ap.parse_args()

    scr = load_scraper()
    out_path = Path(args.out)
    corpus = json.loads(out_path.read_text(encoding='utf-8')) if out_path.exists() else []
    known = {a['slug'] for a in corpus}
    print(f'corpus has {len(corpus)} articles', file=sys.stderr)

    # enumerate newest slugs
    slugs: list[str] = []
    for p in range(1, args.pages + 1):
        url = f'{scr.BASE}/news/level-1' if p == 1 else f'{scr.BASE}/news/level-1/page/{p}'
        html = scr.fetch(url)
        found = [s for s in dict.fromkeys(re.findall(r'href="/news/level-1/([a-z0-9-]+)"', html)) if s != 'page']
        slugs.extend([s for s in found if s not in slugs])
        if p < args.pages and all(s in known for s in found):
            break  # whole page already known, no need to walk further
        time.sleep(0.4)

    fresh = [s for s in slugs if s not in known]
    print(f'{len(fresh)} new article(s): {fresh}', file=sys.stderr)
    if not fresh:
        print('SYNC_OK added=0')
        return 0

    added = 0
    for i, slug in enumerate(fresh):
        try:
            rec = scr.article_record(slug)
            if rec:
                corpus.append(rec)
                added += 1
                print(f'[{i + 1}/{len(fresh)}] ok: {rec["title"][:60]}', file=sys.stderr)
            else:
                print(f'[{i + 1}/{len(fresh)}] skip (no data): {slug}', file=sys.stderr)
        except Exception as e:  # noqa: BLE001
            print(f'[{i + 1}/{len(fresh)}] FAIL: {slug}: {e}', file=sys.stderr)
        time.sleep(0.4)

    corpus.sort(key=lambda r: r.get('date') or 0, reverse=True)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(corpus, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'SYNC_OK added={added} total={len(corpus)}')
    return 0


import re  # noqa: E402  (used above via re.findall)

if __name__ == '__main__':
    sys.exit(main())
