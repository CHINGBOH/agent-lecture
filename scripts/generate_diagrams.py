#!/usr/bin/env python3
"""
Generate technical architecture diagrams for the Agent Lecture tutorial.
Run: python scripts/generate_diagrams.py
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle, Rectangle, Wedge
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = "public/images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Set Chinese font
plt.rcParams['font.family'] = ['Noto Sans CJK SC', 'AR PL UMing CN', 'sans-serif']
plt.rcParams['axes.unicode_minus'] = False

def savefig(name, fig=None, dpi=150):
    path = os.path.join(OUTPUT_DIR, name)
    if fig is None:
        fig = plt.gcf()
    fig.savefig(path, dpi=dpi, bbox_inches='tight', facecolor='#1a1a2e', edgecolor='none')
    plt.close(fig)
    print(f"Generated: {path}")

# ============================================================
# 1. Data Pipeline
# ============================================================
def gen_data_pipeline():
    fig, ax = plt.subplots(figsize=(12, 4))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 4)
    ax.axis('off')
    ax.set_facecolor('#1a1a2e')
    fig.patch.set_facecolor('#1a1a2e')

    stages = [
        ('互联网\nRaw数据', '~10TB', '#4a7ab8'),
        ('清洗\n去HTML/乱码', '~5TB', '#4a8c5f'),
        ('去重\nMinHash+LSH', '~2TB', '#b8860b'),
        ('质量过滤\nPerplexity<500', '~1TB', '#8b2500'),
    ]

    for i, (label, size, color) in enumerate(stages):
        x = 1.5 + i * 2.8
        rect = FancyBboxPatch((x-1, 1), 2, 2, boxstyle="round,pad=0.1",
                              facecolor=color, alpha=0.2, edgecolor=color, linewidth=2)
        ax.add_patch(rect)
        ax.text(x, 2.5, label, ha='center', va='center', fontsize=11, color='white', fontweight='bold')
        ax.text(x, 1.4, size, ha='center', va='center', fontsize=10, color='#aaa')
        if i < len(stages) - 1:
            ax.annotate('', xy=(x+1.8, 2), xytext=(x+1, 2),
                       arrowprops=dict(arrowstyle='->', color='#d4a843', lw=2))

    ax.text(6, 3.5, '数据江湖：从 10TB 到 1TB', ha='center', fontsize=16, color='white', fontweight='bold')
    savefig('data_pipeline.png', fig)

# ============================================================
# 2. Training Pipeline
# ============================================================
def gen_training_pipeline():
    fig, ax = plt.subplots(figsize=(12, 5))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 5)
    ax.axis('off')
    ax.set_facecolor('#1a1a2e')
    fig.patch.set_facecolor('#1a1a2e')

    stages = [
        ('Pre-training', '学会说话', '1TB文本\nlr=6e-4', '#4a7ab8'),
        ('SFT', '学会听话', '100万Q,A\nlr=2e-5', '#4a8c5f'),
        ('RLHF', '讨人喜欢', '10万偏好\nlr=1e-6', '#b8860b'),
        ('Function\nCalling FT', '输出JSON', '50万样本\nlr=2e-5', '#8b2500'),
    ]

    for i, (title, desc, detail, color) in enumerate(stages):
        x = 1.5 + i * 2.8
        rect = FancyBboxPatch((x-1, 0.5), 2, 3.5, boxstyle="round,pad=0.1",
                              facecolor=color, alpha=0.15, edgecolor=color, linewidth=2)
        ax.add_patch(rect)
        ax.text(x, 3.5, title, ha='center', va='center', fontsize=11, color='white', fontweight='bold')
        ax.text(x, 2.8, desc, ha='center', va='center', fontsize=10, color='#ccc')
        ax.text(x, 1.5, detail, ha='center', va='center', fontsize=9, color='#aaa')
        if i < len(stages) - 1:
            ax.annotate('', xy=(x+1.8, 2.2), xytext=(x+1, 2.2),
                       arrowprops=dict(arrowstyle='->', color='#d4a843', lw=2.5))

    ax.text(6, 4.5, '训练三部曲', ha='center', fontsize=16, color='white', fontweight='bold')
    savefig('training_pipeline.png', fig)

# ============================================================
# 3. Transformer Architecture
# ============================================================
def gen_transformer_arch():
    fig, ax = plt.subplots(figsize=(10, 10))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    ax.set_facecolor('#1a1a2e')
    fig.patch.set_facecolor('#1a1a2e')

    # Input
    rect = FancyBboxPatch((3.5, 9), 3, 0.6, boxstyle="round,pad=0.05",
                          facecolor='#4a7ab8', alpha=0.3, edgecolor='#4a7ab8', linewidth=2)
    ax.add_patch(rect)
    ax.text(5, 9.3, '输入文本 → Token Embedding', ha='center', va='center', fontsize=10, color='white')

    # Positional Encoding
    rect = FancyBboxPatch((3.5, 8), 3, 0.6, boxstyle="round,pad=0.05",
                          facecolor='#6a1b9a', alpha=0.3, edgecolor='#6a1b9a', linewidth=2)
    ax.add_patch(rect)
    ax.text(5, 8.3, '+ 位置编码 (sin/cos)', ha='center', va='center', fontsize=10, color='white')

    ax.annotate('', xy=(5, 8.7), xytext=(5, 9), arrowprops=dict(arrowstyle='->', color='#888', lw=1.5))

    # Transformer Layers (stacked)
    colors = ['#2d5a3d', '#2d5a3d', '#2d5a3d']
    for i in range(3):
        y = 6.5 - i * 1.5
        rect = FancyBboxPatch((2, y), 6, 1.2, boxstyle="round,pad=0.1",
                              facecolor=colors[i], alpha=0.2, edgecolor=colors[i], linewidth=2)
        ax.add_patch(rect)
        ax.text(5, y+0.7, f'Transformer Layer {i+1}', ha='center', va='center', fontsize=10, color='white', fontweight='bold')
        ax.text(5, y+0.3, 'Self-Attention → Feed Forward → Layer Norm', ha='center', va='center', fontsize=8, color='#aaa')
        ax.annotate('', xy=(5, y+1.4), xytext=(5, y+1.2), arrowprops=dict(arrowstyle='->', color='#888', lw=1.5))

    # Output
    rect = FancyBboxPatch((3.5, 1.5), 3, 0.6, boxstyle="round,pad=0.05",
                          facecolor='#8b2500', alpha=0.3, edgecolor='#8b2500', linewidth=2)
    ax.add_patch(rect)
    ax.text(5, 1.8, '输出 Logits → Softmax → 下一个 Token', ha='center', va='center', fontsize=10, color='white')

    ax.annotate('', xy=(5, 2.2), xytext=(5, 2.5), arrowprops=dict(arrowstyle='->', color='#888', lw=1.5))

    ax.text(5, 0.5, 'Transformer 架构：输入 → 多层 Attention → 输出', ha='center', fontsize=14, color='white', fontweight='bold')
    savefig('transformer_arch.png', fig)

# ============================================================
# 4. Attention Heatmap
# ============================================================
def gen_attention_heatmap():
    fig, ax = plt.subplots(figsize=(8, 7))
    fig.patch.set_facecolor('#1a1a2e')
    ax.set_facecolor('#1a1a2e')

    tokens = ['[BOS]', '猫', '坐', '在', '垫子', '上']
    n = len(tokens)
    # Create attention-like matrix (higher near diagonal)
    data = np.zeros((n, n))
    for i in range(n):
        for j in range(n):
            data[i, j] = max(0.1, 1 - abs(i-j) * 0.3 + np.random.random() * 0.2)

    im = ax.imshow(data, cmap='Blues', aspect='auto', vmin=0, vmax=1)
    ax.set_xticks(range(n))
    ax.set_yticks(range(n))
    ax.set_xticklabels(tokens, color='white', fontsize=11)
    ax.set_yticklabels(tokens, color='white', fontsize=11)
    ax.tick_params(colors='white')

    # Add text annotations
    for i in range(n):
        for j in range(n):
            text = ax.text(j, i, f'{data[i,j]:.2f}', ha='center', va='center',
                          color='white' if data[i,j] > 0.5 else '#333', fontsize=9)

    ax.set_title('Attention 权重热力图："猫坐在垫子上"', color='white', fontsize=14, fontweight='bold', pad=15)
    ax.set_xlabel('被关注的词', color='#888', fontsize=11)
    ax.set_ylabel('当前词', color='#888', fontsize=11)

    plt.colorbar(im, ax=ax, label='注意力权重', shrink=0.8)
    savefig('attention_heatmap.png', fig)

# ============================================================
# 5. Gradient Descent Landscape
# ============================================================
def gen_gradient_descent():
    fig, ax = plt.subplots(figsize=(10, 7), subplot_kw={'projection': '3d'})
    fig.patch.set_facecolor('#1a1a2e')
    ax.set_facecolor('#1a1a2e')

    # Create a loss landscape
    x = np.linspace(-3, 3, 100)
    y = np.linspace(-3, 3, 100)
    X, Y = np.meshgrid(x, y)
    Z = np.log(1 + X**2 + 2*Y**2) + 0.1 * np.sin(3*X) * np.cos(3*Y)

    surf = ax.plot_surface(X, Y, Z, cmap='viridis', alpha=0.6, edgecolor='none')
    ax.set_xlabel('参数 W1', color='white', fontsize=10)
    ax.set_ylabel('参数 W2', color='white', fontsize=10)
    ax.set_zlabel('Loss', color='white', fontsize=10)
    ax.tick_params(colors='white')

    # Plot gradient descent path
    path_x = [2.5, 1.8, 1.0, 0.5, 0.2, 0.05, 0.01]
    path_y = [2.0, 1.2, 0.6, 0.3, 0.1, 0.02, 0.005]
    path_z = [np.log(1+px**2+2*py**2)+0.1*np.sin(3*px)*np.cos(3*py) for px, py in zip(path_x, path_y)]
    ax.plot(path_x, path_y, path_z, 'r-', linewidth=3, marker='o', markersize=6, label='梯度下降路径')

    ax.set_title('损失曲面与梯度下降路径', color='white', fontsize=14, fontweight='bold', pad=10)
    ax.legend(loc='upper right', facecolor='#1a1a2e', edgecolor='white', labelcolor='white')
    savefig('gradient_descent.png', fig)

# ============================================================
# 6. Decoding Strategies Comparison
# ============================================================
def gen_decoding_strategies():
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    fig.patch.set_facecolor('#1a1a2e')

    strategies = [
        ('Greedy', '总是选概率最高的', [0.8, 0.1, 0.05, 0.03, 0.02]),
        ('Top-k (k=3)', '只从前3个中选', [0.5, 0.3, 0.15, 0, 0]),
        ('Top-p (p=0.8)', '累积概率达80%', [0.4, 0.25, 0.15, 0.08, 0]),
        ('Temperature=1.5', '增加随机性', [0.3, 0.25, 0.2, 0.15, 0.1]),
    ]

    tokens = ['苹果', '香蕉', '西瓜', '橙子', '葡萄']
    colors_list = ['#4a7ab8', '#4a8c5f', '#b8860b', '#8b2500', '#6a1b9a']

    for ax, (name, desc, probs) in zip(axes.flat, strategies):
        ax.set_facecolor('#1a1a2e')
        bars = ax.bar(tokens, probs, color=colors_list, alpha=0.7, edgecolor='white', linewidth=1)
        ax.set_title(f'{name}\n{desc}', color='white', fontsize=12, fontweight='bold')
        ax.tick_params(colors='white')
        ax.set_ylim(0, 1)
        ax.set_ylabel('概率', color='#888')
        for bar, prob in zip(bars, probs):
            if prob > 0:
                ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.02,
                       f'{prob:.0%}', ha='center', va='bottom', color='white', fontsize=9)

    plt.suptitle('解码策略对比：下一个 Token 的概率分布', color='white', fontsize=16, fontweight='bold', y=0.98)
    plt.tight_layout(rect=[0, 0, 1, 0.95])
    savefig('decoding_strategies.png', fig)

# ============================================================
# 7. Tool Call Flow
# ============================================================
def gen_tool_call_flow():
    fig, ax = plt.subplots(figsize=(12, 6))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 6)
    ax.axis('off')
    ax.set_facecolor('#1a1a2e')
    fig.patch.set_facecolor('#1a1a2e')

    steps = [
        (1, 3, '用户', '查北京天气', '#4a7ab8'),
        (3.5, 3, 'LLM', '生成 JSON', '#4a8c5f'),
        (6, 3, 'Parser', '解析参数', '#b8860b'),
        (8.5, 3, 'Tool', '调用天气API', '#8b2500'),
        (11, 3, '回复', '北京晴 25°C', '#6a1b9a'),
    ]

    for i, (x, y, label, detail, color) in enumerate(steps):
        circle = Circle((x, y), 0.6, facecolor=color, alpha=0.3, edgecolor=color, linewidth=2)
        ax.add_patch(circle)
        ax.text(x, y, label, ha='center', va='center', fontsize=10, color='white', fontweight='bold')
        ax.text(x, y-1, detail, ha='center', va='center', fontsize=9, color='#aaa')
        if i < len(steps) - 1:
            ax.annotate('', xy=(x+1.9, y), xytext=(x+0.7, y),
                       arrowprops=dict(arrowstyle='->', color='#d4a843', lw=2))

    ax.text(6, 5.5, 'Tool Call 完整链路', ha='center', fontsize=16, color='white', fontweight='bold')
    savefig('tool_call_flow.png', fig)

# ============================================================
# 8. Agent OS Architecture
# ============================================================
def gen_agent_os_arch():
    fig, ax = plt.subplots(figsize=(10, 8))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8)
    ax.axis('off')
    ax.set_facecolor('#1a1a2e')
    fig.patch.set_facecolor('#1a1a2e')

    # Pyramid layers (bottom to top)
    layers = [
        (1, 0.5, 8, 1.2, 'Workflow = 进程调度器', '#4a7ab8'),
        (1.5, 2, 7, 1.2, 'Agent = 进程', '#4a8c5f'),
        (2, 3.5, 6, 1.2, 'Skill = 动态链接库', '#b8860b'),
        (2.5, 5, 5, 1.2, 'Rule = 内核安全策略', '#8b2500'),
    ]

    for x, y, w, h, label, color in layers:
        rect = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.1",
                              facecolor=color, alpha=0.2, edgecolor=color, linewidth=2)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h/2, label, ha='center', va='center', fontsize=12, color='white', fontweight='bold')

    ax.text(5, 7, 'Agent OS 架构：四层金字塔', ha='center', fontsize=16, color='white', fontweight='bold')
    ax.text(5, 6.5, '底层（Tick+JMP+Channel+State）→ 操作系统层', ha='center', fontsize=11, color='#aaa')
    savefig('agent_os_arch.png', fig)

# ============================================================
# 9. PDCA Cycle
# ============================================================
def gen_pdca_cycle():
    fig, ax = plt.subplots(figsize=(8, 8))
    ax.set_xlim(-4, 4)
    ax.set_ylim(-4, 4)
    ax.axis('off')
    ax.set_facecolor('#1a1a2e')
    fig.patch.set_facecolor('#1a1a2e')
    ax.set_aspect('equal')

    # Draw circle
    circle = Circle((0, 0), 3, fill=False, edgecolor='#555', linewidth=2, linestyle='--')
    ax.add_patch(circle)

    # PDCA quadrants
    quadrants = [
        (45, 'PLAN\nproject-planner', '#4a7ab8', (1.5, 1.5)),
        (135, 'DO\nWorker Agents', '#4a8c5f', (-1.5, 1.5)),
        (225, 'CHECK\nquality-inspector', '#b8860b', (-1.5, -1.5)),
        (315, 'ACT\norchestrator', '#8b2500', (1.5, -1.5)),
    ]

    for angle, label, color, pos in quadrants:
        wedge = Wedge((0, 0), 2.5, angle-45, angle+45, facecolor=color, alpha=0.2, edgecolor=color, linewidth=2)
        ax.add_patch(wedge)
        ax.text(pos[0], pos[1], label, ha='center', va='center', fontsize=11, color='white', fontweight='bold')

    # Arrow showing cycle
    arrow = FancyArrowPatch((2.2, 0.5), (0.5, 2.2), connectionstyle="arc3,rad=.3",
                           arrowstyle='->', color='#d4a843', lw=2.5, mutation_scale=15)
    ax.add_patch(arrow)

    ax.text(0, 0, '🔄', ha='center', va='center', fontsize=30)
    ax.text(0, 3.5, 'PDCA 质量管理闭环', ha='center', fontsize=16, color='white', fontweight='bold')
    savefig('pdca_cycle.png', fig)

# ============================================================
# 10. Multi-Agent Fork
# ============================================================
def gen_multi_agent_fork():
    fig, ax = plt.subplots(figsize=(12, 7))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis('off')
    ax.set_facecolor('#1a1a2e')
    fig.patch.set_facecolor('#1a1a2e')

    # Orchestrator at top
    rect = FancyBboxPatch((4.5, 5.5), 3, 1, boxstyle="round,pad=0.1",
                          facecolor='#8b2500', alpha=0.3, edgecolor='#8b2500', linewidth=2)
    ax.add_patch(rect)
    ax.text(6, 6, 'Orchestrator (洪七公)', ha='center', va='center', fontsize=11, color='white', fontweight='bold')

    # Fork arrows
    agents = [
        (1.5, 3, 'backend-specialist', '#4a7ab8'),
        (4.5, 3, 'frontend-specialist', '#4a8c5f'),
        (7.5, 3, 'quality-inspector', '#b8860b'),
        (10.5, 3, 'debugger', '#6a1b9a'),
    ]

    for x, y, label, color in agents:
        ax.annotate('', xy=(x, y+1), xytext=(6, 5.5),
                   arrowprops=dict(arrowstyle='->', color=color, lw=2, connectionstyle="arc3,rad=0.1"))
        rect = FancyBboxPatch((x-1, y-0.8), 2, 1.2, boxstyle="round,pad=0.1",
                              facecolor=color, alpha=0.2, edgecolor=color, linewidth=2)
        ax.add_patch(rect)
        ax.text(x, y, label, ha='center', va='center', fontsize=9, color='white', fontweight='bold')

    # Channel
    rect = FancyBboxPatch((2, 1), 8, 0.8, boxstyle="round,pad=0.05",
                          facecolor='#d4a843', alpha=0.2, edgecolor='#d4a843', linewidth=2)
    ax.add_patch(rect)
    ax.text(6, 1.4, 'Channel (FIFO 队列) —— 结果汇总', ha='center', va='center', fontsize=10, color='white')

    ax.text(6, 6.7, 'Multi-Agent Fork：进程克隆与协作', ha='center', fontsize=16, color='white', fontweight='bold')
    savefig('multi_agent_fork.png', fig)

# ============================================================
# 11. Embedding Visualization (2D PCA-like)
# ============================================================
def gen_embedding_viz():
    fig, ax = plt.subplots(figsize=(9, 7))
    fig.patch.set_facecolor('#1a1a2e')
    ax.set_facecolor('#1a1a2e')

    np.random.seed(42)
    # Word clusters
    words_animals = {'猫': (2, 3), '狗': (2.5, 2.8), '虎': (1.8, 3.2), '狼': (2.2, 2.5)}
    words_food = {'苹果': (-2, 1), '香蕉': (-2.5, 1.2), '西瓜': (-1.8, 0.8), '橙子': (-2.2, 1.5)}
    words_tech = {'电脑': (1, -2), '手机': (1.5, -2.2), '网络': (0.8, -1.8), '代码': (1.2, -2.5)}

    for word, (x, y) in words_animals.items():
        ax.scatter(x, y, c='#4a7ab8', s=200, alpha=0.6)
        ax.text(x, y+0.3, word, ha='center', va='bottom', color='white', fontsize=11)
    for word, (x, y) in words_food.items():
        ax.scatter(x, y, c='#4a8c5f', s=200, alpha=0.6)
        ax.text(x, y+0.3, word, ha='center', va='bottom', color='white', fontsize=11)
    for word, (x, y) in words_tech.items():
        ax.scatter(x, y, c='#b8860b', s=200, alpha=0.6)
        ax.text(x, y+0.3, word, ha='center', va='bottom', color='white', fontsize=11)

    ax.set_title('Embedding 空间：相似词语聚集在一起', color='white', fontsize=14, fontweight='bold')
    ax.tick_params(colors='#555')
    ax.set_xlabel('维度 1', color='#888')
    ax.set_ylabel('维度 2', color='#888')
    ax.grid(True, alpha=0.1, color='white')

    # Legend
    from matplotlib.lines import Line2D
    legend_elements = [
        Line2D([0], [0], marker='o', color='w', markerfacecolor='#4a7ab8', markersize=10, label='动物'),
        Line2D([0], [0], marker='o', color='w', markerfacecolor='#4a8c5f', markersize=10, label='食物'),
        Line2D([0], [0], marker='o', color='w', markerfacecolor='#b8860b', markersize=10, label='科技'),
    ]
    ax.legend(handles=legend_elements, loc='upper right', facecolor='#1a1a2e', edgecolor='white', labelcolor='white')

    savefig('embedding_viz.png', fig)

# ============================================================
# 12. LR Schedule
# ============================================================
def gen_lr_schedule():
    fig, ax = plt.subplots(figsize=(10, 5))
    fig.patch.set_facecolor('#1a1a2e')
    ax.set_facecolor('#1a1a2e')

    steps = np.arange(0, 300000)
    warmup = 2000
    max_lr = 6e-4

    lr = np.zeros_like(steps, dtype=float)
    lr[:warmup] = max_lr * steps[:warmup] / warmup
    lr[warmup:] = max_lr * 0.5 * (1 + np.cos(np.pi * (steps[warmup:]-warmup)/(300000-warmup)))

    ax.plot(steps, lr, color='#d4a843', linewidth=2)
    ax.axvline(x=warmup, color='#4a7ab8', linestyle='--', alpha=0.5, label='Warmup 结束')

    ax.set_xlabel('训练步数', color='#888')
    ax.set_ylabel('学习率', color='#888')
    ax.set_title('学习率调度：Warmup + Cosine Decay', color='white', fontsize=14, fontweight='bold')
    ax.tick_params(colors='white')
    ax.legend(facecolor='#1a1a2e', edgecolor='white', labelcolor='white')
    ax.grid(True, alpha=0.1, color='white')

    savefig('lr_schedule.png', fig)

# ============================================================
# Main
# ============================================================
if __name__ == '__main__':
    gen_data_pipeline()
    gen_training_pipeline()
    gen_transformer_arch()
    gen_attention_heatmap()
    gen_gradient_descent()
    gen_decoding_strategies()
    gen_tool_call_flow()
    gen_agent_os_arch()
    gen_pdca_cycle()
    gen_multi_agent_fork()
    gen_embedding_viz()
    gen_lr_schedule()
    print(f"\nAll diagrams generated in {OUTPUT_DIR}/")
