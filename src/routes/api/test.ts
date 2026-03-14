import type { APIEvent } from '@solidjs/start/server';

export async function GET() {
  console.log('=== TEST 端点被调用 ===');
  return new Response('Test endpoint works!', {
    headers: { 'Content-Type': 'text/plain' }
  });
}

export async function POST({ request }: APIEvent) {
  console.log('=== TEST POST 端点被调用 ===');
  const body = await request.json();
  console.log('收到数据:', body);

  return new Response(JSON.stringify({ success: true, received: body }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
