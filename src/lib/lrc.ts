export interface LyricLine {
  time: number; // seconds
  text: string;
}

export function parseLrc(lrc: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const re = /\[(\d+):(\d+(?:\.\d+)?)\]/g;
  for (const raw of lrc.split(/\r?\n/)) {
    const stamps: number[] = [];
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(raw)) !== null) {
      stamps.push(parseInt(m[1], 10) * 60 + parseFloat(m[2]));
    }
    const text = raw.replace(re, "").trim();
    if (!stamps.length) continue;
    for (const t of stamps) lines.push({ time: t, text });
  }
  lines.sort((a, b) => a.time - b.time);
  return lines.filter((l) => l.text.length > 0);
}

export interface TrackSearchResult {
  id: number;
  trackName: string;
  artistName: string;
  albumName?: string;
  duration?: number;
  artworkUrl100?: string;
}

type ItunesTrackResult = {
  trackId?: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  trackTimeMillis?: number;
  artworkUrl100?: string;
};

export async function searchTracks(query: string): Promise<TrackSearchResult[]> {
  if (!query.trim()) return [];

  const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=30`;
  const res = await fetch(itunesUrl);
  if (!res.ok) throw new Error("Search failed");
  const data = (await res.json()) as { results?: ItunesTrackResult[] };

  return (data.results || []).map((item) => ({
    id: item.trackId ?? 0,
    trackName: item.trackName || "Unknown",
    artistName: item.artistName || "Unknown",
    albumName: item.collectionName,
    duration: item.trackTimeMillis ? Math.floor(item.trackTimeMillis / 1000) : undefined,
    artworkUrl100: item.artworkUrl100,
  }));
}
function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s*[([][^)\]]*[)\]]/g, "") // Remove parenthesized/bracketed details (e.g. "feat. ...")
    .replace(/[.,/#!$%^&*;:{}=_`~()[\]'"-]/g, "") // Remove all punctuation
    .replace(/\s+/g, "") // Remove all whitespace
    .trim();
}

function shouldRemoveFirstLine(
  firstLineText: string,
  artistName: string,
  trackName: string,
): boolean {
  const normLine = normalizeStr(firstLineText);
  const normTrack = normalizeStr(trackName);
  const normArtist = normalizeStr(artistName);

  if (!normLine) return true;

  // 1. Match track name
  if (normLine === normTrack) return true;

  // 2. Match artist name
  if (normLine === normArtist) return true;

  // 3. Match combinations
  if (normLine === normalizeStr(`${artistName} ${trackName}`)) return true;
  if (normLine === normalizeStr(`${trackName} ${artistName}`)) return true;

  // 4. Common metadata indicator phrases
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

export interface LyricsResult {
  lines: LyricLine[];
  duration: number;
  isAiSynced?: boolean;
}

export async function fetchSyncedLyrics(
  artist: string,
  track: string,
  duration?: number,
): Promise<LyricsResult | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    let url = `/api/lyrics?artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}`;
    if (duration) {
      url += `&duration=${duration}`;
    }
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = (await res.json()) as { syncedLyrics?: string | null; duration?: number; isAiSynced?: boolean };
    if (!data.syncedLyrics) return null;

    const parsedLines = parseLrc(data.syncedLyrics);
    const cleanedLines = [...parsedLines];

    // Clean starting metadata lines (e.g. title, artist name) in the first 20 seconds
    while (cleanedLines.length > 0 && cleanedLines[0].time < 20) {
      if (shouldRemoveFirstLine(cleanedLines[0].text, artist, track)) {
        cleanedLines.shift();
      } else {
        break;
      }
    }

    return { lines: cleanedLines, duration: data.duration || duration || 0, isAiSynced: data.isAiSynced };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Failed to fetch lyrics:", error);
    return null;
  }
}
