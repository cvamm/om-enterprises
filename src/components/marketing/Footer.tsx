"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Container } from "../ui/Container";
import { buildWhatsAppUrl, formatAddress, siteConfig } from "@/lib/config/site";

const SHOP_LINKS = [
  { href: "/collections", label: "Collections" },
  { href: "/tiles", label: "Tiles" },
  { href: "/origins", label: "Origins" },
  { href: "/tile-lab", label: "Tile Lab" },
  { href: "/calculator", label: "Calculator" },
] as const;

const HELP_LINKS = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/warranty", label: "Warranty" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/craft", label: "The Craft" },
] as const;

const COLUMNS = [
  { heading: "footer.shop", links: SHOP_LINKS },
  { heading: "footer.help", links: HELP_LINKS },
  { heading: "footer.company", links: COMPANY_LINKS },
] as const;

export function Footer() {
  const { t } = useTranslation("common");

  return (
    <footer className="border-bone/10 bg-ink-2 border-t">
      <Container className="py-16 md:py-24">
        <div className="mb-14 text-center md:mb-16">
          <p className="font-display text-bone text-4xl leading-none tracking-[0.02em] md:text-6xl">
            {siteConfig.name}
          </p>
          <p className="font-italic-em text-gold mt-3 text-lg md:text-xl">Marble &amp; Granites</p>
        </div>
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <p className="font-display text-bone text-3xl leading-[1.1]">
              Tiles and natural stone,
              <span className="font-italic-em text-bone/77"> sourced across India. </span>
            </p>
            <p className="text-bone/78 mt-5">{formatAddress()}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={buildWhatsAppUrl("Hello — I have a question about your tiles.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                {t("actions.sendWhatsApp")}
              </a>
              <Link href="/contact" className="btn btn-quiet">
                {t("nav.contact")}
              </Link>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={t(column.heading)}>
              <h2 className="text-bone/73 mb-5 text-[10px] tracking-[0.45em] uppercase">
                {t(column.heading)}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-bone/79 hover:text-gold transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-bone/10 text-bone/72 mt-16 flex flex-col gap-3 border-t pt-7 text-[12px] md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.legalName}. {t("footer.rights")}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <span>{siteConfig.phoneDisplay}</span>
            <span>{siteConfig.address.locality}</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
