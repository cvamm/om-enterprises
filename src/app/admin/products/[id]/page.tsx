import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminEditProduct } from "./edit-product";

async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated";
}

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await getSession())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  return <AdminEditProduct productId={id} />;
}
