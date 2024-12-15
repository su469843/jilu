export async function onRequestGet(context) {
  const ip = context.request.headers.get('CF-Connecting-IP');
  const { env } = context;

  try {
    // 检查 IP 是否已提交
    const hasSubmitted = await env.SUBMISSIONS.get(ip);
    
    if (hasSubmitted) {
      return new Response(JSON.stringify({ 
        canSubmit: false,
        message: '此 IP 已经提交过记录' 
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate' // 更严格的缓存控制
        }
      });
    }

    // 记录新的 IP
    await env.SUBMISSIONS.put(ip, 'submitted', { 
      expirationTtl: 365 * 24 * 60 * 60 // 一年过期
    });

    return new Response(JSON.stringify({ canSubmit: true }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('IP check error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      canSubmit: false 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  }
} 