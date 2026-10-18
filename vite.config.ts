import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Vite is used only by the Vitest runner here. The real build path is
 * Next.js, which reads `next.config.ts` and ignores this file entirely.
 *
 * Vitest picks up `vite.config.ts` by default, so this is the single
 * source of truth for the test environment — no separate
 * `vitest.config.ts` to keep in step.
 */
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "src/tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      // The testing bar is the calculator math, pricing derivation and
      // enquiry validation. Everything else is UI.
      include: [
        "src/lib/utils/**/*.ts",
        "src/lib/validators/**/*.ts",
        "src/lib/queries/**/*.ts",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 85,
      },
    },
  },
});
