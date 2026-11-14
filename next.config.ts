import type { NextConfig } from "next";

/**
 * GitHub Pages static demo target.
 *
 * This branch exports a fully static site (`output: "export"` → `out/`) so it
 * can be hosted on GitHub Pages, which serves files only — no Node server.
 * The full server-rendered app (Supabase, server actions, ISR, auth) lives on
 * `master`; this branch is a visitor-facing demo of the same design.
 *
 * `basePath` is the repository name because a project Pages site is served
 * from `https://<user>.github.io/<repo>/`, not the domain root. Every route,
 * link and asset URL is prefixed with it.
 *
 * Image optimization needs a server, so it is off; the catalogue ships with
 * CSS/SVG placeholders (ADR 0004) and the hero is inline SVG, so nothing here
 * depends on the optimizer.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    unoptimized: true,
  },

  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

export default nextConfig;