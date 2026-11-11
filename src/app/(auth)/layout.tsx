import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ink text-bone">
      <main className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col justify-center px-5 py-24 md:px-10">
        {children}
      </main>
    </div>
  );
}
