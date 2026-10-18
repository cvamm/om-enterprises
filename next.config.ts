import type { NextConfig } from "next";

/**
 * Railway / Render deployment target, so the build emits a self-contained
 * `standalone` output tree (`.next/standalone`) that runs on a bare Node image.
 *
 * Next 15, deliberately not 16: 16's `cacheComponents` + `partialPrefetching`
 * rework the caching model, which makes the ISR `revalidate: 3600` semantics
 * specified for product and origin pages harder to reason about. 15 is the
 * release line where `next.config.ts` is native. See ADR 0002.
 */
const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,

  // Tile photography is the product. Modern formats with a JPEG fallback.
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [480, 640, 750, 828, 960, 1080, 1200, 1440],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  experimental: {
    // Tile Lab mutates large grids on every slider drag; opt in to the
    // concurrent render path so it stays responsive.
    optimizePackageImports: ["framer-motion"],
  },

  // Next's `NextConfig` types this hook as async even though there is nothing
  // to await; returning a plain array makes `tsc` fail with "missing then,
  // catch, finally". Keep it `async` for the type contract.
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];

    return [
      {
        source: "/:path*",
        headers: security,
      },
      {
        source: "/_next/static/:path*",
        headers: [
          ...security,
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          ...security,
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
