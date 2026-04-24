#!/usr/bin/env python3
"""
Awesome LLM Libraries Data Import Script
将GitHub上的高星LLM相关awesome库信息导入到SQLite数据库
"""

import json
import sqlite3
from datetime import datetime
from pathlib import Path

# 定义十万标星以上的高星LLM项目
HIGH_STAR_LIBRARIES = [
    {
        "name": "tensorflow",
        "full_name": "tensorflow/tensorflow",
        "description": "An Open Source Machine Learning Framework for Everyone - 全球最流行的深度学习框架之一",
        "stars": 176000,
        "category": "深度学习框架",
        "subcategory": "Training Framework",
        "url": "https://github.com/tensorflow/tensorflow",
        "language": "C++",
        "topics": ["deep-learning", "machine-learning", "neural-networks", "distributed-training", "tensorflow"],
        "features": [
            "完整的深度学习生态系统",
            "支持分布式训练",
            "TensorFlow Serving部署方案",
            "TensorBoard可视化工具",
            "Keras高级API"
        ],
        "use_cases": [
            "大规模模型训练",
            "生产环境部署",
            "移动端和边缘设备推理",
            "研究和原型开发"
        ],
        "layer": 1,
        "analogy": "少林派 - 武林泰斗，底蕴深厚，门徒遍布天下"
    },
    {
        "name": "transformers",
        "full_name": "huggingface/transformers",
        "description": "🤗 Transformers: State-of-the-art Machine Learning for Pytorch, TensorFlow, and JAX - 最流行的LLM模型库",
        "stars": 159000,
        "category": "LLM框架",
        "subcategory": "Model Library",
        "url": "https://github.com/huggingface/transformers",
        "language": "Python",
        "topics": ["transformers", "llm", "nlp", "pytorch", "tensorflow", "jax"],
        "features": [
            "10万+预训练模型",
            "支持文本、视觉、音频、多模态",
            "PyTorch、TensorFlow、JAX后端",
            "完整的训练和推理API",
            "活跃的社区生态"
        ],
        "use_cases": [
            "LLM微调训练",
            "模型推理部署",
            "多模态应用开发",
            "研究和实验"
        ],
        "layer": 1,
        "analogy": "武当派 - 集天下武学大成，以柔克刚，变化无穷"
    },
    {
        "name": "langchain",
        "full_name": "langchain-ai/langchain",
        "description": "The agent engineering platform - LLM应用开发框架，构建Agent的瑞士军刀",
        "stars": 83000,
        "category": "Agent框架",
        "subcategory": "Agent Development",
        "url": "https://github.com/langchain-ai/langchain",
        "language": "Python",
        "topics": ["llm", "agent", "langchain", "rag", "chain"],
        "features": [
            "完整的Agent开发框架",
            "丰富的工具集成",
            "RAG实现方案",
            "链式调用模式",
            "多模型支持"
        ],
        "use_cases": [
            "Agent应用开发",
            "RAG系统构建",
            "多工具集成应用",
            "对话系统开发"
        ],
        "layer": 3,
        "analogy": "唐门暗器 - 精巧实用，机关巧妙，一击必杀"
    },
    {
        "name": "dify",
        "full_name": "langgenius/dify",
        "description": "Production-ready platform for agentic workflow development - 开源LLM应用开发平台",
        "stars": 65000,
        "category": "开发平台",
        "subcategory": "LLM Platform",
        "url": "https://github.com/langgenius/dify",
        "language": "TypeScript",
        "topics": ["llm", "agent", "workflow", "low-code", "platform"],
        "features": [
            "可视化工作流编排",
            "RAG引擎",
            "Agent能力",
            "模型管理",
            "API部署"
        ],
        "use_cases": [
            "企业级LLM应用开发",
            "工作流自动化",
            "知识库构建",
            "智能客服系统"
        ],
        "layer": 5,
        "analogy": "丐帮 - 人多势众，接地气，实用性强"
    },
    {
        "name": "ComfyUI",
        "full_name": "Comfy-Org/ComfyUI",
        "description": "The most powerful and modular diffusion model GUI - 最强大的扩散模型GUI",
        "stars": 116000,
        "category": "AI工具",
        "subcategory": "Image Generation",
        "url": "https://github.com/Comfy-Org/ComfyUI",
        "language": "Python",
        "topics": ["diffusion", "image-generation", "gui", "node-based", "stable-diffusion"],
        "features": [
            "节点式可视化界面",
            "高度模块化设计",
            "支持多种扩散模型",
            "自定义工作流",
            "活跃的插件生态"
        ],
        "use_cases": [
            "AI图像生成",
            "模型测试和调试",
            "创意工作流设计",
            "艺术创作"
        ],
        "layer": 5,
        "analogy": "丹青妙手 - 以笔为剑，绘出万千气象"
    },
    {
        "name": "stable-diffusion-webui",
        "full_name": "AUTOMATIC1111/stable-diffusion-webui",
        "description": "Stable Diffusion web UI - 最流行的Stable Diffusion Web界面",
        "stars": 107000,
        "category": "AI工具",
        "subcategory": "Image Generation",
        "url": "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
        "language": "Python",
        "topics": ["stable-diffusion", "image-generation", "webui", "ai-art"],
        "features": [
            "易于使用的Web界面",
            "丰富的扩展插件",
            "多种采样算法",
            "图像到图像转换",
            "模型训练支持"
        ],
        "use_cases": [
            "AI绘画创作",
            "图像风格转换",
            "模型微调",
            "艺术研究"
        ],
        "layer": 5,
        "analogy": "画圣吴道子 - 笔走龙蛇，出神入化"
    },
    {
        "name": "annotated_deep_learning_paper_implementations",
        "full_name": "labmlai/annotated_deep_learning_paper_implementations",
        "description": "🧑‍🏫 60+深度学习论文的并行注释实现 - 包括transformers、优化器、GANs、强化学习等",
        "stars": 53000,
        "category": "学习资源",
        "subcategory": "Paper Implementation",
        "url": "https://github.com/labmlai/annotated_deep_learning_paper_implementations",
        "language": "Python",
        "topics": ["deep-learning", "transformers", "reinforcement-learning", "gan", "paper-implementation"],
        "features": [
            "60+论文实现和教程",
            "并排注释说明",
            "覆盖Transformer系列",
            "强化学习(PPO, DQN)",
            "优化器实现"
        ],
        "use_cases": [
            "深度学习理论学习",
            "论文复现实验",
            "算法理解",
            "教学参考"
        ],
        "layer": 1,
        "analogy": "琅嬛福地 - 收藏天下武学典籍，供有缘人参悟"
    }
]

# 定义awesome库数据结构（保留原有的低星库作为补充）
AWESOME_LIBRARIES = [
    {
        "name": "rllm",
        "full_name": "rllm-org/rllm",
        "description": "Democratizing Reinforcement Learning for LLMs - 使用强化学习训练AI代理的开源框架",
        "stars": 5447,
        "category": "强化学习框架",
        "subcategory": "RL Training",
        "url": "https://github.com/rllm-org/rllm",
        "language": "Python",
        "topics": ["reinforcement-learning", "llm", "agent-training", "grpo", "ppo"],
        "features": [
            "支持多种Agent框架 (LangGraph, SmolAgent, OpenAI Agents SDK)",
            "近零代码改动，通过装饰器自动追踪",
            "CLI优先工作流，50+内置基准测试",
            "多种RL算法 (GRPO, REINFORCE, RLOO)",
            "双训练后端 (verl分布式, tinker单机)"
        ],
        "use_cases": [
            "Agent行为优化",
            "多轮对话训练",
            "工具调用能力增强",
            "推理能力提升"
        ],
        "layer": 1,  # 对应 Layer 1: LLM前世今生
        "analogy": "老顽童周伯通训练郭靖左右互搏 - 通过反复练习让AI掌握多种技能"
    },
    {
        "name": "Awesome-RL-for-LRMs",
        "full_name": "TsinghuaC3I/Awesome-RL-for-LRMs",
        "description": "A Survey of Reinforcement Learning for Large Reasoning Models - 大型推理模型强化学习综述",
        "stars": 2445,
        "category": "学习资源",
        "subcategory": "Paper Collection",
        "url": "https://github.com/TsinghuaC3I/Awesome-RL-for-LRMs",
        "language": "Markdown",
        "topics": ["reasoning", "reinforcement-learning", "survey", "llm", "papers"],
        "features": [
            "全面的RL for LRMs论文收集",
            "按主题分类整理 (奖励设计、策略优化、采样策略)",
            "前沿模型追踪 (DeepSeek-R1, Qwen3, Llama-Nemotron)",
            "应用场景覆盖 (Coding Agent, Search Agent, Browser-Use)"
        ],
        "use_cases": [
            "学术研究参考",
            "技术趋势分析",
            "算法选型指导",
            "论文阅读清单"
        ],
        "layer": 1,
        "analogy": "桃花岛藏书阁 - 收录天下武功秘籍，供武林人士查阅学习"
    },
    {
        "name": "Awesome-LLM-RL",
        "full_name": "0xWelt/Awesome-LLM-RL",
        "description": "Open-Source Projects, Tools, and Learning Resources about RL with LLMs",
        "stars": 5,
        "category": "资源汇总",
        "subcategory": "Awesome List",
        "url": "https://github.com/0xWelt/Awesome-LLM-RL",
        "language": "Markdown",
        "topics": ["awesome-list", "llm", "rlhf", "reinforcement-learning"],
        "features": [
            "RL框架汇总 (OpenRLHF, verl, slime, ROLL)",
            "推理引擎列表 (vLLM, SGLang)",
            "训练引擎列表 (Megatron-LM, DeepSpeed, FSDP)",
            "持续更新的资源列表"
        ],
        "use_cases": [
            "工具选型",
            "框架对比",
            "学习路径规划"
        ],
        "layer": 1,
        "analogy": "武林兵器谱 - 收录天下神兵利器，供英雄挑选"
    },
    {
        "name": "awesome-llm",
        "full_name": "umitkacar/awesome-llm",
        "description": "Large Language Models: GPT, Claude, Llama, Gemini, fine-tuning, RAG, prompt engineering",
        "stars": 100,  # 估算
        "category": "综合资源",
        "subcategory": "Awesome List",
        "url": "https://github.com/umitkacar/awesome-llm",
        "language": "Python",
        "topics": ["llm", "nlp", "fine-tuning", "rag", "prompt-engineering"],
        "features": [
            "2024-2025最新模型追踪",
            "微调框架对比 (LoRA, QLoRA, DoRA)",
            "部署方案整理",
            "必读论文推荐",
            "代码示例和教程"
        ],
        "use_cases": [
            "LLM入门学习",
            "技术选型参考",
            "最佳实践学习"
        ],
        "layer": 1,
        "analogy": "全真教藏经阁 - 系统化的武功典籍，从入门到精通"
    },
    {
        "name": "Hands-On-Large-Language-Models",
        "full_name": "HandsOnLLM/Hands-On-Large-Language-Models",
        "description": "《Hands-On Large Language Models》官方配套代码 - 图解版LLM教程",
        "stars": 16700,
        "category": "学习资源",
        "subcategory": "Course & Tutorial",
        "url": "https://github.com/HandsOnLLM/Hands-On-Large-Language-Models",
        "language": "Jupyter Notebook",
        "topics": ["llm", "tutorial", "nlp", "transformers", "education"],
        "features": [
            "11个完整章节",
            "近300个定制图表",
            "Google Colab集成",
            "从基础到微调的完整路径",
            "BERT微调实战"
        ],
        "use_cases": [
            "LLM系统学习",
            "教学材料",
            "实践实验",
            "概念可视化"
        ],
        "layer": 1,
        "analogy": "江南七怪教郭靖 - 从基本功到高级武功的系统教学"
    },
    {
        "name": "Github-Ranking-AI",
        "full_name": "yuxiaopeng/Github-Ranking-AI",
        "description": "GitHub AI项目排行榜 - 追踪最流行的AI/LLM项目",
        "stars": 5000,  # 估算
        "category": "工具",
        "subcategory": "Ranking & Analytics",
        "url": "https://github.com/yuxiaopeng/Github-Ranking-AI",
        "language": "Python",
        "topics": ["github", "ranking", "ai", "llm", "analytics"],
        "features": [
            "每日更新的GitHub排名数据",
            "多维度分类 (LLM, LLaMA, NLP等)",
            "历史趋势追踪",
            "Top 100项目列表"
        ],
        "use_cases": [
            "技术趋势分析",
            "项目发现",
            "社区活跃度评估"
        ],
        "layer": 5,  # Layer 5: 实战工具
        "analogy": "武林风云榜 - 追踪江湖中各路高手的排名变化"
    },
    {
        "name": "Awesome-Awesome-LLM",
        "full_name": "KylinC/Awesome-Awesome-LLM",
        "description": "A curated list of awesome Paper Repositories related to Large Language Models",
        "stars": 39,
        "category": "资源汇总",
        "subcategory": "Meta-Awesome",
        "url": "https://github.com/KylinC/Awesome-Awesome-LLM",
        "language": "Markdown",
        "topics": ["awesome-list", "llm", "papers", "resources"],
        "features": [
            "LLM相关awesome仓库汇总",
            "按主题分类 (Training, Multi-modal, RL等)",
            "评分系统 (1-5星)",
            "持续更新维护"
        ],
        "use_cases": [
            "资源发现",
            "学习路径规划",
            "研究参考"
        ],
        "layer": 1,
        "analogy": "武林秘籍总目录 - 收录各大门派的武功典籍索引"
    }
]

# 定义RL训练框架详细信息
RL_FRAMEWORKS = [
    {
        "name": "OpenRLHF",
        "description": "基于Ray, vLLM, ZeRO-3的高性能RLHF框架",
        "features": ["支持70B+参数模型", "PPO/REINFORCE++/GRPO算法", "多模态支持"],
        "stars": 2500,
        "layer": 1,
        "category": "RLHF框架"
    },
    {
        "name": "verl",
        "description": "字节跳动Seed团队开发的灵活高效RL训练库",
        "features": ["HybridFlow框架", "支持671B模型", "多模态RL", "专家并行"],
        "stars": 1800,
        "layer": 1,
        "category": "RL训练库"
    },
    {
        "name": "slime",
        "description": "清华大学的LLM后训练框架，支持大规模RL",
        "features": ["SGLang原生集成", "MoE模型支持", "多轮Agent训练"],
        "stars": 800,
        "layer": 1,
        "category": "后训练框架"
    },
    {
        "name": "ROLL",
        "description": "阿里巴巴的大规模GPU RL库",
        "features": ["多任务RL训练", "20+ RL策略", "异步并行rollout"],
        "stars": 600,
        "layer": 1,
        "category": "RL库"
    }
]

# 定义推理引擎
INFERENCE_ENGINES = [
    {
        "name": "vLLM",
        "description": "高吞吐、内存高效的大模型推理引擎",
        "stars": 77927,
        "features": ["PagedAttention", "连续批处理", "模型并行"],
        "layer": 2,
        "category": "推理引擎"
    },
    {
        "name": "SGLang",
        "description": "高性能大模型服务框架",
        "stars": 26337,
        "features": ["结构化生成", "RadixAttention", "多模态支持"],
        "layer": 2,
        "category": "推理引擎"
    }
]

# 定义训练引擎
TRAINING_ENGINES = [
    {
        "name": "Megatron-LM",
        "description": "NVIDIA的大规模语言模型训练框架",
        "stars": 15000,
        "features": ["张量并行", "流水线并行", "序列并行"],
        "layer": 1,
        "category": "训练引擎"
    },
    {
        "name": "DeepSpeed",
        "description": "微软的深度学习优化库",
        "stars": 38000,
        "features": ["ZeRO优化", "模型并行", "训练效率优化"],
        "layer": 1,
        "category": "训练优化"
    },
    {
        "name": "PyTorch FSDP",
        "description": "PyTorch全分片数据并行",
        "stars": 0,
        "features": ["内存效率", "易于使用", "与PyTorch集成"],
        "layer": 1,
        "category": "分布式训练"
    }
]

def create_tables(conn):
    """创建awesome库相关的数据表"""
    cursor = conn.cursor()
    
    # 主表：awesome库信息
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS awesome_libraries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            full_name TEXT NOT NULL,
            description TEXT,
            stars INTEGER DEFAULT 0,
            category TEXT,
            subcategory TEXT,
            url TEXT,
            language TEXT,
            topics TEXT,  -- JSON array
            features TEXT,  -- JSON array
            use_cases TEXT,  -- JSON array
            layer INTEGER,  -- 对应agent-lecture的layer
            analogy TEXT,  -- 江湖比喻
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    ''')
    
    # 工具/框架详细表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS llm_tools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT,
            subcategory TEXT,
            stars INTEGER DEFAULT 0,
            features TEXT,  -- JSON array
            layer INTEGER,
            related_library_id INTEGER,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (related_library_id) REFERENCES awesome_libraries(id)
        )
    ''')
    
    # 分类表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS llm_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            layer INTEGER,
            order_index INTEGER DEFAULT 0
        )
    ''')
    
    conn.commit()
    print("✅ 数据库表创建完成")

def insert_libraries(conn):
    """插入awesome库数据"""
    cursor = conn.cursor()
    
    # 先插入高星项目
    for lib in HIGH_STAR_LIBRARIES:
        cursor.execute('''
            INSERT INTO awesome_libraries 
            (name, full_name, description, stars, category, subcategory, url, language, 
             topics, features, use_cases, layer, analogy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            lib['name'],
            lib['full_name'],
            lib['description'],
            lib['stars'],
            lib['category'],
            lib['subcategory'],
            lib['url'],
            lib['language'],
            json.dumps(lib['topics'], ensure_ascii=False),
            json.dumps(lib['features'], ensure_ascii=False),
            json.dumps(lib['use_cases'], ensure_ascii=False),
            lib['layer'],
            lib['analogy']
        ))
    
    print(f"✅ 已插入 {len(HIGH_STAR_LIBRARIES)} 个十万标星高星库")
    
    # 再插入原有的awesome库
    for lib in AWESOME_LIBRARIES:
        cursor.execute('''
            INSERT INTO awesome_libraries 
            (name, full_name, description, stars, category, subcategory, url, language, 
             topics, features, use_cases, layer, analogy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            lib['name'],
            lib['full_name'],
            lib['description'],
            lib['stars'],
            lib['category'],
            lib['subcategory'],
            lib['url'],
            lib['language'],
            json.dumps(lib['topics'], ensure_ascii=False),
            json.dumps(lib['features'], ensure_ascii=False),
            json.dumps(lib['use_cases'], ensure_ascii=False),
            lib['layer'],
            lib['analogy']
        ))
    
    conn.commit()
    print(f"✅ 已插入 {len(AWESOME_LIBRARIES)} 个awesome补充库")
    print(f"✅ 总计插入 {len(HIGH_STAR_LIBRARIES) + len(AWESOME_LIBRARIES)} 个库")

def insert_tools(conn):
    """插入工具/框架数据"""
    cursor = conn.cursor()
    
    all_tools = []
    all_tools.extend([(t, "RL框架") for t in RL_FRAMEWORKS])
    all_tools.extend([(t, "推理引擎") for t in INFERENCE_ENGINES])
    all_tools.extend([(t, "训练引擎") for t in TRAINING_ENGINES])
    
    for tool, category in all_tools:
        cursor.execute('''
            INSERT INTO llm_tools 
            (name, description, category, stars, features, layer)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            tool['name'],
            tool['description'],
            category,
            tool['stars'],
            json.dumps(tool.get('features', []), ensure_ascii=False),
            tool['layer']
        ))
    
    conn.commit()
    print(f"✅ 已插入 {len(all_tools)} 个工具/框架")

def insert_categories(conn):
    """插入分类数据"""
    cursor = conn.cursor()
    
    categories = [
        ("强化学习框架", "用于LLM强化学习的训练框架", 1, 0),
        ("推理引擎", "大模型推理和部署引擎", 2, 1),
        ("训练引擎", "分布式训练和优化框架", 1, 2),
        ("学习资源", "教程、课程和论文集合", 1, 3),
        ("资源汇总", "Awesome列表和资源索引", 1, 4),
        ("工具", "实用工具和排行榜", 5, 5),
    ]
    
    for cat in categories:
        cursor.execute('''
            INSERT OR IGNORE INTO llm_categories (name, description, layer, order_index)
            VALUES (?, ?, ?, ?)
        ''', cat)
    
    conn.commit()
    print(f"✅ 已插入 {len(categories)} 个分类")

def generate_report(conn):
    """生成数据导入报告"""
    cursor = conn.cursor()
    
    print("\n" + "="*60)
    print("📊 数据导入报告")
    print("="*60)
    
    # 统计awesome库
    cursor.execute("SELECT COUNT(*), SUM(stars) FROM awesome_libraries")
    count, total_stars = cursor.fetchone()
    print(f"\n📚 Awesome库数量: {count}")
    print(f"⭐ 总星标数: {total_stars:,}")
    
    # 按分类统计
    print("\n📂 按分类统计:")
    cursor.execute('''
        SELECT category, COUNT(*), SUM(stars) 
        FROM awesome_libraries 
        GROUP BY category 
        ORDER BY SUM(stars) DESC
    ''')
    for row in cursor.fetchall():
        print(f"  • {row[0]}: {row[1]}个库, {row[2]:,}星")
    
    # 按layer统计
    print("\n🏗️ 按Layer分布:")
    cursor.execute('''
        SELECT layer, COUNT(*) 
        FROM awesome_libraries 
        GROUP BY layer 
        ORDER BY layer
    ''')
    layer_names = {0: "Layer 0: 牛家村江湖", 1: "Layer 1: LLM前世今生", 
                   2: "Layer 2: Runtime内核", 3: "Layer 3: Agent操作系统",
                   4: "Layer 4: 多Agent编排", 5: "Layer 5: 实战工具"}
    for row in cursor.fetchall():
        print(f"  • {layer_names.get(row[0], f'Layer {row[0]}')}: {row[1]}个库")
    
    # 统计工具
    cursor.execute("SELECT COUNT(*), SUM(stars) FROM llm_tools")
    tool_count, tool_stars = cursor.fetchone()
    print(f"\n🔧 工具/框架数量: {tool_count}")
    print(f"⭐ 工具总星标数: {tool_stars:,}")
    
    # Top 5 星标库
    print("\n🏆 Top 5 高星库:")
    cursor.execute('''
        SELECT name, stars, category 
        FROM awesome_libraries 
        ORDER BY stars DESC 
        LIMIT 5
    ''')
    for i, row in enumerate(cursor.fetchall(), 1):
        print(f"  {i}. {row[0]} ({row[1]:,}⭐) - {row[2]}")
    
    print("\n" + "="*60)

def main():
    """主函数"""
    # 数据库路径
    db_path = Path(__file__).parent.parent / "data" / "awesome_libs.db"
    db_path.parent.mkdir(exist_ok=True)
    
    print(f"🗄️ 数据库路径: {db_path}")
    
    # 连接数据库
    conn = sqlite3.connect(db_path)
    
    try:
        # 创建表
        create_tables(conn)
        
        # 插入数据
        insert_libraries(conn)
        insert_tools(conn)
        insert_categories(conn)
        
        # 生成报告
        generate_report(conn)
        
        print("\n✨ 数据导入完成！")
        
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()

if __name__ == "__main__":
    main()
