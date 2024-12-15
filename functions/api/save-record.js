export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const record = await request.json();

    // 检查数据库连接
    if (!env.DB) {
      throw new Error('数据库未连接');
    }

    // 插入记录到 D1 数据库
    const stmt = env.DB.prepare(
      `INSERT INTO jilu (名字, 号数, 梦想, 兴趣爱好, 备注) 
       VALUES (?, ?, ?, ?, ?)`
    );

    const result = await stmt.bind(
      record.name,
      record.number,
      record.dreams,
      record.interests,
      record.content || ''
    ).run();

    console.log('Insert result:', result);

    // 记录 IP（如果不是管理员）
    if (!record.isAdmin) {
      const ip = request.headers.get('CF-Connecting-IP');
      if (ip && env.SUBMISSIONS) {
        const submissionData = await env.SUBMISSIONS.get(ip, { type: "json" });
        const currentCount = submissionData ? submissionData.count : 0;
        await env.SUBMISSIONS.put(ip, JSON.stringify({
          count: currentCount + 1,
          lastSubmission: new Date().toISOString()
        }), { 
          expirationTtl: 365 * 24 * 60 * 60 
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: '记录已保存'
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Save record error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || '保存记录失败'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 