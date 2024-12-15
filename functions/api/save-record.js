export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const record = await request.json();
    const ip = request.headers.get('CF-Connecting-IP');

    // 检查数据库连接
    if (!env.DB || !env.IP_DB) {
      throw new Error('数据库未连接');
    }

    console.log('Saving record:', record); // 调试日志

    try {
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

      console.log('Record saved to jilu:', result); // 调试日志
    } catch (dbError) {
      console.error('Error saving to jilu:', dbError);
      throw new Error(`保存记录失败: ${dbError.message}`);
    }

    // 记录 IP
    if (ip) {
      try {
        const currentTime = new Date().toLocaleString('zh-CN', {
          timeZone: 'Asia/Shanghai',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).replace(/\//g, '-');

        // 查询现有记录
        const existingStmt = env.IP_DB.prepare(
          `SELECT * FROM ip1 WHERE IP地址 = ?`
        );
        const existingRecord = await existingStmt.bind(ip).first();

        if (existingRecord) {
          // 更新现有记录
          const updatedTime = existingRecord.时间 + ',' + currentTime;
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
             VALUES (?, ?, ?, ?)`
          );
          await ipStmt.bind(ip, record.number, 1, currentTime).run();
        }

        console.log('IP record saved'); // 调试日志
      } catch (ipError) {
        console.error('Error saving IP:', ipError);
        // IP 记录失败不影响主记录
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
      error: error.message || '保存记录失败',
      details: error.stack // 添加错误堆栈信息
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 