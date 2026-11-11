import type { MaterialType, Product } from "@/types";

/**
 * Deterministic material-derived placeholder for a product with no photo.
 *
 * The catalogue ships empty (ADR 0004), so every card needs something to show.
 * Stock photography is banned by §2's data-hygiene rule, and an empty frame
 * makes a grid look broken. So this derives a surface from the product's own
 * attributes — material, finish, dimensions — and draws it with CSS.
 *
 * Two properties matter:
 *
 *   1. Deterministic. The same slug always produces the same surface, so a
 *      grid looks like a catalogue rather than noise between renders.
 *   2. Visibly a placeholder. The sample marker sits in the corner. A
 *      customer who somehow reaches this in production sees immediately that
 *      it is not a photograph of their tile.
 */
export function ProductImagePlaceholder({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const seed = hash(product.slug);

  // Each material gets a hue, a vein scale and a grain — enough variance that
  // a grid of them reads as different surfaces.
  // Typed as Record<MaterialType, Palette> so the lookup cannot be undefined
  // at compile time — a new material type fails the build until it gets a
  // palette here, rather than rendering `undefined` in a CSS gradient.
  const palette = PALETTES[product.materialType];
  const angle = (seed % 360) + product.finish.length * 12;
  const vein = 0.25 + ((seed >> 3) % 40) / 100;

  return (
    <div
      className={`absolute inset-0 ${className ?? ""}`}
      style={{
        background: `
          linear-gradient(${angle}deg,
            hsl(${palette.hue} ${palette.sat}% ${palette.light - 8}%),
            hsl(${palette.hue} ${palette.sat}% ${palette.light + 6}%),
            hsl(${(palette.hue + 18) % 360} ${palette.sat}% ${palette.light - 4}%)
          )`,
      }}
      data-testid="product-image-placeholder"
      aria-hidden="true"
    >
      {/* Veining. Two offset repeating gradients read as stone without an
          image request, which matters on a 4G connection. */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            repeating-linear-gradient(
              ${angle + 40}deg,
              rgba(255,255,255,${vein * 0.18}) 0px,
              rgba(255,255,255,0) ${18 + (seed % 14)}px,
              rgba(0,0,0,${vein * 0.12}) ${34 + (seed % 20)}px,
              rgba(0,0,0,0) ${58 + (seed % 26)}px
            )`,
        }}
      />

      {/* Gloss: a diagonal sheen, so a glossy tile reads differently from a
          matte one before any text is read. */}
      {product.finish === "glossy" && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, transparent 28%, rgba(255,255,255,0.14) 42%, transparent 56%)",
          }}
        />
      )}
      {product.finish === "matte" && (
        <div className="absolute inset-0 bg-black/10" />
      )}
      {product.finish === "textured" && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(0,0,0,0.3) 0 2px, transparent 2px 5px)",
          }}
        />
      )}

      {/* Format hint. A 800×1600 plank should look long; a 300×300 square
          should not. This is the one thing a customer checks first. */}
      <div className="absolute inset-0 flex items-end justify-center p-6">
        <span
          className="rounded-full border border-bone/20 bg-ink/80 px-3 py-1
                     font-sans text-[10px] uppercase tracking-[0.24em] text-bone/70
                     backdrop-blur-sm"
        >
          {product.dimensionsMm[0]}×{product.dimensionsMm[1]}
        </span>
      </div>

      <span
        className="absolute right-4 top-4 rounded-full border border-gold/40
                   bg-ink/85 px-2.5 py-1 font-sans text-[9px] uppercase
                   tracking-[0.2em] text-gold backdrop-blur-sm"
      >
        no photo yet
      </span>
    </div>
  );
}

type Palette = { hue: number; sat: string; light: number };

/**
 * Hues chosen to stay inside the dark-gold world of §2. A placeholder that
 * rendered a pale cream tile would contradict the palette on every card.
 */
const PALETTES: Record<MaterialType, Palette> = {
  ceramic: { hue: 32, sat: "14%", light: 62 },
  vitrified: { hue: 38, sat: "20%", light: 58 },
  porcelain: { hue: 210, sat: "10%", light: 56 },
  "natural-stone": { hue: 24, sat: "24%", light: 54 },
  "engineered-marble": { hue: 44, sat: "12%", light: 72 },
  quartz: { hue: 36, sat: "10%", light: 68 },
  mosaic: { hue: 186, sat: "16%", light: 54 },
  "wood-plank": { hue: 26, sat: "30%", light: 42 },
  terrazzo: { hue: 30, sat: "16%", light: 60 },
};

/** FNV-1a. Small, stable across runs, no crypto dependency. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}