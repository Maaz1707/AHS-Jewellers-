import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import Button from "@/components/ui/Button";
import RevealImage from "@/components/ui/RevealImage";
import TextLink from "@/components/ui/TextLink";
import type { ImageKey } from "@/data/media";
import { site, whatsappLink } from "@/data/site";

export const metadata: Metadata = {
  title: "Jewellery Care",
  description: `How to clean and store gold, kundan, polki and diamond jewellery at home, and free lifetime cleaning at ${site.name}.`,
};

const GUIDES: { title: string; image: ImageKey; points: string[] }[] = [
  {
    title: "Everyday gold",
    image: "dailyEverydayWorn",
    points: [
      "Put gold on last and take it off first: after perfume and lotion, before the gym or the pool.",
      "Wash plain gold in warm water with a drop of mild soap, using a soft toothbrush. Rinse, then dry with a cotton cloth.",
      "Chains knot when they are thrown together. Fasten the clasp and lay each one flat.",
    ],
  },
  {
    title: "Kundan, polki and meenakari",
    image: "bridalKundanTeal",
    points: [
      "Never wash them. Water seeps behind the stones and dulls the foil that makes kundan glow.",
      "Wipe gently with a soft, dry cloth after each wear, especially where the piece touched skin.",
      "Keep meenakari away from perfume and hairspray, which can cloud the enamel.",
    ],
  },
  {
    title: "Diamonds",
    image: "diaSolitaireStud",
    points: [
      "Diamonds attract oil, which is why they lose their fire. Soak in warm soapy water for twenty minutes and brush behind the stone.",
      "Check the claws now and then: if a stone catches on a jumper, bring it in before it comes loose.",
      "Store diamond pieces apart from each other. Diamond scratches diamond, and gold.",
    ],
  },
  {
    title: "Storing heirlooms",
    image: "templeFlatlay",
    points: [
      "Each piece in its own pouch or a lined box compartment, away from damp.",
      "A small sachet of silica gel in the box keeps humidity off antique finishes.",
      "Take heirlooms out and wear them once in a while. Gold that is worn is gold that is checked.",
    ],
  },
];

export default function CarePage() {
  return (
    <>
      <PageHero
        eyebrow="Jewellery care"
        title={
          <>
            Caring for <em className="text-gold-deep">gold</em>
          </>
        }
        intro={
          <p>
            Gold lasts generations with very little help. A few habits keep it bright, and anything bought here we clean and
            polish free of charge, for as long as you own it.
          </p>
        }
        image="kadaGokhru"
      />

      <section className="bg-white pb-20 md:pb-32" aria-label="Care guides">
        <div className="shell flex flex-col gap-16 md:gap-24">
          {GUIDES.map((g, i) => (
            <article key={g.title} className="grid items-start gap-8 border-t border-line pt-12 md:grid-cols-12 md:gap-10 md:pt-16">
              <div className={`md:col-span-4 ${i % 2 ? "md:order-2 md:col-start-9" : ""}`}>
                <RevealImage image={g.image} sizes="(min-width: 768px) 30vw, 100vw" className="aspect-portrait" />
              </div>
              <div className={`md:col-span-6 ${i % 2 ? "md:order-1 md:col-start-2" : "md:col-start-6"}`}>
                <p className="font-serif text-2xl text-gold-deep">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="mt-6 display-section text-ink">{g.title}</h2>
                <ul className="mt-8 flex flex-col">
                  {g.points.map((p) => (
                    <li key={p} className="flex gap-4 border-b border-line py-4 text-ink-soft last:border-b-0">
                      <span aria-hidden="true" className="mt-3 size-1 shrink-0 rounded-full bg-gold" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-ivory band-y" aria-labelledby="clean-title">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="eyebrow flex items-center gap-4 text-gold-deep">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              At the showroom
            </p>
            <h2 id="clean-title" className="mt-6 display-section text-ink">
              Free cleaning, for life
            </h2>
            <p className="mt-6 lede text-ink-soft">
              Bring anything bought from us and we will clean it ultrasonically, check every stone and claw, and polish it while
              you wait. Repairs, resizing and re-stringing are quoted before we begin.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-8 lg:col-span-4 lg:col-start-9 lg:justify-end">
            <Button href="/book-a-visit" arrow>
              Book a visit
            </Button>
            <TextLink href={whatsappLink(`Hello ${site.name}, I would like to bring a piece in for cleaning.`)} external>
              Ask on WhatsApp
            </TextLink>
          </div>
        </div>
      </section>
    </>
  );
}
