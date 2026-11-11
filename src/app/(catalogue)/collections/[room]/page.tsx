import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CatalogueResults } from "@/components/catalogue/CatalogueResults";
import { roomLabels, roomLabel } from "@/lib/utils/room-labels";

export function generateStaticParams() {
  return roomLabels.map(({ value }) => ({ room: value }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ room: string }>;
}): Promise<Metadata> {
  const { room } = await params;
  const label = roomLabel(room);
  return {
    title: `${label} tiles`,
    description: `${label} tiles and stone, priced per box. Browse and filter by material, finish and size.`,
    alternates: { canonical: `/collections/${room}` },
  };
}

/**
 * Room-use category — static demo.
 *
 * The room is fixed by the segment and prerendered via generateStaticParams.
 * The grid below is a client island that filters the sample set in the browser
 * from the URL query string, so a filtered room view is still shareable.
 */
export default async function RoomPage({
  params,
}: {
  params: Promise<{ room: string }>;
}) {
  const { room } = await params;
  if (!roomLabels.some((r) => r.value === room)) {
    notFound();
  }

  return (
    <>
      <section className="border-b border-bone/10 bg-ink py-20 md:py-28">
        <Container>
          <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-[0.24em] text-bone/72">
            <Link href="/collections" className="transition-colors duration-300 hover:text-bone">
              Rooms
            </Link>
            <span className="mx-2 text-bone/25" aria-hidden="true">/</span>
            <span className="text-bone/70">{roomLabel(room)}</span>
          </nav>
          <div className="mt-10 max-w-3xl">
            <Eyebrow label={roomLabel(room).toUpperCase()} />
            <h1 className="mt-8 font-display text-5xl leading-[1.02] text-bone md:text-7xl">
              {roomLabel(room)} tiles,{" "}
              <span className="font-light italic text-bone/77">
                priced the way a shop quotes
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-bone/79">
              Everything we stock for this room, filtered live. Pick a finish
              or a size and the grid updates without leaving the page.
            </p>
          </div>
        </Container>
      </section>

      <Suspense
        fallback={
          <section className="bg-ink-2 py-20 md:py-28">
            <Container>
              <div className="h-96 w-full rounded-2xl bg-white/5" />
            </Container>
          </section>
        }
      >
        <CatalogueResults fixedRoom={room} />
      </Suspense>
    </>
  );
}