import type { RoomUse } from "@/types";

/**
 * Room-use labels, in display order.
 *
 * The order here is a presentation decision: the most-fitted rooms in a
 * residential job come first, commercial last. It is not alphabetical and it
 * is not a "most popular" claim, which would need real data.
 */
export const roomLabels: Array<{ value: RoomUse; label: string }> = [
  { value: "bathroom", label: "Bathroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "living-room", label: "Living room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "flooring", label: "General flooring" },
  { value: "balcony", label: "Balcony" },
  { value: "exterior", label: "Exterior" },
  { value: "pool", label: "Pool" },
  { value: "commercial", label: "Commercial" },
  { value: "wall-cladding", label: "Wall cladding" },
];

const LABEL_BY_VALUE = new Map(roomLabels.map((r) => [r.value, r.label]));

export function roomLabel(value: string): string {
  return LABEL_BY_VALUE.get(value as RoomUse) ?? value.replace(/-/g, " ");
}