import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { motion } from "motion/react";
import { Scale, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  component: Terms,
});

function Terms() {
  return (
    <main className="flex flex-col justify-start items-center min-h-screen bg-background text-foreground font-sans relative">
      <Navbar />

      <div className="w-full max-w-4xl mx-auto px-6 py-28 flex flex-col gap-10 flex-1 justify-start relative z-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/20 pb-6 text-left">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold tracking-wider uppercase mb-1">
              Legal Documents
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Terms of Service
            </h1>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xl">
              Last updated: May 2026. Please read these terms carefully before using KeyVerse.
            </p>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 self-start md:self-auto px-4 py-2 text-xs font-mono font-semibold border border-border/40 hover:border-primary/50 bg-card/45 backdrop-blur-sm hover:bg-muted/60 text-muted-foreground hover:text-foreground rounded-lg transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Content Block */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="group relative p-8 rounded-2xl border border-border/40 bg-card/45 backdrop-blur-sm shadow-sm text-left flex flex-col gap-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350 pointer-events-none rounded-2xl" />

          {/* Section 1 */}
          <div className="relative z-10">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              <Scale className="h-4 w-4 text-primary" /> 1. Acceptance of Terms
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              By accessing or using KeyVerse (keyverse.me), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not access or use our services.
            </p>
          </div>

          {/* Section 2 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              🎯 2. Fair Play & Gameplay Rules
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              KeyVerse is a competitive rhythm-typing game. To maintain leaderboard integrity, we enforce the following rules:
            </p>
            <ul className="list-disc pl-5 mt-2 text-xs text-muted-foreground space-y-1.5">
              <li>You must type your own lyrics. Any use of automated scripts, macros, auto-typers, or bots is strictly prohibited.</li>
              <li>Exploiting bugs, glitches, or manipulating client-side state to artificially inflate scores is forbidden.</li>
              <li>Violation of these rules will result in permanent removal of your scores from the leaderboards and potential account suspension.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              👤 3. Accounts & Leaderboards
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When creating an account to save your scores, you are responsible for maintaining the security of your authentication details. Scores submitted to public leaderboards will display your username. You agree that KeyVerse has the right to remove or alter any score or username deemed inappropriate or fraudulent.
            </p>
          </div>

          {/* Section 4 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              🎵 4. Intellectual Property & Lyrics
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              KeyVerse is an open-source typing game built for educational and recreational typing practice. All music, lyrics, and metadata displayed on the platform remain the property of their respective creators, artists, and rights holders. Lyrics are fetched from open APIs like LRCLIB. We do not claim ownership over any lyrics or video content used.
            </p>
          </div>

          {/* Section 5 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              ⚠️ 5. Disclaimer of Warranties
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              KeyVerse is provided "as is" and "as available" without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free, or that YouTube video playback and lyric APIs will always operate correctly.
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
