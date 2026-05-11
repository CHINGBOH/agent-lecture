#!/usr/bin/env python3
"""
知识图谱构建工具
- 从本地MD文档提取技术概念
- 分析Mermaid图表
- 构建实体和关系
- 导入MySQL数据库
"""

import os
import re
import json
import glob
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from knowledge_graph_model import SAMPLE_ENTITIES, SAMPLE_RELATIONS, DB_CONFIG

# 可选导入MySQL模块
try:
    from migrate_knowledge_graph import KnowledgeGraphDB
    HAS_MYSQL = True
except ImportError:
    HAS_MYSQL = False
    print("⚠️ mysql.connector未安装，将仅导出JSON格式")
    print("   安装方法: pip install mysql-connector-python")


class KnowledgeGraphBuilder:
    """知识图谱构建器"""
    
    def __init__(self, root_dir: str):
        self.root_dir = Path(root_dir)
        self.entities = {}
        self.relations = []
        self.mermaid_diagrams = []
        self.doc_entities = []
        
    def scan_md_files(self, max_files: int = 100) -> List[Path]:
        """扫描MD文件（限制数量避免处理过多）"""
        md_files = []
        for ext in ['.md', '.markdown']:
            md_files.extend(self.root_dir.rglob(f'*{ext}'))
        
        # 过滤掉一些不需要的目录
        exclude_dirs = {'node_modules', '.git', '__pycache__', 'venv'}
        md_files = [f for f in md_files if not any(ex in f.parts for ex in exclude_dirs)]
        
        # 优先处理项目核心文档
        priority_patterns = [
            'ARCHITECTURE.md',
            'AWESOME_LIBS_INTEGRATION_PLAN.md',
            'README.md',
            'docs/**/*.md',
            'src/**/*.md',
        ]
        
        priority_files = []
        for pattern in priority_patterns:
            priority_files.extend(glob.glob(str(self.root_dir / pattern), recursive=True))
        
        # 合并并去重
        all_files = list(set(md_files + [Path(f) for f in priority_files]))
        return all_files[:max_files]
    
    def extract_tech_concepts(self, content: str, file_path: str) -> List[Dict]:
        """从文档中提取技术概念"""
        concepts = []
        
        # 1. 提取标题中的技术概念
        headings = re.findall(r'^#{1,6}\s+(.+)$', content, re.MULTILINE)
        for heading in headings:
            # 过滤掉太短或纯英文的标题
            heading = heading.strip()
            if len(heading) > 3 and any(c.isalpha() for c in heading):
                concept_id = f"concept:{heading.lower().replace(' ', '_').replace(':', '')}"
                concepts.append({
                    "entity_id": concept_id,
                    "entity_type": "concept",
                    "name": heading,
                    "description": f"来自文档: {file_path}",
                    "properties": {"source_file": file_path}
                })
        
        # 2. 提取Layer相关概念
        layer_matches = re.findall(r'Layer\s+(\d+)[：:]\s*([^\n]+)', content)
        for layer_num, layer_name in layer_matches:
            layer_id = f"layer:{layer_num}"
            if layer_id not in self.entities:
                concepts.append({
                    "entity_id": layer_id,
                    "entity_type": "layer",
                    "name": f"Layer {layer_num}: {layer_name.strip()}",
                    "description": f"架构层: {layer_name.strip()}",
                    "properties": {"layer_number": int(layer_num)}
                })
        
        # 3. 提取技术关键词
        tech_keywords = [
            'attention', 'transformer', 'tokenization', 'pre-training',
            'fine-tuning', 'RLHF', 'SFT', 'LLM', 'Agent',
            'Runtime', 'JMP', 'State', 'Channel', 'Orchestrator',
            'Skill', 'Tool', 'Multi-Agent', 'MCP', 'RAG'
        ]
        
        content_lower = content.lower()
        for keyword in tech_keywords:
            if keyword.lower() in content_lower:
                concept_id = f"concept:{keyword.lower().replace('-', '_')}"
                concepts.append({
                    "entity_id": concept_id,
                    "entity_type": "concept",
                    "name": keyword,
                    "description": f"在文档 {file_path} 中被提及",
                    "properties": {"source_file": file_path}
                })
        
        return concepts
    
    def extract_mermaid_diagrams(self, content: str, file_path: str) -> List[Dict]:
        """提取Mermaid图表"""
        diagrams = []
        
        # 匹配Mermaid代码块
        mermaid_pattern = r'```(?:mermaid)?\s*\n(flowchart|sequenceDiagram|stateDiagram|graph|classDiagram)[\s\S]*?```'
        matches = re.findall(mermaid_pattern, content, re.IGNORECASE)
        
        for i, match in enumerate(matches):
            diagram_id = f"diagram:{file_path.replace('/', '_')}_{i}"
            diagrams.append({
                "diagram_id": diagram_id,
                "title": f"图表 {i+1}",
                "diagram_type": match.lower() if match.lower() in ['flowchart', 'sequenceDiagram', 'stateDiagram', 'graph', 'classDiagram'] else 'flowchart',
                "content": "",  # 这里简化处理
                "source_file": file_path
            })
        
        return diagrams
    
    def extract_relations(self, content: str, file_path: str) -> List[Dict]:
        """从文档中提取关系"""
        relations = []
        
        # 1. 提取"前置知识"关系
        prereq_patterns = [
            r'前置[知识要求]*[：:]\s*([^\n]+)',
            r'prerequisite[：:]\s*([^\n]+)',
            r'before\s+([^\n]+)',
        ]
        for pattern in prereq_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                target = match.strip()
                relations.append({
                    "source": f"concept:{file_path.split('/')[-1]}",
                    "target": f"concept:{target.lower().replace(' ', '_')}",
                    "type": "prerequisite"
                })
        
        # 2. 提取"包含"关系
        include_patterns = [
            r'包含[：:]\s*([^\n]+)',
            r'includes[：:]\s*([^\n]+)',
            r'由.*组成[：:]\s*([^\n]+)',
        ]
        for pattern in include_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                # 分割多个项目
                items = re.split(r'[、，,]', match.strip())
                for item in items:
                    item = item.strip()
                    if item:
                        relations.append({
                            "source": f"concept:{file_path.split('/')[-1]}",
                            "target": f"concept:{item.lower().replace(' ', '_')}",
                            "type": "includes"
                        })
        
        return relations
    
    def build_from_docs(self, max_files: int = 100):
        """从文档构建知识图谱"""
        print("📚 开始扫描文档...")
        md_files = self.scan_md_files(max_files)
        print(f"   找到 {len(md_files)} 个MD文件")
        
        for i, file_path in enumerate(md_files):
            if i % 20 == 0:
                print(f"   处理进度: {i}/{len(md_files)}")
            
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                relative_path = str(file_path.relative_to(self.root_dir))
                
                # 提取技术概念
                concepts = self.extract_tech_concepts(content, relative_path)
                for concept in concepts:
                    if concept['entity_id'] not in self.entities:
                        self.entities[concept['entity_id']] = concept
                
                # 提取Mermaid图表
                diagrams = self.extract_mermaid_diagrams(content, relative_path)
                self.mermaid_diagrams.extend(diagrams)
                
                # 提取关系
                file_relations = self.extract_relations(content, relative_path)
                self.relations.extend(file_relations)
                
            except Exception as e:
                print(f"   ⚠️ 处理文件 {file_path} 失败: {e}")
        
        print(f"\n✅ 文档处理完成:")
        print(f"   - 提取实体: {len(self.entities)} 个")
        print(f"   - 提取关系: {len(self.relations)} 个")
        print(f"   - 提取图表: {len(self.mermaid_diagrams)} 个")
    
    def merge_with_sample_data(self):
        """合并示例数据"""
        # 合并示例实体
        for entity in SAMPLE_ENTITIES:
            if entity['entity_id'] not in self.entities:
                self.entities[entity['entity_id']] = entity
        
        # 合并示例关系
        for i, rel in enumerate(SAMPLE_RELATIONS):
            self.relations.append({
                "source": rel['source'],
                "target": rel['target'],
                "type": rel['type'],
                "weight": rel.get('weight', 1.0)
            })
        
        print(f"\n✅ 数据合并完成:")
        print(f"   - 总实体数: {len(self.entities)}")
        print(f"   - 总关系数: {len(self.relations)}")
    
    def export_to_json(self, output_file: str = 'knowledge_graph.json'):
        """导出为JSON格式"""
        data = {
            "entities": list(self.entities.values()),
            "relations": self.relations,
            "mermaid_diagrams": self.mermaid_diagrams,
            "statistics": {
                "total_entities": len(self.entities),
                "total_relations": len(self.relations),
                "total_diagrams": len(self.mermaid_diagrams),
                "entity_types": {},
                "relation_types": {}
            }
        }
        
        # 统计实体类型
        for entity in self.entities.values():
            etype = entity.get('entity_type', 'unknown')
            data['statistics']['entity_types'][etype] = \
                data['statistics']['entity_types'].get(etype, 0) + 1
        
        # 统计关系类型
        for rel in self.relations:
            rtype = rel.get('type', 'unknown')
            data['statistics']['relation_types'][rtype] = \
                data['statistics']['relation_types'].get(rtype, 0) + 1
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"\n📄 知识图谱已导出到: {output_file}")
        return data
    
    def import_to_mysql(self, db_config=None):
        """导入到MySQL数据库"""
        if not HAS_MYSQL:
            print("❌ MySQL模块未安装，无法导入")
            return False
        
        print("\n🔗 开始导入到MySQL数据库...")
        
        db = KnowledgeGraphDB(db_config or DB_CONFIG)
        
        # 创建数据库
        if not db.create_database():
            print("❌ 数据库创建失败")
            return False
        
        # 连接数据库
        if not db.connect():
            print("❌ 数据库连接失败")
            return False
        
        # 创建表结构
        if not db.execute_schema():
            print("❌ 表结构创建失败")
            db.disconnect()
            return False
        
        # 导入实体
        entities_list = list(self.entities.values())
        if not db.import_entities(entities_list):
            print("❌ 实体导入失败")
            db.disconnect()
            return False
        
        # 导入关系
        if not db.import_relations(self.relations):
            print("❌ 关系导入失败")
            db.disconnect()
            return False
        
        # 显示统计信息
        stats = db.get_statistics()
        if stats:
            print(f"\n📊 数据库统计信息:")
            print(f"   - 总实体数: {stats.get('total_entities', 0)}")
            print(f"   - 总关系数: {stats.get('total_relations', 0)}")
        
        db.disconnect()
        print("\n✅ MySQL导入完成")
        return True


def main():
    """主函数"""
    print("=" * 60)
    print("🕸️ 知识图谱构建工具")
    print("=" * 60)
    
    # 项目根目录
    root_dir = '/home/l/agent-lecture'
    
    builder = KnowledgeGraphBuilder(root_dir)
    
    # 1. 从文档提取
    print("\n📚 步骤1: 从文档提取知识")
    builder.build_from_docs(max_files=50)
    
    # 2. 合并示例数据
    print("\n🔀 步骤2: 合并示例数据")
    builder.merge_with_sample_data()
    
    # 3. 导出为JSON
    print("\n📄 步骤3: 导出知识图谱")
    data = builder.export_to_json('knowledge_graph.json')
    
    # 4. 导入MySQL
    print("\n🔗 步骤4: 导入MySQL")
    if os.getenv('MYSQL_PASSWORD'):
        builder.import_to_mysql()
    else:
        print("⚠️ 未设置MYSQL_PASSWORD，跳过MySQL导入")
        print("   设置环境变量后重新运行: export MYSQL_PASSWORD='your_password'")
    
    print("\n" + "=" * 60)
    print("✅ 知识图谱构建完成!")
    print("=" * 60)


if __name__ == '__main__':
    main()
