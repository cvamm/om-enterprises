"use server";

import { enquirySchema, type EnquiryResult } from "@/lib/validators/enquiry";
import { getServerSupabase } from "@/lib/supabase/server";

/**
 * Record an enquiry.
 *
 * §5: an enquiry is NOT an order. No payment is taken, no stock is reserved,
 * and nothing here should imply otherwise to the customer. The shop confirms
 * stock and sends a final quote by hand.
 *
 * Writes with the anon key, not the service role, so the `enquiries_public_insert`
 * RLS policy is the thing actually authorising this. A bug in a policy
 * therefore surfaces here rather than hiding behind a privileged connection.
 *
 * When Supabase is unconfigured (ADR 0003 — a fresh clone must build) the
 * action still succeeds and says so: the WhatsApp path carries the enquiry to
 * the shop regardless, and a dev with no database should not see an error.
 */
export async function createEnquiry(
  input: unknown,
): Promise<EnquiryResult> {
  const parsed = enquirySchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      const key = path === "" ? "_" : path;
      // First error per field wins; the rest are usually consequences.
      if (fieldErrors[key] === undefined) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      message: "Check the details you entered and try again.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const supabase = await getServerSupabase();

  if (supabase === null) {
    // No database configured. The WhatsApp link still reaches the shop, so
    // the enquiry is not lost — log it server-side so dev has a record.
    console.warn(
      "[create-enquiry] Supabase not configured; enquiry not persisted:",
      { customerName: data.customerName, productId: data.productId, qtyBoxes: data.qtyBoxes },
    );
    return { ok: true, id: "dev-no-database" };
  }

  const { data: inserted, error } = await supabase
    .from("enquiries")
    .insert({
      customer_name: data.customerName,
      phone: data.phone,
      whatsapp_number: data.whatsappNumber ?? null,
      locality: data.locality ?? null,
      product_id: data.productId ?? null,
      contractor_id: data.contractorId ?? null,
      qty_boxes: data.qtyBoxes ?? null,
      room_area_sqft: data.roomAreaSqft ?? null,
      delivery_preference: data.deliveryPreference,
      notes: data.notes ?? null,
      whatsapp_optin: data.whatsappOptin,
      source: data.source,
      status: "new",
      status_updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error !== null) {
    console.error("[create-enquiry] insert failed:", error.message);
    return {
      ok: false,
      message:
        "We could not save that just now. Your details are still in the form — " +
        "try again, or message us on WhatsApp and we will pick it up from there.",
    };
  }

  return { ok: true, id: inserted.id };
}