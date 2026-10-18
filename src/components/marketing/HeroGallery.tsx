"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { Eyebrow } from "../ui/Eyebrow";

/**
 * The hero eyebrow. Short form of the brand, because a tracked-out ALL-CAPS
 * line is set wide and a long legal name would wrap on a Moto G. The shop's
 * real name is not confirmed yet; this replaces it at launch.
 */
const SITE_EYEBROW = "KANPUR STONE HOUSE";

/**
 * The site's signature moment: a full-viewport, scroll-driven hero.
 *
 * Motion model, exactly as specified:
 *   container    h-[560vh] with a sticky viewport-height child pinned inside
 *   spring       stiffness 100 / damping 20 / mass 0.5 on the banner geometry
 *   0    -> 0.15 banner unfurls: 90vw x 80vh -> 100vw x 100vh, radius 48 -> 0
 *   0.15 -> 0.60 3D matrix settles: rotateY -45 -> -8, rotateX 25 -> 4, rotateZ 15 -> 2
 *   0    -> 0.12 brand lockup fades out, blurring upward
 *   0.30 -> 0.80 mid-scroll statement
 *   0.84 -> 1.00 hand-off line
 *
 * Built with framer-motion DOM transforms rather than Three.js. The transform
 * math is a CSS 3D hierarchy, so a WebGL context on the LCP path would add a
 * 300-500KB lazy chunk plus GPU work on a Moto G over 4G for no expressive
 * gain. See ADR 0003.
 */
export function HeroGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const [weak, setWeak] = useState(false);

  // Weak connection falls back to the static hero. `saveData` is the hard case;
  // 2G/3G is the soft one.
  useLayoutEffect(() => {
    const conn = navigator.connection;
    if (conn && (conn.saveData || conn.effectiveType === "2g" || conn.effectiveType === "3g")) {
      setWeak(true);
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const spring = useSpring(scrollYProgress, { stiffness: 100, damping: 20, mass: 0.5 });

  // Banner unfurls over the first 15% of the container.
  const bannerWidth = useTransform(spring, (v) => `${90 + v * 10}vw`);
  const bannerHeight = useTransform(spring, (v) => `${80 + v * 20}vh`);
  const borderRadius = useTransform(spring, (v) => `${48 - v * 48}px`);
  const borderWidth = useTransform(spring, (v) => `${4 - v * 4}px`);

  // The 3D matrix settles between 15% and 60%.
  const rotateY = useTransform(spring, [0.15, 0.6], [-45, -8]);
  const rotateX = useTransform(spring, [0.15, 0.6], [25, 4]);
  const rotateZ = useTransform(spring, [0.15, 0.6], [15, 2]);

  // Four columns parallaxing on Y at different rates.
  const colY = [
    useTransform(spring, [0.15, 1], [-120, -20]),
    useTransform(spring, [0.15, 1], [-260, -60]),
    useTransform(spring, [0.15, 1], [-380, -90]),
    useTransform(spring, [0.15, 1], [-520, -120]),
  ];

  // Overlay fades.
  const lockupOpacity = useTransform(spring, [0, 0.12], [1, 0]);
  const lockupBlur = useTransform(spring, [0, 0.12], [0, 14]);
  const lockupY = useTransform(spring, [0, 0.12], [0, -80]);

  const statementOpacity = useTransform(spring, [0.3, 0.45, 0.68, 0.8], [0, 1, 1, 0]);
  const statementY = useTransform(spring, [0.3, 0.8], [40, -40]);

  const handoffOpacity = useTransform(spring, [0.84, 1], [0, 1]);
  const handoffY = useTransform(spring, [0.84, 1], [30, 0]);

  if (reduceMotion || weak) return <HeroStatic />;

  return (
    <section ref={sectionRef} className="relative h-[560vh] bg-ink">
      <div
        className="sticky top-0 h-[100vh] overflow-hidden"
        style={{ perspective: "1600px", perspectiveOrigin: "50% 42%" }}
      >
        {/* Unfurling rounded banner, centred then sized by the springs */}
        <div className="absolute inset-0 z-[1] flex items-center justify-center">
          <motion.div
            style={
              {
                width: bannerWidth,
                height: bannerHeight,
                borderRadius,
                borderWidth,
                borderStyle: "solid",
                borderColor: "rgba(201,169,106,0.45)",
                backgroundColor: "var(--color-ink-2)",
              } as const
            }
          />
        </div>

        {/* 3D slab matrix */}
        <div
          className="absolute inset-0 z-[2] overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            style={{ rotateY, rotateX, rotateZ, width: "100%", height: "100%" }}
            className="preserve-3d grid h-full w-full grid-cols-4 gap-px"
          >
            {colY.map((y, i) => (
              <motion.div
                key={i}
                style={{
                  y,
                  backgroundImage: `linear-gradient(${155 + i * 14}deg, rgba(201,169,106,${
                    0.32 - i * 0.05
                  }), transparent 58%), linear-gradient(180deg, #0e0e10, #070708)`,
                }}
                className="h-full w-full"
              />
            ))}
          </motion.div>
        </div>

        {/* Ambient shadow masks */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-1/2"
          style={{ boxShadow: "inset 0 100px 150px -50px rgba(0,0,0,1)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-1/2"
          style={{ boxShadow: "inset 0 -100px 150px -50px rgba(0,0,0,1)" }}
          aria-hidden="true"
        />

        {/* Brand lockup */}
        <motion.div
          style={{ opacity: lockupOpacity, filter: lockupBlur, y: lockupY }}
          className="absolute inset-0 z-[4] flex items-center justify-center px-5"
        >
          <div className="text-center">
            <Eyebrow index="01" label={SITE_EYEBROW} className="mb-7 justify-center" />
            <h1 className="font-display text-[15vw] leading-[0.95] md:text-[9rem]">Stone</h1>
            <p className="font-italic-em mt-2 text-2xl text-bone/55 md:text-4xl">
              kept in Kanpur
            </p>
          </div>
        </motion.div>

        {/* Mid-scroll statement */}
        <motion.div
          style={{ opacity: statementOpacity, y: statementY }}
          className="absolute inset-0 z-[4] flex items-center justify-center px-5"
        >
          <div className="max-w-3xl text-center">
            <p className="font-display text-3xl leading-[1.1] md:text-5xl">
              Eight origin states,
              <span className="font-italic-em text-bone/55"> one shop floor. </span>
            </p>
            <p className="mt-5 text-sm text-bone/58 md:text-base">
              Every box is traceable to the quarry it came out of, and every slab is weight-tested
              before it leaves.
            </p>
          </div>
        </motion.div>

        {/* End-scroll hand-off */}
        <motion.div
          style={{ opacity: handoffOpacity, y: handoffY }}
          className="absolute inset-x-0 bottom-[18%] z-[4] px-5 text-center"
        >
          <p className="font-italic-em text-xl text-bone/70 md:text-2xl">
            Keep scrolling. The catalogue is next.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Static hero used on mobile, `prefers-reduced-motion`, and weak connections.
 * Same voice, no scroll rig: the LCP element is then a plain <h1>.
 */
function HeroStatic() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink">
      <div className="glow-gold left-[70%] top-[6%] h-80 w-80" aria-hidden="true" />
      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 pb-16 md:px-10">
        <Eyebrow index="01" label={SITE_EYEBROW} className="mb-8" />
        <h1 className="font-display text-5xl leading-[1.02] md:text-7xl">
          Stone, quarried in the country
          <span className="font-italic-em text-bone/55"> — kept in Kanpur. </span>
        </h1>
        <p className="mt-6 max-w-[60ch] text-bone/62">
          Tiles and natural stone sourced state by state, with every surface traceable to the
          quarry it came out of.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a href="/collections" className="btn btn-primary">
            Explore the collections
          </a>
          <a href="/contact" className="btn btn-secondary">
            Visit the store
          </a>
        </div>
      </div>
    </section>
  );
}

export default HeroGallery;
