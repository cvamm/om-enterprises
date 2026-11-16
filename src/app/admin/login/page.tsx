import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminLoginForm } from "./login-form";

async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated";
}

export default async function AdminLoginPage() {
  if (await getSession()) {
    redirect("/admin/products");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink">
      <div className="w-full max-w-md p-8">
        <h1 className="font-display text-3xl text-bone mb-2">Admin Panel</h1>
        <p className="text-bone/60 mb-8">OM Enterprises — Product Management</p>
        <AdminLoginForm />
      </div>
    </div>
  );
}
