export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Name, email, and message are required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const mailPayload = {
      personalizations: [
        {
          to: [{ email: "support@keyverse.me", name: "KeyVerse Support" }],
        },
      ],
      from: {
        email: "support@keyverse.me",
        name: `${name} (via KeyVerse Contact)`,
      },
      reply_to: { email, name },
      subject: `[KeyVerse Feedback] ${subject || "No subject"}`,
      content: [
        {
          type: "text/plain",
          value: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || "N/A"}\n\nMessage:\n${message}`,
        },
      ],
    };

    const res = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(mailPayload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("MailChannels error:", res.status, text);
      return new Response(JSON.stringify({ error: `MailChannels error (${res.status}): ${text}` }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error("Contact API error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
