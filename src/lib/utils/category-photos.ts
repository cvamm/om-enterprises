import marbleUrl from "@/assets/categories/marble-1.jpg";
import marbleAltUrl from "@/assets/categories/marble-2.jpg";
import graniteUrl from "@/assets/categories/granite-1.jpg";
import graniteAltUrl from "@/assets/categories/granite-2.jpg";
import graniteAlt2Url from "@/assets/categories/granite-3.jpg";
import toiletUrl from "@/assets/categories/toilet-1.jpg";
import toiletAltUrl from "@/assets/categories/toilet-2.jpg";
import mirrorUrl from "@/assets/categories/mirror-1.jpg";
import mirrorAltUrl from "@/assets/categories/mirror-2.jpg";
import mirrorAlt2Url from "@/assets/categories/mirror-3.jpg";
import basinUrl from "@/assets/categories/basin-1.jpg";
import basinAltUrl from "@/assets/categories/basin-2.jpg";
import basinAlt2Url from "@/assets/categories/basin-3.jpg";
import chemicalUrl from "@/assets/categories/chemical-1.jpg";
import chemicalAltUrl from "@/assets/categories/chemical-2.jpg";
import chemicalAlt2Url from "@/assets/categories/chemical-3.jpg";
import finishingUrl from "@/assets/categories/finishing-1.jpg";
import finishingAltUrl from "@/assets/categories/finishing-2.jpg";
import finishingAlt2Url from "@/assets/categories/finishing-3.jpg";
import finishingAlt3Url from "@/assets/categories/finishing-4.jpg";
import houseUrl from "@/assets/categories/house-1.jpg";
import houseAltUrl from "@/assets/categories/house-2.jpg";
import houseAlt2Url from "@/assets/categories/house-3.jpg";
import houseAlt3Url from "@/assets/categories/house-4.jpg";

/**
 * Real product photography for the store's non-tile lines, licensed under the
 * Pexels free licence (no attribution required). Imported as Next.js assets so
 * each build path is already prefixed with the demo `basePath` — what lets
 * these grids render on the GitHub Pages subpath with no hand-prefixed URL.
 *
 * These are stand-in textures and fixtures, not the shop's own stock. Alt text
 * describes only what the photo shows. The `pexels` field is the exact CDN
 * URL the file was downloaded from, kept so the licensing is auditable
 * before launch. Prices are added later, like the tiles.
 */
export type CategoryPhoto = {
  /** Basepath-safe image URL, safe for both `next/image` and CSS. */
  src: string;
  /** Short, truthful alt description of the photo. */
  alt: string;
  /** Pexels source, kept so the licensing is auditable before launch. */
  pexels: string;
};

export type CategoryKey =
  | "marbles"
  | "granite"
  | "western-toilets"
  | "chemicals"
  | "mirrors"
  | "washing-basins"
  | "house-finishing";

export type Category = {
  key: CategoryKey;
  /** Route slug, used for both the href and the canonical. */
  slug: string;
  /** Heading label, e.g. "Marbles". */
  name: string;
  /** The line it belongs to, e.g. "STONE". */
  eyebrow: string;
  /** Intro shown in the hero band. */
  intro: string;
  /** What this line actually is and how the shop supplies it. */
  body: string;
  photos: CategoryPhoto[];
};

export const CATEGORIES: Record<CategoryKey, Category> = {
  marbles: {
    key: "marbles",
    slug: "marbles",
    name: "Marbles",
    eyebrow: "STONE",
    intro:
      "Slab and small-format marble for floors, stairs, and the surfaces a room is named for.",
    body:
      "Marble is what people reach for when a room is meant to be remembered — a front desk, a stair, a kitchen top that shows the whole house. We carry white and beige slabs for cutting to size, plus small-format marble tile for floors where you want the movement of the stone without a single slab running the whole room. Every slab is photographed and graded before it is cut, and the grade on the box is the one you will be buying.",
    photos: [
      {
        src: marbleUrl.src,
        alt: "White marble with fine grey veining on a polished slab",
        pexels: "https://images.pexels.com/photos/4709013/pexels-photo-4709013.jpeg",
      },
      {
        src: marbleAltUrl.src,
        alt: "Marble wall with a dark diagonal band over a light surface",
        pexels: "https://images.pexels.com/photos/6634150/pexels-photo-6634150.jpeg",
      },
    ],
  },
  granite: {
    key: "granite",
    slug: "granite",
    name: "Granite",
    eyebrow: "STONE",
    intro:
      "The hard-wearing stone for worktops, cladding, and anywhere that takes a beating.",
    body:
      "Where marble goes somewhere you look at, granite goes somewhere you work. It is the worktop stone, the exterior cladding, the stair that gets used all day. It does not stain and it does not scratch under a pan, which is why it survives a busy kitchen the way marble would not. We stock the Indian granites by the slab — black, grey, and the warm browns — and cut to the size a kitchen order actually needs.",
    photos: [
      {
        src: graniteUrl.src,
        alt: "Black granite slab with a dense speckled grain",
        pexels: "https://images.pexels.com/photos/11255408/pexels-photo-11255408.jpeg",
      },
      {
        src: graniteAltUrl.src,
        alt: "Polished granite surface with a fine speckled pattern",
        pexels: "https://images.pexels.com/photos/11254985/pexels-photo-11254985.jpeg",
      },
      {
        src: graniteAlt2Url.src,
        alt: "Grey granite slab with soft flecked movement",
        pexels: "https://images.pexels.com/photos/14906881/pexels-photo-14906881.jpeg",
      },
    ],
  },
  "western-toilets": {
    key: "western-toilets",
    slug: "western-toilets",
    name: "Western Toilets",
    eyebrow: "BATH",
    intro:
      "Floor-mounted and wall-hung sanitary ware, in the ceramics that suit a bathroom.",
    body:
      "The toilet is the one fixture in a bathroom you look at every day, so we keep the options honest rather than huge. We carry floor-mounted suites in white and off-white, wall-hung cisterns for the cleaner lines under the floor, and dual-flush where the bill is going to be felt. When a bathroom needs the whole set rather than a single bowl, we quote the suite as one so the finishes match.",
    photos: [
      {
        src: toiletUrl.src,
        alt: "Modern white toilet in a bright tiled bathroom",
        pexels: "https://images.pexels.com/photos/6487948/pexels-photo-6487948.jpeg",
      },
      {
        src: toiletAltUrl.src,
        alt: "White toilet beside a walk-in shower in a bathroom",
        pexels: "https://images.pexels.com/photos/7587312/pexels-photo-7587312.jpeg",
      },
    ],
  },
  chemicals: {
    key: "chemicals",
    slug: "chemicals",
    name: "Chemicals",
    eyebrow: "SURFACES",
    intro:
      "The sealer, cleaner, and adhesive that keeps stone and tile doing its job.",
    body:
      "Stone you do not seal is stone you are going to lose. We stock the sealers and impregnators for marble and granite, the epoxies and resins for repair, and the cleaning lines that will not dull the grout or strip the finish. The right chemical on the right surface is the difference between a floor that lasts ten years and one that goes dull in six months, so this shelf is stocked by material, not by habit.",
    photos: [
      {
        src: chemicalUrl.src,
        alt: "Bottles of white cleaning product on a shelf",
        pexels: "https://images.pexels.com/photos/10557894/pexels-photo-10557894.jpeg",
      },
      {
        src: chemicalAltUrl.src,
        alt: "Assorted household cleaning products on a counter",
        pexels: "https://images.pexels.com/photos/37187619/pexels-photo-37187619.jpeg",
      },
      {
        src: chemicalAlt2Url.src,
        alt: "Larger bottles of cleaning product with green labels",
        pexels: "https://images.pexels.com/photos/10568267/pexels-photo-10568267.jpeg",
      },
    ],
  },
  mirrors: {
    key: "mirrors",
    slug: "mirrors",
    name: "Mirrors",
    eyebrow: "FINISHING",
    intro:
      "Plain and bevelled mirrors, and the ones that open up a narrow room.",
    body:
      "A mirror is not decoration; it is a tool for light. It is what makes a small bathroom feel like a larger one, and what puts daylight into a hallway that gets none. We carry plain and bevelled-edge panels, and the large formats for the walls you want to read as open. The bevel matters — a clean bevel catches light the way a plain edge does not, and it is the difference between a mirror that works and one that looks pasted on.",
    photos: [
      {
        src: mirrorUrl.src,
        alt: "Oval mirror leaning against a pale wall",
        pexels: "https://images.pexels.com/photos/32168953/pexels-photo-32168953.jpeg",
      },
      {
        src: mirrorAltUrl.src,
        alt: "Large wall mirror reflecting the room behind it",
        pexels: "https://images.pexels.com/photos/11006034/pexels-photo-11006034.jpeg",
      },
      {
        src: mirrorAlt2Url.src,
        alt: "Full-length floor mirror showing a room and person reflected",
        pexels: "https://images.pexels.com/photos/4654989/pexels-photo-4654989.jpeg",
      },
    ],
  },
  "washing-basins": {
    key: "washing-basins",
    slug: "washing-basins",
    name: "Washing Basins",
    eyebrow: "BATH",
    intro:
      "Countertop and under-counter basins in the ceramics that match the room.",
    body:
      "The basin is the part of the bathroom people lean on, so it has to be the right height and the right reach before it is the right colour. We carry ceramic basins in the standard white and the warmer off-whites, along with the pedestal mounts that hold the space open. A basin that suits the room is not the prettiest one in the catalogue — it is the one that sits at the height the people using it need.",
    photos: [
      {
        src: basinUrl.src,
        alt: "White countertop basin on a tiled bathroom vanity",
        pexels: "https://images.pexels.com/photos/4194712/pexels-photo-4194712.jpeg",
      },
      {
        src: basinAltUrl.src,
        alt: "Round ceramic basin in a bright bathroom",
        pexels: "https://images.pexels.com/photos/10900773/pexels-photo-10900773.jpeg",
      },
      {
        src: basinAlt2Url.src,
        alt: "White wall-mounted basin in a compact bathroom",
        pexels: "https://images.pexels.com/photos/7587378/pexels-photo-7587378.jpeg",
      },
    ],
  },
  "house-finishing": {
    key: "house-finishing",
    slug: "house-finishing",
    name: "House Finishing",
    eyebrow: "WORK",
    intro:
      "From foundation to the last coat of paint — we build, develop, and finish houses.",
    body:
      "Some of our customers buy the material; others hand us the plot. We build houses and carry the full scope — masonry, concrete, plaster, tiling, painting, the finishing pass that makes a home livable. If you have a site or a plan, we take it from the ground up; if you have a house that's almost done, we bring it across the line. Materials are ours, so the finishing is built on the same stone we sell. You bring the plan; we leave the house finished.",
    photos: [
      {
        src: houseUrl.src,
        alt: "Finished modern two-storey house with stone-clad entrance and tiled driveway",
        pexels: "https://images.pexels.com/photos/8134821/pexels-photo-8134821.jpeg",
      },
      {
        src: houseAltUrl.src,
        alt: "New residential home under construction with scaffolding and roof tiling underway",
        pexels: "https://images.pexels.com/photos/39151691/pexels-photo-39151691.jpeg",
      },
      {
        src: houseAlt2Url.src,
        alt: "Trowel with fresh cement against a plastered wall",
        pexels: "https://images.pexels.com/photos/38561968/pexels-photo-38561968.jpeg",
      },
      {
        src: houseAlt3Url.src,
        alt: "Construction worker spreading concrete on a reinforced slab",
        pexels: "https://images.pexels.com/photos/34842259/pexels-photo-34842259.jpeg",
      },
      {
        src: finishingUrl.src,
        alt: "Paint roller laying a first coat on a wall",
        pexels: "https://images.pexels.com/photos/994164/pexels-photo-994164.jpeg",
      },
      {
        src: finishingAltUrl.src,
        alt: "Freshly painted white wall with a roller and tape line",
        pexels: "https://images.pexels.com/photos/7218578/pexels-photo-7218578.jpeg",
      },
      {
        src: finishingAlt2Url.src,
        alt: "Paint roller laying grey paint over a white wall",
        pexels: "https://images.pexels.com/photos/5493653/pexels-photo-5493653.jpeg",
      },
      {
        src: finishingAlt3Url.src,
        alt: "Paint roller resting on a paint-splattered stepladder",
        pexels: "https://images.pexels.com/photos/5799046/pexels-photo-5799046.jpeg",
      },
    ],
  },
};

/** All categories in page order, matching the header grouping. */
export const CATEGORIES_LIST: Category[] = [
  CATEGORIES.marbles,
  CATEGORIES.granite,
  CATEGORIES["western-toilets"],
  CATEGORIES.chemicals,
  CATEGORIES.mirrors,
  CATEGORIES["washing-basins"],
  CATEGORIES["house-finishing"],
];
