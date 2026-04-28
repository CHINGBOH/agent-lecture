#!/usr/bin/env python3
"""
03_embed_index.py — Embed chunks with BAAI/bge-m3 and store in Qdrant

Prerequisites:
  - Qdrant running on localhost:6333 (docker run -d -p 6333:6333 qdrant/qdrant)
  - chunks.jsonl produced by 02_chunk.py
  - sentence-transformers installed (pip install sentence-transformers)
  - qdrant-client installed (pip install qdrant-client)

Run:  python3 scripts/rag/03_embed_index.py
      python3 scripts/rag/03_embed_index.py --reset   # drop & rebuild
"""
import json
import sys
import time
import argparse
from pathlib import Path
from typing import Iterator

sys.path.insert(0, str(Path(__file__).parent))
from config import (
    CHUNKS_FILE, QDRANT_URL, COLLECTION_NAME,
    VECTOR_SIZE, EMBED_MODEL, EMBED_BATCH_SIZE,
)
from schema import DocChunk

QDRANT_UPSERT_BATCH = 8  # small sub-batches to avoid "too many open files" on server


def load_model():
    print(f"Loading embedding model: {EMBED_MODEL} ...")
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer(EMBED_MODEL)
    print("Model loaded ✓")
    return model


def setup_qdrant(reset: bool = False):
    from qdrant_client import QdrantClient
    from qdrant_client.models import Distance, VectorParams

    client = QdrantClient(url=QDRANT_URL, timeout=60, check_compatibility=False)

    collections = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME in collections:
        if reset:
            print(f"Dropping existing collection: {COLLECTION_NAME}")
            client.delete_collection(COLLECTION_NAME)
        else:
            info = client.get_collection(COLLECTION_NAME)
            existing = info.points_count or 0
            print(f"Collection '{COLLECTION_NAME}' exists with {existing} points. Resuming...")
            return client, existing

    print(f"Creating collection: {COLLECTION_NAME} (dim={VECTOR_SIZE}, cosine)")
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
    )
    return client, 0


def iter_chunks(path: Path) -> Iterator[DocChunk]:
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                yield DocChunk.from_dict(json.loads(line))


def batch(iterable, n: int):
    buf = []
    for item in iterable:
        buf.append(item)
        if len(buf) == n:
            yield buf
            buf = []
    if buf:
        yield buf


def embed_and_index(model, client, existing_count: int = 0):
    from qdrant_client.models import PointStruct

    if not CHUNKS_FILE.exists():
        print(f"ERROR: {CHUNKS_FILE} not found. Run 02_chunk.py first.")
        sys.exit(1)

    all_chunks = list(iter_chunks(CHUNKS_FILE))
    total = len(all_chunks)
    skip = existing_count
    remaining = all_chunks[skip:]

    if skip > 0:
        print(f"Resuming: skipping {skip} already-indexed chunks, {len(remaining)} remaining")
    else:
        print(f"Embedding {total} chunks in batches of {EMBED_BATCH_SIZE} ...")

    upserted = 0
    t0 = time.time()

    for embed_batch in batch(remaining, EMBED_BATCH_SIZE):
        texts = [c.content for c in embed_batch]
        passages = [f"passage: {t}" for t in texts]
        vectors = model.encode(passages, normalize_embeddings=True, show_progress_bar=False)

        points = [
            PointStruct(
                id=c.id,
                vector=vec.tolist(),
                payload={
                    "source_file":   c.source_file,
                    "doc_type":      c.doc_type,
                    "title":         c.title,
                    "section_path":  c.section_path,
                    "content":       c.content,
                    "chunk_index":   c.chunk_index,
                    "total_chunks":  c.total_chunks,
                    "language":      c.language,
                    "tags":          c.tags,
                    "word_count":    c.word_count,
                    "chapter":       c.chapter,
                },
            )
            for c, vec in zip(embed_batch, vectors)
        ]

        # Upsert in small sub-batches to protect Qdrant from open-file exhaustion
        for sub in batch(points, QDRANT_UPSERT_BATCH):
            client.upsert(collection_name=COLLECTION_NAME, points=sub)
            upserted += len(sub)

        elapsed = time.time() - t0
        done = skip + upserted
        pct = done / total * 100
        eta = (elapsed / upserted) * (total - done) if upserted else 0
        print(f"  [{done}/{total}] {pct:.0f}%  elapsed={elapsed:.0f}s  ETA={eta:.0f}s",
              end="\r", flush=True)

    print(f"\nIndexed {upserted} new chunks in {time.time()-t0:.1f}s ✓")
    info = client.get_collection(COLLECTION_NAME)
    print(f"Collection '{COLLECTION_NAME}': {info.points_count} points total")


def main():
    parser = argparse.ArgumentParser(description="Embed and index chunks into Qdrant")
    parser.add_argument("--reset", action="store_true",
                        help="Drop and recreate the Qdrant collection")
    args = parser.parse_args()

    model = load_model()
    client, existing = setup_qdrant(reset=args.reset)
    embed_and_index(model, client, existing_count=existing)


if __name__ == "__main__":
    main()
