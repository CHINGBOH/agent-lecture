#!/usr/bin/env python3
"""
01_collect.py — Collect source documents and serialize to raw_docs.jsonl

Each line of raw_docs.jsonl is a JSON object:
{
  "source_file": str,       # relative path from project root
  "doc_type": str,
  "title": str,
  "full_text": str,         # raw text before chunking
  "metadata": dict
}

Run:  python3 scripts/rag/01_collect.py
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from config import (
    PROJECT_ROOT, RAW_DOCS_FILE,
    SLIDES_DIR, HANDS_ON_LLM_DIR, GITHUB_RANKING_DIR,
    AWESOME_LLM_README, AWESOME_LLM_RL_README, AGENT_NOTES_FILES,
)


def rel(path: Path) -> str:
    """Return path relative to PROJECT_ROOT for storage."""
    try:
        return str(path.relative_to(PROJECT_ROOT))
    except ValueError:
        return str(path)


# ── 1. Slide TS → text ────────────────────────────────────────────────────────
# Fields that contain educational content (ordered by priority)
_CONTENT_FIELDS = [
    'title', 'subtitle', 'question', 'context', 'text', 'sub',
    'scene', 'insight', 'speakerNote', 'quote', 'quoteAuthor', 'character',
    'label', 'description', 'caption',
]


def _slide_ts_to_text(ts_src: str) -> str:
    """Convert a slide TS file to readable text using field-name-aware extraction.

    Only extracts string values from known content fields, avoiding structural
    TS fields (id, from, to, type, accent, etc.) that pollute the text.
    """
    lines = []

    # Chapter comments at file top
    for line in ts_src.splitlines():
        stripped = line.strip()
        if stripped.startswith("//"):
            comment = stripped.lstrip("/ ").strip()
            if len(comment) > 4:
                lines.append(comment)

    # Field-name-aware extraction (single and double quoted)
    for field in _CONTENT_FIELDS:
        for m in re.finditer(rf"{field}\s*:\s*'((?:[^'\\]|\\.)+)'", ts_src):
            val = m.group(1).strip()
            if len(val) >= 8 and not val.startswith('http'):
                lines.append(val.replace('\\n', '\n').replace("\\'", "'"))
        for m in re.finditer(rf'{field}\s*:\s*"((?:[^"\\]|\\.)+)"', ts_src):
            val = m.group(1).strip()
            if len(val) >= 8 and not val.startswith('http'):
                lines.append(val.replace('\\n', '\n').replace('\\"', '"'))

    # Extract takeaways array items specifically
    ta_match = re.search(r'takeaways\s*:\s*\[(.*?)\]', ts_src, re.DOTALL)
    if ta_match:
        for m in re.finditer(r"'((?:[^'\\]|\\.){10,})'|\"((?:[^\"\\]|\\.){10,})\"",
                             ta_match.group(1)):
            val = (m.group(1) or m.group(2) or '').strip()
            if val:
                lines.append(val)

    return "\n".join(lines)


def collect_slides() -> list[dict]:
    docs = []
    for ts_file in sorted(SLIDES_DIR.glob("*.ts")):
        if ts_file.name == "index.ts":
            continue
        text = ts_file.read_text(encoding="utf-8")
        content = _slide_ts_to_text(text)
        if not content.strip():
            continue
        # Determine chapter from filename
        chapter_map = {
            "prologue": "序章：AI 的江湖",
            "chapter1": "第一章：内力觉醒",
            "chapter2": "第二章：门派崛起",
            "chapter3": "第三章：语言内功",
            "chapter4": "第四章：武学总纲",
            "chapter5": "第五章：新武学",
        }
        chapter = chapter_map.get(ts_file.stem, ts_file.stem)
        docs.append({
            "source_file": rel(ts_file),
            "doc_type": "slide_content",
            "title": chapter,
            "full_text": content,
            "metadata": {
                "chapter": chapter,
                "language": "bilingual",
                "tags": ["AI", "deep learning", "slides"],
            }
        })
    return docs


# ── 2. Jupyter notebooks → markdown text ─────────────────────────────────────
def _notebook_to_markdown(nb_path: Path) -> str:
    """Extract markdown cells from a Jupyter notebook."""
    try:
        nb = json.loads(nb_path.read_text(encoding="utf-8"))
    except Exception:
        return ""
    parts = []
    for cell in nb.get("cells", []):
        if cell.get("cell_type") == "markdown":
            src = "".join(cell.get("source", []))
            # Skip cells that are just images/badges
            clean = re.sub(r'!\[.*?\]\(.*?\)', '', src)
            clean = re.sub(r'<img[^>]+>', '', clean)
            clean = re.sub(r'\[!\[.*?\]\(.*?\)\]\(.*?\)', '', clean)
            if len(clean.strip()) > 30:
                parts.append(src)
    return "\n\n".join(parts)


def collect_notebooks() -> list[dict]:
    docs = []
    for chapter_dir in sorted(HANDS_ON_LLM_DIR.glob("chapter*")):
        if not chapter_dir.is_dir():
            continue
        notebooks = list(chapter_dir.glob("*.ipynb"))
        if not notebooks:
            continue
        nb_path = notebooks[0]
        content = _notebook_to_markdown(nb_path)
        if not content.strip():
            continue
        chapter_num = chapter_dir.name  # e.g. "chapter01"
        title = nb_path.stem  # e.g. "Chapter 1 - Introduction to Language Models"
        docs.append({
            "source_file": rel(nb_path),
            "doc_type": "notebook",
            "title": title,
            "full_text": content,
            "metadata": {
                "chapter": chapter_num,
                "language": "en",
                "tags": ["LLM", "hands-on", "tutorial"],
            }
        })
    return docs


# ── 3. GitHub Ranking tables ──────────────────────────────────────────────────
def _parse_ranking_table(text: str, topic: str) -> str:
    """Convert markdown table to structured text entries."""
    lines = []
    lines.append(f"# Top GitHub Repositories: {topic}\n")
    for line in text.splitlines():
        if not line.startswith("| "):
            continue
        cells = [c.strip() for c in line.split("|")[1:-1]]
        if len(cells) < 7:
            continue
        # Skip header row
        if "Ranking" in cells[0] or "---" in cells[0]:
            continue
        rank, name_cell, stars, forks, lang, issues, desc, *_ = cells + [""] * 8
        # Extract project name from markdown link
        name_match = re.search(r'\[([^\]]+)\]', name_cell)
        name = name_match.group(1) if name_match else name_cell
        url_match = re.search(r'\(([^)]+)\)', name_cell)
        url = url_match.group(1) if url_match else ""
        lines.append(
            f"{rank}. {name} ({stars}★, {lang}) — {desc}\n   URL: {url}"
        )
    return "\n".join(lines)


def collect_rankings() -> list[dict]:
    docs = []
    for md_file in sorted(GITHUB_RANKING_DIR.glob("*.md")):
        text = md_file.read_text(encoding="utf-8")
        topic = md_file.stem
        content = _parse_ranking_table(text, topic)
        if not content.strip():
            continue
        docs.append({
            "source_file": rel(md_file),
            "doc_type": "ranking_table",
            "title": f"Top 100 GitHub Repos: {topic}",
            "full_text": content,
            "metadata": {
                "topic": topic,
                "language": "en",
                "tags": ["github", "open-source", topic.lower()],
            }
        })
    return docs


# ── 4. Awesome lists ──────────────────────────────────────────────────────────
def collect_awesome_lists() -> list[dict]:
    docs = []
    for readme in [AWESOME_LLM_README, AWESOME_LLM_RL_README]:
        if not readme.exists():
            print(f"  [SKIP] {readme} not found")
            continue
        content = readme.read_text(encoding="utf-8")
        title = readme.parent.name
        docs.append({
            "source_file": rel(readme),
            "doc_type": "awesome_list",
            "title": title,
            "full_text": content,
            "metadata": {
                "language": "en",
                "tags": ["LLM", "resources", "awesome-list"],
            }
        })
    return docs


# ── 5. Agent notes ────────────────────────────────────────────────────────────
def collect_agent_notes() -> list[dict]:
    docs = []
    for f in AGENT_NOTES_FILES:
        if not f.exists():
            print(f"  [SKIP] {f} not found")
            continue
        content = f.read_text(encoding="utf-8")
        if len(content.strip()) < 50:
            continue
        # Detect language
        zh_count = sum(1 for c in content if '\u4e00' <= c <= '\u9fff')
        lang = "zh" if zh_count > len(content) * 0.1 else "bilingual" if zh_count > 20 else "en"
        docs.append({
            "source_file": rel(f),
            "doc_type": "agent_notes",
            "title": f.stem,
            "full_text": content,
            "metadata": {
                "language": lang,
                "tags": ["agent", "architecture", "notes"],
            }
        })
    return docs


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    all_docs = []

    collectors = [
        ("Slides (TS)",       collect_slides),
        ("Notebooks",         collect_notebooks),
        ("GitHub Rankings",   collect_rankings),
        ("Awesome lists",     collect_awesome_lists),
        ("Agent notes",       collect_agent_notes),
    ]

    for name, fn in collectors:
        print(f"Collecting: {name} ...", end=" ", flush=True)
        docs = fn()
        print(f"{len(docs)} docs")
        all_docs.extend(docs)

    # Write JSONL
    with open(RAW_DOCS_FILE, "w", encoding="utf-8") as f:
        for doc in all_docs:
            f.write(json.dumps(doc, ensure_ascii=False) + "\n")

    total_chars = sum(len(d["full_text"]) for d in all_docs)
    print(f"\nTotal: {len(all_docs)} docs, {total_chars:,} characters")
    print(f"Written → {RAW_DOCS_FILE}")


if __name__ == "__main__":
    main()
