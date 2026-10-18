import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Page not found",
};

/**
 * 404. Says what happened and offers the two routes that cover most intent,
 * rather than apologising. A missing page is a dead end only if we leave it
 * as one.
 */
export default function NotFound() {
  return (
    <main id="main" className="flex min-h-[70vh] items-center">
      <Container className="py-32 text-center md:py-40">
        <Eyebrow label="NOT FOUND" className="mb-7 justify-center" />
        <h1 className="font-display text-5xl leading-[1.02] text-bone md:text-7xl">
          This page has been
          <span className="font-italic-em text-bone/55"> cleared from the floor. </span>
        </h1>
        <p className="mx-auto mt-6 max-w-[52ch] text-bone/58">
          The link may be old, or the tile may have sold out and been retired from the catalogue.
          The catalogue and the calculator are both still here.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href="/tiles" variant="primary">
            Browse all tiles
          </Button>
          <Button href="/calculator" variant="secondary">
            Open the calculator
          </Button>
        </div>
      </Container>
    </main>
  );
}