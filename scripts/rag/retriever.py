#!/usr/bin/env python3
"""
retriever.py — Query the Qdrant knowledge base via direct REST API

Bypasses qdrant-client version incompatibility by using raw HTTP requests.

Usage:
  1. Library:  from retriever import query_kb, format_context
  2. Server:   python3 retriever.py --serve   (HTTP on port 8765)
  3. CLI:      python3 retriever.py "your question"
"""
import http.client
import json
import sys
import urllib.parse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from config import QDRANT_URL, COLLECTION_NAME, EMBED_MODEL

_model = None


def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(EMBED_MODEL, local_files_only=True)
    return _model


def _qdrant_search(vector: list[float], limit: int, score_threshold: float,
                    doc_types: list[str] | None) -> list[dict]:
    """POST to Qdrant v1.8 REST search endpoint directly via http.client."""
    parsed = urllib.parse.urlparse(QDRANT_URL)
    conn = http.client.HTTPConnection(parsed.hostname, parsed.port or 6333, timeout=15)

    body: dict = {
        "vector": vector,
        "limit": limit,
        "score_threshold": score_threshold,
        "with_payload": True,
    }
    if doc_types:
        body["filter"] = {
            "must": [{"key": "doc_type", "match": {"any": doc_types}}]
        }

    conn.request(
        "POST",
        f"/collections/{COLLECTION_NAME}/points/search",
        body=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    resp = conn.getresponse()
    data = json.loads(resp.read())
    return data.get("result", [])


def query_kb(
    question: str,
    top_k: int = 5,
    doc_types: list[str] | None = None,
    score_threshold: float = 0.35,
) -> list[dict]:
    """
    Retrieve top_k most relevant chunks.
    Returns list of dicts with keys:
      content, title, source_file, doc_type, section_path, score, language, tags
    """
    model = _get_model()
    query_vec = model.encode(
        f"query: {question}", normalize_embeddings=True
    ).tolist()

    raw = _qdrant_search(query_vec, top_k, score_threshold, doc_types)
    return [
        {
            "content":      r["payload"].get("content", ""),
            "title":        r["payload"].get("title", ""),
            "source_file":  r["payload"].get("source_file", ""),
            "doc_type":     r["payload"].get("doc_type", ""),
            "section_path": r["payload"].get("section_path", []),
            "language":     r["payload"].get("language", ""),
            "tags":         r["payload"].get("tags", []),
            "score":        round(r.get("score", 0), 4),
        }
        for r in raw
    ]


def format_context(results: list[dict], max_chars: int = 2000) -> str:
    """Format results into a context block for the LLM system prompt."""
    if not results:
        return ""
    parts = ["[知识库检索结果 / Retrieved context]"]
    used = 0
    for i, r in enumerate(results, 1):
        path_str = " > ".join(r["section_path"]) if r["section_path"] else r["title"]
        entry = f"\n--- [{i}] {path_str} (score={r['score']}) ---\n{r['content']}"
        if used + len(entry) > max_chars:
            break
        parts.append(entry)
        used += len(entry)
    return "\n".join(parts)


def serve(host: str = "127.0.0.1", port: int = 8765):
    """Minimal stdlib HTTP server — no external web framework needed."""
    from http.server import HTTPServer, BaseHTTPRequestHandler

    print(f"Loading embedding model {EMBED_MODEL} ...")
    _get_model()
    print(f"Retriever server ready → http://{host}:{port}/query?q=<question>&top_k=5")

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, format, *args):
            pass  # suppress request logs

        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path != "/query":
                self.send_response(404)
                self.end_headers()
                return

            params = urllib.parse.parse_qs(parsed.query)
            question  = params.get("q", [""])[0]
            top_k     = int(params.get("top_k", [5])[0])
            max_chars = int(params.get("max_chars", [2000])[0])

            if not question:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'{"error":"missing q parameter"}')
                return

            results  = query_kb(question, top_k=top_k)
            context  = format_context(results, max_chars=max_chars)
            body     = json.dumps(
                {"results": results, "context": context},
                ensure_ascii=False,
            ).encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    HTTPServer((host, port), Handler).serve_forever()


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="RAG retriever CLI / server")
    parser.add_argument("question", nargs="?", help="Question to query")
    parser.add_argument("--top-k", type=int, default=5)
    parser.add_argument("--serve", action="store_true", help="Run as HTTP server")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()

    if args.serve:
        serve(port=args.port)
    elif args.question:
        results = query_kb(args.question, top_k=args.top_k)
        for r in results:
            print(f"\n[{r['score']:.3f}] {r['title']}  ({r['doc_type']})")
            print(f"  {r['content'][:200]}...")
    else:
        parser.print_help()
