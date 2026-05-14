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

function PlayPage() {
  const { artist, track, preview, art } = Route.useSearch();
  const [lines, setLines] = useState<LyricLine[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [typed, setTyped] = useState("");
  const [stats, setStats] = useState({ correct: 0, total: 0, started: 0 });
  const [doneIdx, setDoneIdx] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  // Time tracking
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setTime(a.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, [lines]);

  const currentIdx = useMemo(() => {
    if (!lines) return -1;
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].time <= time + 0.05) idx = i;
      else break;
    }
    return idx;
  }, [lines, time]);

  const currentLine = currentIdx >= 0 && lines ? lines[currentIdx].text : "";

  // Reset typed when line advances
  useEffect(() => {
    if (currentIdx !== doneIdx) {
      setTyped("");
    }
  }, [currentIdx, doneIdx]);

  // Auto-finalize previous line when it advances
  useEffect(() => {
    if (!lines || currentIdx <= 0) return;
    // when currentIdx changes, count what user typed in *previous* line
    // (we already cleared typed; nothing further to do — stats are updated on keystroke)
  }, [currentIdx, lines]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!currentLine) return;
    const v = e.target.value;
    if (v.length > currentLine.length) return;
    // Update stats incrementally only for new chars
    const prev = typed;
    if (v.length > prev.length) {
      const newChars = v.slice(prev.length);
      let c = 0;
      for (let i = 0; i < newChars.length; i++) {
        const idx = prev.length + i;
        if (newChars[i] === currentLine[idx]) c++;
      }
      setStats((s) => ({
        correct: s.correct + c,
        total: s.total + newChars.length,
        started: s.started || Date.now(),
      }));
    }
    setTyped(v);
    if (v === currentLine) setDoneIdx(currentIdx);
  }

  const accuracy = stats.total ? Math.round((stats.correct / stats.total) * 100) : 100;
  const elapsed = stats.started ? (Date.now() - stats.started) / 1000 / 60 : 0;
  const wpm = elapsed > 0 ? Math.round(stats.correct / 5 / elapsed) : 0;

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play();
    else a.pause();
    inputRef.current?.focus();
  }

  function restart() {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play();
    setTyped("");
    setStats({ correct: 0, total: 0, started: 0 });
    setDoneIdx(-1);
    inputRef.current?.focus();
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      <div className="mx-auto max-w-3xl px-6 py-10">
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
            <p className="mt-2 text-xs text-muted-foreground">
              Try a different version of the song, or pick another track.
            </p>
          </div>
        )}

        {!lines && !loadErr && (
          <p className="mt-10 text-center font-mono text-sm text-muted-foreground">
            Loading lyrics…
          </p>
        )}

        {lines && (
          <>
            {/* Lyric viewport */}
            <div className="mt-10 min-h-[180px] space-y-3 text-center">
              {[currentIdx - 1, currentIdx, currentIdx + 1].map((i, pos) => {
                if (i < 0 || i >= lines.length)
                  return <p key={pos} className="h-7" />;
                const line = lines[i];
                const isCurrent = pos === 1;
                if (!isCurrent) {
                  return (
                    <p
                      key={`${i}-${pos}`}
                      className="truncate font-mono text-base text-muted-foreground/50"
                    >
                      {line.text}
                    </p>
                  );
                }
                return (
                  <p
                    key={`${i}-${pos}`}
                    className="font-mono text-2xl leading-relaxed tracking-tight"
                  >
                    {line.text.split("").map((ch, idx) => {
                      let cls = "text-pending";
                      if (idx < typed.length) {
                        cls = typed[idx] === ch ? "text-correct" : "text-incorrect underline";
                      } else if (idx === typed.length) {
                        cls = "text-foreground border-l-2 border-primary -ml-[2px]";
                      }
                      return (
                        <span key={idx} className={cls}>
                          {ch}
                        </span>
                      );
                    })}
                  </p>
                );
              })}
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              value={typed}
              onChange={onChange}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              placeholder={playing ? "type the line above…" : "press play to start"}
              className="mt-8 w-full rounded-md border border-border bg-card px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            {/* Audio controls */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={togglePlay}
                className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
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
                No audio preview available for this track.
              </p>
            )}

            <p className="mt-6 text-center font-mono text-xs text-muted-foreground">
              Note: iTunes previews are 30 seconds — lyrics scroll for the full song so type along to what you hear.
            </p>
          </>
        )}
      </div>
    </main>
  );
}