import { z } from "zod";

/**
 * Enquiry validation.
 *
 * Shared by the React Hook Form resolver and the Server Action, so a
 * hand-crafted POST that skips the client is validated identically. The
 * client-side check is a convenience; this one is the boundary.
 */

/**
 * Indian mobile: 10 digits starting 6-9, optionally with the country code or
 * a leading +. Stored normalised to 10 digits so WhatsApp link building does
 * not have to guess at formatting.
 */
export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s\-()]/g, "").replace(/^\+?91/, ""))
  .refine(
    (value) => /^[6-9]\d{9}$/.test(value),
    "Enter a 10-digit Indian mobile number.",
  );

export const enquirySchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(80, "That name is longer than we can record."),
  phone: phoneSchema,
  whatsappNumber: phoneSchema.optional(),
  locality: z.string().trim().max(120).optional(),
  productId: z.string().uuid().optional(),
  contractorId: z.string().uuid().optional(),
  qtyBoxes: z.number().int().positive().optional(),
  roomAreaSqft: z.number().positive().max(100_000).optional(),
  deliveryPreference: z
    .enum(["pickup", "home-delivery", "site-delivery"])
    .default("home-delivery"),
  notes: z.string().trim().max(600).optional(),
  whatsappOptin: z.boolean().default(true),
  source: z
    .enum(["web", "calculator", "tile-lab", "product-page", "contractor-portal", "instagram"])
    .default("web"),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

/** The action's return shape. Never throws — Server Actions cross a boundary. */
export type EnquiryResult =
  | { ok: true; id: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };