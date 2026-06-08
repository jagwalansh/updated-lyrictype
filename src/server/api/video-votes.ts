import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function getRequestClient(req: Request) {
  const authHeader = req.headers.get("Authorization");
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });
}

async function loadVoteData(client: ReturnType<typeof getRequestClient>, songId: string) {
  const { data, error } = await client.rpc("get_song_video_vote_scores", {
    p_song_id: songId,
  });

  if (error) throw error;

  const scores: Record<string, number> = {};
  const userVotes: Record<string, number> = {};

  for (const row of data ?? []) {
    scores[row.video_id] = Number(row.upvotes) || 0;
    if (row.user_upvoted) userVotes[row.video_id] = 1;
  }

  return { scores, userVotes };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const songId = url.searchParams.get("songId");

  if (!songId) return jsonResponse({ error: "songId parameter required" }, 400);

  const client = getRequestClient(req);

  try {
    return jsonResponse(await loadVoteData(client, songId));
  } catch (error) {
    console.error("Failed to load video votes:", error);
    return jsonResponse({ scores: {}, userVotes: {} });
  }
}

export async function POST(req: Request) {
  const client = getRequestClient(req);
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError || !user) return jsonResponse({ error: "Unauthorized" }, 401);

  const { songId, videoId, vote } = await req.json();
  if (!songId || !videoId || (vote !== 1 && vote !== 0)) {
    return jsonResponse({ error: "songId, videoId, and a vote of 0 or 1 are required" }, 400);
  }

  if (vote === 0) {
    const { error } = await client
      .from("song_video_votes")
      .delete()
      .eq("user_id", user.id)
      .eq("song_id", String(songId))
      .eq("video_id", String(videoId));

    if (error) return jsonResponse({ error: error.message }, 400);
  } else {
    const { error } = await client.from("song_video_votes").upsert(
      {
        user_id: user.id,
        song_id: String(songId),
        video_id: String(videoId),
        vote,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,song_id,video_id" },
    );

    if (error) return jsonResponse({ error: error.message }, 400);
  }

  try {
    return jsonResponse(await loadVoteData(client, String(songId)));
  } catch (error) {
    console.error("Failed to reload video votes:", error);
    return jsonResponse({ error: "Vote saved, but updated totals could not be loaded" }, 500);
  }
}
