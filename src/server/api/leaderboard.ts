import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const songId = url.searchParams.get("songId");
  const period = url.searchParams.get("period") || "alltime"; // alltime, weekly, daily

  if (!songId) {
    return new Response(JSON.stringify({ error: "songId parameter required" }), { status: 400 });
  }

  let view = "alltime_leaderboard";
  if (period === "daily") view = "daily_leaderboard";
  if (period === "weekly") view = "weekly_leaderboard";

  const { data, error } = await supabase
    .from(view)
    .select("*")
    .eq("song_id", songId)
    .order("best_score", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ leaderboard: data }), { status: 200 });
}
