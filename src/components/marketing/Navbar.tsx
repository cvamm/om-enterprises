"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { cn } from "@/lib/utils/cn";
import { siteConfig } from "@/lib/config/site";

const NAV = [
  { href: "/collections", label: "Collections" },
  { href: "/tiles", label: "Tiles" },
  { href: "/granite", label: "Granite" },
  { href: "/marbles", label: "Marble" },
  { href: "/house-finishing", label: "House Finishing" },
  { href: "/calculator", label: "Calculator" },
  { href: "/contact", label: "Contact" },
] as const;

const OTHER_LINKS = [
  { href: "/mirrors", label: "Mirrors" },
  { href: "/washing-basins", label: "Washing Basins" },
  { href: "/tiles-adhesive", label: "Tiles Adhesive" },
  { href: "/western-toilets", label: "Western Toilets" },
] as const;

const LINK_CLASS =
  "text-[12px] uppercase tracking-[0.16em] text-bone/79 transition-colors duration-300 hover:text-bone";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [othersOpen, setOthersOpen] = useState(false);
  const close = () => setOpen(false);

  const otherActive = OTHER_LINKS.some((l) => pathname.startsWith(`${l.href}/`));

  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY && y > 96);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      animate={{ y: hidden && !open ? "-100%" : "0%" }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="border-bone/10 bg-ink/82 fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl"
    >
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" onClick={close} className="flex items-center gap-2.5">
          <span className="font-display text-bone text-[22px] leading-none">{siteConfig.name}</span>
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

          <div
            className="relative"
            onMouseEnter={() => setOthersOpen(true)}
            onMouseLeave={() => setOthersOpen(false)}
          >
            <button
              type="button"
              className={cn(
                LINK_CLASS,
                "flex items-center gap-1.5",
                otherActive && "text-gold",
              )}
              aria-expanded={othersOpen}
              aria-controls="others-menu"
              onClick={() => setOthersOpen((v) => !v)}
            >
              Others
              <span className="text-bone/45 text-[9px]" aria-hidden="true">
                {othersOpen ? "▴" : "▾"}
              </span>
            </button>

            <AnimatePresence>
              {othersOpen ? (
                <motion.div
                  id="others-menu"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="border-bone/10 bg-ink-2/96 absolute left-0 top-full z-50 mt-3 min-w-[220px] overflow-hidden rounded-2xl border backdrop-blur-xl"
                >
                  <div className="flex flex-col p-2">
                    {OTHER_LINKS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "text-bone/79 px-4 py-2.5 text-[12px] uppercase tracking-[0.14em] transition-colors duration-300 hover:text-bone",
                          otherActive && "text-gold",
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button href="/contact" variant="secondary" size="sm">
            Contact Us
          </Button>
        </div>

        <button
          type="button"
          className="border-bone/14 text-bone/80 flex h-10 w-10 items-center justify-center rounded-full border lg:hidden"
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
            className="border-bone/10 bg-ink overflow-hidden border-t lg:hidden"
          >
            <Container className="flex flex-col gap-1 py-4">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="font-display text-bone/85 py-2.5 text-2xl"
                >
                  {item.label}
                </a>
              ))}

              <p className="text-gold pt-4 pb-1 text-[10px] uppercase tracking-[0.4em]">
                Others
              </p>
              {OTHER_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="font-display text-bone/70 py-2 text-lg"
                >
                  {item.label}
                </a>
              ))}

              <div className="pt-3">
                <Button href="/contact" variant="primary" size="md" onClick={close}>
                  Contact Us
                </Button>
              </div>
            </Container>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
