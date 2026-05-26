import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { CUSTOM_LYRICS } from "./lib/custom-lyrics";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

function extractOriginalArtist(track: string): string | null {
  const pattern = /[([{(](?:originally\s+performed\s+by|originally\s+by|in\s+the\s+style\s+of|tribute\s+to|cover\s+of)\s+(.*?)[)\]}]/i;
  const match = track.match(pattern);
  return match && match[1] ? match[1].trim() : null;
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s*[([{(](?:originally\s+performed\s+by|originally\s+by|in\s+the\s+style\s+of|tribute\s+to|cover\s+of)\s+.*?[)\]}]/gi, "")
    .replace(/\s*[([{(](?:explicit|clean|radio\s+edit|remastered|deluxe|single|ep|version|instrumental|jersey\s+club|remix|sped\s+up|slowed|acoustic|live|tribute|cover|karaoke|drill|phonk|mix|edit|reverb|lounge|tribute\s+version|cover\s+version)[)\]}]/gi, "")
    .replace(/\s*-\s*(?:single|ep|deluxe|remastered|version|explicit|clean|instrumental|jersey\s+club|remix|sped\s+up|slowed|acoustic|live|tribute|cover|karaoke|mix|edit)$/gi, "")
    .replace(/\s*[([{(](?:feat|ft|with|featuring)\b.*?[)\]}]/gi, "")
    .replace(/\s*(?:-\s*)?(?:feat|ft|with|featuring)\b.*$/gi, "")
    .trim();
}

function cleanArtist(artist: string): string {
  return artist
    .replace(/\s*[([{(](?:feat|ft|with|featuring)\b.*?[)\]}]/gi, "")
    .replace(/\s*(?:-\s*)?(?:feat|ft|with|featuring)\b.*$/gi, "")
    .trim();
}

const lyricsCache = new Map<string, { data: any, timestamp: number }>();

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      // Handle API proxy requests
      const url = new URL(request.url);
      if (url.pathname === "/api/lyrics") {
        const artist = url.searchParams.get("artist");
        const track = url.searchParams.get("track");
        const durationParam = url.searchParams.get("duration");
        const duration = durationParam ? parseInt(durationParam, 10) : 0;

        if (!artist || !track) {
          return new Response(JSON.stringify({ error: "Missing artist or track" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const cacheKey = `${artist}:${track}`;
        const cached = lyricsCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
          return new Response(JSON.stringify(cached.data), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        const extractedOriginal = extractOriginalArtist(track);
        const cleanedArtist = cleanArtist(artist);
        const cleanedTrack = cleanTitle(track);

        const checkCustomLyrics = (a: string, t: string) => {
          const key = `${a.toLowerCase().trim()} - ${t.toLowerCase().trim()}`;
          return CUSTOM_LYRICS[key] || null;
        };

        const customData = checkCustomLyrics(cleanedArtist, cleanedTrack) ||
                           checkCustomLyrics(artist, track) ||
                           (extractedOriginal ? checkCustomLyrics(extractedOriginal, cleanedTrack) : null);

        if (customData) {
          return new Response(JSON.stringify(customData), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        const tryFetchLyrics = async (a: string, t: string, dur?: number) => {
          let lyricsUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(a)}&track_name=${encodeURIComponent(t)}`;
          if (dur && dur > 0) {
            lyricsUrl += `&duration=${dur}`;
          }
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          try {
            const res = await fetch(lyricsUrl, { 
              signal: controller.signal,
              headers: {
                "User-Agent": "LyricalSyncGame v1.0.0 (https://github.com/jagwalansh/lyrical-sync-game)"
              }
            });
            clearTimeout(timeoutId);
            if (!res.ok) return null;
            const data = await res.json();
            return new Response(JSON.stringify(data), {
              status: res.status,
              headers: { "content-type": "application/json" },
            });
          } catch (e) {
            clearTimeout(timeoutId);
            console.error(`Failed to get lyrics for ${a} - ${t}:`, e);
            return null;
          }
        };

        const isTrackMatch = (item: { trackName: string; artistName: string }, expectedArtist: string, expectedTrack: string): boolean => {
          const itemArtist = cleanArtist(item.artistName).toLowerCase();
          const itemTrack = cleanTitle(item.trackName).toLowerCase();
          const expArtist = cleanArtist(expectedArtist).toLowerCase();
          const expTrack = cleanTitle(expectedTrack).toLowerCase();

          // Check if artist matches (exact or subset/superset)
          const artistMatches = itemArtist === expArtist || itemArtist.includes(expArtist) || expArtist.includes(itemArtist);
          
          // Check if track matches (exact or subset/superset)
          const trackMatches = itemTrack === expTrack || itemTrack.includes(expTrack) || expTrack.includes(itemTrack);
          
          return artistMatches && trackMatches;
        };

        const searchFallbackLyrics = async (a: string, t: string, dur?: number) => {
          const aggressivelyCleanedTrack = t.replace(/\s*[([{(].*?[)\]}]/gi, "").trim();
          const aggressivelyCleanedArtist = a.replace(/\s*[([{(].*?[)\]}]/gi, "").trim();
          
          // Build search candidate pairs: [artist, track]
          const searchPairs = [
            [a, t],
          ];
          if (aggressivelyCleanedTrack !== t || aggressivelyCleanedArtist !== a) {
            searchPairs.push([aggressivelyCleanedArtist, aggressivelyCleanedTrack]);
          }

          for (const [searchArtist, searchTrack] of searchPairs) {
            const searchUrls = [
              `https://lrclib.net/api/search?artist_name=${encodeURIComponent(searchArtist)}&track_name=${encodeURIComponent(searchTrack)}`,
              `https://lrclib.net/api/search?q=${encodeURIComponent(searchArtist + " " + searchTrack)}`,
              `https://lrclib.net/api/search?q=${encodeURIComponent(searchTrack)}` // Fallback search with only track, but we will filter by artist below
            ];

            if (dur && dur > 0) {
              searchUrls[0] += `&duration=${dur}`;
              searchUrls[1] += `&duration=${dur}`;
              searchUrls[2] += `&duration=${dur}`;
            }

            for (const searchUrl of searchUrls) {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 10000);

              try {
                const res = await fetch(searchUrl, {
                  signal: controller.signal,
                  headers: {
                    "User-Agent": "LyricalSyncGame v1.0.0 (https://github.com/jagwalansh/lyrical-sync-game)"
                  }
                });
                clearTimeout(timeoutId);
                if (!res.ok) continue;
                const results = (await res.json()) as Array<{
                  trackName: string;
                  artistName: string;
                  syncedLyrics?: string;
                  duration?: number;
                }>;

                if (Array.isArray(results) && results.length > 0) {
                  // Find the first result that has synced lyrics and matches both artist and track
                  const match = results.find(item => 
                    item.syncedLyrics && isTrackMatch(item, searchArtist, searchTrack)
                  );
                  
                  if (match) {
                    return new Response(JSON.stringify(match), {
                      status: 200,
                      headers: { "content-type": "application/json" },
                    });
                  }
                }
              } catch (e) {
                clearTimeout(timeoutId);
                console.error(`Search fallback failed for ${searchUrl}:`, e);
              }
            }
          }
          return null;
        };

        try {
          let response: Response | null = null;

          // 1. If we extracted an original artist from the track title (e.g. cover version), try it first
          if (extractedOriginal) {
            response = await tryFetchLyrics(extractedOriginal, cleanedTrack, duration);
          }

          // 2. Try fetching with cleaned names
          if (!response) {
            response = await tryFetchLyrics(cleanedArtist, cleanedTrack, duration);
          }
          
          // 3. If cleaned names fail and they are different from originals, try original names
          if (!response && (cleanedArtist !== artist || cleanedTrack !== track)) {
            response = await tryFetchLyrics(artist, track, duration);
          }

          // 4. Broad search fallback
          if (!response) {
            response = await searchFallbackLyrics(cleanedArtist, cleanedTrack, duration);
          }

          if (response) {
            const clone = response.clone();
            const data = await clone.json();
            lyricsCache.set(cacheKey, { data, timestamp: Date.now() });
            return response;
          }

          // Return 404 if all fail
          return new Response(JSON.stringify({ error: "No lyrics found" }), {
            status: 404,
            headers: { "content-type": "application/json" },
          });
        } catch (error) {
          console.error("Lyrics API error:", error);
          return new Response(JSON.stringify({ error: "Failed to fetch lyrics" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      }

      if (url.pathname === "/api/lyrics-search") {
        const query = url.searchParams.get("q");

        if (!query) {
          return new Response(JSON.stringify({ error: "Missing query" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
          const res = await fetch(searchUrl, {
            signal: controller.signal,
            headers: {
              "User-Agent": "LyricalSyncGame v1.0.0 (https://github.com/jagwalansh/lyrical-sync-game)"
            }
          });
          clearTimeout(timeoutId);

          if (!res.ok) {
            return new Response(JSON.stringify([]), {
              status: 200,
              headers: { "content-type": "application/json" },
            });
          }

          const results = await res.json();
          return new Response(JSON.stringify(results), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (error) {
          console.error("Lyrics search error:", error);
          return new Response(JSON.stringify({ error: "Search failed" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      }

      if (url.pathname === "/api/youtube-search") {
        const query = url.searchParams.get("q");
        const durationParam = url.searchParams.get("duration");
        const expectedDuration = durationParam ? parseInt(durationParam, 10) : 0;

        if (!query) {
          return new Response(JSON.stringify({ error: "Missing query" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        try {
          const yts = (await import("yt-search")).default;
          const r = await yts(query);
          
          let bestVideo = r.videos.length > 0 ? r.videos[0] : null;

          if (expectedDuration > 0 && r.videos.length > 0) {
            let bestDiff = Infinity;
            // Only look at the top 10 results to ensure high relevance
            const candidates = r.videos.slice(0, 10);
            for (const video of candidates) {
               const diff = Math.abs(video.seconds - expectedDuration);
               if (diff < bestDiff) {
                 bestDiff = diff;
                 bestVideo = video;
               }
            }
          }

          const videoId = bestVideo ? bestVideo.videoId : null;
          const authorName = bestVideo ? bestVideo.author.name : null;

          return new Response(JSON.stringify({ videoId, authorName }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (error) {
          console.error("YouTube search error:", error);
          return new Response(JSON.stringify({ error: "Failed to search YouTube" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
