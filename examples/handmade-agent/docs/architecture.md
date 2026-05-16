# Architecture

```mermaid
flowchart LR
  user["Developer"] --> runtime["Agent runtime"]
  runtime --> tools["Tool registry"]
  runtime --> model["Model client"]
  runtime --> trace["Trace recorder"]
  trace --> viewers["Trace / code-map viewers"]
  tools --> gates["Quality gates"]
```

## Main modules

| Module | Purpose |
| --- | --- |
| `runtime.py` | Agent loop and model/tool execution |
| `tools.py` | Tool registry and safety gates |
| `trace.py` | Trace recording and replay |
| `scripts` | Architecture map and trace tooling |

