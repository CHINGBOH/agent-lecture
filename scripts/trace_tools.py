from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


JsonDict = dict[str, Any]


def load_events(trace_path: Path) -> list[JsonDict]:
    events: list[JsonDict] = []
    for line in trace_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        events.append(json.loads(line))
    return events


def group_events_by_run(events: list[JsonDict]) -> dict[str, list[JsonDict]]:
    grouped: dict[str, list[JsonDict]] = defaultdict(list)
    for event in events:
        run_id = event.get("run_id")
        if isinstance(run_id, str):
            grouped[run_id].append(event)
    return dict(grouped)


def choose_run_id(grouped_events: dict[str, list[JsonDict]], requested_run_id: str | None) -> str:
    if requested_run_id:
        if requested_run_id not in grouped_events:
            raise ValueError(f"run_id not found: {requested_run_id}")
        return requested_run_id
    if not grouped_events:
        raise ValueError("no run-scoped events found in trace")
    return sorted(grouped_events)[-1]


def summarize_run(run_id: str, events: list[JsonDict]) -> JsonDict:
    event_counts = Counter(str(event.get("event")) for event in events)
    tool_names = [str(event.get("tool_name")) for event in events if event.get("event") == "tool_call"]
    duplicate_count = event_counts.get("tool_call_duplicate", 0)
    llm_response_ms = [int(event.get("response_ms", 0)) for event in events if event.get("event") == "llm_response"]

    quality_gate_summary = None
    for event in events:
        if event.get("event") == "quality_gate" and isinstance(event.get("summary"), dict):
            quality_gate_summary = event["summary"]

    final_answer = ""
    for event in events:
        if event.get("event") == "final_answer":
            final_answer = str(event.get("answer", ""))

    status = "unknown"
    duration_ms = None
    for event in events:
        if event.get("event") == "run_finished":
            status = str(event.get("status", "completed"))
            duration_ms = int(event.get("duration_ms", 0))
        elif event.get("event") == "run_failed":
            status = "failed"
            duration_ms = int(event.get("duration_ms", 0))

    return {
        "run_id": run_id,
        "status": status,
        "duration_ms": duration_ms,
        "steps": sorted({int(event.get("step")) for event in events if isinstance(event.get("step"), int)}),
        "event_counts": dict(event_counts),
        "tool_names": tool_names,
        "duplicate_tool_calls": duplicate_count,
        "llm_response_ms": llm_response_ms,
        "quality_gate_summary": quality_gate_summary,
        "final_answer": final_answer,
    }


def render_summary_text(summary: JsonDict) -> str:
    lines = [
        f"run_id: {summary['run_id']}",
        f"status: {summary['status']}",
        f"duration_ms: {summary['duration_ms']}",
        f"steps: {summary['steps']}",
        f"tool_calls: {len(summary['tool_names'])}",
        f"duplicate_tool_calls: {summary['duplicate_tool_calls']}",
    ]

    llm_response_ms = summary.get("llm_response_ms") or []
    if llm_response_ms:
        lines.append(
            "llm_response_ms: "
            + ", ".join(str(value) for value in llm_response_ms)
        )

    quality_gate_summary = summary.get("quality_gate_summary")
    if isinstance(quality_gate_summary, dict):
        lines.extend(
            [
                "quality_gate:",
                f"  level={quality_gate_summary.get('level')}",
                f"  total={quality_gate_summary.get('total_checks')}",
                f"  passed={quality_gate_summary.get('passed_checks')}",
                f"  failed={quality_gate_summary.get('failed_checks')}",
                f"  skipped={quality_gate_summary.get('skipped_checks')}",
            ]
        )

    final_answer = str(summary.get("final_answer", "")).strip()
    if final_answer:
        lines.extend(["final_answer:", f"  {final_answer}"])

    event_counts = summary.get("event_counts", {})
    if event_counts:
        lines.append("event_counts:")
        for key in sorted(event_counts):
            lines.append(f"  {key}: {event_counts[key]}")
    return "\n".join(lines)


def render_run_catalog(trace_path: Path, grouped_events: dict[str, list[JsonDict]]) -> str:
    lines = [f"trace_file: {trace_path}"]
    for run_id in sorted(grouped_events):
        summary = summarize_run(run_id, grouped_events[run_id])
        lines.append(
            " | ".join(
                [
                    run_id,
                    f"status={summary['status']}",
                    f"steps={len(summary['steps'])}",
                    f"tool_calls={len(summary['tool_names'])}",
                    f"duplicates={summary['duplicate_tool_calls']}",
                ]
            )
        )
    return "\n".join(lines)


def render_mermaid_sequence(run_id: str, events: list[JsonDict]) -> str:
    lines = ["sequenceDiagram", f"    autonumber", f"    participant U as User", f"    participant A as Agent", f"    participant M as Model", f"    participant T as Tools"]

    prompt = ""
    for event in events:
        if event.get("event") == "run_started":
            prompt = str(event.get("prompt", "")).strip()
            break
    if prompt:
        lines.append(f"    U->>A: {sanitize_mermaid_text(prompt)}")

    for event in events:
        event_type = str(event.get("event"))
        step = event.get("step")
        step_label = f"step {step}" if isinstance(step, int) else "runtime"
        if event_type == "llm_request":
            lines.append(f"    A->>M: {step_label} request")
        elif event_type == "llm_response":
            lines.append(f"    M-->>A: {step_label} response ({event.get('response_ms', '?')}ms)")
        elif event_type == "tool_call":
            tool_name = sanitize_mermaid_text(str(event.get("tool_name", "tool")))
            lines.append(f"    A->>T: {step_label} {tool_name}")
        elif event_type == "tool_result":
            tool_name = sanitize_mermaid_text(str(event.get("tool_name", "tool")))
            ok = "ok" if bool(event.get("result", {}).get("ok", False)) else "error"
            lines.append(f"    T-->>A: {step_label} {tool_name} ({ok})")
        elif event_type == "tool_call_duplicate":
            tool_name = sanitize_mermaid_text(str(event.get("tool_name", "tool")))
            reused_from = sanitize_mermaid_text(str(event.get("reused_from_tool_call_id", "previous")))
            lines.append(f"    Note over A,T: {step_label} reuse {tool_name} from {reused_from}")
        elif event_type == "final_answer":
            answer = sanitize_mermaid_text(str(event.get("answer", "")))
            lines.append(f"    A-->>U: {answer}")
        elif event_type == "run_failed":
            error_text = sanitize_mermaid_text(str(event.get("error", "error")))
            lines.append(f"    A-->>U: failed - {error_text}")

    lines.append(f"    Note over A: run_id {sanitize_mermaid_text(run_id)}")
    return "\n".join(lines)


def sanitize_mermaid_text(text: str) -> str:
    compact = " ".join(text.split())
    return compact.replace("|", "/").replace("{", "(").replace("}", ")").replace("\"", "'")[:180]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Trace analysis tools for the handmade agent transparency workflow.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    list_runs = subparsers.add_parser("list-runs", help="List all run_ids in a trace file.")
    list_runs.add_argument("trace_file")

    summary = subparsers.add_parser("summary", help="Show a compact summary for one run.")
    summary.add_argument("trace_file")
    summary.add_argument("--run-id")

    mermaid = subparsers.add_parser("mermaid", help="Render a Mermaid sequence diagram for one run.")
    mermaid.add_argument("trace_file")
    mermaid.add_argument("--run-id")

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    trace_path = Path(args.trace_file).resolve()
    events = load_events(trace_path)
    grouped_events = group_events_by_run(events)

    if args.command == "list-runs":
        print(render_run_catalog(trace_path, grouped_events))
        return

    run_id = choose_run_id(grouped_events, getattr(args, "run_id", None))
    run_events = grouped_events[run_id]

    if args.command == "summary":
        print(render_summary_text(summarize_run(run_id, run_events)))
        return

    if args.command == "mermaid":
        print(render_mermaid_sequence(run_id, run_events))
        return

    raise ValueError(f"unsupported command: {args.command}")


if __name__ == "__main__":
    main()