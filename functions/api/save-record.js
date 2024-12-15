export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const record = await request.json();
    const ip = request.headers.get('CF-Connecting-IP');

    // 检查数据库连接
    if (!env.DB || !env.IP_DB) {
      throw new Error('数据库未连接');
    }

    // 插入记录到 D1 数据库
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

    // 记录 IP（包括管理员）
    if (ip) {
      // 查询当前 IP 记录
      const existingStmt = env.IP_DB.prepare(
        `SELECT * FROM ip1 WHERE IP地址 = ?`
      );
      const existingRecord = await existingStmt.bind(ip).first();

      if (existingRecord) {
        // 更新现有记录，添加新时间
        const newTime = new Date().toISOString();
        const updatedTime = existingRecord.时间 + ',' + newTime;
        
        const updateStmt = env.IP_DB.prepare(
          `UPDATE ip1 
           SET 次数 = 次数 + 1, 
               时间 = ? 
           WHERE IP地址 = ?`
        );
        await updateStmt.bind(updatedTime, ip).run();
      } else {
        // 创建新记录
        const ipStmt = env.IP_DB.prepare(
          `INSERT INTO ip1 (IP地址, 号数, 次数, 时间) 
           VALUES (?, ?, ?, datetime('now'))`
        );
        await ipStmt.bind(
          ip,
          record.number,
          1
        ).run();
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