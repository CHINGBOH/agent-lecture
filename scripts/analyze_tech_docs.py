#!/usr/bin/env python3
"""
技术文档提取工具
- 扫描本地MD文档
- 提取Mermaid图表
- 分析架构关系
- 生成技术架构报告
"""

import os
import re
import json
from pathlib import Path
import networkx as nx
import matplotlib.pyplot as plt

class TechDocAnalyzer:
    def __init__(self, root_dir):
        self.root_dir = Path(root_dir)
        self.tech_concepts = {}
        self.mermaid_diagrams = []
        self.architecture_graph = nx.DiGraph()
    
    def scan_md_files(self):
        """扫描所有MD文件"""
        md_files = []
        for ext in ['.md', '.markdown']:
            md_files.extend(self.root_dir.rglob(f'*{ext}'))
        return md_files
    
    def extract_mermaid(self, content):
        """提取Mermaid图表"""
        mermaid_pattern = r'```mermaid[\s\S]*?```'
        matches = re.findall(mermaid_pattern, content)
        return matches
    
    def extract_tech_concepts(self, content):
        """提取技术概念"""
        # 提取标题中的技术概念
        headings = re.findall(r'^#{1,6}\s+(.*)$', content, re.MULTILINE)
        # 提取代码块中的技术概念
        code_blocks = re.findall(r'```[\w]*\n([\s\S]*?)```', content)
        # 提取表格中的技术概念
        tables = re.findall(r'\|.*\|\n\|.*\|\n(?:\|.*\|\n)*', content)
        
        concepts = []
        concepts.extend(headings)
        
        # 从代码块中提取关键词
        for code in code_blocks:
            # 提取函数名、类名等
            functions = re.findall(r'\b(def|class|function)\s+(\w+)', code)
            for func_type, func_name in functions:
                concepts.append(func_name)
        
        # 从表格中提取技术概念
        for table in tables:
            cells = re.findall(r'\|\s*(.*?)\s*\|', table)
            concepts.extend(cells)
        
        return concepts
    
    def analyze_file(self, file_path):
        """分析单个文件"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return
        
        # 提取Mermaid图表
        mermaid = self.extract_mermaid(content)
        if mermaid:
            self.mermaid_diagrams.append({
                'file': str(file_path),
                'diagrams': mermaid
            })
        
        # 提取技术概念
        concepts = self.extract_tech_concepts(content)
        relative_path = str(file_path.relative_to(self.root_dir))
        self.tech_concepts[relative_path] = concepts
    
    def build_architecture_graph(self):
        """构建架构关系图"""
        # 从ARCHITECTURE.md中提取层次关系
        architecture_file = self.root_dir / 'ARCHITECTURE.md'
        if architecture_file.exists():
            with open(architecture_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 提取Layer层次
            layers = re.findall(r'Layer (\d+):[^\n]+', content)
            for i in range(len(layers) - 1):
                self.architecture_graph.add_edge(f'Layer {layers[i]}', f'Layer {layers[i+1]}')
        
        # 从技术概念中提取关系
        for file_path, concepts in self.tech_concepts.items():
            for concept in concepts:
                if 'layer' in concept.lower():
                    layer_match = re.search(r'layer (\d+)', concept.lower())
                    if layer_match:
                        layer = f'Layer {layer_match.group(1)}'
                        self.architecture_graph.add_node(layer)
    
    def generate_report(self):
        """生成技术架构报告"""
        report = {
            'total_files': len(self.tech_concepts),
            'total_mermaid_diagrams': len(self.mermaid_diagrams),
            'tech_concepts': self.tech_concepts,
            'architecture_layers': list(self.architecture_graph.nodes()),
            'architecture_edges': list(self.architecture_graph.edges()),
            'mermaid_diagrams': self.mermaid_diagrams
        }
        
        # 保存报告
        with open('tech_architecture_report.json', 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        print("技术架构报告已生成: tech_architecture_report.json")
        print(f"分析了 {len(self.tech_concepts)} 个MD文件")
        print(f"发现 {len(self.mermaid_diagrams)} 个Mermaid图表")
        print(f"架构层次: {list(self.architecture_graph.nodes())}")
    
    def run(self):
        """运行分析"""
        print(f"开始扫描 {self.root_dir} 目录...")
        md_files = self.scan_md_files()
        print(f"找到 {len(md_files)} 个MD文件")
        
        for file_path in md_files:
            self.analyze_file(file_path)
        
        self.build_architecture_graph()
        self.generate_report()

if __name__ == '__main__':
    root_dir = '/home/l/agent-lecture'
    analyzer = TechDocAnalyzer(root_dir)
    analyzer.run()
