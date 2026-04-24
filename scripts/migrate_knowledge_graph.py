#!/usr/bin/env python3
"""
MySQL数据库迁移和数据导入脚本
- 创建知识图谱数据库结构
- 导入示例数据
- 提供数据库操作工具
"""

import os
import sys
import json
import mysql.connector
from mysql.connector import Error
from knowledge_graph_model import (
    MYSQL_SCHEMA, SAMPLE_ENTITIES, SAMPLE_RELATIONS, DB_CONFIG
)

class KnowledgeGraphDB:
    """知识图谱数据库操作类"""
    
    def __init__(self, config=None):
        self.config = config or DB_CONFIG
        self.connection = None
    
    def connect(self):
        """连接到MySQL数据库"""
        try:
            self.connection = mysql.connector.connect(**self.config)
            if self.connection.is_connected():
                print(f"✅ 成功连接到MySQL数据库: {self.config['database']}")
                return True
        except Error as e:
            print(f"❌ 连接数据库失败: {e}")
            return False
        return False
    
    def disconnect(self):
        """关闭数据库连接"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("✅ 数据库连接已关闭")
    
    def create_database(self):
        """创建数据库"""
        try:
            # 先连接到默认数据库
            config = self.config.copy()
            config['database'] = None  # 不指定数据库
            conn = mysql.connector.connect(**config)
            cursor = conn.cursor()
            
            db_name = self.config['database']
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print(f"✅ 数据库 {db_name} 创建成功")
            
            cursor.close()
            conn.close()
            return True
        except Error as e:
            print(f"❌ 创建数据库失败: {e}")
            return False
    
    def execute_schema(self):
        """执行数据库表结构"""
        if not self.connection:
            print("❌ 请先连接数据库")
            return False
        
        try:
            cursor = self.connection.cursor()
            
            # 分割SQL语句并执行
            statements = [stmt.strip() for stmt in MYSQL_SCHEMA.split(';') if stmt.strip()]
            
            for stmt in statements:
                if stmt and not stmt.startswith('--'):
                    try:
                        cursor.execute(stmt)
                    except Error as e:
                        # 忽略已存在的表错误
                        if "already exists" not in str(e).lower():
                            print(f"⚠️ 执行SQL警告: {e}")
                            print(f"   SQL: {stmt[:100]}...")
            
            self.connection.commit()
            print("✅ 数据库表结构创建成功")
            cursor.close()
            return True
        except Error as e:
            print(f"❌ 创建表结构失败: {e}")
            return False
    
    def import_entities(self, entities=None):
        """导入实体数据"""
        if not self.connection:
            print("❌ 请先连接数据库")
            return False
        
        entities = entities or SAMPLE_ENTITIES
        
        try:
            cursor = self.connection.cursor()
            
            import_sql = """
            INSERT INTO entities 
            (entity_id, entity_type, name, description, properties)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            description = VALUES(description),
            properties = VALUES(properties),
            updated_at = CURRENT_TIMESTAMP
            """
            
            for entity in entities:
                cursor.execute(import_sql, (
                    entity['entity_id'],
                    entity['entity_type'],
                    entity['name'],
                    entity.get('description'),
                    json.dumps(entity.get('properties', {}), ensure_ascii=False)
                ))
            
            self.connection.commit()
            print(f"✅ 成功导入 {len(entities)} 个实体")
            cursor.close()
            return True
        except Error as e:
            print(f"❌ 导入实体失败: {e}")
            return False
    
    def import_relations(self, relations=None):
        """导入关系数据"""
        if not self.connection:
            print("❌ 请先连接数据库")
            return False
        
        relations = relations or SAMPLE_RELATIONS
        
        try:
            cursor = self.connection.cursor()
            
            import_sql = """
            INSERT INTO relations 
            (relation_id, source_entity_id, target_entity_id, relation_type, weight, properties)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            weight = VALUES(weight),
            properties = VALUES(properties)
            """
            
            for i, rel in enumerate(relations):
                relation_id = f"rel_{i:04d}"
                cursor.execute(import_sql, (
                    relation_id,
                    rel['source'],
                    rel['target'],
                    rel['type'],
                    rel.get('weight', 1.0),
                    json.dumps(rel.get('properties', {}), ensure_ascii=False)
                ))
            
            self.connection.commit()
            print(f"✅ 成功导入 {len(relations)} 个关系")
            cursor.close()
            return True
        except Error as e:
            print(f"❌ 导入关系失败: {e}")
            return False
    
    def query_entity(self, entity_id):
        """查询实体"""
        if not self.connection:
            return None
        
        try:
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM entities WHERE entity_id = %s", (entity_id,))
            result = cursor.fetchone()
            cursor.close()
            return result
        except Error as e:
            print(f"❌ 查询实体失败: {e}")
            return None
    
    def query_relations(self, entity_id):
        """查询实体的所有关系"""
        if not self.connection:
            return []
        
        try:
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT r.*, 
                       e1.name AS source_name, e1.entity_type AS source_type,
                       e2.name AS target_name, e2.entity_type AS target_type
                FROM relations r
                JOIN entities e1 ON r.source_entity_id = e1.entity_id
                JOIN entities e2 ON r.target_entity_id = e2.entity_id
                WHERE r.source_entity_id = %s OR r.target_entity_id = %s
                ORDER BY r.weight DESC
            """, (entity_id, entity_id))
            
            results = cursor.fetchall()
            cursor.close()
            return results
        except Error as e:
            print(f"❌ 查询关系失败: {e}")
            return []
    
    def query_knowledge_graph(self, entity_id=None, max_depth=2):
        """查询知识图谱（支持深度遍历）"""
        if not self.connection:
            return {"nodes": [], "edges": []}
        
        visited = set()
        nodes = []
        edges = []
        
        def traverse(current_id, depth):
            if depth > max_depth or current_id in visited:
                return
            
            visited.add(current_id)
            
            # 添加节点
            entity = self.query_entity(current_id)
            if entity:
                nodes.append({
                    "id": entity['entity_id'],
                    "name": entity['name'],
                    "type": entity['entity_type'],
                    "description": entity['description']
                })
            
            # 查询关系
            relations = self.query_relations(current_id)
            for rel in relations:
                # 添加边
                edges.append({
                    "source": rel['source_entity_id'],
                    "target": rel['target_entity_id'],
                    "type": rel['relation_type'],
                    "weight": rel['weight']
                })
                
                # 递归遍历
                if rel['source_entity_id'] == current_id:
                    traverse(rel['target_entity_id'], depth + 1)
                else:
                    traverse(rel['source_entity_id'], depth + 1)
        
        if entity_id:
            traverse(entity_id, 0)
        else:
            # 查询所有实体
            try:
                cursor = self.connection.cursor(dictionary=True)
                cursor.execute("SELECT entity_id FROM entities")
                for row in cursor.fetchall():
                    traverse(row['entity_id'], 0)
                cursor.close()
            except Error as e:
                print(f"❌ 查询失败: {e}")
        
        return {"nodes": nodes, "edges": edges}
    
    def get_statistics(self):
        """获取数据库统计信息"""
        if not self.connection:
            return {}
        
        try:
            cursor = self.connection.cursor(dictionary=True)
            
            stats = {}
            
            # 实体统计
            cursor.execute("SELECT COUNT(*) as count FROM entities")
            stats['total_entities'] = cursor.fetchone()['count']
            
            # 按类型统计
            cursor.execute("""
                SELECT entity_type, COUNT(*) as count 
                FROM entities GROUP BY entity_type
            """)
            stats['entities_by_type'] = cursor.fetchall()
            
            # 关系统计
            cursor.execute("SELECT COUNT(*) as count FROM relations")
            stats['total_relations'] = cursor.fetchone()['count']
            
            # 按类型统计
            cursor.execute("""
                SELECT relation_type, COUNT(*) as count 
                FROM relations GROUP BY relation_type
            """)
            stats['relations_by_type'] = cursor.fetchall()
            
            cursor.close()
            return stats
        except Error as e:
            print(f"❌ 获取统计信息失败: {e}")
            return {}


def main():
    """主函数：执行数据库迁移和数据导入"""
    print("=" * 60)
    print("🚀 知识图谱数据库迁移工具")
    print("=" * 60)
    
    # 检查环境变量
    if not os.getenv('MYSQL_PASSWORD'):
        print("\n⚠️ 请设置MySQL密码环境变量:")
        print("   export MYSQL_PASSWORD='your_password'")
        print("   export MYSQL_USER='your_username'  # 可选，默认root")
        print("   export MYSQL_HOST='your_host'      # 可选，默认localhost")
        print("   export MYSQL_DATABASE='your_db'    # 可选，默认agent_lecture_kg")
        print("\n或者修改 scripts/knowledge_graph_model.py 中的 DB_CONFIG")
        return
    
    db = KnowledgeGraphDB()
    
    # 1. 创建数据库
    print("\n📦 步骤1: 创建数据库")
    if not db.create_database():
        print("❌ 数据库创建失败，退出")
        return
    
    # 2. 连接数据库
    print("\n🔗 步骤2: 连接数据库")
    if not db.connect():
        print("❌ 数据库连接失败，退出")
        return
    
    # 3. 创建表结构
    print("\n🏗️ 步骤3: 创建表结构")
    if not db.execute_schema():
        print("❌ 表结构创建失败")
        db.disconnect()
        return
    
    # 4. 导入实体
    print("\n📥 步骤4: 导入实体数据")
    if not db.import_entities():
        print("❌ 实体导入失败")
        db.disconnect()
        return
    
    # 5. 导入关系
    print("\n📥 步骤5: 导入关系数据")
    if not db.import_relations():
        print("❌ 关系导入失败")
        db.disconnect()
        return
    
    # 6. 显示统计信息
    print("\n📊 步骤6: 数据库统计信息")
    stats = db.get_statistics()
    if stats:
        print(f"   总实体数: {stats.get('total_entities', 0)}")
        print(f"   总关系数: {stats.get('total_relations', 0)}")
        print("\n   实体类型分布:")
        for item in stats.get('entities_by_type', []):
            print(f"     - {item['entity_type']}: {item['count']}")
        print("\n   关系类型分布:")
        for item in stats.get('relations_by_type', []):
            print(f"     - {item['relation_type']}: {item['count']}")
    
    # 7. 测试查询
    print("\n🔍 步骤7: 测试查询")
    test_entity = "layer:0"
    result = db.query_entity(test_entity)
    if result:
        print(f"   查询实体 '{test_entity}':")
        print(f"   - 名称: {result['name']}")
        print(f"   - 类型: {result['entity_type']}")
        print(f"   - 描述: {result['description'][:50]}...")
    
    # 8. 测试知识图谱查询
    print("\n🕸️ 步骤8: 测试知识图谱查询")
    graph = db.query_knowledge_graph(entity_id="layer:0", max_depth=2)
    if graph:
        print(f"   知识图谱节点数: {len(graph['nodes'])}")
        print(f"   知识图谱边数: {len(graph['edges'])}")
    
    # 9. 完成
    print("\n" + "=" * 60)
    print("✅ 知识图谱数据库迁移完成!")
    print("=" * 60)
    print("\n📚 数据库信息:")
    print(f"   - 数据库: {db.config['database']}")
    print(f"   - 主机: {db.config['host']}")
    print(f"   - 端口: {db.config['port']}")
    print("\n🔧 后续操作:")
    print("   1. 运行前端开发服务器查看效果")
    print("   2. 使用 scripts/build_knowledge_graph.py 从文档提取更多数据")
    print("   3. 访问 API 端点进行查询")
    
    db.disconnect()


if __name__ == '__main__':
    main()
