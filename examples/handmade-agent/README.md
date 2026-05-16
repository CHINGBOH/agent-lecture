# Handmade Agent Transparency Kit

This repository exists to make a local coding agent as transparent as possible for study, debugging, and architectural learning.

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for the Mermaid system overview.

The core idea is simple: do not hide the agent loop behind a black box. Every important layer should be inspectable:

- runtime flow
- tool routing
- quality gates
- model requests and responses
- trace replay artifacts
- code architecture maps

## Repository Role

This repository is the standalone package-level core for the handmade agent. In the larger workspace, the current CLI runner lives at `../handmade_coding_agent.py`, while this repository holds the runtime, tool system, tracing, and now the transparency tooling.

## Core Modules

- `runtime.py`: agent loop, model exchange, tool execution flow, duplicate tool-call reuse
- `tools.py`: tool registry, workspace guard, command policy, quality gate runner
- `server.py`: local llama.cpp lifecycle and GPU-layer heuristics
- `trace.py`: JSONL event recorder and quality-gate summary extraction

## Built-In Transparency Tools

### 1. Trace CLI

Use the trace CLI to inspect existing JSONL traces.

```bash
cd /home/l/agent/handmade_agent
/home/l/agent/.venv/bin/python scripts/trace_tools.py list-runs /home/l/agent/traces-full-smoke/handmade-agent-20260427-193909-867763.jsonl
/home/l/agent/.venv/bin/python scripts/trace_tools.py summary /home/l/agent/traces-full-smoke/handmade-agent-20260427-193909-867763.jsonl
/home/l/agent/.venv/bin/python scripts/trace_tools.py mermaid /home/l/agent/traces-full-smoke/handmade-agent-20260427-193909-867763.jsonl
```

What it gives you:

- run catalog
- per-run summary
- quality gate totals
- duplicate tool-call count
- Mermaid sequence diagram text

### 2. Architecture Mapper

Use the architecture mapper to generate a static repository map.

```bash
cd /home/l/agent/handmade_agent
/home/l/agent/.venv/bin/python scripts/architecture_map.py summary
/home/l/agent/.venv/bin/python scripts/architecture_map.py mermaid
```

What it gives you:

- module inventory
- class/function index
- local import graph
- Mermaid dependency diagram

### 3. Static Trace Viewer

Open `docs/trace_viewer.html` in a browser, load a JSONL trace file, and inspect:

- run summaries
- quality gate cards
- event timeline
- per-step event breakdown
- duplicate tool-call reuse markers

This viewer is offline and file-based. It does not need a build step.

### 4. Agent Body Viewer

Open `docs/agent_body_viewer.html` in a browser, load an architecture JSON file plus a JSONL trace, and inspect the agent as a visible virtual person:

- LLM brain
- runtime spine
- trace heart
- Python arm
- external tool arm
- model breath
- voice bubble with final answer

This viewer is offline and file-based. It turns the agent from an abstract loop into a visible body that lights up during real runs.

## Recommended Learning Workflow

1. Run the agent with tracing enabled.
2. Open the JSONL trace in `docs/trace_viewer.html`.
3. Open `docs/agent_body_viewer.html` to see the virtual body light up from the same trace.
4. Generate a CLI summary with `scripts/trace_tools.py summary ...`.
5. Generate a Mermaid runtime sequence with `scripts/trace_tools.py mermaid ...`.
6. Generate a static architecture graph with `scripts/architecture_map.py mermaid`.
7. Compare the runtime trace, body view, and static module map in `ARCHITECTURE.md`.

## Transparency Surfaces

The current runtime already records these event families:

- server lifecycle
- run lifecycle
- LLM request and response
- tool call and tool result
- duplicate tool-call reuse
- quality gate summaries
- final answer
- failure path

The current HTML transparency surfaces are:

- `docs/trace_viewer.html`
- `docs/code_map_viewer.html`
- `docs/agent_body_viewer.html`

## Why This Exists

This is not just a coding utility. It is a study repository for understanding how a local agent works end to end:

- how prompts become tool calls
- how tool calls become subprocesses and file edits
- how validation gates shape agent behavior
- how traces can be turned into maps, diagrams, and replay material

## Next Natural Expansions

- trace replay CLI
- richer HTML timeline filtering
- automatic Mermaid export files
- data-routing diagrams derived from traces
- educational walkthroughs linked to concrete traces
