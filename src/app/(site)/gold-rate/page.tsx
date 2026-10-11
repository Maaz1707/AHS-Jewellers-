import type { Metadata } from "next";
import PriceCalculator from "@/components/gold/PriceCalculator";
import RateBoard from "@/components/gold/RateBoard";
import RateChart from "@/components/gold/RateChart";
import Button from "@/components/ui/Button";
import RevealText from "@/components/ui/RevealText";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Today’s Gold Rate in Jaipur",
  description: "Today’s 24K, 22K, 18K gold and silver rates per gram and per 10 grams at AHS Jewellers, with a 30-day trend and price calculator.",
};

const HOW = [
  {
    title: "The world price",
    body: "Gold is traded internationally in US dollars per ounce. Overnight movements in London and New York set the starting point each morning.",
  },
  {
    title: "The rupee",
    body: "That price is converted at the day’s dollar-rupee rate. A weaker rupee makes gold dearer in India even when the world price is flat.",
  },
  {
    title: "Duties and taxes",
    body: "Import duty is added to the landed cost. GST at 3% is charged on the final bill, and shown separately on ours.",
  },
  {
    title: "The local market",
    body: "Bullion dealers publish an opening rate each morning. We set ours from it at 10:30 am and hold it for the day unless the market moves sharply.",
  },
];

export default function GoldRatePage() {
  return (
    <>
      <section className="bg-white hero-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="eyebrow flex items-center gap-4 text-gold-deep">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              Today’s rate · {site.address.city}
            </p>
            <RevealText as="h1" immediate delay={0.2} className="mt-6 display-page text-ink">
              Today’s gold rate
            </RevealText>
            <p className="mt-6 lede text-ink-soft">
              Set at 10:30 every morning and written on the board by our door. These are the rates we buy and sell at
              today.
            </p>
            <div className="mt-10 hidden lg:block">
              <TextLink href="#calculator">Work out a price</TextLink>
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <RateBoard />
          </div>
        </div>
      </section>

      <section aria-labelledby="trend-title" className="bg-ivory section-y">
        <div className="shell">
          <SectionHeading id="trend-title" eyebrow="The last 30 days" title="How the rate has moved" size="md" />
          <div className="mt-12 border border-line bg-white p-5 md:p-10">
            <RateChart />
          </div>
        </div>
      </section>

      <section id="calculator" aria-labelledby="calc-title" className="scroll-mt-28 bg-white section-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
          <SectionHeading
            id="calc-title"
            className="lg:col-span-4"
            eyebrow="Price calculator"
            title="What would it cost?"
            size="md"
            intro="Enter a weight, choose a purity and a making charge. The figure moves with today’s rate."
          />
          <div className="lg:col-span-8">
            <PriceCalculator />
          </div>
        </div>
      </section>

      <section aria-labelledby="how-title" className="bg-ivory section-y">
        <div className="shell">
          <SectionHeading id="how-title" eyebrow="How the rate is set" title="Four things move the price of gold" />
          <ol className="mt-14 grid gap-10 md:grid-cols-2 md:gap-x-16 lg:grid-cols-4 lg:gap-8">
            {HOW.map((h, i) => (
              <li key={h.title} className="border-t border-gold pt-6">
                <span className="font-serif text-4xl font-light text-gold-deep figures">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-serif text-2xl text-ink">{h.title}</h3>
                <p className="mt-3 text-sm text-ink-soft">{h.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-16 flex flex-col items-start gap-6 border-t border-line-strong pt-10 md:flex-row md:items-center md:justify-between">
            <p className="max-w-prose font-serif text-2xl font-light text-ink">
              Ask for the rate any time we are open, on the phone or on WhatsApp.
            </p>
            <div className="flex flex-wrap items-center gap-8">
              <TextLink href="/hallmarking">Purity explained</TextLink>
              <Button href="/book-a-visit" arrow>
                Book a Visit
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
