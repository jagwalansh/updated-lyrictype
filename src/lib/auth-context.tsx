import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  updateProfile: (username: string) => Promise<Profile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      setProfileLoading(false);
      return null;
    }

    setProfileLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    setProfileLoading(false);

    if (error) {
      console.error(error);
      setProfile(null);
      return null;
    }

    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    // Check current session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        void loadProfile(session?.user ?? null);
      })
      .finally(() => {
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      void loadProfile(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    setUser(data.session?.user ?? null);
    void loadProfile(data.session?.user ?? null);

    return {
      needsEmailConfirmation: !data.session,
    };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setUser(data.user);
    await loadProfile(data.user);
  };

  const signInWithGoogle = async () => {
    const redirectTo = typeof window !== "undefined" ? window.location.href : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: redirectTo ? { redirectTo } : undefined,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  const resendConfirmation = async (email: string) => {
    const emailRedirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: emailRedirectTo ? { emailRedirectTo } : undefined,
    });

    if (error) throw error;
  };

  const refreshProfile = useCallback(async () => loadProfile(user), [loadProfile, user]);

  const updateProfile = useCallback(
    async (username: string) => {
      if (!user) throw new Error("You need to be signed in to update your account.");

      const trimmedUsername = username.trim();
      if (trimmedUsername.length < 3) {
        throw new Error("Username must be at least 3 characters.");
      }

      const { data, error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email ?? profile?.email ?? "",
            username: trimmedUsername,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        )
        .select("*")
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("That username is already taken.");
        }

        throw error;
      }

      setProfile(data);
      return data;
    },
    [profile?.email, user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        profileLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resendConfirmation,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
