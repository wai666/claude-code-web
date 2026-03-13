@echo off
chcp 65001 >nul
cls

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  🌌 CLAUDE CODE WEB ENHANCED - 赛博朋克终极版           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js 未安装，请先安装 Node.js 20+
    pause
    exit /b 1
)

REM 检查环境变量
if "%ANTHROPIC_API_KEY%"=="" (
    echo ⚠️  警告: ANTHROPIC_API_KEY 未设置
    echo 请运行: set ANTHROPIC_API_KEY=your-api-key
    echo.
    set /p continue="是否继续？(Y/N): "
    if /i not "%continue%"=="Y" exit /b 1
)

REM 安装依赖
if not exist "node_modules" (
    echo 📦 安装依赖...
    call npm install
)

REM 启动开发服务器
echo.
echo 🔥 启动开发服务器...
echo 访问: http://localhost:3000
echo.
echo 功能清单:
echo   ✅ WebContainers (浏览器内 Node.js)
echo   ✅ Monaco Editor (代码编辑)
echo   ✅ 文件树 (实时同步)
echo   ✅ @-mention (文件引用)
echo   ✅ 进程控制 (SIGINT/SIGTERM)
echo   ✅ 会话持久化 (IndexedDB)
echo   ✅ CLAUDE.md (系统提示词)
echo   ✅ 赛博朋克 UI (完整动画系统)
echo.
echo 🎨 新增特性:
echo   ✨ 启动动画 - Matrix 风格
echo   ✨ 粒子系统 - Canvas 实时效果
echo   ✨ 数字雨背景 - 动态数字流
echo   ✨ 全息闪烁 - CRT 显示器
echo   ✨ 故障艺术 - Glitch 动画
echo   ✨ 霓虹发光 - 多层阴影
echo.

call npm run dev
