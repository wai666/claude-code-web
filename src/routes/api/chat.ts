import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import type { APIEvent } from '@solidjs/start/server';
import { claudeMDLoader } from '~/lib/claude-md-loader';
import { webcontainer } from '~/lib/webcontainer';
import { processManager } from '~/lib/process-manager';

// 初始化时加载 CLAUDE.md
await claudeMDLoader.loadFromPath('/CLAUDE.md');

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

  // 使用 CLAUDE.md 作为系统提示词
  const systemPrompt = claudeMDLoader.getSystemPrompt();

  const result = await streamText({
    model: anthropic(modelId),
    messages,
    system: systemPrompt,
    tools: {
      readFile: tool({
        description: 'Read a file from the filesystem',
        parameters: z.object({
          path: z.string().describe('File path'),
        }),
        execute: async ({ path }) => {
          try {
            const content = await webcontainer.readFile(path);
            return { success: true, content };
          } catch (error) {
            return { success: false, error: String(error) };
          }
        },
      }),

      writeFile: tool({
        description: 'Write content to a file',
        parameters: z.object({
          path: z.string().describe('File path'),
          content: z.string().describe('File content'),
        }),
        execute: async ({ path, content }) => {
          try {
            await webcontainer.writeFile(path, content);
            webcontainer.notifyFileChange(path);
            return { success: true };
          } catch (error) {
            return { success: false, error: String(error) };
          }
        },
      }),

      executeCode: tool({
        description: 'Execute code in WebContainer',
        parameters: z.object({
          command: z.string().describe('Command to execute'),
          args: z.array(z.string()).optional().describe('Command arguments'),
        }),
        execute: async ({ command, args = [] }) => {
          try {
            const container = await webcontainer.getInstance();
            const processId = await processManager.spawn(
              container,
              command,
              args
            );

            // 等待进程完成（简化版）
            const process = processManager.getProcess(processId);
            return {
              success: true,
              processId,
              output: process?.output.join('\n') || '',
            };
          } catch (error) {
            return { success: false, error: String(error) };
          }
        },
      }),

      killProcess: tool({
        description: 'Kill a running process',
        parameters: z.object({
          processId: z.string().describe('Process ID to kill'),
        }),
        execute: async ({ processId }) => {
          const success = await processManager.kill(processId, 'SIGINT');
          return { success };
        },
      }),

      listFiles: tool({
        description: 'List files in a directory',
        parameters: z.object({
          path: z.string().describe('Directory path'),
        }),
        execute: async ({ path }) => {
          try {
            const files = await webcontainer.readdir(path);
            return { success: true, files };
          } catch (error) {
            return { success: false, error: String(error) };
          }
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
