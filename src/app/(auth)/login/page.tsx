"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Contractor login.
 *
 * Supabase email + password. On success the router pushes to the
 * trade portal. When Supabase is unconfigured (fresh clone, ADR 0003)
 * the form is shown but submitting produces a clear message, not a
 * network error.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const configured = isSupabaseConfigured();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) {
      setError(
        "Login is not available yet. Set the Supabase environment variables first.",
      );
      return;
    }

    setSending(true);
    setError(null);

    const supabase = getBrowserSupabase();
    if (supabase === null) {
      setError("Login is not available yet. Check your environment.");
      setSending(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSending(false);

    if (authError !== null) {
      setError(
        authError.code === "PGRST116" || authError.message.includes("credentials")
          ? "Email or password is wrong."
          : "Could not sign in. Try again or contact the shop.",
      );
      return;
    }

    router.push("/contractor");
  }

  return (
    <div>
      <h1 className="font-display text-4xl leading-[1.02] text-bone">
        Contractor login
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-bone/77">
        Sign in to the trade portal for batch pricing, credit tracking, and
        project records.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div>
          <label htmlFor="login-email" className="block text-[11px] uppercase tracking-[0.24em] text-bone/75">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@firm.com"
            className="mt-2 w-full rounded-lg border border-bone/12 bg-transparent px-5 py-3.5
                       text-[15px] text-bone placeholder:text-bone/25 transition-colors duration-300
                       hover:border-bone/30 focus:border-gold/60 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-[11px] uppercase tracking-[0.24em] text-bone/75">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-2 w-full rounded-lg border border-bone/12 bg-transparent px-5 py-3.5
                       text-[15px] text-bone placeholder:text-bone/25 transition-colors duration-300
                       hover:border-bone/30 focus:border-gold/60 focus:outline-none"
          />
        </div>

        {error !== null && (
          <p className="text-[13px] text-[#e07b7b]" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-full bg-[#c9a96a] px-6 py-4 text-[11px] uppercase tracking-[0.24em] text-black
                     transition-colors duration-300 hover:bg-ink disabled:pointer-events-none disabled:opacity-40"
        >
          {sending ? "Signing in" : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-[13px] text-bone/72">
        New contractor?{" "}
        <a
          href="/register"
          className="text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold"
        >
          Request an account
        </a>
      </p>
    </div>
  );
}