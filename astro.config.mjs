import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import { fileURLToPath } from "node:url";

export default defineConfig({
  site: "https://lalonso.dev",
  integrations: [tailwind()],
  output: "static",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "monokai",
      },
      wrap: true,
      langs: ["php", "html", "css", "js", "ts", "bash", "json"],
    },
  },
  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
});
