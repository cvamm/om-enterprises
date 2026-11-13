"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "../ui/Container";
import { Eyebrow } from "../ui/Eyebrow";

const EASE = [0.22, 1, 0.36, 1] as const;

const TOOLS = [
  {
    href: "/calculator",
    title: "Area Calculator",
    tag: "Box count and cost",
    body: "Two numbers in, a box count out. Wastage follows the bond pattern, the minimum order is applied, and nothing is rounded down.",
    detail: "Net area, boxes, tiles, cost per sqft",
  },
] as const;

/**
 * Section 03. A single signature tool, with a real description of what
 * happens inside it rather than a slogan.
 */
export function ToolTeaser() {
  return (
    <section className="border-t border-bone/10 bg-ink py-24 md:py-32">
      <Container>
        <div className="mb-14 max-w-2xl">
          <Eyebrow index="03" label="CALCULATOR" className="mb-6" />
          <h2 className="font-display text-4xl leading-[1.05] text-bone md:text-6xl">
            The tool that
            <span className="font-italic-em text-bone/77"> does the maths. </span>
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-1">
          {TOOLS.map((tool, index) => (
            <motion.article
              key={tool.href}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: EASE, delay: index * 0.1 }}
            >
              <Link
                href={tool.href}
                className="group relative block h-full overflow-hidden rounded-2xl border border-bone/10 bg-ink-2 p-8 transition-colors duration-500 hover:border-gold/45 md:p-10"
              >
                <div
                  className="glow-gold -right-16 -top-16 h-56 w-56"
                  aria-hidden="true"
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-gold" />
                    <span className="text-[10px] uppercase tracking-[0.24em] text-gold/75">
                      {tool.tag}
                    </span>
                  </div>
                  <h3 className="mt-10 font-display text-4xl leading-[1.05] text-bone md:text-5xl">
                    {tool.title}
                  </h3>
                  <p className="mt-4 max-w-[46ch] text-bone/78">{tool.body}</p>
                  <p className="mt-8 border-t border-bone/10 pt-5 text-[12px] text-bone/73">
                    {tool.detail}
                  </p>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}
