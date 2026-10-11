import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import Showroom from "@/components/home/Showroom";
import Button from "@/components/ui/Button";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/Icons";
import MapEmbed from "@/components/ui/MapEmbed";
import RevealText from "@/components/ui/RevealText";
import SectionHeading from "@/components/ui/SectionHeading";
import { directionsLink, fullAddress, site, whatsappLink } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact and Visit",
  description: `Visit ${site.name} at ${fullAddress()}. Opening hours, map, phone, WhatsApp and a contact form.`,
};

export default function ContactPage() {
  const channels = [
    { label: "Call", value: site.phone.display, href: site.phone.href, Icon: PhoneIcon, external: false },
    { label: "WhatsApp", value: site.whatsapp.display, href: whatsappLink("Hello AHS Jewellers,"), Icon: WhatsAppIcon, external: true },
    { label: "Email", value: site.email, href: `mailto:${site.email}`, Icon: MailIcon, external: false },
  ];

  return (
    <>
      {/* Opening + channels */}
      <section className="bg-white hero-y">
        <div className="shell">
          <p className="eyebrow flex items-center gap-4 text-gold-deep">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            Contact and visit
          </p>
          <RevealText as="h1" immediate delay={0.2} className="mt-6 max-w-narrow display-page text-ink">
            We are
            <br />
            <em className="text-gold-deep">easy to reach</em>
          </RevealText>
          <p className="mt-6 lede text-ink-soft">Call, send a WhatsApp, or write to us. Someone from the family reads every message.</p>

          <ul className="mt-14 grid border-t border-line md:grid-cols-3">
            {channels.map(({ label, value, href, Icon, external }, i) => (
              <li key={label} className={`border-b border-line ${i < 2 ? "md:border-r" : ""}`}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-center gap-5 py-6 md:px-8 md:py-10 md:first:pl-0"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-line-strong text-gold-deep transition-colors duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-white">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block eyebrow text-stone">{label}</span>
                    <span className="mt-1 block break-all font-serif text-2xl text-ink md:break-normal">{value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Address, hours, map */}
      <section aria-labelledby="find-title" className="bg-ivory section-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <SectionHeading id="find-title" eyebrow="Find us" title="The showroom" size="md" />
            <address className="mt-8 not-italic text-ink-soft">
              {site.address.line1}
              <br />
              {site.address.line2}, {site.address.city} {site.address.pin}
              <br />
              {site.address.state}
            </address>
            <dl className="mt-8 flex flex-col gap-2 border-t border-line-strong pt-6 text-sm">
              {site.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-4">
                  <dt className="text-stone">{h.days}</dt>
                  <dd className="text-ink figures">{h.time}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-stone">{site.hoursNote}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button href={directionsLink()} external variant="secondary" magnetic={false}>
                Get directions
              </Button>
              <Button href="/book-a-visit" arrow>
                Book a Visit
              </Button>
            </div>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <MapEmbed className="aspect-square md:aspect-landscape" />
          </div>
        </div>
      </section>

      {/* Form */}
      <section aria-labelledby="write-title" className="bg-white section-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <SectionHeading
              id="write-title"
              eyebrow="Write to us"
              title="Send a message"
              size="md"
              intro="Questions about a piece, a custom commission or old gold. We reply the same day if you write before 6 pm."
            />
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <ContactForm />
          </div>
        </div>
      </section>

      <div className="border-t border-line">
        <Showroom compact />
      </div>
    </>
  );
}
