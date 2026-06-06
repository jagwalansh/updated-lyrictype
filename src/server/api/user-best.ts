import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function GET() {
  if (!isSupabaseConfigured) {
    return new Response(JSON.stringify({ error: "Supabase is not configured" }), {
      status: 503,
    });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { data, error } = await supabase
    .from("scores")
    .select("score, accuracy, consistency, song_id")
    .eq("user_id", user.id)
    .order("score", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  if (!data) {
    return new Response(JSON.stringify({ pb: null }), { status: 200 });
  }

  const { data: song } = await supabase
    .from("songs")
    .select("artist, track, art_url")
    .eq("id", data.song_id)
    .single();

  return new Response(JSON.stringify({ pb: { ...data, songs: song } }), { status: 200 });
}
