export type ContactEnv = {
  CONTACT_EMAIL?: {
    send: (message: unknown) => Promise<void>;
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

function asHeader(value: unknown): string {
  return asString(value)?.replace(/[\r\n]+/g, " ") ?? "";
}

export async function POST(req: Request, env: ContactEnv = {}) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return jsonResponse({ error: "Name, email, and message are required" }, 400);
    }

    if (!env.CONTACT_EMAIL) {
      const hostname = new URL(req.url).hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        console.info("Contact form local preview:", { name, email, subject, message });
        return jsonResponse({ success: true, delivered: false }, 200);
      }

      console.error("Contact API is missing CONTACT_EMAIL binding");
      return jsonResponse({ error: "Contact form email provider is not configured yet." }, 503);
    }

    const toEmail = asString(env.CONTACT_TO_EMAIL) ?? "anshjagwal02@gmail.com";
    const fromEmail = asString(env.CONTACT_FROM_EMAIL) ?? "support@keyverse.me";

    const safeName = asHeader(name);
    const safeEmail = asHeader(email);
    const safeSubject = asHeader(subject) || "No subject";
    const rawEmail = [
      `From: KeyVerse Contact <${fromEmail}>`,
      `To: KeyVerse Support <${toEmail}>`,
      `Reply-To: ${safeName} <${safeEmail}>`,
      `Subject: [KeyVerse Feedback] ${safeSubject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "",
      `Name: ${safeName}`,
      `Email: ${safeEmail}`,
      `Subject: ${safeSubject}`,
      "",
      "Message:",
      String(message),
    ].join("\r\n");

    const { EmailMessage } = await import("cloudflare:email");
    await env.CONTACT_EMAIL.send(new EmailMessage(fromEmail, toEmail, rawEmail));

    return jsonResponse({ success: true, delivered: true }, 200);
  } catch (err) {
    console.error("Contact API error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
