import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "@/components/ui/navbar";
import { fetchSyncedLyrics, type LyricLine } from "@/lib/lrc";
import YouTube, { type YouTubePlayer } from "react-youtube";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { useModal } from "@/lib/modal-context";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  Music,
  Pause,
  Play,
  RotateCcw,
  Trophy,
  Home,
  Award,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Flag,
  Send,
  X,
  ChevronUp,
  ChevronDown,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import * as Dialog from "@radix-ui/react-dialog";

const DISCORD_USERNAME = "nxxei";
const DISCORD_USER_ID = "1215184320424050698";
const X_USERNAME = "jagwalansh";

interface Search {
  artist: string;
  track: string;
  art: string;
  duration?: number;
  q?: string;
  from?: string;
}

type YoutubeCandidate = {
  videoId: string;
  authorName: string;
  title?: string;
};

type VideoVoteData = {
  scores: Record<string, number>;
  userVotes: Record<string, number>;
};

function emptyVideoVoteData(): VideoVoteData {
  return { scores: {}, userVotes: {} };
}

async function fetchVideoVoteData(songId: string): Promise<VideoVoteData> {
  if (!isSupabaseConfigured) return emptyVideoVoteData();

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 1500);

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const response = await fetch(`/api/video-votes?songId=${encodeURIComponent(songId)}`, {
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : undefined,
      signal: controller.signal,
    });

    if (!response.ok) return emptyVideoVoteData();
    return await response.json();
  } catch (error) {
    if (!(error instanceof DOMException && error.name === "AbortError")) {
      console.error("Failed to load video votes", error);
    }
    return emptyVideoVoteData();
  } finally {
    window.clearTimeout(timeout);
  }
}

function sortVideoCandidates(candidates: YoutubeCandidate[], scores: Record<string, number>) {
  return candidates
    .map((candidate, index) => ({ candidate, index }))
    .sort(
      (a, b) =>
        (scores[b.candidate.videoId] ?? 0) - (scores[a.candidate.videoId] ?? 0) ||
        a.index - b.index,
    )
    .map(({ candidate }) => candidate);
}

type SyncReportModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artist: string;
  track: string;
  trackId: string;
  videoId: string | null;
  ytAuthor: string | null;
  expectedDuration?: number;
  videoDuration?: number;
  playbackTime: number;
  defaultEmail?: string;
};

function SyncReportModal({
  open,
  onOpenChange,
  artist,
  track,
  trackId,
  videoId,
  ytAuthor,
  expectedDuration,
  videoDuration,
  playbackTime,
  defaultEmail,
}: SyncReportModalProps) {
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [reportDelivered, setReportDelivered] = useState(true);
  const youtubeUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : "Unavailable";
  const reportMessage = [
    `Song: ${track} by ${artist}`,
    `Track ID: ${trackId}`,
    `YouTube video: ${youtubeUrl}`,
    `YouTube channel: ${ytAuthor ?? "Unknown"}`,
    `Expected track duration: ${expectedDuration ? formatTime(expectedDuration) : "Unknown"}`,
    `Selected video duration: ${videoDuration ? formatTime(videoDuration) : "Unknown"}`,
    `Playback time when report opened: ${formatTime(playbackTime)}`,
    "",
    "Player note:",
    details.trim(),
  ].join("\n");

  useEffect(() => {
    if (open && defaultEmail) setEmail(defaultEmail);
  }, [defaultEmail, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setDetails("");
      setSending(false);
      setStatus("idle");
      setErrorMessage("");
      setReportDelivered(true);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "KeyVerse player",
          email: email.trim(),
          subject: `Out-of-sync report: ${track} by ${artist}`,
          message: reportMessage,
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to send report");
      }

      setReportDelivered(data?.delivered !== false);
      setStatus("success");
      trackEvent("sync_issue_reported", {
        song_id: trackId,
        song_title: track,
        artist,
        video_id: videoId ?? undefined,
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to send report");
      setStatus("error");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[110] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 text-foreground shadow-2xl">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-semibold tracking-tight">
                Report a sync issue
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                We will include the current song and video details automatically.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close report dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {status === "success" ? (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-500">
              {reportDelivered
                ? "Thanks. Your report was sent with the song and video details."
                : "Local preview accepted. The report was logged by the dev server, but no email was sent."}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="rounded-lg border border-border/30 bg-card/50 p-3">
                <p className="text-sm font-medium text-foreground">{track}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{artist}</p>
                <p className="mt-2 text-[11px] font-mono text-muted-foreground">
                  Current position: {formatTime(playbackTime)}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="sync-report-email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="sync-report-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="you@example.com"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="sync-report-details" className="text-sm font-medium">
                  What felt out of sync?
                </label>
                <textarea
                  id="sync-report-details"
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  required
                  rows={4}
                  placeholder="For example: the lyrics started after the vocal, or this looks like a shortened music video."
                  className="flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="h-px flex-1 bg-border" />
                  <span>Or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={`https://discord.com/users/${DISCORD_USER_ID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium "
                  >
                    <DiscordIcon className="h-5 w-5" /> @{DISCORD_USERNAME}
                  </a>
                  <span className="h-4 w-px bg-border" aria-hidden="true" />
                  <a
                    href={`https://x.com/${X_USERNAME}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium "
                  >
                    <XSocialIcon className="h-4 w-4" /> @{X_USERNAME}
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {sending ? "Sending report..." : "Send report"}
              </button>

              {status === "error" && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500">
                  <p className="flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {errorMessage}
                  </p>
                  <a
                    href={`mailto:support@keyverse.me?subject=${encodeURIComponent(`Out-of-sync report: ${track} by ${artist}`)}&body=${encodeURIComponent(reportMessage)}`}
                    className="mt-2 inline-block font-medium underline underline-offset-2"
                  >
                    Send by email instead
                  </a>
                  <p className="mt-2 flex items-center gap-1.5 text-xs">
                    You can also DM <DiscordIcon className="h-4 w-4" /> @{DISCORD_USERNAME}.
                  </p>
                </div>
              )}
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(Math.max(0, Math.floor(sec % 60)));
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-label="Discord"
      className={className}
      fill="currentColor"
      role="img"
      viewBox="0 0 24 24"
    >
      <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.2.4c1.8.5 2.7 1.2 2.7 1.2a13.1 13.1 0 0 0-11.8 0S7 3.9 8.8 3.4L8.6 3a19.8 19.8 0 0 0-4.9 1.4C.6 9.1-.2 13.7.2 18.2A20 20 0 0 0 6.2 21s.7-1 1.3-1.8a8.3 8.3 0 0 1-2.1-1.4l.5.3c4 1.9 8.3 1.9 12.2 0l.5-.3a8.3 8.3 0 0 1-2.1 1.4c.6.8 1.3 1.8 1.3 1.8a20 20 0 0 0 6-2.8c.5-5.2-.8-9.8-3.5-13.8ZM8.1 15.4c-1.2 0-2.1-1.1-2.1-2.4s1-2.4 2.1-2.4c1.2 0 2.1 1.1 2.1 2.4s-.9 2.4-2.1 2.4Zm7.8 0c-1.2 0-2.1-1.1-2.1-2.4s1-2.4 2.1-2.4c1.2 0 2.1 1.1 2.1 2.4s-.9 2.4-2.1 2.4Z" />
    </svg>
  );
}

function XSocialIcon({ className }: { className?: string }) {
  return (
    <svg aria-label="X" className={className} fill="currentColor" role="img" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
    </svg>
  );
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

function charsMatch(typedChar: string, expectedChar: string): boolean {
  return typedChar === expectedChar;
}

export const Route = createFileRoute("/play/$trackId")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    artist: String(s.artist ?? "").replace(/\+/g, " "),
    track: String(s.track ?? "").replace(/\+/g, " "),
    art: String(s.art ?? ""),
    duration: s.duration ? Number(s.duration) : undefined,
    q: typeof s.q === "string" ? s.q.replace(/\+/g, " ") : undefined,
    from: typeof s.from === "string" ? s.from : undefined,
  }),
  component: PlayPage,
});

function shouldRemoveFirstLine(
  firstLineText: string,
  artistName: string,
  trackName: string,
): boolean {
  const normalizeStr = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/\s*[([][^)\]]*[)\]]/g, "")
      .replace(/[.,/#!$%^&*;:{}=_`~()[\]'"-]/g, "")
      .replace(/\s+/g, "")
      .trim();
  };
  const normLine = normalizeStr(firstLineText);
  const normTrack = normalizeStr(trackName);
  const normArtist = normalizeStr(artistName);

  if (!normLine) return true;
  if (normLine === normTrack) return true;
  if (normLine === normArtist) return true;
  if (normLine === normalizeStr(`${artistName} ${trackName}`)) return true;
  if (normLine === normalizeStr(`${trackName} ${artistName}`)) return true;
  if (
    normLine.includes("lyricsby") ||
    normLine.includes("writtenby") ||
    normLine.includes("producedby") ||
    normLine.includes("lrcby")
  ) {
    return true;
  }
  return false;
}

function PlayPage() {
  const { artist, track, art, duration, q, from } = Route.useSearch();
  const { user } = useAuth();
  const { setModalOpen } = useModal();
  const { trackId } = Route.useParams();

  const [savingScore, setSavingScore] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [scoreSaveSkippedReason, setScoreSaveSkippedReason] = useState<string | null>(null);

  const [lines, setLines] = useState<LyricLine[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const [charIdx, setCharIdx] = useState(0);
  const [charResults, setCharResults] = useState<
    Array<{ status: "hit" | "miss" | "pending"; char?: string }>
  >([]);
  const [lineComplete, setLineComplete] = useState(false);
  const [lyricsFinished, setLyricsFinished] = useState(false);
  const [waitingForNext, setWaitingForNext] = useState<string | null>(null);

  const [stats, setStats] = useState({ correct: 0, total: 0, started: 0 });
  const [activeTypingMs, setActiveTypingMs] = useState(0);

  // Game state
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [hitFeedback, setHitFeedback] = useState<{ id: number; text: string; type: string } | null>(
    null,
  );
  const [particles, setParticles] = useState<
    Array<{ id: number; text: string; type: "hit" | "miss"; charIdx: number; createdAt: number }>
  >([]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const lyricsRef = useRef<HTMLDivElement | null>(null);

  const ytPlayerRef = useRef<YouTubePlayer | null>(null);
  const rafRef = useRef<number | null>(null);
  const currentTimeRef = useRef(0);
  const activeTypingMsRef = useRef(0);
  const lastActiveTypingTickRef = useRef<number | null>(null);
  const lastActiveTypingRenderRef = useRef(0);
  const songStartedTrackedRef = useRef(false);
  const songCompletedTrackedRef = useRef(false);
  const completedLyricsRef = useRef(false);
  const inactivityMissesRef = useRef(0);
  const lastVideoCarouselScrollRef = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);

  const [videoId, setVideoId] = useState<string | null>(null);
  const [ytAuthor, setYtAuthor] = useState<string | null>(null);
  const [ytCandidates, setYtCandidates] = useState<YoutubeCandidate[]>([]);
  const [videoVoteScores, setVideoVoteScores] = useState<Record<string, number>>({});
  const [userVideoVotes, setUserVideoVotes] = useState<Record<string, number>>({});
  const [savingVideoVote, setSavingVideoVote] = useState(false);
  const [ytLoading, setYtLoading] = useState(true);
  const [songEnded, setSongEnded] = useState(false);
  const [songEndedAt, setSongEndedAt] = useState<number | null>(null);
  const [showBlurOverlay, setShowBlurOverlay] = useState(false);
  const showBlurOverlayRef = useRef(false);
  const [syncReportOpen, setSyncReportOpen] = useState(false);
  const [syncReportPlaybackTime, setSyncReportPlaybackTime] = useState(0);
  const [syncReportVideoDuration, setSyncReportVideoDuration] = useState<number | undefined>();
  const [videoCarouselDirection, setVideoCarouselDirection] = useState<1 | -1>(1);

  useEffect(() => {
    trackEvent("song_page_opened", {
      song_id: trackId,
      song_title: track,
      artist,
    });
  }, [artist, track, trackId]);

  // Prevent multiple triggers in rAF loop
  const lastCompletedLineRef = useRef(-1);

  // Keep refs for callbacks to avoid dependency cycles
  const charIdxRef = useRef(charIdx);
  useEffect(() => {
    charIdxRef.current = charIdx;
  }, [charIdx]);

  const charResultsRef = useRef(charResults);
  useEffect(() => {
    charResultsRef.current = charResults;
  }, [charResults]);

  const comboRef = useRef(combo);
  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);
  const statsStartedRef = useRef(stats.started);
  useEffect(() => {
    statsStartedRef.current = stats.started;
  }, [stats.started]);
  const waitingForNextRef = useRef<string | null>(null);

  const updateWaitingForNext = useCallback((value: string | null) => {
    if (waitingForNextRef.current === value) return;
    waitingForNextRef.current = value;
    setWaitingForNext(value);
  }, []);

  const resetActiveLineState = useCallback(() => {
    charIdxRef.current = 0;
    charResultsRef.current = [];
    setCharIdx(0);
    setCharResults([]);
    setLineComplete(false);
    updateWaitingForNext(null);
  }, [updateWaitingForNext]);

  // Load Lyrics and YouTube ID
  useEffect(() => {
    let cancelled = false;
    resetActiveLineState();
    setCurrentLineIdx(0);
    setStats({ correct: 0, total: 0, started: 0 });
    setActiveTypingMs(0);
    setCombo(0);
    setMaxCombo(0);
    setScore(0);
    setHitFeedback(null);
    setParticles([]);
    currentTimeRef.current = 0;
    activeTypingMsRef.current = 0;
    lastActiveTypingTickRef.current = null;
    lastActiveTypingRenderRef.current = 0;
    songStartedTrackedRef.current = false;
    songCompletedTrackedRef.current = false;
    completedLyricsRef.current = false;
    inactivityMissesRef.current = 0;
    lastCompletedLineRef.current = -1;
    setPlaying(false);
    setAudioReady(false);
    setSongEnded(false);
    setSongEndedAt(null);
    showBlurOverlayRef.current = false;
    setShowBlurOverlay(false);
    setSavingScore(false);
    setSaveError(null);
    setScoreSaved(false);
    setSaveAttempted(false);
    setScoreSaveSkippedReason(null);
    setLoadErr(null);
    setLines(null);
    setLyricsFinished(false);
    setVideoId(null);
    setYtAuthor(null);
    setYtCandidates([]);
    setVideoVoteScores({});
    setUserVideoVotes({});

    // Guard: Don't fetch if search parameters are not yet resolved or are empty
    if (!artist.trim() || !track.trim()) {
      setYtLoading(true);
      return;
    }

    async function loadData() {
      try {
        setYtLoading(true);
        const searchQuery = artist + " " + track;
        const youtubeParams = new URLSearchParams({
          artist,
          track,
          q: searchQuery,
          duration: String(duration || 0),
        });

        // Start the regular lyrics lookup in parallel with YouTube search.
        const lyricsPromise = fetchSyncedLyrics(artist, track, duration).catch((error) => {
          console.error("Regular lyrics lookup failed:", error);
          return null;
        });

        // 1. Fetch YouTube results and community ranking.
        const [ytResponse, voteData] = await Promise.all([
          fetch(`/api/youtube-search?${youtubeParams.toString()}`),
          fetchVideoVoteData(trackId),
        ]);

        if (cancelled) return;

        // 2. Process YouTube response
        if (!ytResponse.ok) {
          throw new Error("Failed to fetch YouTube video search results");
        }
        const d = await ytResponse.json();

        if (cancelled) return;

        if (d.videoId) {
          const candidates: YoutubeCandidate[] = d.candidates || [
            { videoId: d.videoId, authorName: d.authorName },
          ];
          const rankedCandidates = sortVideoCandidates(candidates, voteData.scores);
          const selectedCandidate = rankedCandidates[0] ?? candidates[0];

          setVideoVoteScores(voteData.scores);
          setUserVideoVotes(voteData.userVotes);
          setVideoId(selectedCandidate.videoId);
          setYtAuthor(selectedCandidate.authorName);
          setYtCandidates(rankedCandidates);
        } else {
          setLoadErr("Could not find a YouTube video for this track.");
          return;
        }

        const lyricsRes = await lyricsPromise;
        if (cancelled) {
          return;
        }

        if (lyricsRes && lyricsRes.lines.length > 0) {
          setLines(lyricsRes.lines);
          return;
        }

        setLoadErr("No synced lyrics found for this track.");
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
  }, [artist, track, duration, trackId, resetActiveLineState]);

  const handleYoutubeError = useCallback(() => {
    const currentIndex = ytCandidates.findIndex((candidate) => candidate.videoId === videoId);
    const nextCandidate = ytCandidates[currentIndex + 1];

    if (nextCandidate) {
      setAudioReady(false);
      setPlaying(false);
      setVideoId(nextCandidate.videoId);
      setYtAuthor(nextCandidate.authorName);
      return;
    }

    setLoadErr("Synced lyrics were found, but the available YouTube videos could not be played.");
  }, [videoId, ytCandidates]);

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
        setParticles((prev) => {
          const filtered = prev.filter((p) => now - p.createdAt < 800);
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
      lyricsRef.current.scrollTo({
        top:
          currentLineNode.offsetTop -
          lyricsRef.current.clientHeight / 2 +
          currentLineNode.clientHeight / 2,
        behavior: "smooth",
      });
    }
  }, [currentLineIdx]);

  // Reset line state whenever the active line changes
  useEffect(() => {
    resetActiveLineState();
  }, [currentLineIdx, resetActiveLineState]);

  const ytOpts = useMemo(
    () => ({
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        rel: 0,
        modestbranding: 1,
      },
    }),
    [],
  );

  const handleLineComplete = useCallback(
    (forceAdvance = false) => {
      if (!lines) return;
      const currentLine = lines[currentLineIdx]?.text || "";
      const results = charResultsRef.current;

      let correctChars = 0;
      for (const res of results) {
        if (res?.status === "hit") correctChars++;
      }
      const lineAccuracy = currentLine.length > 0 ? correctChars / currentLine.length : 0;

      let type = "miss";
      let text = "MISS";

      if (results.length > 0 && lineAccuracy >= 0.9) {
        type = "perfect";
        text = "PERFECT";
      } else if (results.length > 0 && lineAccuracy >= 0.5) {
        type = "good";
        text = "GOOD";
      } else {
        type = "miss";
        text = "MISS";
      }

      setHitFeedback({ id: Date.now(), text, type });

      resetActiveLineState();
      setCurrentLineIdx((idx) => Math.min(idx + 1, lines.length - 1));
    },
    [lines, currentLineIdx, resetActiveLineState],
  );

  const endSong = useCallback(() => {
    setPlaying(false);
    setSongEnded(true);
    setSongEndedAt(Date.now());
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch (e) {
        console.error("Failed to pause video", e);
      }
    }
  }, []);

  const handleSongPlay = useCallback(() => {
    setPlaying(true);

    if (songStartedTrackedRef.current) return;
    songStartedTrackedRef.current = true;
    trackEvent("song_started", {
      song_id: trackId,
      song_title: track,
      artist,
    });
  }, [artist, track, trackId]);

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
        const currentEl = document.getElementById("spotify-current-time");
        const remainingEl = document.getElementById("spotify-remaining-time");
        const fillEl = document.getElementById("spotify-progress-fill");
        const unplayedEl = document.getElementById("spotify-progress-unplayed");
        const handleEl = document.getElementById("spotify-progress-handle");

        if (currentEl) currentEl.innerText = formatTime(currentTimeRef.current);
        if (remainingEl) remainingEl.innerText = `-${formatTime(Math.max(0, timeRemaining))}`;
        if (fillEl) fillEl.style.width = `${pct}%`;
        if (unplayedEl) unplayedEl.style.left = `${pct}%`;
        if (handleEl) handleEl.style.left = `${pct}%`;

      }

      if (lines && lines[currentLineIdx] && !lyricsFinished) {
        const line = lines[currentLineIdx];
        const nextLineTime = lines[currentLineIdx + 1]?.time || line.time + 5;
        const timeDiff = line.time - currentTimeRef.current;
        const waitingForUpcomingLine =
          charIdxRef.current >= line.text.length && currentTimeRef.current < nextLineTime;
        const visualTimeDiff = waitingForUpcomingLine
          ? nextLineTime - currentTimeRef.current
          : timeDiff;
        const duration = nextLineTime - line.time;
        const canTrackActiveTyping =
          statsStartedRef.current > 0 &&
          currentTimeRef.current >= line.time &&
          !waitingForUpcomingLine &&
          charIdxRef.current < line.text.length;
        const activeTickNow = performance.now();

        if (canTrackActiveTyping) {
          if (lastActiveTypingTickRef.current !== null) {
            activeTypingMsRef.current += Math.min(
              activeTickNow - lastActiveTypingTickRef.current,
              500,
            );
          }
          lastActiveTypingTickRef.current = activeTickNow;

          if (activeTickNow - lastActiveTypingRenderRef.current > 250) {
            lastActiveTypingRenderRef.current = activeTickNow;
            setActiveTypingMs(activeTypingMsRef.current);
          }
        } else {
          lastActiveTypingTickRef.current = null;
        }

        // Visual Updates
        const approachEl = document.getElementById("approach-circle");
        const progressEl = document.getElementById("progress-circle");

        if (approachEl) {
          if (visualTimeDiff > 0 && visualTimeDiff < 2.0) {
            approachEl.style.display = "block";
            const size = 48 + visualTimeDiff * 50; // Shrinks down to 48px
            approachEl.style.width = `${size}px`;
            approachEl.style.height = `${size}px`;
            approachEl.style.opacity = visualTimeDiff > 1.5 ? "0" : `${1 - visualTimeDiff / 1.5}`;
          } else {
            approachEl.style.display = "none";
          }
        }

        if (progressEl) {
          if (!waitingForUpcomingLine && timeDiff <= 0 && timeDiff > -duration) {
            progressEl.style.display = "block";
            const progress = Math.abs(timeDiff) / duration;
            progressEl
              .querySelector<SVGCircleElement>("circle")
              ?.style.setProperty("stroke-dashoffset", `${138.2 * progress}`);
          } else {
            progressEl.style.display = "none";
          }
        }

        if (charIdxRef.current >= line.text.length && currentTimeRef.current >= nextLineTime) {
          if (lastCompletedLineRef.current !== currentLineIdx) {
            lastCompletedLineRef.current = currentLineIdx;
            handleLineComplete(true);
          }
        } else if (currentTimeRef.current > nextLineTime + 0.2) {
          // Auto-advance when the line was not completed in time.
          if (lastCompletedLineRef.current !== currentLineIdx) {
            lastCompletedLineRef.current = currentLineIdx;

            // Mark remaining characters as miss
            const currentResults = [...charResultsRef.current];
            let missedCharacters = 0;
            for (let i = charIdxRef.current; i < line.text.length; i++) {
              if (currentResults[i]?.status !== "hit" && currentResults[i]?.status !== "miss") {
                currentResults[i] = { status: "miss" };
                missedCharacters++;
              }
            }
            if (missedCharacters > 0) {
              inactivityMissesRef.current += missedCharacters;
              charResultsRef.current = currentResults;
              setCharResults(currentResults);
              setStats((s) => ({
                correct: s.correct,
                total: s.total + missedCharacters,
                started: s.started || Date.now(),
              }));
              setCombo(0);
            }

            if (currentLineIdx === lines.length - 1) {
              setLyricsFinished(true);
              updateWaitingForNext(null);
            } else {
              handleLineComplete(true);
            }
          }
        } else if (
          charIdxRef.current >= line.text.length &&
          currentTimeRef.current < nextLineTime
        ) {
          // Waiting for next line
          const timeRemaining = (nextLineTime - currentTimeRef.current).toFixed(1);
          updateWaitingForNext(timeRemaining);
        } else {
          updateWaitingForNext(null);
        }
      }

      rafRef.current = requestAnimationFrame(updateTime);
    }
  }, [playing, lines, currentLineIdx, lyricsFinished, handleLineComplete, updateWaitingForNext]);

  useEffect(() => {
    if (playing) {
      rafRef.current = requestAnimationFrame(updateTime);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      lastActiveTypingTickRef.current = null;
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, updateTime]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      if (!e.repeat) {
        togglePlay();
      }
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      restart();
      return;
    }

    // Prevent default actions for certain keys to avoid navigation/scrolling
    if (
      e.key === "Delete" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Enter"
    ) {
      e.preventDefault();
      return;
    }

    if (!fullText || !lines || !playing || lyricsFinished) return;

    const line = lines[currentLineIdx];
    if (!line) return;

    // Line is locked until its timestamp
    if (currentTimeRef.current < line.time) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      if (charIdx > 0) {
        let prevIdx = charIdx - 1;

        if (e.metaKey) {
          prevIdx = 0;
        } else if (e.ctrlKey || e.altKey) {
          prevIdx = charIdx;
          while (prevIdx > 0 && /\s/.test(line.text[prevIdx - 1])) prevIdx--;
          while (prevIdx > 0 && !/\s/.test(line.text[prevIdx - 1])) prevIdx--;
        }

        // Reset combo on backspace to prevent score farming
        setCombo(0);

        const newResults = [...charResults];
        for (let i = prevIdx; i < charIdx; i++) {
          newResults[i] = { status: "pending" };
        }
        charResultsRef.current = newResults;
        setCharResults(newResults);

        charIdxRef.current = prevIdx;
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

    const isHit = charsMatch(typedChar, expectedChar);

    const newResults = [...charResults];
    newResults[charIdx] = { status: isHit ? "hit" : "miss", char: typedChar };
    charResultsRef.current = newResults;
    setCharResults(newResults);

    if (isHit) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));

      let multiplier = 1;
      if (newCombo >= 100) multiplier = 5;
      else if (newCombo >= 50) multiplier = 3;
      else if (newCombo >= 25) multiplier = 2;
      else if (newCombo >= 10) multiplier = 1.5;

      const points = Math.floor(10 * multiplier);
      setScore((s) => s + points);
      setStats((s) => ({
        correct: s.correct + 1,
        total: s.total + 1,
        started: s.started || Date.now(),
      }));

      setParticles((prev) => [
        ...prev,
        {
          id: Math.random(),
          text: `+${points}`,
          type: "hit" as const,
          charIdx,
          createdAt: Date.now(),
        },
      ]);
    } else {
      setCombo(0);
      setStats((s) => ({
        correct: s.correct,
        total: s.total + 1,
        started: s.started || Date.now(),
      }));

      setParticles((prev) => [
        ...prev,
        { id: Math.random(), text: "Miss", type: "miss" as const, charIdx, createdAt: Date.now() },
      ]);
    }

    const nextIdx = charIdx + 1;
    charIdxRef.current = nextIdx;
    setCharIdx(nextIdx);

    if (nextIdx >= line.text.length) {
      setLineComplete(true);
      if (currentLineIdx === lines.length - 1) {
        completedLyricsRef.current = true;
        setLyricsFinished(true);
        updateWaitingForNext(null);
      }
    }
  }

  const accuracy = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
  const activeTypingMinutes = activeTypingMs / 1000 / 60;
  const wpm =
    stats.started && activeTypingMinutes > 0
      ? Math.round(stats.correct / 5 / activeTypingMinutes)
      : 0;

  useEffect(() => {
    if (!songEnded || songCompletedTrackedRef.current) return;

    songCompletedTrackedRef.current = true;
    trackEvent("song_completed", {
      song_id: trackId,
      song_title: track,
      artist,
      score,
      accuracy,
    });
  }, [accuracy, artist, score, songEnded, track, trackId]);

  // Save score when song ends
  useEffect(() => {
    if (songEnded && user && !scoreSaved && !savingScore && !saveAttempted) {
      if (score <= 0 || stats.total <= 0) {
        setSaveAttempted(true);
        setScoreSaveSkippedReason("No score was saved because no lyrics were typed.");
        return;
      }

      if (!completedLyricsRef.current) {
        setSaveAttempted(true);
        setScoreSaveSkippedReason("No score was saved because the lyrics were not completed.");
        return;
      }

      const saveScore = async () => {
        setSavingScore(true);
        setSaveError(null);
        setSaveAttempted(true);
        setScoreSaveSkippedReason(null);
        try {
          if (!isSupabaseConfigured) {
            throw new Error("Score saving is temporarily unavailable.");
          }

          const {
            data: { session },
          } = await supabase.auth.getSession();
          const token = session?.access_token;

          const res = await fetch("/api/save-score", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              songId: trackId,
              artist,
              track,
              score,
              accuracy,
              consistency: accuracy,
              typedCharacters: stats.total,
              completedLyrics: completedLyricsRef.current,
              inactivityMisses: inactivityMissesRef.current,
              previewUrl: null,
              artUrl: art,
            }),
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to save score");
          }
          setScoreSaved(true);
        } catch (err) {
          console.error(err);
          setSaveError(err instanceof Error ? err.message : "Failed to save score");
        } finally {
          setSavingScore(false);
        }
      };
      saveScore();
    }
  }, [
    songEnded,
    user,
    scoreSaved,
    savingScore,
    saveAttempted,
    trackId,
    artist,
    track,
    score,
    accuracy,
    stats.total,
    art,
  ]);

  const grade = useMemo(() => {
    if (accuracy >= 98)
      return {
        letter: "S",
        color:
          "text-amber-400 bg-amber-400/10 border-amber-400/30 shadow-[0_0_20px_rgba(251,191,36,0.15)]",
      };
    if (accuracy >= 95)
      return {
        letter: "A",
        color:
          "text-emerald-400 bg-emerald-400/10 border-emerald-400/30 shadow-[0_0_20px_rgba(52,211,153,0.15)]",
      };
    if (accuracy >= 90)
      return {
        letter: "B",
        color:
          "text-blue-400 bg-blue-400/10 border-blue-400/30 shadow-[0_0_20px_rgba(96,165,250,0.15)]",
      };
    if (accuracy >= 80)
      return {
        letter: "C",
        color:
          "text-purple-400 bg-purple-400/10 border-purple-400/30 shadow-[0_0_20px_rgba(192,132,252,0.15)]",
      };
    if (accuracy >= 70)
      return {
        letter: "D",
        color:
          "text-orange-400 bg-orange-400/10 border-orange-400/30 shadow-[0_0_20px_rgba(251,146,60,0.15)]",
      };
    return {
      letter: "F",
      color:
        "text-rose-400 bg-rose-400/10 border-rose-400/30 shadow-[0_0_20px_rgba(248,113,113,0.15)]",
    };
  }, [accuracy]);

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
    resetActiveLineState();
    setCurrentLineIdx(0);
    setStats({ correct: 0, total: 0, started: 0 });
    setActiveTypingMs(0);
    setCombo(0);
    setMaxCombo(0);
    setScore(0);
    setHitFeedback(null);
    setParticles([]);
    currentTimeRef.current = 0;
    activeTypingMsRef.current = 0;
    lastActiveTypingTickRef.current = null;
    lastActiveTypingRenderRef.current = 0;
    songStartedTrackedRef.current = false;
    songCompletedTrackedRef.current = false;
    completedLyricsRef.current = false;
    setLyricsFinished(false);
    inactivityMissesRef.current = 0;
    lastCompletedLineRef.current = -1;
    setSongEnded(false);
    setSongEndedAt(null);
    showBlurOverlayRef.current = false;
    setShowBlurOverlay(false);
    setSavingScore(false);
    setSaveError(null);
    setScoreSaved(false);
    setSaveAttempted(false);
    setScoreSaveSkippedReason(null);

    // Reset Spotify bar DOM elements
    const currentEl = document.getElementById("spotify-current-time");
    const remainingEl = document.getElementById("spotify-remaining-time");
    const fillEl = document.getElementById("spotify-progress-fill");
    const unplayedEl = document.getElementById("spotify-progress-unplayed");
    const handleEl = document.getElementById("spotify-progress-handle");
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
  const selectedVideoIndex = ytCandidates.findIndex((candidate) => candidate.videoId === videoId);
  const previousVideoCandidate =
    selectedVideoIndex > 0 ? ytCandidates[selectedVideoIndex - 1] : null;
  const nextVideoCandidate =
    selectedVideoIndex >= 0 && selectedVideoIndex < ytCandidates.length - 1
      ? ytCandidates[selectedVideoIndex + 1]
      : null;

  const selectVideoCandidate = (candidate: YoutubeCandidate) => {
    if (candidate.videoId === videoId) return;

    const nextIndex = ytCandidates.findIndex((item) => item.videoId === candidate.videoId);
    setVideoCarouselDirection(nextIndex > selectedVideoIndex ? 1 : -1);
    restart();
    setAudioReady(false);
    setVideoId(candidate.videoId);
    setYtAuthor(candidate.authorName);
    trackEvent("youtube_video_changed", {
      song_id: trackId,
      song_title: track,
      artist,
      video_id: candidate.videoId,
    });
  };

  const voteForCurrentVideo = async () => {
    if (!videoId || savingVideoVote) return;
    if (!user) {
      setModalOpen(true);
      toast("Sign in to vote on video sync.");
      return;
    }

    const nextVote = userVideoVotes[videoId] === 1 ? 0 : 1;
    setSavingVideoVote(true);

    try {
      if (!isSupabaseConfigured) {
        throw new Error("Video voting is temporarily unavailable.");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch("/api/video-votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ songId: trackId, videoId, vote: nextVote }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Failed to save vote");

      setVideoVoteScores(data.scores ?? {});
      setUserVideoVotes(data.userVotes ?? {});
      setYtCandidates((candidates) => sortVideoCandidates(candidates, data.scores ?? {}));
      toast.success(nextVote === 0 ? "Vote removed." : "Thanks for rating this video's sync.");
      trackEvent("youtube_video_sync_voted", {
        song_id: trackId,
        song_title: track,
        artist,
        video_id: videoId,
        vote: nextVote,
      });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to save vote");
    } finally {
      setSavingVideoVote(false);
    }
  };

  const handleVideoCarouselWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) < 8 || ytCandidates.length < 2) return;

    const candidate = event.deltaY > 0 ? nextVideoCandidate : previousVideoCandidate;
    if (!candidate) return;

    event.preventDefault();
    const now = Date.now();
    if (now - lastVideoCarouselScrollRef.current < 450) return;

    lastVideoCarouselScrollRef.current = now;
    selectVideoCandidate(candidate);
  };

  const openSyncReport = () => {
    let videoDuration: number | undefined;
    try {
      const playerDuration = ytPlayerRef.current?.getDuration();
      if (playerDuration && playerDuration > 0) videoDuration = playerDuration;
    } catch (error) {
      console.error("Failed to read YouTube duration for sync report", error);
    }

    setSyncReportPlaybackTime(currentTimeRef.current);
    setSyncReportVideoDuration(videoDuration);
    setSyncReportOpen(true);
  };

  return (
    <main className="relative min-h-screen bg-background text-foreground font-sans flex flex-col items-center">
      <Navbar staticLayout />

      {/* Content Overlay */}
      <div className="relative z-20 w-full max-w-5xl px-6 pt-24 pb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <Link
            to={from === "/recommended" ? "/recommended" : "/"}
            search={from !== "/recommended" && q ? { q } : undefined}
            className="font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            ← back
          </Link>

          <div className="flex items-center gap-6 font-mono text-sm border border-border/40 bg-card/45 backdrop-blur-md shadow-sm rounded-full px-6 py-3">
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

        {loadErr ? (
          <div className="mt-10 max-w-lg mx-auto rounded-xl border border-border/40 bg-card/60 backdrop-blur-md p-10 text-center shadow-lg">
            <div className="w-16 h-16 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-6">
              <Music className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Track Unavailable</h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Sorry, <strong>{track}</strong> by <strong>{artist}</strong> could not be loaded.
              <br />
              <br />
              {loadErr}
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90 transition-opacity"
            >
              Go back to search
            </Link>
          </div>
        ) : !lines || ytLoading ? (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6 items-start">
            {/* Left Column Skeleton */}
            <div className="flex flex-col gap-4">
              <div className="relative w-full h-[360px] rounded-xl overflow-hidden border border-border/40 shadow-lg bg-card/45 backdrop-blur-md flex flex-col items-center justify-center p-5 text-center">
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
              <div className="relative h-[360px] rounded-xl bg-card/40 border border-border/40 shadow-inner px-5 py-8 overflow-hidden flex flex-col justify-center">
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
        ) : (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6 items-start">
            {/* Left Column: YouTube Video / Song Information Card */}
            <div className="flex flex-col gap-4">
              <div
                className="relative h-[360px] w-full"
                onWheel={handleVideoCarouselWheel}
                aria-label="YouTube video carousel"
              >
                <AnimatePresence initial={false}>
                  {previousVideoCandidate && (
                    <motion.button
                      key={`previous-${previousVideoCandidate.videoId}`}
                      type="button"
                      onClick={() => selectVideoCandidate(previousVideoCandidate)}
                      initial={{ opacity: 0, y: 32, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -32, scale: 0.96 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      className="absolute -top-7 left-5 right-5 z-0 h-24 overflow-hidden rounded-xl border border-border/40 bg-black shadow-md transition-all hover:-top-9 hover:border-primary/50"
                      aria-label={`Use previous video: ${previousVideoCandidate.title || previousVideoCandidate.authorName}`}
                    >
                      <img
                        src={`https://i.ytimg.com/vi/${previousVideoCandidate.videoId}/hqdefault.jpg`}
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover opacity-55"
                      />
                      <div className="absolute inset-0 bg-black/35" />
                      <ChevronUp className="absolute left-1/2 top-1 h-4 w-4 -translate-x-1/2 text-white/80" />
                    </motion.button>
                  )}
                </AnimatePresence>

                <AnimatePresence initial={false}>
                  {nextVideoCandidate && (
                    <motion.button
                      key={`next-${nextVideoCandidate.videoId}`}
                      type="button"
                      onClick={() => selectVideoCandidate(nextVideoCandidate)}
                      initial={{ opacity: 0, y: -32, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 32, scale: 0.96 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      className="absolute -bottom-7 left-5 right-5 z-0 h-24 overflow-hidden rounded-xl border border-border/40 bg-black shadow-md transition-all hover:-bottom-9 hover:border-primary/50"
                      aria-label={`Use next video: ${nextVideoCandidate.title || nextVideoCandidate.authorName}`}
                    >
                      <img
                        src={`https://i.ytimg.com/vi/${nextVideoCandidate.videoId}/hqdefault.jpg`}
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover opacity-55"
                      />
                      <div className="absolute inset-0 bg-black/35" />
                      <ChevronDown className="absolute bottom-1 left-1/2 h-4 w-4 -translate-x-1/2 text-white/80" />
                    </motion.button>
                  )}
                </AnimatePresence>

                <AnimatePresence initial={false} mode="popLayout" custom={videoCarouselDirection}>
                  <motion.div
                    key={videoId ?? "no-video"}
                    custom={videoCarouselDirection}
                    variants={{
                      enter: (direction: 1 | -1) => ({
                        opacity: 0,
                        y: direction * 90,
                        scale: 0.97,
                      }),
                      center: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      },
                      exit: (direction: 1 | -1) => ({
                        opacity: 0,
                        y: direction * -90,
                        scale: 0.97,
                      }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.32, ease: "easeInOut" }}
                    className="absolute inset-0 z-10 w-full h-[360px] rounded-xl overflow-hidden border border-border/40 shadow-lg bg-black flex flex-col items-center justify-center p-5 text-center"
                  >
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
                              const remainingEl = document.getElementById("spotify-remaining-time");
                              if (remainingEl && durationVal > 0) {
                                remainingEl.innerText = `-${formatTime(durationVal)}`;
                              }
                            }}
                            onPlay={handleSongPlay}
                            onPause={() => setPlaying(false)}
                            onEnd={() => {
                              endSong();
                            }}
                            onError={(e) => {
                              console.error("YouTube Error", e);
                              handleYoutubeError();
                            }}
                            className="w-full h-full scale-[1.1]"
                          />
                          {/* Top masking blur to hide YouTube title/info */}
                          <div className="absolute top-0 inset-x-0 h-11 bg-black/85 backdrop-blur-md border-b border-white/5 pointer-events-none z-10" />
                          {/* Bottom masking blur to hide YouTube watermark/logo */}
                          <div className="absolute bottom-0 inset-x-0 h-11 bg-black/85 backdrop-blur-md border-t border-white/5 pointer-events-none z-10" />
                        </div>
                        {/* Translucent cover to blur out YouTube video recommendations / pause state */}
                        <div
                          className={`absolute inset-0 z-10 bg-black/55 backdrop-blur-lg transition-opacity duration-500 rounded-xl ${
                            !playing || showBlurOverlay || songEnded
                              ? "opacity-100"
                              : "opacity-0 pointer-events-none"
                          }`}
                        />

                        {ytCandidates.length > 1 && (
                          <div className="absolute right-3 top-3 z-30 rounded-full border border-white/10 bg-black/55 px-2 py-1 font-mono text-[10px] text-white/75 backdrop-blur-sm">
                            {selectedVideoIndex + 1}/{ytCandidates.length}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {art ? (
                          <img
                            src={art}
                            alt={`${track || "Selected track"} album artwork`}
                            className="h-36 w-36 rounded-lg shadow-md mb-6 relative z-10"
                          />
                        ) : (
                          <div className="h-36 w-36 rounded-lg bg-muted mb-6 animate-pulse relative z-10" />
                        )}
                      </>
                    )}

                    <div
                      className={`z-20 bg-background/40 backdrop-blur-md shadow-lg border border-white/10 dark:border-white/5 transition-all duration-500 ease-in-out flex flex-col justify-center ${
                        videoId ? "absolute left-1/2 top-1/2" : "relative mt-auto mb-4 mx-auto"
                      } ${
                        showSpotifyPlayer
                          ? "w-[80%] max-w-[320px] h-[56px] px-5 rounded-xl"
                          : "w-[240px] h-[150px] px-5 rounded-2xl"
                      }`}
                      style={
                        videoId
                          ? {
                              transform: `translate(-50%, ${showSpotifyPlayer ? "110px" : "-50%"})`,
                            }
                          : undefined
                      }
                    >
                      {/* Layout A: Song Info */}
                      <div
                        className={`transition-all duration-500 flex flex-col justify-center items-center text-center absolute inset-x-6 top-1/2 -translate-y-1/2 ${
                          showSpotifyPlayer
                            ? "opacity-0 scale-95 pointer-events-none"
                            : "opacity-100 scale-100 pointer-events-auto"
                        }`}
                      >
                        <h2 className="text-xl font-bold tracking-tight text-foreground line-clamp-1 w-full">
                          {track}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1 w-full">
                          {artist}
                        </p>
                        {ytAuthor && (
                          <p className="text-[10px] text-muted-foreground/60 mt-2 flex items-center justify-center gap-1.5 w-full">
                            <svg
                              className="w-2.5 h-2.5 text-red-500/80"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                            {ytAuthor}
                          </p>
                        )}
                        {videoId && (
                          <div className="mt-3 flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={voteForCurrentVideo}
                              disabled={savingVideoVote}
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors disabled:opacity-50 ${
                                userVideoVotes[videoId] === 1
                                  ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-400"
                                  : "border-white/10 bg-black/15 text-muted-foreground hover:text-foreground"
                              }`}
                              aria-label="Upvote this video's lyric sync"
                            >
                              <ThumbsUp className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-8 font-mono text-xs font-semibold text-foreground">
                              {videoVoteScores[videoId] ?? 0}
                            </span>
                          </div>
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
                            style={{ left: "0%" }}
                          />

                          {/* Played Portion (Wavy, always takes the shape of the wave) */}
                          <div
                            id="spotify-progress-fill"
                            className="absolute top-1/2 -translate-y-1/2 left-0 h-[12px] overflow-hidden transition-all duration-100 pointer-events-none"
                            style={{ width: "0%" }}
                          >
                            <div className="w-[600px] h-[12px] relative">
                              <svg
                                width="600"
                                height="12"
                                viewBox="0 0 600 12"
                                fill="none"
                                className={`absolute left-0 top-0 ${playing ? "animate-wave" : ""}`}
                              >
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
                            style={{ left: "0%" }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1 text-[10px] font-mono font-medium text-white/70 tracking-wider">
                          <span id="spotify-current-time">0:00</span>
                          <span id="spotify-remaining-time">-0:00</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column: Game/Lyrics or Sync Editor */}
            <div className="flex flex-col gap-6 relative">
              {/* Hit Feedback Overlay */}
              {hitFeedback && (
                <div
                  key={hitFeedback.id}
                  className={`absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black italic tracking-widest pointer-events-none z-50 animate-bounce drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                    hitFeedback.type === "perfect"
                      ? "text-blue-400"
                      : hitFeedback.type === "good"
                        ? "text-green-400"
                        : "text-red-500"
                  }`}
                >
                  {hitFeedback.text}
                </div>
              )}

              {/* Game Area */}
              <div
                className="relative h-[360px] overflow-hidden rounded-xl border border-border/40 bg-card/40 shadow-inner"
                onClick={() => inputRef.current?.focus()}
              >
                <div ref={lyricsRef} className="h-full cursor-pointer overflow-hidden px-5 py-8">
                  {songEnded ? (
                    /* ── Result Card (replaces lyrics when song ends) ── */
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="flex flex-col items-center justify-center h-full gap-6 text-center"
                    >
                      {/* Song Title */}
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">
                          {track}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">{artist}</p>
                      </div>

                      {/* Stats Grid — Score, Accuracy, Speed, Max Combo */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-md">
                        <div className="rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-3 flex flex-col items-center justify-center">
                          <span className="text-[9px] font-bold tracking-widest text-muted-foreground/60 uppercase mb-0.5">
                            Score
                          </span>
                          <span className="text-lg font-black text-primary font-mono">
                            {score.toLocaleString()}
                          </span>
                        </div>
                        <div className="rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-3 flex flex-col items-center justify-center">
                          <span className="text-[9px] font-bold tracking-widest text-muted-foreground/60 uppercase mb-0.5">
                            Accuracy
                          </span>
                          <span className="text-lg font-black text-foreground font-mono">
                            {accuracy}%
                          </span>
                        </div>
                        <div className="rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-3 flex flex-col items-center justify-center">
                          <span className="text-[9px] font-bold tracking-widest text-muted-foreground/60 uppercase mb-0.5">
                            Speed
                          </span>
                          <span className="text-lg font-black text-foreground font-mono">
                            {wpm}{" "}
                            <span className="text-xs font-medium text-muted-foreground">WPM</span>
                          </span>
                        </div>
                        <div className="rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-3 flex flex-col items-center justify-center">
                          <span className="text-[9px] font-bold tracking-widest text-muted-foreground/60 uppercase mb-0.5">
                            Max Combo
                          </span>
                          <span className="text-lg font-black text-foreground font-mono">
                            {maxCombo}x
                          </span>
                        </div>
                      </div>

                      {/* Save status / Guest CTA */}
                      <div className="w-full max-w-md">
                        {user ? (
                          <div className="flex items-center justify-center gap-2 p-3 rounded-xl border border-border/20 bg-card/30 text-sm">
                            {savingScore ? (
                              <>
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                <span className="text-muted-foreground text-xs">
                                  Submitting score…
                                </span>
                              </>
                            ) : scoreSaved ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="text-emerald-500 text-xs font-medium">
                                  Score saved to leaderboard!
                                </span>
                              </>
                            ) : saveError ? (
                              <>
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                <span className="text-rose-500 text-xs font-medium">
                                  Failed to save: {saveError}
                                </span>
                              </>
                            ) : scoreSaveSkippedReason ? (
                              <>
                                <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground text-xs font-medium">
                                  {scoreSaveSkippedReason}
                                </span>
                              </>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                Preparing to save…
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-3 text-center">
                            <p className="text-xs text-muted-foreground mb-2.5">
                              You are playing as a{" "}
                              <strong className="text-foreground">Guest</strong>. Sign in to save
                              your score!
                            </p>
                            <button
                              onClick={() => setModalOpen(true)}
                              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                            >
                              Sign In to Save
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2.5 w-full max-w-md">
                        <button
                          onClick={restart}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-95 shadow-sm transition-all cursor-pointer text-sm"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Play Again</span>
                          <kbd className="ml-1 rounded border border-primary-foreground/30 bg-primary-foreground/10 px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none text-primary-foreground/85">
                            Tab
                          </kbd>
                        </button>
                        <Link
                          to="/leaderboard"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-border/40 bg-card/50 hover:bg-muted/60 text-foreground font-semibold rounded-xl transition-all text-sm"
                        >
                          <Trophy className="w-4 h-4 text-primary" />
                        </Link>
                        <Link
                          to={from === "/recommended" ? "/recommended" : "/"}
                          search={from !== "/recommended" && q ? { q } : undefined}
                          className="inline-flex items-center justify-center px-4 py-2.5 border border-border/40 bg-card/50 hover:bg-muted/60 text-muted-foreground hover:text-foreground font-semibold rounded-xl transition-all text-sm"
                        >
                          <Home className="w-4 h-4" />
                        </Link>
                      </div>
                    </motion.div>
                  ) : (
                    /* ── Normal Lyrics Display ── */
                    <div className="relative z-10 transition-opacity duration-300 opacity-100">
                      <div className="min-h-[200px]" />

                      {lines.map((line, idx) => {
                        const isCurrentLine = idx === currentLineIdx;
                        const isPassed = idx < currentLineIdx;
                        const isWaitingLine = Boolean(waitingForNext) && idx === currentLineIdx + 1;
                        const showTimingCircle =
                          isWaitingLine || (isCurrentLine && !waitingForNext);
                        const distanceFromCurrent = Math.abs(idx - currentLineIdx);
                        const lyricLineStateClass = isCurrentLine
                          ? "scale-105 opacity-100 blur-0"
                          : isWaitingLine
                            ? "scale-100 opacity-80 blur-0"
                            : distanceFromCurrent === 1
                              ? "scale-95 opacity-45 blur-[1.5px]"
                              : "scale-95 opacity-20 blur-[3px]";
                        const lineText = line.text;
                        const lineTokens = lineText.match(/\S+\s*|\s+/g) || [];
                        let tokenOffset = 0;

                        return (
                          <div
                            key={idx}
                            data-line-idx={idx}
                            className={`flex items-center gap-6 mb-8 transition-all duration-300 p-2 rounded-xl hover:bg-muted/10 ${lyricLineStateClass}`}
                          >
                            {/* osu! Style Note Indicator */}
                            <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                              <div
                                className={`absolute inset-0 rounded-full border-2 transition-colors duration-300 ${isCurrentLine || isWaitingLine ? "border-primary" : "border-muted-foreground/30"}`}
                              />
                              <div
                                className={`absolute w-4 h-4 rounded-full transition-colors duration-300 ${isPassed ? "bg-primary/50" : isCurrentLine || isWaitingLine ? "bg-primary" : "bg-muted-foreground/30"}`}
                              />

                              {showTimingCircle && (
                                <>
                                  <div
                                    id="approach-circle"
                                    className="absolute rounded-full border-2 border-primary -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 pointer-events-none"
                                    style={{ display: "none" }}
                                  />
                                  <svg
                                    id="progress-circle"
                                    className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                                    viewBox="0 0 48 48"
                                    style={{ display: "none" }}
                                  >
                                    <circle
                                      cx="24"
                                      cy="24"
                                      r="22"
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
                                ? lineTokens.map((token, tokenIdx) => {
                                    const tokenStart = tokenOffset;
                                    tokenOffset += token.length;

                                    return (
                                      <span
                                        key={tokenIdx}
                                        className="inline-block whitespace-nowrap"
                                      >
                                        {token.split("").map((ch, tokenCharIdx) => {
                                          const i = tokenStart + tokenCharIdx;
                                          const result = charResults[i];
                                          let className = "text-muted-foreground/30";
                                          let showWrongChar = false;
                                          let wrongCharText = "!";

                                          if (i === charIdx) {
                                            className =
                                              "text-foreground animate-cursor-blink underline decoration-2 underline-offset-4 decoration-primary";
                                          } else if (result?.status === "hit") {
                                            className = "text-correct font-semibold";
                                          } else if (result?.status === "miss") {
                                            className =
                                              "text-incorrect font-semibold animate-miss-shake";
                                            showWrongChar = true;
                                            wrongCharText = result.char || "!";
                                          }

                                          return (
                                            <span
                                              key={i}
                                              className={`inline-block relative ${className} transition-colors duration-100`}
                                            >
                                              {/* Floating feedback particles */}
                                              {particles
                                                .filter((p) => p.charIdx === i)
                                                .map((p) => {
                                                  let colorClass = "text-red-500 font-extrabold";
                                                  if (p.type === "hit") {
                                                    if (p.text === "+15")
                                                      colorClass = "text-amber-400 font-bold";
                                                    else if (p.text === "+20")
                                                      colorClass = "text-fuchsia-400 font-bold";
                                                    else if (p.text === "+30")
                                                      colorClass = "text-pink-400 font-extrabold";
                                                    else if (p.text === "+50")
                                                      colorClass = "text-yellow-400 font-extrabold";
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
                                              {showWrongChar && (
                                                <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 font-mono text-sm font-bold leading-none text-incorrect">
                                                  {wrongCharText === " " ? "\u00A0" : wrongCharText}
                                                </span>
                                              )}
                                            </span>
                                          );
                                        })}
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
                  )}
                </div>

                {!songEnded && waitingForNext && (
                  <div className="pointer-events-none absolute bottom-20 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border border-primary/20 bg-background/85 px-3 py-1 text-sm font-mono tracking-widest text-primary shadow-sm backdrop-blur-sm animate-pulse flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <Music className="w-3.5 h-3.5 animate-pulse text-primary shrink-0" /> Next in{" "}
                    {waitingForNext}s
                  </div>
                )}
              </div>

              {/* Standard Playback controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  disabled={!videoId || !audioReady}
                  className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 animate-pulse-subtle"
                >
                  {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{playing ? "Pause" : "Play"}</span>
                  <kbd className="ml-1 rounded border border-primary-foreground/30 bg-primary-foreground/10 px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none text-primary-foreground/85">
                    Esc
                  </kbd>
                </button>
                <button
                  onClick={restart}
                  className="rounded-lg border border-border/40 bg-card/45 backdrop-blur-sm py-2.5 px-5 text-sm font-semibold hover:bg-muted transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                  <kbd className="rounded border border-border/50 bg-background/60 px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none text-muted-foreground">
                    Tab
                  </kbd>
                </button>
              </div>

              <button
                type="button"
                onClick={openSyncReport}
                className="mx-auto inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <Flag className="h-3.5 w-3.5" />
                Report an out-of-sync song
              </button>

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

      <SyncReportModal
        open={syncReportOpen}
        onOpenChange={setSyncReportOpen}
        artist={artist}
        track={track}
        trackId={trackId}
        videoId={videoId}
        ytAuthor={ytAuthor}
        expectedDuration={duration}
        videoDuration={syncReportVideoDuration}
        playbackTime={syncReportPlaybackTime}
        defaultEmail={user?.email}
      />
    </main>
  );
}
