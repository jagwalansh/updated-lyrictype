import { Link } from "@tanstack/react-router";
import { LogIn, UserRound, Moon, Sun, Search } from "lucide-react";
import { lazy, Suspense, useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useModal } from "@/lib/modal-context";
import { motion } from "motion/react";

type ViewTransitionDocument = Document & {
  startViewTransition: (callback: () => void) => {
    ready: Promise<void>;
  };
};

const AccountModal = lazy(() =>
  import("@/components/ui/account-modal").then((module) => ({ default: module.AccountModal })),
);
const AuthModal = lazy(() =>
  import("@/components/ui/auth-modal").then((module) => ({ default: module.AuthModal })),
);
const SearchModal = lazy(() =>
  import("@/components/ui/search-modal").then((module) => ({ default: module.SearchModal })),
);

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
        <path d="M2 13V8H5V13H2Z M6 13V4H10V13H6Z M11 13V6H14V13H11Z" fill="currentColor" />
        <path d="M1 14H15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
};

type NavbarProps = {
  staticLayout?: boolean;
};

export function Navbar({ staticLayout = false }: NavbarProps) {
  const { modalOpen, setModalOpen } = useModal();
  const { user, loading: authLoading } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // Keep the first client render identical to SSR, then measure after hydration.
  const [windowWidth, setWindowWidth] = useState(1200);

  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const dark =
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark";
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (staticLayout) {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      setIsScrolled(false);
      handleResize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }

    const handleScroll = () => {
      const nextIsScrolled = window.scrollY > 20;
      setIsScrolled((currentIsScrolled) =>
        currentIsScrolled === nextIsScrolled ? currentIsScrolled : nextIsScrolled,
      );
    };

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    // Initial check
    handleScroll();
    handleResize();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [staticLayout]);

  const baseWidth = Math.min(896, windowWidth - 32);
  const shrinkWidth = Math.max(360, baseWidth * 0.54);
  const attachedWidth = Math.min(1200, windowWidth - 32);
  const targetWidth = !staticLayout && isScrolled ? shrinkWidth : attachedWidth;
  const navIsScrolled = !staticLayout && isScrolled;

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

    const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    if (isDarkNow) {
      document.documentElement.classList.add("dark-to-light-transition");
    }

    const transition = (document as ViewTransitionDocument).startViewTransition(() => {
      applyTheme();
    });

    transition.ready.then(() => {
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];

      document.documentElement.animate(
        {
          clipPath: isDarkNow ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 400,
          easing: "ease-in-out",
          pseudoElement: isDarkNow ? "::view-transition-old(root)" : "::view-transition-new(root)",
        },
      );
    });

    transition.finished.then(() => {
      document.documentElement.classList.remove("dark-to-light-transition");
    });
  };

  return (
    <>
      <motion.nav
        initial={false}
        animate={{
          y: navIsScrolled ? 20 : 0,
          width: targetWidth,
          borderTopLeftRadius: navIsScrolled ? 16 : 0,
          borderTopRightRadius: navIsScrolled ? 16 : 0,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
        transition={{
          y: {
            type: "spring",
            stiffness: 80,
            damping: 20,
          },
          width: {
            type: "spring",
            stiffness: 70,
            damping: 20,
          },
          borderTopLeftRadius: {
            duration: 0.48,
            ease: "easeOut",
          },
          borderTopRightRadius: {
            duration: 0.48,
            ease: "easeOut",
          },
        }}
        className={`liquid-glass-navbar sticky top-0 z-50 mx-auto mb-8 text-md flex items-center overflow-hidden h-[52px] ${
          navIsScrolled ? "is-scrolled" : ""
        }`}
      >
        <div
          className={`relative z-10 flex w-full items-center justify-between gap-4 px-6 py-2.5 ${
            navIsScrolled ? "" : "mx-auto max-w-6xl"
          }`}
        >
          <Link
            to="/"
            className="font-mono text-xl font-medium tracking-tight hover:opacity-90 transition-opacity shrink-0"
          >
            <motion.span
              className="flex items-baseline"
              animate={navIsScrolled ? "compact" : "full"}
              initial={false}
            >
              <span>k</span>
              <motion.span
                variants={{
                  full: { width: "auto", opacity: 1 },
                  compact: { width: 0, opacity: 0 },
                }}
                transition={{
                  width: { delay: navIsScrolled ? 0.26 : 0, duration: 0.34, ease: "easeOut" },
                  opacity: { delay: navIsScrolled ? 0 : 0.28, duration: 0.24, ease: "easeOut" },
                }}
                className="overflow-hidden"
              >
                ey
              </motion.span>
              <motion.span className="border-b-2 border-primary text-primary">V</motion.span>
              <motion.span
                variants={{
                  full: { width: "auto", opacity: 1 },
                  compact: { width: 0, opacity: 0 },
                }}
                transition={{
                  width: { delay: navIsScrolled ? 0.26 : 0, duration: 0.34, ease: "easeOut" },
                  opacity: { delay: navIsScrolled ? 0 : 0.28, duration: 0.24, ease: "easeOut" },
                }}
                className="overflow-hidden border-b-2 border-primary text-primary"
              >
                erse
              </motion.span>
            </motion.span>
          </Link>

          <motion.div className="flex items-center gap-3 shrink-0">
            <Link
              to="/"
              className="relative z-50 rounded-md border border-border/40 bg-card/50 px-3 py-1.5 font-mono text-xl font-medium tracking-tight shadow-sm transition-all hover:bg-card/85"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center"
              >
                <HomeIcon className="text-foreground hover:text-primary transition-colors duration-200" />
              </motion.span>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(true)}
              className="py-1.5 border border-border/40 bg-card/50 hover:bg-card/85 transition-all shadow-sm rounded-md px-3 cursor-pointer relative z-50 h-8 flex items-center justify-center"
              title="Search Songs"
            >
              <Search className="h-[18px] w-[18px] text-foreground hover:text-primary transition-colors duration-200" />
            </motion.button>
            <Link
              to="/leaderboard"
              className="relative z-50 rounded-md border border-border/40 bg-card/50 px-3 py-1.5 font-mono text-xl font-medium tracking-tight shadow-sm transition-all hover:bg-card/85"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center"
              >
                <LeaderboardIcon className="text-foreground hover:text-primary transition-colors duration-200" />
              </motion.span>
            </Link>
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
                  <UserRound
                    className="h-4 w-4 text-foreground hover:text-primary transition-colors duration-200"
                    aria-hidden="true"
                  />
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

      <Suspense fallback={null}>
        {modalOpen && <AuthModal />}
        {searchOpen && <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />}
        {accountOpen && <AccountModal open={accountOpen} onOpenChange={setAccountOpen} />}
      </Suspense>
    </>
  );
}
