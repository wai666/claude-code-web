# 🎬 动画系统完整指南

## 动画分类

### 1. 背景动画（持续运行）

| 动画名称 | 文件位置 | 效果 | 性能影响 |
|---------|---------|------|---------|
| `matrix-rain` | global-enhanced.css | 数字雨下落 | 低 |
| `scanline` | global-enhanced.css | CRT 扫描线 | 低 |
| `grid-move` | global-enhanced.css | 3D 网格移动 | 中 |
| `data-flow` | Terminal-enhanced.css | 数据流动 | 低 |

### 2. 启动动画（一次性）

| 动画名称 | 文件位置 | 触发时机 | 持续时间 |
|---------|---------|---------|---------|
| `boot-fadeout` | IDE-enhanced.css | 页面加载 | 3s |
| `terminal-boot` | Terminal-enhanced.css | 终端初始化 | 1s |
| `ide-boot` | IDE-enhanced.css | IDE 启动 | 2s |
| `progress-fill` | IDE-enhanced.css | 进度条 | 2.5s |

### 3. 交互动画（用户触发）

| 动画名称 | 文件位置 | 触发条件 | 效果 |
|---------|---------|---------|------|
| `message-appear` | Terminal-enhanced.css | 消息发送 | 滑入淡入 |
| `tool-appear` | Terminal-enhanced.css | 工具调用 | 弹出 |
| `palette-appear` | Terminal-enhanced.css | 命令面板 | 滑入 |
| `notification-slide` | IDE-enhanced.css | 通知 | 右侧滑入 |

### 4. 循环动画（持续效果）

| 动画名称 | 文件位置 | 效果 | 周期 |
|---------|---------|------|------|
| `hologram-flicker` | global-enhanced.css | 全息闪烁 | 3s |
| `neon-flicker` | global-enhanced.css | 霓虹闪烁 | 5s |
| `pulse-glow` | global-enhanced.css | 脉冲发光 | 2s |
| `gradient-rotate` | Terminal-enhanced.css | 渐变旋转 | 3s |
| `glitch` | global-enhanced.css | 故障效果 | 随机 |

---

## 动画详解

### 1. Matrix 数字雨

**文件**: `global-enhanced.css`

```css
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background:
    linear-gradient(90deg, transparent 0%, rgba(0, 255, 65, 0.03) 50%, transparent 100%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 255, 65, 0.03) 2px,
      rgba(0, 255, 65, 0.03) 4px
    );
  pointer-events: none;
  z-index: 1;
  animation: matrix-rain 20s linear infinite;
}

@keyframes matrix-rain {
  0% { transform: translateY(0); }
  100% { transform: translateY(100vh); }
}
```

**调整速度**:
- 更快: `10s`
- 更慢: `30s`
- 禁用: `display: none;`

---

### 2. CRT 扫描线

**文件**: `global-enhanced.css`

```css
body::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 9999;
  animation: scanline 8s linear infinite;
}

@keyframes scanline {
  0% { transform: translateY(0); }
  100% { transform: translateY(100%); }
}
```

**调整密度**:
- 更密: `1px` → `0.5px`
- 更疏: `2px` → `3px`

---

### 3. 全息闪烁

**文件**: `global-enhanced.css`

```css
@keyframes hologram-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
  51% { opacity: 1; }
  52% { opacity: 0.9; }
  53% { opacity: 1; }
}
```

**应用到元素**:
```css
.terminal-container {
  animation: hologram-flicker 3s infinite;
}
```

---

### 4. 故障效果

**文件**: `global-enhanced.css`

```css
@keyframes glitch {
  0% {
    transform: translate(0);
    filter: hue-rotate(0deg);
  }
  20% {
    transform: translate(-2px, 2px);
    filter: hue-rotate(90deg);
  }
  40% {
    transform: translate(-2px, -2px);
    filter: hue-rotate(180deg);
  }
  60% {
    transform: translate(2px, 2px);
    filter: hue-rotate(270deg);
  }
  80% {
    transform: translate(2px, -2px);
    filter: hue-rotate(360deg);
  }
  100% {
    transform: translate(0);
    filter: hue-rotate(0deg);
  }
}
```

**应用**:
```css
.boot-logo {
  animation: logo-glitch 0.5s infinite;
}
```

---

### 5. 霓虹发光

**文件**: `global-enhanced.css`

```css
@keyframes neon-flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    text-shadow: var(--glow-green);
    opacity: 1;
  }
  20%, 24%, 55% {
    text-shadow: none;
    opacity: 0.4;
  }
}
```

**发光变量**:
```css
--glow-green: 0 0 5px #00ff41, 0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 40px #00ff41;
--glow-blue: 0 0 5px #00d9ff, 0 0 10px #00d9ff, 0 0 20px #00d9ff;
--glow-purple: 0 0 5px #b026ff, 0 0 10px #b026ff, 0 0 20px #b026ff;
```

---

### 6. 粒子系统

**文件**: `CyberBackground.tsx`

```typescript
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;

  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 10;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = -Math.random() * 2 - 1;
    this.size = Math.random() * 2 + 1;
    this.color = Math.random() > 0.5 ? '#00ff41' : '#00d9ff';
    this.life = 0;
    this.maxLife = Math.random() * 100 + 100;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    return this.life < this.maxLife && this.y > -10;
  }

  draw() {
    const alpha = 1 - this.life / this.maxLife;
    ctx.fillStyle = this.color;
    ctx.globalAlpha = alpha * 0.8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // 发光效果
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
```

**调整参数**:
```typescript
// 粒子数量
for (let i = 0; i < 50; i++) {  // 默认 50
  particles.push(new Particle());
}

// 粒子速度
this.vy = -Math.random() * 2 - 1;  // 默认 -1 到 -3

// 粒子大小
this.size = Math.random() * 2 + 1;  // 默认 1-3
```

---

## 性能优化

### 1. 禁用特定动画

```css
/* 禁用数字雨 */
body::before {
  display: none !important;
}

/* 禁用扫描线 */
body::after {
  display: none !important;
}

/* 禁用全息闪烁 */
.terminal-container {
  animation: none !important;
}
```

### 2. 降低动画帧率

```css
/* 降低动画速度 = 降低 CPU 使用 */
@keyframes matrix-rain {
  0% { transform: translateY(0); }
  100% { transform: translateY(100vh); }
}

/* 从 20s 改为 40s */
body::before {
  animation: matrix-rain 40s linear infinite;
}
```

### 3. 减少粒子数量

```typescript
// CyberBackground.tsx
// 从 50 减少到 20
for (let i = 0; i < 20; i++) {
  particles.push(new Particle());
}

// 从 30 减少到 10
for (let i = 0; i < 10; i++) {
  matrixRains.push(new MatrixRain());
}
```

### 4. 使用 CSS will-change

```css
.terminal-container {
  will-change: transform, opacity;
}

.message {
  will-change: transform;
}
```

---

## 自定义动画

### 1. 创建新动画

```css
/* 定义关键帧 */
@keyframes custom-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

/* 应用到元素 */
.my-element {
  animation: custom-pulse 2s ease-in-out infinite;
}
```

### 2. 组合多个动画

```css
.complex-animation {
  animation:
    pulse-glow 2s infinite,
    rotate-border 3s linear infinite,
    hologram-flicker 4s infinite;
}
```

### 3. 动画延迟

```css
.message:nth-child(1) { animation-delay: 0s; }
.message:nth-child(2) { animation-delay: 0.1s; }
.message:nth-child(3) { animation-delay: 0.2s; }
```

---

## 调试技巧

### 1. 查看动画状态

```javascript
// 浏览器控制台
const element = document.querySelector('.terminal-container');
const animations = element.getAnimations();
console.log(animations);
```

### 2. 暂停所有动画

```css
* {
  animation-play-state: paused !important;
}
```

### 3. 慢速播放

```css
* {
  animation-duration: 10s !important;
}
```

---

## 常见问题

### Q: 动画卡顿怎么办？

A: 
1. 减少粒子数量
2. 禁用部分背景动画
3. 降低动画帧率
4. 使用 `will-change` 优化

### Q: 如何完全禁用动画？

A:
```css
* {
  animation: none !important;
  transition: none !important;
}
```

### Q: 如何只保留核心动画？

A:
```css
/* 只保留消息出现动画 */
.message {
  animation: message-appear 0.5s ease-out;
}

/* 禁用其他 */
body::before,
body::after,
.terminal-container::before,
.terminal-container::after {
  display: none;
}
```

---

## 动画性能监控

### Chrome DevTools

1. 打开 DevTools (F12)
2. Performance 标签
3. 点击 Record
4. 操作界面
5. 停止录制
6. 查看 FPS 和 CPU 使用率

### 目标指标

- **FPS**: 保持 60fps
- **CPU**: <30%
- **内存**: <200MB

---

**Alert: Competence Proven** - 完整动画系统文档已就绪！
