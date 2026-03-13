# 快速启动指南

## 5 分钟上手

### 1. 克隆/复制项目

```bash
# 如果在 ~/claude-code-web-enhanced
cd ~/claude-code-web-enhanced
```

### 2. 安装依赖

```bash
npm install
```

### 3. 设置 API Key

```bash
export ANTHROPIC_API_KEY="sk-ant-api03-..."
```

或创建 `.env` 文件：

```bash
echo "ANTHROPIC_API_KEY=sk-ant-api03-..." > .env
```

### 4. 启动

```bash
./start.sh
```

或手动启动：

```bash
npm run dev
```

### 5. 访问

打开浏览器访问: http://localhost:3000

---

## 第一次使用

### 1. 界面布局

```
┌─────────────────────────────────────────┐
│  CLAUDE_CODE://IDE                      │
├──────┬──────────────────┬───────────────┤
│ 文件 │   Monaco Editor  │   Terminal    │
│ 树   │   (代码编辑)      │   (AI 对话)   │
│      │                  │               │
└──────┴──────────────────┴───────────────┘
```

### 2. 创建第一个文件

在终端输入：

```
> 创建一个 hello.js 文件，输出 Hello World
```

AI 会自动调用 `writeFile` 工具创建文件。

### 3. 编辑文件

- 点击左侧文件树中的 `hello.js`
- Monaco Editor 自动打开
- 编辑代码
- 按 `Ctrl+S` 保存

### 4. 执行代码

在终端输入：

```
> 运行 node hello.js
```

AI 会在 WebContainer 中执行代码并返回结果。

### 5. 使用 @-mention

引用文件到上下文：

```
> @hello.js 帮我优化这段代码
```

AI 会自动加载文件内容并分析。

---

## 常用命令

| 命令 | 功能 |
|------|------|
| `/clear` | 清空对话历史 |
| `/opus` | 切换到 Opus 模型（最强） |
| `/sonnet` | 切换到 Sonnet 模型（省钱） |
| `/ps` | 查看运行中的进程 |
| `ESC` | 打开命令面板 |
| `Ctrl+S` | 保存文件（编辑器中） |

---

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+S` | 保存文件 |
| `ESC` | 命令面板 / 停止响应 |
| `↑` / `↓` | 选择建议（@-mention 时） |
| `Enter` | 确认选择 |

---

## 示例工作流

### 创建 React 组件

```
> 创建一个 Button.tsx 组件，支持 primary 和 secondary 两种样式
```

### 重构代码

```
> @Button.tsx 将这个组件改为使用 Tailwind CSS
```

### 运行测试

```
> 运行 npm test
```

### 安装依赖

```
> 安装 axios 依赖
```

AI 会执行 `npm install axios`。

---

## 自定义配置

### 修改 CLAUDE.md

编辑项目根目录的 `CLAUDE.md`：

```markdown
# 我的项目配置

## 技术栈
- React 18
- TypeScript
- Tailwind CSS

## 代码风格
- 使用函数式组件
- 优先使用 Hooks
- 避免 any 类型
```

保存后，AI 会自动重载配置。

### 添加 .claudeignore

创建 `.claudeignore` 文件：

```
node_modules/
dist/
build/
*.log
.env
```

防止这些文件被加载到上下文。

---

## 故障排除

### 问题 1: WebContainers 无法启动

**解决方案**: 确保使用 Chrome/Edge 浏览器，并访问 `http://localhost`（不是 `https`）。

### 问题 2: API Key 无效

**解决方案**: 检查环境变量是否正确设置：

```bash
echo $ANTHROPIC_API_KEY
```

### 问题 3: 文件保存失败

**解决方案**: 检查浏览器控制台是否有错误，确保 WebContainer 已启动。

### 问题 4: Monaco Editor 空白

**解决方案**: 刷新页面，或清除浏览器缓存。

---

## 下一步

- 阅读 [README.md](./README.md) 了解完整功能
- 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 学习部署
- 探索 [src/lib/](./src/lib/) 了解核心实现

---

**Alert: Competence Proven** - 你已经掌握了 Claude Code Web 的基本使用！
