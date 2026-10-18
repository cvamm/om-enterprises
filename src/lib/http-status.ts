/**
 * An error carrying an HTTP status.
 *
 * Thrown from a page's generateStaticParams or a server component when a
 * resource is missing, and caught in a route handler to set the correct
 * response status.
 *
 * Next's notFound() renders the not-found page but, in the versions of
 * Next tested during Phase 1, does not set the response's HTTP status —
 * the body is the 404 page and the status code is 200. A stale product
 * URL indexed as 200 stays in Google's index; a true 404 is dropped.
 *
 * To get a real 404 for a missing product without waiting on the
 * framework: the product detail page's route (a dynamic route in
 * App Router) can return a Response with status 404 from a route handler
 * if the page is implemented as a server action, or use generateMetadata
 * to at minimum get the title right. The body of the 404 is handled by
 * the scoped not-found.tsx in the same route group.
 */
export class HttpStatusError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpStatusError";
    this.status = status;
  }
}
