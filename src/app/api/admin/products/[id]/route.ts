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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) {
    return Response.json({ error: "Unauthorized" } as const, { status: 401 });
  }

  const { id } = await params;
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();

  if (error) {
    return Response.json({ error: "Product not found" } as const, { status: 404 });
  }

  return Response.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) {
    return Response.json({ error: "Unauthorized" } as const, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  delete body.search_vector;

  const { data, error } = await supabase
    .from("products")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: "Failed to update" } as const, { status: 500 });
  }

  return Response.json(data);
}
