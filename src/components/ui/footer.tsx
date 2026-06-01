import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Github, Heart, Instagram } from "lucide-react";

export function Footer() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-auto px-6 pt-12 pb-10">
      {/* Glassmorphic Footer Wrapper */}
      <footer className="w-full border border-border/40 bg-card/65 dark:bg-card/45 py-10 px-8 rounded-2xl backdrop-blur-md shadow-sm dark:shadow-[0_8px_32px_oklch(0_0_0_/_20%)]">
        <div className="flex flex-col gap-8">
          
          {/* Top Row: Responsive Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* Col 1: Brand details */}
            <div className="flex flex-col gap-3">
              <h3 className="font-mono text-sm font-semibold tracking-wider text-foreground">
                key<span className="text-primary border-b border-primary">Verse</span>
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
                  <Link to="/recommended" className="hover:text-primary transition-colors">
                    Recommended
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="hover:text-primary transition-colors">
                    Support & Feedback
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-primary transition-colors">
                    Privacy Policy
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

          {/* Product Hunt badge */}
          <div className="flex justify-center border-t border-border pt-6">
            <a
              href="https://www.producthunt.com/products/feel-the-rhythm-in-every-keystroke?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-feel-the-rhythm-in-every-keystroke"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full max-w-[250px]"
            >
              <img
                alt="Feel the rhythm in every keystroke. - Type lyrics in sync with your favorite songs. | Product Hunt"
                width="250"
                height="54"
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1160336&theme=dark&t=1780288425399"
                className="h-auto w-full"
              />
            </a>
          </div>

          {/* Bottom copyright row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6 text-[10px] text-muted-foreground font-mono">
            <div>
              &copy; {new Date().getFullYear()} keyVerse. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <motion.a
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="https://github.com/jagwalansh/updated-lyrictype"
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
                href="https://www.instagram.com/lyric_type"
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
                href="https://x.com/jagwalansh"
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
