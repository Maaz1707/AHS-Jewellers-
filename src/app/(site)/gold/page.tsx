import type { Metadata } from "next";
import Link from "next/link";
import RateStrip from "@/components/home/RateStrip";
import PageHero from "@/components/sections/PageHero";
import Button from "@/components/ui/Button";
import RevealImage from "@/components/ui/RevealImage";
import TextLink from "@/components/ui/TextLink";
import type { ImageKey } from "@/data/media";
import { digitalGoldTerms, schemeTerms, site } from "@/data/site";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Gold",
  description: `Today’s gold rate, coins and bars, the savings scheme, digital gold and old gold exchange at ${site.name}, ${site.address.city}.`,
};

const WAYS: { eyebrow: string; title: string; body: string; href: string; cta: string; image: ImageKey }[] = [
  {
    eyebrow: "Coins and bars",
    title: "24K, sealed and certified",
    body: "Lakshmi coins and minted bars in 999.9 gold, sold at the day’s rate with a small minting charge. Bought online, they are sent insured.",
    href: "/category/coins",
    cta: "See coins and bars",
    image: "giftCoins",
  },
  {
    eyebrow: "Savings scheme",
    title: "Eleven months, the twelfth from us",
    body: `From ${formatINR(schemeTerms.minMonthly)} a month. After ${schemeTerms.instalments} instalments we add one more, and you choose jewellery to the full value.`,
    href: "/savings-scheme",
    cta: "Work out your amount",
    image: "brideHands",
  },
  {
    eyebrow: "Digital gold",
    title: `By the gram, from ${formatINR(digitalGoldTerms.minRupees)}`,
    body: "24K gold held in your name by a licensed vault partner. Add to it whenever you like, and turn it into jewellery at our counter.",
    href: "/digital-gold",
    cta: "Buy digital gold",
    image: "giftCoinStack",
  },
  {
    eyebrow: "Old gold exchange",
    title: "Tested in front of you",
    body: "Bring old jewellery in any condition. We test its purity while you watch and value it at today’s rate, to exchange for something new.",
    href: "/exchange",
    cta: "Estimate its value",
    image: "banglesAssorted",
  },
];

export default function GoldPage() {
  return (
    <>
      <PageHero
        eyebrow="Gold"
        title={
          <>
            Gold, <em className="text-gold-deep">plainly priced</em>
          </>
        }
        intro={
          <p>
            The morning’s rate, published at the door and on this site. Weight, making charge and GST written out before you
            decide. And four ways to put gold aside, whatever the amount.
          </p>
        }
        image="giftBar"
      >
        <Button href="/gold-rate" arrow>
          Today’s rate
        </Button>
        <TextLink href="/hallmarking">How to read a hallmark</TextLink>
      </PageHero>

      <RateStrip />

      <section className="bg-white section-y" aria-label="Ways to buy gold">
        <div className="shell flex flex-col gap-20 md:gap-32">
          {WAYS.map((w, i) => (
            <article key={w.href} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-10">
              <div className={`lg:col-span-6 ${i % 2 ? "lg:order-2 lg:col-start-7" : ""}`}>
                <Link href={w.href} className="group block" tabIndex={-1} aria-hidden="true">
                  <RevealImage image={w.image} sizes="(min-width: 1024px) 48vw, 100vw" className="aspect-landscape" hoverZoom />
                </Link>
              </div>
              <div className={`lg:col-span-4 ${i % 2 ? "lg:order-1 lg:col-start-2" : "lg:col-start-8"}`}>
                <p className="eyebrow flex items-center gap-4 text-gold-deep">
                  <span aria-hidden="true" className="h-px w-8 bg-gold" />
                  {w.eyebrow}
                </p>
                <h2 className="mt-6 display-section text-ink">{w.title}</h2>
                <p className="mt-4 text-ink-soft">{w.body}</p>
                <div className="mt-8">
                  <TextLink href={w.href}>{w.cta}</TextLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
