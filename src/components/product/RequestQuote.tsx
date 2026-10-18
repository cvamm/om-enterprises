"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createEnquiry } from "@/server/actions/create-enquiry";
import { buildWhatsAppQuoteLink } from "@/lib/utils/whatsapp";
import { formatInr } from "@/lib/utils/pricing";

/**
 * Request a quote.
 *
 * Two paths, both first-class:
 *
 *   1. WhatsApp, pre-filled with this product. §7.5 makes wa.me the Phase 1
 *      fulfilment channel and the shop is already there, so this is the
 *      primary CTA and the one that works before any server is configured.
 *
 *   2. The form, which writes an enquiry and opens WhatsApp with the same
 *      text. For a customer who would rather not send a WhatsApp first, and
 *      for the shop to have a record either way.
 *
 * The form never pretends to be an order. §5: enquiry is not an order, there
 * is no cart, no payment. The submit button says "Send enquiry" because that
 * is what happens.
 */

/**
 * Build the schema for one product.
 *
 * The MOQ is per product, so the quantity floor has to be captured per
 * instance rather than closed over the component. A factory function is the
 * straightforward way to do that with zod, and it keeps the whole validation
 * surface in one place.
 */
function schemaFor(moqBoxes: number) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, "Please enter your name.")
      .max(80, "That name is longer than we can record."),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number."),
    locality: z.string().trim().max(80).optional(),
    quantity: z
      .number({ invalid_type_error: "Enter how many boxes you need." })
      .int("Whole boxes only.")
      .min(moqBoxes, `Minimum order is ${moqBoxes} box${moqBoxes === 1 ? "" : "es"}.`),
    notes: z.string().trim().max(600).optional(),
    delivery: z.enum(["pickup", "home-delivery", "site-delivery"]),
  });
}

export function RequestQuote({ product }: { product: Product }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schema = schemaFor(product.moqBoxes);
  type FormValues = z.infer<typeof schema>;

  const whatsappLink = buildWhatsAppQuoteLink({
    productName: product.nameEn,
    boxPriceInr: product.pricePerBoxInr,
    boxAreaSqft: product.boxAreaSqft,
    boxes: product.moqBoxes,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      locality: "",
      quantity: product.moqBoxes,
      notes: "",
      delivery: "home-delivery",
    },
  });

  const boxes = watch("quantity");
  // Empty input reads as NaN, not 0. Guard explicitly: a customer who has
  // typed nothing yet should see no estimate, not a fabricated ₹0.
  const parsedBoxes = Number(boxes);
  const estimated = Number.isFinite(parsedBoxes)
    ? parsedBoxes * product.pricePerBoxInr
    : 0;

  async function onSubmit(values: FormValues) {
    setError(null);
    const result = await createEnquiry({
      customerName: values.name,
      phone: values.phone,
      locality: values.locality,
      productId: product.id,
      qtyBoxes: values.quantity,
      deliveryPreference: values.delivery,
      notes: values.notes,
      source: "product-page",
    });

    if (!result.ok) {
      // §10: errors give direction. Say what to do next, not "something went
      // wrong".
      setError(
        "That did not save. Your details are still in the form — try again, or " +
          "message us on WhatsApp and we will pick it up from there.",
      );
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        className="rounded-2xl border border-[#c9a96a]/40 bg-[#0b0b0c] p-7 md:p-9"
        data-testid="quote-success"
      >
        <p className="text-[10px] uppercase tracking-[0.45em] text-[#c9a96a]">
          Enquiry received
        </p>
        <p className="mt-5 text-[15px] leading-relaxed text-bone/70">
          We have your request for {product.nameEn}. We reply to every enquiry
          within one working day with stock confirmation and a final quote.
        </p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center rounded-full border border-[#c9a96a]/60 px-5 py-2.5
                     text-[11px] uppercase tracking-[0.24em] text-[#c9a96a] transition-colors
                     duration-300 hover:bg-[#c9a96a] hover:text-black"
        >
          Send the same details on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-white/10 bg-[#0b0b0c] p-7 md:p-9"
      data-testid="request-quote"
    >
      <p className="text-[10px] uppercase tracking-[0.45em] text-[#c9a96a]">
        REQUEST A QUOTE
      </p>

      <p className="mt-5 text-[14px] leading-relaxed text-bone/60">
        Tell us how much you need and we will confirm stock and send a final
        price. We do not take payment on this site — this is an enquiry, not an
        order.
      </p>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 flex w-full items-center justify-center rounded-full bg-[#c9a96a] px-6 py-4
                   text-[11px] uppercase tracking-[0.24em] text-black transition-colors
                   duration-300 hover:bg-bone"
      >
        Send on WhatsApp
      </a>

      <div className="my-8 flex items-center gap-4">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[10px] uppercase tracking-[0.24em] text-bone/35">or</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <Field label="Your name" error={errors.name?.message} id="rq-name">
          <input
            id="rq-name"
            type="text"
            autoComplete="name"
            className={inputClass}
            {...register("name")}
          />
        </Field>

        <Field label="Mobile number" error={errors.phone?.message} id="rq-phone">
          <input
            id="rq-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="10 digits"
            className={inputClass}
            {...register("phone")}
          />
        </Field>

        <Field
          label="Area or locality"
          error={errors.locality?.message}
          id="rq-locality"
          hint="Optional. Helps us quote delivery."
        >
          <input
            id="rq-locality"
            type="text"
            autoComplete="address-level2"
            className={inputClass}
            {...register("locality")}
          />
        </Field>

        <Field
          label={`Boxes (minimum ${product.moqBoxes})`}
          error={errors.quantity?.message}
          id="rq-qty"
        >
          <input
            id="rq-qty"
            type="number"
            min={product.moqBoxes}
            step={1}
            className={inputClass}
            {...register("quantity", { valueAsNumber: true })}
          />
        </Field>

        <Field label="Delivery" id="rq-delivery">
          <select id="rq-delivery" className={inputClass} {...register("delivery")}>
            <option value="home-delivery">Home delivery</option>
            <option value="site-delivery">Site delivery</option>
            <option value="pickup">I will collect from the shop</option>
          </select>
        </Field>

        <Field label="Anything else" error={errors.notes?.message} id="rq-notes">
          <textarea
            id="rq-notes"
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Room dimensions, shade references, timing"
            {...register("notes")}
          />
        </Field>

        {estimated > 0 && (
          <p className="border-t border-white/10 pt-6 text-[13px] text-bone/55">
            Estimated tile cost{" "}
            <span className="text-bone" data-testid="quote-estimate">
              {formatInr(estimated)}
            </span>{" "}
            before delivery. Final quote confirmed by us.
          </p>
        )}

        {error !== null && (
          <p className="text-[13px] text-[#c9a96a]" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full border border-[#c9a96a]/60 px-5 py-4 text-[11px]
                     uppercase tracking-[0.24em] text-[#c9a96a] transition-colors
                     duration-300 hover:bg-[#c9a96a] hover:text-black
                     disabled:opacity-50"
        >
          {isSubmitting ? "Sending" : "Send enquiry"}
        </button>

        <p className="text-[11px] leading-relaxed text-bone/35">
          We use your number only to answer this enquiry.{" "}
          <Link href="/faq" className="underline underline-offset-2 hover:text-bone/60">
            See our privacy note
          </Link>
          .
        </p>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-white/12 bg-transparent px-5 py-4 text-[15px] text-bone " +
  "placeholder:text-bone/30 transition-colors duration-300 hover:border-white/30 " +
  "focus:border-[#c9a96a]/60 focus:outline-none";

function Field({
  label,
  error,
  hint,
  id,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[10px] uppercase tracking-[0.24em] text-bone/45"
      >
        {label}
      </label>
      <div className="mt-3">{children}</div>
      {hint !== undefined && error === undefined && (
        <p className="mt-2 text-[11px] text-bone/35">{hint}</p>
      )}
      {error !== undefined && (
        <p className="mt-2 text-[11px] text-[#c9a96a]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}