import { createFileRoute, Link } from "@tanstack/react-router";
import { Footer } from "@/components/ui/footer";
import { Navbar } from "@/components/ui/navbar";
import { motion } from "motion/react";
import { ArrowLeft, Gauge, Music2, Target } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About KeyVerse" },
      {
        name: "description",
        content:
          "Learn about KeyVerse, a rhythm typing game built for music lovers.",
      },
    ],
    links: [{ rel: "canonical", href: "https://keyverse.me/about" }],
  }),
  component: About,
});

const values = [
  {
    icon: Music2,
    title: "Music first",
    description:
      "Songs are more than a backdrop. Every round is designed around following lyrics in time with the music.",
  },
  {
    icon: Gauge,
    title: "Fast and focused",
    description:
      "The interface stays out of your way so you can concentrate on rhythm, accuracy, and improving your score.",
  },
  {
    icon: Target,
    title: "Practice with purpose",
    description:
      "KeyVerse turns typing practice into a challenge that rewards consistency, timing, and attention.",
  },
];

function About() {
  return (
    <main className="relative flex min-h-screen flex-col items-center bg-background font-sans text-foreground">
      <Navbar />

      <div className="relative z-20 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-28">
        <div className="flex flex-col gap-4 border-b border-border/20 pb-6 text-left md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-1 text-xs font-mono font-semibold uppercase tracking-wider text-primary">
              Our story
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              About KeyVerse
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              A rhythm typing game where your favorite songs become the
              challenge.
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

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/45 p-8 shadow-sm backdrop-blur-sm md:p-10"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          <div className="relative z-10 max-w-3xl">
            <h2 className="font-mono text-xl font-bold tracking-wide">
              Type along. Find your flow.
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                KeyVerse began with a simple idea: typing practice feels better
                when it is connected to music you already love. Instead of
                copying disconnected words, you follow lyrics as the song
                plays and try to stay in sync.
              </p>
              <p>
                Each round measures speed and accuracy while leaderboards give
                you a reason to return, improve, and compete. The game is free,
                minimal, and built to make a few minutes of practice feel like
                play.
              </p>
            </div>
          </div>
        </motion.section>

        <section className="grid gap-4 md:grid-cols-3">
          {values.map(({ icon: Icon, title, description }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * (index + 1), duration: 0.3 }}
              className="rounded-2xl border border-border/40 bg-card/45 p-6 backdrop-blur-sm"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-mono text-sm font-bold tracking-wide">
                {title}
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            </motion.div>
          ))}
        </section>

        <section className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-border/40 bg-card/45 p-7 sm:flex-row sm:items-center">
          <div>
            <div className="font-mono text-sm font-bold">
              Built with the community
            </div>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">
              KeyVerse uses services including LRCLIB and YouTube, and grows
              through player feedback, bug reports, and song suggestions.
            </p>
          </div>
          <Link
            to="/support"
            className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-xs font-mono font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get in touch
          </Link>
        </section>
      </div>

      <Footer />
    </main>
  );
}
