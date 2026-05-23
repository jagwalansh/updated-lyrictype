import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import { Navbar } from "@/components/ui/navbar";
import { fetchSyncedLyrics, type LyricLine } from "@/lib/lrc";
import YouTube, { type YouTubePlayer } from "react-youtube";

interface Search {
  artist: string;
  track: string;
  preview: string;
  art: string;
}

const SHOW_TYPING_ERRORS = true;

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
  const { artist, track, art } = Route.useSearch(); // We can ignore preview now
  const [lines, setLines] = useState<LyricLine[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const [typed, setTyped] = useState("");
  const [stats, setStats] = useState({ correct: 0, total: 0, started: 0 });
  
  // Game state
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [hitFeedback, setHitFeedback] = useState<{ id: number, text: string, type: string } | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const lyricsRef = useRef<HTMLDivElement | null>(null);
  
  const ytPlayerRef = useRef<YouTubePlayer | null>(null);
  const rafRef = useRef<number | null>(null);
  const currentTimeRef = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);

  const [videoId, setVideoId] = useState<string | null>(null);
  const [ytAuthor, setYtAuthor] = useState<string | null>(null);
  const [ytLoading, setYtLoading] = useState(true);

  // Prevent multiple triggers in rAF loop
  const lastCompletedLineRef = useRef(-1);

  // Keep refs for callbacks to avoid dependency cycles
  const typedRef = useRef(typed);
  useEffect(() => { typedRef.current = typed; }, [typed]);

  const comboRef = useRef(combo);
  useEffect(() => { comboRef.current = combo; }, [combo]);

  // Load Lyrics and YouTube ID
  useEffect(() => {
    let cancelled = false;
    
    async function loadData() {
      try {
        // 1. Fetch Lyrics
        const lyricsRes = await fetchSyncedLyrics(artist, track);
        if (cancelled) return;
        
        if (!lyricsRes || lyricsRes.lines.length === 0) {
          setLoadErr("No synced lyrics found for this song.");
          setYtLoading(false);
          return;
        }
        
        setLines(lyricsRes.lines);
        const expectedDuration = lyricsRes.duration;

        // 2. Fetch YouTube Video ID
        setYtLoading(true);
        const ytResponse = await fetch(`/api/youtube-search?q=${encodeURIComponent(artist + " " + track + " audio")}&duration=${expectedDuration}`);
        const d = await ytResponse.json();
        
        if (cancelled) return;
        
        if (d.videoId) {
           setVideoId(d.videoId);
           setYtAuthor(d.authorName);
        } else {
           setLoadErr("Could not find a YouTube video for this track.");
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setLoadErr("Failed to load track data.");
      } finally {
        if (!cancelled) setYtLoading(false);
      }
    }
    
    loadData();

    return () => {
      cancelled = true;
    };
  }, [artist, track]);

  // Clear hit feedback automatically
  useEffect(() => {
    if (hitFeedback) {
      const t = setTimeout(() => setHitFeedback(null), 1000);
      return () => clearTimeout(t);
    }
  }, [hitFeedback]);

  const fullText = useMemo(() => {
    if (!lines) return "";
    return lines.map((l) => l.text).join("\n");
  }, [lines]);

  // Scroll to current line
  useEffect(() => {
    if (!lyricsRef.current) return;
    const linesNodes = lyricsRef.current.querySelectorAll("[data-line-idx]");
    const currentLineNode = linesNodes[currentLineIdx] as HTMLElement;
    if (currentLineNode) {
      currentLineNode.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentLineIdx]);

  const handleLineComplete = useCallback((forceAdvance = false) => {
    if (!lines) return;
    const currentLine = lines[currentLineIdx]?.text || "";
    const currentTyped = typedRef.current;
    
    let correctChars = 0;
    const len = Math.min(currentTyped.length, currentLine.length);
    for (let i = 0; i < len; i++) {
        if (currentTyped[i]?.toLowerCase() === currentLine[i]?.toLowerCase()) correctChars++;
    }
    const lineAccuracy = currentLine.length > 0 ? correctChars / currentLine.length : 0;
    
    let type = "miss";
    let text = "MISS";
    let scoreAdded = 0;

    if (currentTyped.length > 0 && lineAccuracy >= 0.90) {
        type = "perfect";
        text = "PERFECT";
        scoreAdded = 300 * (1 + comboRef.current * 0.1);
        setCombo(c => c + 1);
    } else if (currentTyped.length > 0 && lineAccuracy >= 0.50) {
        type = "good";
        text = "GOOD";
        scoreAdded = 100 * (1 + comboRef.current * 0.1);
        setCombo(c => c + 1);
    } else {
        type = "miss";
        text = "MISS";
        setCombo(0);
    }

    setScore(s => Math.floor(s + scoreAdded));
    setHitFeedback({ id: Date.now(), text, type });

    setTyped("");
    setCurrentLineIdx(idx => Math.min(idx + 1, lines.length - 1));
  }, [lines, currentLineIdx]);

  // High precision time sync and animation loop
  const updateTime = useCallback(() => {
    if (ytPlayerRef.current && playing) {
      currentTimeRef.current = ytPlayerRef.current.getCurrentTime();
      
      if (lines && lines[currentLineIdx]) {
        const line = lines[currentLineIdx];
        const nextLineTime = lines[currentLineIdx + 1]?.time || line.time + 5;
        const timeDiff = line.time - currentTimeRef.current;
        const duration = nextLineTime - line.time;

        // Visual Updates
        const approachEl = document.getElementById('approach-circle');
        const progressEl = document.getElementById('progress-circle');

        if (approachEl) {
          if (timeDiff > 0 && timeDiff < 2.0) {
            approachEl.style.display = 'block';
            const size = 48 + (timeDiff * 50); // Shrinks down to 48px
            approachEl.style.width = `${size}px`;
            approachEl.style.height = `${size}px`;
            approachEl.style.opacity = timeDiff > 1.5 ? '0' : `${1 - (timeDiff/1.5)}`;
          } else {
            approachEl.style.display = 'none';
          }
        }

        if (progressEl) {
          if (timeDiff <= 0 && timeDiff > -duration) {
            progressEl.style.display = 'block';
            const progress = Math.abs(timeDiff) / duration;
            progressEl.style.strokeDashoffset = `${138.2 * progress}`;
          } else {
            progressEl.style.display = 'none';
          }
        }

        if (pulseEl) {
           const beat = currentTimeRef.current % 1;
           pulseEl.style.opacity = beat < 0.15 ? '1' : '0';
        }

        // Auto-advance
        if (currentTimeRef.current > nextLineTime + 0.2) {
          if (lastCompletedLineRef.current !== currentLineIdx) {
            lastCompletedLineRef.current = currentLineIdx;
            handleLineComplete(true);
          }
        }
      }
      
      rafRef.current = requestAnimationFrame(updateTime);
    }
  }, [playing, lines, currentLineIdx, handleLineComplete]);

  useEffect(() => {
    if (playing) {
      rafRef.current = requestAnimationFrame(updateTime);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, updateTime]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!fullText || !lines) return;
    const v = e.target.value.toLowerCase();

    const currentLine = lines[currentLineIdx]?.text || "";
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
    const player = ytPlayerRef.current;
    if (!player) return;

    if (playing) {
      setPlaying(false);
      player.pauseVideo();
    } else {
      setPlaying(true);
      player.playVideo();
    }
    inputRef.current?.focus();
  }

  function restart() {
    setTyped("");
    setCurrentLineIdx(0);
    setStats({ correct: 0, total: 0, started: 0 });
    setCombo(0);
    setScore(0);
    setHitFeedback(null);
    currentTimeRef.current = 0;
    lastCompletedLineRef.current = -1;

    const player = ytPlayerRef.current;
    if (player) {
      player.pauseVideo();
      player.seekTo(0, true);
      setPlaying(false);
    }

    inputRef.current?.focus();
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground font-sans flex flex-col items-center" style={{ zoom: 0.8 }}>
      <Navbar />

      {/* Content Overlay */}
      <div className="relative z-20 w-full max-w-6xl px-6 pb-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link to="/" className="font-mono text-xs text-muted-foreground hover:text-foreground">
            ← back
          </Link>

          <div className="flex items-center gap-6 font-mono text-sm border border-border/40 bg-card/45 backdrop-blur-md shadow-sm rounded-full px-5 py-2">
            <div>
              <span className="text-primary font-bold text-base">{score.toLocaleString()}</span>{" "}
              <span className="text-muted-foreground text-xs">score</span>
            </div>
            <div className="w-px h-4 bg-border/40" />
            <div>
              <span className="text-primary font-bold text-base">{combo}x</span>{" "}
              <span className="text-muted-foreground text-xs">combo</span>
            </div>
            <div className="w-px h-4 bg-border/40" />
            <div>
              <span className="text-primary font-bold text-base">{wpm}</span>{" "}
              <span className="text-muted-foreground text-xs">wpm</span>
            </div>
            <div className="w-px h-4 bg-border/40" />
            <div>
              <span className="text-primary font-bold text-base">{accuracy}%</span>{" "}
              <span className="text-muted-foreground text-xs">acc</span>
            </div>
          </div>
        </div>

        {loadErr && (
          <div className="mt-10 rounded-md border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">{loadErr}</p>
          </div>
        )}

        {(!lines || ytLoading) && !loadErr && (
          <p className="mt-10 text-center font-mono text-sm text-muted-foreground">
            {ytLoading ? "Finding YouTube video..." : "Loading lyrics..."}
          </p>
        )}

        {lines && !ytLoading && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 items-start">
            {/* Left Column: YouTube Video / Song Information Card */}
            <div className="flex flex-col gap-4">
              <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-border/40 shadow-lg bg-black flex flex-col items-center justify-center p-6 text-center">
                {videoId ? (
                  <>
                    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden rounded-xl bg-black">
                        <YouTube 
                          videoId={videoId}
                          opts={{ 
                            width: '100%', 
                            height: '100%', 
                            playerVars: { 
                              autoplay: 0, 
                              controls: 0, 
                              disablekb: 1, 
                              fs: 0,
                              iv_load_policy: 3,
                              rel: 0,
                              modestbranding: 1
                            } 
                          }}
                          onReady={(e) => {
                            ytPlayerRef.current = e.target;
                            setAudioReady(true);
                          }}
                          onPlay={() => setPlaying(true)}
                          onPause={() => setPlaying(false)}
                          onEnd={() => setPlaying(false)}
                          onError={(e) => {
                            console.error("YouTube Error", e);
                            setLoadErr("Failed to load YouTube video.");
                          }}
                          className="w-full h-full scale-[1.5]"
                        />
                    </div>
                    {/* YouTube Center Icon Blur Mask Animation Removed as requested */}
                  </>
                ) : (
                  <>
                    {art ? (
                      <img src={art} alt="" className="h-48 w-48 rounded-lg shadow-md mb-8 relative z-10" />
                    ) : (
                      <div className="h-48 w-48 rounded-lg bg-muted mb-8 animate-pulse relative z-10" />
                    )}
                  </>
                )}
                
                <div className="relative z-10 mt-auto mb-4 mx-auto w-fit bg-background/40 backdrop-blur-md px-6 py-3 rounded-md shadow-lg border border-white/10 dark:border-white/5">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground line-clamp-1">{track}</h2>
                  <p className="text-base text-muted-foreground mt-1">{artist}</p>
                  {ytAuthor && (
                    <p className="text-xs text-muted-foreground/60 mt-3 flex items-center justify-center gap-1.5">
                      <svg className="w-3 h-3 text-red-500/80" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      {ytAuthor}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Game and Lyrics */}
            <div className="flex flex-col gap-6 relative">
              {/* Hit Feedback Overlay */}
              {hitFeedback && (
                <div key={hitFeedback.id} className={`absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black italic tracking-widest pointer-events-none z-50 animate-bounce drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                  hitFeedback.type === 'perfect' ? 'text-blue-400' :
                  hitFeedback.type === 'good' ? 'text-green-400' : 'text-red-500'
                }`}>
                  {hitFeedback.text}
                </div>
              )}

              {/* Game Area */}
              <div
                ref={lyricsRef}
                className="relative h-[450px] rounded-xl bg-card/40 border border-border/40 shadow-inner px-6 py-10 cursor-pointer overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onClick={() => inputRef.current?.focus()}
              >
                {/* Background Beat Pulse */}
                
                <div className="relative z-10">
                  <div className="min-h-[200px]" />
                  
                  {lines.map((line, idx) => {
                    const isCurrentLine = idx === currentLineIdx;
                    const isPassed = idx < currentLineIdx;
                    const lineText = line.text;

                    return (
                      <div
                        key={idx}
                        data-line-idx={idx}
                        className={`flex items-center gap-6 mb-8 transition-all duration-300 p-2 rounded-xl hover:bg-muted/10 ${
                          isCurrentLine ? "scale-105 opacity-100" : 
                          isPassed ? "opacity-30 scale-95" : "opacity-50 scale-95"
                        }`}
                      >
                        {/* osu! Style Note Indicator */}
                        <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                          {/* Fixed Target Ring */}
                          <div className={`absolute inset-0 rounded-full border-2 transition-colors duration-300 ${isCurrentLine ? 'border-primary' : 'border-muted-foreground/30'}`} />
                          
                          {/* Inner Note */}
                          <div className={`absolute w-4 h-4 rounded-full transition-colors duration-300 ${isPassed ? 'bg-primary/50' : isCurrentLine ? 'bg-primary' : 'bg-muted-foreground/30'}`} />

                          {/* DOM Elements for rAF updates */}
                          {isCurrentLine && (
                            <>
                              <div 
                                id="approach-circle"
                                className="absolute rounded-full border-2 border-primary -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 pointer-events-none"
                                style={{ display: 'none' }}
                              />
                              <svg 
                                id="progress-circle"
                                className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" 
                                viewBox="0 0 48 48"
                                style={{ display: 'none' }}
                              >
                                <circle 
                                  cx="24" cy="24" r="22" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="4" 
                                  className="text-primary"
                                  strokeDasharray="138.2"
                                />
                              </svg>
                            </>
                          )}
                        </div>

                        {/* Lyric Text */}
                        <div className="text-2xl font-bold leading-relaxed text-left flex-1">
                          {isCurrentLine
                            ? lineText.split("").map((ch, charIdx) => {
                                const typedChar = typed[charIdx];
                                let className = "text-muted-foreground";

                                if (charIdx < typed.length) {
                                  const isCorrect = typedChar?.toLowerCase() === ch.toLowerCase();
                                  if (isCorrect) {
                                    className = "text-correct font-semibold";
                                  } else if (!SHOW_TYPING_ERRORS) {
                                    className = "text-correct font-semibold";
                                  } else if (SHOW_TYPING_ERRORS) {
                                    className = "text-incorrect underline decoration-incorrect font-semibold";
                                  }
                                } else if (charIdx === typed.length) {
                                  className = "text-foreground animate-pulse";
                                }

                                return (
                                  <span key={charIdx} className={className}>
                                    {ch}
                                  </span>
                                );
                              })
                            : lineText}
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="min-h-[200px]" />
                </div>
              </div>

              {/* Hidden input for capturing keyboard events */}
              <input
                ref={inputRef}
                value={typed}
                onChange={onChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // Force wait if video is loaded and playing
                    if (!videoId) {
                      handleLineComplete(false);
                    }
                  }
                }}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                className="sr-only"
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  disabled={!videoId || !audioReady}
                  className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-40 cursor-pointer flex items-center justify-center"
                >
                  {playing ? "Pause" : "Play"}
                </button>
                <button
                  onClick={restart}
                  className="rounded-lg border border-border/40 bg-card/45 backdrop-blur-sm py-2.5 px-6 text-sm font-semibold hover:bg-muted transition-colors cursor-pointer"
                >
                  Restart
                </button>
              </div>

              <p className="text-center font-mono text-xs text-muted-foreground leading-relaxed">
                Just start typing — you can't skip ahead, stay on the beat!
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
