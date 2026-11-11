"use client";

import { useState } from "react";
import type { DeliveryPref } from "@/types";
import { buildWhatsAppUrl } from "@/lib/config/site";

type ContactFormState = { status: "idle" } | { status: "sent" };

const DELIVERY_PREF_LABELS: Record<DeliveryPref, string> = {
  pickup: "Pick up",
  "home-delivery": "Home delivery",
  "site-delivery": "Site delivery",
};

const DELIVERY_PREFS: DeliveryPref[] = ["pickup", "home-delivery", "site-delivery"];

/**
 * Contact form → WhatsApp.
 *
 * Static demo: GitHub Pages has no server to record an enquiry, so the form
 * composes the message and opens WhatsApp with it pre-filled — the shop's
 * Phase 1 fulfilment channel. The customer taps send there; nothing is
 * claimed to have been sent until they do.
 */
export function ContactForm() {
  const [state, setState] = useState<ContactFormState>({ status: "idle" });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [locality, setLocality] = useState("");
  const [deliveryPref, setDeliveryPref] = useState<DeliveryPref>("pickup");
  const [notes, setNotes] = useState("");

  const canSubmit =
    name.trim().length >= 2 &&
    phone.trim().length >= 10 &&
    state.status !== "sent";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    const lines = [
      "Hello, I have an enquiry from your website.",
      "",
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
    ];
    if (locality.trim() !== "") lines.push(`Area: ${locality.trim()}`);
    lines.push(`Delivery: ${DELIVERY_PREF_LABELS[deliveryPref]}`);
    if (notes.trim() !== "") lines.push("", notes.trim());

    window.open(buildWhatsAppUrl(lines.join("\n")), "_blank", "noopener,noreferrer");
    setState({ status: "sent" });
  }

  if (state.status === "sent") {
    return (
      <div className="rounded-2xl border border-gold/40 bg-ink p-7">
        <p className="font-display text-2xl leading-tight text-bone">
          Over to WhatsApp.
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-bone/77">
          Your message is open in WhatsApp — tap send there and the shop will
          reply on {phone}. No payment, no obligation — just a conversation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-[10px] uppercase tracking-[0.45em] text-gold">
        SEND A MESSAGE
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="text"
          required
          minLength={2}
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className={inputClass}
          aria-label="Your name"
        />
        <input
          type="tel"
          required
          minLength={10}
          maxLength={15}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          className={inputClass}
          aria-label="Phone number"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="text"
          maxLength={100}
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
          placeholder="Locality (optional)"
          className={inputClass}
          aria-label="Locality"
        />
        <select
          value={deliveryPref}
          onChange={(e) => setDeliveryPref(e.target.value as DeliveryPref)}
          className={`${inputClass} appearance-none`}
          aria-label="Delivery preference"
        >
          {DELIVERY_PREFS.map((pref) => (
            <option key={pref} value={pref} className="bg-ink-2">
              {DELIVERY_PREF_LABELS[pref]}
            </option>
          ))}
        </select>
      </div>

      <textarea
        rows={3}
        maxLength={500}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="What are you fitting? A rough area and what you are thinking."
        className={`${inputClass} resize-none`}
        aria-label="Message"
      />

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex w-full items-center justify-center rounded-full bg-[#c9a96a] px-6 py-4
                   text-[11px] uppercase tracking-[0.24em] text-black transition-colors
                   duration-300 hover:bg-ink disabled:pointer-events-none disabled:opacity-40"
      >
        Send on WhatsApp
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-bone/12 bg-transparent px-5 py-3.5 text-[15px] text-bone " +
  "placeholder:text-bone/68 transition-colors duration-300 hover:border-bone/30 " +
  "focus:border-gold/60 focus:outline-none";