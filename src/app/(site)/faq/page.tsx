import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import Accordion from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";
import { commerceTerms, digitalGoldTerms, exchangeTerms, schemeTerms, site, whatsappLink } from "@/data/site";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Questions",
  description: `Plain answers about pricing, making charges, hallmarking, exchange, online orders, the savings scheme and repairs at ${site.name}.`,
};

const pct = (n: number) => `${Math.round(n * 100)}%`;

const GROUPS: { id: string; title: string; items: { q: string; a: string }[] }[] = [
  {
    id: "pricing",
    title: "Pricing",
    items: [
      {
        q: "How is the price of a piece worked out?",
        a: "Gold weight × today’s rate for its purity, plus the making charge, plus any stones, plus 3% GST. Every one of those figures is shown on the piece’s page and written on your bill.",
      },
      {
        q: "Why does the price change from day to day?",
        a: "Because the gold rate does. We publish the rate each morning at 10:30 am, and prices on the site follow it straight away.",
      },
      {
        q: "What is the making charge?",
        a: "The cost of the craft: design, casting, setting and finishing. It is a percentage of the gold value, shown for each piece, and lower on plain pieces than on hand-set bridal work.",
      },
    ],
  },
  {
    id: "purity",
    title: "Purity and hallmarking",
    items: [
      { q: "Is all your gold hallmarked?", a: site.hallmark.long },
      {
        q: "Can you test gold I already own?",
        a: "Yes, free of charge and whether or not you bought it here. The test is non-destructive and you see the reading yourself.",
      },
    ],
  },
  {
    id: "exchange",
    title: "Exchange and buyback",
    items: [
      {
        q: "How much do you pay for old gold?",
        a: `For pieces bought from us, ${pct(exchangeTerms.ours.exchange)} of the gold value towards new jewellery, or ${pct(exchangeTerms.ours.buyback)} paid to your bank. For gold bought elsewhere, ${pct(exchangeTerms.other.exchange)} and ${pct(exchangeTerms.other.buyback)}. All at today’s rate for the tested purity. (Sample terms.)`,
      },
      { q: "Do I need the original bill?", a: "It helps, but it is not needed. We do need a photo ID, as the law requires." },
    ],
  },
  {
    id: "online",
    title: "Buying online",
    items: [
      {
        q: "What can I buy on the site?",
        a: "Gold coins and bars, and selected lighter pieces marked “Available online”. Bridal, diamond and heavier pieces are best seen in person, so for those we keep a piece ready when you book a visit.",
      },
      {
        q: "How is it delivered?",
        a: `Fully insured, and handed over only against a signature and photo ID. Delivery is free from ${formatINR(commerceTerms.freeDeliveryFrom)}, or ${formatINR(commerceTerms.insuredDeliveryFee)} below that. You can also collect from the showroom at no charge; we hold it for ${commerceTerms.pickupHoldDays} days.`,
      },
      {
        q: "Is the price fixed when I order?",
        a: "Yes. The price is set at today’s rate the moment you pay, whatever the rate does afterwards.",
      },
      { q: "How do I follow my order?", a: "From the link in your confirmation, from your account, or on the Track an Order page with your order number and mobile number." },
    ],
  },
  {
    id: "saving",
    title: "Savings scheme and digital gold",
    items: [
      {
        q: "How does the savings scheme work?",
        a: `You pay a fixed amount each month for ${schemeTerms.instalments} months, from ${formatINR(schemeTerms.minMonthly)}. We add the ${schemeTerms.redeemMonth}th month, and you choose jewellery to the full value. (Sample terms.)`,
      },
      {
        q: "What is digital gold?",
        a: `24K gold bought online in any amount from ${formatINR(digitalGoldTerms.minRupees)}, held in your name by a licensed vault partner. Turn it into jewellery at the showroom whenever you like.`,
      },
    ],
  },
  {
    id: "service",
    title: "Repairs, resizing and care",
    items: [
      { q: "Do you resize rings and bangles?", a: "Yes, usually within a week. Most rings can go up or down two sizes; we tell you before we start if a piece cannot." },
      { q: "Will you clean my jewellery?", a: "Anything bought here we clean and polish free, for life, usually while you wait." },
      { q: "Can you repair pieces bought elsewhere?", a: "Often, yes. Bring it in and we will look at it with you and quote before any work begins." },
    ],
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GROUPS.flatMap((g) => g.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } }))),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        eyebrow="Questions"
        title={
          <>
            Questions we are <em className="text-gold-deep">often asked</em>
          </>
        }
        intro={<p>About pricing, purity, exchange, buying online and the savings scheme. Plain answers, kept short.</p>}
        image="giftStuds"
      />

      <section className="bg-white pb-20 md:pb-32" aria-label="Questions and answers">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
          <nav aria-label="Topics" className="min-w-0 lg:col-span-3">
            <ul className="no-scrollbar flex gap-6 overflow-x-auto border-b border-line pb-4 lg:sticky lg:top-32 lg:flex-col lg:gap-3 lg:border-b-0 lg:pb-0">
              {GROUPS.map((g) => (
                <li key={g.id} className="shrink-0">
                  <a href={`#${g.id}`} data-transition="off" className="link-draw eyebrow text-stone hover:text-ink">
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col gap-16 lg:col-span-8 lg:col-start-5">
            {GROUPS.map((g) => (
              <section key={g.id} id={g.id} className="scroll-mt-32" aria-labelledby={`${g.id}-title`}>
                <h2 id={`${g.id}-title`} className="font-serif text-3xl font-light text-ink">
                  {g.title}
                </h2>
                <Accordion className="mt-6" items={g.items.map((i) => ({ title: i.q, content: <p>{i.a}</p> }))} />
              </section>
            ))}
            <div className="border border-line bg-ivory p-6 md:p-8">
              <p className="font-serif text-2xl text-ink">Something we have not answered?</p>
              <div className="mt-6 flex flex-wrap items-center gap-8">
                <Button href={whatsappLink(`Hello ${site.name}, I have a question.`)} external arrow>
                  Ask on WhatsApp
                </Button>
                <TextLink href="/contact">Other ways to reach us</TextLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
