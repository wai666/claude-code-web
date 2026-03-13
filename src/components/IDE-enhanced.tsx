import { createSignal, onMount, Show } from 'solid-js';
import FileTree from './FileTree';
import CodeEditor from './CodeEditor';
import Terminal from './Terminal';
import CyberBackground from './CyberBackground';
import ConfigPanel from './ConfigPanel';
import { sessionStore } from '~/lib/session-store';
import '~/global-enhanced.css';
import './IDE-enhanced.css';

export default function IDE() {
  const [selectedFile, setSelectedFile] = createSignal<string | null>(null);
  const [layout, setLayout] = createSignal<'split' | 'editor' | 'terminal'>('split');
  const [booting, setBooting] = createSignal(true);
  const [bootProgress, setBootProgress] = createSignal(0);

  // 启动动画
  onMount(async () => {
    // 模拟启动进度
    const interval = setInterval(() => {
      setBootProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setBooting(false), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    // 恢复会话
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
    <>
      <CyberBackground />
      <ConfigPanel />

      <Show when={booting()}>
        <div class="boot-screen">
          <div class="boot-logo">CLAUDE_CODE</div>
          <div class="boot-progress">
            <div
              class="boot-progress-bar"
              style={{ width: `${bootProgress()}%` }}
            />
          </div>
          <div class="boot-text">
            INITIALIZING NEURAL INTERFACE... {Math.floor(bootProgress())}%
          </div>
        </div>
      </Show>

      <div class="ide-container">
        {/* 顶部工具栏 */}
        <div class="ide-toolbar">
          <div class="ide-title">CLAUDE_CODE://IDE</div>
          <div class="layout-controls">
            <button
              class={layout() === 'split' ? 'active' : ''}
              onClick={() => setLayout('split')}
            >
              ◢◣ 分屏
            </button>
            <button
              class={layout() === 'editor' ? 'active' : ''}
              onClick={() => setLayout('editor')}
            >
              ◼ 编辑器
            </button>
            <button
              class={layout() === 'terminal' ? 'active' : ''}
              onClick={() => setLayout('terminal')}
            >
              ▶ 终端
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

        {/* 状态栏 */}
        <div class="status-bar">
          <div class="status-item">
            SYSTEM: ONLINE
          </div>
          <div class="status-item">
            FILE: {selectedFile() || 'NONE'}
          </div>
          <div class="status-item">
            MODE: {layout().toUpperCase()}
          </div>
        </div>
      </div>
    </>
  );
}
