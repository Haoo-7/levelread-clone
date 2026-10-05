#!/usr/bin/env python3
from __future__ import annotations
"""One-time importer: pull recent articles from levelread.com into src/data/articles.json.

Parses the Next.js RSC flight payload embedded in each article page, which contains
the full structured record (title, summary, 3 levels of content, vocabulary, quiz
with answers, audio URLs, cover, date, read count, original source link).

Usage:
  python3 scripts/scrape-levelread.py --pages 5 --out src/data/articles.json

Content belongs to Level Read / original publishers. Imported data is for
personal, local study use only.
"""
import argparse
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

DECODER = json.JSONDecoder()
ROW_RE = re.compile(r'([0-9a-f]+):')
BASE = 'https://levelread.com'


def decode_html_payload(html: str) -> str:
    chunks = re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)</script>', html, flags=re.S)
    return ''.join(json.loads('"' + c + '"') for c in chunks)


def parse_rows(payload: str) -> dict:
    """Flight rows: id:JSON | id:T<hexlen>,text — rows are not always newline-separated."""
    rows = {}
    pos, n = 0, len(payload)
    while pos < n:
        m = ROW_RE.match(payload, pos)
        if not m:
            nl = payload.find('\n', pos)
            if nl == -1:
                break
            pos = nl + 1
            continue
        rid, start = m.group(1), m.end()
        if start < n and payload[start] == 'T':
            cm = re.match(r'T([0-9a-f]+),', payload[start:])
            if cm:
                # length is in UTF-16 code units; astral chars make Python's char
                # count smaller, so the nominal end can overshoot the real row
                # boundary — walk back a few chars until a row id matches again.
                length = int(cm.group(1), 16)
                text_start = start + cm.end()
                tpos = text_start + length
                for back in range(9):
                    cand = tpos - back
                    if cand > text_start and ROW_RE.match(payload, cand):
                        tpos = cand
                        break
                rows[rid] = payload[text_start:tpos]
                pos = tpos
                continue
        try:
            val, end = DECODER.raw_decode(payload, start)
            rows[rid] = val
            pos = end
        except Exception:
            nl = payload.find('\n', start)
            pos = nl + 1 if nl != -1 else n
    return rows


def resolve(v, rows, depth=0):
    if depth > 30:
        return v
    if isinstance(v, str):
        m = re.fullmatch(r'\$([0-9a-f]+)', v)
        if m and m.group(1) in rows:
            return resolve(rows[m.group(1)], rows, depth + 1)
        return v
    if isinstance(v, list):
        return [resolve(x, rows, depth + 1) for x in v]
    if isinstance(v, dict):
        return {k: resolve(x, rows, depth + 1) for k, x in v.items()}
    return v


def find_dicts(v, pred, out):
    if isinstance(v, dict):
        if pred(v):
            out.append(v)
        for x in v.values():
            find_dicts(x, pred, out)
    elif isinstance(v, list):
        for x in v:
            find_dicts(x, pred, out)


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (personal study importer)'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode('utf-8', 'replace')


def list_slugs(pages: int) -> list[str]:
    slugs, seen = [], set()
    for p in range(1, pages + 1):
        url = BASE + '/news/level-1' if p == 1 else f'{BASE}/news/level-1/page/{p}'
        html = fetch(url)
        found = re.findall(r'href="/news/level-1/([a-z0-9-]+)"', html)
        new = [s for s in dict.fromkeys(found) if s not in seen and s != 'page']
        seen.update(new)
        slugs.extend(new)
        print(f'page {p}: +{len(new)} slugs (total {len(slugs)})', file=sys.stderr)
        time.sleep(0.4)
    return slugs


def article_record(slug: str) -> dict | None:
    html = fetch(f'{BASE}/news/level-1/{slug}')
    rows = parse_rows(decode_html_payload(html))
    trees = [resolve(rows[r], rows) for r in rows
             if isinstance(rows[r], list) and rows[r] and rows[r][0] == '$']
    recs = []
    for t in trees:
        find_dicts(t, lambda d: isinstance(d.get('levels'), list) and bool(d['levels'])
                   and isinstance(d['levels'][0], dict) and 'content' in d['levels'][0], recs)
    if not recs:
        return None
    d = recs[0]
    levels = {}
    for lv in d['levels']:
        levels[str(lv['level'])] = {
            'content': lv['content'],
            'vocabulary': [{'word': v.get('word'),
                            'definition': v.get('definition') or v.get('explanation')}
                           for v in lv.get('vocabulary', [])],
            'quiz': [{'question': q['question'],
                      'options': q['options'],
                      'answer': int(q['answer']) - 1} for q in lv.get('quiz', [])],
            'audio': lv.get('audio') or None,
        }
    return {
        'slug': d.get('titleid') or slug,
        'title': d.get('title'),
        'summary': d.get('summary'),
        'date': d.get('date'),
        'cover': d.get('cover') or None,
        'originalUrl': d.get('originalUrl') or None,
        'reads': d.get('readCount') or 0,
        'levels': levels,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--pages', type=int, default=5, help='listing pages to walk (8 articles/page)')
    ap.add_argument('--out', default='src/data/articles.json')
    args = ap.parse_args()

    slugs = list_slugs(args.pages)
    records, failed = [], []
    for i, slug in enumerate(slugs):
        try:
            rec = article_record(slug)
            if rec:
                records.append(rec)
                print(f'[{i + 1}/{len(slugs)}] ok: {rec["title"][:60]}', file=sys.stderr)
            else:
                failed.append(slug)
                print(f'[{i + 1}/{len(slugs)}] NO DATA: {slug}', file=sys.stderr)
        except Exception as e:
            failed.append(slug)
            print(f'[{i + 1}/{len(slugs)}] FAIL: {slug}: {e}', file=sys.stderr)
        time.sleep(0.4)

    records.sort(key=lambda r: r['date'] or 0, reverse=True)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(records, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'wrote {len(records)} articles to {out}; failed: {failed or "none"}', file=sys.stderr)


if __name__ == '__main__':
    main()
