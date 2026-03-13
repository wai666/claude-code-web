# 快速启动指南

## 当前状态

npm install 正在后台运行中...

## 启动步骤

### 1. 等待依赖安装完成

```bash
# 在 E:\claude-code-web 目录下
# npm install 正在运行，预计需要 3-5 分钟
```

### 2. 设置 API Key

```bash
set ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 访问

打开浏览器访问: http://localhost:3000

---

## 如果安装失败

### 方案 1: 使用国内镜像

```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### 方案 2: 使用 pnpm（更快）

```bash
npm install -g pnpm
pnpm install
pnpm dev
```

### 方案 3: 使用 yarn

```bash
npm install -g yarn
yarn install
yarn dev
```

---

## 检查安装进度

```bash
cd E:\claude-code-web
dir node_modules
```

如果看到很多文件夹，说明安装成功。

---

## 常见问题

### Q: ERR_CONNECTION_REFUSED

A: 开发服务器未启动，需要先运行 `npm run dev`

### Q: npm install 卡住

A:
1. 按 Ctrl+C 停止
2. 删除 node_modules 文件夹
3. 使用国内镜像重新安装

### Q: 端口被占用

A:
```bash
# 查找占用 3000 端口的进程
netstat -ano | findstr :3000

# 杀死进程（替换 PID）
taskkill /PID <进程ID> /F
```

---

## 下一步

等待 npm install 完成后：

1. 设置 ANTHROPIC_API_KEY
2. 运行 npm run dev
3. 访问 http://localhost:3000
4. 享受赛博朋克 AI 编码体验！
