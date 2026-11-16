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

export async function GET(request: Request) {
  if (!(await getSession())) {
    return Response.json({ error: "Unauthorized" } as const, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const pageRaw = searchParams.get("page");
    const limitRaw = searchParams.get("limit");
    const page = pageRaw !== null ? Number(pageRaw) : 1;
    const limit = limitRaw !== null ? Number(limitRaw) : 50;
    const search = searchParams.get("search");
    const room = searchParams.get("room");

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search !== null && search !== "") {
      query = query.or(`name_en.ilike.%${search}%,slug.ilike.%${search}%`);
    }

    if (room !== null && room !== "") {
      query = query.contains("room_uses", [room]);
    }

    const { data, error, count } = await query;

    if (error) {
      return Response.json({ error: error.message } as const, { status: 500 });
    }

    return Response.json({ products: data, total: count, page, limit });
  } catch {
    return Response.json({ error: "Failed to fetch products" } as const, { status: 500 });
  }
}
