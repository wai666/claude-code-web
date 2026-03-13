import { createSignal } from 'solid-js';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [input, setInput] = createSignal('');

  // 从 localStorage 读取配置，如果没有则使用默认值
  const getConfig = () => {
    return {
      apiKey: localStorage.getItem('ANTHROPIC_API_KEY') || 'sk-eIq3RrH420cw8qV5ujXfn05bEQ11YcTvT9xB0mamaM8RMlCO',
      baseUrl: localStorage.getItem('ANTHROPIC_BASE_URL') || 'https://codeflow.asia',
      proxy: localStorage.getItem('HTTP_PROXY') || 'http://127.0.0.1:7897',
      model: localStorage.getItem('model') || 'opus'
    };
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const text = input();

    alert('开始提交: ' + text);
    console.log('=== SUBMIT ===');
    console.log('Input value:', text);

    if (!text.trim()) return;

    // 添加用户消息
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    };
    setMessages(prev => [...prev, userMsg]);

    // 清空输入
    setInput('');

    // 调用真实 API
    try {
      const config = getConfig();

      const response = await fetch('/api/chat-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages(), userMsg],
          model: config.model,
          config: {
            apiKey: config.apiKey,
            baseUrl: config.baseUrl,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`API 错误: ${response.status}`);
      }

      // 添加助手消息占位
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ''
      };
      setMessages(prev => [...prev, assistantMsg]);

      // 读取流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let content = '';
      let buffer = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        console.log('收到数据块:', buffer);

        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留不完整的行

        for (const line of lines) {
          if (!line.trim()) continue;
          console.log('处理行:', line);

          // Vercel AI SDK 格式: 0:"text" 或 2:[tool_call]
          if (line.startsWith('0:')) {
            try {
              const jsonStr = line.slice(2);
              const text = JSON.parse(jsonStr);
              console.log('解析文本:', text);
              content += text;

              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1].content = content;
                return updated;
              });
            } catch (e) {
              console.error('解析错误:', e, '原始行:', line);
            }
          }
        }
      }
    } catch (error) {
      console.error('API 调用失败:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ 错误: ${error instanceof Error ? error.message : '未知错误'}\n\n请检查:\n- API Key 是否配置\n- 网络连接是否正常`
      }]);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0a0a0a',
      color: '#0f0',
      display: 'flex',
      'flex-direction': 'column',
      'font-family': 'monospace'
    }}>
      {/* 标题 */}
      <div style={{
        padding: '20px',
        'border-bottom': '2px solid #0f0',
        'font-size': '24px',
        'text-align': 'center'
      }}>
        CLAUDE CODE - 简化版
      </div>

      {/* 消息区域 */}
      <div style={{
        flex: 1,
        'overflow-y': 'auto',
        padding: '20px'
      }}>
        {messages().map(msg => (
          <div style={{
            'margin-bottom': '15px',
            padding: '10px',
            background: msg.role === 'user' ? 'rgba(0,255,65,0.1)' : 'rgba(0,217,255,0.1)',
            border: `1px solid ${msg.role === 'user' ? '#0f0' : '#0df'}`,
            'border-radius': '4px'
          }}>
            <div style={{ 'font-weight': 'bold', 'margin-bottom': '5px' }}>
              {msg.role === 'user' ? '> USER' : '< ASSISTANT'}
            </div>
            <div>{msg.content}</div>
          </div>
        ))}
      </div>

      {/* 输入区域 */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '10px',
          padding: '20px',
          'border-top': '2px solid #0f0'
        }}
      >
        <input
          type="text"
          value={input()}
          onInput={(e) => setInput(e.currentTarget.value)}
          placeholder="输入消息..."
          style={{
            flex: 1,
            padding: '12px',
            background: '#222',
            color: '#0f0',
            border: '1px solid #0f0',
            'font-size': '14px',
            'font-family': 'monospace'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 30px',
            background: '#0f0',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
            'font-weight': 'bold',
            'font-size': '14px'
          }}
        >
          发送
        </button>
      </form>
    </div>
  );
}
