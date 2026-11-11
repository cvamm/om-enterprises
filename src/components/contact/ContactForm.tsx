"use client";

import { useState } from "react";
import { createEnquiry } from "@/server/actions/create-enquiry";
import type { EnquiryInput, DeliveryPref } from "@/types";

type ContactFormState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "sent" }
  | { status: "error"; message: string };

const DELIVERY_PREF_LABELS: Record<DeliveryPref, string> = {
  pickup: "Pick up",
  "home-delivery": "Home delivery",
  "site-delivery": "Site delivery",
};

const DELIVERY_PREFS: DeliveryPref[] = ["pickup", "home-delivery", "site-delivery"];

/**
 * Contact form → enquiry record.
 *
 * Uses the same server action as the product page's quote form. Source
 * is "web" here; the shop can tell the difference between a customer
 * asking about one specific tile and one asking about the shop in
 * general by which page the enquiry came from.
 *
 * The success state says "sent", not "recorded" — the customer has not
 * been promised a database write. The shop receives the message; that
 * is the guarantee, and it is honest.
 */
export function ContactForm() {
  const [state, setState] = useState<ContactFormState>({ status: "idle" });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [locality, setLocality] = useState("");
  const [deliveryPref, setDeliveryPref] = useState<DeliveryPref>("pickup");
  const [notes, setNotes] = useState("");
  const [whatsappOptin, setWhatsappOptin] = useState(true);

  const canSubmit =
    name.trim().length >= 2 &&
    phone.trim().length >= 10 &&
    state.status !== "sending" &&
    state.status !== "sent";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setState({ status: "sending" });

    const input: EnquiryInput = {
      customerName: name.trim(),
      phone: phone.trim(),
      locality: locality.trim() !== "" ? locality.trim() : undefined,
      deliveryPreference: deliveryPref,
      notes: notes.trim() !== "" ? notes.trim() : undefined,
      whatsappOptin,
      source: "web",
    };

    const result = await createEnquiry(input);

    if (result.ok) {
      setState({ status: "sent" });
    } else {
      setState({
        status: "error",
        message: result.message ?? "Something went wrong. Try again.",
      });
    }
  }

  if (state.status === "sent") {
    return (
      <div className="rounded-2xl border border-gold/40 bg-ink p-7">
        <p className="font-display text-2xl leading-tight text-bone">
          Message sent.
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-bone/77">
          The shop will get back to you on {phone}. No payment, no
          obligation — just a conversation.
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

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={whatsappOptin}
          onChange={(e) => setWhatsappOptin(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#c9a96a]"
        />
        <span className="text-[13px] leading-relaxed text-bone/75">
          Send a WhatsApp confirmation when this message is received.
        </span>
      </label>

      {state.status === "error" && (
        <p className="text-[13px] text-[#e07b7b]" role="alert">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex w-full items-center justify-center rounded-full bg-[#c9a96a] px-6 py-4
                   text-[11px] uppercase tracking-[0.24em] text-black transition-colors
                   duration-300 hover:bg-ink disabled:pointer-events-none disabled:opacity-40"
      >
        {state.status === "sending" ? "Sending" : "Send message"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-bone/12 bg-transparent px-5 py-3.5 text-[15px] text-bone " +
  "placeholder:text-bone/68 transition-colors duration-300 hover:border-bone/30 " +
  "focus:border-gold/60 focus:outline-none";