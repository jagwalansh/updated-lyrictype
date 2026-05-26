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

export async function searchTracks(query: string): Promise<TrackSearchResult[]> {
  if (!query.trim()) return [];

  const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=30`;
  const res = await fetch(itunesUrl);
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();

  return (data.results || []).map((item: any) => ({
    id: item.trackId,
    trackName: item.trackName || "Unknown",
    artistName: item.artistName || "Unknown",
    albumName: item.collectionName,
    duration: item.trackTimeMillis ? Math.floor(item.trackTimeMillis / 1000) : undefined,
    artworkUrl100: item.artworkUrl100,
  }));
}

export interface LyricsResult {
  lines: LyricLine[];
  duration: number;
}

export async function fetchSyncedLyrics(
  artist: string,
  track: string,
  duration?: number,
): Promise<LyricsResult | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

  try {
    let url = `/api/lyrics?artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}`;
    if (duration) {
      url += `&duration=${duration}`;
    }
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = (await res.json()) as { syncedLyrics?: string | null, duration?: number };
    if (!data.syncedLyrics) return null;
    return { lines: parseLrc(data.syncedLyrics), duration: data.duration || duration || 0 };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Failed to fetch lyrics:", error);
    return null;
  }
}
