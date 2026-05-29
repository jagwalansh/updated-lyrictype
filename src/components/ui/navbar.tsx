import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { LogIn, UserRound, Moon, Sun, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { AccountModal } from "@/components/ui/account-modal";
import { AuthModal } from "@/components/ui/auth-modal";
import { SearchModal } from "@/components/ui/search-modal";
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

function LatencyIndicator() {
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const measure = async () => {
      try {
        const start = performance.now();
        const res = await fetch("/api/ping");
        if (res.ok && active) {
          const end = performance.now();
          setLatency(Math.round(end - start));
        }
      } catch (e) {
        console.error("Latency check failed", e);
      }
    };

    measure();
    const interval = setInterval(measure, 20000); // Check every 20 seconds

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (latency === null) return null;

  const colorClass = 
    latency < 100 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" :
    latency < 250 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
    "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]";

  return (
    <div 
      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/40 bg-card/45 backdrop-blur-sm text-[10px] font-mono text-muted-foreground select-none shrink-0"
      title="Server Latency"
    >
      <span className={`h-1.5 w-1.5 rounded-full ${colorClass}`} />
      <span>{latency}ms</span>
    </div>
  );
}

export function Navbar({ disableEntranceAnimation = false }: { disableEntranceAnimation?: boolean }) {
  const { setModalOpen } = useModal();
  const { user, profile, loading: authLoading } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isEntranceDone, setIsEntranceDone] = useState(disableEntranceAnimation);
  const [scrollY, setScrollY] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  const [searchOpen, setSearchOpen] = useState(false);

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

  const toggleTheme = (event: React.MouseEvent) => {
    const isDarkNow = document.documentElement.classList.contains("dark");
    
    const applyTheme = () => {
      if (isDarkNow) {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
        setIsDark(false);
      } else {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
        setIsDark(true);
      }
    };

    if (!("startViewTransition" in document)) {
      applyTheme();
      return;
    }

    const x = event.clientX;
    const y = event.clientY;

    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    if (isDarkNow) {
      document.documentElement.classList.add("dark-to-light-transition");
    }

    const transition = (document as any).startViewTransition(() => {
      applyTheme();
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];

      document.documentElement.animate(
        {
          clipPath: isDarkNow ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 400,
          easing: "ease-in-out",
          pseudoElement: isDarkNow
            ? "::view-transition-old(root)"
            : "::view-transition-new(root)",
        }
      );
    });

    transition.finished.then(() => {
      document.documentElement.classList.remove("dark-to-light-transition");
    });
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
            key<span className="border-b-2 border-primary text-primary">Verse</span>
          </Link>


          <motion.div
            initial={disableEntranceAnimation ? false : { opacity: 0, scale: 0.8 }}
            animate={isEntranceDone ? { opacity: 1, scale: 1, pointerEvents: "auto" } : { opacity: 0, scale: 0.8, pointerEvents: "none" }}
            transition={{ duration: 0.3, delay: disableEntranceAnimation ? 0 : 0.15 }}
            className="flex items-center gap-3 shrink-0"
          >
              <LatencyIndicator />
              <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="py-1.5 border border-border/40 bg-card/50 hover:bg-card/85 transition-all shadow-sm rounded-md px-3 cursor-pointer relative z-50"
            >
              <Link to="/" className="font-mono text-xl font-medium tracking-tight">
                <HomeIcon className="text-foreground hover:text-primary transition-colors duration-200" />
              </Link>
             </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(true)}
              className="py-1.5 border border-border/40 bg-card/50 hover:bg-card/85 transition-all shadow-sm rounded-md px-3 cursor-pointer relative z-50 h-8 flex items-center justify-center"
              title="Search Songs"
            >
              <Search className="h-[18px] w-[18px] text-foreground hover:text-primary transition-colors duration-200" />
            </motion.button>
              <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="py-1.5 border border-border/40 bg-card/50 hover:bg-card/85 transition-all shadow-sm rounded-md px-3 cursor-pointer relative z-50"
            >
              <Link to="/leaderboard" className="font-mono text-xl font-medium tracking-tight">
                <LeaderboardIcon className="text-foreground hover:text-primary transition-colors duration-200" />
              </Link>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="border border-border/40 bg-card/50 shadow-sm hover:bg-accent transition-all rounded-md px-3 h-8 cursor-pointer flex items-center justify-center relative z-50"
              title="Toggle Theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-foreground hover:text-primary transition-colors duration-200" />
              ) : (
                <Moon className="h-4 w-4 text-foreground hover:text-primary transition-colors duration-200" />
              )}
            </motion.button>
            <div className="flex min-w-0 items-center gap-3">
              {authLoading ? (
                <div className="h-8 w-24 rounded-md bg-muted/40 animate-pulse border border-border/40" />
              ) : user ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAccountOpen(true)}
                  className="border border-input bg-background shadow-sm hover:bg-accent transition-all rounded-md px-3 h-8 cursor-pointer flex items-center justify-center relative z-50"
                >
                  <UserRound className="h-4 w-4 text-foreground hover:text-primary transition-colors duration-200" aria-hidden="true" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setModalOpen(true)}
                  className="py-1.5 border border-border/40 bg-card/50 hover:bg-card/85 transition-all shadow-sm rounded-md px-3 cursor-pointer flex items-center justify-center h-8 relative z-50"
                >
                  <div className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors duration-200 text-xs font-medium shrink-0">
                    <LogIn className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="shrink-0">Sign in</span>
                  </div>
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </motion.nav>

      <AuthModal />
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      <AccountModal open={accountOpen} onOpenChange={setAccountOpen} />
    </>
  );
}
