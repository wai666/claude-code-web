# 🔧 自动错误恢复系统 (Autonomous Error Recovery)

## 功能概述

自动错误恢复系统会监听 WebContainer 进程的错误输出，当检测到错误时自动触发 AI 修复流程。

## 核心特性

### 1. 智能错误检测

系统会自动识别以下错误模式：
- `error:` / `Error:`
- `exception:` / `Exception:`
- `failed` / `Failed`
- `cannot find` / `Cannot find`
- `undefined` / `Undefined`
- `syntax error` / `SyntaxError`
- `type error` / `TypeError`
- `reference error` / `ReferenceError`
- `module not found` / `Module not found`
- `ENOENT` / `ECONNREFUSED`
- Vite 构建错误
- 编译错误

### 2. 上下文收集

检测到错误后，系统会自动收集：
- **错误信息**: 完整的错误消息
- **堆栈跟踪**: 错误堆栈（最多 20 行）
- **执行命令**: 触发错误的命令
- **最近文件**: 最近修改的 5 个源代码文件
- **时间戳**: 错误发生时间

### 3. 自动修复请求

系统会构建结构化的修复提示词：

```
🔧 自动错误恢复请求

**错误信息**:
```
[错误详情]
```

**堆栈跟踪**:
```
[堆栈信息]
```

**执行命令**: `npm run build`

**最近修改的文件**:
- src/components/Terminal.tsx
- src/lib/error-recovery.ts
- ...

**请求**: 分析错误原因并自动修复。如果需要查看文件内容，请使用 @文件名 引用。
```

### 4. 防重复机制

- **时间窗口**: 2 秒内的重复错误会被忽略
- **相似度检测**: 自动识别相同错误（忽略行号、路径等）
- **重试限制**: 同一错误最多自动修复 3 次
- **超限保护**: 超过重试次数后停止自动恢复，提示手动检查

## 使用方法

### 启用/禁用自动恢复

在终端中输入命令：

```
/autofix
```

状态指示器会显示在终端头部：
- 🔧 AUTO (绿色脉冲) = 已启用
- 无指示器 = 已禁用

### 查看错误历史

```
/errors
```

显示最近的错误记录，包括时间和错误摘要。

### 手动触发恢复

如果自动恢复被禁用，你仍然可以：
1. 复制错误信息
2. 在聊天中粘贴
3. 使用 @文件名 引用相关文件
4. 让 AI 分析并修复

## 工作流程

```
┌─────────────────┐
│  代码执行错误   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  错误检测引擎   │ ← 监听 stderr
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  上下文收集     │ ← 文件、堆栈、命令
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  防重复检查     │ ← 时间窗口、相似度
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  构建修复提示   │ ← 结构化 prompt
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  发送给 AI      │ ← 自动提交
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI 分析修复    │ ← Claude 处理
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  应用修复方案   │ ← 自动或手动
└─────────────────┘
```

## 配置选项

### 修改重试次数

编辑 `src/lib/error-recovery.ts`:

```typescript
class ErrorRecoverySystem {
  private maxRetries = 3; // 改为你想要的次数
}
```

### 修改时间窗口

```typescript
if (lastError && Date.now() - lastError.timestamp < 2000) {
  return; // 改为你想要的毫秒数
}
```

### 添加自定义错误模式

```typescript
const errorPatterns = [
  /error:/i,
  /your custom pattern/i, // 添加你的模式
];
```

## 最佳实践

### 1. 保持启用状态

默认启用自动恢复，让系统自动处理常见错误。

### 2. 监控错误历史

定期使用 `/errors` 查看错误模式，识别重复问题。

### 3. 手动介入

如果同一错误反复出现（超过 3 次），说明需要人工分析根本原因。

### 4. 文件引用

AI 修复时会自动引用相关文件，但你也可以手动使用 @文件名 提供更多上下文。

### 5. 清理历史

如果错误历史过多，可以使用 `/clear` 清空对话（不影响错误历史记录）。

## 示例场景

### 场景 1: 模块未找到

```
错误: Cannot find module 'idb'
↓
系统检测到错误
↓
收集上下文: session-store.ts 导入了 idb
↓
AI 分析: 缺少依赖包
↓
建议: npm install idb
↓
自动执行或提示用户
```

### 场景 2: 类型错误

```
错误: Property 'useChat' does not exist on type 'ai/solid'
↓
系统检测到错误
↓
收集上下文: Terminal.tsx 使用了 ai/solid
↓
AI 分析: ai 包不支持 SolidJS
↓
建议: 重写为原生 fetch 实现
↓
自动修复代码
```

### 场景 3: 构建失败

```
错误: Build failed with 5 errors
↓
系统检测到错误
↓
收集上下文: 最近修改的 5 个文件
↓
AI 分析: 语法错误、导入错误等
↓
建议: 逐个修复错误
↓
自动应用修复
```

## 限制与注意事项

### 当前限制

1. **仅监听文本错误**: 无法处理运行时崩溃（页面白屏）
2. **依赖 AI 质量**: 修复效果取决于 Claude 的理解能力
3. **上下文限制**: 只收集最近 5 个文件，可能遗漏关键信息
4. **无法处理环境问题**: 如网络错误、权限问题等

### 安全考虑

- 系统不会自动执行破坏性命令（如 `rm -rf`）
- 所有修复建议都会显示在聊天中，用户可以审查
- 可以随时禁用自动恢复（`/autofix`）

## 未来改进

- [ ] 支持自定义错误处理策略
- [ ] 集成 Git 自动回滚
- [ ] 错误分类和优先级
- [ ] 学习用户修复偏好
- [ ] 多语言错误识别
- [ ] 性能分析和优化建议

## 技术实现

### 核心类

```typescript
class ErrorRecoverySystem {
  // 错误历史
  private errorHistory: ErrorContext[] = [];

  // 恢复状态
  private isRecovering = false;

  // 回调函数
  private recoveryCallbacks: ((context: ErrorContext) => void)[] = [];

  // 监听进程
  async monitorProcess(processId: string, command: string)

  // 检测错误
  private isErrorOutput(text: string): boolean

  // 提取堆栈
  private extractStackTrace(errorText: string): string

  // 获取文件
  private async getRecentFiles(): Promise<string[]>

  // 处理错误
  private async handleError(errorText: string, command: string, processId: string)

  // 构建提示
  buildRecoveryPrompt(context: ErrorContext): string

  // 防重复
  shouldAutoRecover(context: ErrorContext): boolean
}
```

### 集成点

1. **Terminal.tsx**: 注册错误回调，显示恢复状态
2. **process-manager.ts**: 监听进程输出
3. **webcontainer.ts**: 捕获 stderr 流
4. **context-manager.ts**: 提供文件上下文

---

**Alert: Competence Proven** - 自主错误恢复系统已就绪！

让机器自己给自己擦屁股。🔧
