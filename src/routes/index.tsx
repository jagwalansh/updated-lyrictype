import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, Fragment, type FormEvent } from "react";
import { Navbar } from "@/components/ui/navbar";
import { searchTracks, type TrackSearchResult } from "@/lib/lrc";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Loader2 } from "lucide-react";
import { Footer } from "@/components/ui/footer";

const floatingElements = [
  { char: "♪", size: "text-3xl font-sans text-primary/70 z-10", top: "5%", left: "-10%", delay: 0, duration: 6 },
  { char: "♫", size: "text-2xl font-sans text-primary/70 z-10", top: "72%", left: "-15%", delay: 1.5, duration: 7 },
  { char: "♩", size: "text-xl font-sans text-primary/70 z-10", top: "-12%", left: "38%", delay: 0.5, duration: 5.5 },
  { char: "♬", size: "text-3xl font-sans text-primary/70 z-10", top: "35%", left: "98%", delay: 2, duration: 8 },
  { char: "A", size: "text-[11px] font-mono border border-primary/30 px-2 py-0.5 rounded bg-primary/10 shadow-md text-primary/80 z-10", top: "22%", left: "105%", delay: 1, duration: 6.5 },
  { char: "S", size: "text-[11px] font-mono border border-primary/30 px-2 py-0.5 rounded bg-primary/10 shadow-md text-primary/80 z-10", top: "55%", left: "-8%", delay: 2.5, duration: 7.2 },
  { char: "space", size: "text-[9px] uppercase tracking-wider font-mono border border-primary/30 px-3.5 py-0.5 rounded bg-primary/10 shadow-md text-primary/80 z-10", top: "95%", left: "55%", delay: 0.8, duration: 8.5 },
  { char: "♩", size: "text-lg font-sans text-primary/70 z-10", top: "82%", left: "102%", delay: 3, duration: 6.8 },
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

const formVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.8,
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [q, setQ] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [results, setResults] = useState<TrackSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setErr(null);
    setCurrentPage(1);
    try {
      const r = await searchTracks(q);
      setResults(r);
      if (!r.length) setErr("No songs with synced lyrics found.");
    } catch {
      setErr("Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedResults = results.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <main className="flex flex-col justify-start items-center min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      <div className="flex min-h-[calc(100vh-73px)] flex-col justify-start ">
        <div className="flex justify-center items-start gap-26 px-6 py-28 h-auto">
          <div className="w-md flex-none flex flex-col justify-center text-left relative">
            {/* Floating music notes and keystroke elements */}
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

            <header className="mb-6">
              <motion.h1
                variants={titleContainerVariants}
                initial="hidden"
                animate="visible"
                className="text-6xl font-bold tracking-tight leading-tight text-foreground mb-4"
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
                className="text-sm text-muted-foreground leading-relaxed"
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
                . A clean, minimal{" "}
                <span className="inline-block text-foreground font-medium underline decoration-primary/30 decoration-2 underline-offset-4 cursor-default">
                  rhythm typing experience
                </span>{" "}
                built for music lovers.
              </motion.p>
            </header>
            
            {/* Quick feature list */}
            {/* <div className="flex flex-col gap-2.5 text-xs font-mono text-muted-foreground/80 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">✓</span> Sync with YouTube & Spotify audio
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">✓</span> osu!-style approach circle cues
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">✓</span> Real-time accuracy & speed tracking
              </div>
            </div> */}
          </div>

          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-start w-120 max-w-full shrink-0 md:mt-[75px]"
          >
            <form onSubmit={onSearch} className="flex flex-col border-primary border-b gap-2 py-2">
              <div className="grid grid-cols-[1fr_42px] items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="relative">
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      onBlur={() => setSearchFocused(false)}
                      onFocus={() => setSearchFocused(true)}
                      placeholder=""
                      className="w-full bg-background px-4 py-3 font-mono text-sm text-foreground outline-none"
                    />
                    <label
                      className={`pointer-events-none absolute left-4 bg-background px-1 font-mono transition-all ${
                        searchFocused || q.length > 0
                          ? "-top-6 text-xs text-muted-foreground"
                          : "top-3 text-sm text-muted-foreground"
                      }`}
                    >
                      Search song or artist...
                    </label>
                  </div>
                </div>

                <div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.70 }}
                    type="submit"
                    disabled={loading}
                    className="w-[42px] h-[42px] bg-primary text-primary-foreground transition-all shadow-sm rounded-md flex items-center justify-center cursor-pointer disabled:opacity-50 hover:opacity-90"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Search className="h-5 w-5" strokeWidth={2.5} />
                    )}
                  </motion.button>
                </div>
              </div>
            </form>

            {/*
            {results.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95, duration: 0.4 }}
                className="mt-4 flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground/80 select-none"
              >
                <span className="flex items-center gap-1 shrink-0">
                  💡 Recommended:
                </span>
                
                <Link
                  to="/play/$trackId"
                  params={{ trackId: "1743852427" }}
                  search={{
                    artist: "Ravyn Lenae",
                    track: "Love Me Not",
                    art: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/07/8c/6c/078c6c94-d38d-0451-d57b-23e957b569f8/075679660893.jpg/100x100bb.jpg",
                    duration: 213
                  }}
                  className="px-2.5 py-1 rounded-full border border-border/40 bg-card/25 hover:bg-primary/10 hover:border-primary/40 hover:text-foreground transition-all flex items-center gap-1 shadow-sm"
                >
                  Love Me Not ⚡
                </Link>

                <Link
                  to="/play/$trackId"
                  params={{ trackId: "1579787410" }}
                  search={{
                    artist: "The Kid LAROI & Justin Bieber",
                    track: "STAY",
                    art: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a8/3a/22/a83a22f7-af18-7ef6-a7de-74816c532a44/886449475421.jpg/100x100bb.jpg",
                    duration: 142
                  }}
                  className="px-2.5 py-1 rounded-full border border-border/40 bg-card/25 hover:bg-primary/10 hover:border-primary/40 hover:text-foreground transition-all flex items-center gap-1 shadow-sm"
                >
                  STAY 🎵
                </Link>

                <Link
                  to="/play/$trackId"
                  params={{ trackId: "1193701400" }}
                  search={{
                    artist: "Ed Sheeran",
                    track: "Perfect",
                    art: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/100x100bb.jpg",
                    duration: 263
                  }}
                  className="px-2.5 py-1 rounded-full border border-border/40 bg-card/25 hover:bg-primary/10 hover:border-primary/40 hover:text-foreground transition-all flex items-center gap-1 shadow-sm"
                >
                  Perfect ☘️
                </Link>

                <Link
                  to="/recommended"
                  className="text-primary font-semibold hover:opacity-85 transition-opacity ml-1 flex items-center gap-0.5 border-b border-primary/20 hover:border-primary"
                >
                  View All &rarr;
                </Link>
              </motion.div>
            )}
            */}

            {err && <p className="mt-4 text-sm text-incorrect">{err}</p>}

            <div>
              {loading ? (
                <ul className="mt-8 space-y-4">
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
                  <ul className="mt-8 divide-y divide-border">
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
                          className="flex items-center gap-4 rounded-md px-2 py-3 transition-colors hover:bg-muted/60"
                        >
                          {t.artworkUrl100 ? (
                            <img src={t.artworkUrl100} alt="" className="h-10 w-10 rounded-full shrink-0" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                              ♪
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{t.trackName}</p>
                            <p className="truncate text-sm text-muted-foreground">{t.artistName}</p>
                          </div>
                          <span className="font-mono text-xs text-primary">play -&gt;</span>
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
        </div>

        <Footer />
      </div>
    </main>
  );
}
