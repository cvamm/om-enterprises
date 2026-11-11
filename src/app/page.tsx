import type { Metadata } from "next";
import { HeroGallery } from "@/components/marketing/HeroGallery";
import { MaterialMarquee } from "@/components/marketing/MaterialMarquee";
import { TrustBar } from "@/components/marketing/TrustBar";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { RoomCollectionGrid } from "@/components/marketing/RoomCollectionGrid";
import { ToolTeaser } from "@/components/marketing/ToolTeaser";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: { absolute: siteConfig.name },
  description: siteConfig.description,
};

/**
 * Home. Hero -> marquee -> collections -> tool teasers -> trust.
 * Section numbering is a real sequence on this page:
 *   01 hero (inside HeroGallery), 02 collections, 03 tools, 05 trust.
 * 04 is the portfolio section, which lives on /portfolio, so it is not
 * numbered here.
 */
export default function HomePage() {
  return (
    <main id="main">
      <HeroGallery />
      <MaterialMarquee />
      <RoomCollectionGrid />
      <ToolTeaser />
      <TrustBar />

      <section className="border-t border-bone/10 bg-ink-2 py-24 md:py-32">
        <Container className="text-center">
          <Eyebrow label="START HERE" className="mb-7 justify-center" />
          <h2 className="font-display text-5xl leading-[1.02] text-bone md:text-7xl">
            Tell us the room.
            <span className="font-italic-em text-bone/77"> We do the rest. </span>
          </h2>
          <p className="mx-auto mt-6 max-w-[58ch] text-bone/78">
            Name the room, give us a length and a width, and we come back with a box count and a
            number you can act on.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href="/calculator" variant="primary">
              Open the calculator
            </Button>
            <Button href="/contact" variant="secondary">
              Talk to the shop
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
