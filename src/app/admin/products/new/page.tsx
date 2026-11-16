import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminAddProduct } from "./add-product";

async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated";
}

export const dynamic = "force-dynamic";

export default async function AdminAddProductPage() {
  if (!(await getSession())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-ink">
      <AdminAddProduct />
    </div>
  );
}
