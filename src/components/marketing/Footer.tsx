"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Container } from "../ui/Container";
import { Eyebrow } from "../ui/Eyebrow";
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
  { href: "/login", label: "Sign in" },
] as const;

const COLUMNS = [
  { heading: "footer.shop", links: SHOP_LINKS },
  { heading: "footer.help", links: HELP_LINKS },
  { heading: "footer.company", links: COMPANY_LINKS },
] as const;

export function Footer() {
  const { t } = useTranslation("common");

  return (
    <footer className="border-t border-bone/10 bg-ink-2">
      <Container className="py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Eyebrow label="PARBAT STONE WORKS" className="mb-6" />
            <p className="font-display text-3xl leading-[1.1] text-bone">
              Tiles and natural stone,
              <span className="font-italic-em text-bone/55"> sourced across India. </span>
            </p>
            <p className="mt-5 text-bone/58">{formatAddress()}</p>
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
              <h2 className="mb-5 text-[10px] uppercase tracking-[0.45em] text-bone/45">
                {t(column.heading)}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-bone/62 transition-colors duration-300 hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-bone/10 pt-7 text-[12px] text-bone/40 md:flex-row md:items-center md:justify-between">
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
