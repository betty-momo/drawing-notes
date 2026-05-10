# 绘画笔记

> 从零开始的二次元绘画学习之路

<style>
.hero-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.1em;
    margin: 1.5em 0 2em;
    padding: 0;
    list-style: none;
}
.hero-card {
    border: 1px solid rgba(99,102,241,0.12);
    border-radius: 14px;
    padding: 1.5em 1.3em 1.2em;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(99,102,241,0.03), rgba(167,139,250,0.03));
    text-decoration: none;
    display: block;
    color: inherit;
}
.hero-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(99,102,241,0.12);
    border-color: rgba(167,139,250,0.35);
    text-decoration: none;
    color: inherit;
}
.hero-card::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #6366f1, #a78bfa);
    opacity: 0;
    transition: opacity 0.25s ease;
}
.hero-card:hover::before { opacity: 1; }
.hero-card .card-icon {
    font-size: 2em;
    margin-bottom: 0.4em;
    display: block;
    width: 48px; height: 48px;
    line-height: 48px;
    text-align: center;
    border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #a78bfa);
    color: #fff;
    font-weight: 700;
}
.hero-card .card-title {
    font-size: 1.15em;
    font-weight: 700;
    margin-bottom: 0.3em;
    color: var(--md-primary-fg-color);
}
.hero-card .card-desc {
    font-size: 0.88em;
    color: rgba(0,0,0,0.5);
    line-height: 1.5;
    margin-bottom: 0.5em;
}
.hero-card .card-link {
    font-size: 0.85em;
    font-weight: 600;
    color: var(--md-accent-fg-color);
}
[data-md-color-scheme="slate"] .hero-card {
    border-color: rgba(129,140,248,0.15);
    background: linear-gradient(135deg, rgba(129,140,248,0.05), rgba(196,181,253,0.03));
}
[data-md-color-scheme="slate"] .hero-card:hover {
    box-shadow: 0 12px 30px rgba(0,0,0,0.25);
    border-color: rgba(196,181,253,0.3);
}
[data-md-color-scheme="slate"] .hero-card .card-desc {
    color: rgba(255,255,255,0.45);
}
.section-title {
    font-size: 1.5em;
    font-weight: 700;
    margin: 2em 0 0.8em;
    padding-left: 0.55em;
    border-left: 4px solid #a78bfa;
    background: linear-gradient(90deg, rgba(167,139,250,0.06), transparent);
    border-radius: 0 8px 8px 0;
    padding-top: 0.25em;
    padding-bottom: 0.25em;
}
.tip-box {
    border-radius: 12px;
    padding: 1.2em 1.5em;
    margin: 1em 0;
    display: flex;
    gap: 1em;
    align-items: flex-start;
}
.tip-box .tip-icon {
    font-size: 1.5em;
    flex-shrink: 0;
    margin-top: 0.05em;
}
.tip-box.tip {
    background: linear-gradient(135deg, rgba(52,211,153,0.08), rgba(52,211,153,0.03));
    border: 1px solid rgba(52,211,153,0.2);
}
.tip-box.info {
    background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.03));
    border: 1px solid rgba(99,102,241,0.15);
}
.course-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
    margin: 0.8em 0;
}
.course-tag {
    display: inline-block;
    padding: 0.35em 0.9em;
    border-radius: 20px;
    font-size: 0.88em;
    font-weight: 500;
    background: rgba(99,102,241,0.07);
    color: var(--md-primary-fg-color);
    border: 1px solid rgba(99,102,241,0.12);
    transition: all 0.15s ease;
}
.course-tag:hover {
    background: rgba(99,102,241,0.12);
    border-color: rgba(99,102,241,0.25);
}
.flow-steps {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3em;
    align-items: center;
    margin: 0.6em 0 1em;
    font-size: 0.92em;
}
.flow-step {
    padding: 0.3em 0.7em;
    background: rgba(99,102,241,0.07);
    border-radius: 6px;
    font-weight: 500;
}
.flow-arrow {
    color: var(--md-accent-fg-color);
    font-weight: 700;
}
</style>

<div class="section-title">基础知识</div>

<div class="hero-cards">
    <a class="hero-card" href="人体知识.md">
        <span class="card-icon">人</span>
        <div class="card-title">人体知识</div>
        <div class="card-desc">五官比例 · 头肩颈 · 腰腹 · 腿部 · 手臂</div>
        <span class="card-link">查看详情 →</span>
    </a>
    <a class="hero-card" href="场景知识.md">
        <span class="card-icon">场</span>
        <div class="card-title">场景知识</div>
        <div class="card-desc">一点透视 · 两点透视 · 三点透视 · 结构概括</div>
        <span class="card-link">查看详情 →</span>
    </a>
    <a class="hero-card" href="色彩知识.md">
        <span class="card-icon">色</span>
        <div class="card-title">色彩知识</div>
        <div class="card-desc">正片叠底 · 滤色 · 叠加 · 图层混合</div>
        <span class="card-link">查看详情 →</span>
    </a>
</div>

<div class="section-title">绘画流程</div>

<div class="hero-cards">
    <a class="hero-card" href="流程/起草.md">
        <span class="card-icon">起</span>
        <div class="card-title">起草</div>
        <div class="card-desc">人体动态 · 体块概括 · 透视线</div>
        <span class="card-link">开始学习 →</span>
    </a>
    <a class="hero-card" href="流程/勾线.md">
        <span class="card-icon">线</span>
        <div class="card-title">勾线</div>
        <div class="card-desc">粗细变化 · 闭塞 · 断线 · 蒙版</div>
        <span class="card-link">查看流程 →</span>
    </a>
    <a class="hero-card" href="流程/二分.md">
        <span class="card-icon">明</span>
        <div class="card-title">二分</div>
        <div class="card-desc">光源判断 · 阴影细化 · 叠加染色</div>
        <span class="card-link">查看流程 →</span>
    </a>
    <a class="hero-card" href="流程/高光.md">
        <span class="card-icon">亮</span>
        <div class="card-title">高光与塑造</div>
        <div class="card-desc">高光 · 反光 · 塑造 · 光源衰减</div>
        <span class="card-link">查看流程 →</span>
    </a>
</div>

<div class="section-title">专题深入</div>

<div class="hero-cards">
    <a class="hero-card" href="专题/眼睛上色.md">
        <span class="card-icon">眼</span>
        <div class="card-title">眼睛上色</div>
        <div class="card-desc">瞳孔 · 虹膜 · 高光 · 反光 · 睫毛</div>
        <span class="card-link">阅读 →</span>
    </a>
    <a class="hero-card" href="专题/头发塑造.md">
        <span class="card-icon">发</span>
        <div class="card-title">头发塑造</div>
        <div class="card-desc">二分细化 · 灰面 · 高光 · 反光 · 线稿染色</div>
        <span class="card-link">阅读 →</span>
    </a>
    <a class="hero-card" href="专题/皮肤塑造.md">
        <span class="card-icon">肤</span>
        <div class="card-title">皮肤塑造</div>
        <div class="card-desc">腮红 · 阴影 · 暗面 · 高光 · 面部细节</div>
        <span class="card-link">阅读 →</span>
    </a>
    <a class="hero-card" href="专题/衣褶.md">
        <span class="card-icon">褶</span>
        <div class="card-title">衣褶刻画</div>
        <div class="card-desc">取舍思路 · 阴影刻画 · 简化完成</div>
        <span class="card-link">阅读 →</span>
    </a>
</div>

<div class="section-title">课程资源</div>

### 免费课程

| 课程 | 方向 |
|:------|:------|
| v大预科 | 综合基础 |
| kana匠人绘粒子课堂 | 日系胸像 |
| 咸鱼中下游公益色彩课 | 色彩入门 |
| 散修炼体 | 零散补充 |

### 付费课程

<div class="course-tags">
    <span class="course-tag">k大三件套</span>
    <span class="course-tag">han0v0</span>
    <span class="course-tag">元大</span>
    <span class="course-tag">山药</span>
    <span class="course-tag">毛厂</span>
    <span class="course-tag">翔腿颓</span>
    <span class="course-tag">Coloso</span>
    <span class="course-tag">fuwari</span>
    <span class="course-tag">芜菁f</span>
    <span class="course-tag">曼奇立德</span>
</div>

<div class="section-title">画前准备</div>

<div class="tip-box tip">
    <span class="tip-icon">🎨</span>
    <div>
        <strong>找参考</strong><br>
        花瓣网 · Pinterest · 小红书 · 微博
    </div>
</div>

<div class="tip-box info">
    <span class="tip-icon">💡</span>
    <div>
        <strong>小技巧</strong><br>
        创建一个<strong>黑色饱和度图层</strong>位于最上部，便于观察画面整体黑白灰关系。
    </div>
</div>
