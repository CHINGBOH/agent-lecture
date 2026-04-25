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

W, H = 12.8, 7.2   # 1920x1080 @ 150dpi

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
    plt.rcParams.update({
        'text.color': t['text'],
        'axes.facecolor': t['bg'],
        'figure.facecolor': t['bg'],
        'axes.edgecolor': 'none',
        'xtick.color': t['text'],
        'ytick.color': t['text'],
    })
    f = plt.figure(figsize=(W, H), facecolor=t['bg'])
    f.patch.set_facecolor(t['bg'])
    return f, t


def make_ax(f, t, rect=None):
    """创建与主题一致的坐标轴"""
    ax = f.add_axes(rect or [0.02, 0.02, 0.96, 0.96])
    ax.set_facecolor(t['bg'])
    ax.patch.set_alpha(1)
    for spine in ax.spines.values():
        spine.set_visible(False)
    ax.set_xticks([])
    ax.set_yticks([])
    return ax


def save(f, name: str):
    path = os.path.join(OUT, name)
    f.savefig(path, dpi=150, bbox_inches='tight', facecolor=f.get_facecolor())
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
def gen_timeline(f, t):
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



# ══════════════════════════════════════════════════════════════
# 图2：神经网络多层感知机（第一章）
# ══════════════════════════════════════════════════════════════
def gen_neural_network(f, t):
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



# ══════════════════════════════════════════════════════════════
# 图3：Transformer 编解码器架构（第二章）
# ══════════════════════════════════════════════════════════════
def gen_transformer(f, t):
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



# ══════════════════════════════════════════════════════════════
# 图4：Attention 热力图示意（第二章）
# ══════════════════════════════════════════════════════════════
def gen_attention_heatmap(f, t):
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
    cbar.ax.set_facecolor(t['bg'])
    cbar.ax.figure.patch.set_facecolor(t['bg'])

    f.text(0.5, 0.92, 'Attention 热力图  "猫" 在关注谁？',
           ha='center', fontsize=20, color=t['text'], fontweight='bold')
    f.text(0.5, 0.87, '颜色越亮 = 注意力权重越高。"猫" 这个词主要关注主语"它"和修饰词"聪明"',
           ha='center', fontsize=13, color=t['accent'], alpha=0.85)



# ══════════════════════════════════════════════════════════════
# 图5：强化学习循环（第三章）
# ══════════════════════════════════════════════════════════════
def gen_rl_loop(f, t):
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



# ══════════════════════════════════════════════════════════════
# 图6：Agent 执行循环 Plan→Act→Observe（第四章）
# ══════════════════════════════════════════════════════════════
def gen_agent_loop(f, t):
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



# ══════════════════════════════════════════════════════════════
# 图7：多 Agent 协作拓扑（第五章）
# ══════════════════════════════════════════════════════════════
def gen_multi_agent(f, t):
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



def gen_backprop(f, t):
    """反向传播：前向（蓝）+ 反向（橙）双向数值流动图，气走小周天意象"""
    accent = t['accent']
    bg = t['bg']
    text_col = t['text']

    ax = f.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.set_aspect('auto')
    ax.axis('off')
    ax.set_facecolor(bg)

    FWD = '#4FC3F7'   # 前向：章节主色（蓝）
    BWD = '#FF8A65'   # 反向：暖橙
    LOSS_C = '#EF5350' # 损失：红

    # ── 网络结构定义 ────────────────────────────────────────────
    layers = [
        {'name': '输入层\nInput', 'x': 1.5, 'nodes': 3,
         'values': ['x1=0.8', 'x2=0.4', 'x3=0.2']},
        {'name': '隐藏层1\nHidden 1', 'x': 3.8, 'nodes': 4,
         'values': ['h1=0.62', 'h2=0.41', 'h3=0.78', 'h4=0.35']},
        {'name': '隐藏层2\nHidden 2', 'x': 6.1, 'nodes': 3,
         'values': ['h5=0.71', 'h6=0.55', 'h7=0.43']},
        {'name': '输出层\nOutput', 'x': 8.4, 'nodes': 2,
         'values': ['y1=0.83', 'y2=0.17']},
    ]
    node_y_center = 3.0  # vertical center

    def node_ys(n):
        """返回 n 个节点的 y 坐标列表（居中分布）"""
        spacing = 0.85
        total = (n - 1) * spacing
        start = node_y_center - total / 2
        return [start + i * spacing for i in range(n)]

    # 收集所有节点坐标
    coords = {}  # (layer_idx, node_idx) -> (x, y)
    for li, layer in enumerate(layers):
        ys = node_ys(layer['nodes'])
        for ni, y in enumerate(ys):
            coords[(li, ni)] = (layer['x'], y)

    # ── 绘制前向连接（蓝色，细线） ──────────────────────────────
    for li in range(len(layers) - 1):
        n1 = layers[li]['nodes']
        n2 = layers[li + 1]['nodes']
        for a in range(n1):
            for b in range(n2):
                x1, y1 = coords[(li, a)]
                x2, y2 = coords[(li + 1, b)]
                ax.annotate('', xy=(x2 - 0.22, y2), xytext=(x1 + 0.22, y1),
                            arrowprops=dict(arrowstyle='->', color=FWD,
                                           lw=0.9, alpha=0.35,
                                           connectionstyle='arc3,rad=0.05'))

    # ── 绘制节点 ────────────────────────────────────────────────
    for li, layer in enumerate(layers):
        ys = node_ys(layer['nodes'])
        is_output = (li == len(layers) - 1)
        for ni, y in enumerate(ys):
            x = layer['x']
            # 节点圆
            circle = plt.Circle((x, y), 0.2,
                                 color=FWD if not is_output else LOSS_C,
                                 zorder=6, alpha=0.9)
            ax.add_patch(circle)
            ax.text(x, y, layer['values'][ni],
                    fontsize=7.5, ha='center', va='center',
                    color='#0a0a0a', fontweight='bold', zorder=7)

    # ── 反向传播：从 Loss 往左的粗橙色箭头（层间中点位置） ──────
    bp_y_offsets = [0.55, 0, -0.55]  # 3 条代表性梯度路径
    for path_i, dy_off in enumerate(bp_y_offsets):
        alpha = 0.9 - path_i * 0.2
        # 从 Loss 到各隐藏层逐层画反向箭头
        bwd_xs = [8.1, 5.85, 3.6, 1.75]  # 从右到左
        bwd_ys_base = [node_y_center + dy_off * 0.6] * 4
        for seg in range(len(bwd_xs) - 1):
            x1, y1 = bwd_xs[seg], bwd_ys_base[seg]
            x2, y2 = bwd_xs[seg + 1], bwd_ys_base[seg + 1]
            ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                        arrowprops=dict(arrowstyle='->', color=BWD,
                                       lw=2.2 - path_i * 0.4, alpha=alpha,
                                       connectionstyle='arc3,rad=-0.08'))

    # ── Loss 框 ──────────────────────────────────────────────────
    loss_x, loss_y = 9.3, 3.0
    loss_box = FancyBboxPatch((loss_x - 0.55, loss_y - 0.45), 1.1, 0.9,
                               boxstyle='round,pad=0.08',
                               facecolor='#B71C1C30', edgecolor=LOSS_C,
                               linewidth=2, zorder=6)
    ax.add_patch(loss_box)
    ax.text(loss_x, loss_y + 0.18, 'Loss', fontsize=13,
            ha='center', va='center', color=LOSS_C, fontweight='bold', zorder=7)
    ax.text(loss_x, loss_y - 0.18, 'L=0.41', fontsize=10,
            ha='center', va='center', color=LOSS_C, alpha=0.8, zorder=7)

    # ── 连接输出层到 Loss ────────────────────────────────────────
    for ni in range(layers[-1]['nodes']):
        ox, oy = coords[(len(layers) - 1, ni)]
        ax.annotate('', xy=(loss_x - 0.55, loss_y), xytext=(ox + 0.22, oy),
                    arrowprops=dict(arrowstyle='->', color=FWD, lw=1.2, alpha=0.6))

    # ── 层标签 ──────────────────────────────────────────────────
    for li, layer in enumerate(layers):
        ax.text(layer['x'], 1.35, layer['name'],
                fontsize=10.5, ha='center', va='center',
                color=accent, fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.3', facecolor=bg + 'CC',
                          edgecolor=accent + '60', linewidth=1))

    # ── 图例 ────────────────────────────────────────────────────
    leg_x, leg_y = 0.25, 5.6
    ax.annotate('', xy=(leg_x + 0.7, leg_y), xytext=(leg_x, leg_y),
                arrowprops=dict(arrowstyle='->', color=FWD, lw=2.5))
    ax.text(leg_x + 0.8, leg_y, '前向传播（激活值）', fontsize=11,
            va='center', color=FWD, fontweight='bold')

    ax.annotate('', xy=(leg_x + 0.7, leg_y - 0.38), xytext=(leg_x, leg_y - 0.38),
                arrowprops=dict(arrowstyle='->', color=BWD, lw=2.5))
    ax.text(leg_x + 0.8, leg_y - 0.38, '反向传播（梯度）', fontsize=11,
            va='center', color=BWD, fontweight='bold')

    ax.annotate('', xy=(leg_x + 0.7, leg_y - 0.76), xytext=(leg_x, leg_y - 0.76),
                arrowprops=dict(arrowstyle='->', color=LOSS_C, lw=2.5))
    ax.text(leg_x + 0.8, leg_y - 0.76, '损失信号（误差）', fontsize=11,
            va='center', color=LOSS_C, fontweight='bold')

    # ── 梯度公式标注 ────────────────────────────────────────────
    formula_x, formula_y = 5.0, 5.5
    ax.text(formula_x, formula_y,
            '链式法则：dL/dw = dL/dy · dy/dh · dh/dw',
            fontsize=13, ha='center', color=BWD, fontweight='bold', alpha=0.9,
            bbox=dict(boxstyle='round,pad=0.4', facecolor=bg,
                      edgecolor=BWD + '60', linewidth=1.5))

    # ── 气走小周天注释 ───────────────────────────────────────────
    ax.text(5.0, 0.55,
            '气走小周天：蓝色内力前行（前向），橙色气流回溯（反向），循环万次，内力深厚',
            fontsize=12, ha='center', color=text_col, alpha=0.7)

    # ── 标题 ────────────────────────────────────────────────────
    glow_text(ax, 5.0, 5.9, '反向传播：内力如何运转', fontsize=22,
              color=text_col, fontweight='bold')



# ══════════════════════════════════════════════════════════════
# 图9：感知机（第0章）
# ══════════════════════════════════════════════════════════════
def gen_perceptron(f, t):
    ax = f.add_axes([0, 0, 1, 1])
    ax.set_facecolor(t['bg'])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    accent = t['accent']
    text_col = t['text']

    def node(x, y, label, color, r=0.28, fs=12):
        c = plt.Circle((x, y), r, color=color, alpha=0.85, zorder=3)
        cg = plt.Circle((x, y), r + 0.08, color=color, alpha=0.15, zorder=2)
        ax.add_patch(c)
        ax.add_patch(cg)
        ax.text(x, y, label, fontsize=fs, ha='center', va='center',
                color='#111', fontweight='bold', zorder=4)

    def box(x, y, w, h, label, color, sublabel=''):
        rect = FancyBboxPatch((x - w/2, y - h/2), w, h,
                              boxstyle='round,pad=0.12',
                              facecolor=color + '30', edgecolor=color,
                              linewidth=2, zorder=3)
        ax.add_patch(rect)
        ax.text(x, y + (0.12 if sublabel else 0), label, fontsize=13,
                ha='center', va='center', color=text_col, fontweight='bold', zorder=4)
        if sublabel:
            ax.text(x, y - 0.25, sublabel, fontsize=10, ha='center', va='center',
                    color=color, alpha=0.9, zorder=4)

    def arrow(x1, y1, x2, y2, label='', color=None):
        c = color or accent
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle='->', color=c, lw=1.8), zorder=5)
        if label:
            mx, my = (x1 + x2) / 2, (y1 + y2) / 2
            ax.text(mx - 0.15, my, label, fontsize=10, ha='right', va='center',
                    color=c, fontweight='bold')

    # Input nodes
    inputs = [(2.0, 4.5, 'x1'), (2.0, 3.0, 'x2'), (2.0, 1.5, 'x3')]
    weights = ['w1', 'w2', 'w3']
    for (ix, iy, lbl), wlbl in zip(inputs, weights):
        node(ix, iy, lbl, accent)
        arrow(ix + 0.28, iy, 4.7, 3.0, wlbl, accent)

    # Bias
    node(2.0, 5.8, 'bias', '#CE93D8', r=0.25, fs=10)
    arrow(2.0 + 0.25, 5.8, 4.7, 3.2, 'b', '#CE93D8')

    # Weighted sum box
    box(5.5, 3.0, 1.6, 1.0, 'Sum', accent, 'w*x + b')

    # Step function box
    box(7.5, 3.0, 1.6, 1.0, 'Step', '#FFB74D', '激活函数')

    # Output node
    node(9.3, 3.0, '0/1', '#81C784')

    # Arrows between boxes
    arrow(6.3, 3.0, 6.7, 3.0)
    arrow(8.3, 3.0, 9.0, 3.0)

    # Annotations
    ax.text(5.5, 1.8, '加权求和', fontsize=11, ha='center', color=accent, alpha=0.8)
    ax.text(7.5, 1.8, '阈值判断', fontsize=11, ha='center', color='#FFB74D', alpha=0.8)
    ax.text(9.3, 1.8, '输出', fontsize=11, ha='center', color='#81C784', alpha=0.8)

    glow_text(ax, 5.0, 5.6, '感知机：神经网络的雏形', fontsize=22,
              color=text_col, fontweight='bold')
    ax.text(5.0, 5.1, '加权求和 + 激活函数 = 最简单的"神经元"',
            fontsize=13, ha='center', va='center', color=accent, alpha=0.85)



# ══════════════════════════════════════════════════════════════
# 图10：特征工程 vs 深度学习（第1章）
# ══════════════════════════════════════════════════════════════
def gen_feature_vs_dl(f, t):
    ax = f.add_axes([0, 0, 1, 1])
    ax.set_facecolor(t['bg'])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    accent = t['accent']
    text_col = t['text']

    def pipeline_box(x, y, w, h, label, color):
        rect = FancyBboxPatch((x - w/2, y - h/2), w, h,
                              boxstyle='round,pad=0.12',
                              facecolor=color + '30', edgecolor=color,
                              linewidth=2, zorder=3)
        ax.add_patch(rect)
        ax.text(x, y, label, fontsize=11, ha='center', va='center',
                color=text_col, fontweight='bold', zorder=4)

    def pipe_arrow(x1, y1, x2, y2, color):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle='->', color=color, lw=2), zorder=5)

    # Dividing line
    ax.plot([5.0, 5.0], [0.5, 5.5], color='#555', lw=1.5, linestyle='--', alpha=0.5)

    # LEFT side: Traditional ML
    left_color = '#EF9A9A'
    ax.text(2.5, 5.3, '传统机器学习', fontsize=16, ha='center', color=left_color, fontweight='bold')
    left_steps = ['原始输入', '手工特征', '分类器', '输出']
    lys = [4.3, 3.3, 2.3, 1.3]
    for lbl, ly in zip(left_steps, lys):
        pipeline_box(2.5, ly, 2.0, 0.6, lbl, left_color)
    for i in range(len(lys) - 1):
        pipe_arrow(2.5, lys[i] - 0.3, 2.5, lys[i+1] + 0.3, left_color)
    # Annotation
    ax.text(1.0, 3.3, '人工设计', fontsize=12, ha='center', color='#EF5350',
            fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#EF535030', edgecolor='#EF5350'))

    # RIGHT side: Deep Learning
    right_color = accent
    ax.text(7.5, 5.3, '深度学习', fontsize=16, ha='center', color=right_color, fontweight='bold')
    right_steps = ['原始输入', '特征层 L1', '特征层 L2', '特征层 L3', '输出']
    rys = [4.5, 3.7, 2.9, 2.1, 1.3]
    for lbl, ry in zip(right_steps, rys):
        pipeline_box(7.5, ry, 2.0, 0.5, lbl, right_color)
    for i in range(len(rys) - 1):
        pipe_arrow(7.5, rys[i] - 0.25, 7.5, rys[i+1] + 0.25, right_color)
    # Annotation
    ax.text(9.2, 2.9, '自动学习', fontsize=12, ha='center', color='#4FC3F7',
            fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#4FC3F730', edgecolor='#4FC3F7'))

    glow_text(ax, 5.0, 5.75, '特征工程 vs 深度学习', fontsize=22,
              color=text_col, fontweight='bold')



# ══════════════════════════════════════════════════════════════
# 图11：规模定律（第2章）
# ══════════════════════════════════════════════════════════════
def gen_scaling_law(f, t):
    ax = f.add_axes([0.1, 0.12, 0.82, 0.75])
    ax.set_facecolor(t['bg'])
    f.patch.set_facecolor(t['bg'])

    accent = t['accent']
    text_col = t['text']

    x = np.linspace(20, 25, 200)

    # Three curves with different slopes
    y_params = 8.5 - 0.30 * (x - 20)
    y_data   = 8.5 - 0.25 * (x - 20)
    y_compute = 8.5 - 0.22 * (x - 20)

    ax.plot(x, y_params,  color=accent,    lw=3, label='参数量',
            path_effects=[pe.withStroke(linewidth=6, foreground=accent + '40'), pe.Normal()])
    ax.plot(x, y_data,    color='#4FC3F7', lw=3, label='数据量',
            path_effects=[pe.withStroke(linewidth=6, foreground='#4FC3F740'), pe.Normal()])
    ax.plot(x, y_compute, color='#CE93D8', lw=3, label='算力',
            path_effects=[pe.withStroke(linewidth=6, foreground='#CE93D840'), pe.Normal()])

    # Milestones
    milestones = [
        (21.0, 'GPT-2',  accent),
        (22.5, 'GPT-3',  '#4FC3F7'),
        (24.0, 'GPT-4',  '#CE93D8'),
    ]
    for mx, mlbl, mc in milestones:
        my = 8.5 - 0.30 * (mx - 20)
        ax.scatter([mx], [my], color=mc, s=120, zorder=5)
        ax.annotate(mlbl, xy=(mx, my), xytext=(mx + 0.1, my + 0.3),
                    fontsize=11, color=mc, fontweight='bold',
                    arrowprops=dict(arrowstyle='->', color=mc, lw=1.2))

    ax.set_xlabel('计算量 (log FLOPs)', fontsize=13, color=text_col)
    ax.set_ylabel('Loss (越低越强)', fontsize=13, color=text_col)
    ax.tick_params(colors=text_col, labelsize=11)
    for spine in ax.spines.values():
        spine.set_edgecolor('#555')
    ax.set_facecolor(t['bg'])
    ax.grid(True, color='#333', linestyle='--', alpha=0.4)

    legend = ax.legend(fontsize=12, facecolor=t['bg'], edgecolor=accent,
                       labelcolor=text_col, loc='upper right')

    glow_text(ax, 22.5, 8.8, '规模定律：越大越强', fontsize=20,
              color=text_col, fontweight='bold')



# ══════════════════════════════════════════════════════════════
# 图12：蒙特卡洛树搜索（第3章）
# ══════════════════════════════════════════════════════════════
def gen_mcts(f, t):
    ax = f.add_axes([0, 0, 1, 1])
    ax.set_facecolor(t['bg'])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    accent = t['accent']
    text_col = t['text']
    dim_color = '#555577'

    def tree_node(x, y, label, color, visited=True, r=0.22):
        c = plt.Circle((x, y), r, color=color if visited else dim_color,
                        alpha=0.85, zorder=4)
        cg = plt.Circle((x, y), r + 0.08, color=color if visited else dim_color,
                         alpha=0.15, zorder=3)
        ax.add_patch(c)
        ax.add_patch(cg)
        ax.text(x, y, label, fontsize=9, ha='center', va='center',
                color='#111' if visited else '#888', fontweight='bold', zorder=5)

    def tree_arrow(x1, y1, x2, y2):
        ax.annotate('', xy=(x2, y2 + 0.22), xytext=(x1, y1 - 0.22),
                    arrowprops=dict(arrowstyle='->', color='#9988BB', lw=1.5), zorder=3)

    # Root
    tree_node(5.0, 4.8, 'Root', accent)

    # Level 1 children
    l1 = [(2.5, 3.4), (5.0, 3.4), (7.5, 3.4)]
    l1_visit = [True, True, False]
    for (x, y), vis in zip(l1, l1_visit):
        tree_node(x, y, 'N', accent if vis else dim_color, visited=vis)
        tree_arrow(5.0, 4.8, x, y)

    # Level 2 children
    l2 = [
        (1.5, 2.0, True), (3.5, 2.0, True),
        (4.2, 2.0, True), (5.8, 2.0, False),
        (6.8, 2.0, False), (8.2, 2.0, False),
    ]
    parents = [0, 0, 1, 1, 2, 2]
    for (x, y, vis), pi in zip(l2, parents):
        tree_node(x, y, 'N', accent if vis else dim_color, visited=vis, r=0.18)
        px, py = l1[pi]
        tree_arrow(px, py, x, y)

    # Phase labels at top
    phases = [
        (2.0, 5.5, '1. 选择 Select', accent),
        (4.2, 5.5, '2. 扩展 Expand', '#FFB74D'),
        (6.5, 5.5, '3. 模拟 Simulate', '#4FC3F7'),
        (8.5, 5.5, '4. 回传 Backprop', '#CE93D8'),
    ]
    for px, py, plbl, pc in phases:
        ax.text(px, py, plbl, fontsize=11, ha='center', va='center',
                color=pc, fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.3', facecolor=pc + '20', edgecolor=pc))

    # Simulate arrow (dotted, from visited leaf)
    ax.plot([3.5, 3.5], [1.82, 1.0], color='#4FC3F7', lw=1.5,
            linestyle=':', alpha=0.8, zorder=3)
    ax.text(3.5, 0.75, '随机模拟\n结果评估', fontsize=9, ha='center',
            color='#4FC3F7', alpha=0.85)

    glow_text(ax, 5.0, 0.4, 'AlphaGo: 蒙特卡洛树搜索', fontsize=20,
              color=text_col, fontweight='bold')



# ══════════════════════════════════════════════════════════════
# 图13：RLHF 流程（第3章）
# ══════════════════════════════════════════════════════════════
def gen_rlhf_pipeline(f, t):
    ax = f.add_axes([0, 0, 1, 1])
    ax.set_facecolor(t['bg'])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    accent = t['accent']
    text_col = t['text']

    stages = [
        (1.8,  3.2, '① 监督微调 SFT',  '#4FC3F7',
         'LLM + 人工示范数据', '人类专家编写高质量\n回答作为训练样本'),
        (5.0,  3.2, '② 奖励模型 RM',   '#FFB74D',
         '人类偏好排序 → 打分', '对多个回答进行排序\n训练打分函数'),
        (8.2,  3.2, '③ PPO 强化学习', accent,
         'RM 打分 → 更新 LLM', '用奖励信号通过 PPO\n持续优化语言模型'),
    ]

    for sx, sy, title, color, sub1, sub2 in stages:
        rect = FancyBboxPatch((sx - 1.3, sy - 0.8), 2.6, 1.6,
                              boxstyle='round,pad=0.15',
                              facecolor=color + '25', edgecolor=color,
                              linewidth=2.5, zorder=3)
        ax.add_patch(rect)
        ax.text(sx, sy + 0.38, title, fontsize=13, ha='center', va='center',
                color=color, fontweight='bold', zorder=4)
        ax.text(sx, sy - 0.08, sub1, fontsize=10, ha='center', va='center',
                color=text_col, fontweight='bold', zorder=4)
        ax.text(sx, sy - 0.55, sub2, fontsize=9, ha='center', va='center',
                color=text_col, alpha=0.75, linespacing=1.4, zorder=4)

    # Arrows between stages
    for x1, x2, color in [(3.1, 3.7, '#4FC3F7'), (6.3, 6.9, '#FFB74D')]:
        ax.annotate('', xy=(x2, 3.2), xytext=(x1, 3.2),
                    arrowprops=dict(arrowstyle='->', color=color, lw=3), zorder=5)

    # Top description
    ax.text(5.0, 5.2, 'RLHF: 让 AI 学会人类偏好', fontsize=22,
            ha='center', va='center', color=text_col, fontweight='bold',
            path_effects=[pe.withStroke(linewidth=8, foreground=accent + '40'), pe.Normal()])
    ax.text(5.0, 4.65, '三阶段训练：先模仿，再打分，再用分数优化',
            fontsize=13, ha='center', va='center', color=accent, alpha=0.85)

    # Bottom note
    ax.text(5.0, 1.5, '注：PPO = Proximal Policy Optimization (近端策略优化)',
            fontsize=11, ha='center', va='center', color=text_col, alpha=0.6)



# ══════════════════════════════════════════════════════════════
# 图14：DPO vs RLHF（第3章）
# ══════════════════════════════════════════════════════════════
def gen_dpo_vs_rlhf(f, t):
    ax = f.add_axes([0, 0, 1, 1])
    ax.set_facecolor(t['bg'])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    accent = t['accent']
    text_col = t['text']

    def flow_box(x, y, label, color, w=1.6, h=0.6):
        rect = FancyBboxPatch((x - w/2, y - h/2), w, h,
                              boxstyle='round,pad=0.1',
                              facecolor=color + '28', edgecolor=color,
                              linewidth=2, zorder=3)
        ax.add_patch(rect)
        ax.text(x, y, label, fontsize=11, ha='center', va='center',
                color=text_col, fontweight='bold', zorder=4)

    def v_arrow(x, y1, y2, color):
        ax.annotate('', xy=(x, y2), xytext=(x, y1),
                    arrowprops=dict(arrowstyle='->', color=color, lw=2), zorder=5)

    # Dividing line
    ax.plot([5.0, 5.0], [0.8, 5.4], color='#555', lw=1.5, linestyle='--', alpha=0.5)

    # LEFT: RLHF (complex)
    lx = 2.5
    left_color = '#EF9A9A'
    ax.text(lx, 5.2, 'RLHF (复杂)', fontsize=15, ha='center', color=left_color, fontweight='bold')
    left_steps = ['LLM', '奖励模型 RM', '奖励信号', 'PPO 优化', '更新后 LLM']
    lys = [4.4, 3.6, 2.8, 2.0, 1.2]
    for lbl, ly in zip(left_steps, lys):
        flow_box(lx, ly, lbl, left_color)
    for i in range(len(lys) - 1):
        v_arrow(lx, lys[i] - 0.3, lys[i+1] + 0.3, left_color)
    ax.text(lx - 1.5, 3.0, '多步骤\n复杂', fontsize=10, ha='center',
            color='#EF5350', alpha=0.85, linespacing=1.4)

    # RIGHT: DPO (simple)
    rx = 7.5
    right_color = '#81C784'
    ax.text(rx, 5.2, 'DPO (简洁)', fontsize=15, ha='center', color=right_color, fontweight='bold')
    right_steps = ['偏好数据对\n(好答案/坏答案)', '直接优化损失', '更新后 LLM']
    rys = [4.1, 2.8, 1.5]
    for lbl, ry in zip(right_steps, rys):
        flow_box(rx, ry, lbl, right_color, w=2.2, h=0.7)
    for i in range(len(rys) - 1):
        v_arrow(rx, rys[i] - 0.35, rys[i+1] + 0.35, right_color)
    ax.text(rx + 1.6, 2.8, '无需\n奖励模型', fontsize=10, ha='center',
            color='#81C784', alpha=0.85, linespacing=1.4)

    glow_text(ax, 5.0, 5.72, 'DPO: 去掉奖励模型，直接优化', fontsize=20,
              color=text_col, fontweight='bold')



# ══════════════════════════════════════════════════════════════
# 图15：Agent 记忆架构（第4章）
# ══════════════════════════════════════════════════════════════
def gen_agent_memory(f, t):
    ax = f.add_axes([0, 0, 1, 1])
    ax.set_facecolor(t['bg'])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    accent = t['accent']
    text_col = t['text']

    # Agent center
    cx, cy = 5.0, 3.0
    c = plt.Circle((cx, cy), 0.55, color=accent, alpha=0.85, zorder=4)
    cg = plt.Circle((cx, cy), 0.7, color=accent, alpha=0.15, zorder=3)
    ax.add_patch(c)
    ax.add_patch(cg)
    ax.text(cx, cy, 'Agent', fontsize=13, ha='center', va='center',
            color='#111', fontweight='black', zorder=5)

    layers = [
        (5.0, 5.0, '工作记忆 (上下文窗口)',  '#4FC3F7',
         '速度: 极快  |  容量: 小  |  时效: 临时'),
        (5.0, 3.0, '情节记忆 (向量数据库)',   accent,
         '速度: 中等  |  容量: 中  |  方式: 语义检索'),
        (5.0, 1.0, '语义记忆 (外部文档/知识库)', '#CE93D8',
         '速度: 较慢  |  容量: 大  |  时效: 持久'),
    ]

    for lx, ly, label, color, desc in layers:
        is_center = (ly == cy)
        if is_center:
            continue
        rect = FancyBboxPatch((lx - 3.5, ly - 0.45), 7.0, 0.9,
                              boxstyle='round,pad=0.12',
                              facecolor=color + '25', edgecolor=color,
                              linewidth=2, zorder=3)
        ax.add_patch(rect)
        ax.text(lx, ly + 0.12, label, fontsize=13, ha='center', va='center',
                color=color, fontweight='bold', zorder=4)
        ax.text(lx, ly - 0.22, desc, fontsize=10, ha='center', va='center',
                color=text_col, alpha=0.8, zorder=4)

        # Arrow from agent
        dy = ly - cy
        ay1 = cy + 0.55 * np.sign(dy)
        ay2 = ly - 0.45 * np.sign(dy)
        ax.annotate('', xy=(cx, ay2), xytext=(cx, ay1),
                    arrowprops=dict(arrowstyle='<->', color=color, lw=2), zorder=5)

    glow_text(ax, 5.0, 5.72, 'Agent 记忆三层架构', fontsize=22,
              color=text_col, fontweight='bold')
    ax.text(5.0, 5.35, '工作记忆快但易失，语义记忆慢但持久',
            fontsize=13, ha='center', va='center', color=accent, alpha=0.85)



# ══════════════════════════════════════════════════════════════
# 图16：Function Calling 工具调用（第4章）
# ══════════════════════════════════════════════════════════════
def gen_function_calling(f, t):
    ax = f.add_axes([0, 0, 1, 1])
    ax.set_facecolor(t['bg'])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    accent = t['accent']
    text_col = t['text']

    def hbox(x, y, w, h, label, color, sublabel=''):
        rect = FancyBboxPatch((x - w/2, y - h/2), w, h,
                              boxstyle='round,pad=0.12',
                              facecolor=color + '28', edgecolor=color,
                              linewidth=2, zorder=3)
        ax.add_patch(rect)
        ax.text(x, y + (0.1 if sublabel else 0), label, fontsize=12,
                ha='center', va='center', color=text_col, fontweight='bold', zorder=4)
        if sublabel:
            ax.text(x, y - 0.22, sublabel, fontsize=9, ha='center', va='center',
                    color=color, alpha=0.85, zorder=4)

    def h_arrow(x1, y, x2, color=None):
        ax.annotate('', xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle='->', color=color or accent, lw=2), zorder=5)

    # Main flow: left to right
    main_y = 3.5
    hbox(1.0, main_y, 1.4, 0.7, 'User', '#4FC3F7', '用户问题')
    h_arrow(1.7, main_y, 2.1, accent)
    hbox(2.9, main_y, 1.4, 0.7, 'LLM', accent, '决策调用')
    h_arrow(3.6, main_y, 4.0, accent)
    hbox(5.0, main_y, 1.8, 0.7, 'Tool Router', '#FFB74D', '路由分发')
    h_arrow(5.9, main_y, 6.3, accent)
    hbox(7.2, main_y, 1.4, 0.7, 'LLM', accent, '整合结果')
    h_arrow(7.9, main_y, 8.3, accent)
    hbox(9.1, main_y, 1.4, 0.7, 'Answer', '#81C784', '最终回答')

    # Tools below router
    tools = [
        (3.8, 1.8, '天气 API',    '#4FC3F7'),
        (5.2, 1.8, '代码执行',    '#FFB74D'),
        (6.6, 1.8, '网页搜索',    '#CE93D8'),
        (8.0, 1.8, '数据库',      '#EF9A9A'),
    ]
    for tx, ty, tlbl, tc in tools:
        rect = FancyBboxPatch((tx - 0.6, ty - 0.3), 1.2, 0.6,
                              boxstyle='round,pad=0.1',
                              facecolor=tc + '25', edgecolor=tc,
                              linewidth=1.5, zorder=3)
        ax.add_patch(rect)
        ax.text(tx, ty, tlbl, fontsize=10, ha='center', va='center',
                color=tc, fontweight='bold', zorder=4)
        ax.annotate('', xy=(tx, ty + 0.3), xytext=(5.0, main_y - 0.35),
                    arrowprops=dict(arrowstyle='<->', color=tc, lw=1.2,
                                   connectionstyle='arc3,rad=0.2'), zorder=2)

    glow_text(ax, 5.0, 5.4, 'Agent 工具调用：Function Calling', fontsize=21,
              color=text_col, fontweight='bold')
    ax.text(5.0, 4.95, 'LLM 决定何时调用哪个工具，整合结果后回答用户',
            fontsize=13, ha='center', va='center', color=accent, alpha=0.85)



# ══════════════════════════════════════════════════════════════
# 图17：AI 编程辅助工作流（第5章）
# ══════════════════════════════════════════════════════════════
def gen_copilot_workflow(f, t):
    ax = f.add_axes([0, 0, 1, 1])
    ax.set_facecolor(t['bg'])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    accent = t['accent']
    text_col = t['text']

    # Circular loop nodes
    import math
    cx, cy, R = 5.0, 2.9, 2.1
    steps = [
        ('Developer\n开发者',   0,    '#4FC3F7'),
        ('写代码\nWrite Code',  60,   accent),
        ('AI 建议\nSuggest',    120,  '#FFB74D'),
        ('接受/拒绝\nAccept',   180,  '#CE93D8'),
        ('运行测试\nRun Tests', 240,  '#EF9A9A'),
        ('测试结果\nFeedback',  300,  '#81C784'),
    ]

    node_positions = []
    for label, angle_deg, color in steps:
        angle = math.radians(angle_deg)
        nx_ = cx + R * math.cos(angle)
        ny_ = cy + R * math.sin(angle)
        node_positions.append((nx_, ny_, color))

        c = plt.Circle((nx_, ny_), 0.45, color=color, alpha=0.80, zorder=4)
        cg = plt.Circle((nx_, ny_), 0.58, color=color, alpha=0.15, zorder=3)
        ax.add_patch(c)
        ax.add_patch(cg)
        ax.text(nx_, ny_, label, fontsize=9, ha='center', va='center',
                color='#111', fontweight='bold', zorder=5, linespacing=1.3)

    # Arrows between consecutive nodes
    for i in range(len(node_positions)):
        x1, y1, c1 = node_positions[i]
        x2, y2, c2 = node_positions[(i + 1) % len(node_positions)]
        dx, dy_ = x2 - x1, y2 - y1
        dist = math.hypot(dx, dy_)
        ox1 = x1 + 0.45 * dx / dist
        oy1 = y1 + 0.45 * dy_ / dist
        ox2 = x2 - 0.45 * dx / dist
        oy2 = y2 - 0.45 * dy_ / dist
        ax.annotate('', xy=(ox2, oy2), xytext=(ox1, oy1),
                    arrowprops=dict(arrowstyle='->', color=c1, lw=1.8,
                                   connectionstyle='arc3,rad=0.15'), zorder=3)

    # Tool labels
    tools_lbl = 'GitHub Copilot  |  Cursor  |  OpenCode'
    ax.text(5.0, 0.45, tools_lbl, fontsize=12, ha='center', va='center',
            color=accent, fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.4', facecolor=accent + '20', edgecolor=accent))

    glow_text(ax, 5.0, 5.55, 'AI 编程辅助工作流', fontsize=22,
              color=text_col, fontweight='bold')
    ax.text(5.0, 5.1, '从编写到建议到测试，AI 参与整个循环',
            fontsize=13, ha='center', va='center', color=accent, alpha=0.85)



# ══════════════════════════════════════════════════════════════
# 图18：RAG 检索增强生成（第5章）
# ══════════════════════════════════════════════════════════════
def gen_rag_pipeline(f, t):
    ax = f.add_axes([0, 0, 1, 1])
    ax.set_facecolor(t['bg'])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    accent = t['accent']
    text_col = t['text']

    def step_box(x, y, label, color, w=1.5, h=0.65):
        rect = FancyBboxPatch((x - w/2, y - h/2), w, h,
                              boxstyle='round,pad=0.1',
                              facecolor=color + '28', edgecolor=color,
                              linewidth=2, zorder=3)
        ax.add_patch(rect)
        ax.text(x, y, label, fontsize=11, ha='center', va='center',
                color=text_col, fontweight='bold', zorder=4)

    def h_arrow(x1, y, x2, color, style='-'):
        ax.annotate('', xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle='->', color=color, lw=1.8,
                                   linestyle=style), zorder=5)

    # TOP ROW: Indexing
    top_y = 4.2
    idx_steps = ['文档', 'Chunking\n分块', 'Embedding\n向量化', '向量数据库']
    idx_x = [1.2, 3.0, 5.0, 7.2]
    idx_color = '#4FC3F7'
    ax.text(0.3, top_y, '索引\n阶段', fontsize=10, ha='center', va='center',
            color=idx_color, fontweight='bold', alpha=0.8)
    for lbl, ix in zip(idx_steps, idx_x):
        step_box(ix, top_y, lbl, idx_color)
    for i in range(len(idx_x) - 1):
        h_arrow(idx_x[i] + 0.75, top_y, idx_x[i+1] - 0.75, idx_color)

    # BOTTOM ROW: Retrieval
    bot_y = 2.0
    ret_steps = ['用户问题', 'Embedding', '向量检索', 'Top-K\n文本块', 'LLM+\n上下文', '答案']
    ret_x = [1.0, 2.5, 4.0, 5.5, 7.2, 9.0]
    ret_color = accent
    ax.text(0.3, bot_y, '检索\n阶段', fontsize=10, ha='center', va='center',
            color=ret_color, fontweight='bold', alpha=0.8)
    for lbl, rx in zip(ret_steps, ret_x):
        step_box(rx, bot_y, lbl, ret_color)
    for i in range(len(ret_x) - 1):
        h_arrow(ret_x[i] + 0.75, bot_y, ret_x[i+1] - 0.75, ret_color)

    # Dotted connection: vector store → retrieval
    ax.plot([7.2, 7.2], [top_y - 0.33, bot_y + 0.33], color='#FFB74D',
            lw=1.5, linestyle=':', alpha=0.9, zorder=3)
    ax.text(7.7, 3.1, '存储', fontsize=9, color='#FFB74D', ha='center')

    glow_text(ax, 5.0, 5.5, 'RAG: 知识检索增强生成', fontsize=22,
              color=text_col, fontweight='bold')
    ax.text(5.0, 5.1, '先建索引，再检索相关片段，最后结合上下文生成答案',
            fontsize=13, ha='center', va='center', color=accent, alpha=0.85)

    # Phase labels
    ax.text(5.0, 1.1, '检索阶段：运行时实时查询', fontsize=11, ha='center',
            color=accent, alpha=0.7)
    ax.text(5.0, 5.1 - 0.55, '索引阶段：离线预处理', fontsize=11, ha='center',
            color=idx_color, alpha=0.7)



# ══════════════════════════════════════════════════════════════
# 图19：AI 风险地图（第5章）
# ══════════════════════════════════════════════════════════════
def gen_ai_risks(f, t):
    ax = f.add_axes([0.1, 0.12, 0.82, 0.75])
    ax.set_facecolor(t['bg'])
    f.patch.set_facecolor(t['bg'])

    accent = t['accent']
    text_col = t['text']

    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')

    # Quadrant lines
    ax.axvline(5, color='#444', lw=1, linestyle='--', alpha=0.5)
    ax.axhline(5, color='#444', lw=1, linestyle='--', alpha=0.5)

    # Axis labels
    ax.text(5.0, -0.8, '发生概率', fontsize=13, ha='center', color=text_col, fontweight='bold')
    ax.text(0.0, -1.4, '低', fontsize=11, ha='center', color=text_col, alpha=0.7)
    ax.text(10.0, -1.4, '高', fontsize=11, ha='center', color=text_col, alpha=0.7)
    ax.text(-1.0, 5.0, '影响程度', fontsize=13, ha='center', va='center',
            color=text_col, fontweight='bold', rotation=90)
    ax.text(-1.5, 0.0, '低', fontsize=11, ha='center', color=text_col, alpha=0.7)
    ax.text(-1.5, 10.0, '高', fontsize=11, ha='center', color=text_col, alpha=0.7)

    risks = [
        ('幻觉/错误',   8.0, 5.5, 500,  '#FFB74D'),
        ('隐私泄露',    6.0, 8.0, 600,  '#EF9A9A'),
        ('偏见歧视',    5.5, 5.0, 450,  '#FFB74D'),
        ('超级对齐失败', 2.0, 9.5, 1200, '#EF5350'),
        ('失业替代',    7.5, 8.5, 700,  '#EF5350'),
    ]

    for label, rx, ry, size, color in risks:
        ax.scatter([rx], [ry], s=size, color=color, alpha=0.45, zorder=3)
        ax.scatter([rx], [ry], s=size * 0.15, color=color, alpha=0.9, zorder=4)
        ax.text(rx, ry + 0.5 + size / 4000, label, fontsize=11, ha='center',
                va='bottom', color=color, fontweight='bold', zorder=5)

    # Quadrant annotations
    for qx, qy, qlbl in [(2.5, 2.5, '低风险'), (7.5, 2.5, '需监控'),
                          (2.5, 7.5, '低概率\n高影响'), (7.5, 7.5, '高度关注')]:
        ax.text(qx, qy, qlbl, fontsize=10, ha='center', va='center',
                color='#777', alpha=0.6, linespacing=1.4)

    glow_text(ax, 5.0, 10.8, 'AI 风险地图', fontsize=22,
              color=text_col, fontweight='bold')



# ══════════════════════════════════════════════════════════════
# 图20：深度学习发展时间线（第1章）
# ══════════════════════════════════════════════════════════════
def gen_dl_timeline(f, t):
    ax = f.add_axes([0.04, 0.1, 0.92, 0.8])
    ax.set_facecolor(t['bg'])
    ax.set_xlim(1984, 2024)
    ax.set_ylim(-1.2, 1.8)
    ax.axis('off')

    accent = t['accent']
    text_col = t['text']

    events = [
        (1986, '反向传播\nBackprop',      False),
        (1998, 'LeNet\n卷积网络',          False),
        (2006, '深度信念网络\nDeep Belief', False),
        (2012, 'AlexNet\nImageNet',        True),
        (2014, 'GAN\n生成对抗',            False),
        (2017, 'Transformer',              True),
        (2020, 'GPT-3',                    True),
        (2022, 'ChatGPT',                  True),
    ]

    ax.axhline(0, color=accent, lw=2, alpha=0.5, zorder=1)
    ax.annotate('', xy=(2024, 0), xytext=(1984, 0),
                arrowprops=dict(arrowstyle='->', color=accent, lw=2), zorder=2)

    for i, (year, label, highlight) in enumerate(events):
        ypos = 0.7 if i % 2 == 0 else -0.7
        color = '#FFB74D' if highlight else accent
        r = 0.10 if highlight else 0.07
        circle = plt.Circle((year, 0), r, color=color, zorder=4)
        ax.add_patch(circle)
        if highlight:
            glow = plt.Circle((year, 0), r + 0.05, color=color, alpha=0.2, zorder=3)
            ax.add_patch(glow)
        ax.plot([year, year], [0, ypos * 0.7], color=color, lw=1.2, alpha=0.6, zorder=2)
        ax.text(year, ypos * 0.82, label, fontsize=9.5 if highlight else 8.5,
                ha='center', va='center', color=color, fontweight='bold',
                linespacing=1.4, zorder=5)
        ax.text(year, -0.15 if ypos > 0 else 0.13, str(year),
                fontsize=8, ha='center', va='center', color=accent, alpha=0.7)

    glow_text(ax, 2004, 1.55, '深度学习发展时间线  1986 — 2022',
              fontsize=20, color=text_col, fontweight='bold')



# ══════════════════════════════════════════════════════════════
# 图21：大语言模型发展时间线（第2章）
# ══════════════════════════════════════════════════════════════
def gen_llm_timeline(f, t):
    ax = f.add_axes([0.04, 0.1, 0.92, 0.8])
    ax.set_facecolor(t['bg'])
    ax.set_xlim(2016, 2025)
    ax.set_ylim(-1.2, 1.8)
    ax.axis('off')

    accent = t['accent']
    text_col = t['text']

    events = [
        (2017, 'Transformer\n"Attention Is All You Need"', False),
        (2018, 'BERT / GPT-1',                             False),
        (2019, 'GPT-2',                                    False),
        (2020, 'GPT-3\n1750亿参数',                        True),
        (2022, 'ChatGPT\n全民 AI',                         True),
        (2023, 'GPT-4 / Claude\n/ Llama',                  True),
        (2024, '百模大战\n开源竞争',                        False),
    ]

    ax.axhline(0, color=accent, lw=2, alpha=0.5, zorder=1)
    ax.annotate('', xy=(2025, 0), xytext=(2016, 0),
                arrowprops=dict(arrowstyle='->', color=accent, lw=2), zorder=2)

    for i, (year, label, highlight) in enumerate(events):
        ypos = 0.7 if i % 2 == 0 else -0.7
        color = '#FFB74D' if highlight else accent
        r = 0.09 if highlight else 0.06
        circle = plt.Circle((year, 0), r, color=color, zorder=4)
        ax.add_patch(circle)
        if highlight:
            glow = plt.Circle((year, 0), r + 0.04, color=color, alpha=0.2, zorder=3)
            ax.add_patch(glow)
        ax.plot([year, year], [0, ypos * 0.7], color=color, lw=1.2, alpha=0.6, zorder=2)
        ax.text(year, ypos * 0.82, label, fontsize=9.5 if highlight else 8.5,
                ha='center', va='center', color=color, fontweight='bold',
                linespacing=1.4, zorder=5)
        ax.text(year, -0.15 if ypos > 0 else 0.13, str(year),
                fontsize=8, ha='center', va='center', color=accent, alpha=0.7)

    glow_text(ax, 2020.5, 1.55, '大语言模型发展时间线  2017 — 2024',
              fontsize=20, color=text_col, fontweight='bold')



# ══════════════════════════════════════════════════════════════
# 图22：Agent 工具链发展时间线（第4章）
# ══════════════════════════════════════════════════════════════
def gen_agent_timeline(f, t):
    ax = f.add_axes([0.04, 0.1, 0.92, 0.8])
    ax.set_facecolor(t['bg'])
    ax.set_xlim(2021.5, 2024.8)
    ax.set_ylim(-1.2, 1.8)
    ax.axis('off')

    accent = t['accent']
    text_col = t['text']

    events = [
        (2022.2, 'ReAct 论文\n推理+行动',           False),
        (2023.1, 'AutoGPT 爆红\n自主 Agent',         True),
        (2023.4, 'LangChain\n/ CrewAI',              False),
        (2023.7, 'Claude\n工具调用',                  False),
        (2024.1, 'OpenAI\nAgents SDK',               True),
        (2024.5, 'OpenCode\n/ Devin',                True),
    ]

    ax.axhline(0, color=accent, lw=2, alpha=0.5, zorder=1)
    ax.annotate('', xy=(2024.8, 0), xytext=(2021.5, 0),
                arrowprops=dict(arrowstyle='->', color=accent, lw=2), zorder=2)

    for i, (year, label, highlight) in enumerate(events):
        ypos = 0.7 if i % 2 == 0 else -0.7
        color = '#FFB74D' if highlight else accent
        r = 0.04 if highlight else 0.028
        circle = plt.Circle((year, 0), r, color=color, zorder=4)
        ax.add_patch(circle)
        if highlight:
            glow = plt.Circle((year, 0), r + 0.02, color=color, alpha=0.2, zorder=3)
            ax.add_patch(glow)
        ax.plot([year, year], [0, ypos * 0.7], color=color, lw=1.2, alpha=0.6, zorder=2)
        ax.text(year, ypos * 0.82, label, fontsize=9.5 if highlight else 8.5,
                ha='center', va='center', color=color, fontweight='bold',
                linespacing=1.4, zorder=5)
        yr_str = str(int(year)) if year == int(year) else f'{year:.1f}'
        ax.text(year, -0.15 if ypos > 0 else 0.13, yr_str,
                fontsize=8, ha='center', va='center', color=accent, alpha=0.7)

    glow_text(ax, 2023.2, 1.55, 'Agent 工具链发展时间线  2022 — 2024',
              fontsize=20, color=text_col, fontweight='bold')




SLIDE_MAP: dict[str, tuple[int, object]] = {
    'p-timeline':            (0, gen_timeline),
    'p-concept-nn':          (0, gen_perceptron),
    'c1-concept-feature':    (1, gen_feature_vs_dl),
    'c1-concept-backprop':   (1, gen_backprop),
    'c1-concept-cnn':        (1, gen_neural_network),
    'c1-timeline':           (1, gen_dl_timeline),
    'c2-concept-attention':  (2, gen_attention_heatmap),
    'c2-concept-transformer':(2, gen_transformer),
    'c2-concept-scaling':    (2, gen_scaling_law),
    'c2-timeline':           (2, gen_llm_timeline),
    'c3-concept-rl':         (3, gen_rl_loop),
    'c3-concept-alphago':    (3, gen_mcts),
    'c3-concept-rlhf':       (3, gen_rlhf_pipeline),
    'c3-concept-dpo':        (3, gen_dpo_vs_rlhf),
    'c4-timeline':           (4, gen_agent_timeline),
    'c4-concept-react':      (4, gen_agent_loop),
    'c4-concept-memory':     (4, gen_agent_memory),
    'c4-concept-tools':      (4, gen_function_calling),
    'c5-concept-multiagent': (5, gen_multi_agent),
    'c5-concept-coding':     (5, gen_copilot_workflow),
    'c5-concept-knowledge':  (5, gen_rag_pipeline),
    'c5-concept-risks':      (5, gen_ai_risks),
}


def write_manifest(mapping: dict):
    ts_lines = [
        '// Auto-generated by scripts/gen_diagrams.py — do not edit manually',
        '// Run: python scripts/gen_diagrams.py to regenerate',
        '',
        'export const DIAGRAM_MAP: Record<string, string> = {',
    ]
    for slide_id, path in sorted(mapping.items()):
        ts_lines.append(f"  '{slide_id}': '{path}',")
    ts_lines.append('}')
    ts_lines.append('')

    out_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'generated', 'diagramMap.ts')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w') as fh:
        fh.write('\n'.join(ts_lines))
    print(f'📄 Manifest written: {out_path}')


def main():
    os.makedirs(OUT, exist_ok=True)
    print('🎨 生成架构图中...\n')

    generated: dict = {}
    for slide_id, (ch, gen_fn) in SLIDE_MAP.items():
        f, t = fig(ch)
        gen_fn(f, t)
        filename = f'{slide_id}.png'
        save(f, filename)
        generated[slide_id] = f'/diagrams/{filename}'

    write_manifest(generated)
    print('\n✨ 全部完成！')


if __name__ == '__main__':
    main()
