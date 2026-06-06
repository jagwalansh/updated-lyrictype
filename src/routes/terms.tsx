import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | KeyVerse" },
      {
        name: "description",
        content:
          "Read the KeyVerse terms of service for accounts, fair play, leaderboards, third-party services, and acceptable use.",
      },
    ],
    links: [{ rel: "canonical", href: "https://keyverse.me/terms" }],
  }),
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
              1. Acceptance of Terms
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              By accessing or using KeyVerse (keyverse.me), you agree to be bound by these Terms of
              Service. If you do not agree to all of these terms, please do not access or use our
              services.
            </p>
          </div>

          {/* Section 2 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              2. Eligibility
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              KeyVerse is not intended for children under 13. If you are under the age of majority
              where you live, you may use KeyVerse only with permission from a parent or legal
              guardian. You are responsible for complying with the laws that apply to you.
            </p>
          </div>

          {/* Section 3 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              3. Fair Play & Gameplay Rules
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              KeyVerse is a competitive rhythm-typing game. To maintain leaderboard integrity, we
              enforce the following rules:
            </p>
            <ul className="list-disc pl-5 mt-2 text-xs text-muted-foreground space-y-1.5">
              <li>
                You must type your own lyrics. Any use of automated scripts, macros, auto-typers, or
                bots is strictly prohibited.
              </li>
              <li>
                Exploiting bugs, glitches, or manipulating client-side state to artificially inflate
                scores is forbidden.
              </li>
              <li>
                Violation of these rules will result in permanent removal of your scores from the
                leaderboards and potential account suspension.
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              4. Accounts & Leaderboards
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When creating an account to save your scores, you are responsible for maintaining the
              security of your authentication details and for all activity under your account.
              Scores submitted to public leaderboards may display your username, song information,
              score, accuracy, and related gameplay statistics. You agree that KeyVerse may remove
              or alter any score, username, or account that appears inappropriate, fraudulent,
              abusive, or harmful to the service.
            </p>
          </div>

          {/* Section 5 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              5. Intellectual Property & Lyrics
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              KeyVerse is an open-source typing game built for educational and recreational typing
              practice. The KeyVerse name, interface, code, and original design elements belong to
              their respective owners or contributors. All music, lyrics, videos, artwork, artist
              names, track names, and metadata remain the property of their respective creators,
              artists, publishers, platforms, and rights holders. Lyrics and metadata may be fetched
              from third-party sources such as LRCLIB and Apple-hosted artwork URLs. We do not claim
              ownership over any third-party music, lyrics, artwork, video, or metadata.
            </p>
          </div>

          {/* Section 6 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              6. Third-Party Services
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              KeyVerse depends on third-party services including Supabase, YouTube, Google
              Analytics, Google AdSense, LRCLIB, Cloudflare, MailChannels, and other providers.
              These services are governed by their own terms and privacy policies. YouTube videos
              are provided through YouTube functionality, and use of YouTube content is subject to
              the{" "}
              <a
                href="https://www.youtube.com/t/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline decoration-border hover:text-primary hover:decoration-primary underline-offset-2"
              >
                YouTube Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline decoration-border hover:text-primary hover:decoration-primary underline-offset-2"
              >
                Google Privacy Policy
              </a>
              .
            </p>
          </div>

          {/* Section 7 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              7. Advertising
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              KeyVerse may display ads through Google AdSense or other advertising partners. We are
              not responsible for the content, products, services, or websites promoted by
              third-party advertisers. Ads may be personalized or measured as described in our
              Privacy Policy and the relevant advertising provider policies.
            </p>
          </div>

          {/* Section 8 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              8. Prohibited Use
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You agree not to misuse KeyVerse, interfere with the service, attempt unauthorized
              access, scrape or overload the service, bypass security or rate limits, upload or
              submit harmful content, impersonate others, violate intellectual property rights, or
              use KeyVerse for unlawful, abusive, or deceptive purposes.
            </p>
          </div>

          {/* Section 9 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              9. Service Changes and Termination
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We may change, suspend, or discontinue any part of KeyVerse at any time, including
              features, songs, lyrics, leaderboards, accounts, ads, or integrations. We may suspend
              or terminate access if we believe you violated these terms, created risk for the
              service, or used KeyVerse in a harmful way.
            </p>
          </div>

          {/* Section 10 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              10. Disclaimer of Warranties
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              KeyVerse is provided "as is" and "as available" without warranties of any kind,
              whether express, implied, or statutory. We do not guarantee that the service will be
              uninterrupted, secure, error-free, accurate, available in every location, or that
              YouTube video playback, lyric APIs, analytics, ads, authentication, or leaderboards
              will always operate correctly.
            </p>
          </div>

          {/* Section 11 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              11. Limitation of Liability
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, KeyVerse and its operators, contributors, and
              affiliates will not be liable for indirect, incidental, special, consequential,
              exemplary, or punitive damages, or for lost data, lost profits, service interruptions,
              third-party content, third-party services, or unauthorized account access arising from
              or related to your use of KeyVerse.
            </p>
          </div>

          {/* Section 12 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              12. Privacy
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your use of KeyVerse is also governed by our{" "}
              <Link
                to="/privacy"
                className="text-foreground underline decoration-border hover:text-primary hover:decoration-primary underline-offset-2"
              >
                Privacy Policy
              </Link>
              , which explains how we collect, use, and share information.
            </p>
          </div>

          {/* Section 13 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              13. Contact
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              For questions about these terms, contact us at{" "}
              <a
                href="mailto:support@keyverse.me"
                className="text-foreground underline decoration-border hover:text-primary hover:decoration-primary underline-offset-2"
              >
                support@keyverse.me
              </a>
              .
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
