import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

async function _getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;
    const pwd = typeof password === "string" ? password : "";

    if (pwd.length > 0 && pwd === ADMIN_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set("admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid password" } as const, { status: 401 });
  } catch {
    return Response.json({ error: "Bad request" } as const, { status: 400 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return Response.json({ success: true });
}
