import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { LogIn, UserRound, Moon, Sun, Search } from "lucide-react";
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

export function Navbar({ disableEntranceAnimation = false }: { disableEntranceAnimation?: boolean }) {
  const { setModalOpen } = useModal();
  const { user, profile, loading: authLoading } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isEntranceDone, setIsEntranceDone] = useState(disableEntranceAnimation);
  const [scrollY, setScrollY] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  const navigate = useNavigate();
  const router = useRouter();
  const [searchVal, setSearchVal] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setSearchVal(params.get("q") || "");
  }, [router.state.location.href]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/",
      search: { q: searchVal.trim() || undefined }
    });
  };

  useEffect(() => {
    const dark = document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark";
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    // Initial check
    handleScroll();
    handleResize();

    // Trigger entrance expansion after a small delay if not disabled
    let timer: NodeJS.Timeout | undefined;
    if (!disableEntranceAnimation) {
      timer = setTimeout(() => {
        setIsEntranceDone(true);
      }, 450);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (timer) clearTimeout(timer);
    };
  }, [disableEntranceAnimation]);

  const baseWidth = Math.min(896, windowWidth - 32);
  const shrinkWidth = Math.max(360, baseWidth * 0.6);
  const isScrolled = scrollY > 20;
  const targetWidth = isEntranceDone
    ? (isScrolled ? shrinkWidth : baseWidth)
    : 160;

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
      <motion.nav
        initial={disableEntranceAnimation ? false : { opacity: 0, scale: 0.9, y: -20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          width: targetWidth,
        }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 18,
        }}
        className="sticky top-8 z-50 mx-auto text-md backdrop-blur-md border border-border/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_oklch(0_0_0_/_40%),_0_0_16px_oklch(0.680_0.116_200.7_/_15%)] rounded-2xl my-8 bg-card/60 dark:bg-card/40 flex items-center overflow-hidden h-[60px]"
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4 w-full">
          <Link to="/" className="font-mono text-xl font-medium tracking-tight hover:opacity-90 transition-opacity shrink-0">
            lyric<span className="border-b-2 border-primary text-primary">type</span>
          </Link>

          {isEntranceDone && (
            <form
              onSubmit={handleSearchSubmit}
              className="relative hidden sm:flex items-center min-w-0 mx-2 z-50"
            >
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search songs..."
                className="w-28 focus:w-44 md:w-44 md:focus:w-64 bg-background/50 hover:bg-background/80 focus:bg-background/95 border border-border/40 focus:border-primary/50 text-[11px] font-mono rounded-lg pl-8 pr-3 py-1.5 outline-none transition-all duration-300 h-8 text-foreground"
              />
              <Search className={`absolute left-2.5 h-3.5 w-3.5 transition-colors ${searchFocused ? "text-primary" : "text-muted-foreground"}`} />
            </form>
          )}

          <motion.div
            initial={disableEntranceAnimation ? false : { opacity: 0, scale: 0.8 }}
            animate={isEntranceDone ? { opacity: 1, scale: 1, pointerEvents: "auto" } : { opacity: 0, scale: 0.8, pointerEvents: "none" }}
            transition={{ duration: 0.3, delay: disableEntranceAnimation ? 0 : 0.15 }}
            className="flex items-center gap-3 shrink-0"
          >
              <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group py-1.5 border border-border/40 bg-card/50 hover:bg-card/85 transition-all shadow-sm rounded-md px-3 cursor-pointer relative z-50"
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
              className="group py-1.5 border border-border/40 bg-card/50 hover:bg-card/85 transition-all shadow-sm rounded-md px-3 cursor-pointer relative z-50"
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
              className="group border border-border/40 bg-card/50 shadow-sm hover:bg-accent transition-all rounded-md px-3 h-8 cursor-pointer flex items-center justify-center relative z-50"
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
                  className="group border border-input bg-background shadow-sm hover:bg-accent transition-all rounded-md px-3 h-8 cursor-pointer flex items-center justify-center relative z-50"
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
                  className="group py-1.5 border border-border/40 bg-card/50 hover:bg-card/85 transition-all shadow-sm rounded-md px-3 cursor-pointer flex items-center justify-center h-8 relative z-50"
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
          </motion.div>
        </div>
      </motion.nav>

      <AuthModal />
      <AccountModal open={accountOpen} onOpenChange={setAccountOpen} />
    </>
  );
}
