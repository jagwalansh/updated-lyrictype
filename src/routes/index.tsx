import { createFileRoute, Link } from "@tanstack/react-router";
import { LogIn, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AccountModal } from "@/components/ui/account-modal";
import { AuthModal } from "@/components/ui/auth-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { searchTracks, type TrackSearchResult } from "@/lib/lrc";
import { useModal } from "@/lib/modal-context";
import { motion } from "motion/react";
const Home = () => {
  return (
    <div className="flex items-center justify-center">
      <svg
        width="18px"
        height="18px"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 6V15H6V11C6 9.89543 6.89543 9 8 9C9.10457 9 10 9.89543 10 11V15H15V6L8 0L1 6Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};

export default Home;
export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const box = {
    width: 90,
    height: 42,
    backgroundColor: "black",
    borderRadius: 10,
  };

  const { setModalOpen } = useModal();
  const { user, profile, loading: authLoading } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
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
    <main className="flex flex-col justify-center items-center min-h-screen bg-background text-foreground font-sans">
      <nav className="text-md backdrop-blur-md border border-border/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl min-w-lg my-8 bg-card/60 dark:bg-card/40">
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="font-mono text-xl font-medium tracking-tight hover:opacity-90 transition-opacity">
            lyric<span className="border-b-2 border-primary text-primary">type</span>
          </Link>

          <div className="flex min-w-40 justify-around items-center ">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="py-1.5 border border-border/40 bg-card/50 hover:bg-card/85 hover:text-primary transition-all shadow-sm rounded-md px-3 cursor-pointer"
            >
              <Link to="/" className="font-mono text-xl font-medium tracking-tight">
                <Home />
              </Link>
            </motion.button>
            <motion.div whileHover={{ scale: 1.1 }} className="flex min-w-0 items-center gap-3">
              {authLoading ? (
                <div className="h-9 w-24 rounded-md bg-muted" />
              ) : user ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAccountOpen(true)}
                  >
                    <UserRound aria-hidden="true" />
                  </Button>
                </>
              ) : (
                <Button type="button" size="sm" onClick={() => setModalOpen(true)}>
                  <LogIn aria-hidden="true" />
                  Sign in
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-73px)] flex-col justify-between">
        <div className="flex flex-col justify-around gap-2 px-6 py-28">
          <div className="w-md flex-none">
            <header className="mb-12">
              {/* <h1 className="text-left font-mono text-4xl font-medium tracking-tight">
                lyric<span className="border-b-2 border-primary text-primary">type</span>
              </h1> */}
              <p className="py-2  text-center text-2xl text-gray-600">
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
                    whileTap={{ scale: 1 }}
                    style={box}
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-black py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
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

      <AuthModal />
      <AccountModal open={accountOpen} onOpenChange={setAccountOpen} />
    </main>
  );
}
