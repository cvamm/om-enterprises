/**
 * Route-level loader. A quiet wordmark on the tinted near-black, no spinner.
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
      className="flex min-h-[60vh] items-center justify-center bg-ink"
    >
      <span
        className="font-display animate-pulse text-2xl text-bone/40"
        style={{ animationDuration: "1800ms" }}
      >
        Parbat Stone Works
      </span>
    </div>
  );
}
