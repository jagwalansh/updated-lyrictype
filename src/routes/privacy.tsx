import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    links: [{ rel: "canonical", href: "https://keyverse.me/privacy" }],
  }),
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
              Last updated: May 2026. This policy explains what information KeyVerse collects, how we use it, and the choices available to you.
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
              1. Information We Collect
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We collect the minimum information needed to run KeyVerse, provide accounts, operate leaderboards, respond to support requests, and improve the service:
            </p>
            <ul className="list-disc pl-5 mt-2 text-xs text-muted-foreground space-y-1.5">
              <li><strong>Account Information:</strong> If you create an account or sign in through Supabase, we collect your email address, authentication identifiers, and profile details such as username.</li>
              <li><strong>Gameplay Data:</strong> We store scores, accuracy, consistency, song identifiers, artist and track names, artwork URLs, and related leaderboard information.</li>
              <li><strong>Support Messages:</strong> If you contact us, we collect the name, email address, subject, and message you submit so we can respond and investigate issues.</li>
              <li><strong>Usage and Device Data:</strong> Google Analytics may collect page views, approximate location, browser/device information, interactions, and other usage signals.</li>
              <li><strong>Advertising Data:</strong> Google AdSense and its partners may use cookies, web beacons, IP addresses, and similar technologies to serve, measure, and personalize ads where allowed.</li>
              <li><strong>Local Storage and Cookies:</strong> We use local storage and cookies for login sessions, theme preferences, analytics, advertising, and embedded third-party services.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              2. How We Use Information
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use the information described above to:
            </p>
            <ul className="list-disc pl-5 mt-2 text-xs text-muted-foreground space-y-1.5">
              <li>Create and maintain accounts, authenticate users, and keep users signed in.</li>
              <li>Save gameplay results and display public leaderboard entries.</li>
              <li>Respond to support messages, bug reports, and feedback.</li>
              <li>Detect abuse, prevent score manipulation, and protect leaderboard integrity.</li>
              <li>Debug technical issues, monitor performance, and improve the game experience.</li>
              <li>Measure traffic and usage through analytics.</li>
              <li>Show ads and support the operation of the service through advertising.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              3. Cookies, Ads, and Analytics
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              KeyVerse uses cookies, local storage, and similar technologies for authentication, preferences, analytics, embedded media, and advertising. Google Analytics helps us understand how the site is used. Google AdSense and other advertising partners may place or read cookies, use web beacons, or use IP addresses to collect information as a result of ad serving on this site.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-3">
              Google and its partners may use advertising cookies to serve ads based on your prior visits to KeyVerse and other websites. You can learn more about Google's advertising practices and ad controls at{" "}
              <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-foreground underline decoration-border hover:text-primary hover:decoration-primary underline-offset-2">
                Google Advertising Technologies
              </a>
              . You may also opt out of some third-party personalized advertising through{" "}
              <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-foreground underline decoration-border hover:text-primary hover:decoration-primary underline-offset-2">
                aboutads.info
              </a>
              .
            </p>
          </div>

          {/* Section 4 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              4. Third-Party Integrations
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To provide our service, we load assets and interact with these external services:
            </p>
            <ul className="list-disc pl-5 mt-2 text-xs text-muted-foreground space-y-1.5">
              <li><strong>Supabase:</strong> Authentication, user profiles, and leaderboard score storage are managed through Supabase.</li>
              <li><strong>Google Analytics:</strong> We use Google Analytics to measure traffic and usage.</li>
              <li><strong>Google AdSense:</strong> We use Google AdSense to serve ads. Google and third-party vendors may use cookies and similar technologies for ad delivery, personalization, and measurement.</li>
              <li><strong>YouTube:</strong> The game uses YouTube embedded players and related YouTube functionality to stream videos. By using pages with YouTube content, you are also subject to the <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-foreground underline decoration-border hover:text-primary hover:decoration-primary underline-offset-2">YouTube Terms of Service</a> and <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-foreground underline decoration-border hover:text-primary hover:decoration-primary underline-offset-2">Google Privacy Policy</a>.</li>
              <li><strong>LRCLIB:</strong> Synced lyrics are requested from LRCLIB when you search for or play songs.</li>
              <li><strong>Apple Music/iTunes Artwork:</strong> Some track artwork and metadata may be loaded from Apple-hosted image URLs.</li>
              <li><strong>MailChannels:</strong> Support messages may be sent through MailChannels or a similar email delivery provider.</li>
              <li><strong>Cloudflare:</strong> Hosting, security, and delivery are provided through Cloudflare.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              5. Public Leaderboards
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If you submit scores while signed in, your username, score, accuracy, song information, and related gameplay statistics may appear publicly on KeyVerse leaderboards. Do not choose a username that reveals personal information you do not want public.
            </p>
          </div>

          {/* Section 6 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              6. Your Choices and Data Rights
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You can update your username, sign out, or delete your account and associated scores from your account/profile settings where available. You may also contact us to request access, correction, deletion, or other privacy assistance. Depending on your location, you may have additional rights under laws such as GDPR, UK GDPR, CCPA/CPRA, or similar privacy laws.
            </p>
          </div>

          {/* Section 7 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              7. Children
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              KeyVerse is not directed to children under 13, and users under 13 should not create an account, submit contact forms, or provide personal information. If we learn that we have collected personal information from a child under 13 without appropriate consent, we will take reasonable steps to delete it.
            </p>
          </div>

          {/* Section 8 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              8. Security and Retention
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use reasonable technical measures, including HTTPS/TLS, to protect information. No online service can guarantee perfect security. We keep information for as long as needed to provide the service, maintain leaderboards, comply with legal obligations, resolve disputes, and enforce our terms, unless deletion is requested and legally available.
            </p>
          </div>

          {/* Section 9 */}
          <div className="relative z-10 border-t border-border/20 pt-6">
            <h2 className="font-mono text-base font-bold tracking-wide text-foreground flex items-center gap-2 mb-3">
              9. Changes and Contact
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We may update this policy as KeyVerse changes. If we make material changes, we will update the date above. For privacy questions, deletion requests, or support, contact us at{" "}
              <a href="mailto:support@keyverse.me" className="text-foreground underline decoration-border hover:text-primary hover:decoration-primary underline-offset-2">
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
