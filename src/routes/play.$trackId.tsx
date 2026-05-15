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

function getAudioType(src: string) {
  const lower = src.split("?")[0].split("#")[0].toLowerCase();
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".m4a") || lower.endsWith(".mp4") || lower.endsWith(".aac"))
    return "audio/mp4";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".ogg") || lower.endsWith(".oga")) return "audio/ogg";
  return "";
}

function PlayPage() {
  const { artist, track, preview, art } = Route.useSearch();
  const [lines, setLines] = useState<LyricLine[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const [typed, setTyped] = useState("");
  const [stats, setStats] = useState({ correct: 0, total: 0, started: 0 });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const lyricsRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [audioType, setAudioType] = useState("");
  const [playing, setPlaying] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [audioErr, setAudioErr] = useState<string | null>(null);
  const [previewSupported, setPreviewSupported] = useState(true);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);

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

  // Set audio type when preview URL is available
  useEffect(() => {
    if (preview) {
      const type = getAudioType(preview);
      setAudioType(type);
      setPreviewSupported(!!type);
    }
  }, [preview]);

  // Search for YouTube video
  useEffect(() => {
    const searchYouTube = async () => {
      try {
        const query = `${artist} ${track} official`;
        const response = await fetch(`/api/youtube-search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = (await response.json()) as { videoId?: string };
          if (data.videoId) {
            setYoutubeVideoId(data.videoId);
          }
        }
      } catch (error) {
        console.error("YouTube search failed:", error);
      }
    };
    if (artist && track) {
      searchYouTube();
    }
  }, [artist, track]);

  const fullText = useMemo(() => {
    if (!lines) return "";
    return lines.map((l) => l.text).join("\n");
  }, [lines]);

  // Scroll to current line
  useEffect(() => {
    if (!lyricsRef.current) return;
    const lines = lyricsRef.current.querySelectorAll("[data-line-idx]");
    const currentLine = lines[currentLineIdx] as HTMLElement;
    if (currentLine) {
      currentLine.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentLineIdx]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!fullText || !lines) return;
    const v = e.target.value.toLowerCase();

    // Check if user pressed Enter to move to next line
    if (e.nativeEvent instanceof KeyboardEvent && e.nativeEvent.key === "Enter") {
      setTyped("");
      setCurrentLineIdx((idx) => Math.min(idx + 1, lines.length - 1));
      return;
    }

    // Get current line
    const currentLine = lines[currentLineIdx]?.text || "";
    const typedLower = v.toLowerCase();

    // Check if typed matches current line (allowing some flexibility)
    if (v.length > currentLine.length) return;

    if (v.length > typed.length) {
      const newChars = v.slice(typed.length);
      let c = 0;
      for (let i = 0; i < newChars.length; i++) {
        const typedChar = v[typed.length + i]?.toLowerCase() || "";
        const lineChar = currentLine[typed.length + i]?.toLowerCase() || "";
        if (typedChar === lineChar) c++;
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
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch((err) => {
        console.error("Play error:", err);
        setAudioErr("Failed to play audio.");
      });
      setPlaying(true);
    }
    inputRef.current?.focus();
  }

  function restart() {
    setTyped("");
    setCurrentLineIdx(0);
    setStats({ correct: 0, total: 0, started: 0 });

    // Reset audio to beginning
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      // Auto-play if audio is ready
      if (audioReady) {
        audioRef.current.play().catch((err) => console.error("Play error:", err));
      }
    }

    inputRef.current?.focus();
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground font-sans">
      {/* YouTube Background Video */}
      {youtubeVideoId && (
        <div className="absolute inset-0 z-0 opacity-40">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0&controls=0&modestbranding=1&loop=1&playlist=${youtubeVideoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 z-10 bg-black/40" />

      {/* Content Overlay */}
      <div className="relative z-20 mx-auto max-w-4xl px-6 py-10">
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
            {/* Spotify-style lyrics display */}
            <div
              ref={lyricsRef}
              className="relative mt-12 h-96 overflow-hidden rounded-lg bg-gradient px-6 py-12"
              onClick={() => inputRef.current?.focus()}
              style={{
                scrollBehavior: "smooth",
              }}
            >
              {lines.map((line, idx) => {
                const isCurrentLine = idx === currentLineIdx;
                const isPassed = idx < currentLineIdx;
                const lineText = line.text;
                const typedLower = typed.toLowerCase();
                const lineLower = lineText.toLowerCase();

                return (
                  <div
                    key={idx}
                    data-line-idx={idx}
                    className={`mb-8 text-center transition-all duration-300 ${
                      isCurrentLine ? "scale-110" : "scale-95"
                    } ${isPassed ? "opacity-40" : "opacity-100"}`}
                  >
                    <div className="text-3xl font-bold leading-relaxed">
                      {isCurrentLine
                        ? // Display current line with character-by-character feedback
                          lineText.split("").map((ch, charIdx) => {
                            const typedChar = typed[charIdx];
                            let className = "text-muted-foreground";

                            if (charIdx < typed.length) {
                              className =
                                typedChar?.toLowerCase() === ch.toLowerCase()
                                  ? "text-correct font-semibold"
                                  : "text-incorrect underline decoration-incorrect font-semibold";
                            } else if (charIdx === typed.length) {
                              className = "text-foreground animate-pulse";
                            }

                            return (
                              <span key={charIdx} className={className}>
                                {ch}
                              </span>
                            );
                          })
                        : // Display other lines as-is
                          lineText}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hidden input for capturing keyboard events */}
            <input
              ref={inputRef}
              value={typed}
              onChange={onChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setTyped("");
                  setCurrentLineIdx((idx) => Math.min(idx + 1, lines.length - 1));
                }
              }}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              className="sr-only"
            />

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={togglePlay}
                disabled={!preview || !previewSupported || !audioReady}
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
              previewSupported ? (
                <>
                  <audio
                    ref={audioRef}
                    src={preview}
                    type={audioType}
                    preload="auto"
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onEnded={() => setPlaying(false)}
                    onError={(e) => {
                      console.log("audio error", e);
                      setAudioErr("Audio preview failed to load.");
                      setAudioReady(false);
                      setPlaying(false);
                    }}
                    onLoadedData={() => {
                      console.log("audio loaded data");
                      setAudioErr(null);
                      setAudioReady(true);
                    }}
                    onCanPlayThrough={() => {
                      console.log("audio can play through");
                      setAudioReady(true);
                    }}
                  />
                  {audioErr && (
                    <p className="mt-4 text-center text-xs text-incorrect">{audioErr}</p>
                  )}
                  {!audioReady && !audioErr && (
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      Loading audio preview…
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-4 text-center text-xs text-incorrect">
                  Audio preview format is not supported by the browser.
                </p>
              )
            ) : (
              <p className="mt-4 text-center text-xs text-incorrect">
                No audio preview available — type at your own pace.
              </p>
            )}

            <p className="mt-6 text-center font-mono text-xs text-muted-foreground">
              Just start typing — press <span className="font-bold">Enter</span> to go to the next
              line
            </p>
          </>
        )}
      </div>
    </main>
  );
}
