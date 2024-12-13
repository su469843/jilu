export async function onRequestPost(context) {
  try {
    const { request } = context;
    const data = await request.json();

    // 使用 fetch 直接发送到 SMTP 服务器
    const response = await fetch("https://smtphz.qiye.163.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${context.env.SMTP_USER}:${context.env.SMTP_PASSWORD}`)}`,
      },
      body: JSON.stringify({
        from: context.env.SMTP_USER,
        to: "su@2020classes4.us.kg",
        subject: data.subject,
        text: data.text
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Send email error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 