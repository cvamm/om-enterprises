"use client";

import { motion } from "framer-motion";
import { Container } from "../ui/Container";
import { Eyebrow } from "../ui/Eyebrow";
import { siteConfig } from "@/lib/config/site";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Four claims, one line each. They come from `siteConfig.claims`, the same
 * place the warranty length and certificate policy live, so the copy on the
 * page and the promise the shop is legally on the hook for cannot drift apart.
 */
export function TrustBar() {
  return (
    <section className="border-t border-bone/10 bg-ink py-24 md:py-32">
      <Container>
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <Eyebrow index="05" label="WHY THIS SHOP" className="mb-6" />
            <h2 className="font-display text-4xl leading-[1.05] text-bone md:text-6xl">
              Claims a shop
              <span className="font-italic-em text-bone/55"> stands behind. </span>
            </h2>
          </div>
          <p className="max-w-sm text-bone/58">
            The warranty is written, the certificates are held, and the batch log runs back to the
            quarry. Not slogans.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {siteConfig.claims.map((claim, index) => (
            <motion.article
              key={claim.label}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: EASE, delay: index * 0.08 }}
              className="card flex flex-col gap-4"
            >
              <span className="font-display text-5xl leading-none text-gold/70" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-2xl leading-[1.15] text-bone">{claim.label}</h3>
              <p className="text-[14px] text-bone/55">{claim.detail}</p>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}
