import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [
    tanstackStart({ server: { entry: "server" } }),
    viteReact(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/lyrics": {
        target: "https://lrclib.net",
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL("http://example.com" + path);
          const artist = url.searchParams.get("artist");
          const track = url.searchParams.get("track");
          return `/api/get?artist_name=${encodeURIComponent(artist || "")}&track_name=${encodeURIComponent(track || "")}`;
        },
      },
    },
  },
});
