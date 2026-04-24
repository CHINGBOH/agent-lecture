#!/usr/bin/env python3
"""
知识图谱API服务
- 提供REST API供前端查询
- 支持知识图谱遍历
- 支持全文搜索
"""

import os
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from typing import Dict, List, Any


class KnowledgeGraphAPI:
    """知识图谱API服务"""
    
    def __init__(self, data_file: str = 'knowledge_graph.json'):
        self.data = self._load_data(data_file)
    
    def _load_data(self, data_file: str) -> Dict:
        """加载知识图谱数据"""
        try:
            with open(data_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"❌ 找不到数据文件: {data_file}")
            return {"entities": [], "relations": [], "mermaid_diagrams": [], "statistics": {}}
    
    def get_entity(self, entity_id: str) -> Dict:
        """获取实体详情"""
        for entity in self.data['entities']:
            if entity['entity_id'] == entity_id:
                return entity
        return {}
    
    def get_related_entities(self, entity_id: str, depth: int = 1) -> List[Dict]:
        """获取关联实体"""
        visited = set()
        result = []
        
        def traverse(current_id: str, current_depth: int):
            if current_depth > depth or current_id in visited:
                return
            
            visited.add(current_id)
            entity = self.get_entity(current_id)
            if entity:
                result.append(entity)
            
            # 查找关系
            for rel in self.data['relations']:
                if rel['source'] == current_id and rel['target'] not in visited:
                    traverse(rel['target'], current_depth + 1)
                elif rel['target'] == current_id and rel['source'] not in visited:
                    traverse(rel['source'], current_depth + 1)
        
        traverse(entity_id, 0)
        return result
    
    def search_entities(self, query: str) -> List[Dict]:
        """搜索实体"""
        results = []
        query_lower = query.lower()
        
        for entity in self.data['entities']:
            if (query_lower in entity['name'].lower() or
                query_lower in entity.get('description', '').lower() or
                query_lower in entity['entity_type'].lower()):
                results.append(entity)
        
        return results
    
    def get_statistics(self) -> Dict:
        """获取统计信息"""
        return self.data.get('statistics', {})
    
    def get_subgraph(self, entity_id: str, max_depth: int = 2) -> Dict:
        """获取子图"""
        nodes = []
        edges = []
        visited = set()
        
        def traverse(current_id: str, depth: int):
            if depth > max_depth or current_id in visited:
                return
            
            visited.add(current_id)
            entity = self.get_entity(current_id)
            if entity:
                nodes.append(entity)
            
            # 添加边并继续遍历
            for rel in self.data['relations']:
                if rel['source'] == current_id:
                    edges.append(rel)
                    if rel['target'] not in visited:
                        traverse(rel['target'], depth + 1)
                elif rel['target'] == current_id:
                    edges.append(rel)
                    if rel['source'] not in visited:
                        traverse(rel['source'], depth + 1)
        
        traverse(entity_id, 0)
        return {"nodes": nodes, "edges": edges}
    
    def get_all_entities_by_type(self, entity_type: str) -> List[Dict]:
        """按类型获取实体"""
        return [e for e in self.data['entities'] if e['entity_type'] == entity_type]
    
    def get_learning_paths(self) -> List[Dict]:
        """获取学习路径"""
        paths = []
        
        # 从Layer关系构建学习路径
        layer_entities = [e for e in self.data['entities'] if e['entity_type'] == 'layer']
        layer_entities.sort(key=lambda e: e.get('properties', {}).get('layer_number', 0))
        
        if layer_entities:
            path = {
                "name": "完整学习路径",
                "description": "从Layer 0到Layer 5的完整学习流程",
                "entities": [e['entity_id'] for e in layer_entities],
            }
            paths.append(path)
        
        return paths


class APIHandler(BaseHTTPRequestHandler):
    """HTTP请求处理器"""
    
    api = None
    
    def do_GET(self):
        """处理GET请求"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query_params = parse_qs(parsed_path.query)
        
        try:
            if path == '/api/entity':
                entity_id = query_params.get('id', [''])[0]
                if entity_id:
                    result = self.api.get_entity(entity_id)
                    self._send_json_response(200, result)
                else:
                    self._send_json_response(400, {"error": "Missing entity id"})
            
            elif path == '/api/related':
                entity_id = query_params.get('id', [''])[0]
                depth = int(query_params.get('depth', ['1'])[0])
                if entity_id:
                    result = self.api.get_related_entities(entity_id, depth)
                    self._send_json_response(200, result)
                else:
                    self._send_json_response(400, {"error": "Missing entity id"})
            
            elif path == '/api/search':
                query = query_params.get('q', [''])[0]
                if query:
                    result = self.api.search_entities(query)
                    self._send_json_response(200, result)
                else:
                    self._send_json_response(400, {"error": "Missing query"})
            
            elif path == '/api/statistics':
                result = self.api.get_statistics()
                self._send_json_response(200, result)
            
            elif path == '/api/subgraph':
                entity_id = query_params.get('id', [''])[0]
                max_depth = int(query_params.get('depth', ['2'])[0])
                if entity_id:
                    result = self.api.get_subgraph(entity_id, max_depth)
                    self._send_json_response(200, result)
                else:
                    self._send_json_response(400, {"error": "Missing entity id"})
            
            elif path == '/api/entities/by_type':
                entity_type = query_params.get('type', [''])[0]
                if entity_type:
                    result = self.api.get_all_entities_by_type(entity_type)
                    self._send_json_response(200, result)
                else:
                    self._send_json_response(400, {"error": "Missing entity type"})
            
            elif path == '/api/learning_paths':
                result = self.api.get_learning_paths()
                self._send_json_response(200, result)
            
            elif path == '/api/health':
                self._send_json_response(200, {"status": "ok"})
            
            else:
                self._send_json_response(404, {"error": "Not found"})
        
        except Exception as e:
            self._send_json_response(500, {"error": str(e)})
    
    def _send_json_response(self, status_code: int, data: Any):
        """发送JSON响应"""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
    
    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f"[API] {format % args}")


def main():
    """启动API服务"""
    print("=" * 60)
    print("🚀 知识图谱API服务")
    print("=" * 60)
    
    # 创建API实例
    api = KnowledgeGraphAPI('knowledge_graph.json')
    APIHandler.api = api
    
    # 启动服务器
    port = int(os.getenv('API_PORT', 8080))
    server = HTTPServer(('localhost', port), APIHandler)
    
    print(f"\n📡 API服务已启动:")
    print(f"   - 地址: http://localhost:{port}")
    print(f"   - 健康检查: http://localhost:{port}/api/health")
    print(f"   - 搜索实体: http://localhost:{port}/api/search?q=attention")
    print(f"   - 获取实体: http://localhost:{port}/api/entity?id=layer:0")
    print(f"   - 关联实体: http://localhost:{port}/api/related?id=layer:0&depth=2")
    print(f"   - 子图查询: http://localhost:{port}/api/subgraph?id=layer:0")
    print(f"   - 统计信息: http://localhost:{port}/api/statistics")
    print(f"   - 学习路径: http://localhost:{port}/api/learning_paths")
    print("\n按 Ctrl+C 停止服务")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n✅ API服务已停止")
        server.shutdown()


if __name__ == '__main__':
    main()
