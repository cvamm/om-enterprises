import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { PublicChrome } from "@/components/marketing/PublicChrome";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.png", sizes: "1024x1024", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f4ee",
  maximumScale: 3,
};

const rootStyle = {
  "--font-cormorant": '"Cormorant Garamond", Georgia, serif',
  "--font-inter": '"Inter", ui-sans-serif, system-ui, "Segoe UI", sans-serif',
} as CSSProperties;

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: `${siteConfig.name} — ${siteConfig.descriptor}`,
  description: siteConfig.description,
  url: siteConfig.url,
  image: `${siteConfig.url}/icon.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${siteConfig.address.line1}, ${siteConfig.address.line2}`,
    addressLocality: `${siteConfig.address.locality}, ${siteConfig.address.city}`,
    addressRegion: siteConfig.address.state,
    postalCode: siteConfig.address.zip,
    addressCountry: "IN",
  },
  telephone: "+918009930761",
  sameAs: [siteConfig.address.mapsUrl],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "08:30",
      closes: "21:00",
    },
  ],
  areaServed: siteConfig.deliveryZones.map((z) => z.label),
} satisfies Record<string, unknown>;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={rootStyle}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <AppProviders>
          <PublicChrome>{children}</PublicChrome>
        </AppProviders>
      </body>
    </html>
  );
}
