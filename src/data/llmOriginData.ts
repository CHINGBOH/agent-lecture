// ============================================================
// Layer 0: LLM 前世今生 —— 从数据收集到模型诞生的全链条
// ============================================================

export const dataPipelineCode = `// 数据江湖 —— 从互联网 raw 数据到高质量训练语料

func CollectData():
    // Step 1: 爬取 —— 江湖情报网撒出去
    raw = crawl_web(CommonCrawl, GitHub, Wikipedia, Books)
    // 原始数据量: ~10TB 互联网文本
    print("Raw collected:", len(raw), "documents")

    // Step 2: 清洗 —— 去掉广告、导航栏、乱码
    cleaned = []
    for doc in raw:
        doc = remove_html_tags(doc)
        doc = fix_encoding(doc)           // UTF-8 修复
        doc = strip_boilerplate(doc)      // 去掉页眉页脚
        if len(doc) > 100:                // 太短的不要
            cleaned.append(doc)
    // 剩余: ~5TB
    print("After cleaning:", len(cleaned))

    // Step 3: 去重 —— MinHash + LSH，去掉抄袭/转载
    signatures = []
    for doc in cleaned:
        sig = minhash(shingle(doc, k=5))  // 5-gram 分片
        signatures.append(sig)
    
    unique = lsh_deduplicate(signatures, threshold=0.85)
    // 剩余: ~2TB（去掉60%重复内容）
    print("After dedup:", len(unique))

    // Step 4: 质量过滤 —— Perplexity 阈值，太低的去掉
    high_quality = []
    for doc in unique:
        ppl = small_lm.perplexity(doc)    // 用小模型算困惑度
        if ppl < 500:                     // 太高的 = 乱码/低质量
            high_quality.append(doc)
    // 剩余: ~1TB
    print("Final corpus:", len(high_quality), "(~1TB)")
    return high_quality`;

export const annotationCode = `// 标注与标准 —— 从 raw 语料到(SFT, RLHF)训练数据

func BuildSFTDataset(corpus, instruction_templates):
    sft_data = []
    for template in instruction_templates:  // 数万个指令模板
        for doc in sample(corpus, n=10000):
            // 人工标注员根据模板写回答
            question = template.fill(doc)
            answer = human_annotate(question, doc)
            sft_data.append({
                "instruction": question,
                "input": "",
                "output": answer,
            })
    // SFT 数据集: ~(Q, A) 对，~100万条
    return sft_data

func BuildPreferenceDataset(model, prompts):
    // RLHF 需要 "好回答 vs 坏回答" 的对比数据
    pref_data = []
    for prompt in prompts:
        resp_a = model.generate(prompt, temp=0.7)
        resp_b = model.generate(prompt, temp=1.2)
        // 人类标注员: 哪个回答更好?
        label = human_rank(resp_a, resp_b)  // "A 更好" 或 "B 更好"
        pref_data.append({prompt, resp_a, resp_b, label})
    return pref_data

func SafetyAlignment(red_team_prompts):
    // Red Teaming: 专门找人"攻击"模型，收集有害输入
    safety_data = []
    for bad_prompt in red_team_prompts:     // 诱导模型说有害内容
        refusal = "我不能提供这方面的信息..."
        safety_data.append({
            "prompt": bad_prompt,
            "chosen": refusal,              // 正确的拒绝回答
            "rejected": model.generate(bad_prompt),  // 模型原本的错误回答
        })
    return safety_data`;

export const trainingDetailCode = `// 训练三部曲 —— 从随机参数到"会说话"的大模型

// ===== Stage 1: Pre-training =====
// 目标: 学会语言的统计规律，下一个 token 是什么
func PreTrain(model, corpus):
    optimizer = AdamW(lr=6e-4, betas=(0.9, 0.95), weight_decay=0.1)
    scheduler = CosineDecay(warmup=2000, max_steps=300000)
    
    for step in 1..300000:
        batch = sample(corpus, seq_len=2048, batch_size=512)
        // Forward: 输入 [batch, 2048]，预测每个位置的下一个 token
        logits = model(batch.input_ids)     // [batch, 2048, vocab_size]
        loss = cross_entropy(logits, batch.labels)
        
        // Backward: 计算梯度，更新参数
        loss.backward()
        optimizer.step()
        scheduler.step()                    // 学习率 warmup → 峰值 → cosine 衰减
        
        if step % 1000 == 0:
            print(f"Step {step}: loss={loss:.3f}, lr={scheduler.lr:.2e}")
    // 结果: 模型会"说话"了，但胡说八道、不听话
    return model

// ===== Stage 2: SFT (Supervised Fine-Tuning) =====
// 目标: 学会按人类格式回答问题
func SFT(model, sft_dataset):
    optimizer = AdamW(lr=2e-5)            // 学习率比预训练低 30 倍！
    
    for epoch in 1..3:
        for batch in sft_dataset:
            // 输入格式: <s>[INST] 问题 [/INST] 回答 </s>
            loss = model(batch, labels=batch)  // 只计算"回答"部分的 loss
            loss.backward()
            optimizer.step()
    // 结果: 模型开始按问答格式回复了
    return model

// ===== Stage 3: RLHF (Reinforcement Learning from Human Feedback) =====
// 目标: 让输出更符合人类偏好（有用、无害、诚实）
func RLHF(model, pref_data):
    // 3.1 训练 Reward Model: 学会给回答打分
    reward_model = clone(model)
    for (prompt, resp_a, resp_b, label) in pref_data:
        score_a = reward_model(prompt + resp_a)
        score_b = reward_model(prompt + resp_b)
        loss = -log(sigmoid(score_chosen - score_rejected))
        loss.backward()  // 只更新 reward_model
    
    // 3.2 PPO: 用 Reward Model 的分数来优化原模型
    for prompt in prompts:
        response = model.generate(prompt)       // 当前策略生成回答
        reward = reward_model(prompt + response) // Reward Model 打分
        
        // PPO: 最大化 reward，但不要太偏离 SFT 模型（KL散度约束）
        ppo_loss = -reward + beta * KL(new_model || sft_model)
        ppo_loss.backward()
        optimizer.step()
    return model`;

export const tensorSpaceCode = `// 高维张量空间 —— Transformer 内部发生了什么

func TokenEmbedding(token_ids, vocab_size=50000, dim=4096):
    // 每个 token 映射到一个高维向量
    // "猫" → [0.12, -0.45, 0.88, ..., 0.33]  (4096维)
    embedding_table = Parameter([vocab_size, dim])  // 50000 x 4096
    return embedding_table[token_ids]               // [batch, seq_len, 4096]

func PositionalEncoding(seq_len, dim=4096):
    // 给每个位置一个独特"位置指纹"
    // PE[pos, 2i]   = sin(pos / 10000^(2i/dim))
    // PE[pos, 2i+1] = cos(pos / 10000^(2i/dim))
    return sinusoid_matrix[seq_len, dim]

func SelfAttention(Q, K, V, heads=32):
    // 把 4096 维分成 32 个头，每个头 128 维
    Q = split_heads(Q, heads)    // [batch, heads, seq_len, 128]
    K = split_heads(K, heads)
    V = split_heads(V, heads)
    
    // Attention Score = Q · K^T / sqrt(128)
    scores = matmul(Q, K.transpose()) / sqrt(128)
    // scores[i,j] = "位置 i 对位置 j 的关注程度"
    
    // Softmax: 把分数变成概率分布（每行和为1）
    attn_weights = softmax(scores)   // [batch, heads, seq_len, seq_len]
    
    // 加权求和: 输出 = weights · V
    output = matmul(attn_weights, V) // [batch, heads, seq_len, 128]
    return merge_heads(output)       // [batch, seq_len, 4096]

// 关键洞察:
// - Embedding 层: 离散 token → 连续向量空间
// - Attention: 在高维空间中寻找语义关联（"猫"和"狗"在向量空间中靠近）
// - 多层堆叠: 浅层学语法，深层学语义和推理`;

export const gradientDescentCode = `// 梯度下降之旅 —— 模型如何"学会"知识

// ===== 反向传播 (Backpropagation) =====
func BackwardPass(model, loss):
    // loss 是标量。我们要算: d(loss) / d(每个参数)
    // 链式法则: 从输出层一路反向传回输入层
    
    // 第 L 层（输出层）
    grad_L = d_loss / d_output_L
    
    // 第 L-1 层
    grad_L1 = grad_L * d_output_L / d_output_L1   // 链式法则
    
    // ... 一直传到第 1 层（Embedding）
    // 总参数量: 7B 模型的 ~70 亿个梯度

// ===== AdamW 优化器 =====
func AdamWStep(param, grad, lr, step):
    // Adam = Adaptive + Momentum
    m = beta1 * m + (1-beta1) * grad       // 一阶矩: 动量（梯度平均值）
    v = beta2 * v + (1-beta2) * grad^2     // 二阶矩: 梯度平方的平均值（方差）
    
    m_hat = m / (1 - beta1^step)           // 偏差修正
    v_hat = v / (1 - beta2^step)
    
    // 更新参数: 自适应学习率 = lr / sqrt(v_hat)
    param = param - lr * m_hat / (sqrt(v_hat) + epsilon)
    
    // Weight Decay (L2正则): 防止参数过大
    param = param * (1 - lr * weight_decay)

// ===== 学习率调度 =====
func LRSchedule(step, warmup=2000, max_lr=6e-4, total=300000):
    if step < warmup:
        return max_lr * step / warmup       // Warmup: 从0线性上升到峰值
    else:
        return max_lr * 0.5 * (1 + cos(pi * (step-warmup)/(total-warmup)))
        // Cosine Decay: 峰值后按余弦曲线衰减到接近0

// ===== LoRA (Low-Rank Adaptation) =====
// 不训练全部参数，只训练低秩矩阵
func LoRAForward(x, W_frozen, A, B, rank=64):
    // W_frozen: 预训练好的大矩阵 (4096 x 4096)，冻结不动
    // A: 小矩阵 (4096 x 64)
    // B: 小矩阵 (64 x 4096)
    // 可训练参数量: 4096*64 + 64*4096 = 52万  (原矩阵 1600万，节省97%)
    return x @ W_frozen + x @ A @ B        // 输出 = 原输出 + 低秩微调`;

export const decodingStrategiesCode = `// 解码生成 —— 模型如何从 logits 变成人类可读的文本

func GreedyDecoding(logits):
    // 每一步选概率最高的 token
    // "我今天吃了" → logits = [苹果:0.3, 香蕉:0.5, 西瓜:0.1, ...]
    // Greedy: 永远选 "香蕉"
    next_token = argmax(logits)
    return next_token  // 确定性，但容易重复、缺乏创意

func BeamSearch(logits, beam_width=4):
    // 同时维护4条候选路径，每一步扩展并保留最优的4条
    beams = [([], 0.0)]  // (token序列, 累计log概率)
    for step in 1..max_len:
        candidates = []
        for seq, score in beams:
            for token, log_prob in top_k(logits, k=beam_width*2):
                candidates.append((seq+[token], score + log_prob))
        beams = top_k_by_score(candidates, k=beam_width)
    return best_beam  // 更连贯，但计算量大

func TopKSampling(logits, k=50):
    // 只从概率最高的 k 个 token 中随机选
    top_k_logits = keep_top_k(logits, k)    // 只保留前50个
    top_k_logits[others] = -inf             // 其余的置为负无穷
    probs = softmax(top_k_logits)
    return sample(probs)  // 有随机性，但避免选到离谱的 token

func TopPSampling(logits, p=0.9):
    // Nucleus Sampling: 从累积概率达到 p 的最小 token 集合中采样
    sorted_probs = sort_descending(softmax(logits))
    cumsum = cumulative_sum(sorted_probs)
    cutoff = first_index_where(cumsum > p)  // 累积到90%的位置
    kept_tokens = sorted_probs[:cutoff]
    kept_tokens[others] = -inf
    return sample(softmax(kept_tokens))
    // 动态调整 k:  confidently 时选得少，uncertain 时选得多

func TemperatureScaling(logits, temperature=0.8):
    // Temperature 控制"随机性强度"
    // T→0: 接近 Greedy (确定性)
    // T=1: 原始分布
    // T→∞: 完全均匀随机
    scaled = logits / temperature
    return softmax(scaled)

// 实际使用: Top-p + Temperature 是最常见的组合
func Generate(prompt, model, temp=0.8, top_p=0.9, max_tokens=512):
    tokens = tokenize(prompt)
    for i in 1..max_tokens:
        logits = model(tokens)
        logits = TemperatureScaling(logits[:, -1, :], temp)
        next_token = TopPSampling(logits, p=top_p)
        tokens.append(next_token)
        if next_token == EOS: break
    return detokenize(tokens)`;

export const jsonConstraintCode = `// 结构化输出 —— 强制模型生成合法 JSON

func ConstrainedJSONGenerate(model, prompt, schema):
    // schema = {"type":"object","properties":{"city":{"type":"string"}}}
    tokens = tokenize(prompt)
    
    while not json_complete(tokens, schema):
        logits = model(tokens)  // [vocab_size] 原始分数
        
        // === FSM 状态机约束 ===
        valid_tokens = schema_fsm.next_valid_tokens(schema, tokens)
        // 例如：当前在 "city": " 之后，下一个 token 必须是字符串开头
        
        mask = ones(vocab_size) * (-inf)
        mask[valid_tokens] = 0
        logits = logits + mask   // 非法 token 的分数 = -inf
        
        next_token = sample(softmax(logits))
        tokens.append(next_token)
    
    return parse_json(detokenize(tokens))

// Tool Call 完整链路
func ToolCallFlow(user_input, model, tools):
    // Step 1: 模型收到用户输入 + 可用工具列表
    system_msg = "You can call tools. Available: " + json(tools)
    prompt = system_msg + "\\nUser: " + user_input
    
    // Step 2: 模型生成 → 被 Constrained Decoding 限制为 JSON
    raw_output = ConstrainedJSONGenerate(model, prompt, tool_schema)
    // raw_output = {"name": "getWeather", "arguments": {"city": "北京"}}
    
    // Step 3: 解析并执行工具
    tool_name = raw_output["name"]
    tool_args = raw_output["arguments"]
    result = execute_tool(tool_name, tool_args)  // 实际调用 API
    
    // Step 4: 把工具结果返回给模型，生成最终回答
    prompt += f"\\nTool({tool_name}): {result}"
    final_response = model.generate(prompt)  // "北京今天晴，25°C"
    return final_response`;

// ============================================================
// 数据常量
// ============================================================

export interface DecodingStrategy {
  name: string;
  param: string;
  range: string;
  effect: string;
  analogy: string;
}

export const decodingStrategies: DecodingStrategy[] = [
  { name: 'Greedy', param: '—', range: '确定性', effect: '每次选概率最高的 token，输出可重复', analogy: '郭靖只学一招，每次出同一掌' },
  { name: 'Top-k', param: 'k', range: '1 ~ vocab_size', effect: '只从前 k 个候选中选，k 越小越保守', analogy: '黄蓉限定"只从前50招里选"' },
  { name: 'Top-p (Nucleus)', param: 'p', range: '0.1 ~ 1.0', effect: '从累积概率达 p 的最小集合中选', analogy: '累积概率90%的招式库，自信时库小，犹豫时库大' },
  { name: 'Temperature', param: 'T', range: '0.1 ~ 2.0', effect: 'T→0 趋近确定性，T→∞ 完全随机', analogy: '内功火候：0.1=精准控制，2.0=走火入魔随机出招' },
  { name: 'Beam Search', param: 'beam_width', range: '1 ~ 16', effect: '同时维护多条路径，选全局最优', analogy: '洪七公同时推演4条战术线，选最佳方案' },
];

export interface TrainingStage {
  stage: string;
  dataSize: string;
  duration: string;
  lr: string;
  lossTarget: string;
  analogy: string;
}

export const trainingStages: TrainingStage[] = [
  { stage: 'Pre-training', dataSize: '~1TB 互联网文本', duration: '数周 ~ 数月', lr: '6e-4', lossTarget: 'perplexity < 15', analogy: '江南七怪教基本功：扎马步、练拳脚' },
  { stage: 'SFT', dataSize: '~100万 (Q,A) 对', duration: '数天', lr: '2e-5', lossTarget: 'cross-entropy < 1.0', analogy: '马钰教内功心法：开始有招式套路' },
  { stage: 'RLHF', dataSize: '~10万 偏好对比对', duration: '数天', lr: '1e-6', lossTarget: 'reward 持续上升', analogy: '洪七公实战纠正：哪招打得漂亮，哪招欠火候' },
  { stage: 'Function Calling FT', dataSize: '~50万 Tool 调用样本', duration: '1~2天', lr: '2e-5', lossTarget: 'JSON 格式准确率 > 99%', analogy: '周伯通逼背九阴真经口诀：固定格式，一字不差' },
];

export interface DataStage {
  name: string;
  inputSize: string;
  outputSize: string;
  technique: string;
  analogy: string;
}

export const dataPipelineStages: DataStage[] = [
  { name: '爬取 Raw', inputSize: '—', outputSize: '~10TB', technique: 'CommonCrawl / GitHub / Wiki', analogy: '江湖情报网撒出去，啥消息都收' },
  { name: '清洗', inputSize: '~10TB', outputSize: '~5TB', technique: '去HTML / 修编码 / 去模板', analogy: '去掉广告、乱码、无关页眉页脚' },
  { name: '去重', inputSize: '~5TB', outputSize: '~2TB', technique: 'MinHash + LSH (threshold=0.85)', analogy: '去掉抄袭和转载，只留原创' },
  { name: '质量过滤', inputSize: '~2TB', outputSize: '~1TB', technique: 'Perplexity 阈值 < 500', analogy: ' perplexity 太高 = 乱码/低质量，筛掉' },
];
