import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase";

export type LeaderboardEnv = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

function getSupabaseConfig(env?: LeaderboardEnv) {
  return {
    url: env?.VITE_SUPABASE_URL || supabaseUrl,
    anonKey: env?.VITE_SUPABASE_ANON_KEY || supabaseAnonKey,
  };
}

export async function GET(req: Request, env?: LeaderboardEnv) {
  const config = getSupabaseConfig(env);

  if (!config.url || !config.anonKey) {
    return new Response(JSON.stringify({ error: "Supabase is not configured" }), {
      status: 503,
    });
  }

  const supabase = createClient(config.url, config.anonKey);
  const url = new URL(req.url);
  const songId = url.searchParams.get("songId");
  const period = url.searchParams.get("period") || "alltime"; // alltime, weekly, daily

  let view = "alltime_leaderboard";
  if (period === "daily") view = "daily_leaderboard";
  if (period === "weekly") view = "weekly_leaderboard";

  const limit = songId ? 50 : 500;
  let query = supabase.from(view).select("*").order("best_score", { ascending: false }).limit(limit);

  if (songId) {
    query = query.eq("song_id", songId);
  }

  const { data, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ leaderboard: data }), { status: 200 });
}
