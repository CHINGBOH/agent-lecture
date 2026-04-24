// ============================================================
// SQLite 数据库层 —— 所有内容数据存储在浏览器端 SQLite
// ============================================================
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';

let db: SqlJsDatabase | null = null;

// 数据库版本，用于迁移
const DB_VERSION = 3;

export async function getDb(): Promise<SqlJsDatabase> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file: string) => `/sql-wasm.wasm`,
  });

  // 尝试从 localStorage 恢复
  const saved = localStorage.getItem('agent-lecture-db');
  if (saved) {
    const buffer = Uint8Array.from(atob(saved), (c) => c.charCodeAt(0));
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // 运行迁移
  await runMigrations(db);
  return db;
}

async function runMigrations(database: SqlJsDatabase) {
  const version = database.exec("PRAGMA user_version")[0]?.values[0]?.[0] ?? 0;

  if (version < 1) {
    database.run(`
      CREATE TABLE IF NOT EXISTS content_sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        layer INTEGER NOT NULL,
        section_key TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        subtitle TEXT,
        content TEXT,
        order_index INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS mappings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tech_concept TEXT NOT NULL,
        jianghu_role TEXT NOT NULL,
        scene TEXT,
        explanation TEXT,
        layer INTEGER,
        link_to_tech TEXT
      );

      CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        avatar_emoji TEXT,
        description TEXT,
        skills TEXT,
        tech_link TEXT,
        layer_link INTEGER
      );

      CREATE TABLE IF NOT EXISTS scenes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        events TEXT
      );

      CREATE TABLE IF NOT EXISTS code_snippets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        code TEXT NOT NULL,
        language TEXT DEFAULT 'go',
        layer INTEGER
      );

      CREATE TABLE IF NOT EXISTS concepts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        layer INTEGER NOT NULL,
        name TEXT NOT NULL,
        category TEXT,
        detail TEXT,
        analogy TEXT,
        order_index INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS user_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section_key TEXT,
        content TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      PRAGMA user_version = 1;
    `);
  }

  if (version < 2) {
    // Layer 2 深化内容：Runtime 内核概念
    database.run(`
      CREATE TABLE IF NOT EXISTS kernel_concepts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        detail TEXT,
        code_example TEXT,
        mermaid_diagram TEXT,
        analogy TEXT,
        order_index INTEGER DEFAULT 0
      );
      PRAGMA user_version = 2;
    `);
  }

  if (version < 3) {
    // 新增 Layer 4 (Multi-Agent) 和 Layer 5 (Tools/Playground)
    database.run(`
      CREATE TABLE IF NOT EXISTS playground_examples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        config TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      PRAGMA user_version = 3;
    `);
  }
}

// ============================================================
// Schema 初始化 + 种子数据
// ============================================================
export async function seedDatabase() {
  if (!db) throw new Error('Database not initialized');

  const count = db.exec("SELECT COUNT(*) as c FROM content_sections")[0]?.values[0]?.[0] ?? 0;
  if (count > 0) return; // 已有数据，不重复插入

  // ========== 内容章节 ==========
  const sections = [
    // Layer 0: 牛家村江湖（故事入口）
    [0, 'scene-section', '🎪 牛家村场景选择', '选择场景，进入江湖', 0],
    [0, 'char-section', '🎭 江湖人物志', '射雕人物 ↔ 技术组件 一一对应', 1],
    [0, 'story-section', '📖 剧情回放：/create = 蒙古军营攻略', 'Workflow 映射为江湖战役', 2],
    [0, 'map-section', '🗺️ 完整映射表', '技术 ↔ 江湖 全部对应关系', 3],

    // Layer 1: LLM 前世今生（模型训练层）
    [1, 'data-section', '📊 数据江湖：从 10TB 到 1TB', '爬取 → 清洗 → 去重 → 质量过滤', 0],
    [1, 'annotation-section', '🏷️ 标注与标准：教模型"什么是对"', 'SFT / RLHF / 安全对齐', 1],
    [1, 'training-section', '🧠 训练三部曲', 'Pre-training → SFT → RLHF → Function Calling FT', 2],
    [1, 'tokenizer-section', '🔤 Tokenizer 内幕', 'BPE / WordPiece / SentencePiece', 3],
    [1, 'tensor-section', '📐 高维张量空间', 'Embedding → Attention → FFN → LayerNorm', 4],
    [1, 'gradient-section', '⛰️ 梯度下降：模型如何学习', '反向传播 → AdamW → LoRA', 5],
    [1, 'decoding-section', '🎲 解码生成：从 logits 到文本', 'Greedy → Beam → Top-k → Top-p → Temperature', 6],
    [1, 'json-section', '📋 结构化输出与 Tool Call', 'JSON Schema → Constrained Decoding → Tool Call', 7],

    // Layer 2: Runtime 内核（最深入层）
    [2, 'tick-concept', '💓 Tick 主循环：操作系统的心跳', '事件循环、时钟驱动、Phase 切换', 0],
    [2, 'jmp-concept', '🎯 JMP 跳转语义：PC 级状态跃迁', 'GOTO vs CALL, 状态转换图', 1],
    [2, 'state-concept', '💾 State 全息快照', '序列化、Deep Copy、Checksum 防篡改', 2],
    [2, 'channel-concept', '📨 Channel 总线：异步通信队列', 'FIFO、背压、MPMC、Context Window', 3],
    [2, 'memory-concept', '🧠 内存层次：从脑海到密室图谱', '短期/中期/长期记忆 + RAG 检索 + Summarizer', 4],
    [2, 'acl-concept', '🛡️ ACL 与 Rule 引擎：内核安全', 'Tick 前加载 Rules, ACL Passthrough', 5],
    [2, 'checkpoint-concept', '⏪ Checkpoint / Rollback：时间旅行', 'Snapshot Chain, 事务性回滚, SHA256', 6],
    [2, 'schedule-concept', '⏱️ Tick 调度：时间片与抢占', '协作式 vs 抢占式, Time Slicing', 7],
    [2, 'async-concept', '⚡ 并发与异步：不阻塞的心跳', 'Async/Await, Promise Chain, Timer', 8],
    [2, 'interrupt-concept', '🚨 中断与异常：高速路上的安全出口', 'Panic Recovery, Circuit Breaker, Retry', 9],

    // Layer 3: Agent 操作系统
    [3, 'arch-section', '🏛️ Agent 操作系统：四层金字塔', 'Rule → Skill → Agent → Workflow', 0],
    [3, 'pdca-section', '🔄 PDCA 循环：质量管理闭环', 'Plan → Do → Check → Act', 1],
    [3, 'routing-section', '🔀 Auto-Routing：中断向量表', '关键词哈希 → IVT → JMP Handler', 2],
    [3, 'fork-section', '🐣 多 Agent Fork：进程克隆', 'fork() State Clone, 独立 Tool Set', 3],
    [3, 'skill-section', '🔧 Skill 系统：动态链接库', 'dlopen 按需加载, Skill 注册表', 4],
    [3, 'workflow-section', '📋 Workflow 调度器：JMP 地址链', '预编排 DAG, Phase 跃迁', 5],
    [3, 'ipc-section', '📡 进程间通信：Agent ↔ Agent', 'Channel Routing, 消息协议', 6],

    // Layer 4: 多 Agent 编排（新增）
    [4, 'distributed-concept', '🌐 分布式 Agent', '跨进程/跨机器通信, Service Discovery', 0],
    [4, 'consensus-concept', '🤝 共识机制', 'RAFT, Leader Election, 投票仲裁', 1],
    [4, 'fault-tolerance', '🛡️ 容错与恢复', 'Heartbeat, Failover, 自愈', 2],
    [4, 'event-driven', '📨 事件驱动架构', 'Event Bus, Pub/Sub, Webhook', 3],
    [4, 'monitoring', '📊 监控与观测', 'OpenTelemetry, Tracing, Metrics', 4],

    // Layer 5: 实战与 Playground（新增）
    [5, 'mcp-section', '🔌 MCP 协议', 'Model Context Protocol', 0],
    [5, 'sandbox-section', '📦 Sandbox 沙箱', '安全执行环境', 1],
    [5, 'eval-section', '📝 测试与评估', 'Eval 方法论', 2],
    [5, 'playground', '🎮 Playground 实验区', '交互式实验', 3],
  ];

  const insertSection = db.prepare(
    'INSERT INTO content_sections (layer, section_key, title, subtitle, order_index) VALUES (?, ?, ?, ?, ?)'
  );
  for (const s of sections) {
    insertSection.run(s);
  }
  insertSection.free();

  // ========== 人物 ==========
  const characters = [
    ['郭靖', 'LLM / 大模型', '🧑‍🌾', '内力深厚但需指令，本质是海量参数经过训练后的概率分布。在黄蓉(System Prompt)指导下出招。', '降龙十八掌(Tool Call),九阴真经(Fine-tune)', 'LLMTraining', 1],
    ['黄蓉', 'System Prompt / Runtime', '👩‍🎓', '聪明绝顶，负责给郭靖指令、检查招式是否合规(Rule)、加载武功秘籍(Skill)、传递信鸽(Channel)。', '打狗棒法(Rule Engine),奇门遁甲(Auto-Routing)', 'RuntimeTick', 1],
    ['洪七公', 'Orchestrator / OS 内核', '👴', '北丐，不亲自出手，而是调度全局。fork()创建各路高手进程，按Workflow布阵图指挥战役。', '降龙十八掌总指挥,逍遥游(Workflow调度)', 'MultiAgentFork', 3],
    ['欧阳锋', 'Security Auditor', '🐍', '西毒，专精攻防。审查代码漏洞、测试渗透、确保没有硬编码密钥混入。', '蛤蟆功(Penetration Test),毒蛇阵(Vuln Scan)', 'AgentArchitecture', 3],
    ['周伯通', 'Function Calling Trainer', '🤪', '老顽童，逼郭靖背诵固定格式的招式口诀。对应模型训练中强制输出结构化JSON的阶段。', '左右互搏(Multi-task),空明拳(Constrained Decoding)', 'ConstrainedDecoding', 1],
    ['丘处机', 'Quality Inspector', '⚔️', '全真教掌门，铁面无私。最终质量门，不通过则强制回滚。独立于洪七公的调度。', '全真剑法(Code Review),天罡北斗阵(Test Suite)', 'PDCACycle', 3],
    ['江南七怪', '数据 Pipeline', '👥', '七位师傅各自教基本功——如同数据清洗的七个步骤：爬取、去重、清洗、过滤、标注、格式化、质检。', '爬取(Collect),清洗(Clean),去重(Dedup)', 'DataPipeline', 1],
    ['马钰', 'SFT 指令微调', '🧘', '全真教掌教，教郭靖内功心法——让模型从"会说话"升级为"会按格式回答问题"。', '全真心法(Supervised Fine-Tune),打坐(Instruction Following)', 'LLMTraining', 1],
  ];

  const insertChar = db.prepare(
    'INSERT INTO characters (name, title, avatar_emoji, description, skills, tech_link, layer_link) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  for (const c of characters) {
    insertChar.run(c);
  }
  insertChar.free();

  // ========== 场景 ==========
  const scenes = [
    ['牛家村密室', '训练与底层机制', '郭靖在这里接受从江南七怪到洪七公的完整训练。对应模型的 Pre-training → SFT → RLHF → Function Calling FT。',
     JSON.stringify(['江南七怪教基本功 → Pre-training', '马钰教内功心法 → SFT', '洪七公实战纠正 → RLHF', '周伯通逼背九阴真经口诀 → Function Calling FT'])],
    ['对战梅超风', '推理与工具调用', '实战中郭靖的每一招都经过完整的 Runtime：Tick 驱动 → JMP 切换 → 出招 → Channel 传信 → State 快照。',
     JSON.stringify(['心跳(Tick)检查战局 → Runtime Tick', '黄蓉限制可选招式(Mask) → Constrained Decoding', '降龙十八掌实际打出 → Tool Call 执行', '记住局势随时退回 → State Snapshot'])],
    ['襄阳大战', '多 Agent 编排', '洪七公调度五绝围攻蒙古军营。对应 Orchestrator 的 fork()、Workflow JMP 链、PDCA 循环。',
     JSON.stringify(['洪七公排兵布阵 → Orchestrator fork()', '各路高手各司其职 → Specialist Agents', '按布阵图顺序进攻 → Workflow JMP 链', '战后复盘调整 → PDCA ACT 阶段'])],
    ['华山论剑', 'Auto-Routing 与 Skill 加载', '听到不同暗号自动激活对应高手。对应 Auto-Routing 中断向量表和 Skill 的按需加载(dlopen)。',
     JSON.stringify(['天王盖地虎 → 知道该找谁 → Auto-Routing', '临时翻阅武功秘籍 → Skill dlopen', '遵守江湖规矩不使阴招 → Rule ACL', '各显神通比试 → Agent 进程竞争'])],
    ['桃花岛信鸽站', 'Channel 与消息传递', '郭靖和黄蓉通过信鸽传书协调作战。对应 Channel FIFO 队列、异步消息、背压机制。',
     JSON.stringify(['郭靖写纸条 → Send Message', '信鸽飞行 → Channel 传输', '黄蓉阅读 → Receive Message', '回复并等待 → Async/Await'])],
    ['襄阳军机处', 'Orchestrator 指挥调度', '洪七公坐在中军帐中，通过令旗和信鸽调度各路高手。对应 Orchestrator 的统一调度中心。',
     JSON.stringify(['探马来报 → Input 触发', '洪七公定策 → Orchestrator Decide', '发令旗 → fork() Agent', '各路回信 → Channel 汇总'])],
  ];

  const insertScene = db.prepare(
    'INSERT INTO scenes (name, subtitle, description, events) VALUES (?, ?, ?, ?)'
  );
  for (const s of scenes) {
    insertScene.run(s);
  }
  insertScene.free();

  // ========== 映射表 ==========
  const mappings = [
    // Layer 0 -> 现在就是牛家村故事层
    ['牛家村场景 = Agent 系统侧面', '故事选择器', '所有场景', '每个场景对应 Agent 系统的一个侧面，点击进入不同技术剧情', 0, 'SceneSection'],
    ['人物卡牌 = 技术组件', '人物图谱', '人物志', '每个射雕人物对应一个技术角色，点击可翻转查看技术细节', 0, 'CharacterSection'],
    ['剧情回放 = Workflow 可视化', '故事线', '剧情回放', '/create 工作流映射为一场从定计到验收的完整江湖战役', 0, 'StorySection'],

    // Layer 1
    ['数据收集/清洗', '江湖情报网', '全真教探子遍布天下', '探子从各处收集消息（爬取），去掉假消息和重复情报（清洗去重），只留可靠信', 1, 'DataPipeline'],
    ['MinHash + LSH 去重', '核对秘籍真伪', '藏经阁', '同样的九阴真经有十几个手抄版，需要比对找出重复，只留最完整的一版', 1, 'DataPipeline'],
    ['梯度下降/反向传播', '内功修炼', '密室闭关', '每次运功出错，体内真气告诉你哪里走岔了（梯度），然后调整呼吸重新来', 1, 'GradientDescent'],
    ['AdamW 优化器', '聪明的向导', '迷路山林', '不仅记得你上次走错的方向（动量），还知道路面是平是陡（二阶矩）', 1, 'GradientDescent'],
    ['LoRA 低秩适配', '速成心法', '临时抱佛脚', '不用重修全部内功，只练两门 shortcut 心法就能快速掌握新招式', 1, 'GradientDescent'],
    ['解码策略/Temperature', '招式选择的火候', '临敌出招', 'Temperature低=每次都出最稳的招；Temperature高=随机应变可出奇制胜', 1, 'Decoding'],
    ['Constrained Decoding', '黄蓉场外指点', '对战梅超风', '黄蓉喊：下一招必须是JSON格式，其他招式不许用——Mask封死非法token', 1, 'JSONConstraint'],

    // Layer 2: Runtime 内核
    ['Tick 主循环', '心跳/脉搏', '战斗中', '每心跳一次检查战局：对手动了没？该出招还是防守？', 2, 'RuntimeTick'],
    ['JMP 跳转', '招式切换', '临敌应变', '防守态→发现破绽→JMP进攻态→出招→JMP防守态。不是轻功(call)，是瞬间变招(jmp)', 2, 'JMPConcept'],
    ['State 全息快照', '脑海中的当前战局', '对战中的暂停', '黄蓉喊：停！记住局势，不行就退回重来 → checkpoint/rollback', 2, 'StateSnapshot'],
    ['Channel 总线', '信鸽传书', '桃花岛通信', '郭靖→写纸条→黄蓉看→仆人执行→报告结果→黄蓉念给郭靖听', 2, 'ChannelAndMemory'],
    ['Context Window', '郭靖的短期记忆', '战斗中', '只能记住最近 5 招，多了就忘 → 缓冲区有限', 2, 'ChannelAndMemory'],
    ['Vector DB 长期记忆', '密室墙上的武功图谱', '密室藏书', '需要时去墙上检索(RAG)，不是记在脑子里', 2, 'ChannelAndMemory'],
    ['ACL Rule 引擎', '江湖规矩', '出招前', '不可滥杀无辜、不可背叛师门。出招前心里过一遍：这招犯规吗？', 2, 'ACLRule'],
    ['Checkpoint/Rollback', '存档读档', '战斗中', '每三招保存一次进度(Snapshot)，打不过就读档重来(Rollback)', 2, 'Checkpoint'],
    ['Tick 调度', '时间片轮转', '多人混战', '每人打三招换下一个，保证公平。洪七公喊：换人！', 2, 'TickScheduling'],
    ['异步工具执行', '发射信号弹等援军', '被围攻时', '发出信号弹(异步调用)，不等待援军到就继续打——援军到了自动处理结果', 2, 'AsyncExec'],
    ['中断与异常', '中毒了！切换到疗伤模式', '中了毒针', '正常出招中突然中毒(异常)→立即JMP到疗伤模式(异常处理)→好了再回来', 2, 'Interrupt'],

    // Layer 3: Agent 操作系统
    ['Rule = 内核安全策略', '江湖规矩', '全真教门规', '不可滥杀无辜、不可背叛师门。出招前心里过一遍：这招犯规吗？', 3, 'AgentArchitecture'],
    ['Skill = 动态链接库(.so)', '武功秘籍', '密室取书', '九阴真经(架构)、空明拳(前端)、降龙十八掌(API)。打架前从书架抽出来现翻', 3, 'AgentArchitecture'],
    ['Agent = 进程(Process)', '武林高手', '华山论剑', '各有所长：黄蓉(Frontend)、欧阳锋(Security)、洪七公(Orchestrator)', 3, 'AgentArchitecture'],
    ['Orchestrator = OS 内核', '洪七公', '襄阳大战总指挥', '不自己打，调度各路高手：欧阳锋探路、黄蓉布阵、郭靖主攻', 3, 'MultiAgentFork'],
    ['Workflow = JMP 地址链', '行军布阵图', '蒙古军营攻略', '探路→布阵→攻城→善后，每个步骤对应 JMP 到一个 Agent', 3, 'PDCACycle'],
    ['PDCA = 练功循环', '郭靖练降龙十八掌', '密室练武', 'Plan(想招式)→Do(出招)→Check(看打中没)→Act(调整再练)', 3, 'PDCACycle'],
    ['Auto-Routing = 中断向量表', '江湖暗号', '客栈接头', '天王盖地虎 → 知道该找谁。关键词哈希→查表→JMP到对应入口', 3, 'AutoRouting'],
  ];

  const insertMap = db.prepare(
    'INSERT INTO mappings (tech_concept, jianghu_role, scene, explanation, layer, link_to_tech) VALUES (?, ?, ?, ?, ?, ?)'
  );
  for (const m of mappings) {
    insertMap.run(m);
  }
  insertMap.free();

  // ========== Kernel 概念（Layer 2 深化） ==========
  const kernelConcepts = [
    ['Tick 主循环', 'core', '主循环每 N 毫秒一次 Tick。Tick 内：State 序列化→检查 PendingTool→若存在则 JMP 到 ToolHandler→执行后 JMP 回 Generate。不是函数调用，是 Program Counter 级别的状态跳转。',
     `func MainLoop():
  for tick := 1; ; tick++ {
    SaveSnapshot(State, tick)  // 每 Tick 快照
    switch State.Phase {
    case "idle":
      if UserHasNewInput() {
        State.Messages += UserInput()
        State.Phase = "generate"
        JMP(GenerateEntry)
      }
    case "generate":
      output = LLM.Generate(State.Messages, State.Tools)
      State.Messages += output
      if HasToolCall(output) {
        State.Pending = ParseToolCall(output)
        State.Phase = "tool"
        JMP(ToolHandlerEntry)
      } else {
        State.Phase = "idle"
        SendToUser(output)
        JMP(IdleEntry)
      }
    case "tool":
      result = ExecuteTool(State.Pending)
      State.Messages += {Role: "tool", Content: result}
      State.Pending = null
      State.Phase = "generate"
      JMP(GenerateEntry)
    }
    Sleep(TickInterval)  // 等下一拍
  }`,
     `stateDiagram-v2
    [*] --> IDLE
    IDLE --> GENERATE : 用户输入 / JMP GENERATE
    GENERATE --> TOOL : tool_call / JMP TOOL
    GENERATE --> IDLE : 无工具 / JMP IDLE
    TOOL --> GENERATE : 执行完成 / JMP GENERATE
    GENERATE --> VERIFY : 审查 / JMP VERIFY
    VERIFY --> IDLE : 通过 / JMP IDLE
    VERIFY --> GENERATE : 不通过 / Rollback + JMP GENERATE`,
     '🎭 心跳/脉搏：每心跳一次检查战局 → 发现破绽 → JMP进攻态 → 出招 → JMP防守态', 0],

    ['JMP 跳转语义', 'core', 'JMP 不是函数调用(CALL)。CALL 有返回地址，JMP 没有——它是 Program Counter 的直接覆盖。在 Runtime 中，Phase 切换本质就是 JMP：把执行流从当前 Handler 切换到目标 Handler 的入口地址。\n\n关键区别：\n- CALL = 轻功：跳出去还要跳回来（有返回地址）\n- JMP = 瞬间变招：防守→进攻后不回防守，是"切换招式"而不是"调用完回来"',
     `// CALL vs JMP 的本质区别
// ===== 函数调用 (CALL) =====
// 像洪七公叫郭靖："帮我去买瓶酒来"
// 郭靖买完酒 → 回到洪七公身边
func call() {
    result = buyWine()  // 等郭靖回来
    // 继续洪七公的事
}

// ===== JMP 跳转 =====
// 像战斗中：防守态→发现破绽→瞬间切进攻态
// 没有"返回"，是状态切换
func jmp() {
    switch State.Phase {
    case "defense":
        if foundOpening() {
            State.Phase = "attack"
            JMP(AttackEntry)  // PC 直接覆盖
        }
    case "attack":
        // 不会回到 defense！出完招可能进 idle 或 defense
        JMP(IdleEntry)  // 下一个状态
    }
}

// 底层实现：就是 PC = newAddress
// 在 Rust 中对应：std::arch::asm!("jmp {}", addr)
// 在 Go 中对应：goto label + 状态机跳转
// 在 JS 中对应：async function 的 Generator.next()`,
     `flowchart LR
    subgraph CALL[函数调用 = 轻功]
        A1[主函数] -->|CALL| B1[子函数]
        B1 -->|RET| A1
    end
    subgraph JMP[状态跳转 = 变招]
        A2[防守态] -->|JMP| B2[进攻态]
        B2 -->|JMP| C2[收招态]
        C2 -->|JMP| A2
    end`,
     '🎭 招式切换：防守态→发现破绽→JMP进攻态→出招→JMP防守态。不是轻功去搬救兵(CALL)，是瞬间变招(JMP)', 1],

    ['State 全息快照', 'core', '每个 Tick 结束时的 State 包含 messages、tools、pendingTool、sessionID、checkpointID。可被序列化存入 DB，随时恢复。这是 Agent 能"暂停/续跑"的根本。\n\nKey Insight：State 不是 diff，是完整全息快照。就像拍照——拍下此刻全部局势，恢复时整张替换。',
     `type Snapshot struct {
    Tick       int        // 第几拍
    Phase      string     // 当前状态
    Messages   []Message  // 对话历史
    Tools      []Tool     // 可用工具
    Pending    *ToolCall  // 待执行的工具
    SessionID  string     // 会话标识
    Timestamp  int64      // 时间戳
    Checksum   string     // SHA256 防篡改
}

func SaveSnapshot(s State, tick int) Snapshot {
    snap := Snapshot{
        Tick:      tick,
        Phase:     s.Phase,
        Messages:  deepCopy(s.Messages),  // 深拷贝！
        Tools:     deepCopy(s.Tools),
        Pending:   deepCopy(s.Pending),
        SessionID: s.SessionID,
        Timestamp: now(),
    }
    snap.Checksum = sha256(json.Marshal(snap))
    DB.Insert(snap)
    return snap
}

func Rollback(targetTick int) State {
    snap := DB.GetSnapshot(targetTick)
    if snap.Checksum != sha256(json.Marshal(snap)) {
        panic("snapshot tampered!")  // 防篡改
    }
    // 全量替换！不是 diff 回滚
    return State{
        Phase:     snap.Phase,
        Messages:  deepCopy(snap.Messages),
        Tools:     deepCopy(snap.Tools),
        Pending:   deepCopy(snap.Pending),
        SessionID: snap.SessionID,
    }
}`,
     `sequenceDiagram
    participant T as Tick N
    participant S as State
    participant D as DB
    T->>S: Phase = generate
    T->>S: Messages += output
    S->>D: SaveSnapshot(Tick N)
    Note over D: {Phase:generate, Pending:getWeather}
    T->>T: JMP ToolHandler
    T->>S: Phase = tool
    S->>D: SaveSnapshot(Tick N+1)
    Note over D: {Phase:tool, Pending:getWeather}
    T->>S: ExecuteTool → result
    T->>S: Phase = generate
    S->>D: SaveSnapshot(Tick N+2)
    Note over D: {Phase:generate, Pending:null}
    T->>T: Rollback(Tick N) if fail
    Note over D: 全量替换 State`,
     '🎭 郭靖的脑海战局：黄蓉喊"停！记住局势，不行就退回重来"。Checkpoint=存档，Rollback=读档', 2],

    ['Channel 总线', 'core', 'LLM ↔ Runtime ↔ Tool 之间不直接传递消息，全部经过 Channel FIFO 队列。\n\n核心原因：解耦。LLM 不需要知道底层 API 长什么样，Tool 不需要知道消息是怎么生成的。Channel 在中间做适配。\n\n背压(Backpressure)：当队列满了，不丢消息，而是触发 Summarizer 压缩 Context Window，腾出空间。',
     `type Channel struct {
    Queue   []Message    // FIFO 队列
    Cap     int          // 容量 = Context Window 上限
    Mu      sync.Mutex   // 互斥锁，线程安全
}

func (c *Channel) Send(msg Message) error {
    c.Mu.Lock()
    defer c.Mu.Unlock()
    
    if len(c.Queue) >= c.Cap {
        // 缓冲区满了 → 背压触发 Summarizer
        c.Queue = Summarize(c.Queue)
    }
    c.Queue = append(c.Queue, msg)
    return nil
}

func (c *Channel) Recv() (Message, error) {
    c.Mu.Lock()
    defer c.Mu.Unlock()
    
    if len(c.Queue) == 0 {
        return nil, ErrEmpty  // 空队列
    }
    msg := c.Queue[0]
    c.Queue = c.Queue[1:]   // FIFO 出队
    return msg, nil
}`,
     `flowchart LR
    subgraph channel[Channel 总线]
        C1[FIFO 队列]
    end
    
    LLM -->|Send| channel
    Tool -->|Send| channel
    channel -->|Recv| Runtime
    
    subgraph mem[记忆系统]
        CW[Context Window<br/>短期记忆]
        VB[Vector DB<br/>长期记忆]
        SM[Summarizer<br/>压缩器]
    end
    
    channel -->|入队| CW
    CW -->|满了| SM
    SM -->|摘要替换| CW
    LLM -->|查询| VB
    VB -->|召回| LLM`,
     '🎭 信鸽传书：郭靖→写纸条→黄蓉看→仆人执行→报告结果→黄蓉念给郭靖听。全部走 channel，不直接握手', 3],

    ['ACL 与 Rule 引擎', 'security', '每个 Tick 开始前，Runtime 先加载活跃的 Rule 到 State.Rules[]。然后执行 ACLPassthrough 检查：当前操作是否违反任何 Rule？如果违反，Phase 切换到阻止状态，不发 LLM 调用。\n\n这相当于操作系统内核的 System Call Filter——在进入内核前先做安全策略检查。',
     `func ACLPassthrough(state State) bool {
    // Tick 前加载所有活跃 Rule
    rules := LoadActiveRules()
    
    for _, rule := range rules {
        // 每个 Rule 是一个谓词函数
        if !rule.Check(state) {
            LogViolation(rule, state)
            return false  // 此次操作被阻止
        }
    }
    return true  // 通过安检
}

// 示例 Rule：不允许模型访问文件系统
func Rule_NoFileAccess(state State) bool {
    for _, tool := range state.Tools {
        if tool.Category == "filesystem" {
            return false  // 禁止文件系统工具
        }
    }
    return true
}`,
     `flowchart TD
    Start[Tick 开始] --> ACL{ACL Check}
    ACL -->|通过| Gen[执行 Generate]
    ACL -->|违反| Block[阻止进入 Generate]
    Block --> Log[记录违规到 ERRORS.md]
    Log --> Idle[回到 IDLE 等待下一 Tick]
    Gen --> Check2{Rule 检查输出}
    Check2 -->|通过| Done[输出给用户]
    Check2 -->|违规| Filter[过滤违规内容]`,
     '🎭 江湖规矩：出招前心里过一遍"这招犯规吗？"——不可以滥杀无辜、不可以背叛师门。全真教门规就是 Rule 文件', 5],

    ['Checkpoint/Rollback', 'reliability', 'Agent 最重要的非功能性特性之一：可暂停、可恢复、可回滚。\n\nCheckpoint 是"上帝存档"——每 N 个 Tick 自动保存一次完整 State。Rollback 是"读档"——回到之前某个存档点，全部 State 替换。\n\n这就像游戏：你打 BOSS 前存档，打不过就读档重来。整个 State 恢复到存档时的精确状态。',
     `// Checkpoint Chain: Tick 1 → 2 → 3 → 4 → 5 ...
// 如果 Tick 5 的验证失败 → Rollback 到 Tick 3

func ShouldCheckpoint(tick int) bool {
    // 每 3 个 Tick 存一次档
    return tick % 3 == 0
}

func VerifyAndAct(state State) {
    if QualityGate(state) {
        // 通过 → 正式提交此 Checkpoint
        // 之前的临时 Checkpoint 变成永久
        CommitCheckpoint(state.CheckpointID)
    } else {
        // 不通过 → 回滚到上一个永久 Checkpoint
        // 所有自上次提交以来的工作都撤销
        state = Rollback(state.CheckpointID - 1)
    }
}`,
     `sequenceDiagram
    participant T as Runtime
    participant S as State
    participant Q as Quality Gate
    T->>S: Tick 1: CHECKPOINT
    T->>S: Tick 2: generate
    T->>S: Tick 3: tool_execute
    T->>S: Tick 4: CHECKPOINT
    Note over S: 临时存档
    S->>Q: 验证 Tick 1-4 成果
    Q-->>T: ❌ 质量不通过！
    T->>S: Rollback(Tick 1 Checkpoint)
    Note over S: 回到 Tick 1 的精确状态
    T->>S: Tick 2: generate (重新来)
    T->>S: Tick 5: CHECKPOINT
    S->>Q: 再次验证
    Q-->>T: ✅ 通过，正式提交`,
     '🎭 每三招保存一次进度(Snapshot)，打不过就读档重来(Rollback)。郭靖：这招没打好，退回去重新出！', 6],

    ['Tick 调度策略', 'scheduler', '单 Agent 场景下 Tick 简单。但多 Agent 同时运行时，就需要调度器来决定"谁先执行、执行多久"。\n\n协作式调度：Agent 主动让出(yield)控制权。像"每人打三招换下一个"。\n\n抢占式调度：Tick 计时器到点就强制切换。像擂台赛"一炷香时间到，换人"。',
     `// 协作式调度（Cooperative）
// Agent 自觉 yield，不 yield 就一直占着
func CooperativeScheduler(agents []Agent) {
    for {
        for _, agent := range agents {
            state := agent.Run()
            if state == YIELD {
                continue  // 换下一个 Agent
            }
            if state == DONE {
                return agent.Result
            }
        }
    }
}

// 抢占式调度（Preemptive）
// Tick 计时器到点就强制切换
func PreemptiveScheduler(agents []Agent, quantum time.Duration) {
    timer := time.NewTimer(quantum)
    for {
        for _, agent := range agents {
            go func(a Agent) {
                a.Run()
            }(agent)
            
            select {
            case <-timer.C:
                // 时间片用完，强制切换
                agent.Suspend()
            case result := <-agent.Done():
                return result
            }
        }
    }
}`,
     `flowchart TD
    subgraph cooperative[协作式调度]
        A1[Agent A: 执行] -->|主动 yield| A2[Agent B: 执行]
        A2 -->|主动 yield| A3[Agent C: 执行]
        A3 -->|主动 yield| A1
    end
    subgraph preemptive[抢占式调度]
        B1[Agent A<br/>时间片开始] -->|Timer 到期| B2[强制切换]
        B2 --> B3[Agent B<br/>时间片开始]
        B3 -->|Timer 到期| B4[强制切换]
    end`,
     '🎭 协作式=每人自觉打三招换人；抢占式=擂鼓为号，鼓声一响不管打到哪立刻换人', 7],

    ['异步与并发', 'async', 'Tool 执行可能是慢的（调用远程 API、查数据库）。如果每次等 Tool 回来再继续，CPU 就浪费了。\n\n异步执行：发出 Tool 调用后不等待，立即继续下一 Tick。Tool 结果通过 Channel 异步回来时，再插入消息队列。\n\n这就像发射信号弹等援军——发出信号弹后继续打，援军到了自动处理。',
     `// 同步执行（阻塞）
// 等工具返回期间，Runtime 卡死了
func SyncExecute(tool ToolCall) Result {
    return http.Post(tool.Endpoint, tool.Args)
    // 此处阻塞 2 秒！Tick 停摆
}

// 异步执行（非阻塞）
// 发出调用后立即返回，结果通过 Channel 回来
func AsyncExecute(tool ToolCall, channel Channel) {
    go func() {
        result := http.Post(tool.Endpoint, tool.Args)
        channel.Send(Message{
            Role: "tool",
            Content: result,
        })
    }()
    // 不等待！立即回到 Tick 循环
    return
}

// 简化的 Async/Await
async function toolCallHandler(tool) {
    // 发射信号弹（异步调用）
    const resultPromise = callToolAsync(tool);
    
    // 不等待，继续处理其他事
    doOtherStuff();
    
    // 需要结果时才 await
    const result = await resultPromise;
    messages.push({ role: 'tool', content: result });
}`,
     `sequenceDiagram
    participant R as Runtime
    participant T as Tool API
    participant C as Channel
    R->>T: AsyncExecute(getWeather)
    Note over R: 不等待！继续下一 Tick
    R->>R: Generate(其他内容)
    T->>C: 2秒后... 结果回来
    C->>R: 收到 Tool Result
    R->>R: 插入消息队列
    R->>R: Continue Generation`,
     '🎭 发射信号弹等援军：发出信号弹(异步调用)后继续打，援军到了自动处理结果。不等援军到才出下一招', 8],

    ['中断与异常', 'error', 'Runtime 是循环，但如果循环中出现了不可恢复的错误怎么办？比如 Tool 返回 500、LLM 超时、Channel 满了写不进去。\n\n中断处理模式：\n1. 正常执行流被中断信号打断\n2. 保存当前 Context（State 快照）\n3. JMP 到中断向量表中对应的 Handler\n4. Handler 处理（重试/降级/报错）\n5. 处理完 JMP 回正常流 或 退出\n\n这就像比武中突然中毒——正常出招被打断，立即切换到"疗伤模式"，解毒后再回来继续打。',
     `// 中断向量表
var InterruptVectorTable = map[string]func(State) State{
    "TOOL_TIMEOUT":     HandleToolTimeout,
    "LLM_ERROR":        HandleLLMError,
    "CHANNEL_FULL":     HandleBackpressure,
    "RULE_VIOLATION":   HandleRuleViolation,
    "PANIC_RECOVERY":   HandlePanic,
}

// Tick 中的中断处理
func TickWithInterrupt(state State) State {
    defer func() {
        if r := recover(); r != nil {
            // 捕获 panic，JMP 到恢复 Handler
            state = InterruptVectorTable["PANIC_RECOVERY"](state)
        }
    }()
    
    // 正常 Tick 逻辑
    result := execute(state)
    
    // 检查是否有中断信号
    if interrupt := checkInterrupt(); interrupt != nil {
        handler := InterruptVectorTable[interrupt.Type]
        state = handler(state)
        JMP(handler.entryAddr)
    }
    
    return result
}`,
     `flowchart TD
    Normal[正常 Tick 执行] --> Check{有中断信号？}
    Check -->|无| Done[继续下一 Tick]
    Check -->|有| Save[保存 Context]
    Save --> Lookup[查中断向量表]
    Lookup -->|LLM 超时| Retry[重试]
    Lookup -->|Tool 500| Degrade[降级处理]
    Lookup -->|Channel 满| Back[触发背压]
    Lookup -->|Panic| Recover[恢复 Handler]
    Retry --> Resume[JMP 回正常流]
    Degrade --> Resume
    Back --> Resume
    Recover --> Resume`,
     '🎭 中了毒针(异常)→立即JMP到疗伤模式(异常处理)→解毒后继续打。正常出招被中断打断，处理完再回来', 9],
  ];

  const insertKernel = db.prepare(
    'INSERT INTO kernel_concepts (name, category, detail, code_example, mermaid_diagram, analogy, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  for (const k of kernelConcepts) {
    insertKernel.run(k);
  }
  insertKernel.free();

  // ========== Code Snippets ==========
  const codeSnippets = [
    ['runtime-tick', 'Runtime Tick 主循环', '```go\nfunc MainLoop() {\n  for tick := 1; ; tick++ {\n    SaveSnapshot(State, tick)\n    switch State.Phase {\n    case "idle":\n      if UserHasNewInput() {\n        State.Messages += UserInput()\n        State.Phase = "generate"\n        JMP(GenerateEntry)\n      }\n    case "generate":\n      output = LLM.Generate(State.Messages, State.Tools)\n      State.Messages += output\n      if HasToolCall(output) {\n        State.Pending = ParseToolCall(output)\n        State.Phase = "tool"\n        JMP(ToolHandlerEntry)\n      } else {\n        State.Phase = "idle"\n        SendToUser(output)\n        JMP(IdleEntry)\n      }\n    case "tool":\n      result = ExecuteTool(State.Pending)\n      State.Messages += {Role: "tool", Content: result}\n      State.Pending = null\n      State.Phase = "generate"\n      JMP(GenerateEntry)\n    }\n    Sleep(TickInterval)\n  }\n}\n```', 'go', 2],
    ['jmp-vs-call', 'JMP vs CALL 对比', '```go\n// CALL = 轻功：跳出去还要跳回来\nfunc call() {\n    result = buyWine()  // 等郭靖回来\n    // 继续洪七公的事\n}\n\n// JMP = 瞬间变招：不回原处\nfunc jmp() {\n    switch State.Phase {\n    case "defense":\n        if foundOpening() {\n            State.Phase = "attack"\n            JMP(AttackEntry)\n        }\n    case "attack":\n        JMP(IdleEntry)  // 不会回到 defense\n    }\n}\n```', 'go', 2],
    ['state-snapshot', 'State 快照与回滚', '```go\ntype Snapshot struct {\n    Tick      int\n    Phase     string\n    Messages  []Message\n    Tools     []Tool\n    Pending   *ToolCall\n    SessionID string\n    Checksum  string  // SHA256\n}\n\nfunc SaveSnapshot(s State, tick int) Snapshot {\n    snap := Snapshot{\n        Tick:      tick,\n        Phase:     s.Phase,\n        Messages:  deepCopy(s.Messages),\n        Tools:     deepCopy(s.Tools),\n        Pending:   deepCopy(s.Pending),\n        SessionID: s.SessionID,\n        Timestamp: now(),\n    }\n    snap.Checksum = sha256(json.Marshal(snap))\n    DB.Insert(snap)\n    return snap\n}\n\nfunc Rollback(targetTick int) State {\n    snap := DB.GetSnapshot(targetTick)\n    if snap.Checksum != sha256(json.Marshal(snap)) {\n        panic("snapshot tampered!")\n    }\n    return State{\n        Phase:     snap.Phase,\n        Messages:  deepCopy(snap.Messages),\n        Tools:     deepCopy(snap.Tools),\n        Pending:   deepCopy(snap.Pending),\n        SessionID: snap.SessionID,\n    }\n}\n```', 'go', 2],
    ['channel', 'Channel FIFO 队列', '```go\ntype Channel struct {\n    Queue   []Message\n    Cap     int\n    Mu      sync.Mutex\n}\n\nfunc (c *Channel) Send(msg Message) error {\n    c.Mu.Lock()\n    defer c.Mu.Unlock()\n    \n    if len(c.Queue) >= c.Cap {\n        c.Queue = Summarize(c.Queue)\n    }\n    c.Queue = append(c.Queue, msg)\n    return nil\n}\n\nfunc (c *Channel) Recv() (Message, error) {\n    c.Mu.Lock()\n    defer c.Mu.Unlock()\n    \n    if len(c.Queue) == 0 {\n        return nil, ErrEmpty\n    }\n    msg := c.Queue[0]\n    c.Queue = c.Queue[1:]\n    return msg, nil\n}\n```', 'go', 2],
    ['agent-os', 'Agent OS 架构', '```go\ntype AgentOS struct {\n    Kernel    *RuleEngine          // Rule = 内核安全策略\n    Modules   map[string]Skill     // Skill = .so 动态库\n    Procs     map[string]Agent     // Agent = 进程\n    Scheduler *WorkflowEngine      // Workflow = 进程调度器\n}\n\nfunc (os *AgentOS) Tick(state State) State {\n    state.Rules = os.Kernel.LoadActiveRules()\n    \n    agentID := os.Kernel.Route(state.Messages.Last())\n    proc := os.Fork(state, agentID)\n    \n    for skillRef := range proc.Skills {\n        state.Context += os.Modules[skillRef].Load()\n    }\n    \n    for step := range os.Scheduler.GetWorkflow(proc.WorkflowID) {\n        state.Phase = step.Phase\n        JMP(step.EntryAddr)\n    }\n    \n    return os.Join(proc)\n}\n```', 'go', 3],
    ['training-pipeline', '训练流水线', '```python\n# Step 1: Pre-training\n# 在互联网文本上预测下一个 token\ndef pre_train(model, corpus):\n    optimizer = AdamW(lr=6e-4)\n    for step in range(300000):\n        batch = sample(corpus, seq_len=2048)\n        logits = model(batch.input_ids)\n        loss = cross_entropy(logits, batch.labels)\n        loss.backward()\n        optimizer.step()\n    return model\n\n# Step 2: SFT\n# 用问答对微调，学会按格式回答\ndef sft(model, dataset):\n    optimizer = AdamW(lr=2e-5)  # 学习率低30倍\n    for epoch in range(3):\n        for batch in dataset:\n            loss = model(batch, labels=batch)\n            loss.backward()\n            optimizer.step()\n    return model\n\n# Step 3: RLHF\n# 人类偏好对齐\ndef rlhf(model, pref_data):\n    reward_model = clone(model)\n    # 训练 reward model\n    for prompt, a, b, label in pref_data:\n        score_a = reward_model(prompt + a)\n        score_b = reward_model(prompt + b)\n        loss = -log(sigmoid(score_chosen - score_rejected))\n        loss.backward()\n    # PPO 优化\n    for prompt in prompts:\n        response = model.generate(prompt)\n        reward = reward_model(prompt + response)\n        ppo_loss = -reward + beta * KL(new_model, old_model)\n        ppo_loss.backward()\n    return model\n```', 'python', 1],
  ];

  const insertCode = db.prepare(
    'INSERT INTO code_snippets (key, title, code, language, layer) VALUES (?, ?, ?, ?, ?)'
  );
  for (const c of codeSnippets) {
    insertCode.run(c);
  }
  insertCode.free();

  // ========== 概念表 ==========
  const concepts = [
    // Layer 2: Runtime 内核概念
    [2, 'Tick 主循环', '核心', '每 N 毫秒一次的心跳。Tick 内：State 序列化 → 检查 PendingTool → 若存在则 JMP 到 ToolHandler → 执行后 JMP 回 Generate。不是函数调用，是 Program Counter 级别的状态跳转。', '🎭 心跳每拍检查战局：对手动了没？该出招还是防守？', 0],
    [2, 'JMP 跳转', '核心', 'JMP 不是 CALL。CALL 有返回地址，JMP 是 PC 直接覆盖。Phase 切换本质就是 JMP：防守态→发现破绽→JMP进攻态→出招。', '🎭 招式切换：不是轻功去搬救兵(CALL)，是瞬间变招(JMP)', 1],
    [2, 'State 快照', '核心', '每个 Tick 结束时的完整 State 快照。不是 diff，是全息照片——拍下此刻全部局势。恢复时整张替换。', '🎭 黄蓉喊"停！记住局势，不行就退回重来"', 2],
    [2, 'Channel 总线', '核心', 'LLM ↔ Runtime ↔ Tool 之间不直接握手，全部经过 Channel FIFO 队列。满了触发背压/摘要。', '🎭 信鸽传书：郭靖→写纸条→黄蓉看→仆人执行→报告结果→黄蓉念给郭靖听', 3],
    [2, 'ACL Rule 引擎', '安全', '每个 Tick 前加载活跃 Rule，执行 ACL 检查。违反规则的 Phase 直接阻止，不发给 LLM。', '🎭 出招前心里过一遍：这招犯规吗？——江湖规矩', 4],
    [2, 'Checkpoint', '可靠性', '每 N 个 Tick 自动保存一次完整 State，支持回滚到任意存档点。', '🎭 每三招存档一次，打不过读档重来', 5],
    [2, 'Tick 调度', '调度', '多 Agent 同时运行时的调度策略：协作式（主动 yield）vs 抢占式（Timer 强制切换）', '🎭 每人自觉打三招换人 vs 鼓声一响不管打到哪立刻换人', 6],
    [2, '异步执行', '并发', 'Tool 调用不阻塞 Tick 循环。发出请求后立即继续，结果通过 Channel 异步回来。', '🎭 发射信号弹等援军：发出后继续打，援军到了自动处理', 7],
    [2, '中断处理', '异常', '正常执行流被打断 → 保存 Context → JMP 中断 Handler → 处理完 JMP 回正常流', '🎭 中毒了！立即切换到疗伤模式，解毒后继续打', 8],

    // Layer 3: Agent OS 概念
    [3, 'Rule 内核策略', '核心', '在 Runtime 每个 Tick 前加载到 State.Rules[]，ACL 检查通过才能继续。对应 GEMINI.md、auto-routing.md。', '🎭 全真教门规：不可滥杀无辜、不可背叛师门', 0],
    [3, 'Skill 动态库', '核心', '不是常驻内存，被 Orchestrator 在 Tick 中通过 dlopen 式加载注入 Context。对应 skills/*/SKILL.md。', '🎭 武功秘籍：打架前从书架抽出来现翻现用', 1],
    [3, 'Agent 进程', '核心', '每个 Agent 是独立的 State 副本 + 独立 Tool Set。Orchestrator 通过 fork()（State Clone）创建。', '🎭 武林高手各有所长：黄蓉(前端)、欧阳锋(安全)、洪七公(调度)', 2],
    [3, 'Workflow 调度', '核心', '预编排 JMP 地址链：JMP plan → JMP create → JMP test → JMP deploy。每个地址对应一个 Agent。', '🎭 行军布阵图：探路→布阵→攻城→善后', 3],
    [3, 'PDCA 循环', '管理', 'PLAN → DO → CHECK → ACT。不是抽象术语，是 State 机的完整生命周期。', '🎭 练降龙十八掌：想招式→出招→看打中没→调整再练', 4],
    [3, 'Auto-Routing', '路由', '用户输入 → 关键词哈希 → 查中断向量表 → JMP 到对应 Agent 处理函数入口。与底层 JMP 精确对应。', '🎭 江湖暗号：天王盖地虎→知道该找谁', 5],
    [3, '进程间通信', '通信', 'Agent ↔ Agent 不直接握手，通过 Channel 路由和消息协议传递。', '🎭 信鸽驿站网络：各门派通过驿站传信', 6],
  ];

  const insertConcept = db.prepare(
    'INSERT INTO concepts (layer, name, category, detail, analogy, order_index) VALUES (?, ?, ?, ?, ?, ?)'
  );
  for (const c of concepts) {
    insertConcept.run(c);
  }
  insertConcept.free();

  // 保存到 localStorage
  saveDb();
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const binary = '';
  const uint8 = new Uint8Array(data);
  const base64 = btoa(String.fromCharCode(...uint8));
  localStorage.setItem('agent-lecture-db', base64);
}

// ============================================================
// 查询函数
// ============================================================

export function queryAll<T>(sql: string, params?: any[]): T[] {
  if (!db) throw new Error('DB not initialized');
  const stmt = db.prepare(sql);
  if (params) stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(row as T);
  }
  stmt.free();
  return results;
}

export function queryOne<T>(sql: string, params?: any[]): T | null {
  const results = queryAll<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

// ============================================================
// 用户笔记功能
// ============================================================

export function addNote(sectionKey: string, content: string) {
  if (!db) return;
  db.run('INSERT INTO user_notes (section_key, content) VALUES (?, ?)', [sectionKey, content]);
  saveDb();
}

export function getNotes(sectionKey: string): { id: number; content: string; created_at: string }[] {
  return queryAll('SELECT id, content, created_at FROM user_notes WHERE section_key = ? ORDER BY created_at DESC', [sectionKey]);
}

export function deleteNote(id: number) {
  if (!db) return;
  db.run('DELETE FROM user_notes WHERE id = ?', [id]);
  saveDb();
}
