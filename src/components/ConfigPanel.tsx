import { createSignal, Show } from 'solid-js';
import './ConfigPanel.css';

interface Config {
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_BASE_URL?: string;
  HTTP_PROXY?: string;
  model?: 'opus' | 'sonnet';
}

export default function ConfigPanel() {
  const [isOpen, setIsOpen] = createSignal(false);
  const [config, setConfig] = createSignal<Config>({
    ANTHROPIC_API_KEY: localStorage.getItem('ANTHROPIC_API_KEY') || '',
    ANTHROPIC_BASE_URL: localStorage.getItem('ANTHROPIC_BASE_URL') || 'https://codeflow.asia',
    HTTP_PROXY: localStorage.getItem('HTTP_PROXY') || 'http://127.0.0.1:7897',
    model: (localStorage.getItem('model') as 'opus' | 'sonnet') || 'opus',
  });

  const handleSave = () => {
    const cfg = config();
    localStorage.setItem('ANTHROPIC_API_KEY', cfg.ANTHROPIC_API_KEY || '');
    localStorage.setItem('ANTHROPIC_BASE_URL', cfg.ANTHROPIC_BASE_URL || '');
    localStorage.setItem('HTTP_PROXY', cfg.HTTP_PROXY || '');
    localStorage.setItem('model', cfg.model || 'opus');

    alert('配置已保存！刷新页面生效。');
    setIsOpen(false);
  };

  const updateConfig = (key: keyof Config, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <button class="config-trigger" onClick={() => setIsOpen(true)}>
        ⚙️ 配置
      </button>

      <Show when={isOpen()}>
        <div class="config-overlay" onClick={() => setIsOpen(false)}>
          <div class="config-panel" onClick={(e) => e.stopPropagation()}>
            <div class="config-header">
              <h2>系统配置</h2>
              <button class="close-btn" onClick={() => setIsOpen(false)}>×</button>
            </div>

            <div class="config-body">
              <div class="config-group">
                <label>API Key</label>
                <input
                  type="password"
                  value={config().ANTHROPIC_API_KEY}
                  onInput={(e) => updateConfig('ANTHROPIC_API_KEY', e.currentTarget.value)}
                  placeholder="sk-ant-api03-..."
                />
              </div>

              <div class="config-group">
                <label>Base URL</label>
                <input
                  type="text"
                  value={config().ANTHROPIC_BASE_URL}
                  onInput={(e) => updateConfig('ANTHROPIC_BASE_URL', e.currentTarget.value)}
                  placeholder="https://codeflow.asia"
                />
              </div>

              <div class="config-group">
                <label>HTTP Proxy</label>
                <input
                  type="text"
                  value={config().HTTP_PROXY}
                  onInput={(e) => updateConfig('HTTP_PROXY', e.currentTarget.value)}
                  placeholder="http://127.0.0.1:7897"
                />
              </div>

              <div class="config-group">
                <label>默认模型</label>
                <select
                  value={config().model}
                  onChange={(e) => updateConfig('model', e.currentTarget.value)}
                >
                  <option value="opus">Opus (最强)</option>
                  <option value="sonnet">Sonnet (省钱)</option>
                </select>
              </div>
            </div>

            <div class="config-footer">
              <button class="save-btn" onClick={handleSave}>
                保存配置
              </button>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}
