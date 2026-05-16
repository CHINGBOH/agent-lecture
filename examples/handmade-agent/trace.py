from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Any

from .tools import JsonDict, to_jsonable


def parse_tool_result_payload(result_text: str) -> JsonDict:
    try:
        payload = json.loads(result_text)
    except json.JSONDecodeError:
        return {"ok": False, "raw": result_text, "parse_error": True}

    return payload if isinstance(payload, dict) else {"ok": False, "raw": payload, "parse_error": True}


def extract_quality_gate_summary(tool_payload: JsonDict) -> JsonDict | None:
    if tool_payload.get("tool") != "run_quality_gate":
        return None

    result = tool_payload.get("result")
    if not isinstance(result, dict):
        return {
            "ok": False,
            "reason": "missing result payload",
        }

    checks = result.get("results", [])
    if not isinstance(checks, list):
        checks = []

    passed = sum(1 for item in checks if item.get("ok") is True)
    skipped = sum(1 for item in checks if item.get("skipped") is True)
    failed = len(checks) - passed - skipped

    return {
        "ok": bool(tool_payload.get("ok", False)),
        "level": result.get("level"),
        "total_checks": len(checks),
        "passed_checks": passed,
        "failed_checks": failed,
        "skipped_checks": skipped,
        "failed_commands": [item.get("argv") for item in checks if item.get("ok") is False and not item.get("skipped")],
    }


class TraceRecorder:
    def __init__(self, trace_dir: Path, enabled: bool = True) -> None:
        self.enabled = enabled
        self.trace_dir = trace_dir.resolve()
        self.trace_dir.mkdir(parents=True, exist_ok=True)
        timestamp = time.strftime("%Y%m%d-%H%M%S", time.localtime())
        self.session_id = f"{timestamp}-{os.getpid()}"
        self.trace_path = self.trace_dir / f"handmade-agent-{self.session_id}.jsonl"

    def new_run_id(self) -> str:
        return f"run-{int(time.time() * 1000)}"

    def record(self, event: str, **payload: Any) -> None:
        if not self.enabled:
            return

        entry = {
            "ts": time.time(),
            "session_id": self.session_id,
            "event": event,
            **to_jsonable(payload),
        }
        with self.trace_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(entry, ensure_ascii=False) + "\n")