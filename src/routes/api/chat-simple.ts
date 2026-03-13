import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import type { APIEvent } from '@solidjs/start/server';

export async function POST({ request }: APIEvent) {
  const { messages, model = 'opus', config } = await request.json();

  // 使用传入的配置或环境变量
  const apiKey = config?.apiKey || process.env.ANTHROPIC_AUTH_TOKEN || 'sk-eIq3RrH420cw8qV5ujXfn05bEQ11YcTvT9xB0mamaM8RMlCO';
  const baseURL = config?.baseUrl || process.env.ANTHROPIC_BASE_URL || 'https://codeflow.asia';

  // 创建自定义 Anthropic 客户端
  const anthropic = createAnthropic({
    apiKey,
    baseURL,
  });

  const modelId = model === 'opus'
    ? 'claude-opus-4-6'
    : 'claude-sonnet-4-6';

  // 简化版：不使用 tools，直接返回文本
  const result = await streamText({
    model: anthropic(modelId),
    messages,
    system: '你是一个有帮助的 AI 助手。',
  });

  return result.toDataStreamResponse();
}
