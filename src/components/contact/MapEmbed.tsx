/**
 * Map placeholder.
 *
 * A real Google Maps embed (or Mapbox GL) lands once the shop has a
 * verified location pin and the embed token is configured. Until then
 * this is an honest card, not a broken iframe — showing a map tile with
 * no location data would be a dead end, and a blank card at least says
 * what it is.
 */
export function MapEmbed() {
  return (
    <div className="flex min-h-[220px] flex-col justify-between rounded-2xl border border-bone/10 bg-ink p-7">
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.45em] text-gold">
          FIND US
        </h3>
        <p className="mt-4 text-[15px] leading-relaxed text-bone/79">
          Map pin comes with the verified shop address. [SAMPLE — replace
          before deploy]
        </p>
      </div>
      <div className="mt-8 flex items-center gap-3">
        <div className="h-px w-10 bg-[#c9a96a]/40" aria-hidden="true" />
        <span className="text-[11px] text-bone/72">
          Amdadi Road, Kanpur
        </span>
      </div>
    </div>
  );
}