import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getProjects } from "@/lib/queries/projects";
import type { Project } from "@/types";

export const metadata: Metadata = {
  title: "Recent projects",
  description:
    "Completed installations in and around Kanpur: bathrooms, floors, cladding, and commercial work. Before-and-after photos with the customer's permission.",
  alternates: { canonical: "/portfolio" },
};

function formatDate(iso: string | null): string | null {
  if (iso === null) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

/**
 * Portfolio page.
 *
 * Projects are pulled from the Supabase `projects` table. Until the
 * shop has added photos with customer permission the page shows an
 * honest empty state, not stock images pretending to be work we did.
 */
export default async function PortfolioPage() {
  const projects: Project[] = await getProjects(12);

  return (
    <>
      <section className="border-b border-bone/10 bg-ink py-24 md:py-32">
        <Container>
          <div className="max-w-3xl">
            <Eyebrow label="04 — RECENT PROJECTS" />
            <h1 className="mt-8 font-display text-5xl leading-[1.02] text-bone md:text-7xl">
              Rooms we have laid,
              <span className="block font-light italic text-bone/77">
                photographed with permission
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-bone/79">
              Before-and-after photos of completed work in and around Kanpur.
              Customer names are used only with written permission. If you
              would like your project photographed, ask at the counter.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-ink-2 py-24 md:py-32">
        <Container>
          {projects.length === 0 ? (
            <div className="mx-auto max-w-lg text-center">
              <p className="text-[10px] uppercase tracking-[0.45em] text-gold">
                IN PROGRESS
              </p>
              <h2 className="mt-6 font-display text-3xl text-bone">
                The portfolio is being photographed.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-bone/77">
                We are photographing recent installations with customer
                permission. Check back in a few weeks — the photos land
                here as they are approved.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const afterUrl = project.afterPhotoUrls[0];
                const beforeUrl = project.beforePhotoUrls[0];
                return (
                  <div
                    key={project.id}
                    className="group rounded-2xl border border-bone/10 bg-ink overflow-hidden"
                  >
                    <div className="relative h-[220px] overflow-hidden">
                      {afterUrl !== undefined ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={afterUrl}
                          alt={`${project.projectType} — ${project.locality}`}
                          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-brand group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-ink-2">
                          <span className="text-[11px] uppercase tracking-[0.24em] text-bone/68">
                            Photo coming
                          </span>
                        </div>
                      )}
                      {beforeUrl !== undefined && (
                        <span className="absolute left-4 top-4 rounded-full bg-ink/85 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-bone/70">
                          Before available
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-xl text-bone">
                        {project.projectType}
                      </h3>
                      <p className="mt-1 text-[13px] text-bone/73">
                        {project.locality}
                        {formatDate(project.installDate) !== null &&
                          ` · ${formatDate(project.installDate)}`}
                      </p>
                      {project.testimonialText !== null && (
                        <div className="mt-4 border-l border-gold/40 pl-4">
                          <p className="text-[13px] italic leading-relaxed text-bone/77">
                            &ldquo;{project.testimonialText}&rdquo;
                          </p>
                          {project.testimonialName !== null && (
                            <p className="mt-1 text-[11px] not-italic text-bone/70">
                              — {project.testimonialName}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Container>
      </section>

      <section className="border-t border-bone/10 bg-ink py-24 md:py-32">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow label="BEFORE YOU BUY" />
            <p className="mt-6 text-[15px] leading-relaxed text-bone/79">
              Run the calculator before you commit to a format — it will
              tell you how many boxes you need for the room, and the
              wastage allowance every installer builds in.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/calculator"
                className="rounded-full bg-[#c9a96a] px-6 py-4 text-[11px] uppercase tracking-[0.24em] text-black
                           transition-colors duration-300 hover:bg-ink"
              >
                Run the calculator
              </Link>
              <Link
                href="/collections"
                className="rounded-full border border-gold/60 px-6 py-4 text-[11px] uppercase tracking-[0.24em] text-gold
                           transition-colors duration-300 hover:bg-[#c9a96a] hover:text-black"
              >
                Browse the collections
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}