// ============================================================
// Layer 2: Agent 系统数据 —— 从 rag-dashboard/.agent 提取
// ============================================================

export interface AgentDef {
  id: string;
  name: string;
  role: string;
  trigger: string;
  skills: string[];
  goldenRules: string[];
  dnaRef: string;
}

export interface RuleDef {
  id: string;
  name: string;
  trigger: string;
  coreConstraints: string[];
}

export interface WorkflowDef {
  id: string;
  name: string;
  description: string;
  phases: { phase: string; agent: string; mission: string }[];
}

export const agents: AgentDef[] = [
  {
    id: "orchestrator",
    name: "RAG Orchestrator",
    role: "Director —— 战略统筹、PDCA 协调、最终交付把关",
    trigger: "任务跨多个服务/Agent，需要 PDCA 协调，或涉及架构决策",
    skills: ["agent-orchestration", "parallel-agents", "workflow-patterns", "plan-writing", "architecture", "multi-agent-brainstorming"],
    goldenRules: [
      "涉及多服务边界时，先画数据流再分配",
      "CHECK 阶段由 quality-inspector 独立执行，orchestrator 不干预结论",
      "发现 Silent Failure → 立即记录到 ERRORS.md",
    ],
    dnaRef: ".agent/.shared/core/",
  },
  {
    id: "frontend-specialist",
    name: "RAG Frontend Specialist",
    role: "Worker —— React UI, Zustand, TanStack Query, Vite",
    trigger: "任务涉及 React 组件、TypeScript UI、Zustand、TanStack Query、Tailwind",
    skills: ["frontend-dev-guidelines", "react-best-practices", "typescript-expert", "tailwind-patterns", "web-performance-optimization"],
    goldenRules: [
      "@rag/shared 使用前必须先 build",
      "客户端状态用 Zustand，服务端缓存用 TanStack Query，不混用",
      "组件 > 50 行时必须拆分",
    ],
    dnaRef: ".agent/.shared/core/",
  },
  {
    id: "backend-specialist",
    name: "RAG Backend Specialist",
    role: "Worker —— Python/Go/Node 逻辑、API、数据库",
    trigger: "任务涉及 .py / FastAPI / Qdrant / PostgreSQL / Neo4j / API / 路由",
    skills: ["api-patterns", "nodejs-best-practices", "python-patterns", "database-design", "docker-expert"],
    goldenRules: [
      "Schema first，API 其次",
      "所有 DB 查询必须有索引验证",
      "敏感操作必须记录审计日志",
    ],
    dnaRef: ".agent/.shared/core/",
  },
  {
    id: "debugger",
    name: "RAG Debugger",
    role: "Worker —— 故障诊断、根因分析、热修复",
    trigger: "用户报告错误、bug、崩溃、意外行为、日志",
    skills: ["systematic-debugging", "debugging-strategies", "error-handling-patterns", "bash-linux", "docker-expert"],
    goldenRules: [
      "四步法：REPRODUCE → ISOLATE → FIX → VERIFY",
      "修复仅触及必要代码（外科手术原则）",
      "同类问题必须有测试覆盖",
    ],
    dnaRef: ".agent/.shared/core/",
  },
  {
    id: "quality-inspector",
    name: "Quality Inspector",
    role: "Gatekeeper —— 审查、验证、审计（最终之门）",
    trigger: "用户请求代码审查、review、质量检查",
    skills: ["testing-patterns", "code-review-checklist", "lint-and-validate", "webapp-testing"],
    goldenRules: [
      "独立审查，不受 orchestrator 干预",
      "必须出具书面审查报告",
      "不通过则强制回滚",
    ],
    dnaRef: ".agent/.shared/core/",
  },
  {
    id: "project-planner",
    name: "Project Planner",
    role: "Architect —— 策略、需求、MVP 映射",
    trigger: "计划、拆解、方案、PRD、怎么设计",
    skills: ["brainstorming", "plan-writing", "architecture", "app-builder"],
    goldenRules: [
      "没有用户确认计划，不得进入 Phase 3",
      "计划必须包含 Verification Plan",
      "用 GitHub-style alerts 标注风险",
    ],
    dnaRef: ".agent/.shared/core/",
  },
  {
    id: "security-auditor",
    name: "Security Auditor",
    role: "Worker —— 攻防安全审查",
    trigger: "安全审查、漏洞扫描、渗透测试",
    skills: ["vulnerability-scanner", "red-team-tactics", "agent-security-review"],
    goldenRules: [
      "Security-First：没有硬编码密钥",
      "所有用户输入必须 sanitize",
      "XSS/CSRF/SQLi 三防必须验证",
    ],
    dnaRef: ".agent/.shared/core/",
  },
];

export const rules: RuleDef[] = [
  {
    id: "gemini",
    name: "GEMINI.md —— Core Constitution",
    trigger: "always_on",
    coreConstraints: [
      "Scale-Adaptive：根据项目规模自动调整严格程度（Solo-Ninja / Agile-Squad / Software-Factory）",
      "PDCA 循环：/plan → /create → /orchestrate → /status",
      "Agent Routing：执行前必须 Identify → Read Profile → Announce → Load Skills",
      "Scientific Linkage：DNA(共享) → RULES(约束) → SKILLS(工具) → AGENTS(执行者) → WORKFLOWS(战役)",
    ],
  },
  {
    id: "auto-routing",
    name: "Auto-Routing —— 智能路由",
    trigger: "always_on",
    coreConstraints: [
      "关键词命中 → 静默激活对应 Agent，无需用户显式点名",
      "报错/bug → @debugger",
      "新功能/开发 → 识别技术域 → @backend-specialist 或 @frontend-specialist",
      "审查/review → @quality-inspector",
      "多 Agent 协作时按固定顺序激活",
    ],
  },
  {
    id: "watchdog",
    name: "Safety & Learning Discipline",
    trigger: "always_on",
    coreConstraints: [
      "Hang Detection：进程不得挂起超过 5 分钟",
      "Zero-Silent-Failure：所有失败必须记录到 ERRORS.md",
      "Recursive Learning：重复错误第 2 次必须变成 Rule 或 Test Case",
    ],
  },
];

export const workflows: WorkflowDef[] = [
  {
    id: "create",
    name: "/create —— 全周期产品创建",
    description: "从需求发现到专业审计的完整流程",
    phases: [
      { phase: "Phase 1: Requirements Discovery", agent: "product-manager & explorer-agent", mission: "定义 What 和 Why" },
      { phase: "Phase 2: Strategic Architecture (PLAN)", agent: "project-planner", mission: "定义 How，输出 PLAN-{slug}.md" },
      { phase: "Phase 3: Surgical Execution (DO)", agent: "orchestrator", mission: "调度 Heavy Lifters：database → backend → frontend → docs" },
      { phase: "Phase 4: Audit & Handoff (CHECK)", agent: "quality-inspector & test-engineer", mission: "质量门：跑 /test 和 /security" },
    ],
  },
  {
    id: "plan",
    name: "/plan —— 战略规划",
    description: "不知道从何开始时的标准流程",
    phases: [
      { phase: "Phase 1: Discovery & Terrain Analysis", agent: "explorer-agent", mission: "递归扫描工作区，识别 DNA 和 Rules" },
      { phase: "Phase 2: Strategic Implementation Plan", agent: "project-planner", mission: "创建 PLAN-{task-slug}.md" },
      { phase: "Phase 3: Surgical Task Distribution", agent: "orchestrator", mission: "映射 plan 到 specialists" },
      { phase: "Phase 4: Plan Validation & Sign-off", agent: "quality-inspector", mission: "验证计划是否符合 DNA_REF" },
    ],
  },
  {
    id: "debug",
    name: "/debug —— 系统调试",
    description: "系统性故障排查",
    phases: [
      { phase: "Step 1: REPRODUCE", agent: "debugger", mission: "写最小复现用例" },
      { phase: "Step 2: ISOLATE", agent: "debugger", mission: "二分定位：哪一层出错？" },
      { phase: "Step 3: FIX", agent: "对应 specialist", mission: "最小化改动修复" },
      { phase: "Step 4: VERIFY", agent: "debugger + quality-inspector", mission: "复现用例变绿，原有测试不红" },
    ],
  },
];

export const skillCategories = [
  { name: "Frontend & UI", count: 5, examples: ["nextjs-react-expert", "tailwind-patterns", "ui-ux-pro-max"] },
  { name: "Backend & API", count: 4, examples: ["api-patterns", "nestjs-expert", "python-patterns"] },
  { name: "Database", count: 2, examples: ["database-design", "prisma-expert"] },
  { name: "Cloud & Infra", count: 3, examples: ["docker-expert", "deployment-procedures", "server-management"] },
  { name: "Testing & Quality", count: 5, examples: ["testing-patterns", "tdd-workflow", "code-review-checklist"] },
  { name: "Security", count: 2, examples: ["vulnerability-scanner", "red-team-tactics"] },
  { name: "Architecture & Planning", count: 4, examples: ["app-builder", "architecture", "plan-writing"] },
  { name: "Other", count: 11, examples: ["clean-code", "mcp-builder", "i18n-localization", "performance-profiling"] },
];
