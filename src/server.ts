import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { CUSTOM_LYRICS } from "./lib/custom-lyrics";
import { POST as saveScoreHandler } from "./server/api/save-score";
import { GET as leaderboardHandler } from "./server/api/leaderboard";
import { GET as profileHandler } from "./server/api/profile";
import { GET as userBestHandler } from "./server/api/user-best";
import { POST as contactHandler } from "./server/api/contact";
import type { ContactEnv } from "./server/api/contact";
import type { LeaderboardEnv } from "./server/api/leaderboard";
import {
  GET as videoVotesGetHandler,
  POST as videoVotesPostHandler,
} from "./server/api/video-votes";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type KVNamespace = {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
};

type WorkerEnv = ContactEnv &
  LeaderboardEnv & {
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

function withSeoHeaders(request: Request, response: Response): Response {
  const { pathname } = new URL(request.url);
  if (pathname !== "/play" && !pathname.startsWith("/play/")) return response;

  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", "noindex, nofollow");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
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
  const pattern =
    /[([{(](?:originally\s+performed\s+by|originally\s+by|in\s+the\s+style\s+of|tribute\s+to|cover\s+of)\s+(.*?)[)\]}]/i;
  const match = track.match(pattern);
  return match && match[1] ? match[1].trim() : null;
}

function cleanTitle(title: string): string {
  return title
    .replace(
      /\s*[([{(](?:originally\s+performed\s+by|originally\s+by|in\s+the\s+style\s+of|tribute\s+to|cover\s+of)\s+.*?[)\]}]/gi,
      "",
    )
    .replace(
      /\s*[([{(](?:explicit|clean|radio\s+edit|remastered|deluxe|single|ep|version|instrumental|jersey\s+club|remix|sped\s+up|slowed|acoustic|live|tribute|cover|karaoke|drill|phonk|mix|edit|reverb|lounge|tribute\s+version|cover\s+version)[)\]}]/gi,
      "",
    )
    .replace(
      /\s*-\s*(?:single|ep|deluxe|remastered|version|explicit|clean|instrumental|jersey\s+club|remix|sped\s+up|slowed|acoustic|live|tribute|cover|karaoke|mix|edit)$/gi,
      "",
    )
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

type YoutubeVideoCandidate = {
  videoId: string;
  title?: string;
  author?: string;
  seconds?: number;
  channelId?: string;
  channelHandle?: string;
  verified?: boolean;
  sourceQuery?: string;
};

type YoutubeTextRun = {
  text?: string;
  navigationEndpoint?: {
    browseEndpoint?: {
      browseId?: string;
      canonicalBaseUrl?: string;
    };
  };
};

type YoutubeText = {
  simpleText?: string;
  runs?: YoutubeTextRun[];
};

type YoutubeBadge = {
  metadataBadgeRenderer?: {
    label?: string;
    tooltip?: string;
    style?: string;
  };
};

type YoutubeVideoRenderer = {
  videoId?: string;
  title?: YoutubeText;
  ownerText?: YoutubeText;
  longBylineText?: YoutubeText;
  shortBylineText?: YoutubeText;
  lengthText?: YoutubeText;
  ownerBadges?: YoutubeBadge[];
  badges?: YoutubeBadge[];
};

type LyricsCacheData = {
  syncedLyrics?: string | null;
  duration?: number;
};

type YoutubeSearchData = {
  videoId: string;
  authorName: string;
  title?: string;
  candidates?: Array<{ videoId: string; authorName: string; title?: string }>;
};

type ScoredYoutubeVideo = {
  video: YoutubeVideoCandidate;
  score: number;
};

function normalizeMusicText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactMusicText(value: string): string {
  return normalizeMusicText(value).replace(/\s+/g, "");
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function getArtistAliases(artist: string): string[] {
  const cleaned = cleanArtist(artist);
  const aliases = [cleaned];
  const artistParts = cleaned
    .split(/\s*(?:&|\+|,|\/|\band\b|\bx\b)\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);

  aliases.push(...artistParts);
  aliases.push(...artistParts.map((part) => part.replace(/^the\s+/i, "")));
  return uniqueStrings(aliases);
}

function textIncludesMusicValue(text: string, value: string): boolean {
  const normalizedText = normalizeMusicText(text);
  const compactText = compactMusicText(text);
  const normalizedValue = normalizeMusicText(value);
  const compactValue = compactMusicText(value);

  if (!normalizedValue || !compactValue) return false;
  return normalizedText.includes(normalizedValue) || compactText.includes(compactValue);
}

function textIncludesAnyArtistAlias(text: string, artistAliases: string[]): boolean {
  return artistAliases.some((alias) => textIncludesMusicValue(text, alias));
}

function hasNormalizedPhrase(text: string, phrase: string): boolean {
  const normalizedText = ` ${normalizeMusicText(text)} `;
  const normalizedPhrase = normalizeMusicText(phrase);
  return normalizedPhrase ? normalizedText.includes(` ${normalizedPhrase} `) : false;
}

function parseYoutubeDuration(durationText: string): number | undefined {
  const parts = durationText.split(":").map((part) => Number(part));
  if (!parts.length || parts.some((part) => Number.isNaN(part))) {
    return undefined;
  }

  const seconds = parts.reduce((total, part) => total * 60 + part, 0);
  return seconds > 0 ? seconds : undefined;
}

function readTextRuns(value?: YoutubeText): string {
  if (value?.simpleText) return String(value.simpleText);
  if (Array.isArray(value?.runs)) {
    return value.runs.map((run) => run.text ?? "").join("");
  }
  return "";
}

function hasVerifiedYoutubeBadge(info: YoutubeVideoRenderer): boolean {
  const badges = [...(info.ownerBadges ?? []), ...(info.badges ?? [])];
  return badges.some((badge) => {
    const renderer = badge?.metadataBadgeRenderer;
    const text =
      `${renderer?.label ?? ""} ${renderer?.tooltip ?? ""} ${renderer?.style ?? ""}`.toLowerCase();
    return text.includes("verified") || text.includes("official artist");
  });
}

function collectYoutubeVideoRenderers(
  value: unknown,
  output: YoutubeVideoRenderer[] = [],
): YoutubeVideoRenderer[] {
  if (!value || typeof value !== "object" || output.length >= 60) {
    return output;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectYoutubeVideoRenderers(item, output);
      if (output.length >= 60) break;
    }
    return output;
  }

  const record = value as Record<string, unknown>;
  if (record.videoRenderer && typeof record.videoRenderer === "object") {
    output.push(record.videoRenderer as YoutubeVideoRenderer);
  }

  for (const child of Object.values(record)) {
    collectYoutubeVideoRenderers(child, output);
    if (output.length >= 60) break;
  }

  return output;
}

function parseYoutubeVideoRenderer(
  info: YoutubeVideoRenderer,
  sourceQuery: string,
): YoutubeVideoCandidate | null {
  if (!info?.videoId) return null;

  const ownerRun =
    info.ownerText?.runs?.[0] ?? info.longBylineText?.runs?.[0] ?? info.shortBylineText?.runs?.[0];

  const durationText = readTextRuns(info.lengthText);

  return {
    videoId: String(info.videoId),
    title: readTextRuns(info.title),
    author:
      readTextRuns(info.ownerText) ||
      readTextRuns(info.longBylineText) ||
      readTextRuns(info.shortBylineText),
    seconds: durationText ? parseYoutubeDuration(durationText) : undefined,
    channelId: ownerRun?.navigationEndpoint?.browseEndpoint?.browseId,
    channelHandle: ownerRun?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl,
    verified: hasVerifiedYoutubeBadge(info),
    sourceQuery,
  };
}

function parseYoutubeSearchHtml(html: string, sourceQuery: string): YoutubeVideoCandidate[] {
  const videos: YoutubeVideoCandidate[] = [];
  const dataMatch = html.match(
    /(?:ytInitialData\s*=\s*|window\["ytInitialData"\]\s*=\s*)({.+?});\s*<\/script>/,
  );

  if (dataMatch) {
    try {
      const data = JSON.parse(dataMatch[1]);
      const primaryContents =
        data.contents?.twoColumnSearchResultsRenderer?.primaryContents ??
        data.contents?.sectionListRenderer ??
        data.contents;
      const renderers = collectYoutubeVideoRenderers(primaryContents);

      for (const renderer of renderers) {
        const video = parseYoutubeVideoRenderer(renderer, sourceQuery);
        if (video) videos.push(video);
      }
    } catch (err) {
      console.error("Error parsing ytInitialData JSON:", err);
    }
  }

  if (videos.length === 0) {
    const videoIdRegex = /"videoId":"([^"]+)"/g;
    const seen = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = videoIdRegex.exec(html)) !== null) {
      const id = match[1];
      if (id && id.length === 11 && !seen.has(id)) {
        seen.add(id);
        videos.push({ videoId: id, sourceQuery });
      }
    }
  }

  return videos;
}

async function fetchYoutubeSearchResults(searchQuery: string): Promise<YoutubeVideoCandidate[]> {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
  const ytRes = await fetch(searchUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!ytRes.ok) {
    throw new Error(`YouTube request failed with status: ${ytRes.status}`);
  }

  return parseYoutubeSearchHtml(await ytRes.text(), searchQuery);
}

function isLiveYoutubeVersion(video: YoutubeVideoCandidate, track: string): boolean {
  const title = `${video.title ?? ""} ${video.author ?? ""}`;
  const cleanedTrack = cleanTitle(track);
  const livePhrases = [
    "live at",
    "live from",
    "live on",
    "live performance",
    "live session",
    "concert",
    "festival",
    "tour",
    "performance",
    "jingle ball",
    "tiny desk",
    "bbc radio",
    "radio 1",
    "mtv",
    "grammy",
    "late show",
    "tonight show",
    "jimmy fallon",
    "jimmy kimmel",
    "colbert",
    "vevo live",
  ];

  if (
    livePhrases.some(
      (phrase) => hasNormalizedPhrase(title, phrase) && !hasNormalizedPhrase(cleanedTrack, phrase),
    )
  ) {
    return true;
  }

  return hasNormalizedPhrase(title, "live") && !hasNormalizedPhrase(cleanedTrack, "live");
}

function scoreYoutubeVideo(
  video: YoutubeVideoCandidate,
  artist: string,
  track: string,
  expectedDuration: number,
): number {
  const title = video.title ?? "";
  const author = video.author ?? "";
  const cleanedTrack = cleanTitle(track);
  const artistAliases = getArtistAliases(artist);
  const normalizedTitle = normalizeMusicText(title);
  const normalizedAuthor = normalizeMusicText(author);
  const normalizedSourceQuery = normalizeMusicText(video.sourceQuery ?? "");
  const trackMatchesTitle = textIncludesMusicValue(title, cleanedTrack);
  const authorMatchesArtist = textIncludesAnyArtistAlias(author, artistAliases);
  const titleMatchesArtist = textIncludesAnyArtistAlias(title, artistAliases);

  let score = 0;

  if (trackMatchesTitle) score += 28;
  else if (title) score -= 30;

  if (authorMatchesArtist) score += 30;
  if (titleMatchesArtist) score += 8;
  if (video.verified && authorMatchesArtist) score += 8;

  if (normalizedAuthor.includes("topic") && authorMatchesArtist) score += 24;
  if (compactMusicText(author).endsWith("vevo") && authorMatchesArtist) score += 18;
  if (normalizedAuthor.includes("official") && authorMatchesArtist) score += 12;

  if (normalizedTitle.includes("official audio")) score += 22;
  else if (normalizedTitle.includes("audio")) score += 10;
  if (normalizedTitle.includes("visualizer")) score += 7;
  if (
    normalizedTitle.includes("official music video") ||
    normalizedTitle.includes("official video")
  )
    score += 4;

  if (normalizedSourceQuery.includes("official audio")) score += 4;
  if (normalizedSourceQuery.includes("topic")) score += 3;

  const trackNorm = normalizeMusicText(cleanedTrack);
  const versionPenalties: Array<[string, number]> = [
    ["karaoke", 45],
    ["sped up", 40],
    ["slowed", 40],
    ["nightcore", 40],
    ["reaction", 40],
    ["cover", 34],
    ["instrumental", 34],
    ["remix", 30],
    ["edit audio", 30],
    ["fan edit", 30],
    ["8d audio", 28],
    ["acoustic", 20],
    ["live performance", 20],
    ["live at", 20],
    ["live from", 20],
  ];

  for (const [term, penalty] of versionPenalties) {
    if (normalizedTitle.includes(term) && !trackNorm.includes(term)) {
      score -= penalty;
    }
  }

  if (normalizedTitle.includes("lyric video")) score -= 8;
  else if (normalizedTitle.includes("lyrics") && !trackNorm.includes("lyrics")) score -= 18;

  if (video.seconds && expectedDuration > 0) {
    const diff = Math.abs(video.seconds - expectedDuration);
    if (diff <= 2) score += 24;
    else if (diff <= 5) score += 18;
    else if (diff <= 8) score += 12;
    else if (diff <= 15) score += 6;
    else if (diff > 45) score -= 45;
    else if (diff > 25) score -= 22;
  } else if (expectedDuration > 0) {
    score -= 6;
  }

  if (video.seconds && (video.seconds < 30 || video.seconds > 900)) {
    score -= 50;
  }

  if (!title || !author) {
    score -= 14;
  }

  return score;
}

const lyricsCache = new Map<string, { data: LyricsCacheData; timestamp: number }>();
const youtubeCache = new Map<string, { data: YoutubeSearchData; timestamp: number }>();
const LYRICS_CACHE_TTL_SECONDS = 30 * 60;
const YOUTUBE_CACHE_TTL_SECONDS = 6 * 60 * 60;

async function getSharedCache<T>(env: WorkerEnv, key: string): Promise<T | null> {
  if (!env.API_CACHE) return null;

  try {
    const value = await env.API_CACHE.get(key);
    return value ? (JSON.parse(value) as T) : null;
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

  const write = env.API_CACHE.put(key, JSON.stringify(value), { expirationTtl }).catch((error) =>
    console.error(`Failed to write API cache key ${key}:`, error),
  );

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
        return await leaderboardHandler(request, env);
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
      if (url.pathname === "/api/video-votes" && request.method === "GET") {
        return await videoVotesGetHandler(request);
      }
      if (url.pathname === "/api/video-votes" && request.method === "POST") {
        return await videoVotesPostHandler(request);
      }
      if (url.pathname === "/api/ping") {
        return new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      if (url.pathname === "/sitemap.xml") {
        const lastmod = "2026-06-05";
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://keyverse.me/</loc><lastmod>${lastmod}</lastmod></url>
  <url><loc>https://keyverse.me/recommended</loc><lastmod>${lastmod}</lastmod></url>
  <url><loc>https://keyverse.me/leaderboard</loc><lastmod>${lastmod}</lastmod></url>
  <url><loc>https://keyverse.me/about</loc><lastmod>${lastmod}</lastmod></url>
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
        if (
          cached?.data?.syncedLyrics &&
          Date.now() - cached.timestamp < LYRICS_CACHE_TTL_SECONDS * 1000
        ) {
          return new Response(JSON.stringify(cached.data), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        const sharedCacheKey = `lyrics:v2:${cacheKey}`;
        const sharedCached = await getSharedCache<LyricsCacheData>(env, sharedCacheKey);
        if (sharedCached?.syncedLyrics) {
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

        const customData =
          checkCustomLyrics(cleanedArtist, cleanedTrack) ||
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
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          try {
            const res = await fetch(lyricsUrl, {
              signal: controller.signal,
              headers: {
                "User-Agent":
                  "LyricalSyncGame v1.0.0 (https://github.com/jagwalansh/lyrical-sync-game)",
              },
            });
            clearTimeout(timeoutId);
            if (!res.ok) return null;
            const data = (await res.json()) as { syncedLyrics?: string | null };
            if (!data.syncedLyrics) return null;
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

        const isTrackMatch = (
          item: { trackName: string; artistName: string },
          expectedArtist: string,
          expectedTrack: string,
        ): boolean => {
          const itemArtist = cleanArtist(item.artistName).toLowerCase();
          const itemTrack = cleanTitle(item.trackName).toLowerCase();
          const expArtist = cleanArtist(expectedArtist).toLowerCase();
          const expTrack = cleanTitle(expectedTrack).toLowerCase();

          // Check if artist matches (exact or subset/superset)
          const artistMatches =
            itemArtist === expArtist ||
            itemArtist.includes(expArtist) ||
            expArtist.includes(itemArtist);

          // Check if track matches (exact or subset/superset)
          const trackMatches =
            itemTrack === expTrack || itemTrack.includes(expTrack) || expTrack.includes(itemTrack);

          return artistMatches && trackMatches;
        };

        const searchFallbackLyrics = async (a: string, t: string, dur?: number) => {
          const aggressivelyCleanedTrack = t.replace(/\s*[([{(].*?[)\]}]/gi, "").trim();
          const aggressivelyCleanedArtist = a.replace(/\s*[([{(].*?[)\]}]/gi, "").trim();

          // Build search candidate pairs: [artist, track]
          const searchPairs = [[a, t]];
          if (aggressivelyCleanedTrack !== t || aggressivelyCleanedArtist !== a) {
            searchPairs.push([aggressivelyCleanedArtist, aggressivelyCleanedTrack]);
          }

          const searchRequests = searchPairs.flatMap(([searchArtist, searchTrack]) => {
            const searchUrls = [
              `https://lrclib.net/api/search?artist_name=${encodeURIComponent(searchArtist)}&track_name=${encodeURIComponent(searchTrack)}`,
              `https://lrclib.net/api/search?q=${encodeURIComponent(searchArtist + " " + searchTrack)}`,
              `https://lrclib.net/api/search?q=${encodeURIComponent(searchTrack)}`, // Fallback search with only track, but we will filter by artist below
            ];

            if (dur && dur > 0) {
              searchUrls[0] += `&duration=${dur}`;
              searchUrls[1] += `&duration=${dur}`;
              searchUrls[2] += `&duration=${dur}`;
            }

            return searchUrls.map(async (searchUrl) => {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 12000);

              try {
                const res = await fetch(searchUrl, {
                  signal: controller.signal,
                  headers: {
                    "User-Agent":
                      "LyricalSyncGame v1.0.0 (https://github.com/jagwalansh/lyrical-sync-game)",
                  },
                });
                clearTimeout(timeoutId);
                if (!res.ok) return null;
                const results = (await res.json()) as Array<{
                  trackName: string;
                  artistName: string;
                  syncedLyrics?: string;
                  duration?: number;
                }>;

                if (Array.isArray(results) && results.length > 0) {
                  // Find the first result that has synced lyrics and matches both artist and track
                  const match = results.find(
                    (item) => item.syncedLyrics && isTrackMatch(item, searchArtist, searchTrack),
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
              return null;
            });
          });

          const results = await Promise.all(searchRequests);
          return results.find((response) => response !== null) ?? null;
        };

        try {
          const directPairs = [
            ...(extractedOriginal ? [[extractedOriginal, cleanedTrack]] : []),
            [cleanedArtist, cleanedTrack],
            ...(cleanedArtist !== artist || cleanedTrack !== track ? [[artist, track]] : []),
          ];
          const responses = await Promise.all([
            ...directPairs.map(([candidateArtist, candidateTrack]) =>
              tryFetchLyrics(candidateArtist, candidateTrack, duration),
            ),
            searchFallbackLyrics(cleanedArtist, cleanedTrack, duration),
          ]);
          const response = responses.find((candidate) => candidate !== null) ?? null;

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
              "User-Agent":
                "LyricalSyncGame v1.0.0 (https://github.com/jagwalansh/lyrical-sync-game)",
            },
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
        const rawArtist = url.searchParams.get("artist");
        const rawTrack = url.searchParams.get("track");
        const query = rawQuery ? rawQuery.replace(/\+/g, " ") : null;
        const artistParam = rawArtist ? rawArtist.replace(/\+/g, " ") : null;
        const trackParam = rawTrack ? rawTrack.replace(/\+/g, " ") : null;
        const durationParam = url.searchParams.get("duration");
        const expectedDuration = durationParam ? parseInt(durationParam, 10) : 0;
        const baseQuery = query || [artistParam, trackParam].filter(Boolean).join(" ").trim();
        const rankingArtist = artistParam || query || "";
        const rankingTrack = trackParam || query || "";

        if (!baseQuery) {
          return new Response(JSON.stringify({ error: "Missing query" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const cacheKey =
          `v8:${rankingArtist}:${rankingTrack}:${baseQuery}:${expectedDuration}`.toLowerCase();
        const cached = youtubeCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < YOUTUBE_CACHE_TTL_SECONDS * 1000) {
          return new Response(JSON.stringify(cached.data), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        const sharedCacheKey = `youtube:${cacheKey}`;
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
          const cleanedArtist = cleanArtist(rankingArtist);
          const cleanedTrack = cleanTitle(rankingTrack);
          const searchTerms =
            artistParam && trackParam
              ? [
                  `${cleanedArtist} ${cleanedTrack} official audio`,
                  `${cleanedArtist} ${cleanedTrack} topic`,
                  `${cleanedArtist} ${cleanedTrack}`,
                ]
              : [`${baseQuery} official audio`, `${baseQuery} topic`, baseQuery];

          const searchResultGroups = await Promise.all(
            uniqueStrings(searchTerms).map(async (searchTerm) => {
              try {
                return await fetchYoutubeSearchResults(searchTerm);
              } catch (error) {
                console.error(`YouTube search failed for ${searchTerm}:`, error);
                return [];
              }
            }),
          );

          const videosById = new Map<string, YoutubeVideoCandidate>();
          for (const video of searchResultGroups.flat()) {
            const existing = videosById.get(video.videoId);
            if (!existing) {
              videosById.set(video.videoId, video);
              continue;
            }

            const existingScore = scoreYoutubeVideo(
              existing,
              rankingArtist,
              rankingTrack,
              expectedDuration,
            );
            const nextScore = scoreYoutubeVideo(
              video,
              rankingArtist,
              rankingTrack,
              expectedDuration,
            );
            if (nextScore > existingScore) {
              videosById.set(video.videoId, video);
            }
          }

          const videos = [...videosById.values()].filter(
            (video) => !isLiveYoutubeVersion(video, rankingTrack),
          );
          if (videos.length === 0) {
            return new Response(
              JSON.stringify({ error: "Could not find a non-live YouTube video for this track" }),
              {
                status: 404,
                headers: { "content-type": "application/json" },
              },
            );
          }

          const scoredVideos: ScoredYoutubeVideo[] = videos
            .map((video) => ({
              video,
              score: scoreYoutubeVideo(video, rankingArtist, rankingTrack, expectedDuration),
            }))
            .sort((a, b) => b.score - a.score);
          const rankedVideos = scoredVideos.map(({ video }) => video);

          if (rankedVideos.length === 0) {
            return new Response(
              JSON.stringify({
                error: "Could not find a clean original YouTube upload for this track",
              }),
              {
                status: 404,
                headers: { "content-type": "application/json" },
              },
            );
          }

          const bestVideo = rankedVideos[0];

          const candidates = [
            bestVideo,
            ...rankedVideos.filter((video) => video.videoId !== bestVideo.videoId),
          ]
            .slice(0, 10)
            .map((video) => ({
              videoId: video.videoId,
              authorName: video.author || "YouTube",
              title: video.title,
            }));
          const data = {
            videoId: bestVideo.videoId,
            authorName: bestVideo.author || "YouTube",
            title: bestVideo.title,
            candidates,
          };
          youtubeCache.set(cacheKey, { data, timestamp: Date.now() });
          putSharedCache(env, ctx, sharedCacheKey, data, YOUTUBE_CACHE_TTL_SECONDS);

          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (error) {
          console.error("YouTube search error:", error);
          const message = error instanceof Error ? error.message : "Failed to search YouTube";
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalizedResponse = await normalizeCatastrophicSsrResponse(response);
      return withSeoHeaders(request, normalizedResponse);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
