# RAG 知识库 — agent-lecture

## 概览

给 AI 讲师助手挂载的向量知识库，使用 Qdrant + BAAI/bge-m3 实现语义检索，支持中英文双语。

| 组件 | 说明 |
|------|------|
| 嵌入模型 | `BAAI/bge-m3` (1024 维，中英文双语) |
| 向量数据库 | Qdrant v1.8 (Docker) |
| Collection | `agent_lecture_kb` |
| 检索接口 | `retriever.py --serve` (HTTP on port 8765) |

## 数据源

| 类型 | 来源 | doc_type |
|------|------|----------|
| 幻灯片内容 | `src/data/slides/*.ts` | `slide_content` |
| 动手实战笔记 | `awesome-libs/Hands-On-Large-Language-Models/chapter*/` | `notebook` |
| GitHub 热榜 | `awesome-libs/Github-Ranking-AI/Top100/*.md` | `ranking_table` |
| LLM 资源列表 | `awesome-libs/awesome-llm/README.md` 等 | `awesome_list` |
| Agent 架构笔记 | `.agent/ARCHITECTURE.md`, `手搓agent.md` 等 | `agent_notes` |

> **金庸作品**：版权保护期至 2068 年（中国：著作权人去世后 50 年）。  
> 请将授权文本放入 `scripts/rag/user_data/jin_yong/` 后重新运行管道。  
> 参考 `schema.py` 中的 `JIN_YONG_SCHEMA_TEMPLATE`。

## 快速开始

```bash
# 1. 启动 Qdrant（已有 rag-qdrant 容器）
docker start rag-qdrant

# 2. 重新构建知识库（可选）
cd /path/to/agent-lecture
python3 scripts/rag/01_collect.py      # 采集 → raw_docs.jsonl
python3 scripts/rag/02_chunk.py        # 语义切块 → chunks.jsonl
HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 \
  python3 scripts/rag/03_embed_index.py --reset   # embed + 入库

# 3. 启动检索服务
HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 \
  python3 scripts/rag/retriever.py --serve --port 8765

# 4. 测试检索
python3 scripts/rag/retriever.py "什么是 Transformer 注意力机制"
```

## 架构

```
用户输入
    │
    ▼
useChat.ts (React)
    ├─ fetchRagContext() → GET http://127.0.0.1:8765/query?q=<message>&top_k=3
    │       │
    │       ▼
    │   retriever.py (HTTP server)
    │       │ bge-m3 embed query
    │       │ Qdrant /points/search
    │       └─ returns context string
    │
    ├─ 注入 context 到 systemPrompt
    │
    └─ POST DeepSeek API (stream)
            │
            ▼
        AI 回答（含知识库上下文）
```

## 脚本说明

| 文件 | 作用 |
|------|------|
| `config.py` | 路径、Qdrant、嵌入模型配置 |
| `schema.py` | `DocChunk` dataclass + 金庸模板 |
| `01_collect.py` | 从各数据源采集原始文本 |
| `02_chunk.py` | Markdown 结构切块 + 段落合并 |
| `03_embed_index.py` | bge-m3 embed + 写入 Qdrant（支持断点续传） |
| `retriever.py` | 查询封装 + HTTP 服务 |

## 切块策略

1. 按 Markdown 标题（`##` / `###`）分割为段落
2. 段落内按双换行拆分为更小的块
3. 贪心合并：将相邻小块合并，直到达到 `CHUNK_TARGET_CHARS`（默认 800 字）
4. 单个超长段落按句子边界切分，保留 100 字 overlap

## 检索 API

```
GET http://127.0.0.1:8765/query
  ?q=<question>          必填，自然语言查询
  &top_k=5               可选，返回条数（默认 5）
  &max_chars=2000        可选，context 字符限制（默认 2000）

Response:
{
  "results": [
    {
      "content": "...",
      "title": "...",
      "source_file": "...",
      "doc_type": "slide_content|notebook|...",
      "section_path": ["Chapter 2", "Attention"],
      "score": 0.612,
      "language": "zh|en|bilingual",
      "tags": [...]
    }
  ],
  "context": "[知识库检索结果 / Retrieved context]\n--- [1] ..."
}
```
