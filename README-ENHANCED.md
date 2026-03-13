# 🌌 Claude Code Web Enhanced - 赛博朋克终极版

**Alert: Competence Proven** - 极致赛博朋克 AI 编码助手，带完整动画系统

---

## ✨ 新增特性

### 🎨 视觉增强

- **启动动画** - Matrix 风格启动序列
- **粒子系统** - Canvas 实时粒子效果
- **数字雨背景** - 动态 Matrix 数字流
- **全息闪烁** - CRT 显示器效果
- **故障艺术** - Glitch 动画效果
- **霓虹发光** - 多层发光阴影
- **扫描线** - 垂直/水平扫描动画
- **网格背景** - 3D 透视网格
- **旋转边框** - 渐变色边框动画
- **脉冲效果** - 呼吸灯动画

### 🎬 动画系统

| 动画 | 效果 | 触发 |
|------|------|------|
| `terminal-boot` | 终端启动 | 页面加载 |
| `hologram-flicker` | 全息闪烁 | 持续 |
| `glitch` | 故障效果 | 随机 |
| `data-flow` | 数据流动 | 持续 |
| `pulse-glow` | 脉冲发光 | 持续 |
| `neon-flicker` | 霓虹闪烁 | 持续 |
| `matrix-rain` | 数字雨 | 持续 |
| `scanline` | 扫描线 | 持续 |
| `gradient-rotate` | 渐变旋转 | 持续 |

### 🎯 交互增强

- **按钮悬停** - 光波扫过效果
- **输入框聚焦** - 发光边框动画
- **消息出现** - 滑入 + 淡入动画
- **工具调用** - 扫描线效果
- **进程监控** - 脉冲指示器
- **命令面板** - 弹出动画
- **状态栏** - 闪烁指示灯

---

## 🚀 快速启动

### Windows

```bash
cd E:\claude-code-web
npm install
set ANTHROPIC_API_KEY=your-key
npm run dev
```

### Linux/Mac

```bash
cd /e/claude-code-web
npm install
export ANTHROPIC_API_KEY=your-key
npm run dev
```

访问: http://localhost:3000

---

## 📁 项目结构

```
E:\claude-code-web\
├── src/
│   ├── components/
│   │   ├── IDE-enhanced.tsx          # 增强版 IDE
│   │   ├── IDE-enhanced.css          # IDE 动画样式
│   │   ├── Terminal-enhanced.css     # 终端动画样式
│   │   ├── CyberBackground.tsx       # 粒子系统
│   │   ├── FileTree.tsx
│   │   ├── CodeEditor.tsx
│   │   ├── Terminal.tsx
│   │   └── MentionInput.tsx
│   ├── lib/
│   │   ├── webcontainer.ts
│   │   ├── session-store.ts
│   │   ├── process-manager.ts
│   │   ├── context-manager.ts
│   │   ├── file-system-sync.ts
│   │   └── claude-md-loader.ts
│   ├── routes/
│   │   ├── index.tsx                 # 使用增强版组件
│   │   └── api/chat.ts
│   ├── global-enhanced.css           # 全局动画样式
│   ├── app.tsx
│   ├── entry-client.tsx
│   └── entry-server.tsx
├── CLAUDE.md
├── README.md
├── package.json
└── start.sh
```

---

## 🎨 设计系统

### 配色方案

```css
--cyber-green: #00ff41   /* 主色 - 霓虹绿 */
--cyber-blue: #00d9ff    /* 辅色 - 霓虹蓝 */
--cyber-purple: #b026ff  /* 强调 - 紫色 */
--cyber-pink: #ff006e    /* 警告 - 粉色 */
--cyber-yellow: #ffea00  /* 提示 - 黄色 */
--bg-black: #0a0a0a      /* 背景 - 深黑 */
```

### 字体系统

- **标题**: Orbitron (900/700/400)
- **正文**: Share Tech Mono
- **代码**: Share Tech Mono

### 发光效果

```css
/* 绿色发光 */
--glow-green: 0 0 5px #00ff41, 0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 40px #00ff41;

/* 蓝色发光 */
--glow-blue: 0 0 5px #00d9ff, 0 0 10px #00d9ff, 0 0 20px #00d9ff;

/* 紫色发光 */
--glow-purple: 0 0 5px #b026ff, 0 0 10px #b026ff, 0 0 20px #b026ff;
```

---

## 🎬 动画演示

### 启动序列

1. **Logo 出现** (0-1s) - 故障效果 + 发光
2. **进度条** (1-2.5s) - 渐变填充 + 闪烁
3. **系统初始化** (2.5-3s) - 淡出
4. **IDE 启动** (3-4s) - 模糊到清晰
5. **组件加载** (4-5s) - 依次滑入

### 交互动画

- **按钮点击**: 光波扩散 → 发光 → 回弹
- **输入聚焦**: 边框发光 → 背景亮起
- **消息发送**: 滑入 → 扫描线 → 稳定
- **文件选择**: 高亮 → 脉冲 → 加载

---

## 🔧 自定义动画

### 修改动画速度

```css
/* global-enhanced.css */
@keyframes matrix-rain {
  0% { transform: translateY(0); }
  100% { transform: translateY(100vh); }
}

/* 改为 10s 更慢 */
body::before {
  animation: matrix-rain 10s linear infinite;
}
```

### 添加新动画

```css
@keyframes custom-effect {
  0% { /* 起始状态 */ }
  100% { /* 结束状态 */ }
}

.your-element {
  animation: custom-effect 2s ease-in-out infinite;
}
```

### 禁用特定动画

```css
/* 禁用扫描线 */
body::after {
  display: none;
}

/* 禁用数字雨 */
body::before {
  display: none;
}
```

---

## 📊 性能优化

### 动画性能

- **CSS 动画优先** - 使用 GPU 加速
- **Canvas 优化** - requestAnimationFrame
- **粒子数量** - 可调整（默认 50）
- **帧率控制** - 60fps 上限

### 减少动画

```typescript
// CyberBackground.tsx
// 减少粒子数量
for (let i = 0; i < 20; i++) {  // 原 50
  particles.push(new Particle());
}

// 减少数字雨
for (let i = 0; i < 10; i++) {  // 原 30
  matrixRains.push(new MatrixRain());
}
```

---

## 🎮 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+S` | 保存文件 |
| `ESC` | 命令面板 / 停止 |
| `/clear` | 清空对话 |
| `/opus` | 切换 Opus |
| `/sonnet` | 切换 Sonnet |
| `/ps` | 查看进程 |

---

## 🌟 特色功能

### 1. 启动动画

```typescript
// IDE-enhanced.tsx
const [booting, setBooting] = createSignal(true);
const [bootProgress, setBootProgress] = createSignal(0);

// 模拟启动进度
const interval = setInterval(() => {
  setBootProgress(prev => {
    if (prev >= 100) {
      clearInterval(interval);
      setTimeout(() => setBooting(false), 500);
      return 100;
    }
    return prev + Math.random() * 15;
  });
}, 100);
```

### 2. 粒子系统

```typescript
// CyberBackground.tsx
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
}
```

### 3. 数字雨

```typescript
class MatrixRain {
  x: number;
  y: number;
  speed: number;
  chars: string;
  fontSize: number;

  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.speed = Math.random() * 3 + 2;
    this.chars = '01';
    this.fontSize = 14;
  }
}
```

---

## 🐛 故障排除

### 动画卡顿

- 减少粒子数量
- 禁用部分动画
- 降低动画帧率

### 启动黑屏

- 检查浏览器控制台
- 确认 WebGL 支持
- 清除浏览器缓存

### 样式不生效

- 确认导入 `global-enhanced.css`
- 检查 CSS 变量定义
- 验证组件路径

---

## 📚 相关文档

- [README.md](./README.md) - 完整功能文档
- [QUICKSTART.md](./QUICKSTART.md) - 快速上手
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署指南
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - 技术总结

---

## 🎉 致谢

- **Matrix** - 数字雨灵感
- **Blade Runner** - 赛博朋克美学
- **Tron** - 霓虹发光效果
- **Cyberpunk 2077** - UI 设计参考

---

**Alert: Competence Proven** - 极致赛博朋克体验已就绪！

**项目位置**: `E:\claude-code-web`
**启动命令**: `npm run dev`
**访问地址**: `http://localhost:3000`

---

*版本: 2.0.0 Enhanced*
*状态: Production Ready with Cyberpunk Aesthetics*
*日期: 2026-03-13*
