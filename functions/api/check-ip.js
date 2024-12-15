export async function onRequestGet(context) {
  try {
    const ip = context.request.headers.get('CF-Connecting-IP');
    if (!ip) {
      throw new Error('无法获取 IP 地址');
    }

    const { IP_DB } = context.env;
    if (!IP_DB) {
      throw new Error('IP 数据库未连接');
    }

    // 查询 IP 提交次数
    const stmt = IP_DB.prepare(
      `SELECT COUNT(*) as count FROM ip1 WHERE IP地址 = ?`
    );
    const result = await stmt.bind(ip).first();
    const submissionCount = result ? result.count : 0;
    
    return new Response(JSON.stringify({ 
      canSubmit: submissionCount < 2,
      submissionCount: submissionCount,
      message: submissionCount >= 2 ? '已达到最大提交次数' : `还可以提交 ${2 - submissionCount} 次`
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('IP check error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      canSubmit: false 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 