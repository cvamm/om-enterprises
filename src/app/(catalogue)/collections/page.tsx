import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { roomLabels } from "@/lib/utils/room-labels";

export const metadata: Metadata = {
  title: "Browse by room",
  description:
    "Choose the room you are fitting and start from the tiles that actually suit it — bathroom, kitchen, living room, balcony, exterior, commercial.",
  alternates: { canonical: "/collections" },
};

const ROOM_DESCRIPTIONS: Record<string, string> = {
  bathroom: "Wet areas need slip resistance, grout that does not trap moisture, and a size that survives a small room.",
  kitchen: "A floor that takes a dropped pan of water and still reads clean. Matte and anti-skid do most of the work here.",
  "living-room": "The one people walk across barefoot. Format and finish matter more here than anywhere else in the house.",
  bedroom: "Quiet, warm, soft underfoot. Smaller formats and honed or matte finishes usually win.",
  flooring: "Any room where the floor is the room. Looked at by square footage, not by fixture.",
  "wall-cladding": "Vertical surfaces. Mosaic and large-format planks both work; the grout line is the real decision.",
  exterior: "Kanpur gets hot and the monsoon hits hard. Anti-skid and a finish that does not fade in full sun.",
  commercial: "A footprint that gets heavy traffic all day and still has to look presentable on a Tuesday morning.",
  pool: "Water-tight, anti-skid even wet, and a finish that does not discolor on the tile face.",
  balcony: "Small, exposed, and usually fitted on a tight deadline. A large format reads more premium here.",
};

/**
 * Room-use landing.
 *
 * Each card carries a real statement about what the room actually demands of
 * a tile. This page exists to narrow intent before a customer reaches the
 * catalogue's filters — picking a room here and landing on the filtered view
 * is faster than filtering the full catalogue from scratch.
 */
export default function CollectionsPage() {
  return (
    <>
      <section className="border-b border-bone/10 bg-ink py-24 md:py-32">
        <Container>
          <div className="max-w-3xl">
            <Eyebrow label="ROOMS" />
            <h1 className="mt-8 font-display text-5xl leading-[1.02] text-bone md:text-7xl">
              Start with the room
              <span className="block font-light italic text-bone/77">
                not the box
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-bone/79">
              Pick what you are fitting and we will narrow the catalogue to
              what actually suits it. Each room has its own demands — a
              bathroom and a commercial lobby need the opposite ends of our
              catalogue, and treating them as one list is how a room ends up
              fitted with the wrong tile.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-ink-2 py-24 md:py-32">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 md:gap-8">
            {roomLabels.map((room) => (
              <Link
                key={room.value}
                href={`/collections/${room.value}`}
                className="group rounded-2xl border border-bone/10 bg-ink p-7
                           transition-colors duration-300 hover:border-bone/30 md:p-9"
              >
                <h2 className="font-display text-3xl leading-tight text-bone md:text-4xl">
                  {room.label}
                </h2>
                <p className="mt-4 max-w-[44ch] text-[14px] leading-relaxed text-bone/77">
                  {ROOM_DESCRIPTIONS[room.value] ??
                    "Tiles suited to this space. Browse the full list."}
                </p>
                <p className="mt-6 text-[10px] uppercase tracking-[0.45em] text-gold">
                  Browse
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}