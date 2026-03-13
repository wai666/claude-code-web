// Token 估算（1 token ≈ 4 字符）
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// .claudeignore 解析
export function parseIgnoreFile(content: string): string[] {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

// 检查文件是否应该被忽略
export function shouldIgnoreFile(path: string, ignorePatterns: string[]): boolean {
  const defaultIgnores = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'coverage',
    '*.log',
    '.env',
    '*.lock',
  ];

  const allPatterns = [...defaultIgnores, ...ignorePatterns];

  return allPatterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(path);
    }
    return path.includes(pattern);
  });
}

// 智能裁剪文件内容
export function pruneFileContent(content: string, maxTokens: number = 2000): string {
  const tokens = estimateTokens(content);

  if (tokens <= maxTokens) {
    return content;
  }

  const lines = content.split('\n');
  const targetChars = maxTokens * 4;

  // 保留开头和结尾
  const headLines = lines.slice(0, Math.floor(lines.length * 0.3));
  const tailLines = lines.slice(-Math.floor(lines.length * 0.3));

  const pruned = [
    ...headLines,
    `\n... [${lines.length - headLines.length - tailLines.length} lines omitted] ...\n`,
    ...tailLines,
  ].join('\n');

  return pruned.slice(0, targetChars);
}

// 上下文管理器
export class ContextManager {
  private maxTokens = 100000; // Claude 上下文限制
  private currentTokens = 0;
  private files = new Map<string, string>();

  addFile(path: string, content: string, ignorePatterns: string[] = []) {
    if (shouldIgnoreFile(path, ignorePatterns)) {
      return false;
    }

    const tokens = estimateTokens(content);

    if (this.currentTokens + tokens > this.maxTokens) {
      // 裁剪内容
      const pruned = pruneFileContent(content, 2000);
      this.files.set(path, pruned);
      this.currentTokens += estimateTokens(pruned);
    } else {
      this.files.set(path, content);
      this.currentTokens += tokens;
    }

    return true;
  }

  getContext(): string {
    return Array.from(this.files.entries())
      .map(([path, content]) => `// File: ${path}\n${content}`)
      .join('\n\n');
  }

  getTokenCount(): number {
    return this.currentTokens;
  }

  clear() {
    this.files.clear();
    this.currentTokens = 0;
  }
}
