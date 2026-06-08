import { createFileRoute, Link } from "@tanstack/react-router";
import { Footer } from "@/components/ui/footer";
import { Navbar } from "@/components/ui/navbar";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Github,
  Heart,
  Loader2,
  Mail,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { DeflectCard } from "@/components/ui/deflect-card";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Contact and Support | KeyVerse" },
      {
        name: "description",
        content: "Contact KeyVerse with feedback, questions, bug reports, or song suggestions.",
      },
    ],
    links: [{ rel: "canonical", href: "https://keyverse.me/support" }],
  }),
  component: Support,
});

type Status = "idle" | "sending" | "success" | "preview" | "error";

const PATREON_URL = "https://www.patreon.com/cw/playKeyverse";
const DISCORD_USERNAME = "nxxei";

function Support() {
  const [contactOpen, setContactOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [discordCopied, setDiscordCopied] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setContactOpen(open);
    if (!open) {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Your message could not be sent.");
      }

      setStatus(data?.delivered === false ? "preview" : "success");
      form.reset();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Your message could not be sent.");
      setStatus("error");
    }
  };

  const sent = status === "success" || status === "preview";

  const handleDiscordCopy = async () => {
    try {
      await navigator.clipboard.writeText(DISCORD_USERNAME);
      setDiscordCopied(true);
      window.setTimeout(() => setDiscordCopied(false), 1800);
    } catch {
      setErrorMessage(`Discord username: @${DISCORD_USERNAME}`);
      setStatus("error");
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-background font-sans text-foreground">
      <Navbar />

      <div className="relative z-20 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-28">
        <div className="flex flex-col gap-4 border-b border-border/20 pb-6 text-left md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-1 text-xs font-mono font-semibold uppercase tracking-wider text-primary">
              Contact
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Contact and Support</h1>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
              Questions, feedback, song suggestions, and bug reports are all welcome.
            </p>
          </div>
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 self-start rounded-lg border border-border/40 bg-card/45 px-4 py-2 text-xs font-mono font-semibold text-muted-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-muted/60 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
          className="h-full w-full"
        >
          <DeflectCard
            className="h-full w-full"
            cardClassName="group relative flex min-h-[320px] h-full flex-col justify-between rounded-2xl border border-border/40 bg-card/45 p-10 text-left backdrop-blur-sm transition-all duration-150 hover:border-primary/30"
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative z-10">
              <h2 className="font-mono text-lg font-bold tracking-wide">Contact and Support</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Found a mistake in the lyric sync? Or did the player fail to load a video? We are
                constantly improving KeyVerse and would love to hear from you.
              </p>
            </div>

            <div className="relative z-10 mt-5 flex flex-col gap-3">
              <SupportButton onClick={() => setContactOpen(true)}>
                <Mail className="h-4 w-4 text-primary" />
                <span>Send a Message</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  support@keyverse.me &rarr;
                </span>
              </SupportButton>
              <SupportLink href="https://github.com/jagwalansh/updated-lyrictype/issues">
                <Github className="h-4 w-4 text-primary" />
                <span>Open a GitHub Issue</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  Submit Ticket &rarr;
                </span>
              </SupportLink>
              <SupportButton onClick={handleDiscordCopy}>
                <MessageCircle className="h-4 w-4 text-primary" />
                <span>DM on Discord</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {discordCopied ? "Copied" : `@${DISCORD_USERNAME}`}
                </span>
              </SupportButton>
              <SupportLink href={PATREON_URL}>
                <Heart className="h-4 w-4 text-primary" />
                <span>Support on Patreon</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  Become a Patron &rarr;
                </span>
              </SupportLink>
            </div>
          </DeflectCard>
        </motion.div>
      </div>

      <Dialog.Root open={contactOpen} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border/40 bg-background/95 p-6 shadow-xl backdrop-blur-md duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="text-xl font-semibold tracking-tight">
                  Send a Message
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                  Tell us how we can help and we will get back to you.
                </Dialog.Description>
              </div>
              <Dialog.Close className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" name="name" autoComplete="name" required />
                <Field label="Email" name="email" type="email" autoComplete="email" required />
              </div>

              <div className="mt-5">
                <Field label="Subject" name="subject" />
              </div>

              <label className="mt-5 block">
                <span className="mb-2 block text-xs font-mono font-semibold">Message</span>
                <textarea
                  name="message"
                  rows={7}
                  required
                  placeholder="How can we help?"
                  className="w-full resize-none rounded-xl border border-input bg-background/35 px-3 py-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </label>

              <button
                type="submit"
                disabled={status === "sending" || sent}
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-70"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : sent ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {status === "preview" ? "Preview submitted" : "Message sent"}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send message
                  </>
                )}
              </button>

              {status === "error" && (
                <p className="mt-4 flex items-start gap-2 text-xs text-red-500">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {errorMessage} You can also email support@keyverse.me.
                </p>
              )}
              {status === "preview" && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Local preview received. No email is sent in local development.
                </p>
              )}
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Footer />
    </main>
  );
}

function SupportButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-border/20 bg-background/30 p-4 text-left text-xs font-mono font-medium transition-colors hover:bg-background/80"
    >
      {children}
    </motion.button>
  );
}

function SupportLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <motion.a
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-border/20 bg-background/30 p-4 text-xs font-mono font-medium transition-colors hover:bg-background/80"
    >
      {children}
    </motion.a>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-mono font-semibold">
        {label}
        {!required && (
          <span className="ml-1 font-sans font-normal text-muted-foreground">(optional)</span>
        )}
      </span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="h-11 w-full rounded-xl border border-input bg-background/35 px-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
