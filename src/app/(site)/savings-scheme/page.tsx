import type { Metadata } from "next";
import SchemeExperience from "@/components/scheme/SchemeExperience";
import Button from "@/components/ui/Button";
import RevealImage from "@/components/ui/RevealImage";
import RevealText from "@/components/ui/RevealText";
import TextLink from "@/components/ui/TextLink";
import { schemeTerms } from "@/data/site";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Gold Savings Scheme",
  description: `Pay a fixed amount for ${schemeTerms.instalments} months and we add the ${schemeTerms.redeemMonth}th. Redeem the full value in jewellery.`,
};

const TERMS = [
  { value: formatINR(schemeTerms.minMonthly), label: "a month, to start" },
  { value: String(schemeTerms.instalments), label: "monthly instalments" },
  { value: `${schemeTerms.bonusInstalments} month`, label: "added by us" },
  { value: `Month ${schemeTerms.redeemMonth}`, label: "redeem in jewellery" },
];

export default function SavingsSchemePage() {
  return (
    <>
      <section className="bg-white hero-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-6">
            <p className="eyebrow flex items-center gap-4 text-gold-deep">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              {schemeTerms.name}
            </p>
            <RevealText as="h1" immediate delay={0.2} className="mt-6 display-page text-ink">
              Eleven months.
              <br />
              <em className="text-gold-deep">The twelfth is ours.</em>
            </RevealText>
            <p className="mt-6 lede text-ink-soft">
              Set aside a fixed amount each month. After eleven instalments we add one more, and in the twelfth month you
              choose jewellery to the full value. It is how many families here have bought their wedding gold, a little at
              a time.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-8">
              <Button href="#enrol" arrow data-transition="off">
                Enrol now
              </Button>
              <TextLink href="#calculator">Work out your amount</TextLink>
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <RevealImage image="brideHands" immediate priority sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-portrait" />
          </div>
        </div>
        <dl className="shell mt-16 grid grid-cols-2 border-t border-line md:mt-24 md:grid-cols-4">
          {TERMS.map((t, i) => (
            <div key={t.label} className={`border-b border-line py-6 md:border-b-0 md:py-8 ${i % 2 === 0 ? "pr-4" : "pl-4 md:pl-0"} md:pr-8`}>
              <dt className="sr-only">{t.label}</dt>
              <dd>
                <span className="block font-serif text-4xl font-light text-ink">{t.value}</span>
                <span className="mt-1 block text-sm text-stone">{t.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <SchemeExperience />
    </>
  );
}
