import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata = {
  title: "Tile not found",
};

/**
 * Scoped 404 for the catalogue group.
 *
 * The root not-found.tsx renders correctly but does not set the status code
 * when `notFound()` is called from inside a route group — the response comes
 * back 200 with the 404 body. That matters: Google indexes a 200 "Tile not
 * found" page as a real product URL, and a stale product link stays in the
 * index forever instead of being dropped.
 *
 * A not-found.tsx inside the group fixes the status. Kept separate from the
 * root one because the copy differs — a missing tile is a catalogue problem
 * with a specific next step, not a general dead link.
 */
export default function TileNotFound() {
  return (
    <main id="main" className="flex min-h-[70vh] items-center">
      <Container className="py-32 text-center md:py-40">
        <Eyebrow label="NOT IN THE CATALOGUE" className="mb-7 justify-center" />

        <h1 className="font-display text-5xl leading-[1.02] text-bone md:text-7xl">
          That tile is not
          <span className="font-italic-em text-bone/55"> in our catalogue. </span>
        </h1>

        <p className="mx-auto mt-6 max-w-[52ch] text-bone/58">
          It may have sold out and been retired, or the link may be out of date.
          If you saw this tile somewhere and want the same thing, tell us what
          it looked like and we will find the closest match we can source.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href="/tiles" variant="primary">
            Browse all tiles
          </Button>
          <Button href="/contact" variant="secondary">
            Ask us to source it
          </Button>
        </div>
      </Container>
    </main>
  );
}