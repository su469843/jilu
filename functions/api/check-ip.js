export async function onRequestGet(context) {
  try {
    const ip = context.request.headers.get('CF-Connecting-IP');
    if (!ip) {
      throw new Error('无法获取 IP 地址');
    }

    const { SUBMISSIONS } = context.env;
    if (!SUBMISSIONS) {
      throw new Error('KV 绑定未配置');
    }

    // 检查 IP 是否已提交
    const hasSubmitted = await SUBMISSIONS.get(ip);
    
    if (hasSubmitted) {
      return new Response(JSON.stringify({ 
        canSubmit: false,
        message: '此 IP 已经提交过记录' 
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return new Response(JSON.stringify({ 
      canSubmit: true,
      ip: ip // 添加 IP 用于调试
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