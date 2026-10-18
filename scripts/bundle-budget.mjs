#!/usr/bin/env node
/**
 * bundle-budget.mjs
 *
 * Dependency-free gate for the JS and CSS budgets in §9 of the master brief.
 * Parses Next's own build manifest — so it measures what the browser actually
 * downloads, not what we hope it downloads.
 *
 * Budgets:
 *   initial JS  ≤ 200 KB gzipped (per route, root/home route is the gate)
 *   CSS         ≤  50 KB gzipped (total)
 *
 * Why not `bundlesize`: it shells out to a headless browser and an HTTP
 * server, which is slow and flaky in CI. Next already emits a build
 * manifest that has the exact figures, including gzip sizes. Reading it is
 * deterministic and free.
 *
 * Usage:  node scripts/bundle-budget.mjs
 * Exit 0 when every route is inside budget, 1 otherwise.
 */

import { existsSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const ROOT = process.cwd();
const BUILD_DIR = join(ROOT, ".next");

/**
 * Next 15 emits this at `.next/app-build-manifest.json`; Next 13/14 put it in
 * `.next/server/`. Try the current path first and fall back, so the script
 * survives a minor upgrade instead of failing on a missing file.
 */
const MANIFEST_CANDIDATES = [
  join(BUILD_DIR, "app-build-manifest.json"),
  join(BUILD_DIR, "server", "app-build-manifest.json"),
];

const MANIFEST = MANIFEST_CANDIDATES.find((candidate) => existsSync(candidate));

const BUDGETS = {
  /** KB gzipped, summed across the JS chunks Next loads for a route. */
  jsGzipKb: Number(process.env.BUDGET_JS_KB ?? 200),
  /** KB gzipped, total CSS. */
  cssGzipKb: Number(process.env.BUDGET_CSS_KB ?? 50),
  /**
   * KB gzipped for edge middleware. Not a §9 budget — §9 covers initial JS,
   * CSS, fonts and images — but middleware is paid by every request on every
   * route, so it gets its own line rather than hiding in a route row.
   */
  middlewareGzipKb: Number(process.env.BUDGET_MIDDLEWARE_KB ?? 100),
};

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

let failures = 0;

if (!MANIFEST) {
  console.error(
    `✗ app-build-manifest.json not found in .next/ or .next/server/. Run \`next build\` before checking the budget.`,
  );
  process.exit(1);
}

const manifest = readJson(MANIFEST);
const routes = Object.entries(manifest.pages ?? {});

if (routes.length === 0) {
  console.error("✗ app-build-manifest.json contains no routes.");
  process.exit(1);
}

console.log(`\nBundle budget — JS ≤ ${BUDGETS.jsGzipKb} KB gz / route, CSS ≤ ${BUDGETS.cssGzipKb} KB gz total`);
console.log("─".repeat(78));
console.log(`${"route".padEnd(38)} ${"js raw".padStart(9)} ${"js gz".padStart(8)} ${"css gz".padStart(8)}  status`);
console.log("─".repeat(78));

let worstRoute = { route: "", jsGzip: 0 };
let totalCssGzip = 0;
const seenCss = new Set();

for (const [route, files] of routes) {
  // Each manifest entry is a flat array of build-relative paths, e.g.
  // "static/chunks/app/page-abc123.js". Older shapes used `{ allFiles: [...] }`,
  // so accept both rather than silently measuring zero.
  const paths = Array.isArray(files) ? files : (files?.allFiles ?? []);

  let jsRaw = 0;
  let jsGzip = 0;

  for (const file of paths) {
    if (!file.endsWith(".js")) continue;
    const full = join(BUILD_DIR, file);
    if (!existsSync(full)) continue;
    const buf = readFileSync(full);
    jsRaw += buf.length;
    jsGzip += gzipSync(buf).length;
  }

  let cssGzip = 0;
  for (const file of paths) {
    if (!file.endsWith(".css")) continue;
    if (seenCss.has(file)) continue;
    seenCss.add(file);
    const full = join(BUILD_DIR, file);
    if (!existsSync(full)) continue;
    cssGzip += gzipSync(readFileSync(full)).length;
  }

  const jsGzipKb = Math.round((jsGzip / 1024) * 10) / 10;
  const cssGzipKb = Math.round((cssGzip / 1024) * 10) / 10;
  totalCssGzip += cssGzip;

  const over = jsGzipKb > BUDGETS.jsGzipKb;
  if (over) failures += 1;
  if (jsGzipKb > worstRoute.jsGzip) worstRoute = { route, jsGzip: jsGzipKb };

  console.log(
    `${route.padEnd(38)} ${(jsRaw / 1024).toFixed(1).padStart(8)} KB ${(jsGzipKb.toFixed(1) + " KB").padStart(8)} ${(cssGzipKb.toFixed(1) + " KB").padStart(8)}  ${over ? "OVER" : "ok"}`,
  );
}

const totalCssKb = Math.round((totalCssGzip / 1024) * 10) / 10;
const cssOver = totalCssKb > BUDGETS.cssGzipKb;
if (cssOver) failures += 1;

console.log("─".repeat(78));
console.log(`Worst route: ${worstRoute.route || "—"} at ${worstRoute.jsGzip.toFixed(1)} KB gz`);
console.log(`CSS total:   ${totalCssKb.toFixed(1)} KB gz ${cssOver ? "OVER" : "ok"}`);

// Middleware runs on the edge on every request and is NOT part of any route's
// bundle, so the per-route table above misses it entirely. Report it
// separately: it is currently the Supabase session-refresh runtime, and it is
// paid by every visitor including those who never sign in.
const middlewareBundle = join(BUILD_DIR, "server", "src", "middleware.js");
if (existsSync(middlewareBundle)) {
  const mz = gzipSync(readFileSync(middlewareBundle)).length;
  const mzKb = Math.round((mz / 1024) * 10) / 10;
  const mOver = mzKb > BUDGETS.middlewareGzipKb;
  if (mOver) failures += 1;
  console.log(
    `Middleware:  ${mzKb.toFixed(1)} KB gz ${mOver ? "OVER" : "ok"} (edge, budget ${BUDGETS.middlewareGzipKb} KB)`,
  );
}

if (failures === 0) {
  console.log("\n✓ All routes inside budget.");
} else {
  console.log(
    `\n✗ ${failures} over-budget check(s). See PERF.md before changing anything — neutral changes are reverts.`,
  );
}

process.exit(failures === 0 ? 0 : 1);
