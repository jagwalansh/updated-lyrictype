import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
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
          rating_out_of_10: number;
          accuracy: number;
          consistency: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          song_id: string;
          rating_out_of_10: number;
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
