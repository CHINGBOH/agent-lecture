#!/usr/bin/env python3
"""
知识图谱数据模型设计
- 实体定义：技术概念、代码库、文档、Layer等
- 关系定义：依赖、包含、相似、继承等
- MySQL表结构设计
"""

import os
import json
from typing import List, Dict, Optional

# ============================================================
# 实体类型定义
# ============================================================

class EntityTypes:
    """知识图谱实体类型"""
    CONCEPT = "concept"  # 技术概念
    LAYER = "layer"  # 架构层
    LIBRARY = "library"  # 代码库
    TOOL = "tool"  # 工具
    DOCUMENT = "document"  # 文档
    PATTERN = "pattern"  # 设计模式
    ALGORITHM = "algorithm"  # 算法
    PROTOCOL = "protocol"  # 协议
    METAPHOR = "metaphor"  # 比喻（武侠/生活场景）

# ============================================================
# 关系类型定义
# ============================================================

class RelationTypes:
    """知识图谱关系类型"""
    # 技术关系
    DEPENDS_ON = "depends_on"  # 依赖
    INCLUDES = "includes"  # 包含
    EXTENDS = "extends"  # 扩展
    IMPLEMENTS = "implements"  # 实现
    USES = "uses"  # 使用
    
    # 学习关系
    PREREQUISITE = "prerequisite"  # 前置知识
    LEADS_TO = "leads_to"  # 引导到
    SIMILAR_TO = "similar_to"  # 相似
    ANALOGY_TO = "analogy_to"  # 比喻
    
    # 组织关系
    BELONGS_TO = "belongs_to"  # 属于
    RELATED_TO = "related_to"  # 关联
    VERSION_OF = "version_of"  # 版本

# ============================================================
# MySQL数据库表结构
# ============================================================

MYSQL_SCHEMA = """
-- ============================================================
-- 知识图谱数据库架构
-- ============================================================

-- 1. 实体表
CREATE TABLE entities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    entity_id VARCHAR(64) UNIQUE NOT NULL,  -- 唯一标识，如 'concept:attention'
    entity_type ENUM('concept', 'layer', 'library', 'tool', 'document', 
                     'pattern', 'algorithm', 'protocol', 'metaphor') NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    properties JSON,  -- 扩展属性
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (entity_type),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 关系表
CREATE TABLE relations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    relation_id VARCHAR(64) UNIQUE NOT NULL,
    source_entity_id VARCHAR(64) NOT NULL,
    target_entity_id VARCHAR(64) NOT NULL,
    relation_type ENUM('depends_on', 'includes', 'extends', 'implements', 
                       'uses', 'prerequisite', 'leads_to', 'similar_to',
                       'analogy_to', 'belongs_to', 'related_to', 'version_of') NOT NULL,
    weight FLOAT DEFAULT 1.0,  -- 关系权重
    properties JSON,  -- 关系属性
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_entity_id) REFERENCES entities(entity_id) ON DELETE CASCADE,
    FOREIGN KEY (target_entity_id) REFERENCES entities(entity_id) ON DELETE CASCADE,
    INDEX idx_source (source_entity_id),
    INDEX idx_target (target_entity_id),
    INDEX idx_type (relation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 文档表
CREATE TABLE documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    doc_id VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content MEDIUMTEXT,  -- 文档内容
    file_path VARCHAR(512),  -- 文件路径
    doc_type ENUM('markdown', 'code', 'diagram', 'config') DEFAULT 'markdown',
    metadata JSON,  -- 元数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FULLTEXT idx_content (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 实体-文档关联表
CREATE TABLE entity_documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    entity_id VARCHAR(64) NOT NULL,
    doc_id VARCHAR(64) NOT NULL,
    relevance_score FLOAT DEFAULT 1.0,
    FOREIGN KEY (entity_id) REFERENCES entities(entity_id) ON DELETE CASCADE,
    FOREIGN KEY (doc_id) REFERENCES documents(doc_id) ON DELETE CASCADE,
    UNIQUE KEY uk_entity_doc (entity_id, doc_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Mermaid图表表
CREATE TABLE mermaid_diagrams (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    diagram_id VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    diagram_type ENUM('flowchart', 'sequenceDiagram', 'stateDiagram',
                      'classDiagram', 'graph', 'pie', 'gantt') NOT NULL,
    content TEXT NOT NULL,  -- Mermaid语法内容
    related_entities JSON,  -- 相关实体ID列表
    source_doc_id VARCHAR(64),  -- 来源文档
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_doc_id) REFERENCES documents(doc_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. 学习路径表
CREATE TABLE learning_paths (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    path_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    entities JSON,  -- 路径中的实体序列
    estimated_hours FLOAT,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. 用户笔记表
CREATE TABLE user_notes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    content TEXT,
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_entity (user_id, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 视图：实体关系查询
-- ============================================================

-- 查询某个概念的所有关联
CREATE VIEW v_entity_connections AS
SELECT 
    e1.name AS source_name,
    e1.entity_type AS source_type,
    r.relation_type,
    e2.name AS target_name,
    e2.entity_type AS target_type,
    r.weight
FROM relations r
JOIN entities e1 ON r.source_entity_id = e1.entity_id
JOIN entities e2 ON r.target_entity_id = e2.entity_id;

-- 查询学习路径
CREATE VIEW v_learning_dependencies AS
SELECT 
    e1.name AS concept,
    e2.name AS prerequisite,
    r.weight AS relevance
FROM relations r
JOIN entities e1 ON r.source_entity_id = e1.entity_id
JOIN entities e2 ON r.target_entity_id = e2.entity_id
WHERE r.relation_type = 'prerequisite';
"""

# ============================================================
# 知识图谱示例数据
# ============================================================

SAMPLE_ENTITIES = [
    # Layer实体
    {"entity_id": "layer:0", "entity_type": "layer", "name": "Layer 0: 多故事线入口", 
     "description": "故事比喻层，用金庸武侠和生活场景理解技术概念"},
    {"entity_id": "layer:1", "entity_type": "layer", "name": "Layer 1: LLM训练",
     "description": "从数据到模型的完整训练流程"},
    {"entity_id": "layer:2", "entity_type": "layer", "name": "Layer 2: Runtime内核",
     "description": "操作系统内核级别的运行机制"},
    {"entity_id": "layer:3", "entity_type": "layer", "name": "Layer 3: Agent操作系统",
     "description": "Agent的核心架构和组件"},
    {"entity_id": "layer:4", "entity_type": "layer", "name": "Layer 4: 多Agent编排",
     "description": "多Agent协同和分布式系统"},
    {"entity_id": "layer:5", "entity_type": "layer", "name": "Layer 5: 实战工具",
     "description": "实际工具和应用"},
    
    # 技术概念实体
    {"entity_id": "concept:attention", "entity_type": "concept", "name": "Attention机制",
     "description": "注意力机制，让模型关注重要信息"},
    {"entity_id": "concept:transformer", "entity_type": "concept", "name": "Transformer架构",
     "description": "基于自注意力的序列模型架构"},
    {"entity_id": "concept:tokenization", "entity_type": "concept", "name": "Tokenization",
     "description": "将文本分割为token的过程"},
    {"entity_id": "concept:pretraining", "entity_type": "concept", "name": "Pre-training",
     "description": "在大规模语料上训练基础模型"},
    {"entity_id": "concept:sft", "entity_type": "concept", "name": "SFT指令微调",
     "description": "监督微调，让模型学会按指令输出"},
    {"entity_id": "concept:rlhf", "entity_type": "concept", "name": "RLHF",
     "description": "基于人类反馈的强化学习"},
    {"entity_id": "concept:runtime_tick", "entity_type": "concept", "name": "Runtime Tick",
     "description": "Agent的主循环机制"},
    {"entity_id": "concept:jmp", "entity_type": "concept", "name": "JMP状态跳转",
     "description": "基于程序计数器的状态跳转"},
    {"entity_id": "concept:state_snapshot", "entity_type": "concept", "name": "State Snapshot",
     "description": "Agent状态的序列化快照"},
    {"entity_id": "concept:channel", "entity_type": "concept", "name": "Channel总线",
     "description": "异步通信队列"},
    {"entity_id": "concept:orchestrator", "entity_type": "concept", "name": "Orchestrator",
     "description": "Agent调度器"},
    {"entity_id": "concept:skill_system", "entity_type": "concept", "name": "Skill系统",
     "description": "按需加载的技能模块"},
    {"entity_id": "concept:tool_use", "entity_type": "concept", "name": "Tool Use",
     "description": "Agent使用外部工具"},
    {"entity_id": "concept:multi_agent", "entity_type": "concept", "name": "Multi-Agent",
     "description": "多Agent协同"},
    
    # 比喻实体
    {"entity_id": "metaphor:guojing", "entity_type": "metaphor", "name": "郭靖学武",
     "description": "射雕英雄传中郭靖的成长过程",
     "properties": {"source": "射雕英雄传", "layer": "0-1"}},
    {"entity_id": "metaphor:zhangwuji", "entity_type": "metaphor", "name": "张无忌学九阳",
     "description": "倚天屠龙记中张无忌学九阳神功",
     "properties": {"source": "倚天屠龙记", "layer": "1-2"}},
    {"entity_id": "metaphor:linghuchong", "entity_type": "metaphor", "name": "令狐冲学独孤九剑",
     "description": "笑傲江湖中令狐冲学独孤九剑",
     "properties": {"source": "笑傲江湖", "layer": "2-3"}},
    {"entity_id": "metaphor:restaurant", "entity_type": "metaphor", "name": "餐厅运营",
     "description": "餐厅的领班、厨师、菜谱类比Agent系统",
     "properties": {"source": "生活场景", "layer": "2-3"}},
    {"entity_id": "metaphor:company", "entity_type": "metaphor", "name": "公司运营",
     "description": "公司组织架构类比Multi-Agent系统",
     "properties": {"source": "生活场景", "layer": "3-4"}},
    
    # 库实体
    {"entity_id": "library:transformers", "entity_type": "library", "name": "HuggingFace Transformers",
     "description": "最流行的Transformer模型库",
     "properties": {"stars": 139000, "language": "Python"}},
    {"entity_id": "library:tensorflow", "entity_type": "library", "name": "TensorFlow",
     "description": "Google开源的机器学习框架",
     "properties": {"stars": 184000, "language": "C++"}},
    {"entity_id": "library:langchain", "entity_type": "library", "name": "LangChain",
     "description": "LLM应用开发框架",
     "properties": {"stars": 93000, "language": "Python"}},
    {"entity_id": "library:ollama", "entity_type": "library", "name": "Ollama",
     "description": "本地LLM运行工具",
     "properties": {"stars": 169000, "language": "Go"}},
    {"entity_id": "library:autogpt", "entity_type": "library", "name": "AutoGPT",
     "description": "自主AI Agent",
     "properties": {"stars": 183000, "language": "Python"}},
]

SAMPLE_RELATIONS = [
    # Layer依赖关系
    {"source": "layer:1", "target": "layer:0", "type": "prerequisite", "weight": 1.0},
    {"source": "layer:2", "target": "layer:1", "type": "prerequisite", "weight": 1.0},
    {"source": "layer:3", "target": "layer:2", "type": "prerequisite", "weight": 1.0},
    {"source": "layer:4", "target": "layer:3", "type": "prerequisite", "weight": 1.0},
    {"source": "layer:5", "target": "layer:4", "type": "prerequisite", "weight": 1.0},
    
    # 概念依赖关系
    {"source": "concept:attention", "target": "concept:transformer", "type": "includes", "weight": 0.9},
    {"source": "concept:transformer", "target": "concept:tokenization", "type": "uses", "weight": 0.8},
    {"source": "concept:pretraining", "target": "concept:transformer", "type": "uses", "weight": 0.9},
    {"source": "concept:sft", "target": "concept:pretraining", "type": "prerequisite", "weight": 1.0},
    {"source": "concept:rlhf", "target": "concept:sft", "type": "prerequisite", "weight": 1.0},
    {"source": "concept:runtime_tick", "target": "concept:jmp", "type": "includes", "weight": 0.9},
    {"source": "concept:runtime_tick", "target": "concept:state_snapshot", "type": "uses", "weight": 0.8},
    {"source": "concept:runtime_tick", "target": "concept:channel", "type": "uses", "weight": 0.7},
    {"source": "concept:orchestrator", "target": "concept:skill_system", "type": "uses", "weight": 0.8},
    {"source": "concept:orchestrator", "target": "concept:tool_use", "type": "uses", "weight": 0.7},
    {"source": "concept:multi_agent", "target": "concept:orchestrator", "type": "includes", "weight": 0.9},
    
    # Layer包含概念
    {"source": "layer:1", "target": "concept:attention", "type": "includes", "weight": 1.0},
    {"source": "layer:1", "target": "concept:transformer", "type": "includes", "weight": 1.0},
    {"source": "layer:1", "target": "concept:tokenization", "type": "includes", "weight": 1.0},
    {"source": "layer:1", "target": "concept:pretraining", "type": "includes", "weight": 1.0},
    {"source": "layer:1", "target": "concept:sft", "type": "includes", "weight": 1.0},
    {"source": "layer:1", "target": "concept:rlhf", "type": "includes", "weight": 1.0},
    {"source": "layer:2", "target": "concept:runtime_tick", "type": "includes", "weight": 1.0},
    {"source": "layer:2", "target": "concept:jmp", "type": "includes", "weight": 1.0},
    {"source": "layer:2", "target": "concept:state_snapshot", "type": "includes", "weight": 1.0},
    {"source": "layer:2", "target": "concept:channel", "type": "includes", "weight": 1.0},
    {"source": "layer:3", "target": "concept:orchestrator", "type": "includes", "weight": 1.0},
    {"source": "layer:3", "target": "concept:skill_system", "type": "includes", "weight": 1.0},
    {"source": "layer:3", "target": "concept:tool_use", "type": "includes", "weight": 1.0},
    {"source": "layer:4", "target": "concept:multi_agent", "type": "includes", "weight": 1.0},
    
    # 比喻关联
    {"source": "metaphor:guojing", "target": "layer:0", "type": "analogy_to", "weight": 1.0},
    {"source": "metaphor:guojing", "target": "layer:1", "type": "analogy_to", "weight": 0.9},
    {"source": "metaphor:zhangwuji", "target": "layer:1", "type": "analogy_to", "weight": 1.0},
    {"source": "metaphor:zhangwuji", "target": "layer:2", "type": "analogy_to", "weight": 0.9},
    {"source": "metaphor:linghuchong", "target": "layer:2", "type": "analogy_to", "weight": 1.0},
    {"source": "metaphor:linghuchong", "target": "layer:3", "type": "analogy_to", "weight": 0.9},
    {"source": "metaphor:restaurant", "target": "layer:2", "type": "analogy_to", "weight": 1.0},
    {"source": "metaphor:restaurant", "target": "layer:3", "type": "analogy_to", "weight": 0.9},
    {"source": "metaphor:company", "target": "layer:3", "type": "analogy_to", "weight": 1.0},
    {"source": "metaphor:company", "target": "layer:4", "type": "analogy_to", "weight": 0.9},
    
    # 库关联概念
    {"source": "library:transformers", "target": "concept:transformer", "type": "implements", "weight": 1.0},
    {"source": "library:transformers", "target": "concept:attention", "type": "implements", "weight": 1.0},
    {"source": "library:tensorflow", "target": "concept:pretraining", "type": "implements", "weight": 0.9},
    {"source": "library:langchain", "target": "concept:orchestrator", "type": "implements", "weight": 0.9},
    {"source": "library:langchain", "target": "concept:tool_use", "type": "implements", "weight": 0.8},
    {"source": "library:ollama", "target": "concept:transformer", "type": "uses", "weight": 0.9},
    {"source": "library:autogpt", "target": "concept:multi_agent", "type": "implements", "weight": 0.9},
    {"source": "library:autogpt", "target": "concept:tool_use", "type": "implements", "weight": 0.8},
]

# ============================================================
# 数据库连接配置
# ============================================================

DB_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'port': int(os.getenv('MYSQL_PORT', 3306)),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', ''),
    'database': os.getenv('MYSQL_DATABASE', 'agent_lecture_kg'),
    'charset': 'utf8mb4'
}

# 导出配置
if __name__ == '__main__':
    print("知识图谱数据模型设计完成")
    print("=" * 50)
    print(f"实体类型: {len(vars(EntityTypes))} 种")
    print(f"关系类型: {len(vars(RelationTypes))} 种")
    print(f"示例实体: {len(SAMPLE_ENTITIES)} 个")
    print(f"示例关系: {len(SAMPLE_RELATIONS)} 个")
    print("=" * 50)
    print("\nMySQL表结构已生成，保存在 MYSQL_SCHEMA 变量中")
    print("\n可以执行以下步骤:")
    print("1. 安装MySQL服务器")
    print("2. 创建数据库: CREATE DATABASE agent_lecture_kg")
    print("3. 执行MYSQL_SCHEMA中的SQL语句")
    print("4. 运行导入脚本导入示例数据")
