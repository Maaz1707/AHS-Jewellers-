import type { Metadata } from "next";
import Image from "@/components/ui/Img";
import Button from "@/components/ui/Button";
import RevealImage from "@/components/ui/RevealImage";
import RevealText from "@/components/ui/RevealText";
import TextLink from "@/components/ui/TextLink";
import { images } from "@/data/media";
import { reviews } from "@/data/reviews";
import { whatsappLink } from "@/data/site";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Customer stories from families who have bought their bridal, diamond and everyday gold at AHS Jewellers.",
};

export default function ReviewsPage() {
  const [featured, ...rest] = reviews;
  const cities = [...new Set(reviews.map((r) => r.city))];

  return (
    <>
      <section className="bg-white hero-y">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow flex items-center gap-4 text-gold-deep">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              In their words
            </p>
            <RevealText as="h1" immediate delay={0.2} className="mt-6 display-page text-ink">
              Families who <em className="text-gold-deep">come back</em>
            </RevealText>
          </div>
          <p className="text-lg text-ink-soft lg:col-span-4 lg:col-start-9">
            {reviews.length} stories from {cities.slice(0, -1).join(", ")} and {cities.at(-1)}: weddings, first earrings,
            old gold and the coins bought every Dhanteras.
          </p>
        </div>
      </section>

      {/* Featured story */}
      <section aria-label={`${featured.name}'s story`} className="bg-ivory section-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
          {featured.image ? (
            <div className="lg:col-span-5">
              <RevealImage image={featured.image} sizes="(min-width: 1024px) 40vw, 100vw" parallax={6} className="aspect-portrait" />
            </div>
          ) : null}
          <figure className="lg:col-span-6 lg:col-start-7">
            <p className="eyebrow text-gold-deep">
              {featured.occasion} · {featured.year}
            </p>
            <span aria-hidden="true" className="mt-6 block font-serif text-7xl leading-none text-gold">
              &ldquo;
            </span>
            <blockquote>
              <RevealText as="p" className="font-serif text-3xl font-light leading-snug text-ink md:text-4xl">
                {featured.quote}
              </RevealText>
              <p className="mt-8 text-ink-soft">{featured.story}</p>
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-4">
              <span className="text-sm font-medium text-ink">{featured.name}</span>
              <span aria-hidden="true" className="h-px w-6 bg-gold" />
              <span className="text-sm text-stone">{featured.city}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* The rest, laid out like a scrapbook */}
      <section aria-label="More stories" className="bg-white section-y">
        <ul className="shell columns-1 gap-10 md:columns-2 xl:columns-3">
          {rest.map((r, i) => (
            <li key={r.name} className="mb-10 break-inside-avoid">
              <RevealText mode="block" as="figure" delay={(i % 3) * 0.08} className="border-t border-line pt-8">
                {r.image && i % 2 === 0 ? (
                  <span className="relative mb-8 block aspect-landscape overflow-hidden bg-ivory">
                    <Image src={images[r.image].src} alt={images[r.image].alt} fill sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw" className="object-cover" />
                  </span>
                ) : null}
                <p className="eyebrow text-gold-deep">
                  {r.occasion} · {r.year}
                </p>
                <blockquote className="mt-5">
                  <p className="font-serif text-2xl font-light leading-snug text-ink">&ldquo;{r.quote}&rdquo;</p>
                  <p className="mt-5 text-sm leading-relaxed text-ink-soft">{r.story}</p>
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4 text-sm">
                  <span className="font-medium text-ink">{r.name}</span>
                  <span aria-hidden="true" className="h-px w-6 bg-gold" />
                  <span className="text-stone">{r.city}</span>
                </figcaption>
              </RevealText>
            </li>
          ))}
        </ul>

        <div className="shell mt-16 flex flex-col items-start gap-6 border-t border-line pt-10 md:flex-row md:items-center md:justify-between">
          <p className="max-w-prose font-serif text-2xl font-light text-ink">Bought from us? We would love to hear your story.</p>
          <div className="flex flex-wrap items-center gap-8">
            <TextLink href={whatsappLink("Hello AHS Jewellers, I would like to share my story.")} external>
              Share yours on WhatsApp
            </TextLink>
            <Button href="/book-a-visit" arrow>
              Book a Visit
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
