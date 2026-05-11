#!/usr/bin/env python3
"""
02_chunk.py — Semantic chunking: raw_docs.jsonl → chunks.jsonl

Chunking strategy:
  1. Split document by Markdown headers (##, ###) into sections
  2. Within each section, split by double-newline (paragraph breaks)
  3. Greedily merge consecutive paragraphs up to CHUNK_TARGET_CHARS
  4. If a single paragraph exceeds CHUNK_MAX_CHARS, split on sentence boundaries
  5. Add CHUNK_OVERLAP_CHARS overlap between consecutive chunks

Output: each line of chunks.jsonl is a DocChunk (see schema.py)

Run:  python3 scripts/rag/02_chunk.py
"""
import json
import re
import sys
import uuid
from pathlib import Path
from typing import Iterator

sys.path.insert(0, str(Path(__file__).parent))
from config import (
    RAW_DOCS_FILE, CHUNKS_FILE,
    CHUNK_TARGET_CHARS, CHUNK_MAX_CHARS, CHUNK_OVERLAP_CHARS
)
from schema import DocChunk


# ── Markdown splitting ────────────────────────────────────────────────────────
HEADER_RE = re.compile(r'^(#{1,4})\s+(.+)$', re.MULTILINE)


def _detect_language(text: str) -> str:
    zh = sum(1 for c in text if '\u4e00' <= c <= '\u9fff')
    if zh > len(text) * 0.15:
        return "zh"
    if zh > 5:
        return "bilingual"
    return "en"


def _split_by_headers(text: str) -> list[tuple[list[str], str]]:
    """
    Split markdown text into sections by headers.
    Returns list of (section_path: List[str], body: str).
    """
    sections: list[tuple[list[str], str]] = []
    header_stack: list[tuple[int, str]] = []  # (level, title)

    # Find all header positions
    positions = [(m.start(), len(m.group(1)), m.group(2).strip())
                 for m in HEADER_RE.finditer(text)]

    # Split text at each header
    starts = [0] + [p[0] for p in positions]
    ends   = [p[0] for p in positions] + [len(text)]

    for i, (level, title) in enumerate(
            [(p[1], p[2]) for p in positions],
            start=1):
        body = text[ends[i-1]:ends[i]] if i < len(ends) else ""
        # Remove the header line itself from the body
        body = re.sub(r'^#{1,4}\s+.+\n?', '', body, count=1).strip()

        # Update stack
        header_stack = [(l, t) for l, t in header_stack if l < level]
        header_stack.append((level, title))
        path = [t for _, t in header_stack]

        if body:
            sections.append((path, body))

    # Prepend any text before the first header
    if positions:
        preamble = text[:positions[0][0]].strip()
    else:
        preamble = text.strip()
        sections = [([],  preamble)] if preamble else []
        return sections

    if preamble:
        sections.insert(0, ([], preamble))

    return sections


def _split_sentences(text: str) -> list[str]:
    """Split text into sentences (handles Chinese and English)."""
    # Chinese sentence end: 。！？；
    # English sentence end: . ! ?
    parts = re.split(r'(?<=[。！？；\.\!\?])\s*', text)
    return [p.strip() for p in parts if p.strip()]


def _chunk_section(section_body: str) -> list[str]:
    """
    Split a section body into text chunks of target size.
    Returns list of text strings.
    """
    paragraphs = [p.strip() for p in re.split(r'\n{2,}', section_body) if p.strip()]

    chunks: list[str] = []
    current_parts: list[str] = []
    current_len = 0

    for para in paragraphs:
        # If a single paragraph is too long, split it by sentences
        if len(para) > CHUNK_MAX_CHARS:
            sentences = _split_sentences(para)
            sub_chunks = []
            sub_current = []
            sub_len = 0
            for sent in sentences:
                if sub_len + len(sent) > CHUNK_TARGET_CHARS and sub_current:
                    sub_chunks.append(" ".join(sub_current))
                    # Keep overlap
                    overlap_sent = sub_current[-1:] if CHUNK_OVERLAP_CHARS > 0 else []
                    sub_current = overlap_sent
                    sub_len = sum(len(s) for s in sub_current)
                sub_current.append(sent)
                sub_len += len(sent)
            if sub_current:
                sub_chunks.append(" ".join(sub_current))
            # Flush current and add sub_chunks
            if current_parts:
                chunks.append("\n\n".join(current_parts))
                current_parts = []
                current_len = 0
            chunks.extend(sub_chunks)
            continue

        if current_len + len(para) > CHUNK_TARGET_CHARS and current_parts:
            chunks.append("\n\n".join(current_parts))
            # Overlap: carry last paragraph
            if CHUNK_OVERLAP_CHARS > 0 and current_parts:
                overlap_para = current_parts[-1]
                current_parts = [overlap_para]
                current_len = len(overlap_para)
            else:
                current_parts = []
                current_len = 0

        current_parts.append(para)
        current_len += len(para)

    if current_parts:
        chunks.append("\n\n".join(current_parts))

    return chunks or [section_body[:CHUNK_MAX_CHARS]]


# ── Main chunker ──────────────────────────────────────────────────────────────
def chunk_document(doc: dict) -> list[DocChunk]:
    """Convert a raw_doc dict into a list of DocChunk objects."""
    full_text: str = doc["full_text"]
    source_file: str = doc["source_file"]
    doc_type: str = doc["doc_type"]
    title: str = doc["title"]
    meta: dict = doc.get("metadata", {})

    sections = _split_by_headers(full_text)
    if not sections:
        # No headers — treat entire text as one section
        sections = [([title], full_text)]

    raw_chunks: list[tuple[list[str], str]] = []
    for path, body in sections:
        for chunk_text in _chunk_section(body):
            raw_chunks.append((path, chunk_text))

    doc_chunks: list[DocChunk] = []
    total = len(raw_chunks)
    for idx, (path, chunk_text) in enumerate(raw_chunks):
        chunk_title = path[-1] if path else title
        lang = meta.get("language") or _detect_language(chunk_text)
        dc = DocChunk(
            id=str(uuid.uuid4()),
            source_file=source_file,
            doc_type=doc_type,
            title=chunk_title,
            section_path=path if path else [title],
            content=chunk_text,
            chunk_index=idx,
            total_chunks=total,
            language=lang,
            tags=list(meta.get("tags", [])),
            word_count=len(chunk_text),
            chapter=meta.get("chapter"),
            extra={},
        )
        doc_chunks.append(dc)
    return doc_chunks


def iter_raw_docs(path: Path) -> Iterator[dict]:
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                yield json.loads(line)


def main():
    if not RAW_DOCS_FILE.exists():
        print(f"ERROR: {RAW_DOCS_FILE} not found. Run 01_collect.py first.")
        sys.exit(1)

    all_chunks: list[DocChunk] = []
    doc_count = 0
    for doc in iter_raw_docs(RAW_DOCS_FILE):
        chunks = chunk_document(doc)
        all_chunks.extend(chunks)
        doc_count += 1

    with open(CHUNKS_FILE, "w", encoding="utf-8") as f:
        for chunk in all_chunks:
            f.write(chunk.to_json() + "\n")

    # Summary stats
    from collections import Counter
    by_type = Counter(c.doc_type for c in all_chunks)
    by_lang = Counter(c.language for c in all_chunks)
    total_chars = sum(c.word_count for c in all_chunks)

    print(f"\n{'='*50}")
    print(f"Chunking complete: {doc_count} docs → {len(all_chunks)} chunks")
    print(f"Total characters: {total_chars:,}")
    print(f"\nBy doc_type:  {dict(by_type)}")
    print(f"By language:  {dict(by_lang)}")
    print(f"\nWritten → {CHUNKS_FILE}")


if __name__ == "__main__":
    main()
