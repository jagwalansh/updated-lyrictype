import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { CUSTOM_LYRICS } from "./lib/custom-lyrics";
import { POST as saveScoreHandler } from "./server/api/save-score";
import { GET as leaderboardHandler } from "./server/api/leaderboard";
import { GET as profileHandler } from "./server/api/profile";
import { GET as userBestHandler } from "./server/api/user-best";
import { POST as contactHandler } from "./server/api/contact";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type KVNamespace = {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
};

type WorkerEnv = {
  API_CACHE?: KVNamespace;
};

type ExecutionContext = {
  waitUntil?: (promise: Promise<unknown>) => void;
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
const youtubeCache = new Map<string, { data: any, timestamp: number }>();
const LYRICS_CACHE_TTL_SECONDS = 30 * 60;
const YOUTUBE_CACHE_TTL_SECONDS = 6 * 60 * 60;

async function getSharedCache<T>(env: WorkerEnv, key: string): Promise<T | null> {
  if (!env.API_CACHE) return null;

  try {
    const value = await env.API_CACHE.get(key);
    return value ? JSON.parse(value) as T : null;
  } catch (error) {
    console.error(`Failed to read API cache key ${key}:`, error);
    return null;
  }
}

function putSharedCache(
  env: WorkerEnv,
  ctx: ExecutionContext,
  key: string,
  value: unknown,
  expirationTtl: number,
) {
  if (!env.API_CACHE) return;

  const write = env.API_CACHE
    .put(key, JSON.stringify(value), { expirationTtl })
    .catch((error) => console.error(`Failed to write API cache key ${key}:`, error));

  if (ctx.waitUntil) {
    ctx.waitUntil(write);
  }
}

export default {
  async fetch(request: Request, env: WorkerEnv = {}, ctx: ExecutionContext = {}) {
    try {
      // Handle API proxy requests
      const url = new URL(request.url);

      if (url.pathname === "/api/save-score") {
        return await saveScoreHandler(request);
      }
      if (url.pathname === "/api/leaderboard") {
        return await leaderboardHandler(request);
      }
      if (url.pathname === "/api/profile") {
        return await profileHandler();
      }
      if (url.pathname === "/api/user-best") {
        return await userBestHandler();
      }
      if (url.pathname === "/api/contact" && request.method === "POST") {
        return await contactHandler(request, env);
      }
      if (url.pathname === "/api/ping") {
        return new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      if (url.pathname === "/sitemap.xml") {
        const lastmod = "2026-05-29";
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://keyverse.me/</loc><lastmod>${lastmod}</lastmod></url>
  <url><loc>https://keyverse.me/recommended</loc><lastmod>${lastmod}</lastmod></url>
  <url><loc>https://keyverse.me/leaderboard</loc><lastmod>${lastmod}</lastmod></url>
  <url><loc>https://keyverse.me/support</loc><lastmod>${lastmod}</lastmod></url>
  <url><loc>https://keyverse.me/terms</loc><lastmod>${lastmod}</lastmod></url>
  <url><loc>https://keyverse.me/privacy</loc><lastmod>${lastmod}</lastmod></url>
</urlset>`;
        return new Response(sitemap, {
          status: 200,
          headers: { "content-type": "application/xml; charset=utf-8" },
        });
      }

      if (url.pathname === "/robots.txt") {
        const robots = `User-agent: *
Allow: /
Sitemap: https://keyverse.me/sitemap.xml`;
        return new Response(robots, {
          status: 200,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }

      if (url.pathname === "/api/lyrics") {
        const rawArtist = url.searchParams.get("artist");
        const rawTrack = url.searchParams.get("track");
        const artist = rawArtist ? rawArtist.replace(/\+/g, " ") : null;
        const track = rawTrack ? rawTrack.replace(/\+/g, " ") : null;
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
        if (cached && Date.now() - cached.timestamp < LYRICS_CACHE_TTL_SECONDS * 1000) {
          return new Response(JSON.stringify(cached.data), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        const sharedCacheKey = `lyrics:${cacheKey}`;
        const sharedCached = await getSharedCache<any>(env, sharedCacheKey);
        if (sharedCached) {
          lyricsCache.set(cacheKey, { data: sharedCached, timestamp: Date.now() });
          return new Response(JSON.stringify(sharedCached), {
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
            putSharedCache(env, ctx, sharedCacheKey, data, LYRICS_CACHE_TTL_SECONDS);
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
        const rawQuery = url.searchParams.get("q");
        const query = rawQuery ? rawQuery.replace(/\+/g, " ") : null;

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
        const rawQuery = url.searchParams.get("q");
        const query = rawQuery ? rawQuery.replace(/\+/g, " ") : null;
        const durationParam = url.searchParams.get("duration");
        const expectedDuration = durationParam ? parseInt(durationParam, 10) : 0;

        if (!query) {
          return new Response(JSON.stringify({ error: "Missing query" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const cacheKey = `${query}:${expectedDuration}`;
        const cached = youtubeCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < YOUTUBE_CACHE_TTL_SECONDS * 1000) {
          return new Response(JSON.stringify(cached.data), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        const sharedCacheKey = `youtube:v2:${cacheKey}`;
        const sharedCached = await getSharedCache<{
          videoId: string;
          authorName: string;
          candidates?: Array<{ videoId: string; authorName: string }>;
        }>(env, sharedCacheKey);
        if (sharedCached) {
          youtubeCache.set(cacheKey, { data: sharedCached, timestamp: Date.now() });
          return new Response(JSON.stringify(sharedCached), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        try {
          const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
          const ytRes = await fetch(searchUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
              "Accept-Language": "en-US,en;q=0.9",
            }
          });

          if (!ytRes.ok) {
            throw new Error(`YouTube request failed with status: ${ytRes.status}`);
          }

          const html = await ytRes.text();
          const videos: Array<{ videoId: string; title?: string; author?: string; seconds?: number }> = [];

          // Try parsing initial data first
          const dataMatch = html.match(/(?:ytInitialData\s*=\s*|window\["ytInitialData"\]\s*=\s*)({.+?});\s*<\/script>/);
          if (dataMatch) {
            try {
              const data = JSON.parse(dataMatch[1]);
              const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
              const results = contents?.find((c: any) => c.itemSectionRenderer)?.itemSectionRenderer?.contents || [];
              for (const item of results) {
                const info = item.videoRenderer;
                if (info && info.videoId) {
                  const title = info.title?.runs?.[0]?.text || "";
                  const author = info.ownerText?.runs?.[0]?.text || "";
                  const durationText = info.lengthText?.simpleText || "";
                  const parts = durationText.split(":").map(Number);
                  let seconds = 0;
                  if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
                  else if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
                  
                  videos.push({
                    videoId: info.videoId,
                    title,
                    author,
                    seconds
                  });
                }
              }
            } catch (err) {
              console.error("Error parsing ytInitialData JSON:", err);
            }
          }

          // Fallback: extract raw video IDs via Regex if JSON parsing yields nothing
          if (videos.length === 0) {
            const videoIdRegex = /"videoId":"([^"]+)"/g;
            const seen = new Set<string>();
            let m;
            while ((m = videoIdRegex.exec(html)) !== null) {
              const id = m[1];
              if (id && id.length === 11 && !seen.has(id)) {
                seen.add(id);
                videos.push({ videoId: id });
              }
            }
          }

          if (videos.length === 0) {
            return new Response(JSON.stringify({ error: "Could not find a YouTube video for this track" }), {
              status: 404,
              headers: { "content-type": "application/json" },
            });
          }

          let bestVideo = videos[0];
          if (expectedDuration > 0) {
            let bestDiff = Infinity;
            // Only look at the top 10 results to ensure high relevance
            const candidates = videos.slice(0, 10);
            for (const video of candidates) {
              if (video.seconds !== undefined) {
                const diff = Math.abs(video.seconds - expectedDuration);
                if (diff < bestDiff) {
                  bestDiff = diff;
                  bestVideo = video;
                }
              }
            }
          }

          const candidates = [
            bestVideo,
            ...videos.filter((video) => video.videoId !== bestVideo.videoId),
          ]
            .slice(0, 10)
            .map((video) => ({
              videoId: video.videoId,
              authorName: video.author || "YouTube",
            }));
          const data = {
            videoId: bestVideo.videoId,
            authorName: bestVideo.author || "YouTube",
            candidates,
          };
          youtubeCache.set(cacheKey, { data, timestamp: Date.now() });
          putSharedCache(env, ctx, sharedCacheKey, data, YOUTUBE_CACHE_TTL_SECONDS);

          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (error: any) {
          console.error("YouTube search error:", error);
          return new Response(JSON.stringify({ error: error.message || "Failed to search YouTube" }), {
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
