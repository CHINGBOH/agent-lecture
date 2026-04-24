"""
gen_diagrams.py — 为 agent-lecture 幻灯片生成深色主题架构图
输出到 public/diagrams/*.png (1920x1080)
"""
import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import matplotlib.patheffects as pe
import matplotlib.font_manager as fm
import networkx as nx

# ── 设置中文字体 ───────────────────────────────────────────────
_cjk_font = None
for _candidate in ['Noto Sans CJK SC', 'Noto Serif CJK SC', 'AR PL UMing CN', 'WenQuanYi Zen Hei']:
    if any(_candidate in f.name for f in fm.fontManager.ttflist):
        _cjk_font = _candidate
        break
if _cjk_font:
    plt.rcParams['font.family'] = _cjk_font
    plt.rcParams['axes.unicode_minus'] = False

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'diagrams')
os.makedirs(OUT, exist_ok=True)

W, H = 19.2, 10.8  # 1920x1080 @ 100dpi

# ── 颜色主题 ──────────────────────────────────────────────────
THEMES = {
    0: {'bg': '#1C0A00', 'accent': '#D4A843', 'text': '#F5E6C8', 'card': '#3E1F0050'},
    1: {'bg': '#020B18', 'accent': '#4FC3F7', 'text': '#E3F2FD', 'card': '#1565C030'},
    2: {'bg': '#1A0500', 'accent': '#FFB74D', 'text': '#FFF3E0', 'card': '#BF360C30'},
    3: {'bg': '#12001A', 'accent': '#CE93D8', 'text': '#F3E5F5', 'card': '#7B1FA230'},
    4: {'bg': '#001A05', 'accent': '#81C784', 'text': '#E8F5E9', 'card': '#2E7D3230'},
    5: {'bg': '#05001A', 'accent': '#80DEEA', 'text': '#E0F7FA', 'card': '#02838930'},
}


def fig(ch: int):
    """创建统一尺寸、深色背景的画布"""
    t = THEMES[ch]
    f = plt.figure(figsize=(W, H), facecolor=t['bg'])
    f.patch.set_facecolor(t['bg'])
    return f, t


def save(f, name: str):
    path = os.path.join(OUT, name)
    f.savefig(path, dpi=100, bbox_inches='tight', facecolor=f.get_facecolor())
    plt.close(f)
    print(f'✅  {path}')


def glow_text(ax, x, y, s, fontsize=14, color='white', **kw):
    """带光晕的文字"""
    t = ax.text(x, y, s, fontsize=fontsize, color=color,
                ha='center', va='center', **kw)
    t.set_path_effects([
        pe.withStroke(linewidth=6, foreground=color + '40'),
        pe.Normal(),
    ])
    return t


# ══════════════════════════════════════════════════════════════
# 图1：AI 发展时间线（序章）
# ══════════════════════════════════════════════════════════════
def gen_timeline():
    f, t = fig(0)
    ax = f.add_axes([0.04, 0.1, 0.92, 0.8])
    ax.set_facecolor(t['bg'])
    ax.set_xlim(1950, 2025)
    ax.set_ylim(-0.8, 1.4)
    ax.axis('off')

    events = [
        (1950, '图灵测试\n提出', '🧠', 0.8),
        (1956, 'AI\n达特茅斯\n会议', '🎓', -0.5),
        (1969, '第一次\nAI 寒冬', '❄️', 0.8),
        (1986, '反向传播\n算法', '⚡', -0.5),
        (1997, 'Deep Blue\n赢国际象棋', '♟️', 0.8),
        (2006, 'Hinton 深度\n学习复兴', '🔥', -0.5),
        (2012, 'AlexNet\nImageNet', '👁️', 0.8),
        (2017, 'Transformer\n论文', '📖', -0.5),
        (2022, 'ChatGPT\n问世', '🤖', 0.8),
    ]

    # 主轴线
    ax.axhline(0, color=t['accent'], lw=2, alpha=0.6, zorder=1)

    for year, label, emoji, ypos in events:
        # 节点圆
        circle = plt.Circle((year, 0), 0.06, color=t['accent'], zorder=3)
        ax.add_patch(circle)
        # 竖线
        ax.plot([year, year], [0, ypos * 0.6], color=t['accent'], lw=1.2,
                alpha=0.5, zorder=2)
        # emoji
        ax.text(year, ypos * 0.75, emoji, fontsize=20, ha='center', va='center', zorder=4)
        # 标签
        ax.text(year, ypos * 0.75 + (0.28 if ypos > 0 else -0.32),
                label, fontsize=9.5, ha='center', va='center',
                color=t['text'], fontweight='bold', linespacing=1.4, zorder=4)
        # 年份
        ax.text(year, -0.15 if ypos > 0 else 0.12, str(year),
                fontsize=8, ha='center', va='center',
                color=t['accent'], alpha=0.8)

    glow_text(ax, 1987, 1.3, 'AI 发展时间线  1950 — 2022',
              fontsize=22, color=t['text'], fontweight='bold')
    ax.text(1987, 1.18, '从一个思想实验，到改变世界的引擎',
            fontsize=13, ha='center', va='center', color=t['accent'], alpha=0.8)

    save(f, 'ch0_timeline.png')


# ══════════════════════════════════════════════════════════════
# 图2：神经网络多层感知机（第一章）
# ══════════════════════════════════════════════════════════════
def gen_neural_network():
    f, t = fig(1)
    ax = f.add_axes([0.05, 0.05, 0.9, 0.9])
    ax.set_facecolor(t['bg'])
    ax.set_xlim(-0.5, 5.5)
    ax.set_ylim(-0.5, 4.5)
    ax.axis('off')

    layers = [
        ('输入层', 3, 0.5, ['身高', '体重', '年龄'], t['accent']),
        ('隐藏层 1', 4, 1.8, ['' for _ in range(4)], '#7986CB'),
        ('隐藏层 2', 4, 3.1, ['' for _ in range(4)], '#9575CD'),
        ('输出层', 2, 4.4, ['猫🐱', '狗🐶'], '#EF9A9A'),
    ]

    node_positions = {}
    for layer_name, n, x, labels, color in layers:
        ys = np.linspace(0.5, 3.5, n)
        for i, (y, lbl) in enumerate(zip(ys, labels)):
            key = (x, round(y, 2))
            node_positions[key] = (x, y, color)
            circle = plt.Circle((x, y), 0.22, color=color, alpha=0.85, zorder=3)
            glow = plt.Circle((x, y), 0.28, color=color, alpha=0.15, zorder=2)
            ax.add_patch(circle)
            ax.add_patch(glow)
            if lbl:
                ax.text(x, y, lbl, fontsize=9, ha='center', va='center',
                        color='#111', fontweight='bold', zorder=4)
        ax.text(x, -0.2, layer_name, fontsize=11, ha='center', va='top',
                color=color, fontweight='bold')

    # 连接线
    layer_xs = [l[2] for l in layers]
    for idx in range(len(layers) - 1):
        x1, n1 = layer_xs[idx], layers[idx][1]
        x2, n2 = layer_xs[idx + 1], layers[idx + 1][1]
        ys1 = np.linspace(0.5, 3.5, n1)
        ys2 = np.linspace(0.5, 3.5, n2)
        for y1 in ys1:
            for y2 in ys2:
                ax.plot([x1, x2], [y1, y2], color='white', lw=0.6, alpha=0.12, zorder=1)

    glow_text(ax, 2.5, 4.25, '多层感知机 MLP — "模拟大脑的信号传递"',
              fontsize=20, color=t['text'], fontweight='bold')
    ax.text(2.5, 4.05, '每一层神经元提取更抽象的特征，就像人类从像素到轮廓到概念的认知过程',
            fontsize=12, ha='center', va='center', color=t['accent'], alpha=0.8)

    save(f, 'ch1_neural_network.png')


# ══════════════════════════════════════════════════════════════
# 图3：Transformer 编解码器架构（第二章）
# ══════════════════════════════════════════════════════════════
def gen_transformer():
    f, t = fig(2)
    ax = f.add_axes([0.05, 0.05, 0.9, 0.88])
    ax.set_facecolor(t['bg'])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.axis('off')

    accent = t['accent']

    def box(ax, x, y, w, h, label, color, sublabel='', fs=13):
        rect = FancyBboxPatch((x, y), w, h,
                               boxstyle='round,pad=0.12',
                               facecolor=color + '25',
                               edgecolor=color,
                               linewidth=2, zorder=3)
        ax.add_patch(rect)
        ax.text(x + w / 2, y + h / 2 + (0.12 if sublabel else 0),
                label, fontsize=fs, ha='center', va='center',
                color=t['text'], fontweight='bold', zorder=4)
        if sublabel:
            ax.text(x + w / 2, y + h / 2 - 0.22, sublabel,
                    fontsize=9, ha='center', va='center',
                    color=color, alpha=0.9, zorder=4)

    def arrow(ax, x1, y1, x2, y2):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle='->', color=accent, lw=1.8),
                    zorder=5)

    # Encoder stack (left)
    enc_x, enc_w = 0.6, 3.2
    box(ax, enc_x, 0.4, enc_w, 0.7, '输入 Token', '#90CAF9', '我 爱 自然 语言')
    box(ax, enc_x, 1.3, enc_w, 0.7, '位置编码', '#90CAF9', 'Positional Encoding')
    box(ax, enc_x, 2.2, enc_w, 0.8, '多头自注意力', accent, 'Multi-Head Self-Attention', fs=12)
    box(ax, enc_x, 3.2, enc_w, 0.6, 'Add & Norm', '#B0BEC5')
    box(ax, enc_x, 4.0, enc_w, 0.7, '前馈神经网络', accent, 'Feed Forward Network', fs=12)
    box(ax, enc_x, 4.9, enc_w, 0.6, 'Add & Norm', '#B0BEC5')
    ax.text(enc_x + enc_w / 2, 6.7, '🔒 编码器 Encoder',
            fontsize=15, ha='center', color='#90CAF9', fontweight='bold')
    rect_enc = FancyBboxPatch((enc_x - 0.1, 0.3), enc_w + 0.2, 5.4,
                               boxstyle='round,pad=0.2', fill=False,
                               edgecolor='#90CAF9', linewidth=1.2,
                               linestyle='--', alpha=0.4, zorder=2)
    ax.add_patch(rect_enc)

    # Decoder stack (right)
    dec_x, dec_w = 6.2, 3.2
    box(ax, dec_x, 0.4, dec_w, 0.7, '输出 Token', '#FFCC80', '<START> 自 然')
    box(ax, dec_x, 1.3, dec_w, 0.7, '位置编码', '#FFCC80', 'Positional Encoding')
    box(ax, dec_x, 2.2, dec_w, 0.8, 'Masked 自注意力', accent, '(遮住未来 Token)', fs=12)
    box(ax, dec_x, 3.2, dec_w, 0.8, '交叉注意力', '#FFB74D', 'Cross Attention ← Encoder', fs=11)
    box(ax, dec_x, 4.2, dec_w, 0.6, 'Add & Norm', '#B0BEC5')
    box(ax, dec_x, 5.0, dec_w, 0.7, '输出概率分布', '#EF9A9A', 'Softmax → 下一个词')
    ax.text(dec_x + dec_w / 2, 6.7, '🔓 解码器 Decoder',
            fontsize=15, ha='center', color='#FFCC80', fontweight='bold')
    rect_dec = FancyBboxPatch((dec_x - 0.1, 0.3), dec_w + 0.2, 5.6,
                               boxstyle='round,pad=0.2', fill=False,
                               edgecolor='#FFCC80', linewidth=1.2,
                               linestyle='--', alpha=0.4, zorder=2)
    ax.add_patch(rect_dec)

    # Cross attention arrow
    arrow(ax, enc_x + enc_w, 4.5, dec_x, 3.6)
    ax.text(5.05, 4.65, 'context', fontsize=9, ha='center',
            color=accent, style='italic', alpha=0.8)

    # Title
    glow_text(ax, 5, 6.85, 'Transformer 架构  "让每个词都能关注所有其他词"',
              fontsize=20, color=t['text'], fontweight='bold')

    save(f, 'ch2_transformer.png')


# ══════════════════════════════════════════════════════════════
# 图4：Attention 热力图示意（第二章）
# ══════════════════════════════════════════════════════════════
def gen_attention_heatmap():
    f, t = fig(2)
    ax = f.add_axes([0.18, 0.12, 0.65, 0.72])
    ax.set_facecolor(t['bg'])
    f.patch.set_facecolor(t['bg'])

    words = ['它', '是', '一', '只', '很', '聪', '明', '的', '猫']
    n = len(words)
    # 构造模拟注意力矩阵（"猫" 最关注主语"它"和"聪明"）
    attn = np.random.rand(n, n) * 0.1
    attn[8, 0] = 0.92   # 猫 → 它
    attn[8, 5] = 0.78   # 猫 → 聪
    attn[8, 6] = 0.82   # 猫 → 明
    attn[8, 8] = 1.0
    attn[5, 6] = 0.85   # 聪 → 明
    attn[5, 5] = 0.9
    for i in range(n):
        attn[i, i] = max(attn[i, i], 0.5)
    attn = attn / attn.sum(axis=1, keepdims=True)

    from matplotlib.colors import LinearSegmentedColormap
    cmap = LinearSegmentedColormap.from_list('dark_orange', [t['bg'], t['accent'], '#fff'])
    im = ax.imshow(attn, cmap=cmap, vmin=0, vmax=0.4)

    ax.set_xticks(range(n)); ax.set_xticklabels(words, fontsize=15, color=t['text'])
    ax.set_yticks(range(n)); ax.set_yticklabels(words, fontsize=15, color=t['text'])
    ax.tick_params(colors=t['text'], length=0)
    for spine in ax.spines.values():
        spine.set_visible(False)

    # 数值标注
    for i in range(n):
        for j in range(n):
            if attn[i, j] > 0.12:
                ax.text(j, i, f'{attn[i, j]:.2f}', ha='center', va='center',
                        fontsize=8, color='white', fontweight='bold', alpha=0.85)

    cbar = f.colorbar(im, ax=ax, fraction=0.03, pad=0.02)
    cbar.ax.yaxis.set_tick_params(color=t['text'])
    plt.setp(cbar.ax.yaxis.get_ticklabels(), color=t['text'])

    f.text(0.5, 0.92, 'Attention 热力图  "猫" 在关注谁？',
           ha='center', fontsize=20, color=t['text'], fontweight='bold')
    f.text(0.5, 0.87, '颜色越亮 = 注意力权重越高。"猫" 这个词主要关注主语"它"和修饰词"聪明"',
           ha='center', fontsize=13, color=t['accent'], alpha=0.85)

    save(f, 'ch2_attention.png')


# ══════════════════════════════════════════════════════════════
# 图5：强化学习循环（第三章）
# ══════════════════════════════════════════════════════════════
def gen_rl_loop():
    f, t = fig(3)
    ax = f.add_axes([0.05, 0.05, 0.9, 0.88])
    ax.set_facecolor(t['bg'])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    accent = t['accent']

    def circle_box(ax, x, y, r, label, sublabel, color):
        c = plt.Circle((x, y), r, color=color, alpha=0.2, zorder=2)
        c2 = plt.Circle((x, y), r, fill=False, edgecolor=color, linewidth=2.5, zorder=3)
        ax.add_patch(c)
        ax.add_patch(c2)
        ax.text(x, y + 0.18, label, fontsize=18, ha='center', va='center',
                color=t['text'], fontweight='bold', zorder=4)
        ax.text(x, y - 0.28, sublabel, fontsize=11, ha='center', va='center',
                color=color, alpha=0.9, zorder=4)

    # Agent
    circle_box(ax, 2.5, 3, 1.2, '🤖 Agent', '策略 π(a|s)', accent)
    # Environment
    circle_box(ax, 7.5, 3, 1.2, '🌍 环境', 'State / Reward', '#CE93D8')

    # 中间信息流
    # Action →
    ax.annotate('', xy=(6.3, 3.55), xytext=(3.7, 3.55),
                arrowprops=dict(arrowstyle='->', color=accent, lw=2.5), zorder=5)
    ax.text(5, 3.8, '动作  Action  a_t', fontsize=13, ha='center',
            color=accent, fontweight='bold')

    # State ←
    ax.annotate('', xy=(3.7, 2.45), xytext=(6.3, 2.45),
                arrowprops=dict(arrowstyle='->', color='#CE93D8', lw=2.5), zorder=5)
    ax.text(5, 2.1, '状态 s_{t+1} + 奖励 r_{t+1}', fontsize=13, ha='center',
            color='#CE93D8', fontweight='bold')

    # 价值函数框
    box_v = FancyBboxPatch((3.8, 0.4), 2.4, 0.9,
                            boxstyle='round,pad=0.1',
                            facecolor='#4A148C40', edgecolor=accent,
                            linewidth=1.5, zorder=3)
    ax.add_patch(box_v)
    ax.text(5, 0.85, '价值函数 V(s) / Q(s,a)', fontsize=12,
            ha='center', va='center', color=t['text'], fontweight='bold', zorder=4)

    # 循环箭头（示意）
    theta = np.linspace(np.pi * 0.55, np.pi * 1.45, 60)
    rx, ry = 2.5, 0.85
    xs = rx * np.cos(theta) + 5
    ys = ry * np.sin(theta) + 4.9
    ax.plot(xs, ys, color=accent, lw=2, alpha=0.5, zorder=2)

    glow_text(ax, 5, 5.65, '强化学习循环  "在试错中学会最优策略"',
              fontsize=20, color=t['text'], fontweight='bold')
    ax.text(5, 5.35, 'Agent 观察状态 → 选择动作 → 获得奖励 → 更新策略 → 循环',
            fontsize=13, ha='center', color=accent, alpha=0.85)

    save(f, 'ch3_rl_loop.png')


# ══════════════════════════════════════════════════════════════
# 图6：Agent 执行循环 Plan→Act→Observe（第四章）
# ══════════════════════════════════════════════════════════════
def gen_agent_loop():
    f, t = fig(4)
    ax = f.add_axes([0.05, 0.05, 0.9, 0.88])
    ax.set_facecolor(t['bg'])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    accent = t['accent']

    steps = [
        (2.0, 4.2, '🧠 THINK', '分析目标\n制定计划', accent),
        (5.0, 4.2, '⚡ ACT', '调用工具\n执行操作', '#FFB74D'),
        (8.0, 4.2, '👁️ OBSERVE', '观察结果\n更新记忆', '#CE93D8'),
        (5.0, 1.8, '🎯 GOAL', '目标达成？\n→ 完成 / 继续', '#EF9A9A'),
    ]

    for x, y, title, desc, color in steps:
        rect = FancyBboxPatch((x - 1.1, y - 0.7), 2.2, 1.4,
                               boxstyle='round,pad=0.15',
                               facecolor=color + '20',
                               edgecolor=color,
                               linewidth=2.2, zorder=3)
        ax.add_patch(rect)
        ax.text(x, y + 0.22, title, fontsize=15, ha='center',
                color=color, fontweight='black', zorder=4)
        ax.text(x, y - 0.25, desc, fontsize=10, ha='center',
                color=t['text'], linespacing=1.5, zorder=4)

    def curved_arrow(ax, x1, y1, x2, y2, label, color, rad=0.3):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(
                        arrowstyle='->', color=color, lw=2,
                        connectionstyle=f'arc3,rad={rad}',
                    ), zorder=5)
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2 + rad * 0.8
        ax.text(mx, my, label, fontsize=10, ha='center',
                color=color, alpha=0.85, fontweight='bold')

    # THINK → ACT
    curved_arrow(ax, 3.1, 4.2, 3.9, 4.2, '执行计划', accent, rad=0.25)
    # ACT → OBSERVE
    curved_arrow(ax, 6.1, 4.2, 6.9, 4.2, '工具返回', '#FFB74D', rad=0.25)
    # OBSERVE → GOAL
    curved_arrow(ax, 7.5, 3.5, 5.8, 2.5, '评估进度', '#CE93D8', rad=0.2)
    # GOAL → THINK (loop)
    curved_arrow(ax, 4.2, 2.0, 2.5, 3.5, '继续循环', '#EF9A9A', rad=-0.4)
    # 外部工具
    tools = ['🔍 搜索', '💻 代码', '📁 文件', '🌐 API']
    for i, tool in enumerate(tools):
        tx = 3.5 + i * 1.0
        ty = 0.6
        ax.text(tx, ty, tool, fontsize=11, ha='center',
                color=t['text'], alpha=0.7,
                bbox=dict(boxstyle='round,pad=0.3', facecolor='#ffffff10',
                          edgecolor='#ffffff20'))
        ax.plot([tx, 5.0], [ty + 0.25, 1.1], color='#FFB74D',
                lw=0.8, alpha=0.3, linestyle='--')

    ax.text(5, 0.2, '工具集  Tools', fontsize=11,
            ha='center', color='#FFB74D', alpha=0.6)

    glow_text(ax, 5, 5.65, 'AI Agent 执行循环  "思考 → 行动 → 观察"',
              fontsize=20, color=t['text'], fontweight='bold')
    ax.text(5, 5.35, '现代 Agent（AutoGPT / Claude / Copilot）都在跑这个循环',
            fontsize=13, ha='center', color=accent, alpha=0.85)

    save(f, 'ch4_agent_loop.png')


# ══════════════════════════════════════════════════════════════
# 图7：多 Agent 协作拓扑（第五章）
# ══════════════════════════════════════════════════════════════
def gen_multi_agent():
    f, t = fig(5)
    ax = f.add_axes([0.05, 0.05, 0.9, 0.88])
    ax.set_facecolor(t['bg'])
    ax.set_xlim(-1.5, 11.5)
    ax.set_ylim(-1, 7)
    ax.axis('off')

    accent = t['accent']

    G = nx.DiGraph()
    agents = {
        'Orchestrator\n🧠 总指挥': (5, 5.5),
        'Planner\n📋 规划': (1.5, 3.5),
        'Coder\n💻 编码': (3.5, 1.5),
        'Researcher\n🔍 调研': (5, 3.5),
        'Critic\n🎯 审查': (8.5, 3.5),
        'Executor\n⚡ 执行': (6.5, 1.5),
        '用户\n👤 Human': (5, -0.2),
    }

    colors = {
        'Orchestrator\n🧠 总指挥': accent,
        'Planner\n📋 规划': '#7986CB',
        'Coder\n💻 编码': '#4FC3F7',
        'Researcher\n🔍 调研': '#81C784',
        'Critic\n🎯 审查': '#FFB74D',
        'Executor\n⚡ 执行': '#CE93D8',
        '用户\n👤 Human': '#EF9A9A',
    }

    edges = [
        ('Orchestrator\n🧠 总指挥', 'Planner\n📋 规划', '分配任务'),
        ('Orchestrator\n🧠 总指挥', 'Researcher\n🔍 调研', '信息收集'),
        ('Orchestrator\n🧠 总指挥', 'Critic\n🎯 审查', '质量控制'),
        ('Planner\n📋 规划', 'Coder\n💻 编码', '编码任务'),
        ('Researcher\n🔍 调研', 'Executor\n⚡ 执行', '执行指令'),
        ('Coder\n💻 编码', 'Critic\n🎯 审查', '代码审查'),
        ('Critic\n🎯 审查', 'Executor\n⚡ 执行', '执行批准'),
        ('Executor\n⚡ 执行', '用户\n👤 Human', '返回结果'),
        ('用户\n👤 Human', 'Orchestrator\n🧠 总指挥', '发起任务'),
    ]

    for node, (x, y) in agents.items():
        color = colors[node]
        circle = plt.Circle((x, y), 0.72, color=color, alpha=0.18, zorder=2)
        circle2 = plt.Circle((x, y), 0.72, fill=False, edgecolor=color,
                              linewidth=2, zorder=3)
        glow_c = plt.Circle((x, y), 0.85, color=color, alpha=0.06, zorder=1)
        ax.add_patch(glow_c)
        ax.add_patch(circle)
        ax.add_patch(circle2)
        lines = node.split('\n')
        ax.text(x, y + 0.12, lines[1] if len(lines) > 1 else '', fontsize=18,
                ha='center', va='center', zorder=4)
        ax.text(x, y - 0.32, lines[0], fontsize=9.5, ha='center',
                color=t['text'], fontweight='bold', zorder=4)

    for src, dst, label in edges:
        x1, y1 = agents[src]
        x2, y2 = agents[dst]
        dx, dy = x2 - x1, y2 - y1
        norm = (dx ** 2 + dy ** 2) ** 0.5
        sx = x1 + dx / norm * 0.75
        sy = y1 + dy / norm * 0.75
        ex = x2 - dx / norm * 0.75
        ey = y2 - dy / norm * 0.75
        ax.annotate('', xy=(ex, ey), xytext=(sx, sy),
                    arrowprops=dict(arrowstyle='->', color=colors[src],
                                   lw=1.5, alpha=0.7), zorder=5)
        mx, my = (sx + ex) / 2, (sy + ey) / 2
        ax.text(mx, my, label, fontsize=8.5, ha='center',
                color=colors[src], alpha=0.75, fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.15', facecolor=t['bg'] + 'DD',
                          edgecolor='none'))

    glow_text(ax, 5, 6.6, '多 Agent 协作拓扑  "分工协作，比单一 Agent 更强"',
              fontsize=20, color=t['text'], fontweight='bold')
    ax.text(5, 6.3, '就像金庸里的丐帮：帮主统筹，各堂口各司其职',
            fontsize=13, ha='center', color=accent, alpha=0.85)

    save(f, 'ch5_multi_agent.png')


if __name__ == '__main__':
    print('🎨 生成架构图中...\n')
    gen_timeline()
    gen_neural_network()
    gen_transformer()
    gen_attention_heatmap()
    gen_rl_loop()
    gen_agent_loop()
    gen_multi_agent()
    print('\n✨ 全部完成！输出在 public/diagrams/')
