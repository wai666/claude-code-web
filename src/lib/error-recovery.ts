import { WebContainerManager } from './webcontainer';
import { contextManager } from './context-manager';

interface ErrorContext {
  error: string;
  timestamp: number;
  command?: string;
  recentFiles: string[];
  stackTrace?: string;
}

class ErrorRecoverySystem {
  private errorHistory: ErrorContext[] = [];
  private isRecovering = false;
  private maxRetries = 3;
  private recoveryCallbacks: ((context: ErrorContext) => void)[] = [];

  /**
   * 注册错误恢复回调
   */
  onErrorDetected(callback: (context: ErrorContext) => void) {
    this.recoveryCallbacks.push(callback);
  }

  /**
   * 监听进程的 stderr 输出
   */
  async monitorProcess(processId: string, command: string) {
    const wc = await WebContainerManager.getInstance();
    const process = wc.spawn(command.split(' ')[0], command.split(' ').slice(1));

    let stderrBuffer = '';
    let stdoutBuffer = '';

    process.output.pipeTo(
      new WritableStream({
        write: (chunk) => {
          const text = chunk.toString();
          stdoutBuffer += text;

          // 检测常见错误模式
          if (this.isErrorOutput(text)) {
            stderrBuffer += text;
            this.handleError(text, command, processId);
          }
        },
      })
    );

    return process;
  }

  /**
   * 检测是否为错误输出
   */
  private isErrorOutput(text: string): boolean {
    const errorPatterns = [
      /error:/i,
      /exception:/i,
      /failed/i,
      /cannot find/i,
      /undefined/i,
      /syntax error/i,
      /type error/i,
      /reference error/i,
      /module not found/i,
      /enoent/i,
      /econnrefused/i,
      /\[vite\].*error/i,
      /build failed/i,
      /compilation error/i,
      /✘ \[ERROR\]/,
    ];

    return errorPatterns.some(pattern => pattern.test(text));
  }

  /**
   * 提取错误堆栈
   */
  private extractStackTrace(errorText: string): string {
    const lines = errorText.split('\n');
    const stackLines: string[] = [];
    let inStack = false;

    for (const line of lines) {
      // 检测堆栈开始
      if (line.match(/^\s+at\s+/) || line.match(/^\s+\d+\s+\|/)) {
        inStack = true;
      }

      if (inStack) {
        stackLines.push(line);
        // 限制堆栈深度
        if (stackLines.length > 20) break;
      }

      // 检测错误消息
      if (line.match(/error:/i) || line.match(/exception:/i)) {
        stackLines.push(line);
      }
    }

    return stackLines.join('\n');
  }

  /**
   * 获取最近修改的文件
   */
  private async getRecentFiles(): Promise<string[]> {
    const wc = await WebContainerManager.getInstance();
    const files: string[] = [];

    // 递归扫描文件，获取最近修改的
    const scanDir = async (path: string) => {
      try {
        const entries = await wc.fs.readdir(path, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = `${path}/${entry.name}`;

          if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            await scanDir(fullPath);
          } else if (entry.isFile() && this.isSourceFile(entry.name)) {
            files.push(fullPath);
          }
        }
      } catch (e) {
        // 忽略权限错误
      }
    };

    await scanDir('.');

    // 返回最近的 5 个文件
    return files.slice(0, 5);
  }

  /**
   * 判断是否为源代码文件
   */
  private isSourceFile(filename: string): boolean {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.py', '.go', '.rs', '.java'];
    return extensions.some(ext => filename.endsWith(ext));
  }

  /**
   * 处理错误
   */
  private async handleError(errorText: string, command: string, processId: string) {
    // 防止重复触发
    if (this.isRecovering) return;

    // 检查是否为重复错误
    const lastError = this.errorHistory[this.errorHistory.length - 1];
    if (lastError && Date.now() - lastError.timestamp < 2000) {
      return; // 2秒内的重复错误忽略
    }

    this.isRecovering = true;

    try {
      const stackTrace = this.extractStackTrace(errorText);
      const recentFiles = await this.getRecentFiles();

      const errorContext: ErrorContext = {
        error: errorText,
        timestamp: Date.now(),
        command,
        recentFiles,
        stackTrace,
      };

      this.errorHistory.push(errorContext);

      // 限制历史记录
      if (this.errorHistory.length > 10) {
        this.errorHistory.shift();
      }

      // 触发恢复回调
      for (const callback of this.recoveryCallbacks) {
        callback(errorContext);
      }

      console.log('🔧 自动错误恢复已触发:', {
        error: errorText.slice(0, 200),
        files: recentFiles,
      });
    } finally {
      // 延迟重置，避免短时间内重复触发
      setTimeout(() => {
        this.isRecovering = false;
      }, 3000);
    }
  }

  /**
   * 构建恢复提示词
   */
  buildRecoveryPrompt(context: ErrorContext): string {
    let prompt = `🔧 自动错误恢复请求\n\n`;
    prompt += `**错误信息**:\n\`\`\`\n${context.error}\n\`\`\`\n\n`;

    if (context.stackTrace) {
      prompt += `**堆栈跟踪**:\n\`\`\`\n${context.stackTrace}\n\`\`\`\n\n`;
    }

    if (context.command) {
      prompt += `**执行命令**: \`${context.command}\`\n\n`;
    }

    prompt += `**最近修改的文件**:\n`;
    for (const file of context.recentFiles) {
      prompt += `- ${file}\n`;
    }

    prompt += `\n**请求**: 分析错误原因并自动修复。如果需要查看文件内容，请使用 @文件名 引用。`;

    return prompt;
  }

  /**
   * 获取错误历史
   */
  getErrorHistory(): ErrorContext[] {
    return [...this.errorHistory];
  }

  /**
   * 清除错误历史
   */
  clearHistory() {
    this.errorHistory = [];
  }

  /**
   * 检查是否应该自动恢复
   */
  shouldAutoRecover(context: ErrorContext): boolean {
    // 统计最近 5 分钟内相同错误的次数
    const recentSimilarErrors = this.errorHistory.filter(e => {
      return (
        Date.now() - e.timestamp < 5 * 60 * 1000 &&
        this.isSimilarError(e.error, context.error)
      );
    });

    // 如果同一个错误重复超过 maxRetries 次，停止自动恢复
    return recentSimilarErrors.length < this.maxRetries;
  }

  /**
   * 判断是否为相似错误
   */
  private isSimilarError(error1: string, error2: string): boolean {
    // 提取错误的核心信息（去除路径、行号等）
    const normalize = (err: string) => {
      return err
        .replace(/:\d+:\d+/g, '') // 移除行号列号
        .replace(/\([^)]+\)/g, '') // 移除括号内容
        .replace(/\s+/g, ' ') // 标准化空格
        .toLowerCase();
    };

    const norm1 = normalize(error1);
    const norm2 = normalize(error2);

    // 计算相似度（简单的包含判断）
    return norm1.includes(norm2.slice(0, 50)) || norm2.includes(norm1.slice(0, 50));
  }
}

export const errorRecoverySystem = new ErrorRecoverySystem();
