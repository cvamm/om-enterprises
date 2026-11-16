import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://omtiles.me";

  const staticPages = [
    "/",
    "/tiles",
    "/collections",
    "/granite",
    "/marbles",
    "/about",
    "/contact",
    "/faq",
    "/calculator",
    "/craft",
    "/origins",
  ];

  const rooms = [
    "bathroom",
    "kitchen",
    "living-room",
    "bedroom",
    "balcony",
    "exterior",
    "commercial",
  ];

  const entries: MetadataRoute.Sitemap = [
    ...staticPages.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date().toISOString(),
      changeFreq: "weekly" as const,
      priority: path === "/" ? 1.0 : 0.8,
    })),
    ...rooms.map((room) => ({
      url: `${base}/collections/${room}`,
      lastModified: new Date().toISOString(),
      changeFreq: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return entries;
}
