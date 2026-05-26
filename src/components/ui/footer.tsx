import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Github, Heart, Coffee, ExternalLink, Youtube, Instagram } from "lucide-react";

export function Footer() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-24 px-6 flex flex-col gap-8">
      {/* Bug Report Mail Option */}
      <div className="flex justify-end text-[10px] text-muted-foreground font-mono -mb-5 px-2 select-none">
        <span>Found a bug? Mail us at <a href="mailto:bugs@lyrictype.com" className="text-primary hover:text-primary/80 transition-colors font-medium border-b border-primary/20 hover:border-primary">bugs@lyrictype.com</a></span>
      </div>

      {/* Dedicated Support & Donation Space */}
      <div className="w-full rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/5 p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden backdrop-blur-sm shadow-sm">
        {/* Ambient background glow inside the banner */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10 text-left">
          <div className="h-11 w-11 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
            <Heart className="h-5 w-5 fill-current text-incorrect animate-pulse" />
          </div>
          <div>
            <h4 className="font-mono text-sm font-semibold tracking-wide text-foreground">
              Support the Project
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-md leading-relaxed">
              LyricType is completely free and open-source. Help keep our servers running and support future development!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          {/* Buy Me A Coffee */}
          <motion.a
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            href="https://buymeacoffee.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold font-mono transition-colors shadow-sm"
          >
            <Coffee className="h-4 w-4" />
            <span>Coffee</span>
          </motion.a>

          {/* PayPal */}
          <motion.a
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            href="https://paypal.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold font-mono transition-colors shadow-sm"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M20.067 8.478c.492.29.83.696.994 1.25.163.554.12 1.216-.134 2.052l-2.02 6.643c-.15.49-.447.887-.887 1.185-.44.298-.957.447-1.554.447h-5.26c-.33 0-.616-.103-.86-.31s-.38-.49-.407-.847L9.043 4.148c-.027-.35-.152-.647-.375-.89-.223-.243-.51-.365-.86-.365H4.26c-.22 0-.41-.07-.57-.213A.77.77 0 0 1 3.45 2.1c0-.233.08-.432.24-.597a.78.78 0 0 1 .57-.248h6.29c.67 0 1.24.237 1.71.71.47.473.743 1.048.82 1.724l.983 6.353c.02.16.083.284.186.37.103.088.232.13.387.13h1.8c.84 0 1.543-.25 2.112-.75.568-.5.852-1.185.852-2.052 0-.69-.214-1.25-.64-1.68-.427-.43-.997-.645-1.71-.645h-1.66c-.33 0-.61-.103-.847-.31a.98.98 0 0 1-.355-.838l.42-1.393c.047-.16.136-.284.268-.372.132-.088.283-.132.454-.132h1.66c1.33 0 2.4.352 3.21 1.056z"/>
            </svg>
            <span>PayPal</span>
          </motion.a>

          {/* GitHub Sponsor */}
          <motion.a
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            href="https://github.com/jagwalansh/lyrical-sync-game"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-pink-500/20 bg-pink-500/5 hover:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold font-mono transition-colors shadow-sm"
          >
            <Heart className="h-4 w-4 text-incorrect" />
            <span>Sponsor</span>
          </motion.a>
        </div>
      </div>

      {/* Glassmorphic Footer Wrapper */}
      <footer className="w-full border border-border/40 bg-card/65 dark:bg-card/45 py-10 px-8 rounded-2xl backdrop-blur-md shadow-sm dark:shadow-[0_8px_32px_oklch(0_0_0_/_20%)]">
        <div className="flex flex-col gap-8">
          
          {/* Top Row: Responsive Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* Col 1: Brand details */}
            <div className="flex flex-col gap-3">
              <h3 className="font-mono text-sm font-semibold tracking-wider text-foreground">
                lyric<span className="text-primary border-b border-primary">type</span>
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                A clean, minimal rhythm typing game built for music lovers. Test your speed and accuracy in sync with the beat.
              </p>
            </div>

            {/* Col 2: Navigation links */}
            <div className="flex flex-col gap-3">
              <h4 className="font-mono text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Links
              </h4>
              <ul className="flex flex-col gap-2 text-xs text-muted-foreground font-mono">
                <li>
                  <Link to="/" className="hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-primary transition-colors">
                    Leaderboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Dedicated APIs column */}
            <div className="flex flex-col gap-3">
              <h4 className="font-mono text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Integrations
              </h4>
              <ul className="flex flex-col gap-2 text-xs text-muted-foreground font-mono">
                <li>
                  Lyrics:{" "}
                  <a
                    href="https://lrclib.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary transition-colors underline decoration-border hover:decoration-primary underline-offset-2"
                  >
                    LRCLIB API
                  </a>
                </li>
                <li>
                  Video:{" "}
                  <a
                    href="https://developers.google.com/youtube/iframe_api_reference"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary transition-colors underline decoration-border hover:decoration-primary underline-offset-2"
                  >
                    YouTube Player
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Tech stack */}
            <div className="flex flex-col gap-3">
              <h4 className="font-mono text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Tech Stack
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-mono">
                Built using <span className="text-foreground">React</span>, <span className="text-foreground">TanStack Start</span>, <span className="text-foreground">Vite</span>, <span className="text-foreground">Tailwind CSS</span>, <span className="text-foreground">Framer Motion</span>, and <span className="text-foreground">Supabase</span>.
              </p>
            </div>

          </div>

          {/* Bottom copyright row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/20 pt-6 text-[10px] text-muted-foreground font-mono">
            <div>
              &copy; {new Date().getFullYear()} lyrictype. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <motion.a
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors text-muted-foreground"
                title="GitHub"
              >
                <Github className="h-[18px] w-[18px]" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors text-muted-foreground"
                title="YouTube"
              >
                <Youtube className="h-[18px] w-[18px]" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors text-muted-foreground"
                title="Instagram"
              >
                <Instagram className="h-[18px] w-[18px]" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors text-muted-foreground"
                title="X"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </motion.a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
