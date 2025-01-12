export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const clientIP = request.headers.get('CF-Connecting-IP');

    // 检查 IP 提交次数
    const ipCount = await env.IP_DB.prepare(
      'SELECT COUNT(*) as count FROM submissions WHERE ip = ?'
    ).bind(clientIP).first();

    return new Response(JSON.stringify({
      allowed: ipCount.count < 2,
      submissions: ipCount.count
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      allowed: false
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}