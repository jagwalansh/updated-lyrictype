import * as Dialog from "@radix-ui/react-dialog";
import { Search, X, Loader2, Play } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { searchTracks, type TrackSearchResult } from "@/lib/lrc";
import { useNavigate } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<TrackSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedResults = results.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [q]);

  // Focus input on mount
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setQ("");
      setResults([]);
      setErr(null);
    }
  }, [open]);

  // Debounced/Reactive Search
  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setErr(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      setErr(null);
      try {
        const r = await searchTracks(q);
        setResults(r);
        if (!r.length) setErr("No songs with synced lyrics found.");
      } catch {
        setErr("Search failed. Try again.");
      } finally {
        setLoading(false);
      }
    }, 450); // 450ms debounce time to avoid spamming LRCLIB API

    return () => clearTimeout(delayDebounce);
  }, [q]);

  const handlePlayClick = (t: TrackSearchResult) => {
    onOpenChange(false);
    navigate({
      to: "/play/$trackId",
      params: { trackId: String(t.id) },
      search: {
        artist: t.artistName,
        track: t.trackName,
        art: t.artworkUrl100 || "",
        duration: t.duration,
        from: typeof window !== "undefined" ? window.location.pathname : "/",
      },
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.08] dark:border-white/[0.03] bg-card/65 dark:bg-card/45 backdrop-blur-2xl p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95">
          {/* Header & Close */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-bold tracking-tight text-foreground font-mono">
                Find Songs to Play
              </Dialog.Title>
              <Dialog.Description className="text-xs text-muted-foreground mt-0.5">
                Type the artist or track name to search for synced lyrics.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close search dialog"
                className="cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <input
              ref={inputRef}
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type track name or artist..."
              className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.07] border-b border-white/[0.06] dark:border-white/[0.03] focus:border-primary/45 focus:ring-1 focus:ring-primary/20 text-sm font-mono rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all duration-300 text-foreground shadow-inner"
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Results Area */}
          <div className="min-h-[220px] max-h-[360px] overflow-hidden pr-1">
            {loading ? (
              <ul className="space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 px-2 py-2.5 border-b border-border/10 last:border-0"
                  >
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                      <Skeleton className="h-4.5 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : err ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="text-xs font-mono text-incorrect">{err}</span>
              </div>
            ) : results.length > 0 ? (
              <ul className="divide-y divide-border/20">
                {paginatedResults.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => handlePlayClick(t)}
                      className="w-full flex items-center gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/70 text-left group cursor-pointer"
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
                        <p className="truncate font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                          {t.trackName}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground mt-0.5">
                          {t.artistName}
                        </p>
                      </div>

                      <span className="font-mono text-[10px] font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1.5 shrink-0">
                        <Play className="h-2.5 w-2.5 fill-current" />
                        PLAY
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground/60 select-none">
                <Search className="h-10 w-10 stroke-1 mb-2 text-muted-foreground/40" />
                <p className="text-xs font-mono">Start typing to search tracks</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {results.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20 font-mono text-[10px] text-muted-foreground">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-md border border-border/40 hover:bg-muted/60 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
              >
                &larr; Prev
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-md border border-border/40 hover:bg-muted/60 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
