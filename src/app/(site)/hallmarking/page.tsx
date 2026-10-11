import type { Metadata } from "next";
import HallmarkVisual from "@/components/story/HallmarkVisual";
import Accordion from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import RevealImage from "@/components/ui/RevealImage";
import RevealText from "@/components/ui/RevealText";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { site } from "@/data/site";
import NextStep from "@/components/sections/NextStep";

export const metadata: Metadata = {
  title: "Hallmarking and Purity",
  description: "What the BIS hallmark and HUID on your gold mean, and how to check them yourself, in plain language.",
};

const PURITY = [
  { karat: "24K", fineness: "999", pct: 99.9, use: "Coins and bars. Too soft for most jewellery." },
  { karat: "22K", fineness: "916", pct: 91.6, use: "Most Indian gold jewellery, bridal and classic." },
  { karat: "20K", fineness: "833", pct: 83.3, use: "Some traditional pieces." },
  { karat: "18K", fineness: "750", pct: 75.0, use: "Diamond and fine jewellery. Holds stones securely." },
  { karat: "14K", fineness: "585", pct: 58.5, use: "Light, hard-wearing everyday pieces." },
];

const STEPS = [
  { title: "Find the HUID", body: "Look for the six-character code beside the BIS triangle, usually on the clasp or inside a bangle. A loupe helps; we lend one at the counter." },
  { title: "Open BIS CARE", body: "Install the free BIS CARE app from the Play Store or App Store and choose ‘Verify HUID’." },
  { title: "Enter the code", body: "The app shows the piece’s purity, the type of article, the jeweller’s registration and the centre that hallmarked it." },
];

export default function HallmarkingPage() {
  return (
    <>
      {/* Opening */}
      <section className="bg-white hero-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="eyebrow flex items-center gap-4 text-gold-deep">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              Hallmarking and purity
            </p>
            <RevealText as="h1" immediate delay={0.2} className="mt-6 display-page text-ink">
              What the hallmark <em className="text-gold-deep">tells you</em>
            </RevealText>
            <p className="mt-6 lede text-ink-soft">
              Three small marks, struck into every piece of hallmarked gold in India, tell you how pure it is and let you
              check it yourself. Here is how to read them.
            </p>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <RevealImage image="dailyCoinPendant" immediate priority sizes="(min-width: 1024px) 30vw, 100vw" className="aspect-portrait" />
          </div>
        </div>
      </section>

      {/* The three marks */}
      <section aria-labelledby="marks-title" className="bg-ivory section-y">
        <div className="shell">
          <SectionHeading
            id="marks-title"
            eyebrow="The three marks"
            title="Read it left to right"
            intro="Since 2021, gold jewellery in India carries three marks. Older pieces may also show a year letter and the jeweller’s mark; those are still valid."
          />
          <div className="mt-16">
            <HallmarkVisual />
          </div>
        </div>
      </section>

      {/* Purity table */}
      <section aria-labelledby="purity-title" className="bg-white section-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
          <SectionHeading
            id="purity-title"
            className="lg:col-span-4"
            eyebrow="Karat and fineness"
            title="How pure is pure?"
            size="md"
            intro="Pure gold is too soft to hold a shape, so it is alloyed with silver and copper. The karat tells you how much gold remains."
          />
          <div className="lg:col-span-7 lg:col-start-6">
            <table className="w-full text-left">
              <caption className="sr-only">Gold purity grades with fineness, percentage of pure gold and typical use</caption>
              <thead>
                <tr className="border-b border-line-strong eyebrow text-stone">
                  <th scope="col" className="pb-3 font-medium">Grade</th>
                  <th scope="col" className="pb-3 font-medium">Pure gold</th>
                  <th scope="col" className="hidden pb-3 font-medium md:table-cell">Used for</th>
                </tr>
              </thead>
              <tbody>
                {PURITY.map((p) => (
                  <tr key={p.karat} className="border-b border-line align-top">
                    <th scope="row" className="py-5 pr-6 font-normal">
                      <span className="block font-serif text-3xl text-ink">{p.karat}</span>
                      <span className="text-xs tracking-wide text-stone">
                        {p.karat}
                        {p.fineness}
                      </span>
                    </th>
                    <td className="w-1/2 py-5 pr-6">
                      <span className="block text-sm text-ink figures">{p.pct.toFixed(1)}%</span>
                      <span aria-hidden="true" className="mt-2 block h-1 w-full bg-line">
                        <span className="block h-full bg-gold" style={{ width: `${p.pct}%` }} />
                      </span>
                      <span className="mt-2 block text-xs text-stone md:hidden">{p.use}</span>
                    </td>
                    <td className="hidden py-5 text-sm text-ink-soft md:table-cell">{p.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-xs text-stone">We sell 24K coins and bars, 22K jewellery and 18K diamond jewellery.</p>
          </div>
        </div>
      </section>

      {/* Verify */}
      <section aria-labelledby="verify-title" className="bg-ivory section-y">
        <div className="shell">
          <SectionHeading id="verify-title" eyebrow="Check it yourself" title="Verify any piece in three steps" />
          <ol className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t border-gold pt-6">
                <span className="font-serif text-5xl font-light text-gold-deep figures">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-serif text-2xl text-ink">{s.title}</h3>
                <p className="mt-3 text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Our promise + questions */}
      <section aria-labelledby="promise-title" className="bg-white section-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <SectionHeading id="promise-title" eyebrow="Our promise" title="Every piece, its own number" size="md" />
            <p className="mt-6 text-ink-soft">{site.hallmark.long}</p>
            <p className="mt-4 text-ink-soft">
              Bring in any gold, bought here or elsewhere, and we will test its purity on the counter in front of you, free
              of charge.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-8">
              <Button href="/book-a-visit" arrow>
                Book a purity test
              </Button>
              <TextLink href="/gold-rate">Today’s rate</TextLink>
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Accordion
              items={[
                {
                  title: "Is hallmarking compulsory?",
                  content:
                    "Yes, for gold jewellery and artefacts sold by registered jewellers in most districts of India, including Jaipur. A small exemption exists for very light pieces under 2 grams.",
                },
                {
                  title: "Does the hallmark guarantee the weight?",
                  content:
                    "No. The hallmark certifies purity only. Weight is shown on your bill and checked on a calibrated scale in front of you.",
                },
                {
                  title: "My old jewellery has no HUID. Is it still good?",
                  content:
                    "Older hallmarks without HUID remain valid. Unhallmarked pieces can still be tested, and exchanged at the purity the test shows.",
                },
                {
                  title: "Is 24K jewellery a better buy?",
                  content:
                    "Rarely. 24K gold scratches and bends easily, so jewellery is made in 22K or 18K. For investment, 24K coins and bars are the better choice.",
                },
              ]}
            />
          </div>
        </div>
      </section>
      <NextStep
        eyebrow="See it for yourself"
        title="Bring any piece and we will read its hallmark with you."
        action={{ label: "Book a visit", href: "/book-a-visit" }}
        alternative={{ label: "Today’s gold rate", href: "/gold-rate" }}
      />
    </>
  );
}
