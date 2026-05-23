import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

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

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      // Handle API proxy requests
      const url = new URL(request.url);
      if (url.pathname === "/api/lyrics") {
        const artist = url.searchParams.get("artist");
        const track = url.searchParams.get("track");

        if (!artist || !track) {
          return new Response(JSON.stringify({ error: "Missing artist or track" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        try {
          const lyricsUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(track)}`;
          const res = await fetch(lyricsUrl);
          const data = await res.json();
          return new Response(JSON.stringify(data), {
            status: res.status,
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

      if (url.pathname === "/api/youtube-search") {
        const query = url.searchParams.get("q");

        if (!query) {
          return new Response(JSON.stringify({ error: "Missing query" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        try {
          const yts = (await import("yt-search")).default;
          const r = await yts(query);
          const videoId = r.videos.length > 0 ? r.videos[0].videoId : null;
          const authorName = r.videos.length > 0 ? r.videos[0].author.name : null;

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
