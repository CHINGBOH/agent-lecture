#!/usr/bin/env python3
"""
03_embed_index.py — Embed chunks with BAAI/bge-m3 and store in Qdrant

Uses direct REST HTTP (no qdrant-client) to support Qdrant server v1.8.0.

Run:  python3 scripts/rag/03_embed_index.py
      python3 scripts/rag/03_embed_index.py --reset   # drop & rebuild
"""
import json
import sys
import time
import argparse
import http.client
import urllib.parse
from pathlib import Path
from typing import Iterator

sys.path.insert(0, str(Path(__file__).parent))
from config import (
    CHUNKS_FILE, QDRANT_URL, COLLECTION_NAME,
    VECTOR_SIZE, EMBED_MODEL, EMBED_BATCH_SIZE,
)
from schema import DocChunk

QDRANT_UPSERT_BATCH = 8  # small sub-batches to avoid server "too many open files"

_qdrant_host = "127.0.0.1"
_qdrant_port = 6333


def _qdrant_request(method: str, path: str, body: dict | None = None,
                    retries: int = 4, timeout: int = 120) -> dict:
    """Make a Qdrant REST HTTP request with retry on connection error."""
    for attempt in range(retries):
        try:
            conn = http.client.HTTPConnection(_qdrant_host, _qdrant_port, timeout=timeout)
            headers = {"Content-Type": "application/json"}
            payload = json.dumps(body).encode() if body is not None else None
            conn.request(method, path, body=payload, headers=headers)
            resp = conn.getresponse()
            data = json.loads(resp.read().decode())
            conn.close()
            if resp.status >= 400:
                raise RuntimeError(f"Qdrant {method} {path} → {resp.status}: {data}")
            return data
        except (http.client.HTTPException, OSError, RuntimeError) as e:
            if attempt == retries - 1:
                raise
            wait = 2 ** attempt
            print(f"\n  [retry {attempt+1}/{retries-1}] {e}  (waiting {wait}s)", flush=True)
            time.sleep(wait)
    return {}  # unreachable


def load_model():
    print(f"Loading embedding model: {EMBED_MODEL} ...")
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer(EMBED_MODEL)
    print("Model loaded ✓")
    return model


def setup_qdrant(reset: bool = False) -> int:
    """Create/reset collection; return number of already-indexed points."""
    # Check existing collections
    try:
        data = _qdrant_request("GET", "/collections")
        names = [c["name"] for c in data["result"]["collections"]]
    except Exception as e:
        print(f"ERROR: Cannot reach Qdrant at {_qdrant_host}:{_qdrant_port} — {e}")
        sys.exit(1)

    if COLLECTION_NAME in names:
        if reset:
            print(f"Dropping existing collection: {COLLECTION_NAME}")
            _qdrant_request("DELETE", f"/collections/{COLLECTION_NAME}")
        else:
            info = _qdrant_request("GET", f"/collections/{COLLECTION_NAME}")
            existing = info["result"]["points_count"] or 0
            print(f"Collection '{COLLECTION_NAME}' exists with {existing} points. Resuming...")
            return existing

    print(f"Creating collection: {COLLECTION_NAME} (dim={VECTOR_SIZE}, cosine)")
    _qdrant_request("PUT", f"/collections/{COLLECTION_NAME}", {
        "vectors": {"size": VECTOR_SIZE, "distance": "Cosine"}
    })
    return 0


def iter_chunks(path: Path) -> Iterator[DocChunk]:
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                yield DocChunk.from_dict(json.loads(line))


def _batches(iterable, n: int):
    buf = []
    for item in iterable:
        buf.append(item)
        if len(buf) == n:
            yield buf
            buf = []
    if buf:
        yield buf


def embed_and_index(model, existing_count: int = 0):
    if not CHUNKS_FILE.exists():
        print(f"ERROR: {CHUNKS_FILE} not found. Run 02_chunk.py first.")
        sys.exit(1)

    all_chunks = list(iter_chunks(CHUNKS_FILE))
    total = len(all_chunks)
    skip = existing_count
    remaining = all_chunks[skip:]

    if skip > 0:
        print(f"Resuming: skipping {skip} already-indexed, {len(remaining)} remaining")
    else:
        print(f"Embedding {total} chunks in batches of {EMBED_BATCH_SIZE} ...")

    upserted = 0
    t0 = time.time()

    for embed_batch in _batches(remaining, EMBED_BATCH_SIZE):
        texts = [c.content for c in embed_batch]
        passages = [f"passage: {t}" for t in texts]
        vectors = model.encode(passages, normalize_embeddings=True, show_progress_bar=False)

        points = [
            {
                "id": c.id,
                "vector": vec.tolist(),
                "payload": {
                    "source_file":  c.source_file,
                    "doc_type":     c.doc_type,
                    "title":        c.title,
                    "section_path": c.section_path,
                    "content":      c.content,
                    "chunk_index":  c.chunk_index,
                    "total_chunks": c.total_chunks,
                    "language":     c.language,
                    "tags":         c.tags,
                    "word_count":   c.word_count,
                    "chapter":      c.chapter,
                },
            }
            for c, vec in zip(embed_batch, vectors)
        ]

        # Upsert in small sub-batches to protect Qdrant from open-file exhaustion
        for sub in _batches(points, QDRANT_UPSERT_BATCH):
            _qdrant_request("PUT", f"/collections/{COLLECTION_NAME}/points",
                            {"points": sub})
            upserted += len(sub)
            time.sleep(0.05)  # throttle to reduce server file descriptor churn

        elapsed = time.time() - t0
        done = skip + upserted
        pct = done / total * 100
        eta = (elapsed / upserted) * (total - done) if upserted else 0
        print(f"  [{done}/{total}] {pct:.0f}%  elapsed={elapsed:.0f}s  ETA={eta:.0f}s",
              end="\r", flush=True)

    print(f"\nIndexed {upserted} new chunks in {time.time()-t0:.1f}s ✓")
    info = _qdrant_request("GET", f"/collections/{COLLECTION_NAME}")
    print(f"Collection '{COLLECTION_NAME}': {info['result']['points_count']} points total")


def main():
    parser = argparse.ArgumentParser(description="Embed and index chunks into Qdrant")
    parser.add_argument("--reset", action="store_true",
                        help="Drop and recreate the Qdrant collection")
    args = parser.parse_args()

    model = load_model()
    existing = setup_qdrant(reset=args.reset)
    embed_and_index(model, existing_count=existing)


if __name__ == "__main__":
    main()
