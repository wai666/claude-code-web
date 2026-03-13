#!/bin/bash

# Claude Code Web Enhanced - 启动脚本

echo "🚀 Claude Code Web - 生产级赛博朋克 IDE"
echo "=========================================="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 20+"
    exit 1
fi

# 检查环境变量
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  警告: ANTHROPIC_API_KEY 未设置"
    echo "请运行: export ANTHROPIC_API_KEY='your-api-key'"
    read -p "是否继续？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动开发服务器
echo "🔥 启动开发服务器..."
echo "访问: http://localhost:3000"
echo ""
echo "功能清单:"
echo "  ✅ WebContainers (浏览器内 Node.js)"
echo "  ✅ Monaco Editor (代码编辑)"
echo "  ✅ 文件树 (实时同步)"
echo "  ✅ @-mention (文件引用)"
echo "  ✅ 进程控制 (SIGINT/SIGTERM)"
echo "  ✅ 会话持久化 (IndexedDB)"
echo "  ✅ CLAUDE.md (系统提示词)"
echo "  ✅ 赛博朋克 UI (CRT 滤镜)"
echo ""

npm run dev
