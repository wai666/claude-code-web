import { webcontainer } from './webcontainer';

export class ClaudeMDLoader {
  private systemPrompt: string = '';
  private projectContext: string = '';

  async loadFromPath(path: string = '/CLAUDE.md'): Promise<void> {
    try {
      const content = await webcontainer.readFile(path);
      this.systemPrompt = content;
      this.parseProjectContext(content);
    } catch (error) {
      console.warn('CLAUDE.md not found, using default system prompt');
      this.systemPrompt = this.getDefaultPrompt();
    }
  }

  private parseProjectContext(content: string) {
    // 提取项目特定的上下文信息
    const sections = content.split(/^##\s+/m);
    this.projectContext = sections
      .filter(s => s.toLowerCase().includes('project') || s.toLowerCase().includes('context'))
      .join('\n\n');
  }

  getSystemPrompt(): string {
    return this.systemPrompt;
  }

  getProjectContext(): string {
    return this.projectContext;
  }

  private getDefaultPrompt(): string {
    return `You are Claude Code, an AI coding assistant running in a cyberpunk terminal interface.

Key capabilities:
- Handle large files (18k+ lines)
- Understand complex codebases
- Execute code analysis and refactoring
- Provide concise, actionable responses
- Support @-mention file references
- Process control (SIGINT/SIGTERM)
- Session persistence

Respond in Chinese unless code is involved.`;
  }

  // 监听 CLAUDE.md 变化并自动重载
  watchForChanges(callback: () => void) {
    return webcontainer.watchFile('/CLAUDE.md', async () => {
      await this.loadFromPath();
      callback();
    });
  }
}

export const claudeMDLoader = new ClaudeMDLoader();
