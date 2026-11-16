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

/**
 * Upload product images to the tiles storage bucket before the product row
 * is created, so the caller can pass the resulting URLs into the create call.
 */
export async function POST(request: Request) {
  if (!(await getSession())) {
    return Response.json({ error: "Unauthorized" } as const, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return Response.json({ error: "No files uploaded" } as const, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const dot = file.name.lastIndexOf(".");
      const ext = dot >= 0 ? file.name.slice(dot + 1) : "jpg";
      const filename = `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error } = await supabase.storage
        .from("tiles")
        .upload(`admin/${filename}`, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (error) {
        continue;
      }

      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tiles/admin/${filename}`;
      uploadedUrls.push(publicUrl);
    }

    if (uploadedUrls.length === 0) {
      return Response.json({ error: "Upload failed" } as const, { status: 500 });
    }

    return Response.json({ urls: uploadedUrls });
  } catch {
    return Response.json({ error: "Upload failed" } as const, { status: 500 });
  }
}
