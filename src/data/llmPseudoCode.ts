// ============================================================
// Layer 1: 底层伪代码 —— 基于 opencode 源码简化
// ============================================================

export const trainingPipelineCode = `// Step 1: Pre-training —— 江南七怪教基本功
func PreTrain(model, internetText):
    for epoch in 1..100:
        for batch in internetText:
            loss = predict_next_token(model, batch)
            backward(loss)  // 梯度下降
    // 模型现在会"说话"，但胡说八道
    return model

// Step 2: SFT —— 马钰教内功心法
func SupervisedFineTune(model, qaPairs):
    for (question, answer) in qaPairs:
        loss = cross_entropy(model(question), answer)
        backward(loss)
    // 模型开始按人类格式回答
    return model

// Step 3: RLHF —— 洪七公实战纠正
func RLHF(model, humanPreferences):
    for prompt in dataset:
        response = model.generate(prompt)
        reward = human_judge(response)  // 人类打分
        PPO_update(model, reward)       // 强化学习
    // 模型输出更符合人类偏好
    return model

// Step 4: Function Calling Fine-tune —— 周伯通逼背九阴真经招式口诀
func FunctionCallingFT(model, toolExamples):
    // 关键：在 tokenizer 中加入特殊 token
    specialTokens = ["<tool_call>", "</tool_call>", "<tool_result>"]
    tokenizer.add_tokens(specialTokens)
    
    for example in toolExamples:
        // 输入：用户问题 + 可用工具的 JSON Schema
        input = example.user_prompt + format_tools(example.tools)
        // 目标输出：必须用 <tool_call>{"name":"x","args":{}}</tool_call> 格式
        target = "<tool_call>" + json(example.tool_call) + "</tool_call>"
        loss = cross_entropy(model(input), target)
        backward(loss)
    // 模型学会了：遇到特定问题时，输出结构化 JSON 而不是自由文本
    return model`;

export const constrainedDecodingCode = `// Constrained Decoding —— 黄蓉场外指点"下一招只能是这两式"
func GenerateWithConstraint(model, prompt, toolSchema):
    tokens = tokenize(prompt)
    while not eos:
        logits = model.forward(tokens)  // [vocab_size] 每个 token 的分数
        
        // === MASK 过滤 ===
        // 根据 toolSchema，只允许生成合法 JSON 的 token
        validTokens = json_schema_to_valid_tokens(toolSchema, tokens_so_far)
        mask = zeros(vocab_size)
        mask[validTokens] = 1
        logits = logits * mask + (1 - mask) * (-inf)
        
        nextToken = sample(logits)
        tokens.append(nextToken)
    
    return tokens

// 关键洞察：模型不是"想"调用工具，而是被 Mask 逼得只能输出 JSON
// 训练阶段让 JSON 格式的 logits 分数高 → Mask 过滤后只剩这些选项`;

export const runtimeTickCode = `// Runtime Tick —— 心跳/脉搏，每拍检查战局
var State = {
    Phase:      "idle",       // idle | generate | tool | verify
    Messages:   [],           // 对话历史（Context Window）
    Tools:      [],           // 可用工具表
    Pending:    null,         // 待执行的工具调用
    SessionID:  "uuid",       // 会话标识
    Checkpoint: 0,            // 最新保存点
    Rules:      [],           // 加载的内核安全策略
}

func MainLoop():
    for tick := 1; ; tick++ {
        // === TICK 开始 ===
        SaveSnapshot(State, tick)  // 全息快照，用于回滚
        
        switch State.Phase {
        case "idle":
            if UserHasNewInput() {
                State.Messages = append(State.Messages, UserInput())
                State.Phase = "generate"
                JMP(GenerateEntry)   // JMP：不是 call，是 PC 级跳转
            }
            
        case "generate":
            // ACL 检查：Tick 前加载 Rule，验证是否合规
            if !ACLPassthrough(State.Rules, State.Messages) {
                State.Phase = "idle"
                JMP(IdleEntry)
            }
            
            output = LLM.Generate(State.Messages, State.Tools)
            State.Messages = append(State.Messages, output)
            
            if HasToolCall(output) {
                State.Pending = ParseToolCall(output)
                State.Phase = "tool"
                JMP(ToolHandlerEntry)  // JMP 到工具处理地址
            } else {
                State.Phase = "idle"
                SendToUser(output)
                JMP(IdleEntry)
            }
            
        case "tool":
            result = ExecuteTool(State.Pending)
            State.Messages = append(State.Messages, {
                Role: "tool",
                Content: result,
            })
            State.Pending = null
            State.Phase = "generate"
            JMP(GenerateEntry)  // JMP 回生成入口，继续对话
            
        case "verify":
            // CHECK 阶段：Quality Inspector 审查
            if QualityGate(State) {
                State.Phase = "idle"
                JMP(IdleEntry)
            } else {
                Rollback(State.Checkpoint)  // 回滚到上一个保存点
                State.Phase = "generate"
                JMP(GenerateEntry)
            }
        }
        
        Sleep(TickInterval)  // 等待下一拍
    }`;

export const channelCode = `// Channel —— 信鸽传书系统
// LLM、Runtime、Tool 之间不直接握手，都通过 Channel 异步通信

type Channel struct {
    Queue   []Message   // FIFO 队列
    Cap     int         // 容量 = Context Window 上限
    Mu      sync.Mutex  // 互斥锁
}

func (c *Channel) Send(msg Message) error {
    c.Mu.Lock()
    defer c.Mu.Unlock()
    
    if len(c.Queue) >= c.Cap {
        // 缓冲区满了 → 触发 Summarizer（摘要压缩）
        c.Queue = Summarize(c.Queue)
    }
    
    c.Queue = append(c.Queue, msg)
    return nil
}

func (c *Channel) Recv() (Message, error) {
    c.Mu.Lock()
    defer c.Mu.Unlock()
    
    if len(c.Queue) == 0 {
        return nil, ErrEmpty  // 阻塞等待
    }
    
    msg := c.Queue[0]
    c.Queue = c.Queue[1:]  // FIFO 出队
    return msg, nil
}

// 长期记忆（Vector DB）—— 密室墙上的武功图谱
func LongTermRecall(query string, vectorDB VectorDB) []Context {
    embedding := Embed(query)
    return vectorDB.Search(embedding, topK=5)  // RAG 检索
}`;

export const stateSnapshotCode = `// State Snapshot —— 全息快照，支持 Pause / Resume / Rollback

type Snapshot struct {
    Tick       int
    Phase      string
    Messages   []Message
    Tools      []Tool
    Pending    *ToolCall
    SessionID  string
    Timestamp  int64
    Checksum   string  // SHA256，防篡改
}

func SaveSnapshot(s State, tick int) Snapshot {
    snap := Snapshot{
        Tick:      tick,
        Phase:     s.Phase,
        Messages:  deepCopy(s.Messages),
        Tools:     deepCopy(s.Tools),
        Pending:   deepCopy(s.Pending),
        SessionID: s.SessionID,
        Timestamp: now(),
    }
    snap.Checksum = sha256(json.Marshal(snap))
    DB.Insert(snap)  // 持久化到 SQLite / Redis
    return snap
}

func Rollback(targetTick int) State {
    snap := DB.GetSnapshot(targetTick)
    if snap.Checksum != sha256(json.Marshal(snap)) {
        panic("snapshot tampered!")
    }
    // 完整恢复：不是 diff，是全量 State 替换
    return State{
        Phase:     snap.Phase,
        Messages:  deepCopy(snap.Messages),
        Tools:     deepCopy(snap.Tools),
        Pending:   deepCopy(snap.Pending),
        SessionID: snap.SessionID,
    }
}`;

export const agentOsCode = `// Agent OS —— 在裸 Runtime 之上构建操作系统

type AgentOS struct {
    Kernel   *RuleEngine      // Rule = 内核安全策略
    Modules  map[string]Skill  // Skill = .so 动态库
    Procs    map[string]Agent  // Agent = 进程
    Scheduler *WorkflowEngine  // Workflow = 进程调度器
}

func (os *AgentOS) Tick(state State) State {
    // 1. 加载内核策略（每个 Tick 前）
    state.Rules = os.Kernel.LoadActiveRules()
    
    // 2. Auto-Routing：查中断向量表
    agentID := os.Kernel.Route(state.Messages.Last())
    
    // 3. fork() 创建 Specialist 进程
    proc := os.Fork(state, agentID)
    
    // 4. 按需加载 Skill（dlopen）
    for skillRef := range proc.Skills {
        state.Context += os.Modules[skillRef].Load()
    }
    
    // 5. 执行 Workflow（预编排的 JMP 链）
    for step := range os.Scheduler.GetWorkflow(proc.WorkflowID) {
        state.Phase = step.Phase
        JMP(step.EntryAddr)
    }
    
    // 6. 汇总结果，回收进程
    return os.Join(proc)
}

func (os *AgentOS) Fork(parent State, agentID string) Agent {
    return Agent{
        State:   deepCopy(parent),      // 完整 State 克隆
        ID:      agentID,
        Tools:   GetAgentTools(agentID), // 每个进程独立 Tool Set
        Skills:  GetAgentSkills(agentID),
    }
}`;
