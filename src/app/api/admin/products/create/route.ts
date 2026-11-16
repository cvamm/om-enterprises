import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated";
}

export async function POST(request: Request) {
  if (!(await getSession())) {
    return Response.json({ error: "Unauthorized" } as const, { status: 401 });
  }

  try {
    const body = await request.json();

    // Build a clean slug from the name so product detail pages work.
    const baseSlug = String(body.name_en ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug =
      baseSlug.length > 0
        ? `${baseSlug}-${Date.now().toString(36)}`
        : `product-${Date.now().toString(36)}`;

    const dims = Array.isArray(body.nominal_dimensions_mm)
      ? body.nominal_dimensions_mm.map((d: unknown) => {
          const n = Number(d);
          return Number.isFinite(n) ? n : 0;
        })
      : [0, 0, 0];

    const num = (v: unknown, fallback: number): number => {
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    };

    const record = {
      slug,
      name_en: body.name_en,
      name_hi: body.name_hi ?? null,
      origin_id: null,
      supplier_id: null,
      material_type: body.material_type,
      finish: body.finish,
      room_uses: Array.isArray(body.room_uses) ? body.room_uses : [],
      shape: body.shape,
      nominal_dimensions_mm: dims,
      box_area_sqft: num(body.box_area_sqft, 0),
      tiles_per_box: num(body.tiles_per_box, 0),
      price_per_box_inr: num(body.price_per_box_inr, 0),
      moq_boxes: num(body.moq_boxes, 1),
      grade: body.grade,
      stock_status: body.stock_status,
      photo_urls: Array.isArray(body.photo_urls) ? body.photo_urls : [],
      video_urls: [],
      featured_rank: null,
      description_en: body.description_en ?? null,
      description_hi: null,
      default_wastage_pct: null,
      active: true,
    };

    const { data, error } = await supabase.from("products").insert(record).select().single();

    if (error) {
      return Response.json({ error: error.message } as const, { status: 500 });
    }

    return Response.json({ product: data }, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to create product" } as const, { status: 500 });
  }
}
