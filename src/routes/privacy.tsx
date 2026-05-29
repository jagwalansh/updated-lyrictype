import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { motion } from "motion/react";
import { Shield, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
});

function Privacy() {
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
              Privacy Policy
            </h1>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xl">
              Last updated: May 2026. This policy explains what information we collect and how we use it.
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
              <Shield className="h-4 w-4 text-primary" /> 1. Information We Collect
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We collect minimal information to provide and improve our typing game:
            </p>
            <ul className="list-disc pl-5 mt-2 text-xs text-muted-foreground space-y-1.5">
              <li><strong>Account Information:</strong> If you sign in or create an account via Supabase, we collect your email address and profile details (username) to store your game scores.</li>
              <li><strong>Gameplay Data:</strong> We record scores, typing speeds (WPM), max combos, and accuracy stats to populate leaderboards.</li>
              <li><strong>Analytics:</strong> We use Google Analytics (gtag.js) to gather anonymous, aggregated usage statistics (such as page views, search queries, and gameplay sessions) to help optimize the application performance.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              ⚙️ 2. How We Use Information
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use the collected information solely for:
            </p>
            <ul className="list-disc pl-5 mt-2 text-xs text-muted-foreground space-y-1.5">
              <li>Saving and displaying your typing progress and scores on global leaderboards.</li>
              <li>Debugging technical issues (like video and API search latency).</li>
              <li>Analyzing traffic trends to improve the platform's visual design and responsiveness.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              🍪 3. Cookies & Session Storage
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              KeyVerse uses cookies and local storage to store authentication tokens (keeping you logged into your Supabase profile) and theme preferences (light/dark mode configuration). Third-party cookies may also be set by Google Analytics for website visitor tracking.
            </p>
          </div>

          {/* Section 4 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              📡 4. Third-Party Integrations
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To provide our service, we load assets and interact with these external services:
            </p>
            <ul className="list-disc pl-5 mt-2 text-xs text-muted-foreground space-y-1.5">
              <li><strong>YouTube:</strong> The game utilizes the YouTube IFrame Player API to stream music videos. Playing a video may allow YouTube/Google to collect information as detailed in their privacy policy.</li>
              <li><strong>LRCLIB:</strong> Synced lyrics are requested on demand from LRCLIB.</li>
              <li><strong>Supabase:</strong> Authentication and leaderboard score storage are managed by Supabase.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              🔐 5. Security & Data Deletion
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We care about your data's privacy and use SSL/TLS encryption for all communications. You can delete your account and all associated scores at any time from your Profile settings.
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
