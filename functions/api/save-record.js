export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { formData } = await request.json();
    const clientIP = request.headers.get('CF-Connecting-IP');

    // 检查 IP 提交次数
    const ipCount = await env.IP_DB.prepare(
      'SELECT COUNT(*) as count FROM submissions WHERE ip = ?'
    ).bind(clientIP).first();

    if (ipCount.count >= 2) {
      return new Response(JSON.stringify({
        error: 'IP 提交次数超限'
      }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 保存记录
    await env.DB.prepare(`
      INSERT INTO submissions (name, number, phone, interests, dreams, content, ip, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      formData.name,
      formData.number,
      formData.phone || null,
      formData.interests,
      formData.dreams,
      formData.content || null,
      clientIP
    ).run();

    // 更新 IP 记录
    await env.IP_DB.prepare(`
      INSERT INTO submissions (ip, created_at)
      VALUES (?, datetime('now'))
    `).bind(clientIP).run();

    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 