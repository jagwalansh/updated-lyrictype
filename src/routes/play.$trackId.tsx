import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import { Navbar } from "@/components/ui/navbar";
import { fetchSyncedLyrics, type LyricLine } from "@/lib/lrc";
import YouTube, { type YouTubePlayer } from "react-youtube";
import { Skeleton } from "@/components/ui/skeleton";

interface Search {
  artist: string;
  track: string;
  art: string;
  duration?: number;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(Math.max(0, Math.floor(sec % 60)));
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function findLineIdxForTime(time: number, lyricLines: LyricLine[]): number {
  let targetIdx = 0;
  for (let i = 0; i < lyricLines.length; i++) {
    if (lyricLines[i].time <= time) {
      targetIdx = i;
    } else {
      break;
    }
  }
  return targetIdx;
}

const SHOW_TYPING_ERRORS = true;
const GOD_MODE = false ; // Set to true to always score PERFECT regardless of input

export const Route = createFileRoute("/play/$trackId")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    artist: String(s.artist ?? ""),
    track: String(s.track ?? ""),
    art: String(s.art ?? ""),
    duration: s.duration ? Number(s.duration) : undefined,
  }),
  component: PlayPage,
});

function PlayPage() {
  const { artist, track, art, duration } = Route.useSearch();
  const [lines, setLines] = useState<LyricLine[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const [charIdx, setCharIdx] = useState(0);
  const [charResults, setCharResults] = useState<Array<{status: 'hit' | 'miss' | 'pending', char?: string}>>([]);
  const [lineComplete, setLineComplete] = useState(false);
  const [waitingForNext, setWaitingForNext] = useState<string | null>(null);

  const [stats, setStats] = useState({ correct: 0, total: 0, started: 0 });
  
  // Game state
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [hitFeedback, setHitFeedback] = useState<{ id: number, text: string, type: string } | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number, text: string, type: 'hit' | 'miss', charIdx: number, createdAt: number }>>([]);

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
  const [songEnded, setSongEnded] = useState(false);
  const [showBlurOverlay, setShowBlurOverlay] = useState(false);
  const showBlurOverlayRef = useRef(false);


  // Prevent multiple triggers in rAF loop
  const lastCompletedLineRef = useRef(-1);

  // Keep refs for callbacks to avoid dependency cycles
  const charIdxRef = useRef(charIdx);
  useEffect(() => { charIdxRef.current = charIdx; }, [charIdx]);

  const charResultsRef = useRef(charResults);
  useEffect(() => { charResultsRef.current = charResults; }, [charResults]);

  const comboRef = useRef(combo);
  useEffect(() => { comboRef.current = combo; }, [combo]);

  // Load Lyrics and YouTube ID
  useEffect(() => {
    let cancelled = false;
    setSongEnded(false);
    showBlurOverlayRef.current = false;
    setShowBlurOverlay(false);
    
    async function loadData() {
      try {
        // 1. Fetch Lyrics
        const lyricsRes = await fetchSyncedLyrics(artist, track, duration);
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

  // Cleanup particles automatically
  useEffect(() => {
    if (particles.length > 0) {
      const interval = setInterval(() => {
        const now = Date.now();
        setParticles(prev => {
          const filtered = prev.filter(p => now - p.createdAt < 800);
          return filtered.length === prev.length ? prev : filtered;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [particles]);

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

  // Reset line state whenever the active line changes
  useEffect(() => {
    setCharIdx(0);
    setCharResults([]);
    setLineComplete(false);
    setWaitingForNext(null);
  }, [currentLineIdx]);

  const ytOpts = useMemo(() => ({
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
  }), []);

  const handleLineComplete = useCallback((forceAdvance = false) => {
    if (!lines) return;
    const currentLine = lines[currentLineIdx]?.text || "";
    const results = charResultsRef.current;
    
    let correctChars = 0;
    for (const res of results) {
        if (res?.status === 'hit') correctChars++;
    }
    const lineAccuracy = currentLine.length > 0 ? correctChars / currentLine.length : 0;
    
    const effectiveAccuracy = GOD_MODE ? 1 : lineAccuracy;

    let type = "miss";
    let text = "MISS";

    if (results.length > 0 && effectiveAccuracy >= 0.90) {
        type = "perfect";
        text = "PERFECT";
    } else if (results.length > 0 && effectiveAccuracy >= 0.50) {
        type = "good";
        text = "GOOD";
    } else {
        type = "miss";
        text = "MISS";
    }

    setHitFeedback({ id: Date.now(), text, type });

    setCurrentLineIdx(idx => Math.min(idx + 1, lines.length - 1));
  }, [lines, currentLineIdx]);

  // High precision time sync and animation loop
  const updateTime = useCallback(() => {
    if (ytPlayerRef.current && playing) {
      currentTimeRef.current = ytPlayerRef.current.getCurrentTime();
      
      const durationVal = ytPlayerRef.current.getDuration();
      if (durationVal > 0) {
        const timeRemaining = durationVal - currentTimeRef.current;
        const shouldBlur = timeRemaining <= 23;
        if (shouldBlur !== showBlurOverlayRef.current) {
          showBlurOverlayRef.current = shouldBlur;
          setShowBlurOverlay(shouldBlur);
        }

        // Spotify progress bar DOM updates
        const pct = (currentTimeRef.current / durationVal) * 100;
        const currentEl = document.getElementById('spotify-current-time');
        const remainingEl = document.getElementById('spotify-remaining-time');
        const fillEl = document.getElementById('spotify-progress-fill');
        const unplayedEl = document.getElementById('spotify-progress-unplayed');
        const handleEl = document.getElementById('spotify-progress-handle');
        
        if (currentEl) currentEl.innerText = formatTime(currentTimeRef.current);
        if (remainingEl) remainingEl.innerText = `-${formatTime(Math.max(0, timeRemaining))}`;
        if (fillEl) fillEl.style.width = `${pct}%`;
        if (unplayedEl) unplayedEl.style.left = `${pct}%`;
        if (handleEl) handleEl.style.left = `${pct}%`;
      }
      
      if (lines && lines[currentLineIdx]) {
        const effectiveTime = currentTimeRef.current;
        const line = lines[currentLineIdx];
        const nextLineTime = lines[currentLineIdx + 1]?.time || line.time + 5;
        const timeDiff = line.time - effectiveTime;
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

        // Auto-advance
        if (effectiveTime > nextLineTime + 0.2) {
          if (lastCompletedLineRef.current !== currentLineIdx) {
            lastCompletedLineRef.current = currentLineIdx;
            
            // Mark remaining characters as miss
            const currentResults = [...charResultsRef.current];
            let modified = false;
            for(let i = charIdxRef.current; i < line.text.length; i++) {
              if (currentResults[i]?.status !== 'hit' && currentResults[i]?.status !== 'miss') {
                 currentResults[i] = { status: 'miss' };
                 modified = true;
              }
            }
            if (modified) {
              setCharResults(currentResults);
              setCombo(0);
            }
            
            handleLineComplete(true);
          }
        } else if (charIdxRef.current >= line.text.length && currentTimeRef.current < nextLineTime) {
            // Waiting for next line
            const timeRemaining = (nextLineTime - currentTimeRef.current).toFixed(1);
            setWaitingForNext(timeRemaining);
        } else {
            setWaitingForNext(null);
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

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Prevent default actions for certain keys to avoid navigation/scrolling
    if (e.key === "Delete" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        return;
    }

    if (!fullText || !lines || !playing) return;
    
    const line = lines[currentLineIdx];
    if (!line) return;

    // Line is locked until its timestamp
    if (currentTimeRef.current < line.time) return;

    if (e.key === "Backspace") {
        e.preventDefault();
        if (charIdx > 0) {
            const prevIdx = charIdx - 1;
            
            // Reset combo on backspace to prevent score farming
            setCombo(0); 
            
            const newResults = [...charResults];
            newResults[prevIdx] = { status: 'pending' };
            setCharResults(newResults);
            
            setCharIdx(prevIdx);
            setLineComplete(false);
        }
        return;
    }

    // Ignore modifiers and special keys
    if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;

    e.preventDefault(); // Prevent default browser behaviors like scrolling on Space

    // Line is already complete
    if (charIdx >= line.text.length) return;

    const expectedChar = line.text[charIdx];
    const typedChar = e.key;

    const isHit = GOD_MODE || typedChar.toLowerCase() === expectedChar.toLowerCase();
    
    const newResults = [...charResults];
    newResults[charIdx] = { status: isHit ? 'hit' : 'miss', char: typedChar };
    setCharResults(newResults);

    if (isHit) {
        const newCombo = combo + 1;
        setCombo(newCombo);
        
        let multiplier = 1;
        if (newCombo >= 100) multiplier = 5;
        else if (newCombo >= 50) multiplier = 3;
        else if (newCombo >= 25) multiplier = 2;
        else if (newCombo >= 10) multiplier = 1.5;

        const points = Math.floor(10 * multiplier);
        setScore(s => s + points);
        setStats((s) => ({
            correct: s.correct + 1,
            total: s.total + 1,
            started: s.started || Date.now(),
        }));

        setParticles(prev => [
            ...prev,
            { id: Math.random(), text: `+${points}`, type: "hit" as const, charIdx, createdAt: Date.now() }
        ]);
    } else {
        setCombo(0);
        setStats((s) => ({
            correct: s.correct,
            total: s.total + 1,
            started: s.started || Date.now(),
        }));

        setParticles(prev => [
            ...prev,
            { id: Math.random(), text: "Miss", type: "miss" as const, charIdx, createdAt: Date.now() }
        ]);
    }

    const nextIdx = charIdx + 1;
    setCharIdx(nextIdx);

    if (nextIdx >= line.text.length) {
        setLineComplete(true);
    }
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
    setCharIdx(0);
    setCharResults([]);
    setLineComplete(false);
    setWaitingForNext(null);
    setCurrentLineIdx(0);
    setStats({ correct: 0, total: 0, started: 0 });
    setCombo(0);
    setScore(0);
    setHitFeedback(null);
    setParticles([]);
    currentTimeRef.current = 0;
    lastCompletedLineRef.current = -1;
    setSongEnded(false);
    showBlurOverlayRef.current = false;
    setShowBlurOverlay(false);

    // Reset Spotify bar DOM elements
    const currentEl = document.getElementById('spotify-current-time');
    const remainingEl = document.getElementById('spotify-remaining-time');
    const fillEl = document.getElementById('spotify-progress-fill');
    const unplayedEl = document.getElementById('spotify-progress-unplayed');
    const handleEl = document.getElementById('spotify-progress-handle');
    const player = ytPlayerRef.current;
    
    if (currentEl) currentEl.innerText = "0:00";
    if (player) {
      const dur = player.getDuration();
      if (remainingEl && dur > 0) remainingEl.innerText = `-${formatTime(dur)}`;
    } else {
      if (remainingEl) remainingEl.innerText = "-0:00";
    }
    if (fillEl) fillEl.style.width = "0%";
    if (unplayedEl) unplayedEl.style.left = "0%";
    if (handleEl) handleEl.style.left = "0%";

    if (player) {
      player.pauseVideo();
      player.seekTo(0, true);
      setPlaying(false);
    }

    inputRef.current?.focus();
  }

  const showSpotifyPlayer = !!(videoId && playing && !songEnded && !showBlurOverlay);

  return (
    <main className="relative min-h-screen bg-background text-foreground font-sans flex flex-col items-center">
      <Navbar disableEntranceAnimation />

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
          <div className="mt-10 max-w-lg mx-auto rounded-xl border border-border/40 bg-card/60 backdrop-blur-md p-10 text-center shadow-lg">
            <div className="w-16 h-16 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">🔕</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Lyrics Not Found</h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Sorry, we couldn't find synced lyrics for <strong>{track}</strong> by <strong>{artist}</strong>.<br/><br/>
              Only songs with time-synced lyrics can be played in LyricType.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90 transition-opacity"
            >
              Go back to search
            </Link>
          </div>
        )}

        {(!lines || ytLoading) && !loadErr && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 items-start">
            {/* Left Column Skeleton */}
            <div className="flex flex-col gap-4">
              <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-border/40 shadow-lg bg-card/45 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                <Skeleton className="h-48 w-48 rounded-lg shadow-md mb-8" />
                <div className="relative z-10 mx-auto w-64 bg-background/40 backdrop-blur-md px-6 py-4 rounded-md shadow-lg border border-white/10 flex flex-col gap-2 items-center">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="flex flex-col gap-6 relative">
              {/* Game Area Skeleton */}
              <div className="relative h-[450px] rounded-xl bg-card/40 border border-border/40 shadow-inner px-6 py-10 overflow-hidden flex flex-col justify-center">
                <div className="flex flex-col gap-8">
                  {/* Past line skeleton */}
                  <div className="flex items-center gap-6 opacity-30 scale-95">
                    <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                    <Skeleton className="h-8 w-[50%]" />
                  </div>
                  {/* Current line skeleton */}
                  <div className="flex items-center gap-6 scale-105">
                    <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                    <Skeleton className="h-8 w-[75%]" />
                  </div>
                  {/* Next line skeleton */}
                  <div className="flex items-center gap-6 opacity-45 scale-95">
                    <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                    <Skeleton className="h-8 w-[60%]" />
                  </div>
                </div>
              </div>

              {/* Controls Skeleton */}
              <div className="flex items-center gap-3">
                <Skeleton className="flex-1 h-[42px] rounded-lg" />
                <Skeleton className="w-28 h-[42px] rounded-lg" />
              </div>

              <Skeleton className="mx-auto h-4 w-72 rounded" />
            </div>
          </div>
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
                          opts={ytOpts}
                          onReady={(e) => {
                            ytPlayerRef.current = e.target;
                            setAudioReady(true);
                            const durationVal = e.target.getDuration();
                            const remainingEl = document.getElementById('spotify-remaining-time');
                            if (remainingEl && durationVal > 0) {
                              remainingEl.innerText = `-${formatTime(durationVal)}`;
                            }
                          }}
                          onPlay={() => setPlaying(true)}
                          onPause={() => setPlaying(false)}
                          onEnd={() => {
                            setPlaying(false);
                            setSongEnded(true);
                          }}
                          onError={(e) => {
                            console.error("YouTube Error", e);
                            setLoadErr("Failed to load YouTube video.");
                          }}
                          className="w-full h-full scale-[1.5]"
                        />
                    </div>
                    {/* Translucent cover to blur out YouTube video recommendations / pause state */}
                    <div className={`absolute inset-0 z-10 bg-black/55 backdrop-blur-lg transition-opacity duration-500 rounded-xl ${
                      (!playing || showBlurOverlay || songEnded) ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`} />

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
                
                 <div 
                  className={`z-20 bg-background/40 backdrop-blur-md shadow-lg border border-white/10 dark:border-white/5 transition-all duration-500 ease-in-out flex flex-col justify-center ${
                    videoId ? "absolute left-1/2 top-1/2" : "relative mt-auto mb-4 mx-auto"
                  } ${
                    showSpotifyPlayer 
                      ? "w-[80%] max-w-[360px] h-[64px] px-6 rounded-xl" 
                      : "w-[280px] h-[130px] px-6 rounded-2xl"
                  }`}
                  style={videoId ? {
                    transform: `translate(-50%, ${showSpotifyPlayer ? "140px" : "-50%"})`,
                  } : undefined}
                >
                  {/* Layout A: Song Info */}
                  <div 
                    className={`transition-all duration-500 flex flex-col justify-center items-center text-center absolute inset-x-6 top-1/2 -translate-y-1/2 ${
                      showSpotifyPlayer 
                        ? "opacity-0 scale-95 pointer-events-none" 
                        : "opacity-100 scale-100 pointer-events-auto"
                    }`}
                  >
                    <h2 className="text-xl font-bold tracking-tight text-foreground line-clamp-1 w-full">{track}</h2>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1 w-full">{artist}</p>
                    {ytAuthor && (
                      <p className="text-[10px] text-muted-foreground/60 mt-2 flex items-center justify-center gap-1.5 w-full">
                        <svg className="w-2.5 h-2.5 text-red-500/80" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        {ytAuthor}
                      </p>
                    )}
                  </div>

                  {/* Layout B: Spotify Player */}
                  <div 
                    className={`transition-all duration-500 flex flex-col justify-center absolute inset-x-6 top-1/2 -translate-y-1/2 w-[calc(100%-3rem)] ${
                      showSpotifyPlayer 
                        ? "opacity-100 scale-100 pointer-events-auto" 
                        : "opacity-0 scale-95 pointer-events-none"
                    }`}
                  >
                    <div className="w-full h-6 relative flex items-center group cursor-pointer">
                      {/* Background Track (Flat, unplayed portion) */}
                      <div 
                        id="spotify-progress-unplayed"
                        className="absolute top-1/2 -translate-y-1/2 right-0 h-[3px] bg-white/20 rounded-full transition-all duration-100" 
                        style={{ left: '0%' }}
                      />

                      {/* Played Portion (Wavy, always takes the shape of the wave) */}
                      <div 
                        id="spotify-progress-fill"
                        className="absolute top-1/2 -translate-y-1/2 left-0 h-[12px] overflow-hidden transition-all duration-100 pointer-events-none"
                        style={{ width: '0%' }}
                      >
                        <div className="w-[600px] h-[12px] relative">
                          <svg width="600" height="12" viewBox="0 0 600 12" fill="none" className={`absolute left-0 top-0 ${playing ? 'animate-wave' : ''}`}>
                            <path 
                              d="M 0 6 Q 6 1, 12 6 T 24 6 T 36 6 T 48 6 T 60 6 T 72 6 T 84 6 T 96 6 T 108 6 T 120 6 T 132 6 T 144 6 T 156 6 T 168 6 T 180 6 T 192 6 T 204 6 T 216 6 T 228 6 T 240 6 T 252 6 T 264 6 T 276 6 T 288 6 T 300 6 T 312 6 T 324 6 T 336 6 T 348 6 T 360 6 T 372 6 T 384 6 T 396 6 T 408 6 T 420 6 T 432 6 T 444 6 T 456 6 T 468 6 T 480 6 T 492 6 T 504 6 T 516 6 T 528 6 T 540 6 T 552 6 T 564 6 T 576 6 T 588 6 T 600 6" 
                              stroke="white" 
                              strokeWidth="2.5" 
                              strokeLinecap="round" 
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Scrubber Dot / Handle */}
                      <div 
                        id="spotify-progress-handle"
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-100 -ml-1.5 pointer-events-none scale-100 group-hover:scale-125"
                        style={{ left: '0%' }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1 text-[10px] font-mono font-medium text-white/70 tracking-wider">
                      <span id="spotify-current-time">0:00</span>
                      <span id="spotify-remaining-time">-0:00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Game/Lyrics or Sync Editor */}
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
                              <div className={`absolute inset-0 rounded-full border-2 transition-colors duration-300 ${isCurrentLine ? 'border-primary' : 'border-muted-foreground/30'}`} />
                              <div className={`absolute w-4 h-4 rounded-full transition-colors duration-300 ${isPassed ? 'bg-primary/50' : isCurrentLine ? 'bg-primary' : 'bg-muted-foreground/30'}`} />

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

                            <div className="text-2xl font-bold leading-relaxed text-left flex-1 relative">
                              {isCurrentLine
                                ? lineText.split("").map((ch, i) => {
                                    const result = charResults[i];
                                    let className = "text-muted-foreground/30";
                                    let showWrongChar = false;
                                    let wrongCharText = "!";
                                    
                                    if (i === charIdx) {
                                        className = "text-foreground animate-cursor-blink underline decoration-2 underline-offset-4 decoration-primary";
                                    } else if (result?.status === 'hit') {
                                        className = "text-correct font-semibold";
                                    } else if (result?.status === 'miss') {
                                        className = "text-incorrect font-semibold animate-miss-shake";
                                        showWrongChar = true;
                                        wrongCharText = result.char || "!";
                                    }

                                    return (
                                      <span key={i} className={`inline-block relative ${className} transition-colors duration-100`}>
                                        {/* Floating feedback particles */}
                                        {particles.filter(p => p.charIdx === i).map(p => {
                                          let colorClass = "text-red-500 font-extrabold";
                                          if (p.type === 'hit') {
                                            if (p.text === '+15') colorClass = "text-amber-400 font-bold";
                                            else if (p.text === '+20') colorClass = "text-fuchsia-400 font-bold";
                                            else if (p.text === '+30') colorClass = "text-pink-400 font-extrabold";
                                            else if (p.text === '+50') colorClass = "text-yellow-400 font-extrabold";
                                            else colorClass = "text-primary font-bold";
                                          }
                                          return (
                                            <span
                                              key={p.id}
                                              className={`absolute left-1/2 -translate-x-1/2 font-mono font-black text-sm select-none pointer-events-none z-50 animate-float-up-fade ${colorClass}`}
                                            >
                                              {p.text}
                                            </span>
                                          );
                                        })}
                                        {ch === " " ? "\u00A0" : ch}
                                      </span>
                                    );
                                  })
                                : lineText}
                                
                              {isCurrentLine && waitingForNext && (
                                  <div className="absolute top-full left-0 mt-4 text-sm text-primary animate-pulse font-mono tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20 flex items-center gap-2">
                                      <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      ♪ Next in {waitingForNext}s
                                  </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="min-h-[200px]" />
                    </div>
                  </div>

                  {/* Standard Playback controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      disabled={!videoId || !audioReady}
                      className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-40 cursor-pointer flex items-center justify-center animate-pulse-subtle"
                    >
                      {playing ? "Pause" : "Play"}
                    </button>
                    <button
                      onClick={restart}
                      className="rounded-lg border border-border/40 bg-card/45 backdrop-blur-sm py-2.5 px-6 text-sm font-semibold hover:bg-muted transition-colors cursor-pointer"
                    >
                      Restart
                    </button>
                    <button
                      onClick={() => {
                        if (ytPlayerRef.current && lines) {
                          const cur = ytPlayerRef.current.getCurrentTime();
                          const newTime = cur + 10;
                          ytPlayerRef.current.seekTo(newTime, true);
                          const targetIdx = findLineIdxForTime(newTime, lines);
                          setCurrentLineIdx(targetIdx);
                          setCharIdx(0);
                          setCharResults([]);
                          setLineComplete(false);
                          setWaitingForNext(null);
                        }
                        inputRef.current?.focus();
                      }}
                      className="rounded-lg border border-border/40 bg-card/45 backdrop-blur-sm py-2.5 px-5 text-sm font-semibold hover:bg-muted transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      ⏩ +10s
                    </button>
                  </div>

                  <p className="text-center font-mono text-xs text-muted-foreground leading-relaxed">
                    Just start typing — you can't skip ahead, stay on the beat!
                  </p>

              {/* Hidden input for capturing keyboard events */}
              <input
                ref={inputRef}
                value=""
                onChange={() => {}}
                onKeyDown={onKeyDown}
                onPaste={(e) => e.preventDefault()}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                className="sr-only"
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
