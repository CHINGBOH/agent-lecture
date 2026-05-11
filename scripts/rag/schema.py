"""JSON schema (dataclass) for document chunks in the RAG knowledge base."""
from __future__ import annotations
import uuid
from dataclasses import dataclass, field, asdict
from typing import List, Optional, Literal
import json

DocType = Literal[
    "slide_content",    # serialised Slide objects from src/data/slides/*.ts
    "notebook",         # Jupyter notebook markdown from Hands-On-LLM
    "ranking_table",    # Github-Ranking-AI top-100 tables
    "awesome_list",     # awesome-llm / Awesome-LLM-RL curated lists
    "agent_notes",      # 手搓agent.md / .agent/ architecture docs
    "jin_yong",         # Jin Yong literary content (user-supplied)
]

Language = Literal["zh", "en", "bilingual"]


@dataclass
class DocChunk:
    id: str                         # UUIDv4
    source_file: str                # relative path from project root
    doc_type: DocType
    title: str                      # section title / slide title
    section_path: List[str]         # breadcrumb, e.g. ["Chapter 3", "Self-Attention"]
    content: str                    # actual text of this chunk
    chunk_index: int                # 0-based within the source document
    total_chunks: int               # total chunks for this source document

    # metadata
    language: Language = "en"
    tags: List[str] = field(default_factory=list)
    word_count: int = 0
    chapter: Optional[str] = None   # for slides: chapter name
    extra: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return asdict(self)

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), ensure_ascii=False)

    @classmethod
    def from_dict(cls, d: dict) -> "DocChunk":
        return cls(**d)

    @staticmethod
    def make_id() -> str:
        return str(uuid.uuid4())


# ── Jin Yong template ─────────────────────────────────────────────────────────
# Copyright note: Jin Yong (Louis Cha, 1924-2018). Works protected until 2068
# in China (life + 50 years). Do NOT scrape or include copyrighted text.
# This schema is a template for user-supplied content only.
JIN_YONG_SCHEMA_TEMPLATE = {
    "id": "<uuid>",
    "source_file": "user_data/jin_yong/<novel_pinyin>.txt",
    "doc_type": "jin_yong",
    "title": "<章节标题>",
    "section_path": ["<小说名>", "<卷>", "<章>"],
    "content": "<用户自行提供的正文文本>",
    "chunk_index": 0,
    "total_chunks": 0,
    "language": "zh",
    "tags": ["武侠", "金庸", "<人物>", "<武功>"],
    "word_count": 0,
    "chapter": None,
    "extra": {
        "novel": "<小说名>",
        "characters": [],
        "kungfu_styles": [],
        "published_year": 0,
    }
}
