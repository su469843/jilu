export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const record = await request.json();
    const ip = request.headers.get('CF-Connecting-IP');
    const country = request.headers.get('CF-IPCountry') || 'Unknown';

    // 添加调试日志
    console.log('Headers:', Object.fromEntries(request.headers));
    console.log('IP:', ip);
    console.log('Country:', country);

    let mainRecordSaved = false;
    let ipRecordSaved = false;

    try {
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
      mainRecordSaved = true;

      // 记录 IP
      if (ip && env.IP_DB) {
        try {
          const now = new Date();
          const currentTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

          // 查询现有 IP 记录
          const existingRecord = await env.IP_DB.prepare(
            `SELECT * FROM ip1 WHERE IP地址 = ?`
          ).bind(ip).first();

          if (existingRecord) {
            await env.IP_DB.prepare(
              `UPDATE ip1 
               SET 地区 = ?,
                   时间 = ?,
                   IP地址 = ?,
                   号数 = ?,
                   次数 = 次数 + 1
               WHERE IP地址 = ?`
            ).bind(
              country,
              existingRecord.时间 + ',' + currentTime,
              ip,
              record.number,
              ip
            ).run();
          } else {
            await env.IP_DB.prepare(
              `INSERT INTO ip1 (地区, 时间, IP地址, 号数, 次数) 
               VALUES (?, ?, ?, ?, ?)`
            ).bind(
              country,
              currentTime,
              ip,
              record.number,
              1
            ).run();
          }
          ipRecordSaved = true;
        } catch (ipError) {
          console.error('IP record error:', ipError);
          ipRecordSaved = false;
        }
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: '记录已保存',
        details: {
          mainRecordSaved,
          ipRecordSaved,
          location: country
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
      success: false,
      error: error.message || '保存记录失败',
      details: {
        mainRecordSaved,
        ipRecordSaved,
        timestamp: new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})
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