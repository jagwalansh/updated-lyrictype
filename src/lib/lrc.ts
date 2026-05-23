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
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100?: string;
  previewUrl?: string;
}

export async function searchTracks(query: string): Promise<TrackSearchResult[]> {
  if (!query.trim()) return [];

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=20`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Search failed");
  const data = (await res.json()) as { results: any[] };

  return data.results.map((result) => ({
    trackId: result.trackId,
    trackName: result.trackName,
    artistName: result.artistName,
    artworkUrl100: result.artworkUrl100,
    previewUrl: result.previewUrl,
  }));
}

export interface LyricsResult {
  lines: LyricLine[];
  duration: number;
}

export async function fetchSyncedLyrics(
  artist: string,
  track: string,
): Promise<LyricsResult | null> {
  try {
    const url = `/api/lyrics?artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { syncedLyrics?: string | null, duration?: number };
    if (!data.syncedLyrics) return null;
    return { lines: parseLrc(data.syncedLyrics), duration: data.duration || 0 };
  } catch (error) {
    console.error("Failed to fetch lyrics:", error);
    return null;
  }
}
