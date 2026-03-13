# 部署指南

## Vercel 部署

### 1. 安装 Vercel CLI

```bash
npm i -g vercel
```

### 2. 登录

```bash
vercel login
```

### 3. 部署

```bash
npm run build
vercel --prod
```

### 4. 配置环境变量

在 Vercel Dashboard 中设置：
- `ANTHROPIC_API_KEY` = your-api-key

---

## Cloudflare Pages 部署

### 1. 构建

```bash
npm run build
```

### 2. 部署

```bash
npx wrangler pages deploy dist
```

### 3. 配置环境变量

```bash
npx wrangler pages secret put ANTHROPIC_API_KEY
```

---

## Docker 部署

### 1. 创建 Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. 构建镜像

```bash
docker build -t claude-code-web .
```

### 3. 运行容器

```bash
docker run -p 3000:3000 \
  -e ANTHROPIC_API_KEY=your-api-key \
  claude-code-web
```

---

## Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 性能优化

### 1. 启用 Gzip 压缩

```typescript
// app.config.ts
export default defineConfig({
  vite: {
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
  },
});
```

### 2. 代码分割

```typescript
// 动态导入
const Monaco = lazy(() => import('./components/CodeEditor'));
```

### 3. CDN 加速

```html
<!-- 使用 CDN 加载字体 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
```

---

## 监控与日志

### Sentry 集成

```bash
npm install @sentry/solidstart
```

```typescript
// entry-client.tsx
import * as Sentry from '@sentry/solidstart';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production',
});
```

### 日志收集

```typescript
// lib/logger.ts
export const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string, err: Error) => {
    console.error(`[ERROR] ${msg}`, err);
    // 发送到日志服务
  },
};
```

---

## 安全配置

### 1. CORS 设置

```typescript
// entry-server.tsx
export default createHandler(() => (
  <StartServer
    middleware={[
      (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', 'https://your-domain.com');
        next();
      },
    ]}
  />
));
```

### 2. CSP 头

```typescript
res.setHeader('Content-Security-Policy',
  "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
);
```

### 3. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 最多 100 次请求
});
```

---

## 故障排除

### WebContainers 跨域问题

确保设置正确的 COOP/COEP 头：

```typescript
res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
```

### Monaco Editor 加载失败

检查 Vite 配置：

```typescript
export default defineConfig({
  vite: {
    optimizeDeps: {
      include: ['monaco-editor'],
    },
  },
});
```

### IndexedDB 配额不足

清理旧数据：

```typescript
await sessionStore.clearSession('old-id');
```
