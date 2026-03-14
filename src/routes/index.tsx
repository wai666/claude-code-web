import { createSignal } from 'solid-js';

// 禁用此页面的 SSR
export const ssr = false;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [input, setInput] = createSignal('');

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const text = input();
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const response = await fetch('/api/chat-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages(), userMsg],
          model: 'sonnet',
        }),
      });

      if (!response.ok) throw new Error('API error');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let content = '';
      let buffer = '';

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ''
      };
      setMessages(prev => [...prev, assistantMsg]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('0:')) continue;
          try {
            const text = JSON.parse(line.slice(2));
            content += text;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1].content = content;
              return updated;
            });
          } catch (e) {}
        }
      }
    } catch (error) {
      console.error('Error:', error);
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
      'font-family': 'monospace',
      padding: '0',
      margin: '0',
      'box-sizing': 'border-box'
    }}>
      <div style={{
        padding: '20px',
        'border-bottom': '2px solid #0f0',
        'text-align': 'center'
      }}>
        <h1 style={{ margin: '0' }}>Claude Code Web</h1>
      </div>

      <div style={{
        flex: '1',
        'overflow-y': 'auto',
        padding: '20px',
        'min-height': '0'
      }}>
        {messages().map(msg => (
          <div style={{
            'margin-bottom': '10px',
            padding: '10px',
            background: msg.role === 'user' ? '#1a1a1a' : '#0a2a0a',
            'border-left': `3px solid ${msg.role === 'user' ? '#0f0' : '#0df'}`
          }}>
            <div style={{ 'font-weight': 'bold', 'margin-bottom': '5px' }}>
              {msg.role === 'user' ? '> USER' : '< ASSISTANT'}
            </div>
            <div style={{ 'white-space': 'pre-wrap' }}>{msg.content}</div>
          </div>
        ))}
      </div>

      <div style={{
        padding: '20px',
        'border-top': '2px solid #0f0'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input()}
          onInput={(e) => setInput(e.currentTarget.value)}
          placeholder="输入消息..."
          style={{
            flex: 1,
            padding: '10px',
            background: '#1a1a1a',
            color: '#0f0',
            border: '1px solid #0f0',
            'font-family': 'monospace'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            background: '#0f0',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
            'font-weight': 'bold'
          }}
        >
          发送
        </button>
      </form>
      </div>
    </div>
  );
}
