import { defineConfig } from "vite";

export default defineConfig({
  base: "/TravelApp-PublishedTrips/",
  plugins: [
    {
      name: "development-csp-override",
      apply: "serve",
      transformIndexHtml(html) {
        return html.replace(/\s*<meta\s+http-equiv="Content-Security-Policy"[\s\S]*?\/>/i, "");
      }
    }
  ],
  build: {
    sourcemap: true,
    target: "es2022"
  }
});
