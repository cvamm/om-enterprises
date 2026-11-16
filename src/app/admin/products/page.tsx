import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminProductsList } from "./products-list";

async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated";
}

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  if (!(await getSession())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-ink">
      <AdminProductsList />
    </div>
  );
}
