import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/jetbrains-mono/300.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import { AuthProvider } from "@/lib/auth-context";
import { ModalProvider } from "@/lib/modal-context";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "KeyVerse — Type along to your favorite songs" },
      {
        name: "description",
        content:
          "A typing game where you race to type the lyrics of songs in real time. Minimal, fast, and free.",
      },
      { property: "og:title", content: "KeyVerse" },
      {
        property: "og:description",
        content: "Type lyrics in sync with your favorite songs.",
      },
      { property: "og:image", content: "https://keyverse.me/og-image.png" },
      { property: "og:url", content: "https://keyverse.me" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "KeyVerse" },
      {
        name: "twitter:description",
        content: "Type lyrics in sync with your favorite songs.",
      },
      { name: "twitter:image", content: "https://keyverse.me/og-image.png" },
    ],
    links: [
      {
        rel: "icon",
        href: "/android-chrome-512x512.png",
        type: "image/png",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-LMRN63VC3L" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-LMRN63VC3L');
            `,
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AdSenseLoader />
      <AuthProvider>
        <ModalProvider>
          <Outlet />
          <Toaster />
        </ModalProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AdSenseLoader() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isPlayRoute = pathname.startsWith("/play/");

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (isPlayRoute) {
      document.querySelectorAll<HTMLElement>(
        [
          "ins.adsbygoogle",
          ".google-auto-placed",
          "iframe[id^='google_ads_iframe_']",
          "iframe[src*='googlesyndication.com']",
        ].join(","),
      ).forEach((element) => element.remove());
      return;
    }

    let loaded = false;
    const loadAdSense = () => {
      if (loaded) return;
      loaded = true;
      if (document.querySelector("script[data-keyverse-adsense='true']")) return;

      const script = document.createElement("script");
      script.async = true;
      script.crossOrigin = "anonymous";
      script.dataset.keyverseAdsense = "true";
      script.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4059858414395489";
      document.head.appendChild(script);
    };

    const interactionEvents = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, loadAdSense, { once: true, passive: true });
    });
    const timer = window.setTimeout(loadAdSense, 12000);

    return () => {
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, loadAdSense);
      });
      window.clearTimeout(timer);
    };
  }, [isPlayRoute]);

  return null;
}
