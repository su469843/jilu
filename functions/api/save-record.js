export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const record = await request.json();
    const ip = request.headers.get('CF-Connecting-IP');

    // 检查主数据库连接
    if (!env.DB) {
      throw new Error('主数据库未连接');
    }

    // 验证必填字段
    if (!record.name || !record.number || !record.dreams || !record.interests) {
      throw new Error('缺少必填字段');
    }

    // 记录调试信息
    console.log('Request IP:', ip);
    console.log('Record data:', record);

    let mainRecordSaved = false;
    let ipRecordSaved = false;

    try {
      // 保存主记录
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

      console.log('Main record saved:', result);
      mainRecordSaved = true;

      // 尝试记录 IP（如果有 IP_DB）
      if (ip && env.IP_DB) {
        try {
          const now = new Date();
          const currentTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

          // 查询现有 IP 记录
          const existingRecord = await env.IP_DB.prepare(
            `SELECT * FROM ip1 WHERE IP地址 = ?`
          ).bind(ip).first();

          if (existingRecord) {
            // 更新现有记录
            await env.IP_DB.prepare(
              `UPDATE ip1 
               SET 次数 = 次数 + 1, 
                   时间 = ? 
               WHERE IP地址 = ?`
            ).bind(
              existingRecord.时间 + ',' + currentTime,
              ip
            ).run();
          } else {
            // 创建新记录
            await env.IP_DB.prepare(
              `INSERT INTO ip1 (IP地址, 号数, 次数, 时间) 
               VALUES (?, ?, ?, ?)`
            ).bind(
              ip,
              record.number,
              1,
              currentTime
            ).run();
          }
          ipRecordSaved = true;
        } catch (ipError) {
          console.error('IP record error:', ipError);
          // IP 记录失败不影响主记录
        }
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: '记录已保存',
        details: {
          mainRecordSaved,
          ipRecordSaved
        }
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
      error: error.message || '保存记录失败',
      details: {
        stack: error.stack,
        timestamp: new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'}),
        mainRecordSaved,
        ipRecordSaved
      }
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 