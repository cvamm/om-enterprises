"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "../ui/Container";
import { Eyebrow } from "../ui/Eyebrow";
import type { RoomUse } from "@/types";

/**
 * Room-use landing set. These are the shop's own browsing categories, not
 * invented collection names — the taxonomy is fixed by the domain, not the
 * design.
 */
const ROOMS: Array<{
  use: RoomUse;
  title: string;
  note: string;
}> = [
  { use: "bathroom", title: "Bathroom", note: "Anti-skid, water-tested, sealed to the grout line." },
  { use: "flooring", title: "Flooring", note: "Full body and vitrified, rated for daily footfall." },
  { use: "kitchen", title: "Kitchen", note: "Splash, plinth and floor as one considered surface." },
  { use: "living-room", title: "Living Room", note: "Large format, marble look, quiet tones." },
  { use: "wall-cladding", title: "Wall Cladding", note: "Decor and accent pieces for a single wall." },
  { use: "balcony", title: "Balcony", note: "Weather-rated and slip-resistant." },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

export function RoomCollectionGrid() {
  return (
    <section className="border-t border-bone/10 bg-ink-2 py-24 md:py-32">
      <Container>
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <Eyebrow index="02" label="COLLECTIONS" className="mb-6" />
            <h2 className="font-display text-4xl leading-[1.05] text-bone md:text-6xl">
              Six signature
              <span className="font-italic-em text-bone/77"> families of stone. </span>
            </h2>
          </div>
          <Link href="/collections" className="btn btn-secondary">
            All collections
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ROOMS.map((room, index) => (
            <motion.article
              key={room.use}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: EASE, delay: index * 0.07 }}
            >
              <Link
                href={`/collections/${room.use}`}
                className="group block h-full rounded-2xl border border-bone/10 bg-ink p-7 transition-colors duration-500 hover:border-gold/45"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="font-display text-4xl leading-none text-gold/60" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-1 h-1.5 w-1.5 rotate-45 bg-gold/50 transition-colors duration-500 group-hover:bg-gold"
                  />
                </div>
                <h3 className="mt-12 font-display text-3xl leading-[1.1] text-bone">
                  {room.title}
                </h3>
                <p className="mt-3 text-[14px] text-bone/77">{room.note}</p>
                <p className="mt-7 text-[10px] uppercase tracking-[0.24em] text-bone/73 transition-colors duration-500 group-hover:text-gold">
                  Browse this room
                </p>
              </Link>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}
