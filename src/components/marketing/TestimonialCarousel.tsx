"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@/types";

type Props = {
  testimonials: Project[];
};

const EASE = [0.22, 1, 0.36, 1] as const;
const INTERVAL_MS = 6000;

/**
 * Auto-rotating testimonial carousel (§2 motion system).
 *
 * 6-second interval, AnimatePresence mode="wait" with a blur
 * transition between entries. The interval is cleared when the
 * carousel unmounts or when the user hovers over the quote, so
 * it does not change under your cursor mid-read.
 */
export function TestimonialCarousel({ testimonials }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    if (testimonials.length <= 1 || paused) return;
    timerRef.current = setTimeout(advance, INTERVAL_MS);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [index, advance, paused, testimonials.length]);

  if (testimonials.length === 0) return null;

  const current = testimonials[index];
  if (current === undefined) return null;
  const text = current.testimonialText;
  const name = current.testimonialName;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative mx-auto max-w-2xl"
      role="group"
      aria-label="Customer testimonials"
    >
      <AnimatePresence mode="wait">
        <motion.blockquote
          key={current.id}
          initial={{ opacity: 0, filter: "blur(8px)", y: 16 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          exit={{ opacity: 0, filter: "blur(8px)", y: -16 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="min-h-[120px]"
        >
          <p className="font-display text-2xl italic leading-relaxed text-bone/80 md:text-3xl">
            &ldquo;{text}&rdquo;
          </p>
          <footer className="mt-6 flex items-center gap-3">
            <div className="h-px w-8 bg-[#c9a96a]/60" aria-hidden="true" />
            <span className="text-[11px] uppercase tracking-[0.24em] text-bone/75">
              {name ?? "Customer"}
              {current.locality !== undefined ? ` · ${current.locality}` : ""}
            </span>
          </footer>
        </motion.blockquote>
      </AnimatePresence>

      <div className="mt-8 flex items-center gap-2" role="tablist" aria-label="Testimonials">
        {testimonials.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Testimonial ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-8 bg-[#c9a96a]" : "w-4 bg-white/15 hover:bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}