import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Keyboard, Music2, Search, Trophy } from "lucide-react";
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
    icon: Search,
    title: "Find a song",
    description:
      "Search for a track or choose one from the recommended list. KeyVerse looks for synced lyric timing so the words can follow the music.",
  },
  {
    icon: Music2,
    title: "Start the round",
    description:
      "The player loads a matching YouTube video and displays lyric lines as the song moves forward. You can report a sync issue if a video does not match well.",
  },
  {
    icon: Keyboard,
    title: "Type in rhythm",
    description:
      "Enter the current lyric line as cleanly as possible. The best runs come from a balance of speed, timing, and accuracy.",
  },
  {
    icon: Trophy,
    title: "Review the score",
    description:
      "After a round, compare your score and accuracy. Signed-in players can save results and compete on public leaderboards.",
  },
];

const tips = [
  "Listen for pauses before you type. Many missed characters happen when a line starts earlier or later than expected.",
  "Prioritize clean words over raw speed. Correcting a mistake usually costs more time than typing slightly slower.",
  "Practice short, repetitive tracks first, then move to faster songs with denser lyrics.",
  "Use headphones when possible so the vocal timing is easier to follow.",
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
              KeyVerse turns lyric timing into typing practice. The rules are simple, but improving
              your score takes rhythm, accuracy, and a little patience.
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

        <section className="grid gap-4 md:grid-cols-4">
          {steps.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-xl border border-border/40 bg-card/45 p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-mono text-sm font-bold tracking-wide">{title}</h2>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{description}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-xl border border-border/40 bg-card/45 p-6">
            <h2 className="text-xl font-bold tracking-tight">What the score rewards</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              A strong KeyVerse score is not only about words per minute. The game rewards accurate
              typing, steady timing, and completing lyric lines without repeated corrections. Songs
              with faster vocals, denser lines, or unusual phrasing naturally become harder.
            </p>
          </div>

          <div className="rounded-xl border border-border/40 bg-card/45 p-6">
            <h2 className="text-xl font-bold tracking-tight">Tips for better lyric typing</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              {tips.map((tip) => (
                <li key={tip} className="border-b border-border/20 pb-3 last:border-0 last:pb-0">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-xl border border-border/40 bg-card/45 p-6">
          <h2 className="text-xl font-bold tracking-tight">Song sync and third-party content</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            KeyVerse uses third-party services for lyrics, videos, artwork, and metadata. Because
            public videos can change or vary by region, a track may occasionally load a video that
            feels slightly out of sync. When that happens, use the in-game report option so the
            mismatch can be reviewed.
          </p>
        </section>
      </div>

      <Footer />
    </main>
  );
}
