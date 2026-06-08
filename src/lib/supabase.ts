import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "Warning: Missing Supabase environment variables. Database operations will fail until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are added to Cloudflare settings.",
  );
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      scores: {
        Row: {
          id: string;
          user_id: string;
          song_id: string;
          score: number;
          accuracy: number;
          consistency: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          song_id: string;
          score: number;
          accuracy: number;
          consistency: number;
          created_at?: string;
        };
      };
      songs: {
        Row: {
          id: string;
          artist: string;
          track: string;
          preview_url: string;
          art_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          artist: string;
          track: string;
          preview_url: string;
          art_url: string;
          created_at?: string;
        };
      };
    };
  };
};
