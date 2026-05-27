import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { motion } from "motion/react";
import { Mail, Heart, Coffee, Github, MessageSquare, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/support")({
  component: Support,
});

function Support() {
  return (
    <main className="flex flex-col justify-start items-center min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden">
      <Navbar />

      <div className="w-full max-w-4xl mx-auto px-6 py-28 flex flex-col gap-10 min-h-[calc(100vh-73px)] justify-start relative z-20">
        {/* Header Section */}
        <div className="flex flex-col border-b border-border/20 pb-6 text-left">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold tracking-wider uppercase mb-1">
            <ShieldAlert className="h-4.5 w-4.5" />
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
                Found a mistake in the lyric sync? Or did the player fail to load a video? We are constantly improving lyrictype and would love to hear from you.
              </p>
            </div>

            <div className="relative z-10 flex flex-col gap-3 mt-8">
              {/* Email Link */}
              <a
                href="mailto:bugs@lyrictype.com"
                className="flex items-center justify-between p-3 rounded-xl border border-border/20 bg-background/30 hover:bg-background/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-xs font-mono font-medium">Mail our team</span>
                </div>
                <span className="text-[10px] font-mono text-primary border-b border-primary/20">bugs@lyrictype.com</span>
              </a>

              {/* GitHub Issues */}
              <a
                href="https://github.com/jagwalansh/lyrical-sync-game/issues"
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
            className="group relative p-6 rounded-2xl border border-border/40 bg-card/45 backdrop-blur-sm hover:border-primary/30 transition-colors shadow-sm flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350 pointer-events-none rounded-2xl" />

            <div className="relative z-10 text-left">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Heart className="h-5 w-5 fill-current text-incorrect" />
              </div>
              <h2 className="font-mono text-base font-bold tracking-wide text-foreground">
                Support the Project
              </h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                lyrictype is completely free and open-source. Help support server hosting costs and motivate future feature development by buying us a coffee or sponsoring!
              </p>
            </div>

            <div className="relative z-10 flex flex-col gap-3 mt-8">
              {/* Buy Me A Coffee */}
              <motion.a
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                href="https://buymeacoffee.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Coffee className="h-4 w-4" />
                  <span className="text-xs font-mono font-bold">Buy me a coffee</span>
                </div>
                <span className="text-[10px] font-mono">Coffee &rarr;</span>
              </motion.a>

              {/* PayPal */}
              <motion.a
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                href="https://paypal.me"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M20.067 8.478c.492.29.83.696.994 1.25.163.554.12 1.216-.134 2.052l-2.02 6.643c-.15.49-.447.887-.887 1.185-.44.298-.957.447-1.554.447h-5.26c-.33 0-.616-.103-.86-.31s-.38-.49-.407-.847L9.043 4.148c-.027-.35-.152-.647-.375-.89-.223-.243-.51-.365-.86-.365H4.26c-.22 0-.41-.07-.57-.213A.77.77 0 0 1 3.45 2.1c0-.233.08-.432.24-.597a.78.78 0 0 1 .57-.248h6.29c.67 0 1.24.237 1.71.71.47.473.743 1.048.82 1.724l.983 6.353c.02.16.083.284.186.37.103.088.232.13.387.13h1.8c.84 0 1.543-.25 2.112-.75.568-.5.852-1.185.852-2.052 0-.69-.214-1.25-.64-1.68-.427-.43-.997-.645-1.71-.645h-1.66c-.33 0-.61-.103-.847-.31a.98.98 0 0 1-.355-.838l.42-1.393c.047-.16.136-.284.268-.372.132-.088.283-.132.454-.132h1.66c1.33 0 2.4.352 3.21 1.056z"/>
                  </svg>
                  <span className="text-xs font-mono font-bold">Donate with PayPal</span>
                </div>
                <span className="text-[10px] font-mono">PayPal &rarr;</span>
              </motion.a>

              {/* GitHub Sponsors */}
              <motion.a
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                href="https://github.com/sponsors/jagwalansh"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-pink-500/20 bg-pink-500/5 hover:bg-pink-500/10 text-pink-600 dark:text-pink-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 text-incorrect" />
                  <span className="text-xs font-mono font-bold">Sponsor on GitHub</span>
                </div>
                <span className="text-[10px] font-mono">Sponsor &rarr;</span>
              </motion.a>
            </div>
          </motion.div>
        </div>

        <Footer />
      </div>
    </main>
  );
}
