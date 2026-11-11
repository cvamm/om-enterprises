"use client";

import { useState, useMemo } from "react";
import { buildTileLabWhatsAppLink } from "@/lib/utils/whatsapp";
import type { Product } from "@/types";

/* ────────────────────────────────────────────────────────────────────────────
   Tile Lab — Pattern Configurator
   §8 feature 2. A 2D CSS-grid mock-up that updates live as the customer
   adjusts surface, bond, grout shade, grout width, and gloss.
   ──────────────────────────────────────────────────────────────────────────── */

type Bond = "stacked" | "brick" | "diagonal";
type Surface = "wall" | "floor" | "exterior";

interface TileLabProps {
  products: Product[];
}

const BOND_LABELS: Record<Bond, string> = {
  stacked: "Stacked",
  brick: "Brick",
  diagonal: "Diagonal",
};

const SURFACE_LABELS: Record<Surface, string> = {
  wall: "Wall",
  floor: "Floor",
  exterior: "Exterior",
};

const GROUT_SHADES: { name: string; value: string }[] = [
  { name: "White", value: "#e9e4dc" },
  { name: "Grey", value: "#8a8580" },
  { name: "Dark", value: "#3a3836" },
  { name: "Gold", value: "#c9a96a" },
];

/** Deterministic pseudo-random offset for each tile's image crop. */
function tileOffset(row: number, col: number): string {
  const seed = (row * 7 + col * 3 + 1) % 10;
  const x = 20 + (seed * 8) % 60;
  const y = 20 + ((seed * 5 + 2) % 60);
  return `${x}% ${y}%`;
}

/** Build the grid style for the preview based on current settings. */
function gridStyle(
  bond: Bond,
  groutWidthMm: number,
): { container: React.CSSProperties; tile: React.CSSProperties } {
  const gapPx = Math.max(1, Math.round(groutWidthMm * 0.6));
  const cols = bond === "diagonal" ? 3 : 4;

  const container: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: `${gapPx}px`,
  };
  const tile: React.CSSProperties = {
    aspectRatio: "1 / 1",
  };
  return { container, tile };
}

/**
 * The Tile Lab configurator.
 *
 * All state is local — no network calls while the user drags a slider.
 * The WhatsApp hand-off builds the full specification as text, so the
 * shop receives a clear order even if the customer cannot describe
 * the layout in words.
 */
export function TileLab({ products }: TileLabProps) {
  const [productId, setProductId] = useState<string>("");
  const [surface, setSurface] = useState<Surface>("floor");
  const [bond, setBond] = useState<Bond>("stacked");
  const [groutShade, setGroutShade] = useState(GROUT_SHADES[0]!.name);
  const [groutWidthMm, setGroutWidthMm] = useState(2);
  const [gloss, setGloss] = useState(50);

  const product = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [productId, products],
  );

  const previewTile = product ?? products[0] ?? null;
  const imageUrl =
    previewTile?.photoUrls[0] ?? null;

  const saturate = 0.6 + (gloss / 100) * 0.8;
  const brightness = 0.9 + (gloss / 100) * 0.3;
  const tileFilter = `saturate(${saturate.toFixed(2)}) brightness(${brightness.toFixed(2)})`;

  const groutColor =
    GROUT_SHADES.find((g) => g.name === groutShade)?.value ?? GROUT_SHADES[0]!.value;

  const previewStyle = useMemo(
    () => gridStyle(bond, groutWidthMm),
    [bond, groutWidthMm],
  );

  const whatsappLink =
    previewTile !== null
      ? buildTileLabWhatsAppLink({
          surfaceName: SURFACE_LABELS[surface],
          format: previewTile.nameEn,
          bond: BOND_LABELS[bond],
          groutShade,
          groutWidthMm,
          glossLevel: gloss,
        })
      : null;

  const totalTiles = bond === "diagonal" ? 12 : 12;

  return (
    <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-14">
      {/* Controls */}
      <div className="space-y-8">
        {/* Surface */}
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.45em] text-gold">
            SURFACE
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {(Object.keys(SURFACE_LABELS) as Surface[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSurface(s)}
                className={`rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.24em] transition-colors duration-300 ${
                  surface === s
                    ? "bg-[#c9a96a] text-black"
                    : "border border-gold/40 text-gold hover:bg-gold/10"
                }`}
                aria-pressed={surface === s}
              >
                {SURFACE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Product */}
        {products.length > 0 && (
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.45em] text-gold">
              SURFACE TONE
            </h3>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="mt-4 w-full rounded-lg border border-bone/12 bg-transparent px-4 py-3.5
                         text-[14px] text-bone appearance-none focus:border-gold/60 focus:outline-none"
              aria-label="Select a tile or stone"
            >
              <option value="" className="bg-ink-2">
                No product selected (neutral preview)
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id} className="bg-ink-2">
                  {p.nameEn} — {p.finish}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Bond */}
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.45em] text-gold">
            BOND PATTERN
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {(Object.keys(BOND_LABELS) as Bond[]).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBond(b)}
                className={`rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.24em] transition-colors duration-300 ${
                  bond === b
                    ? "bg-[#c9a96a] text-black"
                    : "border border-gold/40 text-gold hover:bg-gold/10"
                }`}
                aria-pressed={bond === b}
              >
                {BOND_LABELS[b]}
              </button>
            ))}
          </div>
        </div>

        {/* Grout shade */}
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.45em] text-gold">
            GROUT SHADE
          </h3>
          <div className="mt-4 flex gap-3">
            {GROUT_SHADES.map((shade) => (
              <button
                key={shade.name}
                type="button"
                onClick={() => setGroutShade(shade.name)}
                className={`relative h-8 w-8 rounded-full border-2 transition-transform duration-300 hover:scale-110 ${
                  groutShade === shade.name ? "border-bone" : "border-bone/15"
                }`}
                style={{ backgroundColor: shade.value }}
                aria-label={`Grout: ${shade.name}`}
                aria-pressed={groutShade === shade.name}
              >
                {groutShade === shade.name && (
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-medium text-black/70">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-bone/72">{groutShade}</p>
        </div>

        {/* Grout width */}
        <div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.45em] text-gold">
              GROUT WIDTH
            </h3>
            <span className="text-[13px] tabular-nums text-bone/77">
              {groutWidthMm} mm
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={groutWidthMm}
            onChange={(e) => setGroutWidthMm(Number(e.target.value))}
            className="mt-4"
            aria-label="Grout line width in millimetres"
          />
          <div className="mt-2 flex justify-between text-[10px] text-bone/68">
            <span>1 mm</span>
            <span>10 mm</span>
          </div>
        </div>

        {/* Gloss */}
        <div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.45em] text-gold">
              GLOSS
            </h3>
            <span className="text-[13px] tabular-nums text-bone/77">{gloss}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={gloss}
            onChange={(e) => setGloss(Number(e.target.value))}
            className="mt-4"
            aria-label="Gloss level percentage"
          />
          <div className="mt-2 flex justify-between text-[10px] text-bone/68">
            <span>Matte</span>
            <span>High gloss</span>
          </div>
        </div>

        {/* WhatsApp hand-off */}
        {whatsappLink !== null && (
          <div>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-full bg-[#c9a96a] px-6 py-4
                         text-[11px] uppercase tracking-[0.24em] text-black transition-colors
                         duration-300 hover:bg-ink"
            >
              Send layout to WhatsApp
            </a>
            <p className="mt-3 text-[12px] leading-relaxed text-bone/72">
              The message carries the full specification — surface, bond,
              grout, gloss — so the shop can confirm the layout without
              a second call.
            </p>
          </div>
        )}
      </div>

      {/* Preview */}
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.45em] text-gold">
          LIVE PREVIEW
        </h3>
        <p className="mt-2 text-[13px] text-bone/73">
          {totalTiles} tiles · {SURFACE_LABELS[surface]} · {BOND_LABELS[bond]} ·{" "}
          {groutWidthMm} mm grout · {gloss}% gloss
        </p>

        <div
          data-testid="tile-preview"
          className="mt-6 overflow-hidden rounded-2xl border border-bone/10 p-3 md:p-5"
          style={{ backgroundColor: groutColor, aspectRatio: "1 / 1" }}
        >
          <div className="h-full w-full" style={previewStyle.container}>
            {Array.from({ length: totalTiles }, (_, i) => {
              const row = Math.floor(i / (bond === "diagonal" ? 3 : 4));
              const col = i % (bond === "diagonal" ? 3 : 4);
              return (
                <div
                  key={i}
                  className="relative h-full w-full overflow-hidden rounded-lg"
                  style={{
                    ...previewStyle.tile,
                    filter: tileFilter,
                  }}
                >
                  {imageUrl !== null ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: tileOffset(row, col),
                        transform:
                          bond === "diagonal"
                            ? "rotate(45deg) scale(1.414)"
                            : bond === "brick" && row % 2 === 1
                              ? "translateX(25%)"
                              : undefined,
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center bg-ink-2 p-1 text-[10px] text-bone/25"
                    >
                      {previewTile?.nameEn ?? "No image"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-4 text-[12px] leading-relaxed text-bone/72">
          The preview is a scale reference, not a measurement. The grout
          width shown here is a proportional approximation of{" "}
          {groutWidthMm} mm at full size. Actual tile and grout dimensions
          are confirmed by the shop before delivery.
        </p>
      </div>
    </div>
  );
}