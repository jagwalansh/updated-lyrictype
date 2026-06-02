import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Calendar, Clock, ArrowLeft, Music } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    links: [{ rel: "canonical", href: "https://keyverse.me/leaderboard" }],
  }),
  component: LeaderboardPage,
});

async function fetchLeaderboard(period: "daily" | "weekly" | "alltime") {
  const viewName = `${period}_leaderboard`;
  const { data, error } = await supabase
    .from(viewName as any)
    .select("*")
    .order("best_score", { ascending: false })
    .limit(500);

  if (error) throw error;
  return data || [];
}

// Custom Premium SVG Rank Badge Component
const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return (
      <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 border border-amber-300/40 shadow-[0_0_12px_rgba(251,191,36,0.35)] flex items-center justify-center select-none mx-auto">
        <svg className="w-3.5 h-3.5 text-amber-950 fill-current" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 border border-slate-200/40 shadow-[0_0_12px_rgba(203,213,225,0.35)] flex items-center justify-center select-none mx-auto">
        <svg className="w-3.5 h-3.5 text-slate-900 fill-current" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 border border-amber-600/40 shadow-[0_0_12px_rgba(217,119,6,0.3)] flex items-center justify-center select-none mx-auto">
        <svg className="w-3.5 h-3.5 text-orange-950 fill-current" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
    );
  }
  return <span className="text-xs text-muted-foreground font-mono font-bold">#{rank}</span>;
};

function LeaderboardPage() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "alltime">("alltime");

  const { data: dbScores = [], isLoading, error } = useQuery({
    queryKey: ["leaderboard", period],
    queryFn: () => fetchLeaderboard(period),
    refetchInterval: 10000, // Auto-refetch every 10 seconds for real-time feel
  });

  const scores = useMemo(() => {
    if (isLoading || error) return [];

    const bestScoreByUser = new Map<string, any>();

    dbScores
      .map((score: any) => ({
        user_id: score.user_id,
        song_id: score.song_id,
        username: score.username,
        track: score.track,
        artist: score.artist,
        art_url: score.art_url,
        best_score: score.best_score,
        best_accuracy: score.best_accuracy,
      }))
      .sort((a: any, b: any) => b.best_score - a.best_score)
      .forEach((score: any) => {
        if (!bestScoreByUser.has(score.user_id)) {
          bestScoreByUser.set(score.user_id, score);
        }
      });

    return Array.from(bestScoreByUser.values()).slice(0, 50);
  }, [dbScores, isLoading, error]);

  const periodOptions = [
    { id: "daily", label: "Daily", icon: Clock, desc: "Last 24 Hours" },
    { id: "weekly", label: "Weekly", icon: Calendar, desc: "Last 7 Days" },
    { id: "alltime", label: "All-Time", icon: Trophy, desc: "Hall of Fame" },
  ] as const;

  return (
    <main className="flex flex-col justify-start items-center min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      <div className="w-full max-w-4xl mx-auto px-6 py-28 flex flex-col gap-8 flex-1 justify-start">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/20 pb-6">
          <div className="text-left">
            <div className="text-xs font-mono text-primary font-semibold tracking-wider uppercase mb-1 flex items-center gap-1.5">
              Global Rankings
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground bg-clip-text">
              Leaderboard
            </h1>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xl">
              Type with absolute speed and perfect accuracy to rise through the ranks. Only the absolute best make the cut!
            </p>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 self-start md:self-auto px-4 py-2 text-xs font-mono font-semibold border border-border/40 hover:border-primary/50 bg-card/45 backdrop-blur-sm hover:bg-muted/60 text-muted-foreground hover:text-foreground rounded-lg transition-all shadow-sm shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Songs
          </Link>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex justify-center md:justify-start">
          <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-xl border border-border/40 backdrop-blur-sm shadow-inner">
            {periodOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = period === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setPeriod(opt.id)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wide transition-all cursor-pointer select-none ${
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-period"
                      className="absolute inset-0 bg-primary rounded-lg z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="h-3.5 w-3.5 relative z-10" />
                  <span className="relative z-10">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Table / Content */}
        <div className="w-full relative z-10">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/20 bg-card/25 animate-pulse"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded bg-muted/60" />
                    <div className="w-32 h-4 rounded bg-muted/60" />
                  </div>
                  <div className="w-24 h-4 rounded bg-muted/60" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center p-8 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 font-mono text-sm">
              Error fetching leaderboard data: {error.message}
            </div>
          ) : scores.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border/40 bg-card/25 backdrop-blur-md shadow-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/20 bg-muted/30 font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
                    <th className="py-4 px-6 text-center w-16">Rank</th>
                    <th className="py-4 px-4">Player</th>
                    <th className="py-4 px-4">Song</th>
                    <th className="py-4 px-4 text-center w-24">Accuracy</th>
                    <th className="py-4 px-6 text-right w-32">Score</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {scores.map((row: any, index: number) => {
                      const rank = index + 1;
                      
                      let rankStyle = "text-muted-foreground font-mono font-medium";
                      let rowBgStyle = "hover:bg-muted/15 border-b border-border/10";

                      if (rank === 1) {
                        rankStyle = "text-amber-400 font-extrabold";
                        rowBgStyle = "bg-amber-400/5 hover:bg-amber-400/10 border-b border-amber-400/15";
                      } else if (rank === 2) {
                        rankStyle = "text-slate-300 font-extrabold";
                        rowBgStyle = "bg-slate-300/5 hover:bg-slate-300/10 border-b border-slate-300/15";
                      } else if (rank === 3) {
                        rankStyle = "text-amber-600/80 font-extrabold";
                        rowBgStyle = "bg-amber-600/5 hover:bg-amber-600/10 border-b border-amber-600/15";
                      }

                      return (
                        <motion.tr
                          key={`${row.user_id}-${row.song_id}-${row.best_score}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.4) }}
                          className={`group transition-colors ${rowBgStyle}`}
                        >
                          {/* Rank */}
                          <td className="py-4 px-6 text-center">
                            <RankBadge rank={rank} />
                          </td>

                          {/* Player Username */}
                          <td className="py-4 px-4 font-semibold text-sm">
                            <span className="text-foreground group-hover:text-primary transition-colors">
                              {row.username}
                            </span>
                          </td>

                          {/* Song with Art */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3 max-w-[280px] md:max-w-md">
                              <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0 border border-border/20 bg-muted flex items-center justify-center">
                                {row.art_url ? (
                                  <img
                                    src={row.art_url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Music className="h-4.5 w-4.5 text-muted-foreground/60" />
                                )}
                              </div>
                              <div className="min-w-0 text-left">
                                <p className="truncate font-semibold text-xs text-foreground leading-snug">
                                  {row.track}
                                </p>
                                <p className="truncate text-[10px] text-muted-foreground mt-0.5 font-medium font-sans">
                                  {row.artist}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Accuracy */}
                          <td className="py-4 px-4 text-center font-mono text-sm font-semibold text-foreground/80">
                            {Number(row.best_accuracy).toFixed(1)}%
                          </td>

                          {/* Raw Score */}
                          <td className="py-4 px-6 text-right font-mono text-sm font-bold text-primary tabular-nums">
                            {Number(row.best_score).toLocaleString()}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-border/40 bg-card/25 backdrop-blur-md max-w-md mx-auto mt-6"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-md animate-pulse" />
        <Trophy className="h-8 w-8 text-primary relative z-10" />
      </div>
      <h3 className="text-xl font-bold tracking-tight mb-2">No Scores Yet!</h3>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        The leaderboard for this period is empty. Be the first to type your way to the top!
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold font-mono text-sm hover:opacity-90 transition-opacity cursor-pointer shadow-lg"
      >
        Play a Song
      </Link>
    </motion.div>
  );
}
