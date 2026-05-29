import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Github, Heart, Coffee, ExternalLink, Instagram, Mail } from "lucide-react";

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
              <motion.a
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="mailto:ansh@keyverse.me"
                className="hover:text-primary transition-colors text-muted-foreground"
                title="Mail"
              >
                <Mail className="h-[18px] w-[18px]" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="https://buymeacoffee.com/anshjagwal"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors text-muted-foreground"
                title="Buy Me a Coffee"
              >
                <Coffee className="h-[18px] w-[18px]" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="https://paypal.me/anshjagwal"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors text-muted-foreground"
                title="PayPal"
              >
                <svg className="h-[18px] w-[18px] fill-current" viewBox="0 0 16 16">
                  <path d="M14.06 3.713c.12-1.071-.093-1.832-.702-2.526C12.628.356 11.312 0 9.626 0H4.734a.7.7 0 0 0-.691.59L2.005 13.509a.42.42 0 0 0 .415.486h2.756l-.202 1.28a.628.628 0 0 0 .62.726H8.14c.429 0 .793-.31.862-.731l.025-.13.48-3.043.03-.164.001-.007a.35.35 0 0 1 .348-.297h.38c1.266 0 2.425-.256 3.345-.91q.57-.403.993-1.005a4.94 4.94 0 0 0 .88-2.195c.242-1.246.13-2.356-.57-3.154a2.7 2.7 0 0 0-.76-.59l-.094-.061ZM6.543 8.82a.7.7 0 0 1 .321-.079H8.3c2.82 0 5.027-1.144 5.672-4.456l.003-.016q.326.186.548.438c.546.623.679 1.535.45 2.71-.272 1.397-.866 2.307-1.663 2.874-.802.57-1.842.815-3.043.815h-.38a.87.87 0 0 0-.863.734l-.03.164-.48 3.043-.024.13-.001.004a.35.35 0 0 1-.348.296H5.595a.106.106 0 0 1-.105-.123l.208-1.32z"/>
                </svg>
              </motion.a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
