import { For, createSignal, createEffect, onMount, Show } from 'solid-js';
import SimpleInput from './SimpleInput';
import { processManager } from '~/lib/process-manager';
import { errorRecoverySystem } from '~/lib/error-recovery';
import './Terminal-enhanced.css';

type Model = 'opus' | 'sonnet';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Terminal() {
  const [model, setModel] = createSignal<Model>('opus');
  const [commandMode, setCommandMode] = createSignal(false);
  const [runningProcesses, setRunningProcesses] = createSignal<string[]>([]);
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [autoRecoveryEnabled, setAutoRecoveryEnabled] = createSignal(true);

  let terminalRef: HTMLDivElement | undefined;

  createEffect(() => {
    if (terminalRef) {
      terminalRef.scrollTop = terminalRef.scrollHeight;
    }
  });

  onMount(() => {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setCommandMode(prev => !prev);
      }
    });

    // 定期更新运行中的进程
    setInterval(() => {
      const processes = processManager.getRunningProcesses();
      setRunningProcesses(processes.map(p => p.id));
    }, 1000);

    // 注册错误恢复回调
    errorRecoverySystem.onErrorDetected((context) => {
      if (!autoRecoveryEnabled()) return;

      // 检查是否应该自动恢复
      if (!errorRecoverySystem.shouldAutoRecover(context)) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: '⚠️ 检测到重复错误，已停止自动恢复。请手动检查问题。',
        }]);
        return;
      }

      // 显示错误检测消息
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🔧 检测到错误，正在自动分析...\n\n错误摘要: ${context.error.slice(0, 150)}...`,
      }]);

      // 构建恢复提示词并自动发送
      const recoveryPrompt = errorRecoverySystem.buildRecoveryPrompt(context);
      handleSubmit(recoveryPrompt, '');
    });
  });

  const handleSubmit = async (text: string, context: string) => {
    console.log('=== handleSubmit DEBUG ===');
    console.log('text:', text);
    console.log('text type:', typeof text);
    console.log('text constructor:', text?.constructor?.name);
    console.log('context:', context);
    console.log('========================');

    // 如果 text 是 Event 对象，说明调用方式错误
    if (typeof text !== 'string') {
      console.error('ERROR: handleSubmit received non-string:', text);
      alert('错误：收到了非字符串参数。请查看控制台。');
      return;
    }

    const fullMessage = context
      ? `${context}\n\n用户问题: ${text}`
      : text;

    if (text.startsWith('/')) {
      handleCommand(text);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: fullMessage,
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages(), userMsg],
          model: model(),
        }),
      });

      if (!response.ok) throw new Error('API request failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };

      setMessages(prev => [...prev, assistantMsg]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantContent += parsed.content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1].content = assistantContent;
                  return updated;
                });
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ 错误: ${errorMsg}\n\n请检查:\n- API Key 是否正确\n- Base URL 是否可访问\n- 网络连接是否正常`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommand = (cmd: string) => {
    const command = cmd.toLowerCase();

    if (command === '/clear') {
      setMessages([]);
    } else if (command === '/opus') {
      setModel('opus');
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '✓ 已切换到 Claude Opus 4.6',
      }]);
    } else if (command === '/sonnet') {
      setModel('sonnet');
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '✓ 已切换到 Claude Sonnet 4.6',
      }]);
    } else if (command === '/ps') {
      const processes = processManager.getRunningProcesses();
      const list = processes.length > 0
        ? processes.map(p => `- ${p.id}: ${p.command}`).join('\n')
        : '无运行中的进程';
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `运行中的进程:\n${list}`,
      }]);
    } else if (command === '/autofix') {
      setAutoRecoveryEnabled(prev => !prev);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🔧 自动错误恢复: ${autoRecoveryEnabled() ? '已启用' : '已禁用'}`,
      }]);
    } else if (command === '/errors') {
      const history = errorRecoverySystem.getErrorHistory();
      const list = history.length > 0
        ? history.map((e, i) => `${i + 1}. ${new Date(e.timestamp).toLocaleTimeString()}: ${e.error.slice(0, 100)}...`).join('\n')
        : '无错误历史';
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `错误历史:\n${list}`,
      }]);
    } else {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `未知命令: ${cmd}\n\n可用命令:\n/clear - 清空对话\n/opus - 切换到 Opus\n/sonnet - 切换到 Sonnet\n/ps - 查看进程\n/autofix - 切换自动错误恢复\n/errors - 查看错误历史`,
      }]);
    }
  };

  return (
    <div class="terminal-container">
      <div class="terminal-header">
        <div class="terminal-title">NEURAL_INTERFACE://CHAT</div>
        <div class="terminal-controls">
          <span class="model-indicator">{model().toUpperCase()}</span>
          <Show when={autoRecoveryEnabled()}>
            <span class="autofix-indicator pulse" title="自动错误恢复已启用">
              🔧 AUTO
            </span>
          </Show>
          <Show when={runningProcesses().length > 0}>
            <span class="process-indicator pulse">
              {runningProcesses().length} PROC
            </span>
          </Show>
        </div>
      </div>

      <div class="terminal-messages" ref={terminalRef}>
        <For each={messages()}>
          {(msg) => (
            <div class={`message ${msg.role}`}>
              <div class="message-role">
                {msg.role === 'user' ? '> USER' : '< ASSISTANT'}
              </div>
              <div class="message-content">{msg.content}</div>
            </div>
          )}
        </For>

        <Show when={isLoading()}>
          <div class="message assistant">
            <div class="message-role">{'< ASSISTANT'}</div>
            <div class="message-content loading">
              <span class="loading-dot">.</span>
              <span class="loading-dot">.</span>
              <span class="loading-dot">.</span>
            </div>
          </div>
        </Show>
      </div>

      <SimpleInput onSubmit={(text) => handleSubmit(text, '')} />

      <Show when={commandMode()}>
        <div class="command-palette">
          <div class="command-title">COMMAND_PALETTE</div>
          <div class="command-list">
            <div class="command-item">/clear - 清空对话</div>
            <div class="command-item">/opus - 切换到 Opus</div>
            <div class="command-item">/sonnet - 切换到 Sonnet</div>
            <div class="command-item">/ps - 查看进程</div>
            <div class="command-item">/autofix - 切换自动错误恢复</div>
            <div class="command-item">/errors - 查看错误历史</div>
          </div>
        </div>
      </Show>
    </div>
  );
}
