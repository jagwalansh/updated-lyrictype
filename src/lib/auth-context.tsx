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
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Check URL parameters for authentication errors (e.g. from Google OAuth)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      // OAuth redirects often return error info in the URL hash instead of query parameters
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      const error = searchParams.get("error") || hashParams.get("error");
      const errorDescription = searchParams.get("error_description") || hashParams.get("error_description");
      
      if (error || errorDescription) {
        let displayMessage = errorDescription || error || "Authentication error occurred.";
        const msgLower = displayMessage.toLowerCase();
        if (msgLower.includes("provider google not found") || msgLower.includes("signup provider google not found")) {
          displayMessage = "Google Sign-in is not enabled in your Supabase Auth Providers. Please check Step 5 in SUPABASE_SETUP.md.";
        } else if (msgLower.includes("client_id_not_found") || msgLower.includes("client id")) {
          displayMessage = "Google Client ID is not configured correctly in your Supabase dashboard.";
        }
        setAuthError(decodeURIComponent(displayMessage.replace(/\+/g, " ")));
        
        // Clean up the URL query/hash parameters so they don't persist
        const cleanSearch = window.location.search.replace(/[?&]error[^&]*/g, "").replace(/^&/, "?");
        const cleanHash = window.location.hash.replace(/[#&]error[^&]*/g, "");
        const newUrl = window.location.pathname + (cleanSearch === "?" ? "" : cleanSearch) + cleanHash;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, []);

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
    // Redirect to the current origin (e.g. http://localhost:5173) which matches typical Supabase site URL setup
    const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
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
        authError,
        clearAuthError,
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
