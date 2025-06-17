import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  retries: 0,
  use: { viewport: { width: 1366, height: 768 } },
  webServer: {
    command: "npm run dev -- --port 3100",
    port: 3100,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});