import { formatAddress, siteConfig } from "@/lib/config/site";

/**
 * Find-us card.
 *
 * Links to the shop's own Google Maps place, pinned by its permanent `cid`,
 * rather than an embed iframe: an embed needs a verified place ID and a
 * billed API token, and "OM ENTERPRISES" alone matches several other Kanpur
 * shops in a search.
 */
export function MapEmbed() {
  return (
    <div className="flex min-h-[220px] flex-col justify-between rounded-2xl border border-bone/10 bg-ink p-7">
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.45em] text-gold">
          FIND US
        </h3>
        <p className="mt-4 text-[15px] leading-relaxed text-bone/79">
          {formatAddress(siteConfig.address)}
        </p>
        <a
          href={siteConfig.address.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold/85 hover:text-gold mt-3 inline-block text-[13px] underline underline-offset-4"
        >
          Open in Google Maps
        </a>
      </div>
      <div className="mt-8 flex items-center gap-3">
        <div className="h-px w-10 bg-[#c9a96a]/40" aria-hidden="true" />
        <span className="text-[11px] text-bone/72">
          GSTIN {siteConfig.gstin}
        </span>
      </div>
    </div>
  );
}
