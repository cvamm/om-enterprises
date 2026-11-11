#!/usr/bin/env node
/**
 * verify-no-sample.mjs
 *
 * Fails the build if fictional demo data or unstripped SAMPLE placeholders
 * leaked into the production source graph.
 *
 * Why this exists: the master brief forbids shipping "OM TILES", "Morbi",
 * "42 countries", the demo phone number and so on, and requires every
 * development placeholder to be stripped before Phase 1 launch. A grep in CI
 * is the only thing that actually enforces that, because it is easy to
 * imagine yourself out of a TODO.
 *
 * Usage:
 *   node scripts/verify-no-sample.mjs [--strict]
 *
 * Exit 0 when clean, 1 when a violation is found.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const STRICT = process.argv.includes("--strict");

/** Files that are allowed to contain the markers — they document the rule. */
const ALWAYS_ALLOWED = new Set([
  "scripts/verify-no-sample.mjs",
  ".github/workflows/ci.yml",
  "README.md",
  "docs/adr/0006-no-fictional-data.md",
  "src/data/seeds/README.md",
]);

/**
 * Hard-banned strings: real brand, contact and location data from the demo
 * project that this build explicitly must not inherit. Matching is
 * case-insensitive.
 */
const FORBIDDEN = [
  // demo brand names
  /\bom\s*tiles?\b/i,
  /\bomtiles\b/i,
  // demo geography and heritage claims
  /\bmorbi\b/i,
  /\b1998\b/,
  /\b42\s*countr/i,
  // demo people
  /\britika\s*menon/i,
  /\bdevansh\s*kapoor/i,
  /\bsunita\s*rao/i,
  // demo contact details
  /studio@omtiles\.in/i,
  /\+91\s?98250\s?44\s?220/,
  /\b91\s*98250\s*44\s*220\b/,
  // demo pricing
  /₹\s*128\s*\/\s*sq\.?ft/i,
  /128\s*sq\.?ft/i,
  // stock imagery
  /pexels\.com/i,
  /unsplash\.com/i,
  /picsum\.photos/i,
];

/**
 * Placeholder markers. In `--strict` mode (CI on the launch branch) these must
 * be gone entirely. During development they are allowed but reported, so the
 * remaining debt is always visible.
 */
const PLACEHOLDER_RE = /\[SAMPLE\s*[—–-]\s*replace before deploy\]/i;
const TODO_SAMPLE_RE = /TODO[: ]+[^"\n]*(?:strip|remove|replace)[^"\n]*sample/i;

const SCAN_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".json",
  ".css",
  ".html",
  ".md",
  ".sql",
  ".yaml",
  ".yml",
  ".txt",
]);

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "coverage",
  "playwright-report",
  "e2e-results",
  "dist",
  "build",
]);

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(ROOT, full);
    const s = statSync(full, { throwIfNoEntry: false });
    if (!s) continue;
    if (s.isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue;
      yield* walk(full);
    } else if (s.isFile()) {
      const ext = rel.slice(rel.lastIndexOf("."));
      if (SCAN_EXTENSIONS.has(ext)) yield { rel, full };
    }
  }
}

const violations = [];
const placeholders = [];

for (const { rel, full } of walk(ROOT)) {
  if (ALWAYS_ALLOWED.has(rel)) continue;

  let text;
  try {
    text = readFileSync(full, "utf8");
  } catch {
    continue;
  }

  for (const pattern of FORBIDDEN) {
    const re = new RegExp(pattern.source, "g" + (pattern.flags.includes("i") ? "i" : ""));
    for (const match of text.matchAll(re)) {
      violations.push({ file: rel, term: match[0], pattern: pattern.toString() });
    }
  }

  if (PLACEHOLDER_RE.test(text)) {
    const count = text.split(PLACEHOLDER_RE).length - 1;
    placeholders.push({ file: rel, count });
  }
  if (TODO_SAMPLE_RE.test(text)) {
    placeholders.push({ file: rel, count: 1, note: "unresolved SAMPLE TODO" });
  }
}

const printTable = (rows, header) => {
  if (rows.length === 0) return;
  console.log(`\n${header}`);
  console.log("─".repeat(72));
  for (const row of rows.slice(0, 50)) {
    console.log(`  ${rel(row)}`);
  }
  if (rows.length > 50) console.log(`  … and ${rows.length - 50} more`);
};

const rel = (row) =>
  "term" in row
    ? `${row.file} :: "${row.term}"`
    : `${row.file} :: ${row.count} placeholder(s)` + (row.note ? ` (${row.note})` : "");

let exitCode = 0;

if (violations.length > 0) {
  exitCode = 1;
  printTable(violations, "FORBIDDEN demo data found — these must never ship:");
}

if (placeholders.length > 0) {
  if (STRICT) {
    exitCode = 1;
    printTable(placeholders, "SAMPLE placeholders not stripped (strict mode):");
  } else {
    printTable(placeholders, "SAMPLE placeholders still present (allowed in dev):");
  }
}

if (exitCode === 0) {
  console.log("✓ No forbidden demo data, no unstripped placeholders.");
} else {
  console.log(
    `\n✗ ${violations.length} forbidden term(s), ${placeholders.length} placeholder file(s).`,
  );
}

process.exit(exitCode);
