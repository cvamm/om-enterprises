import { buildWhatsAppUrl } from "@/lib/config/site";

/**
 * Site-wide floating WhatsApp button.
 *
 * A single always-reachable affordance: a visitor on any page can tap the
 * green bubble and land in a WhatsApp conversation with the shop. The target
 * is `siteConfig.whatsappNumber` — the same value the contact form, footer and
 * quote hand-off use — so there is one number to maintain.
 *
 * The number ships as `910000000000` until the real one is set via
 * `NEXT_PUBLIC_WHATSAPP_NUMBER`; set that env and every link, including this
 * button, points at the live number with no code change.
 *
 * Deliberately a plain anchor (no JS): it must keep working on the static
 * Pages export, where there is no server to record an enquiry — WhatsApp
 * carries it.
 */
export function WhatsAppFab() {
  const href = buildWhatsAppUrl(
    "Hello OM Enterprises — I found you on your website and would like to talk about tiles or stone.",
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Message us on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center
                 rounded-full bg-[#25d366] text-white shadow-[0_8px_30px_-6px_rgba(0,0,0,0.45)]
                 ring-1 ring-ink/20 transition-transform duration-300 hover:scale-105
                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                 focus-visible:outline-gold"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-7 w-7 fill-current transition-transform duration-300 group-hover:scale-105"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.058-.173-.297-.035-.46.113-.609.134-.133.298-.347.446-.52.149-.174.198-.372.298-.569.099-.198.05-.372-.025-.52-.075-.149-.67-1.536-.917-2.109-.242-.563-.489-.58-.669-.59l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26v-.004a9.87 9.87 0 019.866-9.866h.004a9.87 9.87 0 019.87 9.87 9.87 9.87 0 01-9.868 9.868m8.485-18.35A11.818 11.818 0 0012.05 0C5.51 0 .001 5.51.001 12.05c0 2.146.564 4.245 1.636 6.101L.001 32l6.236-1.631A11.82 11.82 0 0012.05 32c6.54 0 12.05-5.51 12.05-12.05 0-3.258-1.266-6.334-3.565-8.634" />
      </svg>
      <span
        className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full
                   border-bone/10 bg-ink-2 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em]
                   text-bone opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100"
      >
        Message us
      </span>
    </a>
  );
}
