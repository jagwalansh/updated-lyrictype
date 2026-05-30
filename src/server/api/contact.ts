type ContactEnv = {
  CONTACT_EMAIL?: {
    send: (message: {
      from: string;
      to: string;
      subject: string;
      text: string;
      replyTo?: string;
    }) => Promise<void>;
  };
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

    if (!env.CONTACT_EMAIL) {
      console.error("Contact API is missing CONTACT_EMAIL binding");
      return jsonResponse({ error: "Contact form email provider is not configured yet." }, 503);
    }

    const toEmail = asString(env.CONTACT_TO_EMAIL) ?? "support@keyverse.me";
    const fromEmail = asString(env.CONTACT_FROM_EMAIL) ?? "support@keyverse.me";

    await env.CONTACT_EMAIL.send({
      from: fromEmail,
      to: toEmail,
      subject: `[KeyVerse Feedback] ${subject || "No subject"}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || "N/A"}\n\nMessage:\n${message}`,
      replyTo: email,
    });

    return jsonResponse({ success: true }, 200);
  } catch (err) {
    console.error("Contact API error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
