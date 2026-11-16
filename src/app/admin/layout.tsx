import type { ReactNode } from "react";

/**
 * Admin panel layout.
 *
 * Deliberately does NOT use the public site chrome (Navbar, Footer,
 * WhatsAppFab). Those are for customers; the admin is an internal tool and
 * showing the storefront header above the product list is what caused the
 * header to overlap the admin's own headings.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-ink">{children}</div>;
}
