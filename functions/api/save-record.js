export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const record = await request.json();

    // 使用 jilu 表名
    const stmt = env.DB.prepare(
      `INSERT INTO jilu (名字, 号数, 梦想, 兴趣爱好, 备注) 
       VALUES (?, ?, ?, ?, ?)`
    );

    await stmt.bind(
      record.name,
      record.number,
      record.dreams,
      record.interests,
      record.content || ''
    ).run();

    // 记录 IP（如果不是管理员）
    if (!record.isAdmin) {
      const ip = request.headers.get('CF-Connecting-IP');
      if (ip) {
        await env.SUBMISSIONS.put(ip, 'submitted', { 
          expirationTtl: 365 * 24 * 60 * 60 
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Save to D1 error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
} 