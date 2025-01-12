export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { token } = await request.json();
    const clientIP = request.headers.get('CF-Connecting-IP');

    // 验证 Turnstile token
    const verifyResult = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET_KEY,
          response: token,
          remoteip: clientIP,
          // 添加幂等性键
          idempotency_key: crypto.randomUUID()
        })
      }
    );

    const outcome = await verifyResult.json();

    if (!outcome.success) {
      const errorCodes = outcome['error-codes']?.join(', ');
      return new Response(
        JSON.stringify({
          success: false,
          error: `验证失败: ${errorCodes}`
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        details: {
          hostname: outcome.hostname,
          challenge_ts: outcome.challenge_ts,
          action: outcome.action
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
} 