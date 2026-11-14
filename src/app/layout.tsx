import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { WhatsAppFab } from "@/components/marketing/WhatsAppFab";
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
  manifest: "/om-enterprises/manifest.webmanifest",
  icons: {
    icon: [{ url: "/om-enterprises/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/om-enterprises/icon.png", sizes: "1024x1024", type: "image/png" }],
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={rootStyle}>
      <body>
        <AppProviders>
          <a href="#main" className="skip-link">Skip to content</a>
          <Navbar />
          {children}
          <Footer />
          <WhatsAppFab />
        </AppProviders>
      </body>
    </html>
  );
}
