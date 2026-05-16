# Architecture Map

This document explains the handmade agent as both a codebase and a learning system.

## Layer View

### Layer 1: Runtime Loop

- `runtime.py`
- owns the main conversation loop
- sends requests to the model
- parses native tool calls or JSON fallback calls
- records trace events
- reuses duplicate tool calls inside the same model response

### Layer 2: Tool and Policy Layer

- `tools.py`
- owns tool registration, schema validation, path boundaries, command allowlists, and quality gates
- this is where filesystem actions and subprocess execution become safe enough to expose for learning

### Layer 3: Model Server Layer

- `server.py`
- owns local llama.cpp startup, readiness checks, and shutdown

### Layer 4: Trace and Observability Layer

- `trace.py`
- owns JSONL event recording and quality-gate summarization
- this is the backbone of replay, visualization, and runtime teaching tools

## Static Module Graph

```mermaid
flowchart LR
    init["__init__"]
    runtime["runtime\nagent loop + llm exchange + tool orchestration"]
    tools["tools\nregistry + guard + command policy + quality gate"]
    trace["trace\njsonl recorder + quality gate summary"]
    server["server\nllama.cpp lifecycle + health checks"]

    init --> runtime
    init --> tools
    init --> trace
    init --> server
    runtime --> tools
    runtime --> trace
    trace --> tools
```

## Runtime Data Route

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant Agent as HandmadeCodingAgent
    participant Model as llama.cpp
    participant ToolLayer as ToolRegistry/WorkspaceTools
    participant Trace as TraceRecorder

    User->>Agent: prompt
    Agent->>Trace: run_started
    Agent->>Model: llm_request
    Model-->>Agent: llm_response
    Agent->>Trace: llm_response

    alt model returns tool calls
        Agent->>ToolLayer: validate + execute tool
        ToolLayer-->>Agent: tool_result
        Agent->>Trace: tool_call / tool_result / quality_gate
        Agent->>Model: follow-up request with tool result
    else model returns final answer
        Agent->>Trace: final_answer
        Agent-->>User: answer
    end

    Agent->>Trace: run_finished
```

## Agent As A Virtual Person

This repository can also be explained as a visible virtual body rather than only as a module graph.

- brain: `runtime.py` LLM exchange, planning, and tool choice
- spine: `runtime.py` run loop and orchestration
- heart: `trace.py` JSONL pulse and replay memory
- left arm: `tools.py` local Python actions
- right arm: `tools.py` plus external validators and quality gates
- breath: `server.py` llama.cpp lifecycle
- voice: final user-facing answer emitted by the runtime

```mermaid
flowchart TD
    User([User]) --> Brain(("LLM Brain"))
    Brain --> Spine["Runtime Spine"]
    Spine --> Heart["Trace Heart"]
    Spine --> LeftArm["Python Arm"]
    Spine --> RightArm["External Tool Arm"]
    Brain --> Breath["Model Breath"]
    Spine --> Voice["Voice / Final Answer"]
    LeftArm --> Workspace[(Workspace Files)]
    RightArm --> Validators[(Validators and Tools)]
    Heart --> Viewers["Trace Viewer + Code Map Viewer + Agent Body Viewer"]
```

## Quality Gate Route

```mermaid
flowchart TD
    input["selected file or directory"] --> pycompile["py_compile"]
    input --> ruff["ruff"]
    input --> pytest["pytest"]
    input --> bandit["bandit"]
    input --> radon["radon"]
    input --> vulture["vulture"]
    input --> trivy["trivy fs"]
    input --> gitdiff["git diff --stat"]

    pytest --> summary["quality_gate summary"]
    bandit --> summary
    radon --> summary
    vulture --> summary
    trivy --> summary
    pycompile --> summary
    ruff --> summary
    gitdiff --> summary

    summary --> traceevent["quality_gate trace event"]
```

## Transparency Assets in This Repository

- `scripts/trace_tools.py`: parse trace, summarize run, emit Mermaid sequence
- `scripts/architecture_map.py`: inspect modules and emit Mermaid dependency graph
- `docs/trace_viewer.html`: offline trace viewer for learners
- `docs/code_map_viewer.html`: offline code and route anatomy viewer
- `docs/agent_body_viewer.html`: offline virtual-person viewer that lights up organs from real traces

## What This Repository Teaches Well

- how a local agent loop really works
- how tool safety is enforced
- how quality gates shape the execution path
- how structured traces can be turned into visual explanations

## Current Gaps

- no full trace replay engine yet
- no interactive breakpoint/pause mode yet
- no live streaming dashboard yet
- no automatic architecture graph export pipeline yet
