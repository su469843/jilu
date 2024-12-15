export async function onRequestGet(context) {
  try {
    const ip = context.request.headers.get('CF-Connecting-IP');
    if (!ip) {
      throw new Error('无法获取 IP 地址');
    }

    const { SUBMISSIONS } = context.env;
    if (!SUBMISSIONS) {
      return new Response(JSON.stringify({ 
        canSubmit: true,
        submissionCount: 0,
        message: 'KV 未配置，暂时允许提交'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 检查 IP 提交次数
    const submissionData = await SUBMISSIONS.get(ip, { type: "json" });
    const submissionCount = submissionData ? submissionData.count : 0;
    
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
      canSubmit: true,
      submissionCount: 0,
      error: error.message
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 