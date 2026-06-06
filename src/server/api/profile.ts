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

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ profile }), { status: 200 });
}
