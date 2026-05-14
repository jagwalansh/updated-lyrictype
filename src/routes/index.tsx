import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { searchTracks, type ITunesTrack } from "@/lib/lrc";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ITunesTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSearch(e: React.FormEvent) {
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
    <main className="min-h-screen bg-background text-foreground font-sans">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <header className="mb-12 text-center">
          <h1 className="font-mono text-4xl font-medium tracking-tight">
            lyric<span className="text-primary">type</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Search a song. Type the lyrics in time with the music.
          </p>
        </header>

        <form onSubmit={onSearch} className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search song or artist…"
            className="flex-1 rounded-md border border-border bg-card px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "…" : "Search"}
          </button>
        </form>

        {err && <p className="mt-4 text-sm text-incorrect">{err}</p>}

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
                className="flex items-center gap-4 py-3 transition-colors hover:bg-muted/60 rounded-md px-2"
              >
                {t.artworkUrl100 && (
                  <img src={t.artworkUrl100} alt="" className="h-12 w-12 rounded" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{t.trackName}</p>
                  <p className="truncate text-sm text-muted-foreground">{t.artistName}</p>
                </div>
                <span className="font-mono text-xs text-muted-foreground">play →</span>
              </Link>
            </li>
          ))}
        </ul>

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          Lyrics via LRCLIB · Previews via iTunes
        </footer>
      </div>
    </main>
  );
}
