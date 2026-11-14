import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { Pagination } from "@/components/catalogue/Pagination";
import { SortDropdown } from "@/components/catalogue/SortDropdown";
import { getProducts } from "@/lib/queries/products";
import { roomLabel } from "@/lib/utils/room-labels";

export const revalidate = 3600;

export function generateStaticParams() {
  return [
    { room: "bathroom" },
    { room: "kitchen" },
    { room: "living-room" },
    { room: "bedroom" },
    { room: "flooring" },
    { room: "wall-cladding" },
    { room: "exterior" },
    { room: "commercial" },
    { room: "pool" },
    { room: "balcony" },
  ];
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

const ROOMS = new Set([
  "bathroom", "kitchen", "living-room", "bedroom", "flooring",
  "wall-cladding", "exterior", "commercial", "pool", "balcony",
]);

export default async function RoomPage({
  params,
}: {
  params: Promise<{ room: string }>;
}) {
  const { room } = await params;
  if (!ROOMS.has(room)) {
    notFound();
  }

  const filters = { room };
  const page = await getProducts(filters);

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

      <section className="bg-ink-2 py-20 md:py-28">
        <Container>
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="text-[11px] uppercase tracking-[0.24em] text-bone/73">
              {page.total} {page.total === 1 ? "product" : "products"}
            </p>
            <SortDropdown />
          </div>

          <ProductGrid
            products={page.products}
            emptyAction={{
              href: `/collections/${room}`,
              label: "Browse all products",
            }}
          />

          {page.pageCount > 1 && (
            <div className="mt-16">
              <Pagination page={page.page} pageCount={page.pageCount} />
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
