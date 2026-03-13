# GitHub 推送指南

## 仓库已创建
- 本地仓库：`E:\claude-code-web`
- 远程地址：`https://github.com/wai666/claude-code-web.git`
- 分支：main

## 推送步骤

### 1. 在 GitHub 创建仓库
访问：https://github.com/new
- Repository name: `claude-code-web`
- 选择 Public
- **不要**勾选 "Add a README file"
- 点击 "Create repository"

### 2. 推送代码
```bash
cd E:\claude-code-web
git push -u origin main
```

### 3. 验证
访问：https://github.com/wai666/claude-code-web

## 后续更新

```bash
cd E:\claude-code-web
git add .
git commit -m "更新说明"
git push
```

## 项目文档位置
- Obsidian: `E:\obsidian\00_CYBER_COMMAND\03_项目文档\claude-code-web项目说明.md`
- GitHub: README.md
