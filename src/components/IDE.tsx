import { createSignal, onMount, Show } from 'solid-js';
import FileTree from './FileTree';
import CodeEditor from './CodeEditor';
import Terminal from './Terminal';
import { sessionStore } from '~/lib/session-store';
import './IDE.css';

export default function IDE() {
  const [selectedFile, setSelectedFile] = createSignal<string | null>(null);
  const [layout, setLayout] = createSignal<'split' | 'editor' | 'terminal'>('split');

  // 恢复会话
  onMount(async () => {
    const session = await sessionStore.getCurrentSession();
    if (session) {
      setSelectedFile(session.activeFile);
    }
  });

  const handleFileSelect = (path: string) => {
    setSelectedFile(path);
    sessionStore.saveSession({
      id: 'current',
      messages: [],
      files: {},
      activeFile: path,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  const handleFileSave = async (path: string, content: string) => {
    await sessionStore.saveFile(path, content);
  };

  return (
    <div class="ide-container">
      {/* 顶部工具栏 */}
      <div class="ide-toolbar">
        <span class="ide-title">CLAUDE_CODE://IDE</span>
        <div class="layout-controls">
          <button
            class={layout() === 'split' ? 'active' : ''}
            onClick={() => setLayout('split')}
          >
            分屏
          </button>
          <button
            class={layout() === 'editor' ? 'active' : ''}
            onClick={() => setLayout('editor')}
          >
            编辑器
          </button>
          <button
            class={layout() === 'terminal' ? 'active' : ''}
            onClick={() => setLayout('terminal')}
          >
            终端
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div class="ide-content">
        {/* 左侧文件树 */}
        <FileTree onFileSelect={handleFileSelect} />

        {/* 中间编辑器 */}
        <Show when={layout() === 'split' || layout() === 'editor'}>
          <CodeEditor
            filePath={selectedFile()}
            onSave={handleFileSave}
          />
        </Show>

        {/* 右侧/底部终端 */}
        <Show when={layout() === 'split' || layout() === 'terminal'}>
          <div class={`terminal-panel ${layout()}`}>
            <Terminal />
          </div>
        </Show>
      </div>
    </div>
  );
}
