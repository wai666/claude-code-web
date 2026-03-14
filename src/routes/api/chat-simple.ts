import type { APIEvent } from '@solidjs/start/server';
import { ProxyAgent } from 'undici';

// 创建代理 agent
const proxyAgent = new ProxyAgent('http://127.0.0.1:7897');

export async function POST({ request }: APIEvent) {
  try {
    const { messages, model = 'sonnet', config } = await request.json();

    const apiKey = config?.apiKey || 'sk-eIq3RrH420cw8qV5ujXfn05bEQ11YcTvT9xB0mamaM8RMlCO';
    const baseURL = config?.baseUrl || 'https://codeflow.asia';

    // 强制使用 sonnet，因为 API Key 没有 opus 权限
    const modelId = 'claude-sonnet-4-6';

    // 直接调用 Anthropic API
    const response = await fetch(`${baseURL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model: modelId,
        max_tokens: 2000,
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
        system: '你是 Kiro，一个有帮助的 AI 编程助手。请始终用中文回复用户。',
        stream: true,
      }),
      // @ts-ignore
      dispatcher: proxyAgent,
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(`0:"API 错误: ${response.status} - ${error}"\n`, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // 转换 Anthropic 流格式到 Vercel AI SDK 格式
    const reader = response.body?.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        if (!reader) return controller.close();

        try {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.trim() || !line.startsWith('data: ')) continue;

              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                  // 转换为 Vercel AI SDK 格式: 0:"text"
                  controller.enqueue(encoder.encode(`0:${JSON.stringify(parsed.delta.text)}\n`));
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error: any) {
    return new Response(`0:"错误: ${error.message || String(error)}"\n`, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
