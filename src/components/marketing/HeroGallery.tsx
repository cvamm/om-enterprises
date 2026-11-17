"use client";

import Link from "next/link";
import { Eyebrow } from "../ui/Eyebrow";
import { HERO_TILES } from "@/lib/utils/hero-tiles";

const SITE_EYEBROW = "KANPUR STONE HOUSE";

export function HeroGallery() {
  return <HeroStatic />;
}

/**
 * Static home hero: the signature tile wall dimmed behind a single-screen
 * layout — eyebrow, headline, sub, and the two primary CTAs. No scroll rig,
 * no 3D parallax; the LCP element is a plain <h1>.
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
