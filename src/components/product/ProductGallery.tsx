import type { Product } from "@/types";

/**
 * Product gallery.
 *
 * Server-rendered. No 3D viewer on this route in Phase 1 — §9 forbids a
 * Three.js scene anywhere but the home hero, and the performance cost is not
 * worth it for a product whose photographs, once real, do the job.
 *
 * With no photos yet this renders the same material-derived placeholder the
 * card uses, plus a note that says so plainly. A "gallery" of one identical
 * frame repeated four times would be a lie.
 */
export function ProductGallery({ product }: { product: Product }) {
  const photos = product.photoUrls;

  if (photos.length === 0) {
    return (
      <div
        className="relative flex h-[330px] items-center justify-center overflow-hidden rounded-2xl
                   border border-white/10 bg-[#0b0b0c] md:h-[420px]"
        data-testid="product-gallery-empty"
      >
        <div className="max-w-md px-7 text-center">
          <p className="text-[10px] uppercase tracking-[0.45em] text-[#c9a96a]">
            Photography coming
          </p>
          <p className="mt-5 text-[14px] leading-relaxed text-bone/55">
            We have not photographed this tile yet. The specification below is
            accurate — the surface is the part we want you to see before you
            commit to a room.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 md:gap-8" data-testid="product-gallery">
      {photos.map((photo, index) => (
        <div
          key={photo}
          className="relative h-[330px] overflow-hidden rounded-2xl border border-white/10
                     bg-[#0b0b0c] md:h-[380px]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt={`${product.nameEn}, view ${index + 1}`}
            width={1200}
            height={800}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}