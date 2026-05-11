# Agent lecture architecture

```mermaid
graph TD
  Source[Lecture notes and references] --> Scripts[Python processing scripts]
  Scripts --> KG[Knowledge graph JSON]
  Scripts --> Assets[Generated diagrams]
  KG --> UI[React + Vite app]
  Assets --> UI
  UI --> Browser[Interactive lecture]
```

## Components

| Component | Role |
| --- | --- |
| `src/` | React presentation UI |
| `scripts/` | Knowledge graph and diagram generation helpers |
| `knowledge_graph.json` | Static knowledge graph consumed by the UI |
| `public/` | Static icons and browser assets |

## Cleanup notes

Runtime/generated databases and test output are not part of the standardized public `main` branch.
