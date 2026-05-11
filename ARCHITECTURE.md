# Agent 全栈深度解析 —— 内容架构 V3.0

## 核心理念：洋葱模型 + 多故事线
从最外层的多种故事入口开始，每剥一层就深入一个技术抽象层级，直到内核 JMP，再回到应用层。

```
主线：技术深度递进（Layer 0-5）
辅线1：金庸武侠系列（射雕、倚天、笑傲）
辅线2：生活场景类比（餐厅、公司）
```

```
Layer 0: 多故事线入口（故事入口／比喻层） ← 浅出
Layer 1: LLM 训练（模型层）
Layer 2: Runtime 内核（操作系统内核）
Layer 3: Agent 操作系统
Layer 4: 多 Agent 编排
Layer 5: 实战与工具         ← 深入
```

---

## 🏛️ 完整内容架构

### Layer 0: 🎭 多故事线入口（故事入口／比喻层）
> "从故事到代码" 的桥梁 —— 多种比喻方式，总有一种适合你

#### 主线：技术深度递进
所有故事线都映射到相同的技术概念，只是比喻方式不同。

#### 辅线1：金庸武侠系列

| 故事线 | 核心比喻 | 技术映射 |
|--------|---------|---------|
| 🏹 射雕英雄传 | 郭靖成长史 | LLM 训练全流程（数据→预训练→SFT→RLHF→评估） |
| ⚔️ 倚天屠龙记 | 张无忌学九阳神功 | 模型架构演进（Transformer→Attention→多层网络→LoRA） |
| 🎸 笑傲江湖 | 令狐冲学独孤九剑 | Agent 能力构建（Skill系统→Auto-Routing→Multi-Agent） |

#### 辅线2：生活场景类比

| 场景 | 核心比喻 | 技术映射 |
|------|---------|---------|
| 🍽️ 餐厅运营 | 餐厅日常运营 | Agent 系统（领班=Orchestrator，厨师=Agent，菜谱=Skill） |
| 🏢 公司运营 | 公司组织架构 | Multi-Agent 系统（CEO=Orchestrator，部门经理=Agent，员工=Tool） |

**功能设计**：
- 🃏 **故事线选择器**：选择喜欢的故事线（金庸武侠/生活场景）
- 📖 **故事内容展示**：技术概念与比喻的对照展示
- 🗺️ **场景地图**：交互式场景导航，点场景跳转技术实现
- 📊 **完整映射表**：所有 technical ↔ 比喻 对应关系
- 💻 **代码对比组件**：生活场景代码类比 vs 技术实现代码

---

### Layer 1: 🧠 LLM 前世今生（模型训练层）
> 从数据到模型的完整生命周期

| 章节 | 内容 | 技术深度点 |
|------|------|-----------|
| 1.1 数据江湖 | 爬取→清洗→去重→过滤 (10TB→1TB) | MinHash LSH, Perplexity 阈值, Data Dedup |
| 1.2 标注与标准 | SFT / RLHF / 安全对齐 | 人工标注流程, Pairwise Ranking, Red Teaming |
| 1.3 训练三部曲 | Pre-training → SFT → RLHF → FT | 学习率调度, Loss 曲线, 各阶段数据量 |
| 1.4 Tokenizer 内幕 | BPE / WordPiece / SentencePiece | Byte-level BPE, Vocab 构建, Special Tokens |
| 1.5 高维张量空间 | Embedding → Attention → FFN → LayerNorm | QKV 计算, 多头注意力, 残差连接 |
| 1.6 Transformer 架构 | Encoder vs Decoder vs Encoder-Decoder | GPT vs BERT vs T5 架构对比 |
| 1.7 梯度下降之旅 | 反向传播 → AdamW → LoRA | 链式法则, 动量, Weight Decay, 低秩适配 |
| 1.8 解码生成 | Greedy → Beam → Top-k → Top-p → Temperature | Logits 处理, 采样策略, 随机性控制 |
| 1.9 结构化输出 | JSON Schema → Constrained Decoding → Tool Call | FSM 状态机, Logits Mask, Grammar Constraints |
| 1.10 模型评估 | Perplexity → Benchmarks → Human Eval | MMLU, HumanEval, MT-Bench, 评估方法论 |

**新增深度内容**：
- Tokenizer 训练过程可视化（BPE merge 动画）
- Transformer Block 逐层可视化（Layer depth slider 增强）
- 不同模型的架构对比表（GPT vs LLaMA vs Qwen vs Claude）
- LoRA fine-tune 的数学推导简化展示

---

### Layer 2: ⚙️ Runtime 内核（操作系统内核层）
> **核心改造层** —— 从"裸 Runtime"到"操作系统进程模型"
> 这是整个课程最硬核的部分，"深入操作系统到内核到jmp"的精髓

| 章节 | 内容 | 技术深度点 | 牛家村比喻 |
|------|------|-----------|-----------|
| 2.1 Tick 主循环 | Heartbeat 时钟节拍 | Event Loop, Polling, Timer-Driven | 心跳每拍检查战局 |
| 2.2 JMP 跳转语义 | Program Counter 级别跳转 vs 函数调用 | GOTO vs CALL, State Phase Transition | 招式切换：防守→破绽→进攻 |
| 2.3 State 全息快照 | 可序列化的完整状态 | Deep Copy, Serialization, Checksum | 脑海中的当前战局快照 |
| 2.4 Channel 总线 | FIFO 异步通信队列 | Bounded Buffer, Backpressure, MPMC | 信鸽传书：发信→等待→收信→回复 |
| 2.5 内存层次结构 | Context Window → Vector DB → Summarizer | 短期/中期/长期记忆, RAG 检索 | 脑海→密室图谱→秘籍摘要 |
| 2.6 ACL 与安全 | Rule Engine 作为内核安全策略 | Tick 前加载 Rules, ACL Passthrough 检查 | 江湖规矩：出招前先想"犯规吗" |
| 2.7 Checkpoint / Rollback | 事务性回滚机制 | Snapshot Chain, SHA256 防篡改 | "停！记得局势，不行退回重来" |
| 2.8 Tick 调度策略 | 协作式 vs 抢占式调度 | Cooperative Scheduling, Time Slicing | 洪七公分配时间片：每人打三招 |
| 2.9 并发与异步 | Tick 内的异步工具执行 | Async/Await, Promise Chain, Timer | 发射信号弹等援军，不阻塞当前招式 |
| 2.10 中断与异常 | 错误处理与恢复 | Panic Recovery, Circuit Breaker, Retry | 中了毒针（异常）→切换到疗伤模式 |

**新增交互**：
- 🔄 **Tick 可视化模拟器**：实时展示 Tick 循环过程，可手动 step-through
- 🎯 **JMP Diagram**：State 转换图，点击实验不同路径
- 💾 **State 查看器**：查看/编辑当前 State 的 JSON 快照
- ⚡ **Channel 状态监视器**：实时显示队列长度、吞吐量

---

### Layer 3: 🏢 Agent 操作系统
> 在裸 Runtime 之上构建"可调度的 Agent OS"

| 章节 | 内容 | 技术深度点 | 牛家村比喻 |
|------|------|-----------|-----------|
| 3.1 四层金字塔 | Rule → Skill → Agent → Workflow | 操作系统分层类比 | 江湖规矩→秘籍→高手→布阵图 |
| 3.2 Rule 引擎 | 内核安全策略加载与执行 | GEMINI.md, Auto-Routing.md 执行 | 全真教门规，Tick 前加载 |
| 3.3 Skill 系统 | 动态链接库 .so 按需加载 | dlopen, Lazy Loading, Skill 注册表 | 从书架抽秘籍现翻现用 |
| 3.4 Agent 进程模型 | State Clone + 独立 Tool Set | fork(), COW, Process Isolation | 武林高手各有所长 |
| 3.5 Orchestrator | 总调度器 | Process Manager, Resource Allocator | 洪七公：不亲自打，调度全局 |
| 3.6 Auto-Routing | 中断向量表 | Keyword Hashing → IVT → JMP Handler | 江湖暗号：天王盖地虎→找谁 |
| 3.7 Workflow 调度器 | 预编排 JMP 地址链 | Workflow DAG, Phase Transition | 行兵布阵图：探路→布阵→攻城→善后 |
| 3.8 PDCA 生命周期 | Plan → Do → Check → Act | State Machine Cycle, Quality Gate | 练功循环：想招→出招→看打中没→调整 |
| 3.9 Skill 组合与冲突 | 同名 Skill 覆盖, 优先级 | Dependency Resolution, Versioning | 不同门派武功冲突 |
| 3.10 进程间通信 | Agent ↔ Agent 消息传递 | Channel Routing, Message Protocol | 信鸽驿站网络 |

**新增交互**：
- 🏛️ **进程树可视化**：Orchestrator fork 出的 Agent 进程树，可折叠展开
- 🔌 **Skill 加载模拟器**：显示 dlopen 加载/卸载 Skill 的过程
- 🗺️ **Workflow DAG 编辑器**：可视化编辑 Workflow 阶段和跳转
- 🎮 **Auto-Routing 模拟器**：输入不同请求，观察路由路径

---

### Layer 4: 🌐 多 Agent 编排（分布式计算层）
> **新增层** —— 从单机操作系统到分布式系统

| 章节 | 内容 | 技术深度点 |
|------|------|-----------|
| 4.1 分布式 Agent | 跨进程/跨机器 Agent 通信 | gRPC, Message Broker, Service Discovery |
| 4.2 Consensus | 多 Agent 共识机制 | RAFT, Paxos, 投票/仲裁 |
| 4.3 容错与恢复 | Agent 崩溃 → 其他 Agent 接管 | Heartbeat, Leader Election, Failover |
| 4.4 资源竞争 | 多个 Agent 竞争同一工具 | Mutex, Semaphore, Distributed Lock |
| 4.5 事件驱动 | 基于事件的 Agent 激活 | Event Bus, Pub/Sub, Webhook |
| 4.6 工作流编排 | 复杂 DAG 工作流 | LangGraph, Temporal, Durable Execution |
| 4.7 监控与观测 | 全链路追踪 | OpenTelemetry, Tracing, Metrics |

---

### Layer 5: 🛠️ 实战工具与扩展
> **新增层** —— 从理论到实践

| 章节 | 内容 |
|------|------|
| 5.1 MCP 协议 | Model Context Protocol 详解 |
| 5.2 ACP 协议 | Agent Communication Protocol |
| 5.3 Sandbox 沙箱 | 安全执行环境 |
| 5.4 测试与评估 | Eval 方法论 |
| 5.5 Playground | 交互式实验区 |

---

## 🗄️ 数据库架构（SQLite + SQLAlchemy）

```sql
-- 内容表
CREATE TABLE content_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    layer INTEGER NOT NULL,
    section_key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT,           -- Markdown 内容
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 映射表（技术 ↔ 江湖）
CREATE TABLE mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tech_concept TEXT NOT NULL,
    jianghu_role TEXT NOT NULL,
    scene TEXT,
    explanation TEXT,
    layer INTEGER,
    link_to_tech TEXT
);

-- 人物表
CREATE TABLE characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    avatar_emoji TEXT,
    description TEXT,
    tech_link TEXT,
    layer_link INTEGER
);

-- 场景表
CREATE TABLE scenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    events TEXT  -- JSON array
);

-- 伪代码表
CREATE TABLE code_snippets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    code TEXT NOT NULL,
    language TEXT DEFAULT 'go',
    layer INTEGER
);

-- 用户笔记表
CREATE TABLE user_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_key TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 UI 设计原则

| 元素 | 风格 |
|------|------|
| 主字体 | Noto Serif SC（中文衬线，古风） |
| 代码字体 | JetBrains Mono |
| 主色调 |  parchment 羊皮纸背景 + 各层主题色 |
| Layer 0 | 🗡️ 朱红 #8b2500 |
| Layer 1 | 🧠 深蓝 #1a365d |
| Layer 2 | ⚙️ 翡翠 #2d5a3d |
| Layer 3 | 🏛️ 金色 #b8860b |
| Layer 4 | 🌐 紫色 #6a1b9a |
| Layer 5 | 🛠️ 橙色 #e65100 |
| 动画 | Framer Motion，逐元素淡入 |
| 搜索 | 全局搜索，跨层检索 |

## 📐 页面技术架构

```
agent-lecture/
├── backend/                # FastAPI 后端
│   ├── main.py            # API 入口
│   ├── models.py          # SQLAlchemy 模型
│   ├── database.py        # 数据库连接
│   └── seed_data.py       # 初始化种子数据
├── src/
│   ├── components/
│   │   ├── layers/         # 各层组件
│   │   │   ├── Layer0/     # 牛家村江湖
│   │   │   ├── Layer1/     # LLM 前世今生
│   │   │   ├── Layer2/     # Runtime 内核
│   │   │   ├── Layer3/     # Agent 操作系统
│   │   │   ├── Layer4/     # 多 Agent 编排
│   │   │   └── Layer5/     # 实战工具
│   │   ├── animations/     # 动画组件
│   │   ├── visualizers/    # 交互式可视化
│   │   └── common/         # 通用组件
│   ├── data/               # 数据层（可切换 DB 或本地）
│   └── hooks/              # 自定义 hooks
└── ...
```

## 🚀 实现路线图

1. **Phase 1** — 内容架构重构 + Layer 2 深度深化（当前）
2. **Phase 2** — 后端 + 数据库 + API
3. **Phase 3** — Layer 4 & 5 新增层
4. **Phase 4** — 交互式可视化组件
5. **Phase 5** — Playground 实验区
