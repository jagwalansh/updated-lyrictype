import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { AnimatePresence, motion } from "motion/react";
import { Mail, Github, Loader2, Send, CheckCircle, AlertCircle, X, ArrowLeft } from "lucide-react";
import { DeflectCard } from "@/components/ui/deflect-card";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

function ContactModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setSending(false);
      setStatus("idle");
      setErrorMessage("");
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to send");
      }

      setStatus("success");
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to send");
      setStatus("error");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border/40 bg-background/80 backdrop-blur-md p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-semibold tracking-tight">
                Send a Message
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                Have a bug or feedback? Send us a message and we'll get back to you.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent h-8 w-8 shrink-0">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="contact-subject">Subject (optional)</label>
              <input
                id="contact-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending || status === "success"}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {sending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
              ) : status === "success" ? (
                <><CheckCircle className="h-4 w-4" /> Sent!</>
              ) : (
                <><Send className="h-4 w-4" /> Send Message</>
              )}
            </button>

            <AnimatePresence>
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="relative overflow-hidden rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-4 py-3"
                >
                  <div className="relative h-12">
                    <motion.div
                      initial={{ x: -28, y: 20, rotate: -18, opacity: 0 }}
                      animate={{ x: 230, y: -10, rotate: -4, opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                      className="absolute left-0 top-0 text-emerald-500"
                    >
                      <Send className="h-7 w-7" />
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.75, type: "spring", stiffness: 260, damping: 16 }}
                      className="absolute inset-0 flex items-center justify-center text-emerald-500"
                    >
                      <CheckCircle className="h-9 w-9" />
                    </motion.div>
                  </div>
                  <p className="text-center text-sm font-medium text-emerald-600">
                    Message sent successfully.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {status === "error" && (
              <p className="flex items-center gap-1.5 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" /> {errorMessage || "Failed to send."} Try emailing support@keyverse.me directly.
              </p>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const Route = createFileRoute("/support")({
  component: Support,
});

function Support() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <main className="flex flex-col justify-start items-center min-h-screen bg-background text-foreground font-sans relative">
      <Navbar />

      <div className="w-full max-w-5xl mx-auto px-6 py-28 flex flex-col gap-10 flex-1 justify-start relative z-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-border/20 pb-6 text-left">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold tracking-wider uppercase mb-1">
              Contact
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Bug Reports & Feedback
            </h1>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xl">
              Found an issue or have an idea? Send us a message or open a GitHub issue.
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 self-start shrink-0 px-4 py-2 text-xs font-mono font-semibold border border-border/40 hover:border-primary/50 bg-card/45 backdrop-blur-sm hover:bg-muted/60 text-muted-foreground hover:text-foreground rounded-lg transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-10 mt-2">

          {/* Card 1: Bug Reports & Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.25 }}
            className="w-full h-full"
          >
            <DeflectCard
              className="w-full h-full"
              cardClassName="group relative p-10 rounded-2xl border border-border/40 bg-card/45 backdrop-blur-sm hover:border-primary/30 transition-all duration-150 flex flex-col justify-between h-full min-h-[320px] text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350 pointer-events-none rounded-2xl" />

              <div className="relative z-10 text-left ">
                <h2 className="font-mono text-lg font-bold tracking-wide text-foreground">
                  Report a Bug & Feedback
                </h2>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  Found a mistake in the lyric sync? Or did the player fail to load a video? We are constantly improving KeyVerse and would love to hear from you.
                </p>
              </div>

              <div className="relative z-10 flex flex-col gap-3 mt-5 mb-4">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setContactOpen(true)}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/20 bg-background/30 hover:bg-background/80 transition-colors text-foreground text-left"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-xs font-mono font-medium">Send a Message</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">support@keyverse.me &rarr;</span>
                </motion.button>
                <motion.a
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  href="https://github.com/jagwalansh/updated-lyrictype/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl border border-border/20 bg-background/30 hover:bg-background/80 transition-colors text-foreground"
                >
                  <div className="flex items-center gap-3">
                    <Github className="h-4 w-4 text-primary" />
                    <span className="text-xs font-mono font-medium">Open a GitHub Issue</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">Submit Ticket &rarr;</span>
                </motion.a>
              </div>
            </DeflectCard>
          </motion.div>
        </div>
      </div>

      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
      <Footer />
    </main>
  );
}
