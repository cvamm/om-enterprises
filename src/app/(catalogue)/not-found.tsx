/**
 * A scoped not-found page for the catalogue route group.
 *
 * When `notFound()` is called from a page inside `(catalogue)`, Next
 * renders the nearest `not-found.tsx` in the route tree — this one —
 * giving a 404 body specific to missing tiles rather than the generic
 * site-wide one.
 *
 * See the ADR on HTTP status codes for missing resources: in the
 * versions of Next tested during Phase 1, `notFound()` renders the
 * correct body but leaves the status code at 200, so search engines
 * keep indexing dead URLs. The body is right; the status code is a
 * known limitation documented, not silently accepted.
 */
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata = {
  title: "Tile not found",
};

export default function TileNotFound() {
  return (
    <main id="main" className="flex min-h-[70vh] items-center">
      <Container className="py-32 text-center md:py-40">
        <Eyebrow label="NOT IN THE CATALOGUE" className="mb-7 justify-center" />

        <h1 className="font-display text-5xl leading-[1.02] text-bone md:text-7xl">
          That tile is not
          <span className="font-italic-em text-bone/77"> in our catalogue. </span>
        </h1>

        <p className="mx-auto mt-6 max-w-[52ch] text-bone/78">
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
