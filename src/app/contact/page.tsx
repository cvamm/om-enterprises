import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ContactForm } from "@/components/contact/ContactForm";
import { MapEmbed } from "@/components/contact/MapEmbed";
import { WhatsAppCta } from "@/components/contact/WhatsAppCta";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Visit or contact us",
  description:
    "OM Enterprises — marble, granites and tiles in Kanpur. Walk in, call, or send a WhatsApp message with what you are fitting.",
  alternates: { canonical: "/contact" },
};

const telDigits = (display: string) => display.replace(/\D/g, "");

/**
 * Contact page.
 *
 * Four surfaces, one page: WhatsApp is the fastest path to a human,
 * the form goes to the same place with a bit more context attached,
 * the map tells a customer where on the road we are, and the hours
 * stop a 9 pm phone call that will not get a reply.
 *
 * The shop address, both phone lines and the hours render from
 * `siteConfig`.
 */
export default function ContactPage() {
  return (
    <>
      <section className="border-b border-bone/10 bg-ink py-24 md:py-32">
        <Container>
          <div className="max-w-3xl">
            <Eyebrow label="CONTACT" />
            <h1 className="mt-8 font-display text-5xl leading-[1.02] text-bone md:text-7xl">
              The shop is open,
              <span className="block font-light italic text-bone/77">
                and the kettle is on
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-bone/79">
              Walk in for a look at the samples, or send a WhatsApp message
              with what you are fitting and a photo of the room. Either way,
              you are talking to the person who will be on the phone when
              the boxes arrive.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-ink-2 py-24 md:py-32">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="space-y-12">
              <div>
                <h2 className="text-[10px] uppercase tracking-[0.45em] text-gold">
                  THE SHOP
                </h2>
                <div className="mt-6 text-[15px] leading-relaxed text-bone/70">
                  <p>
                    <span className="text-bone">{siteConfig.name}</span>
                    <br />
                    {siteConfig.address.line1}
                    <br />
                    {siteConfig.address.line2}, {siteConfig.address.city}{" "}
                    {siteConfig.address.zip}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-[10px] uppercase tracking-[0.45em] text-gold">
                  HOURS
                </h2>
                <div className="mt-6 space-y-1 text-[15px] leading-relaxed text-bone/79">
                  {siteConfig.hours.map((slot) => (
                    <p key={slot.days}>
                      {slot.days} · {slot.time}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-[10px] uppercase tracking-[0.45em] text-gold">
                  PHONE
                </h2>
                <div className="mt-6 text-[15px] leading-relaxed text-bone/70">
                  <ul className="space-y-1.5">
                    <li className="flex flex-wrap items-baseline gap-x-2">
                      <a
                        href={`tel:+${telDigits(siteConfig.phoneDisplay)}`}
                        className="hover:text-gold transition-colors"
                      >
                        {siteConfig.phoneDisplay}
                      </a>
                      <a
                        href={`https://wa.me/${telDigits(siteConfig.phoneDisplay)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-bone/72 text-[13px] hover:text-gold transition-colors"
                      >
                        Call · WhatsApp
                      </a>
                    </li>
                    <li className="flex flex-wrap items-baseline gap-x-2">
                      <a
                        href={`tel:+${telDigits(siteConfig.phoneAlt)}`}
                        className="hover:text-gold transition-colors"
                      >
                        {siteConfig.phoneAlt}
                      </a>
                      <span className="text-bone/72 text-[13px]">Call</span>
                    </li>
                  </ul>
                  <p className="mt-2 text-bone/72 text-[13px]">
                    Call for quotes and delivery times. WhatsApp for everything else.
                  </p>
                </div>
              </div>

              <WhatsAppCta />
            </div>

            <div className="grid gap-8">
              <MapEmbed />
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-bone/10 bg-ink py-24 md:py-32">
        <Container>
          <Eyebrow label="DELIVERY" />
          <h2 className="mt-8 font-display text-4xl leading-[1.05] text-bone md:text-5xl">
            Where the truck goes
          </h2>
          <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {siteConfig.deliveryZones.map((zone) => (
              <div key={zone.id}>
                <h3 className="text-[10px] uppercase tracking-[0.45em] text-gold">
                  {zone.label}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-bone/79">
                  {zone.description}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-14 max-w-3xl text-[13px] leading-relaxed text-bone/62">
            Beyond roughly 150 km — {siteConfig.deliveryExcluded.join(", ")} — there is no
            regular delivery route. Send the site address on WhatsApp and we will tell you
            honestly whether a load can reach it.
          </p>
        </Container>
      </section>
    </>
  );
}