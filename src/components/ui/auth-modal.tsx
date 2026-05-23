import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { Chrome, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { useModal } from "@/lib/modal-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthMode = "signIn" | "signUp";

export function AuthModal() {
  const { modalOpen, setModalOpen } = useModal();
  const { signIn, signUp, signInWithGoogle, resendConfirmation, authError, clearAuthError } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>("signIn");

  // Automatically open modal and display error if redirected back with an OAuth error
  useEffect(() => {
    if (authError) {
      setModalOpen(true);
      setError(authError);
      clearAuthError();
    }
  }, [authError, setModalOpen, clearAuthError]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const emailNotConfirmed = error?.toLowerCase().includes("email not confirmed") ?? false;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      if (authMode === "signIn") {
        await signIn(email, password);
        setEmail("");
        setPassword("");
        setModalOpen(false);
      } else {
        const { needsEmailConfirmation } = await signUp(email, password);

        if (needsEmailConfirmation) {
          setPassword("");
          setMessage("Account created. Confirm your email, then sign in here.");
          return;
        }

        setEmail("");
        setPassword("");
        setModalOpen(false);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Authentication failed. Please try again.";
      setError(
        errorMessage.toLowerCase().includes("email not confirmed")
          ? "Email not confirmed. Check your inbox or resend the confirmation email."
          : errorMessage,
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendConfirmation() {
    if (!email.trim()) {
      setError("Enter your email first, then resend the confirmation email.");
      return;
    }

    setError(null);
    setMessage(null);
    setResending(true);

    try {
      await resendConfirmation(email);
      setMessage("Confirmation email sent. Check your inbox, then sign in.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not resend confirmation email. Try again.",
      );
    } finally {
      setResending(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setMessage(null);
    setGoogleSubmitting(true);

    try {
      await signInWithGoogle();
    } catch (err) {
      setGoogleSubmitting(false);
      setError(err instanceof Error ? err.message : "Could not start Google sign-in. Try again.");
    }
  }

  function handleOpenChange(open: boolean) {
    setModalOpen(open);
    if (!open) {
      setError(null);
      setMessage(null);
      setPassword("");
    }
  }

  return (
    <Dialog.Root open={modalOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-semibold tracking-tight">
                {authMode === "signIn" ? "Sign in" : "Create account"}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                Save your scores and keep your progress synced.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close auth dialog">
                <X aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>

          <Tabs.Root
            value={authMode}
            onValueChange={(value) => {
              setAuthMode(value as AuthMode);
              setError(null);
              setMessage(null);
            }}
            className="w-full"
          >
            <Tabs.List className="mb-5 grid grid-cols-2 rounded-md bg-muted p-1">
              <Tabs.Trigger
                value="signIn"
                className="rounded-sm px-3 py-2 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Sign in
              </Tabs.Trigger>
              <Tabs.Trigger
                value="signUp"
                className="rounded-sm px-3 py-2 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Sign up
              </Tabs.Trigger>
            </Tabs.List>

            <Button
              type="button"
              variant="outline"
              className="mb-4 w-full"
              onClick={handleGoogleSignIn}
              disabled={googleSubmitting || submitting}
            >
              <Chrome aria-hidden="true" />
              {googleSubmitting
                ? "Opening Google..."
                : authMode === "signIn"
                  ? "Sign in with Google"
                  : "Sign up with Google"}
            </Button>

            <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              <span>or use email</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="auth-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="auth-password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={authMode === "signIn" ? "current-password" : "new-password"}
                  minLength={6}
                  required
                />
              </div>

              {error && (
                <div className="space-y-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
                  <p className="text-sm text-destructive">{error}</p>
                  {authMode === "signIn" && emailNotConfirmed && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendConfirmation}
                      disabled={resending}
                    >
                      {resending ? "Sending..." : "Resend confirmation email"}
                    </Button>
                  )}
                </div>
              )}

              {message && (
                <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
                  {message}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Working..." : authMode === "signIn" ? "Sign in" : "Create account"}
              </Button>
            </form>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
