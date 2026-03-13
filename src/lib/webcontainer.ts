import { WebContainer } from '@webcontainer/api';
import type { FileSystemTree } from '@webcontainer/api';

export class WebContainerManager {
  private static instance: WebContainer | null = null;
  private watchers = new Map<string, () => void>();

  static async getInstance(): Promise<WebContainer> {
    if (!this.instance) {
      this.instance = await WebContainer.boot();
    }
    return this.instance;
  }

  async mount(files: FileSystemTree) {
    const container = await WebContainerManager.getInstance();
    await container.mount(files);
  }

  async writeFile(path: string, content: string) {
    const container = await WebContainerManager.getInstance();
    await container.fs.writeFile(path, content);
  }

  async readFile(path: string): Promise<string> {
    const container = await WebContainerManager.getInstance();
    const data = await container.fs.readFile(path, 'utf-8');
    return data;
  }

  async readdir(path: string): Promise<string[]> {
    const container = await WebContainerManager.getInstance();
    return await container.fs.readdir(path);
  }

  async spawn(command: string, args: string[] = []) {
    const container = await WebContainerManager.getInstance();
    return await container.spawn(command, args);
  }

  // 文件监听
  watchFile(path: string, callback: () => void) {
    const watchId = `${path}-${Date.now()}`;
    this.watchers.set(watchId, callback);

    // WebContainer 原生不支持 fs.watch，需要轮询或通过写入事件触发
    return () => this.watchers.delete(watchId);
  }

  // 触发文件变更事件
  notifyFileChange(path: string) {
    this.watchers.forEach((callback, id) => {
      if (id.startsWith(path)) {
        callback();
      }
    });
  }
}

export const webcontainer = new WebContainerManager();
