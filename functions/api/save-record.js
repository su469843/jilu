export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { formData } = await request.json();
    const clientIP = request.headers.get('CF-Connecting-IP');

    // 保存记录到数据库
    const result = await env.DB.prepare(
      `INSERT INTO submissions (name, number, phone, interests, dreams, content, ip) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      formData.name,
      formData.number,
      formData.phone || '',
      formData.interests,
      formData.dreams,
      formData.content || '',
      clientIP
    ).run();

    // 记录 IP
    await env.IP_DB.prepare(
      'INSERT INTO ip_records (ip) VALUES (?)'
    ).bind(clientIP).run();

    return new Response(JSON.stringify({
      success: true,
      id: result.lastRowId
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
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