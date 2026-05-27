import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, Fragment, useEffect } from "react";
import { Navbar } from "@/components/ui/navbar";
import { searchTracks, type TrackSearchResult } from "@/lib/lrc";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/components/ui/footer";
import { Star, Play, Sparkles } from "lucide-react";

type SearchParams = {
  q?: string;
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  component: Index,
});

const floatingElements = [
  { char: "♪", size: "text-3xl font-sans text-primary/70 z-10", top: "8%", left: "10%", delay: 0, duration: 6 },
  { char: "♫", size: "text-2xl font-sans text-primary/70 z-10", top: "72%", left: "8%", delay: 1.5, duration: 7 },
  { char: "♩", size: "text-xl font-sans text-primary/70 z-10", top: "5%", left: "85%", delay: 0.5, duration: 5.5 },
  { char: "♬", size: "text-3xl font-sans text-primary/70 z-10", top: "78%", left: "88%", delay: 2, duration: 8 },
  { char: "A", size: "text-[11px] font-mono border border-primary/30 px-2 py-0.5 rounded bg-primary/10 shadow-md text-primary/80 z-10", top: "25%", left: "90%", delay: 1, duration: 6.5 },
  { char: "S", size: "text-[11px] font-mono border border-primary/30 px-2 py-0.5 rounded bg-primary/10 shadow-md text-primary/80 z-10", top: "45%", left: "5%", delay: 2.5, duration: 7.2 },
  { char: "space", size: "text-[9px] uppercase tracking-wider font-mono border border-primary/30 px-3.5 py-0.5 rounded bg-primary/10 shadow-md text-primary/80 z-10", top: "85%", left: "48%", delay: 0.8, duration: 8.5 },
  { char: "♩", size: "text-lg font-sans text-primary/70 z-10", top: "35%", left: "94%", delay: 3, duration: 6.8 },
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
      type: "spring",
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
      ease: "easeOut",
    },
  },
};

const RECOMMENDED_SONGS_HOMEPAGE = [
  {
    id: 1743852427,
    trackName: "Love Me Not",
    artistName: "Ravyn Lenae",
    artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/07/8c/6c/078c6c94-d38d-0451-d57b-23e957b569f8/075679660893.jpg/100x100bb.jpg",
    duration: 213,
    difficulty: "Easy",
    difficultyColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
  },
  {
    id: 1579787410,
    trackName: "STAY",
    artistName: "The Kid LAROI & Justin Bieber",
    artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a8/3a/22/a83a22f7-af18-7ef6-a7de-74816c532a44/886449475421.jpg/100x100bb.jpg",
    duration: 142,
    difficulty: "Medium",
    difficultyColor: "bg-amber-500/10 text-amber-500 border-amber-500/20"
  },
  {
    id: 1193701400,
    trackName: "Perfect",
    artistName: "Ed Sheeran",
    artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/100x100bb.jpg",
    duration: 263,
    difficulty: "Very Easy",
    difficultyColor: "bg-teal-500/10 text-teal-500 border-teal-500/20"
  },
  {
    id: 1488408568,
    trackName: "Blinding Lights",
    artistName: "The Weeknd",
    artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/100x100bb.jpg",
    duration: 202,
    difficulty: "Medium",
    difficultyColor: "bg-amber-500/10 text-amber-500 border-amber-500/20"
  }
];

function Index() {
  const { q: routeQuery } = Route.useSearch();
  const [results, setResults] = useState<TrackSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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
    <main className="flex flex-col justify-start items-center min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden">
      <Navbar />

      <div className="w-full max-w-4xl mx-auto px-6 py-28 flex flex-col items-center text-center justify-start min-h-[calc(100vh-73px)] gap-10 relative">
        {/* Floating background music notes and keycaps */}
        {floatingElements.map((el, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: [0.45, 0.85, 0.45],
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
            className={`absolute pointer-events-none select-none ${el.size}`}
            style={{
              top: el.top,
              left: el.left,
            }}
          >
            {el.char}
          </motion.div>
        ))}

        {/* Hero Header Section */}
        <div className="w-full max-w-2xl flex flex-col items-center text-center relative z-20">
          <header className="mb-2">
            <motion.h1
              variants={titleContainerVariants}
              initial="hidden"
              animate="visible"
              className="text-5xl md:text-6xl font-bold tracking-tight leading-tight text-foreground mb-6"
            >
              {"Feel the rhythm in every keystroke.".split(" ").map((word, wordIdx, arr) => (
                <Fragment key={wordIdx}>
                  <span className="inline-block whitespace-nowrap">
                    {word.split("").map((char, charIdx) => (
                      <motion.span
                        key={charIdx}
                        variants={titleCharVariants}
                        className="inline-block cursor-default select-none origin-bottom"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </span>
                  {wordIdx < arr.length - 1 && " "}
                </Fragment>
              ))}
            </motion.h1>
            
            <motion.p
              variants={paragraphVariants}
              initial="hidden"
              animate="visible"
              className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto"
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
            </motion.p>
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
                    <li key={idx} className="flex items-center gap-4 px-2 py-3 border-b border-border/40 last:border-0">
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
                          }}
                          className="flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all hover:bg-muted/65 text-left group"
                        >
                          {t.artworkUrl100 ? (
                            <img src={t.artworkUrl100} alt="" className="h-10 w-10 rounded-lg shrink-0 object-cover border border-border/10" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                              ♪
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-sm group-hover:text-primary transition-colors">{t.trackName}</p>
                            <p className="truncate text-xs text-muted-foreground mt-0.5">{t.artistName}</p>
                          </div>
                          <span className="font-mono text-xs text-primary group-hover:translate-x-1 transition-transform">play -&gt;</span>
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="w-full max-w-2xl mt-4 flex flex-col gap-6 z-20"
          >
            <div className="flex items-center justify-between border-b border-border/20 pb-4">
              <h2 className="text-sm font-bold tracking-wider text-muted-foreground font-mono uppercase flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Featured Songs
              </h2>
              <Link
                to="/recommended"
                className="text-xs font-mono text-primary hover:text-primary/80 transition-colors font-semibold border-b border-primary/20 hover:border-primary"
              >
                View Full List &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {RECOMMENDED_SONGS_HOMEPAGE.map((song) => (
                <Link
                  key={song.id}
                  to="/play/$trackId"
                  params={{ trackId: String(song.id) }}
                  search={{
                    artist: song.artistName,
                    track: song.trackName,
                    art: song.artworkUrl100,
                    duration: song.duration
                  }}
                  className="group relative flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card/45 backdrop-blur-sm hover:border-primary/30 transition-all hover:-translate-y-0.5 shadow-sm text-left"
                >
                  {/* Subtle backlighting on card hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <img src={song.artworkUrl100} className="h-12 w-12 rounded-lg object-cover border border-border/10 shrink-0" />
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                        {song.trackName}
                      </h3>
                      <p className="truncate text-[10px] text-muted-foreground mt-0.5">
                        {song.artistName}
                      </p>
                      <span className={`inline-flex px-1.5 py-0.5 text-[8px] font-mono font-bold tracking-wide rounded border uppercase mt-1.5 ${song.difficultyColor}`}>
                        {song.difficulty}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-primary group-hover:translate-x-1 transition-transform relative z-10 flex items-center gap-1">
                    <Play className="h-2.5 w-2.5 fill-current" />
                    PLAY
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </main>
  );
}
