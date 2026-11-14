"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { Eyebrow } from "../ui/Eyebrow";
import { HERO_TILES } from "@/lib/utils/hero-tiles";
import showroomUrl from "@/assets/showroom.jpg";

const SHOWROOM_IMAGE = `linear-gradient(rgba(20,18,15,0.35) 0%, rgba(20,18,15,0.72) 100%), url(${showroomUrl.src})`;

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

  // Weak connection falls back to the static hero. The scroll animation
  // downloads nothing (gradient tiles + transforms), so 3G is fine; only
  // Save-Data and 2G get the static fallback. `saveData` is the hard case.
  useLayoutEffect(() => {
    const conn = navigator.connection;
    if (conn && (conn.saveData || conn.effectiveType === "2g")) {
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

  // End of the scroll: the tile wall melts away and the showroom photo behind
  // it takes over, so the visitor lands on "the shop" instead of a dead stop.
  const matrixOpacity = useTransform(spring, [0.8, 1], [1, 0]);
  const showroomOpacity = useTransform(spring, [0.72, 1], [0, 1]);
  const showroomScale = useTransform(spring, [0.72, 1], [1.12, 1]);

  if (reduceMotion || weak) return <HeroStatic />;

  // The wall shows the shop's own catalogue tiles (Endless marble + Livenza
  // wood), not painted swatches — the material moment should be their stock.
  const heroTiles = HERO_TILES;

  return (
    <section ref={sectionRef} className="relative h-[560vh] bg-ink">
      <div
        className="sticky top-0 h-[100svh] overflow-hidden"
        style={{ perspective: "1600px", perspectiveOrigin: "50% 42%" }}
      >
        {/* Showroom photo. Reveals as the tile wall melts away at the end of
            the scroll — a real Indian slab yard, dimmed with a wash. */}
        <motion.div
          style={{
            opacity: showroomOpacity,
            scale: showroomScale,
            backgroundImage: SHOWROOM_IMAGE,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="absolute inset-0 z-[2] will-change-[opacity,transform]"
          aria-hidden="true"
        />
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

        {/* Dense tile matrix — 40 colorful tiles, grouped into 4 parallax
            columns so the shelf feels layered, not flat. Each column drifts
            on Y at a different rate over the scroll spring, and the whole wall
            melts away at the end of the scroll to reveal the showroom. */}
        <div
          className="absolute inset-0 z-[3] overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            style={{
              opacity: matrixOpacity,
              rotateY,
              rotateX,
              rotateZ,
              width: "100%",
              height: "100%",
            }}
            className="preserve-3d grid h-full w-full grid-cols-4 gap-[3px] bg-bone/[0.06] p-[3px] md:gap-1 md:p-1"
          >
            {colY.map((y, col) => (
              <motion.div
                key={col}
                style={{ y }}
                className="grid h-full w-full grid-cols-2 grid-rows-4 gap-[3px] md:gap-1"
              >
                {Array.from({ length: 8 }, (_, row) => {
                  const tileIndex = col * 8 + row;
                  const tile = heroTiles[tileIndex];
                  if (tile === undefined) return null;
                  return (
                    <div
                      key={row}
                      className="h-full w-full overflow-hidden rounded-[3px]"
                      style={{
                        backgroundImage: `url(${tile})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                      aria-hidden="true"
                    />
                  );
                })}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Ambient shadow masks */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-1/2"
          style={{ boxShadow: "inset 0 100px 150px -50px var(--color-ink)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-1/2"
          style={{ boxShadow: "inset 0 -100px 150px -50px var(--color-ink)" }}
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
            <p className="font-italic-em mt-2 text-2xl text-bone/77 md:text-4xl">
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
              <span className="font-italic-em text-bone/77"> one shop floor. </span>
            </p>
            <p className="mt-5 text-sm text-bone/78 md:text-base">
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
 *
 * It still carries the signature tile wall, dimmed and masked, so the brand's
 * material moment survives in every phone case — including Save-Data/weak
 * links and reduce-motion, which used to fall back to bare text. The wall uses
 * the same colorful CSS-gradient tiles as the scroll hero, so it adds no
 * network cost, and the global reduce-motion block neutralises any of its motion.
 */
function HeroStatic() {
  // Same real catalogue tiles as the scroll hero, cycled to fill the wall.
  const tileCount = HERO_TILES.length;
  const tiles = Array.from({ length: 24 }, (_, i) =>
    tileCount === 0 ? "" : HERO_TILES[i % tileCount] ?? "",
  );
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink">
      <div className="tile-wall" aria-hidden="true">
        {tiles.map((src, i) =>
          src === "" ? null : (
          <div
            key={i}
            className="tile-wall__cell"
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>
      <div className="glow-gold left-[70%] top-[6%] h-80 w-80" aria-hidden="true" />
      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 pb-16 md:px-10">
        <Eyebrow index="01" label={SITE_EYEBROW} className="mb-8" />
        <h1 className="font-display text-5xl leading-[1.02] md:text-7xl">
          Stone, quarried in the country
          <span className="font-italic-em text-bone/77"> — kept in Kanpur. </span>
        </h1>
        <p className="mt-6 max-w-[60ch] text-bone/79">
          Tiles and natural stone sourced state by state, with every surface traceable to the
          quarry it came out of.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/collections" className="btn btn-primary">
            Explore the collections
          </Link>
          <Link href="/contact" className="btn btn-secondary">
            Visit the store
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HeroGallery;
