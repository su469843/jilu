export async function onRequestGet(context) {
  const ip = context.request.headers.get('CF-Connecting-IP');
  const { env } = context;

  try {
    // 检查 IP 是否已提交
    const hasSubmitted = await env.SUBMISSIONS.get(ip);
    
    if (hasSubmitted) {
      return new Response(JSON.stringify({ canSubmit: false }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 记录新的 IP
    await env.SUBMISSIONS.put(ip, 'submitted', { expirationTtl: 365 * 24 * 60 * 60 }); // 一年过期

    return new Response(JSON.stringify({ canSubmit: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 