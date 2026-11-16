"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { WhatsAppFab } from "@/components/marketing/WhatsAppFab";

/**
 * Public site chrome (header, footer, WhatsApp button).
 *
 * Wrapped in a client component so we can read the path and skip the whole
 * thing on the admin panel — those pages are an internal tool and the
 * storefront header above the product list caused the overlap the admin saw.
 */
export function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      {children}
      <Footer />
      <WhatsAppFab />
    </>
  );
}
