import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright runs against a Vercel/Railway *preview deployment*, not against a
 * local server. Set E2E_BASE_URL to the preview URL before running in CI:
 *
 *   E2E_BASE_URL=https://<preview> deploy pnpm test:e2e
 *
 * Locally, set E2E_BASE_URL=http://localhost:3000 and run `pnpm dev` first.
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const isCI = process.env.CI === "true" || process.env.CI === "1";

export default defineConfig({
  testDir: "./src/tests/e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [["list"], ["html", { open: "never" }]] : "html",
  outputDir: "./src/tests/e2e-results",

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  expect: {
    timeout: 10_000,
  },

  // The whole suite is a smoke pass against a deployed preview — it must be
  // short enough to run on every push.
  timeout: 30_000,

  projects: [
    // Moto G-class is the real target device, so the smoke pass runs in a
    // constrained mobile viewport.
    {
      name: "mobile-4g",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
