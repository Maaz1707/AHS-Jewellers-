import type { Metadata } from "next";
import Link from "next/link";
import BuyGold from "@/components/gold/BuyGold";
import Accordion from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import RevealImage from "@/components/ui/RevealImage";
import RevealText from "@/components/ui/RevealText";
import { DemoTag } from "@/components/ui/Tags";
import TextLink from "@/components/ui/TextLink";
import { digitalGoldTerms, site, whatsappLink } from "@/data/site";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Digital Gold",
  description: `Buy 24K gold from ${formatINR(digitalGoldTerms.minRupees)} at today’s rate, held in your name, and turn it into jewellery at the ${site.name} showroom whenever you like.`,
};

const STEPS = [
  {
    title: `Buy from ${formatINR(digitalGoldTerms.minRupees)}`,
    body: "Any amount, any day, at the morning’s 24K rate. Buy in rupees or by the gram; 3% GST is shown before you pay, and nothing else is added.",
  },
  {
    title: "Held in your name",
    body: `Every gram is ${digitalGoldTerms.fineness} gold, stored and insured in a vault run by a licensed vault partner. Your balance is in your member area, to four decimal places.`,
  },
  {
    title: "Wear it when you are ready",
    body: "Come to the showroom and choose a coin or a piece of jewellery. Your gold counts at the day’s rate against it, and you pay only the making charge and any difference.",
  },
];

const FAQS = [
  {
    title: "Is it real gold?",
    content: `Yes. Each purchase is matched by physical ${digitalGoldTerms.fineness} gold held by a licensed vault partner, in your name. It is not a fund or a promise of gold later.`,
  },
  {
    title: "Who looks after the gold?",
    content:
      "A licensed vault partner stores and insures it. We will publish the partner’s name and licence details on this page before digital gold goes live.",
  },
  {
    title: "How do I turn it into jewellery?",
    content: `Book a visit, or simply come in. Choose any piece or coin; your balance is valued at the day’s rate and set against the price. The smallest balance we can redeem is ${digitalGoldTerms.minRedeemGrams} g.`,
  },
  {
    title: "Can I sell it back?",
    content: "Yes, at the counter, at the day’s buy-back rate, paid to your bank account. (Sample terms for the prototype.)",
  },
  {
    title: "Why is my balance worth a little less than I paid?",
    content: "The 3% GST you pay on each purchase is not part of the gold’s value. As the rate moves, your balance moves with it.",
  },
  {
    title: "Is there a limit?",
    content: `Online, ${formatINR(digitalGoldTerms.minRupees)} to ${formatINR(digitalGoldTerms.maxRupees)} a day. For larger amounts we will help you at the showroom.`,
  },
];

export default function DigitalGoldPage() {
  return (
    <>
      <section className="bg-white hero-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <div className="flex flex-wrap items-center gap-4">
              <p className="eyebrow flex items-center gap-4 text-gold-deep">
                <span aria-hidden="true" className="h-px w-8 bg-gold" />
                Digital gold
              </p>
              <DemoTag />
            </div>
            <RevealText as="h1" immediate delay={0.2} className="mt-6 display-page text-ink">
              Gold by the gram,
              <br />
              <em className="text-gold-deep">from {formatINR(digitalGoldTerms.minRupees)}</em>
            </RevealText>
            <p className="mt-6 lede text-ink-soft">
              Put a little into gold whenever you like. It is held safely in your name, and when the moment comes, a wedding,
              a birthday, a Dhanteras, you turn it into jewellery at our counter.
            </p>
            <div className="mt-12 hidden lg:block">
              <RevealImage image="giftCoinStack" immediate priority sizes="40vw" className="aspect-landscape" />
            </div>
          </div>
          <div id="buy" className="min-w-0 scroll-mt-32 lg:col-span-5 lg:col-start-8">
            <div className="border border-line bg-white p-6 shadow-soft md:p-8">
              <BuyGold />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory section-y" aria-labelledby="how-title">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <p className="eyebrow flex items-center gap-4 text-gold-deep">
                <span aria-hidden="true" className="h-px w-8 bg-gold" />
                How it works
              </p>
              <RevealText as="h2" id="how-title" className="mt-6 display-section text-ink">
                A savings habit that ends in something you wear
              </RevealText>
              <div className="mt-10">
                <RevealImage image="giftBar" sizes="(min-width: 1024px) 36vw, 100vw" className="aspect-portrait" />
              </div>
            </div>
          </div>
          <ol className="lg:col-span-6 lg:col-start-7">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t border-line-strong py-10 first:pt-0 first:border-t-0 md:py-14">
                <p className="font-serif text-6xl font-light text-gold-deep">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 font-serif text-3xl font-light text-ink">{s.title}</h3>
                <p className="mt-4 max-w-prose text-ink-soft">{s.body}</p>
              </li>
            ))}
            <li className="border-t border-line-strong pt-10 md:pt-14">
              <p className="max-w-prose text-ink-soft">
                Prefer a fixed amount each month with a bonus at the end? The{" "}
                <Link href="/savings-scheme" className="link-line text-ink">
                  savings scheme
                </Link>{" "}
                may suit you better.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section className="bg-white section-y" aria-labelledby="faq-title">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <p className="eyebrow flex items-center gap-4 text-gold-deep">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              Questions
            </p>
            <h2 id="faq-title" className="mt-6 display-section text-ink">
              Before you buy
            </h2>
            <div className="mt-10 flex flex-col items-start gap-6">
              <Button href="/account#gold" variant="secondary" magnetic={false}>
                See my gold wallet
              </Button>
              <TextLink href={whatsappLink(`Hello ${site.name}, I have a question about digital gold.`)} external>
                Ask on WhatsApp
              </TextLink>
            </div>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <Accordion items={FAQS} defaultOpen={0} />
            <p className="mt-8 text-xs text-stone">
              Digital gold on this prototype is a demonstration. No money is taken and no gold is bought; the vault partner will
              be named before launch.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
