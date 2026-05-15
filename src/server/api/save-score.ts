import { supabase } from "@/lib/supabase";

// Convert 0-6 stars to 0-10 rating
function starsToRating(stars: number): number {
  return Math.round((stars / 6) * 10 * 100) / 100;
}

export async function POST(req: Request) {
  const { songId, artist, track, stars, accuracy, consistency, previewUrl, artUrl } =
    await req.json();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const ratingOutOf10 = starsToRating(stars);

  // Ensure song exists
  const { data: existingSong } = await supabase
    .from("songs")
    .select("id")
    .eq("id", songId)
    .single();

  if (!existingSong) {
    // Insert song if it doesn't exist
    await supabase.from("songs").insert({
      id: songId,
      artist,
      track,
      preview_url: previewUrl,
      art_url: artUrl,
    });
  }

  // Insert score
  const { data, error } = await supabase.from("scores").insert({
    user_id: user.id,
    song_id: songId,
    rating_out_of_10: ratingOutOf10,
    accuracy,
    consistency,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ score: data }), { status: 200 });
}
