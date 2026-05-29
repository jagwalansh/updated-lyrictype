type ContactEnv = {
  MAILCHANNELS_API_KEY?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_TO_EMAIL?: string;
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function POST(req: Request, env: ContactEnv = {}) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return jsonResponse({ error: "Name, email, and message are required" }, 400);
    }

    const apiKey = asString(env.MAILCHANNELS_API_KEY);
    if (!apiKey) {
      console.error("Contact API is missing MAILCHANNELS_API_KEY");
      return jsonResponse({ error: "Contact form email provider is not configured yet." }, 503);
    }

    const toEmail = asString(env.CONTACT_TO_EMAIL) ?? "support@keyverse.me";
    const fromEmail = asString(env.CONTACT_FROM_EMAIL) ?? "support@keyverse.me";

    const mailPayload = {
      personalizations: [
        {
          to: [{ email: toEmail, name: "KeyVerse Support" }],
        },
      ],
      from: {
        email: fromEmail,
        name: "KeyVerse Contact",
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
      headers: {
        "content-type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(mailPayload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("MailChannels error:", res.status, text);
      return jsonResponse({ error: "Email provider rejected the message. Check MailChannels API key and Domain Lockdown DNS." }, 502);
    }

    return jsonResponse({ success: true }, 200);
  } catch (err) {
    console.error("Contact API error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
