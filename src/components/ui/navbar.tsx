import { Link } from "@tanstack/react-router";
import { LogIn, UserRound, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { AccountModal } from "@/components/ui/account-modal";
import { AuthModal } from "@/components/ui/auth-modal";
import { useAuth } from "@/lib/auth-context";
import { useModal } from "@/lib/modal-context";
import { motion } from "motion/react";

const HomeIcon = ({ className }: { className?: string }) => {
  return (
    <div className={`flex items-center justify-center ${className || ""}`}>
      <svg
        width="18px"
        height="18px"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 6V15H6V11C6 9.89543 6.89543 9 8 9C9.10457 9 10 9.89543 10 11V15H15V6L8 0L1 6Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};

const LeaderboardIcon = ({ className }: { className?: string }) => {
  return (
    <div className={`flex items-center justify-center ${className || ""}`}>
      <svg
        width="18px"
        height="18px"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 13V8H5V13H2Z M6 13V4H10V13H6Z M11 13V6H14V13H11Z"
          fill="currentColor"
        />
        <path
          d="M1 14H15"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export function Navbar() {
  const { setModalOpen } = useModal();
  const { user, profile, loading: authLoading } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const dark = document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark";
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <>
      <nav className="sticky top-8 z-50 text-md backdrop-blur-md border border-border/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl min-w-lg my-8 bg-card/60 dark:bg-card/40">
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="font-mono text-xl font-medium tracking-tight hover:opacity-90 transition-opacity">
            lyric<span className="border-b-2 border-primary text-primary">type</span>
          </Link>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group py-1.5 border border-border/40 bg-card/50 hover:bg-card/85 transition-all shadow-sm rounded-md px-3 cursor-pointer"
            >
              <Link to="/" className="font-mono text-xl font-medium tracking-tight">
                <div className="relative w-[18px] h-[18px]">
                  <HomeIcon className="text-foreground transition-colors duration-300" />
                  <div className="absolute inset-0 w-0 overflow-hidden transition-all duration-300 group-hover:w-full">
                    <HomeIcon className="text-primary max-w-none w-[18px] h-[18px]" />
                  </div>
                </div>
              </Link>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group py-1.5 border border-border/40 bg-card/50 hover:bg-card/85 transition-all shadow-sm rounded-md px-3 cursor-pointer"
            >
              <Link to="/" className="font-mono text-xl font-medium tracking-tight">
                <div className="relative w-[18px] h-[18px]">
                  <LeaderboardIcon className="text-foreground transition-colors duration-300" />
                  <div className="absolute inset-0 w-0 overflow-hidden transition-all duration-300 group-hover:w-full">
                    <LeaderboardIcon className="text-primary max-w-none w-[18px] h-[18px]" />
                  </div>
                </div>
              </Link>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="group border border-border/40 bg-card/50 shadow-sm hover:bg-accent transition-all rounded-md px-3 h-8 cursor-pointer flex items-center justify-center"
              title="Toggle Theme"
            >
              <div className="relative w-4 h-4">
                {isDark ? (
                  <>
                    <Sun className="h-4 w-4 text-foreground transition-colors duration-300" />
                    <div className="absolute inset-0 w-0 overflow-hidden transition-all duration-300 group-hover:w-full">
                      <Sun className="h-4 w-4 text-primary max-w-none" />
                    </div>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 text-foreground transition-colors duration-300" />
                    <div className="absolute inset-0 w-0 overflow-hidden transition-all duration-300 group-hover:w-full">
                      <Moon className="h-4 w-4 text-primary max-w-none" />
                    </div>
                  </>
                )}
              </div>
            </motion.button>
            <div className="flex min-w-0 items-center gap-3">
              {authLoading ? (
                <div className="h-8 w-24 rounded-md bg-muted/40 animate-pulse border border-border/40" />
              ) : user ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAccountOpen(true)}
                  className="group border border-input bg-background shadow-sm hover:bg-accent transition-all rounded-md px-3 h-8 cursor-pointer flex items-center justify-center"
                >
                  <div className="relative w-4 h-4">
                    <UserRound className="h-4 w-4 text-foreground transition-colors duration-300" aria-hidden="true" />
                    <div className="absolute inset-0 w-0 overflow-hidden transition-all duration-300 group-hover:w-full">
                      <UserRound className="h-4 w-4 text-primary max-w-none" aria-hidden="true" />
                    </div>
                  </div>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setModalOpen(true)}
                  className="group py-1.5 border border-border/40 bg-card/50 hover:bg-card/85 transition-all shadow-sm rounded-md px-3 cursor-pointer flex items-center justify-center h-8"
                >
                  <div className="relative flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 text-foreground transition-colors duration-300 text-xs font-medium shrink-0">
                      <LogIn className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="shrink-0">Sign in</span>
                    </div>
                    <div className="absolute inset-0 w-0 overflow-hidden transition-all duration-300 group-hover:w-full flex items-center gap-1.5 text-primary max-w-none whitespace-nowrap text-xs font-medium shrink-0">
                      <LogIn className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="shrink-0">Sign in</span>
                    </div>
                  </div>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal />
      <AccountModal open={accountOpen} onOpenChange={setAccountOpen} />
    </>
  );
}
