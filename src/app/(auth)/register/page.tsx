"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { getBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Contractor registration.
 *
 * Creates the Supabase auth user and a pending contractor row in one
 * step. The tier (silver / gold) is confirmed by the shop after the
 * first order, not chosen here — the form does not ask for it.
 *
 * When Supabase is unconfigured the form still renders; submitting
 * shows a clear message rather than a network error.
 */
export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [firm, setFirm] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [registered, setRegistered] = useState(false);

  const configured = isSupabaseConfigured();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) {
      setError("Registration is not available yet. Set the Supabase environment variables first.");
      return;
    }

    setSending(true);
    setError(null);

    const supabase = getBrowserSupabase();
    if (supabase === null) {
      setError("Registration is not available yet. Check your environment.");
      setSending(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          real_name: name,
          firm: firm,
          phone: phone,
        },
      },
    });

    setSending(false);

    if (authError !== null) {
      setError(
        authError.message.includes("exists")
          ? "An account with this email already exists."
          : "Could not register. Check the details and try again.",
      );
      return;
    }

    // If email confirmation is disabled the user is signed in immediately.
    if (data.user !== null && data.session !== null) {
      setRegistered(true);
    } else {
      // Email confirmation is on — tell the customer to check their inbox.
      setRegistered(true);
    }
  }

  if (registered) {
    return (
      <div>
        <h1 className="font-display text-4xl leading-[1.02] text-bone">
          Account created
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-bone/77">
          Check your email — if the shop has enabled confirmation you will
          get a link to activate the account. Once it is active you can
          sign in on the contractor portal.
        </p>
        <a
          href="/login"
          className="mt-10 inline-flex rounded-full border border-gold/60 px-6 py-3.5
                     text-[11px] uppercase tracking-[0.24em] text-gold
                     transition-colors duration-300 hover:bg-[#c9a96a] hover:text-black"
        >
          Go to login
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-4xl leading-[1.02] text-bone">
        Request a trade account
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-bone/77">
        For contractors and builders who order in bulk. The shop confirms
        your tier and credit terms after the first order.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div>
          <label htmlFor="reg-name" className="block text-[11px] uppercase tracking-[0.24em] text-bone/75">
            Full name
          </label>
          <input
            id="reg-name"
            type="text"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mt-2 w-full rounded-lg border border-bone/12 bg-transparent px-5 py-3.5
                       text-[15px] text-bone placeholder:text-bone/25 transition-colors duration-300
                       hover:border-bone/30 focus:border-gold/60 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="reg-firm" className="block text-[11px] uppercase tracking-[0.24em] text-bone/75">
            Firm or trade name
          </label>
          <input
            id="reg-firm"
            type="text"
            required
            minLength={2}
            value={firm}
            onChange={(e) => setFirm(e.target.value)}
            placeholder="Your firm"
            className="mt-2 w-full rounded-lg border border-bone/12 bg-transparent px-5 py-3.5
                       text-[15px] text-bone placeholder:text-bone/25 transition-colors duration-300
                       hover:border-bone/30 focus:border-gold/60 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="reg-phone" className="block text-[11px] uppercase tracking-[0.24em] text-bone/75">
            Phone
          </label>
          <input
            id="reg-phone"
            type="tel"
            required
            minLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 …"
            className="mt-2 w-full rounded-lg border border-bone/12 bg-transparent px-5 py-3.5
                       text-[15px] text-bone placeholder:text-bone/25 transition-colors duration-300
                       hover:border-bone/30 focus:border-gold/60 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="reg-email" className="block text-[11px] uppercase tracking-[0.24em] text-bone/75">
            Email
          </label>
          <input
            id="reg-email"
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
          <label htmlFor="reg-password" className="block text-[11px] uppercase tracking-[0.24em] text-bone/75">
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
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
          {sending ? "Creating account" : "Create account"}
        </button>
      </form>
    </div>
  );
}