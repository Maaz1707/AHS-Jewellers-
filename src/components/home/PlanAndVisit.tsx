"use client";

import { useId, useState } from "react";
import { directionsLink, fullAddress, site, whatsappLink } from "@/data/site";
import { formatINR } from "@/lib/format";
import { SCHEME, schemeMaturity } from "@/store/scheme";
import Button from "../ui/Button";
import { ClockIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "../ui/Icons";
import MapEmbed from "../ui/MapEmbed";
import TextLink from "../ui/TextLink";

const PRESETS = [2000, 5000, 10000, 25000];

/** Label and heading. Not split into lines: on phones one half starts hidden, and a hidden heading cannot be measured. */
function Heading({ id, eyebrow, children }: { id: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <>
      <p className="eyebrow flex items-center gap-4 text-gold-deep">
        <span aria-hidden="true" className="h-px w-8 bg-gold" />
        {eyebrow}
      </p>
      <h2 id={id} className="mt-6 font-serif text-3xl font-light tracking-tight text-ink md:text-4xl">
        {children}
      </h2>
    </>
  );
}

/**
 * The close of the home page in one screen: the savings scheme calculator on
 * one side, how to find and visit the showroom on the other. Below desktop
 * width the two halves share the space and a pair of chips switches between them.
 */
export default function PlanAndVisit() {
  const [monthly, setMonthly] = useState(5000);
  // Phones and tablets show one half at a time; desktop shows both side by side.
  const [view, setView] = useState<"save" | "visit">("save");
  const id = useId();
  const { paid, bonus, total } = schemeMaturity(monthly);
  const pct = ((monthly - SCHEME.minMonthly) / (SCHEME.maxMonthly - SCHEME.minMonthly)) * 100;

  return (
    <section aria-label="Save and visit" className="bg-ivory screen-fit">
      <div className="shell grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div role="group" aria-label="Show" className="grid grid-cols-2 gap-2 lg:hidden">
          <button type="button" onClick={() => setView("save")} aria-pressed={view === "save"} className="chip">
            Savings scheme
          </button>
          <button type="button" onClick={() => setView("visit")} aria-pressed={view === "visit"} className="chip">
            Visit us
          </button>
        </div>

        {/* The savings scheme */}
        <div aria-labelledby="scheme-title" role="region" className={`${view === "save" ? "rise-in" : "hidden"} lg:col-span-6 lg:block lg:pr-6`}>
          <Heading id="scheme-title" eyebrow="Gold savings scheme · 11 + 1 months">
            Eleven months. <em className="text-gold-deep">The twelfth is ours.</em>
          </Heading>
          <p className="mt-4 max-w-prose text-sm text-stone md:text-base">
            Put aside a fixed amount each month. After eleven instalments we add one more, and you choose jewellery to the
            full value at the day’s rate.
          </p>

          <div className="mt-6 border border-line-strong bg-white p-5 md:p-8">
            <div className="flex items-baseline justify-between gap-4">
              <label htmlFor={id} className="eyebrow text-stone">
                Monthly instalment
              </label>
              <output htmlFor={id} className="font-serif text-3xl text-ink figures">
                {formatINR(monthly)}
              </output>
            </div>
            <input
              id={id}
              type="range"
              min={SCHEME.minMonthly}
              max={SCHEME.maxMonthly}
              step={SCHEME.step}
              value={monthly}
              onChange={(e) => setMonthly(Number(e.target.value))}
              aria-valuetext={`${formatINR(monthly)} a month`}
              className="range mt-4 w-full"
              style={{ "--fill": `${pct}%` } as React.CSSProperties}
            />
            <div className="mt-3 grid grid-cols-4 gap-2">
              {PRESETS.map((p) => (
                <button key={p} type="button" onClick={() => setMonthly(p)} aria-pressed={monthly === p} className="chip">
                  {formatINR(p)}
                </button>
              ))}
            </div>
            <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5">
              <div>
                <dt className="text-xs text-stone">You pay, 11 months</dt>
                <dd className="mt-1 font-serif text-xl text-ink figures md:text-2xl">{formatINR(paid)}</dd>
              </div>
              <div>
                <dt className="text-xs text-stone">We add</dt>
                <dd className="mt-1 font-serif text-xl text-gold-deep figures md:text-2xl">+ {formatINR(bonus)}</dd>
              </div>
              <div>
                <dt className="text-xs text-stone">Yours to choose</dt>
                <dd className="mt-1 font-serif text-xl text-ink figures md:text-2xl">{formatINR(total)}</dd>
              </div>
            </dl>
          </div>
          <div className="mt-6">
            <Button href="/savings-scheme" variant="secondary" arrow>
              See the full scheme
            </Button>
          </div>
        </div>

        {/* The visit */}
        <div aria-labelledby="visit-title" role="region" className={`${view === "visit" ? "rise-in" : "hidden"} lg:col-span-6 lg:block lg:border-l lg:border-line-strong lg:pl-10`}>
          <Heading id="visit-title" eyebrow="Visit us">
            Come and see it
            <br />
            in the light
          </Heading>
          <p className="mt-4 max-w-prose text-sm text-stone md:text-base">
            Gold is chosen in the hand. Drop in, or book a time and we will have pieces ready, with tea.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <dl className="flex flex-col border-t border-line-strong text-sm">
              <div className="flex gap-4 border-b border-line-strong py-3">
                <dt>
                  <PinIcon className="size-5 text-gold-deep" />
                  <span className="sr-only">Address</span>
                </dt>
                <dd className="text-ink-soft">
                  <address className="not-italic">{fullAddress()}</address>
                </dd>
              </div>
              <div className="flex gap-4 border-b border-line-strong py-3">
                <dt>
                  <ClockIcon className="size-5 text-gold-deep" />
                  <span className="sr-only">Opening hours</span>
                </dt>
                <dd className="flex-1 text-ink-soft">
                  <ul className="flex flex-col gap-1">
                    {site.hours.map((h) => (
                      <li key={h.days} className="flex flex-wrap justify-between gap-x-4">
                        <span>{h.days}</span>
                        <span className="text-ink figures">{h.time}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1 text-xs text-stone">{site.hoursNote}</p>
                </dd>
              </div>
              <div className="flex gap-4 border-b border-line-strong py-3">
                <dt>
                  <PhoneIcon className="size-5 text-gold-deep" />
                  <span className="sr-only">Phone and WhatsApp</span>
                </dt>
                <dd className="flex flex-wrap gap-x-6 gap-y-1 text-ink">
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
            <MapEmbed className="aspect-wide md:aspect-auto md:min-h-64" />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-8">
            <Button href="/book-a-visit" size="lg" arrow>
              Book a Visit
            </Button>
            <TextLink href={directionsLink()} external>
              Get directions
            </TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}
