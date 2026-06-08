import * as Dialog from "@radix-ui/react-dialog";
import { LogOut, Save, X, Trophy } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

type PersonalBest = {
  score: number;
  accuracy: number;
  song_id: string;
  artist: string;
  track: string;
  art_url: string;
};

interface AccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountModal({ open, onOpenChange }: AccountModalProps) {
  const { user, profile, profileLoading, refreshProfile, signOut, updateProfile } = useAuth();
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pb, setPb] = useState<PersonalBest | null | undefined>(undefined);

  useEffect(() => {
    if (!open || !user) return;

    setError(null);
    setMessage(null);
    setPb(undefined);
    void refreshProfile();
    supabase
      .from("scores")
      .select("score, accuracy, song_id")
      .eq("user_id", user.id)
      .order("score", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setPb(null);
          return;
        }
        supabase
          .from("songs")
          .select("artist, track, art_url")
          .eq("id", data.song_id)
          .single()
          .then(({ data: song }) => {
            if (song)
              setPb({ ...data, artist: song.artist, track: song.track, art_url: song.art_url });
            else setPb(null);
          });
      });
  }, [open, user, refreshProfile]);

  useEffect(() => {
    if (!open) return;
    setUsername(profile?.username ?? user?.email ?? "");
  }, [open, profile?.username, user?.email]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      await updateProfile(username);
      setMessage("Account updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update your account.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await signOut();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign out.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border/40 bg-background/80 backdrop-blur-md p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-semibold tracking-tight">Account</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                Update your profile details.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close account dialog">
                <X aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="account-email" className="text-sm font-medium">
                Email account
              </label>
              <Input
                id="account-email"
                type="email"
                value={profile?.email ?? user?.email ?? ""}
                disabled
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="account-username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="account-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                minLength={3}
                disabled={profileLoading}
                required
              />
            </div>

            {error && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            {message && (
              <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
                {message}
              </p>
            )}

            {pb === undefined ? (
              <div className="h-20 rounded-lg bg-muted/30 animate-pulse" />
            ) : pb ? (
              <div className="rounded-lg border border-border/20 bg-background/30 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-mono font-semibold text-foreground">
                    Personal Best
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {pb.art_url && (
                    <img
                      src={pb.art_url}
                      alt={`${pb.track} album artwork`}
                      className="h-10 w-10 rounded-lg object-cover border border-border/10"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate text-foreground">{pb.track}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{pb.artist}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">{pb.score.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{pb.accuracy}% acc</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" onClick={handleSignOut} disabled={signingOut}>
                <LogOut aria-hidden="true" />
                {signingOut ? "Signing out" : "Sign out"}
              </Button>
              <Button type="submit" disabled={saving || profileLoading}>
                <Save aria-hidden="true" />
                {saving ? "Saving" : "Save changes"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
