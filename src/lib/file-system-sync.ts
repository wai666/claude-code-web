import { createSignal } from 'solid-js';
import { webcontainer } from './webcontainer';

export interface FileChangeEvent {
  type: 'create' | 'update' | 'delete';
  path: string;
  content?: string;
  timestamp: number;
}

class FileSystemSync {
  private listeners = new Set<(event: FileChangeEvent) => void>();
  private fileCache = new Map<string, string>();

  // 订阅文件变化
  subscribe(callback: (event: FileChangeEvent) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // 通知所有监听者
  private notify(event: FileChangeEvent) {
    this.listeners.forEach(listener => listener(event));
  }

  // 写入文件（触发同步）
  async writeFile(path: string, content: string) {
    await webcontainer.writeFile(path, content);
    this.fileCache.set(path, content);

    this.notify({
      type: this.fileCache.has(path) ? 'update' : 'create',
      path,
      content,
      timestamp: Date.now(),
    });
  }

  // 读取文件（从缓存或 WebContainer）
  async readFile(path: string): Promise<string> {
    if (this.fileCache.has(path)) {
      return this.fileCache.get(path)!;
    }

    const content = await webcontainer.readFile(path);
    this.fileCache.set(path, content);
    return content;
  }

  // 删除文件
  async deleteFile(path: string) {
    // WebContainer 删除逻辑
    this.fileCache.delete(path);

    this.notify({
      type: 'delete',
      path,
      timestamp: Date.now(),
    });
  }

  // 监听 WebContainer 文件变化（轮询模式）
  startPolling(interval: number = 1000) {
    setInterval(async () => {
      // 检查已知文件是否有变化
      for (const [path, cachedContent] of this.fileCache.entries()) {
        try {
          const currentContent = await webcontainer.readFile(path);
          if (currentContent !== cachedContent) {
            this.fileCache.set(path, currentContent);
            this.notify({
              type: 'update',
              path,
              content: currentContent,
              timestamp: Date.now(),
            });
          }
        } catch (error) {
          // 文件可能被删除
          this.fileCache.delete(path);
          this.notify({
            type: 'delete',
            path,
            timestamp: Date.now(),
          });
        }
      }
    }, interval);
  }

  // 清空缓存
  clearCache() {
    this.fileCache.clear();
  }
}

export const fileSystemSync = new FileSystemSync();

// Solid Signal 集成
export function createFileSync() {
  const [files, setFiles] = createSignal<Map<string, string>>(new Map());

  fileSystemSync.subscribe((event) => {
    setFiles(prev => {
      const next = new Map(prev);
      if (event.type === 'delete') {
        next.delete(event.path);
      } else if (event.content) {
        next.set(event.path, event.content);
      }
      return next;
    });
  });

  return files;
}
