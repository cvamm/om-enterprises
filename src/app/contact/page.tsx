import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ContactForm } from "@/components/contact/ContactForm";
import { MapEmbed } from "@/components/contact/MapEmbed";
import { WhatsAppCta } from "@/components/contact/WhatsAppCta";

export const metadata: Metadata = {
  title: "Visit or contact us",
  description:
    "Parbat Stone Works — tiles and natural stone in Kanpur. Walk in, call, or send a WhatsApp message with what you are fitting.",
  alternates: { canonical: "/contact" },
};

/**
 * Contact page.
 *
 * Four surfaces, one page: WhatsApp is the fastest path to a human,
 * the form goes to the same place with a bit more context attached,
 * the map tells a customer where on the road we are, and the hours
 * stop a 9 pm phone call that will not get a reply.
 *
 * Every detail below that is a sample value carries the marker. Replace
 * them from the admin panel before launch — §4 data hygiene.
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
                <div className="mt-6 space-y-3 text-[15px] leading-relaxed text-bone/70">
                  <p>
                    Parbat Stone Works
                    <br />
                    [SAMPLE — replace before deploy]
                    Amdadi Road, near the old clock tower,
                    <br />
                    Kanpur, Uttar Pradesh 226 001
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-[10px] uppercase tracking-[0.45em] text-gold">
                  HOURS
                </h2>
                <div className="mt-6 text-[15px] leading-relaxed text-bone/79">
                  <p>Monday – Saturday · 10 am to 7 pm</p>
                  <p className="mt-1 text-bone/72">
                    Sunday · closed — samples available by prior arrangement
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-[10px] uppercase tracking-[0.45em] text-gold">
                  PHONE
                </h2>
                <div className="mt-6 text-[15px] leading-relaxed text-bone/70">
                  <p>
                    +91 [SAMPLE — replace before deploy]
                  </p>
                  <p className="mt-1 text-bone/72 text-[13px]">
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
    </>
  );
}