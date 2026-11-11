/**
 * Route-level loader. A quiet wordmark on the cream base, no spinner.
 * The brand's voice is Cormorant, so the loading state stays in that voice.
 *
 * Must be a default export — Next.js reads this file's default to build the
 * route's Suspense boundary. A named export here makes the router try to
 * serialise a function across the server/client boundary and the whole build
 * fails on `/_not-found`, which is a confusing place to look for the cause.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="flex min-h-[60vh] items-center justify-center bg-[#f5f0e6]"
    >
      <span
        className="font-display animate-pulse text-2xl text-bone/72"
        style={{ animationDuration: "1800ms" }}
      >
        Stone &amp; Tile House
      </span>
    </div>
  );
}
