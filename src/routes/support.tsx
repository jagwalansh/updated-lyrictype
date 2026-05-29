import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { motion } from "motion/react";
import { Mail, Github, MessageSquare } from "lucide-react";
import { DeflectCard } from "@/components/ui/deflect-card";

export const Route = createFileRoute("/support")({
  component: Support,
});

function Support() {
  return (
    <main className="flex flex-col justify-start items-center min-h-screen bg-background text-foreground font-sans relative">
      <Navbar />

      <div className="w-full max-w-4xl mx-auto px-6 py-28 flex flex-col gap-10 flex-1 justify-start relative z-20">
        {/* Header Section */}
        <div className="flex flex-col border-b border-border/20 pb-6 text-left">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold tracking-wider uppercase mb-1">
            Support Center
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Support & Feedback
          </h1>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xl">
            Have questions, encountered a bug, or want to support the project's growth? You can find all the resources to contact us or support development here.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
          
          {/* Card 1: Bug Reports & Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="group relative p-6 rounded-2xl border border-border/40 bg-card/45 backdrop-blur-sm hover:border-primary/30 transition-colors shadow-sm flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350 pointer-events-none rounded-2xl" />

            <div className="relative z-10 text-left">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h2 className="font-mono text-base font-bold tracking-wide text-foreground">
                Report a Bug & Feedback
              </h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Found a mistake in the lyric sync? Or did the player fail to load a video? We are constantly improving KeyVerse and would love to hear from you.
              </p>
            </div>

            <div className="relative z-10 flex flex-col gap-3 mt-8">
              {/* Email Link */}
              <a
                href="mailto:ansh@keyverse.me"
                className="flex items-center justify-between p-3 rounded-xl border border-border/20 bg-background/30 hover:bg-background/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-xs font-mono font-medium">Mail</span>
                </div>
                <span className="text-[10px] font-mono text-primary border-b border-primary/20">ansh@keyverse.me</span>
              </a>

              {/* GitHub Issues */}
              <a
                href="https://github.com/jagwalansh/updated-lyrictype/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-border/20 bg-background/30 hover:bg-background/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Github className="h-4 w-4 text-primary" />
                  <span className="text-xs font-mono font-medium">Open a GitHub Issue</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">Submit Ticket &rarr;</span>
              </a>
            </div>
          </motion.div>

          {/* Card 2: Donations & Sponsorship */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="w-full h-full"
          >
            <DeflectCard
              className="w-full h-full"
              cardClassName="group relative p-6 rounded-2xl border border-border/40 bg-card/45 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 flex flex-col justify-between h-full text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350 pointer-events-none rounded-2xl" />

              <div className="relative z-10 text-left">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="32" cy="28" r="20"/>
                    <polyline points="8 48 8 56 56 56 56 48"/>
                    <path d="M30 28a4 4 0 0 1 0-8"/>
                    <path d="M34 28a4 4 0 0 1 0 8"/>
                    <line x1="32" y1="16" x2="32" y2="20"/>
                    <line x1="32" y1="36" x2="32" y2="40"/>
                    <line x1="30" y1="28" x2="34" y2="28"/>
                    <path d="M38 22s-2-2-4-2h-4"/>
                    <path d="M26 34s2 2 4 2h4"/>
                  </svg>
                </div>
                <h2 className="font-mono text-base font-bold tracking-wide text-foreground">
                  Support the Project
                </h2>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  KeyVerse is completely free and open-source. Help support server hosting costs and motivate future feature development by buying us a coffee or sponsoring!
                </p>
              </div>

              <div className="relative z-10 flex flex-col gap-3 mt-8">
                {/* Buy Me A Coffee */}
                <motion.a
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  href="https://buymeacoffee.com/anshjagwal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-border/20 bg-background/30 hover:bg-background/80 transition-colors text-foreground"
                >
                  <div className="flex items-center gap-3">
                    <svg className="h-4 w-4 text-primary" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                      <g clipPath="url(#prefix__clip0_9_19)">
                        <path d="M256.165 256.454l-.352-.206L255 256a1.93 1.93 0 001.165.454zM256.149 256.035a.749.749 0 01-.147-.035.535.535 0 000 .098.303.303 0 00.147-.063z" fill="currentColor"/>
                        <path d="M256 256.033h.052V256l-.052.033zM255 256.675l.593-.338.22-.124.2-.213a3.388 3.388 0 00-1.013.675z" fill="currentColor"/>
                        <path d="M255.972 256.765l-.58-.552L255 256c.211.372.56.647.972.765z" fill="currentColor"/>
                        <path d="M256.179 256c-.463.2-.868.512-1.179.909l.365-.232c.249-.229.6-.497.814-.677z" fill="currentColor"/>
                        <path d="M256.203 255.273c0-.521-.255-.425-.193 1.433 0-.148.062-.3.089-.444.035-.333.062-.657.104-.989z" fill="currentColor"/>
                        <path d="M256.178 256a3.02 3.02 0 00-1.178.909l.365-.232c.248-.229.6-.497.813-.677z" fill="currentColor"/>
                        <path d="M256.24 256.58A2.523 2.523 0 00255 256c.372.18.744.36.992.496l.248.084zM256.489 256.541A3.96 3.96 0 00256 255c.19.492.348 1.001.475 1.513l.014.028z" fill="currentColor"/>
                        <path d="M267.821 145.08c-18.397 7.873-39.275 16.8-66.334 16.8A125.636 125.636 0 01168 157.265l18.714 192.072a32.091 32.091 0 0031.999 29.451s26.535 1.377 35.389 1.377c9.529 0 38.104-1.377 38.104-1.377a32.105 32.105 0 0031.992-29.451l20.044-212.247c-8.958-3.058-17.998-5.09-28.189-5.09-17.625-.007-31.826 6.062-48.232 13.08z" fill="#FD0"/>
                        <path d="M256 256l.317.296.207.124A3.207 3.207 0 00256 256z" fill="currentColor"/>
                        <path d="M431.225 136.847l-2.818-14.21c-2.529-12.75-8.269-24.797-21.36-29.405-4.197-1.474-8.958-2.108-12.176-5.16-3.217-3.05-4.168-7.79-4.912-12.184-1.379-8.066-2.674-16.139-4.087-24.19-1.219-6.923-2.184-14.7-5.36-21.05-4.134-8.527-12.713-13.514-21.243-16.814a122.376 122.376 0 00-13.361-4.132c-21.312-5.62-43.719-7.687-65.644-8.865a551.323 551.323 0 00-78.957 1.309c-19.541 1.777-40.123 3.926-58.692 10.683-6.787 2.473-13.781 5.441-18.941 10.683-6.333 6.44-8.4 16.4-3.777 24.431 3.287 5.704 8.855 9.733 14.76 12.399a119.721 119.721 0 0023.965 7.797c22.944 5.07 46.709 7.06 70.15 7.908a534.377 534.377 0 0077.861-2.542 443.547 443.547 0 0019.149-2.528c7.503-1.15 12.32-10.959 10.108-17.792-2.646-8.169-9.757-11.337-17.798-10.104-1.185.186-2.363.358-3.549.53l-.854.124c-2.724.345-5.448.666-8.172.964a433.757 433.757 0 01-16.923 1.488c-12.664.882-25.363 1.288-38.055 1.309-12.472 0-24.95-.352-37.394-1.171a475.738 475.738 0 01-16.992-1.42c-2.57-.268-5.133-.55-7.696-.867l-2.44-.31-.53-.075-2.529-.366c-5.168-.778-10.335-1.673-15.448-2.755a2.322 2.322 0 010-4.532h.097a250.82 250.82 0 0113.373-2.452c1.494-.235 2.991-.464 4.493-.689h.041c2.805-.186 5.623-.689-8.413-1.02a535.287 535.287 0 0173.101-2.576c11.844.345 23.682 1.04 35.471 2.239a391.9 391.9 0 017.579.847c.965.117 1.936.255 2.908.372l1.957.283c5.705.85 11.38 1.88 17.026 3.092 8.365 1.819 19.107 2.411 22.828 11.572 1.185 2.907 1.723 6.137 2.377 9.188l.834 3.892c.022.07.038.142.048.214 1.971 9.184 3.944 18.368 5.919 27.551a5.048 5.048 0 01-4.245 6.055h-.055l-1.206.166-1.191.158c-3.777.491-7.557.95-11.342 1.378a732.517 732.517 0 01-22.4 2.204 784.148 784.148 0 01-44.671 2.431 802.63 802.63 0 01-22.8.282 791.297 791.297 0 01-90.498-5.262 944.156 944.156 0 01-9.757-1.219c2.522.324-1.833-.248-2.715-.372-2.067-.29-4.134-.59-6.201-.902-6.939-1.04-13.836-2.322-20.761-3.445-8.371-1.377-16.378-.688-23.951 3.445a34.831 34.831 0 00-14.421 14.947c-3.266 6.75-4.238 14.099-5.698 21.352-1.461 7.253-3.735 15.057-2.874 22.503 1.854 16.07 13.092 29.129 29.257 32.05 15.207 2.755 30.497 4.987 45.827 6.888a847.199 847.199 0 00196.217 1.129 10.338 10.338 0 0111.411 11.324l-1.53 14.864-9.247 90.102a70942.686 70942.686 0 01-9.708 94.604l-2.756 26.637c-.882 8.743-1.006 17.758-2.667 26.396-2.618 13.583-11.817 21.926-25.239 24.976a175.929 175.929 0 01-37.47 4.379c-13.981.076-27.954-.544-41.935-.468-14.925.084-33.204-1.293-44.725-12.398-10.122-9.751-11.521-25.023-12.899-38.23a29492.896 29492.896 0 01-5.464-52.436l-10.129-97.182-6.552-62.88c-.111-1.04-.221-2.067-.324-3.114-.786-7.501-6.098-14.843-14.47-14.464-7.166.316-15.31 6.405-14.47 14.464l4.858 46.618 10.046 96.431c2.862 27.391 5.717 54.786 8.565 82.187.551 5.248 1.068 10.512 1.646 15.76 3.149 28.683 25.061 44.139 52.195 48.49 15.848 2.55 32.081 3.075 48.164 3.335 20.616.332 41.438 1.125 61.716-2.61 30.05-5.513 52.595-25.568 55.812-56.681l2.757-26.953c3.054-29.719 6.105-59.441 9.15-89.165l9.964-97.12 4.568-44.51a10.336 10.336 0 018.323-9.085c8.593-1.674 16.806-4.533 22.918-11.069 9.729-10.408 11.665-23.977 8.227-37.656zm-323.22 9.601c.131-.062-.11 1.061-.214 1.584-.02-.792.021-1.494.214-1.584zm.834 6.447c.068-.048.275.228.489.558-.324-.303-.531-.53-.496-.558h.007zm.82 1.082c.454.82.296.502 0 0zm1.646 1.336h.042c0 .048.075.096.103.145a1.043 1.043 0 00-.152-.145h.007zm288.376-1.998c-3.087 2.935-7.738 4.299-12.334 4.981-51.54 7.645-103.831 11.516-155.936 9.808-37.291-1.274-74.188-5.414-111.107-10.628-3.617-.51-7.538-1.171-10.025-3.837-4.686-5.028-2.384-15.153-1.165-21.228 1.116-5.566 3.252-12.984 9.874-13.776 10.336-1.212 22.338 3.147 32.564 4.697a616.948 616.948 0 0037.07 4.512c52.932 4.822 106.752 4.071 159.45-2.982a666.195 666.195 0 0028.712-4.498c8.496-1.523 17.915-4.381 23.049 4.415 3.52 5.992 3.989 14.01 3.445 20.781a11.585 11.585 0 01-3.604 7.755h.007z" fill="currentColor"/>
                      </g>
                      <defs>
                        <clipPath id="prefix__clip0_9_19">
                          <path fill="#fff" d="M0 0h512v512H0z"/>
                        </clipPath>
                      </defs>
                    </svg>
                    <span className="text-xs font-mono font-medium">Buy me a coffee</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">Coffee &rarr;</span>
                </motion.a>

                {/* PayPal */}
                <motion.a
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  href="https://paypal.me/anshjagwal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-border/20 bg-background/30 hover:bg-background/80 transition-colors text-foreground"
                >
                  <div className="flex items-center gap-3">
                    <svg className="h-4 w-4 text-primary fill-current" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M14.06 3.713c.12-1.071-.093-1.832-.702-2.526C12.628.356 11.312 0 9.626 0H4.734a.7.7 0 0 0-.691.59L2.005 13.509a.42.42 0 0 0 .415.486h2.756l-.202 1.28a.628.628 0 0 0 .62.726H8.14c.429 0 .793-.31.862-.731l.025-.13.48-3.043.03-.164.001-.007a.35.35 0 0 1 .348-.297h.38c1.266 0 2.425-.256 3.345-.91q.57-.403.993-1.005a4.94 4.94 0 0 0 .88-2.195c.242-1.246.13-2.356-.57-3.154a2.7 2.7 0 0 0-.76-.59l-.094-.061ZM6.543 8.82a.7.7 0 0 1 .321-.079H8.3c2.82 0 5.027-1.144 5.672-4.456l.003-.016q.326.186.548.438c.546.623.679 1.535.45 2.71-.272 1.397-.866 2.307-1.663 2.874-.802.57-1.842.815-3.043.815h-.38a.87.87 0 0 0-.863.734l-.03.164-.48 3.043-.024.13-.001.004a.35.35 0 0 1-.348.296H5.595a.106.106 0 0 1-.105-.123l.208-1.32z"/>
                    </svg>
                    <span className="text-xs font-mono font-medium">Donate with PayPal</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">PayPal &rarr;</span>
                </motion.a>

                {/* GitHub Sponsors */}
                <motion.a
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  href="https://github.com/sponsors/jagwalansh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-border/20 bg-background/30 hover:bg-background/80 transition-colors text-foreground"
                >
                  <div className="flex items-center gap-3">
                    <Github className="h-4 w-4 text-primary" />
                    <span className="text-xs font-mono font-medium">Sponsor on GitHub</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">Sponsor &rarr;</span>
                </motion.a>
              </div>
            </DeflectCard>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
