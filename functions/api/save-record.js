export async function onRequestPost(context) {
  try {
    const { request } = context;
    const record = await request.json();
    const { env } = context;

    // 生成唯一的键名
    const key = `record_${record.name}_${record.id}`;

    // 保存记录到 jilu KV
    await env.jilu.put(key, JSON.stringify(record));

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 