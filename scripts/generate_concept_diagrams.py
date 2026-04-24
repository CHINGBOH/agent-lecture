#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成4张Agent核心概念图 —— 皮樱桃红(Burgundy)主题
"""
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle, Wedge
import numpy as np
import matplotlib

# ============================================================
# 中文字体 + 主题色：皮樱桃红 + 暗色背景
# ============================================================
matplotlib.rcParams['font.sans-serif'] = ['AR PL UMing CN', 'DejaVu Sans']
matplotlib.rcParams['axes.unicode_minus'] = False

BG_COLOR = '#1a0a0e'      # 深酒红暗底
BURGUNDY = '#8B1A2B'      # 皮樱桃红主色
BURGUNDY_LIGHT = '#C41E3A' # 亮樱桃红
BURGUNDY_DARK = '#4A0E18'  # 深樱桃红
GOLD = '#D4A843'
CREAM = '#F5F0E6'
TEAL = '#2E8B8B'
PURPLE = '#6A1B9A'
GREEN = '#4A8C5F'

def dark_theme():
    plt.rcParams.update({
        'figure.facecolor': BG_COLOR,
        'axes.facecolor': BG_COLOR,
        'axes.edgecolor': BURGUNDY,
        'axes.labelcolor': CREAM,
        'text.color': CREAM,
        'xtick.color': CREAM,
        'ytick.color': CREAM,
        'font.family': 'sans-serif',
    })

def save(fig, name):
    fig.savefig(f'/home/l/agent-lecture/public/images/{name}.png',
                dpi=150, bbox_inches='tight', facecolor=BG_COLOR)
    plt.close(fig)
    print(f'Saved {name}.png')

# ============================================================
# 图1: Runtime Tick + JMP 心跳时序
# ============================================================
def draw_runtime_tick():
    fig, ax = plt.subplots(figsize=(12, 7))
    dark_theme()
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis('off')
    ax.set_title('Runtime Tick + JMP: 裸 Runtime 的心跳', fontsize=18, color=CREAM, pad=20, fontweight='bold')

    # 时钟节拍波形
    t = np.linspace(0, 10, 500)
    y_tick = 5.5 + 0.6 * ((np.sin(t * 3) > 0).astype(float) * 2 - 1)
    ax.plot(t, y_tick, color=BURGUNDY_LIGHT, linewidth=2.5, label='Tick')
    ax.fill_between(t, 5.5, y_tick, where=(y_tick > 5.5), color=BURGUNDY, alpha=0.3)
    
    # 节拍标记
    tick_points = [1.05, 2.15, 3.25, 4.35, 5.45, 6.55, 7.65, 8.75, 9.85]
    for i, tx in enumerate(tick_points[:6]):
        ax.axvline(x=tx, color=BURGUNDY_LIGHT, linestyle='--', alpha=0.4, ymin=0, ymax=0.65)
        ax.text(tx, 6.4, f'Tick {i+1}', ha='center', fontsize=9, color=GOLD, fontweight='bold')

    # 状态盒子
    states = [
        ('WAIT\n等待输入', 1.6, GOLD),
        ('GENERATE\nLLM生成', 3.8, TEAL),
        ('JMP TOOL\n工具调用', 6.0, BURGUNDY_LIGHT),
        ('VERIFY\n结果验证', 8.2, GREEN),
    ]
    
    for label, x, color in states:
        box = FancyBboxPatch((x-0.7, 2.8), 1.4, 1.4,
                             boxstyle="round,pad=0.1",
                             facecolor=color, edgecolor=CREAM,
                             linewidth=1.5, alpha=0.25)
        ax.add_patch(box)
        ax.text(x, 3.5, label, ha='center', va='center',
                fontsize=10, color=color, fontweight='bold')

    # 箭头连接
    arrow_style = dict(arrowstyle='->', color=BURGUNDY_LIGHT, lw=2,
                       connectionstyle='arc3,rad=0.15')
    for i in range(len(states)-1):
        ax.annotate('', xy=(states[i+1][1]-0.7, 3.5), xytext=(states[i][1]+0.7, 3.5),
                    arrowprops=arrow_style)
    
    # 回环箭头
    ax.annotate('', xy=(1.6, 2.7), xytext=(8.2, 2.7),
                arrowprops=dict(arrowstyle='->', color=BURGUNDY_LIGHT, lw=2,
                               connectionstyle='arc3,rad=-0.3'))
    ax.text(4.9, 2.0, '循环往复', ha='center', fontsize=10, color=CREAM, style='italic')

    # 底部说明
    ax.text(6, 0.8, '每 Tick 一次: State 序列化 -> 检查 PendingTool -> JMP 到 Handler -> 执行后 JMP 回 Generate',
            ha='center', fontsize=11, color=CREAM, alpha=0.8,
            bbox=dict(boxstyle='round,pad=0.5', facecolor=BURGUNDY_DARK, edgecolor=BURGUNDY, alpha=0.6))

    save(fig, 'runtime_tick_jmp')

# ============================================================
# 图2: State 全息快照
# ============================================================
def draw_state_snapshot():
    fig, ax = plt.subplots(figsize=(12, 8))
    dark_theme()
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8)
    ax.axis('off')
    ax.set_title('State: 全息快照 -- Agent 的"此刻全部"', fontsize=18, color=CREAM, pad=20, fontweight='bold')

    # 外圈光环
    circle_outer = Circle((6, 4), 3.2, fill=False, edgecolor=BURGUNDY, linewidth=3, linestyle='--', alpha=0.5)
    ax.add_patch(circle_outer)
    
    # 核心 State 圆
    circle_core = Circle((6, 4), 1.2, facecolor=BURGUNDY_DARK, edgecolor=BURGUNDY_LIGHT, linewidth=3, alpha=0.9)
    ax.add_patch(circle_core)
    ax.text(6, 4, 'State\nSnapshot', ha='center', va='center', fontsize=14, color=CREAM, fontweight='bold')

    # 环绕的信息模块
    modules = [
        ('对话历史\nContext Window', 2.0, 6.2, GOLD),
        ('可用工具\nTool Registry', 10.0, 6.2, TEAL),
        ('待执行任务\nPending Tasks', 10.5, 4.0, GREEN),
        ('会话ID\nSession ID', 10.0, 1.8, PURPLE),
        ('检查点ID\nCheckpoint', 2.0, 1.8, BURGUNDY_LIGHT),
        ('当前目标\nState.Goal', 1.5, 4.0, '#FF6B6B'),
    ]
    
    for label, x, y, color in modules:
        box = FancyBboxPatch((x-1.0, y-0.5), 2.0, 1.0,
                             boxstyle="round,pad=0.12",
                             facecolor=color, edgecolor=CREAM,
                             linewidth=1.2, alpha=0.2)
        ax.add_patch(box)
        ax.text(x, y, label, ha='center', va='center', fontsize=9, color=color, fontweight='bold')
        
        # 连接到核心的线
        dx, dy = 6 - x, 4 - y
        dist = np.sqrt(dx**2 + dy**2)
        ax.plot([x + dx/dist*1.0, 6 - dx/dist*1.2], [y + dy/dist*0.5, 4 - dy/dist*0.6],
                color=color, linewidth=1.5, alpha=0.6)

    # 底部说明
    ax.text(6, 0.4, '完整 State 可序列化存入数据库, 随时恢复 -- 这就是 Agent 能"暂停/续跑"的根本',
            ha='center', fontsize=11, color=CREAM, alpha=0.85,
            bbox=dict(boxstyle='round,pad=0.5', facecolor=BURGUNDY_DARK, edgecolor=BURGUNDY, alpha=0.5))

    save(fig, 'state_snapshot')

# ============================================================
# 图3: Constrained Decoding 强制 JSON
# ============================================================
def draw_constrained_decoding():
    fig, ax = plt.subplots(figsize=(13, 7))
    dark_theme()
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 7)
    ax.axis('off')
    ax.set_title('Constrained Decoding: 强制 JSON 输出', fontsize=18, color=CREAM, pad=20, fontweight='bold')

    # 上方：自由生成（红色警告）
    ax.text(3.25, 6.3, 'X 自由生成 (无 Mask)', ha='center', fontsize=12, color='#FF6B6B', fontweight='bold')
    free_box = FancyBboxPatch((0.8, 4.5), 4.9, 1.5,
                              boxstyle="round,pad=0.15",
                              facecolor='#4A0E18', edgecolor='#FF6B6B',
                              linewidth=2, alpha=0.5)
    ax.add_patch(free_box)
    ax.text(3.25, 5.5, '用户: 查一下北京天气', ha='center', fontsize=10, color=CREAM)
    ax.text(3.25, 5.0, '模型: 好的, 北京今天天气不错, 气温...', ha='center', fontsize=10, color='#FF6B6B', alpha=0.8)
    ax.text(3.25, 4.7, '-> 自由文本, 无法被程序解析!', ha='center', fontsize=9, color='#FF6B6B', style='italic')

    # 下方：约束生成（绿色通过）
    ax.text(9.75, 6.3, 'OK 约束生成 (有 Mask)', ha='center', fontsize=12, color=GREEN, fontweight='bold')
    constraint_box = FancyBboxPatch((7.3, 4.5), 4.9, 1.5,
                                    boxstyle="round,pad=0.15",
                                    facecolor='#0E2B1A', edgecolor=GREEN,
                                    linewidth=2, alpha=0.5)
    ax.add_patch(constraint_box)
    ax.text(9.75, 5.5, '用户: 查一下北京天气', ha='center', fontsize=10, color=CREAM)
    ax.text(9.75, 5.0, '{"name":"getWeather","args":{"city":"北京"}}', ha='center', fontsize=10, color=GREEN, fontweight='bold',
            family='monospace')
    ax.text(9.75, 4.7, '-> 可被程序直接解析执行!', ha='center', fontsize=9, color=GREEN, style='italic')

    # 中间流程
    flow_steps = [
        ('用户输入\n"查天气"', 1.5, 2.8, CREAM),
        ('LLM 生成\nLogits', 4.0, 2.8, GOLD),
        ('Mask 过滤\n非法 Token->-inf', 6.5, 2.8, BURGUNDY_LIGHT),
        ('只剩合法\nJSON Token', 9.0, 2.8, TEAL),
        ('解析执行\nTool Call', 11.5, 2.8, GREEN),
    ]
    
    for label, x, y, color in flow_steps:
        box = FancyBboxPatch((x-0.85, y-0.45), 1.7, 0.9,
                             boxstyle="round,pad=0.1",
                             facecolor=color, edgecolor=CREAM,
                             linewidth=1.2, alpha=0.15)
        ax.add_patch(box)
        ax.text(x, y, label, ha='center', va='center', fontsize=8.5, color=color, fontweight='bold')
    
    # 箭头
    for i in range(len(flow_steps)-1):
        ax.annotate('', xy=(flow_steps[i+1][1]-0.85, flow_steps[i+1][2]),
                    xytext=(flow_steps[i][1]+0.85, flow_steps[i][2]),
                    arrowprops=dict(arrowstyle='->', color=BURGUNDY_LIGHT, lw=2))

    # 底部 Mask 原理
    ax.text(6.5, 1.0, '核心原理: Schema FSM 决定 next_valid_tokens() -> 非法 token 的 logit 被置为 -inf -> Softmax 后概率为 0',
            ha='center', fontsize=10, color=CREAM, alpha=0.85,
            bbox=dict(boxstyle='round,pad=0.5', facecolor=BURGUNDY_DARK, edgecolor=BURGUNDY, alpha=0.5))

    save(fig, 'constrained_decoding')

# ============================================================
# 图4: Auto-Routing 中断向量表
# ============================================================
def draw_auto_routing():
    fig, ax = plt.subplots(figsize=(13, 7.5))
    dark_theme()
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 7.5)
    ax.axis('off')
    ax.set_title('Auto-Routing: 中断向量表 -- 像 CPU 一样精准调度', fontsize=18, color=CREAM, pad=20, fontweight='bold')

    # 用户输入
    input_box = FancyBboxPatch((0.5, 5.8), 2.5, 0.9,
                               boxstyle="round,pad=0.12",
                               facecolor=BURGUNDY, edgecolor=CREAM,
                               linewidth=1.5, alpha=0.3)
    ax.add_patch(input_box)
    ax.text(1.75, 6.25, '用户输入', ha='center', fontsize=11, color=CREAM, fontweight='bold')
    ax.text(1.75, 5.95, '"前端报错了"', ha='center', fontsize=9, color=GOLD)

    # 关键词提取
    ax.annotate('', xy=(4.0, 6.25), xytext=(3.0, 6.25),
                arrowprops=dict(arrowstyle='->', color=BURGUNDY_LIGHT, lw=2.5))
    hash_box = FancyBboxPatch((4.0, 5.7), 2.2, 1.1,
                              boxstyle="round,pad=0.12",
                              facecolor=BURGUNDY_DARK, edgecolor=BURGUNDY_LIGHT,
                              linewidth=2, alpha=0.6)
    ax.add_patch(hash_box)
    ax.text(5.1, 6.45, '关键词哈希', ha='center', fontsize=11, color=CREAM, fontweight='bold')
    ax.text(5.1, 6.05, 'Hash("报错") = 0x3F2A', ha='center', fontsize=9, color=GOLD, family='monospace')

    # 中断向量表
    ax.annotate('', xy=(7.5, 6.25), xytext=(6.2, 6.25),
                arrowprops=dict(arrowstyle='->', color=BURGUNDY_LIGHT, lw=2.5))
    
    # 向量表背景
    table_bg = FancyBboxPatch((7.5, 3.5), 5.0, 3.5,
                              boxstyle="round,pad=0.15",
                              facecolor=BURGUNDY_DARK, edgecolor=BURGUNDY,
                              linewidth=2, alpha=0.4)
    ax.add_patch(table_bg)
    ax.text(10.0, 6.6, '中断向量表', ha='center', fontsize=12, color=CREAM, fontweight='bold')
    
    # 表项
    table_items = [
        ('0x3F2A', '@debugger', '#FF6B6B'),
        ('0x8A1C', '@frontend-specialist', TEAL),
        ('0x5B42', '@backend-specialist', GREEN),
        ('0x2E91', '@quality-inspector', GOLD),
        ('0x7D33', '@project-planner', PURPLE),
    ]
    
    for i, (hash_val, agent, color) in enumerate(table_items):
        y_pos = 6.0 - i * 0.55
        ax.text(8.0, y_pos, hash_val, ha='left', fontsize=9, color=GOLD, family='monospace')
        ax.text(9.5, y_pos, '->', ha='center', fontsize=10, color=CREAM)
        ax.text(10.2, y_pos, agent, ha='left', fontsize=9, color=color, fontweight='bold')
        
        # 高亮匹配项
        if i == 0:
            highlight = FancyBboxPatch((7.7, y_pos-0.2), 4.6, 0.4,
                                       boxstyle="round,pad=0.05",
                                       facecolor=BURGUNDY, edgecolor=BURGUNDY_LIGHT,
                                       linewidth=2, alpha=0.4)
            ax.add_patch(highlight)

    # 下方：JMP 跳转
    ax.annotate('', xy=(10.0, 3.2), xytext=(10.0, 3.5),
                arrowprops=dict(arrowstyle='->', color=BURGUNDY_LIGHT, lw=3))
    
    jmp_box = FancyBboxPatch((8.0, 2.0), 4.0, 1.0,
                             boxstyle="round,pad=0.15",
                             facecolor=BURGUNDY, edgecolor=GOLD,
                             linewidth=2.5, alpha=0.5)
    ax.add_patch(jmp_box)
    ax.text(10.0, 2.65, 'JMP @debugger_entry', ha='center', fontsize=12, color=GOLD, fontweight='bold', family='monospace')
    ax.text(10.0, 2.25, '不是 if-else, 是精确 PC 跳转', ha='center', fontsize=10, color=CREAM, alpha=0.8)

    # 左侧：其他路由策略
    strategies = [
        ('大脑 模型路由', 'LLM 自己判断', 1.0, 3.8),
        ('笔记 规则路由', '关键词匹配', 1.0, 3.0),
        ('靶心 Embedding', '向量相似度', 1.0, 2.2),
        ('机器人 专用模型', '独立小模型', 1.0, 1.4),
    ]
    
    ax.text(1.0, 4.4, '四种路由策略', ha='left', fontsize=11, color=CREAM, fontweight='bold')
    for label, desc, x, y in strategies:
        ax.text(x, y, f'{label}\n   {desc}', ha='left', fontsize=9, color=CREAM, alpha=0.85)

    # 底部说明
    ax.text(6.5, 0.5, '用户输入 -> 关键词哈希 -> 查中断向量表 -> JMP 到对应 Agent 入口地址',
            ha='center', fontsize=10, color=CREAM, alpha=0.85,
            bbox=dict(boxstyle='round,pad=0.5', facecolor=BURGUNDY_DARK, edgecolor=BURGUNDY, alpha=0.5))

    save(fig, 'auto_routing')

# ============================================================
if __name__ == '__main__':
    draw_runtime_tick()
    draw_state_snapshot()
    draw_constrained_decoding()
    draw_auto_routing()
    print('All 4 concept diagrams generated!')

# ============================================================
# 图5: Channel + Memory 通信与记忆
# ============================================================
def draw_channel_memory():
    fig, ax = plt.subplots(figsize=(13, 7.5))
    dark_theme()
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 7.5)
    ax.axis('off')
    ax.set_title('Channel + Memory: 通信与记忆系统', fontsize=18, color=CREAM, pad=20, fontweight='bold')

    # === Channel 区域（上方中间）===
    channel_bg = FancyBboxPatch((4.0, 4.5), 5.0, 2.5,
                                boxstyle="round,pad=0.15",
                                facecolor=BURGUNDY_DARK, edgecolor=BURGUNDY_LIGHT,
                                linewidth=2, alpha=0.5)
    ax.add_patch(channel_bg)
    ax.text(6.5, 6.6, 'Channel 队列 (FIFO)', ha='center', fontsize=13, color=CREAM, fontweight='bold')
    
    # FIFO 队列示意
    fifo_boxes = ['Msg1', 'Msg2', 'Msg3', 'Msg4']
    for i, label in enumerate(fifo_boxes):
        box = FancyBboxPatch((4.3 + i * 1.1, 5.0), 0.9, 0.7,
                             boxstyle="round,pad=0.08",
                             facecolor=BURGUNDY, edgecolor=CREAM,
                             linewidth=1, alpha=0.4)
        ax.add_patch(box)
        ax.text(4.75 + i * 1.1, 5.35, label, ha='center', fontsize=9, color=CREAM)
    ax.text(6.5, 4.7, '先进先出 | 异步非阻塞 | 线程安全', ha='center', fontsize=9, color=BURGUNDY_LIGHT, alpha=0.8)

    # === LLM（左侧）===
    llm_box = FancyBboxPatch((0.5, 4.8), 2.2, 1.8,
                             boxstyle="round,pad=0.12",
                             facecolor=TEAL, edgecolor=CREAM,
                             linewidth=1.5, alpha=0.25)
    ax.add_patch(llm_box)
    ax.text(1.6, 6.2, 'LLM (Model)', ha='center', fontsize=11, color=TEAL, fontweight='bold')
    ax.text(1.6, 5.7, '生成输出', ha='center', fontsize=9, color=CREAM)
    ax.text(1.6, 5.2, '查询记忆', ha='center', fontsize=9, color=CREAM)
    
    # LLM -> Channel
    ax.annotate('', xy=(4.0, 5.7), xytext=(2.7, 5.7),
                arrowprops=dict(arrowstyle='->', color=BURGUNDY_LIGHT, lw=2))
    ax.text(3.35, 5.95, '生成', ha='center', fontsize=8, color=GOLD)
    
    # Channel -> LLM (返回)
    ax.annotate('', xy=(2.7, 5.2), xytext=(4.0, 5.2),
                arrowprops=dict(arrowstyle='->', color=BURGUNDY_LIGHT, lw=2))
    ax.text(3.35, 4.95, '消费', ha='center', fontsize=8, color=GOLD)

    # === Tool（右侧）===
    tool_box = FancyBboxPatch((10.3, 4.8), 2.2, 1.8,
                              boxstyle="round,pad=0.12",
                              facecolor=GREEN, edgecolor=CREAM,
                              linewidth=1.5, alpha=0.25)
    ax.add_patch(tool_box)
    ax.text(11.4, 6.2, 'Tool 执行', ha='center', fontsize=11, color=GREEN, fontweight='bold')
    ax.text(11.4, 5.7, '执行调用', ha='center', fontsize=9, color=CREAM)
    ax.text(11.4, 5.2, '返回结果', ha='center', fontsize=9, color=CREAM)
    
    # Channel -> Tool
    ax.annotate('', xy=(10.3, 5.7), xytext=(9.0, 5.7),
                arrowprops=dict(arrowstyle='->', color=BURGUNDY_LIGHT, lw=2))
    ax.text(9.65, 5.95, '调用', ha='center', fontsize=8, color=GOLD)
    
    # Tool -> Channel
    ax.annotate('', xy=(9.0, 5.2), xytext=(10.3, 5.2),
                arrowprops=dict(arrowstyle='->', color=BURGUNDY_LIGHT, lw=2))
    ax.text(9.65, 4.95, '结果', ha='center', fontsize=8, color=GOLD)

    # === 短期记忆 Context Window（左下）===
    short_bg = FancyBboxPatch((0.5, 1.0), 3.8, 2.8,
                              boxstyle="round,pad=0.15",
                              facecolor='#2d1b00', edgecolor=GOLD,
                              linewidth=2, alpha=0.4)
    ax.add_patch(short_bg)
    ax.text(2.4, 3.4, '短期记忆 Context Window', ha='center', fontsize=11, color=GOLD, fontweight='bold')
    
    # Context Window 内容
    ctx_items = ['User Msg', 'Assistant Msg', 'Tool Result', '...']
    for i, item in enumerate(ctx_items):
        box = FancyBboxPatch((0.8, 2.5 - i * 0.5), 3.2, 0.4,
                             boxstyle="round,pad=0.05",
                             facecolor=GOLD, edgecolor=CREAM,
                             linewidth=0.8, alpha=0.15)
        ax.add_patch(box)
        ax.text(2.4, 2.7 - i * 0.5, item, ha='center', fontsize=8, color=GOLD)
    
    # Channel -> Context Window
    ax.annotate('', xy=(2.4, 3.8), xytext=(4.5, 4.5),
                arrowprops=dict(arrowstyle='->', color=BURGUNDY_LIGHT, lw=1.5,
                               connectionstyle='arc3,rad=0.2'))
    ax.text(3.2, 4.3, '入队', ha='center', fontsize=8, color=CREAM)

    # Summarizer
    ax.text(2.4, 0.6, '满了 -> Summarizer 压缩摘要', ha='center', fontsize=8, color=CREAM, alpha=0.7,
            bbox=dict(boxstyle='round,pad=0.3', facecolor=BURGUNDY_DARK, edgecolor=GOLD, alpha=0.4))

    # === 长期记忆 Vector DB（右下）===
    long_bg = FancyBboxPatch((8.7, 1.0), 3.8, 2.8,
                             boxstyle="round,pad=0.15",
                             facecolor='#1a0e2e', edgecolor=PURPLE,
                             linewidth=2, alpha=0.4)
    ax.add_patch(long_bg)
    ax.text(11.6, 3.4, '长期记忆 Vector DB', ha='center', fontsize=11, color=PURPLE, fontweight='bold')
    
    # Vector DB 内容
    vec_items = ['Embedding 1', 'Embedding 2', 'Embedding 3', '...']
    for i, item in enumerate(vec_items):
        box = FancyBboxPatch((9.0, 2.5 - i * 0.5), 3.2, 0.4,
                             boxstyle="round,pad=0.05",
                             facecolor=PURPLE, edgecolor=CREAM,
                             linewidth=0.8, alpha=0.15)
        ax.add_patch(box)
        ax.text(11.6, 2.7 - i * 0.5, item, ha='center', fontsize=8, color=PURPLE)
    
    # LLM <-> Vector DB
    ax.annotate('', xy=(8.7, 2.5), xytext=(3.3, 2.5),
                arrowprops=dict(arrowstyle='<->', color=PURPLE, lw=1.5,
                               connectionstyle='arc3,rad=-0.15'))
    ax.text(6.0, 2.15, 'RAG 检索 / 存储', ha='center', fontsize=8, color=PURPLE, alpha=0.8)

    # === 中间核心说明 ===
    ax.text(6.5, 1.8, '不直接传递, 全部走 Channel', ha='center', fontsize=11, color=CREAM, alpha=0.85,
            bbox=dict(boxstyle='round,pad=0.5', facecolor=BURGUNDY_DARK, edgecolor=BURGUNDY, alpha=0.5))
    ax.text(6.5, 0.8, '信鸽传书: 郭靖写纸条 -> 黄蓉看 -> 仆人执行 -> 报告结果 -> 黄蓉念给郭靖听',
            ha='center', fontsize=9, color=CREAM, alpha=0.7)

    save(fig, 'channel_memory')

if __name__ == '__main__':
    draw_channel_memory()
    print('Channel memory diagram generated!')
