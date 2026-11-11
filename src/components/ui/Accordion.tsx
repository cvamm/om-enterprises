"use client";

import { useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type AccordionItem = {
  id: string;
  question: string;
  answer: string;
};

type AccordionProps = {
  items: AccordionItem[];
  className?: string;
};

/**
 * FAQ and policy content. Native `<details>` semantics replaced with a
 * framer-motion collapse so the height animates; `aria-expanded` and
 * `aria-controls` are wired for assistive tech.
 */
export function Accordion({ items, className }: AccordionProps) {
  const baseId = useId();

  return (
    <div className={cn("divide-y divide-bone/10 border-y border-bone/10", className)}>
      {items.map((item) => (
        <AccordionRow key={item.id} item={item} baseId={baseId} />
      ))}
    </div>
  );
}

function AccordionRow({ item, baseId }: { item: AccordionItem; baseId: string }) {
  const btnId = `${baseId}-${item.id}-btn`;
  const panelId = `${baseId}-${item.id}-panel`;

  return (
    <details className="group">
      <summary
        id={btnId}
        aria-controls={panelId}
        className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-5 outline-none [&::-webkit-details-marker]:hidden"
      >
        <span className="font-display text-xl md:text-2xl">{item.question}</span>
        <span
          aria-hidden="true"
          className="shrink-0 font-display text-2xl text-gold transition-transform duration-300 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div id={panelId} role="region" aria-labelledby={btnId}>
        <AnimatePresence initial={false}>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 pr-8 text-bone/79">{item.answer}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </details>
  );
}
