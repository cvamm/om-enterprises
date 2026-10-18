/**
 * Shared domain types, mirroring the Postgres schema in `supabase/migrations`.
 * Enums are plain unions so they can be used in both client and server code.
 */

export type OriginState =
  | "rajasthan"
  | "tamil-nadu"
  | "gujarat"
  | "madhya-pradesh"
  | "chhattisgarh"
  | "karnataka"
  | "andhra-pradesh"
  | "bihar"
  | "other";

export type MaterialType =
  | "ceramic"
  | "vitrified"
  | "porcelain"
  | "natural-stone"
  | "engineered-marble"
  | "quartz"
  | "mosaic"
  | "wood-plank"
  | "terrazzo";

export type FinishType =
  | "glossy"
  | "matte"
  | "textured"
  | "leathered"
  | "honed"
  | "polished"
  | "rustic"
  | "brushed"
  | "decor";

export type RoomUse =
  | "bathroom"
  | "kitchen"
  | "living-room"
  | "bedroom"
  | "flooring"
  | "wall-cladding"
  | "exterior"
  | "commercial"
  | "pool"
  | "balcony";

export type Shape = "square" | "rectangular" | "hexagonal" | "herringbone" | "tile" | "mosaic-sheet";

export type StockStatus = "in-stock" | "made-to-order" | "preorder" | "sold-out";
export type Grade = "aaa" | "aa" | "a" | "b";

export type DeliveryPref = "pickup" | "home-delivery" | "site-delivery";

export type EnquirySource =
  | "web"
  | "calculator"
  | "tile-lab"
  | "product-page"
  | "contractor-portal"
  | "instagram";

export type EnquiryStatus = "new" | "contacted" | "quoted" | "won" | "lost";
export type ContractorTier = "silver" | "gold";

export type BondPattern = "stacked" | "brick" | "diagonal";

export type GroutShade = "ivory" | "pewter" | "charcoal" | "brass";

/** Tile format for the Tile Lab, in millimetres. */
export type TileFormat = "300x300" | "600x600" | "800x1600";

/**
 * A single product. `price_per_box_inr` is the only price stored; every
 * per-sqft figure is derived at read time, never persisted.
 */
export type Product = {
  id: string;
  slug: string;
  nameEn: string;
  nameHi: string | null;
  originId: string | null;
  materialType: MaterialType;
  finish: FinishType;
  roomUses: RoomUse[];
  shape: Shape;
  /** [length, width, height] in millimetres. */
  dimensionsMm: [number, number, number];
  /** Total area covered by one box, in square feet. */
  boxAreaSqft: number;
  tilesPerBox: number;
  /** Rupees, integer. Never decimals — pricing is settled per box. */
  pricePerBoxInr: number;
  moqBoxes: number;
  grade: Grade;
  stockStatus: StockStatus;
  photoUrls: string[];
  videoUrls: string[];
  featured: boolean;
  active: boolean;
  descriptionEn: string | null;
  descriptionHi: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Origin = {
  id: string;
  state: OriginState;
  name: string;
  description: string | null;
  primaryRegions: string[];
  createdAt: string;
  updatedAt: string;
};

export type Supplier = {
  id: string;
  name: string;
  location: string;
  phone: string | null;
  email: string | null;
  verified: boolean;
  certificateImageUrls: string[];
  createdAt: string;
};

export type Project = {
  id: string;
  customerName: string | null;
  locality: string;
  projectType: string;
  installDate: string | null;
  beforePhotoUrls: string[];
  afterPhotoUrls: string[];
  testimonialText: string | null;
  testimonialName: string | null;
  googleReviewUrl: string | null;
  featured: boolean;
  createdAt: string;
};

export type Contractor = {
  id: string;
  supabaseUserId: string;
  realName: string;
  firm: string | null;
  phone: string;
  email: string | null;
  gstin: string | null;
  locality: string | null;
  tier: ContractorTier;
  accountBalance: number;
  creditLimit: number;
  tradeMultiplier: number;
  active: boolean;
  createdAt: string;
};

export type Enquiry = {
  id: string;
  timestamp: string;
  productId: string | null;
  contractorId: string | null;
  qtyBoxes: number | null;
  roomAreaSqft: number | null;
  customerName: string;
  phone: string;
  whatsappNumber: string | null;
  whatsappOptin: boolean;
  locality: string | null;
  deliveryPreference: DeliveryPref;
  notes: string | null;
  source: EnquirySource;
  status: EnquiryStatus;
  statusUpdatedAt: string | null;
};

/** Payload accepted by the create-enquiry server action. */
export type EnquiryInput = {
  productId?: string;
  qtyBoxes?: number;
  roomAreaSqft?: number;
  customerName: string;
  phone: string;
  whatsappNumber?: string;
  whatsappOptin?: boolean;
  locality?: string;
  deliveryPreference: DeliveryPref;
  notes?: string;
  source: EnquirySource;
};
