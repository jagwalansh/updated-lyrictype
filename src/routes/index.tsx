import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, Fragment, useEffect } from "react";
import { Navbar } from "@/components/ui/navbar";
import { searchTracks, type TrackSearchResult } from "@/lib/lrc";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/components/ui/footer";
import { Play } from "lucide-react";
import { DeflectCard } from "@/components/ui/deflect-card";
import { trackEvent } from "@/lib/analytics";

type SearchParams = {
  q?: string;
};

let hasVisitedHome = false;

export const Route = createFileRoute("/")({
  head: () => ({
    links: [{ rel: "canonical", href: "https://keyverse.me/" }],
  }),
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === "string" ? search.q.replace(/\+/g, " ") : undefined,
  }),
  component: Index,
});

const floatingElements = [
  {
    char: "♪",
    size: "text-3xl font-sans text-primary/45",
    top: "8%",
    left: "10%",
    delay: 0,
    duration: 6,
  },
  {
    char: "♫",
    size: "text-2xl font-sans text-primary/45",
    top: "72%",
    left: "8%",
    delay: 1.5,
    duration: 7,
  },
  {
    char: "♩",
    size: "text-xl font-sans text-primary/45",
    top: "5%",
    left: "85%",
    delay: 0.5,
    duration: 5.5,
  },
  {
    char: "♬",
    size: "text-3xl font-sans text-primary/45",
    top: "78%",
    left: "88%",
    delay: 2,
    duration: 8,
  },
  {
    char: "A",
    size: "text-[11px] font-mono border border-primary/20 px-2 py-0.5 rounded bg-primary/5 shadow-md text-primary/55",
    top: "25%",
    left: "90%",
    delay: 1,
    duration: 6.5,
  },
  {
    char: "S",
    size: "text-[11px] font-mono border border-primary/20 px-2 py-0.5 rounded bg-primary/5 shadow-md text-primary/55",
    top: "45%",
    left: "5%",
    delay: 2.5,
    duration: 7.2,
  },
  {
    char: "space",
    size: "text-[9px] uppercase tracking-wider font-mono border border-primary/20 px-3.5 py-0.5 rounded bg-primary/5 shadow-md text-primary/55",
    top: "85%",
    left: "48%",
    delay: 0.8,
    duration: 8.5,
  },
  {
    char: "♩",
    size: "text-lg font-sans text-primary/45",
    top: "35%",
    left: "94%",
    delay: 3,
    duration: 6.8,
  },
];

const titleContainerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
    },
  },
};

const titleCharVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 14,
    },
  },
};

const paragraphVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.6,
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const RECOMMENDED_SONGS_HOMEPAGE = [
  {
    id: 1743852427,
    trackName: "Love Me Not",
    artistName: "Ravyn Lenae",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/07/8c/6c/078c6c94-d38d-0451-d57b-23e957b569f8/075679660893.jpg/100x100bb.jpg",
    duration: 213,
  },
  {
    id: 1579787410,
    trackName: "STAY",
    artistName: "The Kid LAROI & Justin Bieber",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a8/3a/22/a83a22f7-af18-7ef6-a7de-74816c532a44/886449475421.jpg/100x100bb.jpg",
    duration: 142,
  },
  {
    id: 1615585008,
    trackName: "As It Was",
    artistName: "Harry Styles",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/19/fb/2a19fb85-2f70-9e44-f2a9-82abe679b88e/886449990061.jpg/100x100bb.jpg",
    duration: 167,
  },
  {
    id: 1538003843,
    trackName: "Levitating",
    artistName: "Dua Lipa",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/100x100bb.jpg",
    duration: 203,
  },
  {
    id: 1440870375,
    trackName: "Starboy",
    artistName: "The Weeknd feat. Daft Punk",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/100x100bb.jpg",
    duration: 230,
  },
  {
    id: 1468058171,
    trackName: "Cruel Summer",
    artistName: "Taylor Swift",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/100x100bb.jpg",
    duration: 178,
  },
  {
    id: 1193701392,
    trackName: "Shape of You",
    artistName: "Ed Sheeran",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/100x100bb.jpg",
    duration: 233,
  },
  {
    id: 1411628233,
    trackName: "Believer",
    artistName: "Imagine Dragons",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/11/7a/b8/117ab805-6811-8929-18b9-0fad7baf0c25/17UMGIM98210.rgb.jpg/100x100bb.jpg",
    duration: 204,
  },
  {
    id: 1193701400,
    trackName: "Perfect",
    artistName: "Ed Sheeran",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/100x100bb.jpg",
    duration: 263,
  },
  {
    id: 1488408568,
    trackName: "Blinding Lights",
    artistName: "The Weeknd",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/100x100bb.jpg",
    duration: 202,
  },
  {
    id: 1674691586,
    trackName: "Flowers",
    artistName: "Miley Cyrus",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8c/67/ff/8c67ff91-31c3-3fef-1884-ce3ec89f3af4/196589946874.jpg/100x100bb.jpg",
    duration: 201,
  },
  {
    id: 1508562516,
    trackName: "Heat Waves",
    artistName: "Glass Animals",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/da/8b/77/da8b7731-6f4f-eacf-5e74-8b23389eefa1/20UMGIM03371.rgb.jpg/100x100bb.jpg",
    duration: 239,
  },
  {
    id: 1434371887,
    trackName: "Shallow",
    artistName: "Lady Gaga & Bradley Cooper",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b1/9f/ef/b19fef51-79de-a940-e8ab-9e4e07b04d96/18UMGIM53752.rgb.jpg/100x100bb.jpg",
    duration: 216,
  },
  {
    id: 1571330212,
    trackName: "Bad Habits",
    artistName: "Ed Sheeran",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/63/45/cc/6345cc98-aa83-ad6e-e3c9-1a36ff9838a4/190296614316.jpg/100x100bb.jpg",
    duration: 231,
  },
];

const gameHighlights = [
  {
    title: "Timed lyric input",
    description:
      "Lines advance with the track, so the challenge is reading ahead, staying calm, and typing the words that are actually being sung.",
  },
  {
    title: "Measured accuracy",
    description:
      "The score favors clean entries over frantic corrections. A steady round usually beats a fast round with repeated misses.",
  },
  {
    title: "Optional ranking",
    description:
      "Accounts are only needed for saved scores and leaderboard placement. The core game remains playable without signing in.",
  },
];

const faqs = [
  {
    question: "Can I play without signing in?",
    answer: "Yes. Sign-in is only required for saved scores, profiles, and leaderboard entries.",
  },
  {
    question: "Why does a song sometimes feel out of sync?",
    answer:
      "The game combines lyric timing with public video playback. If a video is a live cut, remix, or regional version, timing can drift.",
  },
  {
    question: "What makes a track difficult?",
    answer:
      "Dense verses, short pauses, punctuation, and fast vocal phrasing all raise the typing pressure.",
  },
];

function Index() {
  const { q: routeQuery } = Route.useSearch();
  const [results, setResults] = useState<TrackSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [disableAnimation, setDisableAnimation] = useState(hasVisitedHome);
  const [showAmbientMotion, setShowAmbientMotion] = useState(false);

  useEffect(() => {
    hasVisitedHome = true;
    trackEvent("homepage_viewed");
  }, []);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 639px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateAmbientMotion = () => {
      setShowAmbientMotion(!mobileQuery.matches && !reducedMotionQuery.matches);
    };

    updateAmbientMotion();
    mobileQuery.addEventListener("change", updateAmbientMotion);
    reducedMotionQuery.addEventListener("change", updateAmbientMotion);

    return () => {
      mobileQuery.removeEventListener("change", updateAmbientMotion);
      reducedMotionQuery.removeEventListener("change", updateAmbientMotion);
    };
  }, []);

  useEffect(() => {
    const query = routeQuery ?? "";
    if (query.trim()) {
      setLoading(true);
      setErr(null);
      setCurrentPage(1);
      searchTracks(query)
        .then((r) => {
          setResults(r);
          if (!r.length) setErr("No songs with synced lyrics found.");
        })
        .catch(() => {
          setErr("Search failed. Try again.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setResults([]);
      setErr(null);
    }
  }, [routeQuery]);

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedResults = results.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <main className="flex flex-col justify-start items-center min-h-screen bg-background text-foreground font-sans relative">
      <Navbar />

      <div className="w-full max-w-4xl mx-auto px-6 py-28 flex flex-col items-center text-center justify-start flex-1 gap-10 relative">
        {showAmbientMotion && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
            {floatingElements.map((el, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: [0.35, 0.65, 0.35],
                  y: [0, -14, 0],
                  x: [0, 6, 0],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: el.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: el.delay,
                }}
                className={`absolute ${el.size}`}
                style={{
                  top: el.top,
                  left: el.left,
                }}
              >
                {el.char}
              </motion.div>
            ))}
          </div>
        )}

        {/* Hero Header Section */}
        <div className="w-full max-w-2xl flex flex-col items-center text-center relative z-20">
          <header className="mb-2">
            <h1
              className={`text-5xl md:text-6xl font-bold tracking-tight leading-tight text-foreground mb-6 ${disableAnimation ? "" : "animate-fade-in-up"}`}
            >
              Feel the rhythm in every{" "}
              <span className="inline-block whitespace-nowrap py-2">
                <span className="playwrite-mx-regular text-primary italic">keystroke.</span>
              </span>
            </h1>

            <p
              className={`text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto ${disableAnimation ? "" : "animate-fade-in-up [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]"}`}
            >
              Search your{" "}
              <span className="inline-block text-foreground font-medium underline decoration-primary/30 decoration-2 underline-offset-4 cursor-default">
                favorite tracks
              </span>
              ,{" "}
              <span className="inline-block text-foreground font-medium underline decoration-primary/30 decoration-2 underline-offset-4 cursor-default">
                lock into the beat
              </span>
              , and type the lyrics in{" "}
              <span className="inline-block text-foreground font-medium underline decoration-primary/30 decoration-2 underline-offset-4 cursor-default">
                perfect sync
              </span>
              . A clean, minimal typing game built for music lovers.
            </p>
          </header>
        </div>

        {/* Search Results Block (if query parameter is present) */}
        {routeQuery ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl flex flex-col z-20"
          >
            <div className="flex items-center justify-between border-b border-border/20 pb-4 mb-4">
              <h2 className="text-sm font-semibold tracking-wide text-foreground font-mono">
                🔍 Search Results for "{routeQuery}"
              </h2>
              <Link
                to="/"
                className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
              >
                Clear Search
              </Link>
            </div>

            {err && <p className="text-sm text-incorrect text-left">{err}</p>}

            <div>
              {loading ? (
                <ul className="space-y-4">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-4 px-2 py-3 border-b border-border/40 last:border-0"
                    >
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="min-w-0 flex-1 flex flex-col gap-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                      <Skeleton className="h-3 w-12" />
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <ul className="divide-y divide-border">
                    {paginatedResults.map((t) => (
                      <li key={t.id}>
                        <Link
                          to="/play/$trackId"
                          params={{ trackId: String(t.id) }}
                          search={{
                            artist: t.artistName,
                            track: t.trackName,
                            art: t.artworkUrl100 || "",
                            duration: t.duration,
                            q: routeQuery || undefined,
                            from: "/",
                          }}
                          className="flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all hover:bg-muted/65 text-left group"
                        >
                          {t.artworkUrl100 ? (
                            <img
                              src={t.artworkUrl100}
                              alt=""
                              className="h-10 w-10 rounded-lg shrink-0 object-cover border border-border/10"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                              ♪
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-sm group-hover:text-primary transition-colors">
                              {t.trackName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground mt-0.5">
                              {t.artistName}
                            </p>
                          </div>
                          <span className="font-mono text-xs text-primary group-hover:translate-x-1 transition-transform">
                            play -&gt;
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {results.length > ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/20 font-mono text-xs text-muted-foreground">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-md border border-border/40 hover:bg-muted/60 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
                      >
                        &larr; Previous
                      </button>
                      <span>
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded-md border border-border/40 hover:bg-muted/60 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
                      >
                        Next &rarr;
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        ) : (
          /* Recommended Songs Grid (Default Homepage state) */
          <motion.div
            initial={disableAnimation ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={disableAnimation ? { duration: 0 } : { delay: 0.8, duration: 0.5 }}
            className="w-full max-w-2xl mt-4 flex flex-col gap-6 z-20"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/20 pb-4 gap-4">
              <h2 className="text-sm font-bold tracking-wider text-muted-foreground font-mono uppercase">
                Featured Songs
              </h2>

              <div className="flex items-center gap-6">
                <Link
                  to="/recommended"
                  className="text-xs font-mono text-primary hover:text-primary/80 transition-colors font-semibold border-b border-primary/20 hover:border-primary"
                >
                  View Full List &rarr;
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {RECOMMENDED_SONGS_HOMEPAGE.map((song) => (
                <DeflectCard key={song.id} className="w-full rounded-xl">
                  <Link
                    to="/play/$trackId"
                    params={{ trackId: String(song.id) }}
                    search={{
                      artist: song.artistName,
                      track: song.trackName,
                      art: song.artworkUrl100,
                      duration: song.duration,
                      q: routeQuery || undefined,
                      from: "/",
                    }}
                    className="group relative flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card/45 backdrop-blur-sm hover:border-primary/30 w-full h-full text-left"
                  >
                    {/* Subtle backlighting on card hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />

                    <div className="flex items-center gap-3 relative z-10">
                      <img
                        src={song.artworkUrl100}
                        className="h-12 w-12 rounded-lg object-cover border border-border/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                          {song.trackName}
                        </h3>
                        <p className="truncate text-[10px] text-muted-foreground mt-0.5">
                          {song.artistName}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-primary group-hover:translate-x-1 transition-transform relative z-10 flex items-center gap-1">
                      <Play className="h-2.5 w-2.5 fill-current" />
                      PLAY
                    </span>
                  </Link>
                </DeflectCard>
              ))}
            </div>
          </motion.div>
        )}

        {!routeQuery && (
          <section className="w-full max-w-4xl z-20 text-left">
            <div className="border-y border-border/20 py-7">
              <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">How the game works</h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    A short overview for new players before they start a round.
                  </p>
                </div>
                <Link
                  to="/how-to-play"
                  className="text-xs font-mono font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
                >
                  Read the guide
                </Link>
              </div>

              <div className="grid gap-0 border border-border/30 bg-card/30 md:grid-cols-3">
                {gameHighlights.map(({ title, description }) => (
                  <div
                    key={title}
                    className="border-b border-border/30 p-5 md:border-b-0 md:border-r md:last:border-r-0"
                  >
                    <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider">
                      {title}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Practice with real pacing</h2>
                <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                  <p>
                    KeyVerse is built around the rhythm of a finished song, not a random word list.
                    Verses create longer typing runs, hooks give you repetition, and pauses force
                    you to wait instead of rushing ahead.
                  </p>
                  <p>
                    That pacing makes each round a useful typing drill and a small listening test.
                    The best scores tend to come from relaxed accuracy rather than raw speed.
                  </p>
                </div>
              </div>

              <div className="border-l border-border/30 pl-0 md:pl-6">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Notes
                </h2>
                <div className="mt-4 space-y-4">
                  {faqs.map((item) => (
                    <div
                      key={item.question}
                      className="border-b border-border/20 pb-4 last:border-0"
                    >
                      <h3 className="text-sm font-semibold">{item.question}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
}
