export async function onRequestPost(context) {
  try {
    // 获取请求信息和环境变量
    const { request, env } = context;
    const record = await request.json();
    
    // 获取 IP 和地理位置信息
    const ip = request.headers.get('CF-Connecting-IP');
    const country = request.headers.get('CF-IPCountry') || 'Unknown';

    // 初始化保存状态标志
    let mainRecordSaved = false;
    let ipRecordSaved = false;

    try {
      // 步骤1: 保存主记录到 jilu 表
      const stmt = env.DB.prepare(
        `INSERT INTO jilu (名字, 号数, 梦想, 兴趣爱好, 备注) 
         VALUES (?, ?, ?, ?, ?)`
      );

      await stmt.bind(
        record.name,
        record.number,
        record.dreams,
        record.interests,
        record.content || ''  // 如果备注为空，使用空字符串
      ).run();
      mainRecordSaved = true;

      // 步骤2: 记录 IP 信息
      if (ip && env.IP_DB) {
        try {
          // 生成当前时间戳
          const now = new Date();
          const currentTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

          // 查询是否存在该 IP 的记录
          const existingRecord = await env.IP_DB.prepare(
            `SELECT * FROM ip1 WHERE IP地址 = ?`
          ).bind(ip).first();

          if (existingRecord) {
            // 步骤2.1: 更新现有 IP 记录
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
              existingRecord.时间 + ',' + currentTime,  // 追加新的时间记录
              ip,
              record.number,
              ip
            ).run();
          } else {
            // 步骤2.2: 创建新的 IP 记录
            await env.IP_DB.prepare(
              `INSERT INTO ip1 (地区, 时间, IP地址, 号数, 次数) 
               VALUES (?, ?, ?, ?, ?)`
            ).bind(
              country,
              currentTime,
              ip,
              record.number,
              1  // 首次访问，次数为1
            ).run();
          }
          ipRecordSaved = true;
        } catch (ipError) {
          // IP 记录失败不影响主记录的保存
          console.error('IP record error:', ipError);
          ipRecordSaved = false;
        }
      }

      // 步骤3: 返回成功响应
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
          'Access-Control-Allow-Origin': '*'  // 允许跨域访问
        }
      });

    } catch (dbError) {
      // 数据库操作错误处理
      console.error('Database error:', dbError);
      throw new Error(`数据库操作失败：${dbError.message}`);
    }

  } catch (error) {
    // 全局错误处理
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