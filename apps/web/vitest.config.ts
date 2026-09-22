import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, type UserConfig } from "vitest/config";

export default defineConfig({
  // Cast: @vitejs/plugin-react targets vite 8 while vitest bundles vite 7 types; runtime-compatible.
  plugins: [react()] as UserConfig["plugins"],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/tests/e2e/**", // Exclude Playwright E2E tests
      "**/.{idea,git,cache,output,temp}/**",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
