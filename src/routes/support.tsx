import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { motion } from "motion/react";
import { Mail, Github, MessageSquare } from "lucide-react";
import { DeflectCard } from "@/components/ui/deflect-card";

export const Route = createFileRoute("/support")({
  component: Support,
});

function Support() {
  return (
    <main className="flex flex-col justify-start items-center min-h-screen bg-background text-foreground font-sans relative">
      <Navbar />

      <div className="w-full max-w-4xl mx-auto px-6 py-28 flex flex-col gap-10 flex-1 justify-start relative z-20">
        {/* Header Section */}
        <div className="flex flex-col border-b border-border/20 pb-6 text-left">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold tracking-wider uppercase mb-1">
            Support Center
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Support & Feedback
          </h1>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xl">
            Have questions, encountered a bug, or want to support the project's growth? You can find all the resources to contact us or support development here.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
          
          {/* Card 1: Bug Reports & Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="group relative p-6 rounded-2xl border border-border/40 bg-card/45 backdrop-blur-sm hover:border-primary/30 transition-colors shadow-sm flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350 pointer-events-none rounded-2xl" />

            <div className="relative z-10 text-left">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h2 className="font-mono text-base font-bold tracking-wide text-foreground">
                Report a Bug & Feedback
              </h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Found a mistake in the lyric sync? Or did the player fail to load a video? We are constantly improving KeyVerse and would love to hear from you.
              </p>
            </div>

            <div className="relative z-10 flex flex-col gap-3 mt-8">
              {/* Email Link */}
              <a
                href="mailto:support@keyverse.me"
                className="flex items-center justify-between p-3 rounded-xl border border-border/20 bg-background/30 hover:bg-background/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-xs font-mono font-medium">Mail</span>
                </div>
                <span className="text-[10px] font-mono text-primary border-b border-primary/20">support@keyverse.me</span>
              </a>

              {/* GitHub Issues */}
              <a
                href="https://github.com/jagwalansh/updated-lyrictype/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-border/20 bg-background/30 hover:bg-background/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Github className="h-4 w-4 text-primary" />
                  <span className="text-xs font-mono font-medium">Open a GitHub Issue</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">Submit Ticket &rarr;</span>
              </a>
            </div>
          </motion.div>

          {/* Card 2: Donations & Sponsorship */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="w-full h-full"
          >
            <DeflectCard
              className="w-full h-full"
              cardClassName="group relative p-6 rounded-2xl border border-border/40 bg-card/45 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 flex flex-col justify-between h-full text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350 pointer-events-none rounded-2xl" />

              <div className="relative z-10 text-left">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="32" cy="28" r="20"/>
                    <polyline points="8 48 8 56 56 56 56 48"/>
                    <path d="M30 28a4 4 0 0 1 0-8"/>
                    <path d="M34 28a4 4 0 0 1 0 8"/>
                    <line x1="32" y1="16" x2="32" y2="20"/>
                    <line x1="32" y1="36" x2="32" y2="40"/>
                    <line x1="30" y1="28" x2="34" y2="28"/>
                    <path d="M38 22s-2-2-4-2h-4"/>
                    <path d="M26 34s2 2 4 2h4"/>
                  </svg>
                </div>
                <h2 className="font-mono text-base font-bold tracking-wide text-foreground">
                  Support the Project
                </h2>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  KeyVerse is completely free and open-source. Help support server hosting costs and motivate future feature development by sponsoring!
                </p>
              </div>

              <div className="relative z-10 flex flex-col gap-3 mt-8">
                {/* PayPal */}
                <motion.a
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  href="https://paypal.me/anshjagwal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-border/20 bg-background/30 hover:bg-background/80 transition-colors text-foreground"
                >
                  <div className="flex items-center gap-3">
                    <svg className="h-4 w-4 text-primary fill-current" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M14.06 3.713c.12-1.071-.093-1.832-.702-2.526C12.628.356 11.312 0 9.626 0H4.734a.7.7 0 0 0-.691.59L2.005 13.509a.42.42 0 0 0 .415.486h2.756l-.202 1.28a.628.628 0 0 0 .62.726H8.14c.429 0 .793-.31.862-.731l.025-.13.48-3.043.03-.164.001-.007a.35.35 0 0 1 .348-.297h.38c1.266 0 2.425-.256 3.345-.91q.57-.403.993-1.005a4.94 4.94 0 0 0 .88-2.195c.242-1.246.13-2.356-.57-3.154a2.7 2.7 0 0 0-.76-.59l-.094-.061ZM6.543 8.82a.7.7 0 0 1 .321-.079H8.3c2.82 0 5.027-1.144 5.672-4.456l.003-.016q.326.186.548.438c.546.623.679 1.535.45 2.71-.272 1.397-.866 2.307-1.663 2.874-.802.57-1.842.815-3.043.815h-.38a.87.87 0 0 0-.863.734l-.03.164-.48 3.043-.024.13-.001.004a.35.35 0 0 1-.348.296H5.595a.106.106 0 0 1-.105-.123l.208-1.32z"/>
                    </svg>
                    <span className="text-xs font-mono font-medium">Donate with PayPal</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">PayPal &rarr;</span>
                </motion.a>

                {/* GitHub Sponsors */}
                <motion.a
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  href="https://github.com/sponsors/jagwalansh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-border/20 bg-background/30 hover:bg-background/80 transition-colors text-foreground"
                >
                  <div className="flex items-center gap-3">
                    <Github className="h-4 w-4 text-primary" />
                    <span className="text-xs font-mono font-medium">Sponsor on GitHub</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">Sponsor &rarr;</span>
                </motion.a>
              </div>
            </DeflectCard>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
