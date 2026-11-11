import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import type { CSSProperties } from "react";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { siteConfig } from "@/lib/config/site";

/**
 * Cormorant Garamond — the display serif and the site's emotional voice,
 * including the italic that carries every second headline line.
 *
 * Loading as a variable font (one file spanning all four weights plus the
 * italic axis) is what keeps the whole site inside the ≤100KB font budget.
 * Six static weight files would not fit.
 *
 * display=swap: headlines are display weight, so a brief fallback flash beats
 * invisible text on a slow connection.
 */
const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
});

/**
 * Inter — body and UI. Latin-only on Google Fonts, which is fine here: every
 * Devanagari string falls through to the `Noto Sans Devanagari` slot already
 * declared in globals.css, so Hindi renders in its own face without shipping
 * a second copy of Inter's metrics.
 */
const inter = Inter({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

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
  // Web app manifest lets phones "add to home screen". The 1024px PNG covers
  // both the manifest and the iOS home-screen slot; the on-page favicon is a
  // tiny SVG so no heavy raster is pulled into the critical path on every hit.
  // Unlike build assets, metadata icon/manifest URLs are not auto-prefixed
  // with basePath, so the repo subpath is written explicitly to match
  // next.config.ts on this static-demo branch.
  manifest: "/om-enterprises/manifest.webmanifest",
  icons: {
    icon: [{ url: "/om-enterprises/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/om-enterprises/icon.png", sizes: "1024x1024", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f0e6",
  // Tile photography is heavy; allow pinch-zoom on a product page.
  maximumScale: 3,
};

const rootStyle = {
  "--font-cormorant": cormorant.variable,
  "--font-inter": inter.variable,
} as CSSProperties;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`} style={rootStyle}>
      <body>
        <AppProviders>
          {/* Skip link first in the DOM so keyboard users reach content
              without tabbing the whole nav. */}
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Navbar />
          {children}
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
