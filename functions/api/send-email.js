export async function onRequestPost(context) {
  try {
    const { request } = context;
    const data = await request.json();

    const emailContent = {
      personalizations: [{
        to: [{ email: "su@one-mail.us.kg" }]
      }],
      from: { email: "su@one-mail.us.kg" },
      subject: data.subject,
      content: [{
        type: "text/plain",
        value: data.text
      }]
    };

    const response = await fetch("https://smtphz.qiye.163.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`su@one-mail.us.kg:YOUR_PASSWORD`)}`,
      },
      body: JSON.stringify(emailContent)
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

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