import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchSyncedLyrics, type LyricLine } from "@/lib/lrc";

interface Search {
  artist: string;
  track: string;
  preview: string;
  art: string;
}

export const Route = createFileRoute("/play/$trackId")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    artist: String(s.artist ?? ""),
    track: String(s.track ?? ""),
    preview: String(s.preview ?? ""),
    art: String(s.art ?? ""),
  }),
  component: PlayPage,
});

const SEP = "  ¶  ";

function PlayPage() {
  const { artist, track, preview, art } = Route.useSearch();
  const [lines, setLines] = useState<LyricLine[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [stats, setStats] = useState({ correct: 0, total: 0, started: 0 });
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLSpanElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchSyncedLyrics(artist, track)
      .then((r) => {
        if (cancelled) return;
        if (!r || r.length === 0) setLoadErr("No synced lyrics found for this song.");
        else setLines(r);
      })
      .catch(() => !cancelled && setLoadErr("Failed to load lyrics."));
    return () => {
      cancelled = true;
    };
  }, [artist, track]);

  const fullText = useMemo(() => {
    if (!lines) return "";
    return lines.map((l) => l.text).join(SEP);
  }, [lines]);

  // Keep the active character centered in the viewport with smooth transform.
  useEffect(() => {
    const cursor = cursorRef.current;
    const viewport = viewportRef.current;
    if (!cursor || !viewport) return;
    const cursorX = cursor.offsetLeft + cursor.offsetWidth / 2;
    setOffset(viewport.clientWidth / 2 - cursorX);
  }, [typed, fullText]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!fullText) return;
    const v = e.target.value;
    if (v.length > fullText.length) return;
    if (v.length > typed.length) {
      const newChars = v.slice(typed.length);
      let c = 0;
      for (let i = 0; i < newChars.length; i++) {
        if (newChars[i] === fullText[typed.length + i]) c++;
      }
      setStats((s) => ({
        correct: s.correct + c,
        total: s.total + newChars.length,
        started: s.started || Date.now(),
      }));
    }
    setTyped(v);
  }

  const accuracy = stats.total ? Math.round((stats.correct / stats.total) * 100) : 100;
  const elapsed = stats.started ? (Date.now() - stats.started) / 1000 / 60 : 0;
  const wpm = elapsed > 0 ? Math.round(stats.correct / 5 / elapsed) : 0;

  function togglePlay() {
    const a = audioRef.current;
    if (a) {
      if (a.paused) a.play();
      else a.pause();
    }
    inputRef.current?.focus();
  }

  function restart() {
    const a = audioRef.current;
    if (a) {
      a.currentTime = 0;
      a.play();
    }
    setTyped("");
    setStats({ correct: 0, total: 0, started: 0 });
    inputRef.current?.focus();
  }

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, [lines]);

  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link to="/" className="font-mono text-xs text-muted-foreground hover:text-foreground">
          ← back
        </Link>

        <div className="mt-6 flex items-center gap-4">
          {art && <img src={art} alt="" className="h-16 w-16 rounded" />}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold">{track}</h1>
            <p className="truncate text-sm text-muted-foreground">{artist}</p>
          </div>
          <div className="text-right font-mono text-sm">
            <div>
              <span className="text-primary">{wpm}</span>{" "}
              <span className="text-muted-foreground">wpm</span>
            </div>
            <div>
              <span className="text-primary">{accuracy}%</span>{" "}
              <span className="text-muted-foreground">acc</span>
            </div>
          </div>
        </div>

        {loadErr && (
          <div className="mt-10 rounded-md border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">{loadErr}</p>
          </div>
        )}

        {!lines && !loadErr && (
          <p className="mt-10 text-center font-mono text-sm text-muted-foreground">
            Loading lyrics…
          </p>
        )}

        {lines && (
          <>
            {/* Smooth scrolling lyric ticker */}
            <div
              ref={viewportRef}
              className="relative mt-12 h-24 overflow-hidden"
              style={{
                maskImage:
                  "linear-gradient(90deg, transparent, black 15%, black 85%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(90deg, transparent, black 15%, black 85%, transparent)",
              }}
              onClick={() => inputRef.current?.focus()}
            >
              {/* center indicator */}
              <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-primary/30" />
              <div
                ref={trackRef}
                className="absolute top-1/2 -translate-y-1/2 whitespace-pre font-mono text-3xl leading-none tracking-tight will-change-transform"
                style={{
                  transform: `translateX(${offset}px)`,
                  transition: "transform 120ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                {fullText.split("").map((ch, idx) => {
                  const isCursor = idx === typed.length;
                  let cls = "text-pending";
                  if (idx < typed.length) {
                    cls =
                      typed[idx] === ch
                        ? "text-correct"
                        : "text-incorrect underline decoration-incorrect";
                  } else if (isCursor) {
                    cls = "text-foreground";
                  }
                  return (
                    <span
                      key={idx}
                      ref={isCursor ? cursorRef : undefined}
                      className={cls}
                    >
                      {ch}
                    </span>
                  );
                })}
                {/* trailing cursor when finished */}
                {typed.length === fullText.length && (
                  <span ref={cursorRef} />
                )}
              </div>
            </div>

            <input
              ref={inputRef}
              value={typed}
              onChange={onChange}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              placeholder="start typing the lyrics…"
              className="mt-8 w-full rounded-md border border-border bg-card px-4 py-3 text-center font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={togglePlay}
                disabled={!preview}
                className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {playing ? "Pause" : "Play"}
              </button>
              <button
                onClick={restart}
                className="rounded-md border border-border px-6 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Restart
              </button>
            </div>

            {preview ? (
              <audio ref={audioRef} src={preview} preload="auto" />
            ) : (
              <p className="mt-4 text-center text-xs text-incorrect">
                No audio preview available — type at your own pace.
              </p>
            )}

            <p className="mt-6 text-center font-mono text-xs text-muted-foreground">
              Type to overwrite the lyrics — the line scrolls smoothly under your cursor.
            </p>
          </>
        )}
      </div>
    </main>
  );
}