"use client";

import { directionsLink, fullAddress, site, whatsappLink } from "@/data/site";
import Button from "../ui/Button";
import MapEmbed from "../ui/MapEmbed";
import { ClockIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "../ui/Icons";
import SectionHeading from "../ui/SectionHeading";
import TextLink from "../ui/TextLink";

export default function VisitCTA() {
  return (
    <section aria-labelledby="visit-title" className="bg-ivory section-y">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <SectionHeading
            id="visit-title"
            eyebrow="Visit us"
            title={
              <>
                Come and see it
                <br />
                in the light
              </>
            }
            intro="Gold is chosen in the hand. Drop in, or book a time and we will have pieces ready, with tea."
          />

          <dl className="mt-12 flex flex-col border-t border-line-strong">
            <div className="flex gap-5 border-b border-line-strong py-5">
              <dt>
                <PinIcon className="size-5 text-gold-deep" />
                <span className="sr-only">Address</span>
              </dt>
              <dd className="text-ink-soft">
                <address className="not-italic">{fullAddress()}</address>
              </dd>
            </div>
            <div className="flex gap-5 border-b border-line-strong py-5">
              <dt>
                <ClockIcon className="size-5 text-gold-deep" />
                <span className="sr-only">Opening hours</span>
              </dt>
              <dd className="flex-1 text-ink-soft">
                <ul className="flex flex-col gap-1">
                  {site.hours.map((h) => (
                    <li key={h.days} className="flex flex-wrap justify-between gap-x-6">
                      <span>{h.days}</span>
                      <span className="text-ink figures">{h.time}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-stone">{site.hoursNote}</p>
              </dd>
            </div>
            <div className="flex gap-5 border-b border-line-strong py-5">
              <dt>
                <PhoneIcon className="size-5 text-gold-deep" />
                <span className="sr-only">Phone and WhatsApp</span>
              </dt>
              <dd className="flex flex-wrap gap-x-8 gap-y-2 text-ink">
                <a href={site.phone.href} className="link-draw">
                  {site.phone.display}
                </a>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                  <WhatsAppIcon className="size-4 text-gold-deep" />
                  <span className="link-draw">WhatsApp us</span>
                </a>
              </dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-wrap items-center gap-8">
            <Button href="/book-a-visit" size="lg" arrow>
              Book a Visit
            </Button>
            <TextLink href={directionsLink()} external>
              Get directions
            </TextLink>
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <MapEmbed className="aspect-square md:aspect-landscape lg:aspect-auto lg:h-full" />
        </div>
      </div>
    </section>
  );
}
