import { openDB, type IDBPDatabase } from 'idb';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Session {
  id: string;
  messages: ChatMessage[];
  files: Record<string, string>;
  activeFile: string | null;
  createdAt: number;
  updatedAt: number;
}

class SessionStore {
  private db: IDBPDatabase | null = null;

  async init() {
    this.db = await openDB('claude-code-sessions', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'path' });
        }
      },
    });
  }

  async saveSession(session: Session) {
    if (!this.db) await this.init();
    await this.db!.put('sessions', {
      ...session,
      updatedAt: Date.now(),
    });
  }

  async loadSession(id: string): Promise<Session | null> {
    if (!this.db) await this.init();
    return (await this.db!.get('sessions', id)) || null;
  }

  async getCurrentSession(): Promise<Session | null> {
    if (!this.db) await this.init();
    const sessions = await this.db!.getAll('sessions');
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt)[0] || null;
  }

  async saveFile(path: string, content: string) {
    if (!this.db) await this.init();
    await this.db!.put('files', { path, content, updatedAt: Date.now() });
  }

  async loadFile(path: string): Promise<string | null> {
    if (!this.db) await this.init();
    const file = await this.db!.get('files', path);
    return file?.content || null;
  }

  async getAllFiles(): Promise<Record<string, string>> {
    if (!this.db) await this.init();
    const files = await this.db!.getAll('files');
    return files.reduce((acc, f) => ({ ...acc, [f.path]: f.content }), {});
  }

  async clearSession(id: string) {
    if (!this.db) await this.init();
    await this.db!.delete('sessions', id);
  }
}

export const sessionStore = new SessionStore();
