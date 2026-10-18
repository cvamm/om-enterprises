"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { cn } from "@/lib/utils/cn";
import { siteConfig } from "@/lib/config/site";

const NAV = [
  { href: "/collections", label: "Collections" },
  { href: "/tiles", label: "Tiles" },
  { href: "/origins", label: "Origins" },
  { href: "/tile-lab", label: "Tile Lab" },
  { href: "/calculator", label: "Calculator" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/craft", label: "The Craft" },
  { href: "/contact", label: "Contact" },
] as const;

const LINK_CLASS =
  "text-[12px] uppercase tracking-[0.16em] text-bone/60 transition-colors duration-300 hover:text-bone";

/**
 * Fixed header over a translucent near-black backdrop.
 *
 * Labels are static English. `en` is the site's default language and the
 * chrome is server-rendered, so hard-coding the default avoids a key-name
 * flash between the SSR HTML and the first client render. Hindi chrome
 * applies per page once a locale switch is wired up — see the ADR on i18n
 * scope.
 */
export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-bone/10 bg-ink/82 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" onClick={close} className="flex items-center gap-2.5">
          <span className="font-display text-[22px] leading-none text-bone">
            {siteConfig.name}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(LINK_CLASS, active && "text-gold")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button href="/contact" variant="secondary" size="sm">
            Request a Quote
          </Button>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-bone/14 text-bone/80 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="font-display text-xl" aria-hidden="true">
            {open ? "×" : "≡"}
          </span>
        </button>
      </Container>

      <AnimatePresence>
        {open ? (
          <motion.nav
            id="mobile-nav"
            aria-label="Primary"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-bone/10 bg-ink lg:hidden"
          >
            <Container className="flex flex-col gap-1 py-4">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="py-2.5 font-display text-2xl text-bone/85"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-3">
                <Button href="/contact" variant="primary" size="md" onClick={close}>
                  Request a Quote
                </Button>
              </div>
            </Container>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
