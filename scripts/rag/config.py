"""RAG pipeline configuration."""
import os
from pathlib import Path

# ── Paths ─────────────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

RAW_DOCS_FILE  = DATA_DIR / "raw_docs.jsonl"
CHUNKS_FILE    = DATA_DIR / "chunks.jsonl"

# ── Source roots ──────────────────────────────────────────────────────────────
SLIDES_DIR       = PROJECT_ROOT / "src" / "data" / "slides"
AWESOME_LIBS_DIR = PROJECT_ROOT / "awesome-libs"
AGENT_DIR        = Path("/home/l/agent")

HANDS_ON_LLM_DIR = AWESOME_LIBS_DIR / "Hands-On-Large-Language-Models"
GITHUB_RANKING_DIR = AWESOME_LIBS_DIR / "Github-Ranking-AI" / "Top100"
AWESOME_LLM_README = AWESOME_LIBS_DIR / "awesome-llm" / "README.md"
AWESOME_LLM_RL_README = AWESOME_LIBS_DIR / "Awesome-LLM-RL" / "README.md"

AGENT_NOTES_FILES = [
    AGENT_DIR / ".agent" / "ARCHITECTURE.md",
    AGENT_DIR / ".agent" / "CONCEPTS.md",
    AGENT_DIR / ".agent" / "RESOURCES.md",
    AGENT_DIR / "手搓agent.md",
    PROJECT_ROOT / "ARCHITECTURE.md",
    PROJECT_ROOT / "AWESOME_LIBS_INTEGRATION_PLAN.md",
]

# ── Qdrant ────────────────────────────────────────────────────────────────────
QDRANT_URL        = "http://127.0.0.1:6333"
COLLECTION_NAME   = "agent_lecture_kb"
VECTOR_SIZE       = 1024   # BAAI/bge-m3 output dim

# ── Embedding ─────────────────────────────────────────────────────────────────
EMBED_MODEL       = "BAAI/bge-m3"
EMBED_BATCH_SIZE  = 32

# ── Chunking ──────────────────────────────────────────────────────────────────
CHUNK_TARGET_CHARS = 800    # soft target per chunk
CHUNK_MAX_CHARS    = 1600   # hard cap before forced split
CHUNK_OVERLAP_CHARS = 100   # overlap between consecutive chunks
