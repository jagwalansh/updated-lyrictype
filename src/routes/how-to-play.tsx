import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/ui/footer";
import { Navbar } from "@/components/ui/navbar";

export const Route = createFileRoute("/how-to-play")({
  head: () => ({
    meta: [
      { title: "How to Play KeyVerse | Rhythm Typing Guide" },
      {
        name: "description",
        content:
          "Learn how KeyVerse works, how rhythm typing scores are calculated, and how to improve your lyric typing accuracy.",
      },
    ],
    links: [{ rel: "canonical", href: "https://keyverse.me/how-to-play" }],
  }),
  component: HowToPlay,
});

const steps = [
  {
    title: "Find a song",
    description:
      "Search by artist or track title, or start from the recommended list if you want a known-good round.",
  },
  {
    title: "Start the round",
    description:
      "KeyVerse pairs synced lyrics with a matching video and moves the active line as playback advances.",
  },
  {
    title: "Type in rhythm",
    description:
      "Type the current lyric line cleanly. Reading ahead helps, but the input should stay with the vocal.",
  },
  {
    title: "Review the score",
    description:
      "Use the score, accuracy, and leaderboard placement to see where a run improved or fell apart.",
  },
];

const tips = [
  "Let the first line establish the tempo before pushing for speed.",
  "Type clean words first; corrections usually cost more than a slightly slower pace.",
  "Replay one track until accuracy is stable, then move to a denser song.",
  "Report a sync issue when a video version clearly does not match the lyric timing.",
];

function HowToPlay() {
  return (
    <main className="relative flex min-h-screen flex-col items-center bg-background font-sans text-foreground">
      <Navbar />

      <div className="relative z-20 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-28">
        <div className="flex flex-col gap-4 border-b border-border/20 pb-6 text-left md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-1 text-xs font-mono font-semibold uppercase tracking-wider text-primary">
              Player guide
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">How to Play KeyVerse</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              A quick reference for the rhythm typing flow, score behavior, and sync reports.
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

        <section className="grid border border-border/30 bg-card/30 md:grid-cols-4">
          {steps.map(({ title, description }) => (
            <article
              key={title}
              className="border-b border-border/30 p-5 md:border-b-0 md:border-r md:last:border-r-0"
            >
              <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider">{title}</h2>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{description}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-8 border-t border-border/20 pt-8 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">What the score rewards</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Score is not just words per minute. A strong run combines accurate input, consistent
              timing, and completed lyric lines with few corrections. Fast verses, clipped words,
              and unusual phrasing naturally raise the difficulty.
            </p>
          </div>

          <div className="border-l border-border/30 pl-0 md:pl-6">
            <h2 className="text-xl font-semibold tracking-tight">Practice notes</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              {tips.map((tip) => (
                <li key={tip} className="border-b border-border/20 pb-3 last:border-0 last:pb-0">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-border/20 pt-8">
          <h2 className="text-xl font-semibold tracking-tight">Song sync and sources</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            KeyVerse uses third-party services for lyrics, videos, artwork, and metadata. Public
            videos can vary by region or version, so a track may occasionally feel slightly out of
            sync. The in-game report option includes the song and video details so mismatches can be
            reviewed.
          </p>
        </section>
      </div>

      <Footer />
    </main>
  );
}
