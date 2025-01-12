export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const record = await request.json();

    // 检查主数据库连接
    if (!env.DB) {
      throw new Error('主数据库未连接');
    }

    // 验证必填字段
    if (!record.name || !record.number || !record.dreams || !record.interests) {
      throw new Error('缺少必填字段');
    }

    try {
      // 添加调试日志
      console.log('Headers:', Object.fromEntries(request.headers));
      console.log('IP:', request.headers.get('CF-Connecting-IP'));
      console.log('Country:', request.headers.get('CF-IPCountry'));

      // 保存主记录
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

      return new Response(JSON.stringify({ 
        success: true,
        message: '记录已保存'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`数据库操作失败：${dbError.message}`);
    }

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