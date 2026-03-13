import type { WebContainerProcess } from '@webcontainer/api';

export interface ProcessInfo {
  id: string;
  command: string;
  args: string[];
  status: 'running' | 'stopped' | 'error';
  output: string[];
  exitCode: number | null;
}

export class ProcessManager {
  private processes = new Map<string, WebContainerProcess>();
  private processInfo = new Map<string, ProcessInfo>();

  async spawn(
    container: any,
    command: string,
    args: string[] = [],
    onOutput?: (data: string) => void
  ): Promise<string> {
    const id = `${command}-${Date.now()}`;

    const process = await container.spawn(command, args);

    this.processes.set(id, process);
    this.processInfo.set(id, {
      id,
      command,
      args,
      status: 'running',
      output: [],
      exitCode: null,
    });

    // 监听输出
    process.output.pipeTo(
      new WritableStream({
        write: (data) => {
          const text = data.toString();
          const info = this.processInfo.get(id)!;
          info.output.push(text);
          onOutput?.(text);
        },
      })
    );

    // 监听退出
    process.exit.then((code) => {
      const info = this.processInfo.get(id)!;
      info.status = code === 0 ? 'stopped' : 'error';
      info.exitCode = code;
    });

    return id;
  }

  // 发送 SIGINT (Ctrl+C)
  async kill(processId: string, signal: 'SIGINT' | 'SIGTERM' = 'SIGINT') {
    const process = this.processes.get(processId);
    if (!process) return false;

    try {
      if (signal === 'SIGINT') {
        // 发送 Ctrl+C 字符
        const writer = process.input.getWriter();
        await writer.write('\x03'); // ASCII 3 = Ctrl+C
        writer.releaseLock();
      } else {
        // 强制终止
        process.kill();
      }

      const info = this.processInfo.get(processId)!;
      info.status = 'stopped';
      return true;
    } catch (error) {
      console.error('Failed to kill process:', error);
      return false;
    }
  }

  getProcess(id: string): ProcessInfo | null {
    return this.processInfo.get(id) || null;
  }

  getAllProcesses(): ProcessInfo[] {
    return Array.from(this.processInfo.values());
  }

  getRunningProcesses(): ProcessInfo[] {
    return this.getAllProcesses().filter(p => p.status === 'running');
  }
}

export const processManager = new ProcessManager();
