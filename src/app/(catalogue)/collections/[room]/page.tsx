import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { Pagination } from "@/components/catalogue/Pagination";
import { SortDropdown } from "@/components/catalogue/SortDropdown";
import { getProducts } from "@/lib/queries/products";
import { toFilters, buildQuery, readSearchParams } from "@/lib/utils/filters";
import { roomLabels, roomLabel } from "@/lib/utils/room-labels";

export const revalidate = 3600;

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
 * Room-use category.
 *
 * Server-rendered grid, client-side filters via the URL. The room is fixed by
 * the segment; the remaining facets (material, finish, size, origin) read from
 * the query string, so a filtered room view is shareable.
 */
export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ room: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { room } = await params;
  if (!roomLabels.some((r) => r.value === room)) {
    notFound();
  }

  const raw = await readSearchParams(searchParams);
  const filters = { ...toFilters(raw), room };
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
              href: buildQuery({}, { room }),
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