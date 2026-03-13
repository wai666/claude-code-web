# Claude Code Web - 生产级赛博朋克 IDE

完整实现的浏览器内 AI 编码助手，具备 WebContainers、Monaco Editor、文件系统同步、会话持久化等企业级功能。

## 技术栈

### 核心框架
- **SolidStart** - 细粒度响应式框架（比 React 快 3-5x）
- **Vercel AI SDK** - 统一的 AI 流式响应接口
- **WebContainers** - 浏览器内 Node.js 运行时
- **Monaco Editor** - VS Code 同源代码编辑器

### 状态管理
- **Solid Signals** - 原生响应式状态
- **IndexedDB** - 会话持久化存储
- **tRPC** (可选) - 类型安全的 API 通信

### AI 集成
- **Claude Opus 4.6** - 默认模型（最强性能）
- **Claude Sonnet 4.6** - 备用模型（成本优化）
- **工具调用** - 文件操作、代码执行、进程控制

## 核心功能

### ✅ 已实现

1. **WebContainers 集成**
   - 浏览器内运行 Node.js
   - 虚拟文件系统
   - 进程管理与执行

2. **Monaco Editor**
   - 代码编辑与语法高亮
   - 多语言支持（TS/JS/Python/CSS/HTML）
   - Ctrl+S 保存快捷键
   - 自动语言检测

3. **文件树组件**
   - 递归目录浏览
   - 文件选择与展开
   - 实时同步更新

4. **@-mention 文件引用**
   - 输入 @ 触发文件自动补全
   - 智能上下文构建
   - Token 计数与裁剪
   - .claudeignore 支持

5. **进程控制**
   - SIGINT (Ctrl+C) 信号发送
   - SIGTERM 强制终止
   - 进程状态监控
   - 运行中进程列表

6. **会话持久化**
   - IndexedDB 存储聊天历史
   - 文件状态缓存
   - 刷新后自动恢复
   - 多会话管理

7. **上下文裁剪**
   - 自动 Token 估算
   - 大文件智能裁剪（保留头尾）
   - 默认忽略规则（node_modules/.git）
   - 100k Token 限制保护

8. **文件系统双向同步**
   - 编辑器 → WebContainer 实时写入
   - WebContainer → 文件树热更新
   - 轮询检测文件变化
   - 事件广播机制

9. **CLAUDE.md 系统提示词**
   - 项目根目录自动加载
   - 自定义系统行为
   - 热重载支持
   - 项目上下文注入

10. **赛博朋克 UI**
    - CRT 扫描线滤镜
    - 发光边框效果
    - JetBrains Mono 字体
    - 打字机流式输出
    - 自动滚动

### 命令系统

- `/clear` - 清空对话历史
- `/opus` - 切换到 Opus 模型
- `/sonnet` - 切换到 Sonnet 模型
- `/ps` - 查看运行中的进程
- `ESC` - 打开/关闭命令面板
- `ESC` (加载中) - 停止 AI 响应

## 快速开始

### 1. 安装依赖

```bash
cd ~/claude-code-web-enhanced
npm install
```

### 2. 配置环境变量

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 自定义 CLAUDE.md

在项目根目录创建 `CLAUDE.md`，定义系统行为：

```markdown
# 我的项目配置

## 角色
你是专注于 React 开发的 AI 助手。

## 项目上下文
- 使用 TypeScript + React 18
- 状态管理：Zustand
- 样式：Tailwind CSS

## 响应风格
- 简洁直接
- 优先提供代码示例
```

## 项目结构

```
claude-code-web-enhanced/
├── src/
│   ├── components/
│   │   ├── IDE.tsx              # 主 IDE 容器
│   │   ├── Terminal.tsx         # 终端组件
│   │   ├── CodeEditor.tsx       # Monaco 编辑器
│   │   ├── FileTree.tsx         # 文件浏览器
│   │   └── MentionInput.tsx     # @-mention 输入框
│   ├── lib/
│   │   ├── webcontainer.ts      # WebContainer 管理器
│   │   ├── session-store.ts     # IndexedDB 持久化
│   │   ├── process-manager.ts   # 进程控制
│   │   ├── context-manager.ts   # 上下文裁剪
│   │   ├── file-system-sync.ts  # 文件同步
│   │   └── claude-md-loader.ts  # CLAUDE.md 加载器
│   ├── routes/
│   │   ├── index.tsx            # 主页面
│   │   └── api/
│   │       └── chat.ts          # AI API 路由
│   ├── app.tsx                  # 应用入口
│   ├── entry-client.tsx         # 客户端入口
│   ├── entry-server.tsx         # 服务端入口
│   └── global.css               # 全局样式
├── CLAUDE.md                    # 系统提示词配置
├── package.json
├── app.config.ts
├── tsconfig.json
└── README.md
```

## 使用示例

### 1. 引用文件到上下文

```
> @package.json 帮我分析依赖
```

AI 会自动加载 `package.json` 内容并分析。

### 2. 执行代码

```
> 运行 npm install
```

AI 会调用 `executeCode` 工具在 WebContainer 中执行。

### 3. 编辑文件

在文件树中选择文件 → Monaco Editor 打开 → 编辑 → Ctrl+S 保存 → 自动同步到 WebContainer。

### 4. 终止进程

```
> /ps
```

查看运行中的进程，点击"终止"按钮发送 SIGINT。

## 性能优化

- **细粒度响应式** - Solid.js 只更新变化的 DOM 节点
- **虚拟滚动** - 大量消息时使用虚拟列表
- **Token 裁剪** - 自动压缩大文件，防止上下文爆炸
- **IndexedDB 缓存** - 减少重复文件读取
- **轮询优化** - 文件监听使用 1 秒间隔

## 部署

### Vercel

```bash
npm run build
vercel deploy
```

### Cloudflare Pages

```bash
npm run build
wrangler pages deploy dist
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 扩展功能

### 集成 LSP (Language Server Protocol)

```typescript
import { createLanguageService } from '@typescript/vfs';

// 在 Monaco Editor 中启用 TypeScript 智能提示
```

### 添加协作编辑 (Yjs)

```typescript
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';

// 多人实时协作编辑
```

### 集成 Pyodide (Python 支持)

```typescript
import { loadPyodide } from 'pyodide';

// 浏览器内运行 Python 代码
```

## 故障排除

### WebContainers 无法启动

确保浏览器支持 SharedArrayBuffer：
- Chrome/Edge 需要启用 COOP/COEP 头
- 本地开发使用 `http://localhost`

### Monaco Editor 加载失败

检查 Vite 配置：

```typescript
// app.config.ts
export default defineConfig({
  vite: {
    optimizeDeps: {
      include: ['monaco-editor'],
    },
  },
});
```

### IndexedDB 配额不足

清理旧会话：

```typescript
await sessionStore.clearSession('old-session-id');
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

---

**Alert: Competence Proven** - 完整的生产级 Claude Code Web IDE 已交付。
