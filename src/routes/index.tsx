import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Navbar } from "@/components/ui/navbar";
import { searchTracks, type TrackSearchResult } from "@/lib/lrc";
import { motion } from "motion/react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [q, setQ] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [results, setResults] = useState<TrackSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      const r = await searchTracks(q);
      setResults(r);
      if (!r.length) setErr("No songs with previews found.");
    } catch {
      setErr("Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col justify-center items-center min-h-screen bg-background text-foreground font-sans" style={{ zoom: 0.8 }}>
      <Navbar />

      <div className="flex min-h-[calc(100vh-73px)] flex-col justify-between">
        <div className="flex flex-col justify-around gap-2 px-6 py-28">
          <div className="w-md flex-none">
            <header className="mb-12">
              {/* <h1 className="text-left font-mono text-4xl font-medium tracking-tight">
                lyric<span className="border-b-2 border-primary text-primary">type</span>
              </h1> */}
              <p className="py-2 text-center text-2xl text-gray-600 tracking-tight font-medium leading-tight">
                Search a song. Type the lyrics in time with the music.
              </p>
            </header>
          </div>

          <div className="flex justify-center  w-120  max-w-full shrink-0 flex-col">
            <form onSubmit={onSearch} className="flex flex-col border-black border-b gap-2 py-2">
              <div className="grid grid-cols-[1fr_6rem] items-start gap-2">
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
                    className="w-full h-[42px] bg-black text-primary-foreground transition-all shadow-sm rounded-md flex items-center justify-center text-sm font-medium cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "..." : "Search"}
                  </motion.button>
                </div>
              </div>
            </form>

            {err && <p className="mt-4 text-sm text-incorrect">{err}</p>}

            <div>
              <ul className="mt-8 divide-y divide-border">
                {results.map((t) => (
                  <li key={t.trackId}>
                    <Link
                      to="/play/$trackId"
                      params={{ trackId: String(t.trackId) }}
                      search={{
                        artist: t.artistName,
                        track: t.trackName,
                        preview: t.previewUrl ?? "",
                        art: t.artworkUrl100 ?? "",
                      }}
                      className="flex items-center gap-4 rounded-md px-2 py-3 transition-colors hover:bg-muted/60"
                    >
                      {t.artworkUrl100 && (
                        <img src={t.artworkUrl100} alt="" className="h-12 w-12 rounded" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{t.trackName}</p>
                        <p className="truncate text-sm text-muted-foreground">{t.artistName}</p>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">play -&gt;</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <footer className="pb-8 text-center text-xs text-muted-foreground">
          Lyrics via LRCLIB - Previews via iTunes
        </footer>
      </div>
    </main>
  );
}
