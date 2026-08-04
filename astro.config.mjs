import { defineConfig } from "astro/config";

export default defineConfig({
  build: {
    format: "directory",
  },
  outDir: process.env.PUBLISHED_SITE_OUT_DIR ?? "./dist",
});
