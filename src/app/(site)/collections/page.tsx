import type { Metadata } from "next";
import Link from "next/link";
import LiveCount from "@/components/collections/LiveCount";
import Button from "@/components/ui/Button";
import RevealImage from "@/components/ui/RevealImage";
import RevealText from "@/components/ui/RevealText";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import VideoBlock from "@/components/ui/VideoBlock";
import { categories, categoryBySlug, collections, type Collection } from "@/data/collections";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "The Collections",
  description: "Bridal, Diamond, Gold Classics, Daily Wear and Gifting: five collections made in our Jaipur workshop.",
};

const piecesIn = (c: Collection) => products.filter((p) => p.collection === c.slug);
const categoriesIn = (c: Collection) =>
  [...new Set(piecesIn(c).map((p) => p.category))].map((s) => categoryBySlug(s)?.name ?? s).slice(0, 4);

function ChapterText({ c, index }: { c: Collection; index: number }) {
  return (
    <div>
      <p className="eyebrow flex items-center gap-4 text-gold-deep">
        <span className="figures">{String(index + 1).padStart(2, "0")}</span>
        <span aria-hidden="true" className="h-px w-8 bg-gold" />
        <LiveCount collection={c.slug} fallback={piecesIn(c).length} />
      </p>
      <RevealText as="h2" className="mt-6 display-section text-ink">
        {c.name}
      </RevealText>
      <p className="mt-4 font-serif text-xl italic text-gold-deep">{c.line}</p>
      <RevealText mode="block" className="mt-6 max-w-prose text-ink-soft">
        {c.intro}
      </RevealText>
      <p className="mt-6 text-sm text-stone">{categoriesIn(c).join(" · ")}</p>
      <div className="mt-10">
        <Button href={`/collections/${c.slug}`} variant="secondary" arrow>
          Explore {c.name}
        </Button>
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <>
      {/* Opening */}
      <section className="bg-white hero-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="eyebrow flex items-center gap-4 text-gold-deep">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              The collections
            </p>
            <RevealText as="h1" immediate delay={0.2} className="mt-6 display-page text-ink">
              Five ways
              <br />
              to wear <em className="text-gold-deep">gold</em>
            </RevealText>
            <p className="mt-6 lede text-ink-soft">
              Each collection is made in our own workshop and priced at the morning’s rate. Start with the occasion,
              or the piece you have in mind.
            </p>
          </div>
          <nav aria-label="Collections on this page" className="lg:col-span-4 lg:col-start-9">
            <ol className="border-t border-line">
              {collections.map((c, i) => (
                <li key={c.slug} className="border-b border-line">
                  <a href={`#${c.slug}`} data-transition="off" className="group flex items-baseline gap-5 py-4">
                    <span className="eyebrow text-stone figures">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1 font-serif text-2xl font-light text-ink transition-colors group-hover:text-gold-deep">
                      {c.name}
                    </span>
                    <span className="text-xs text-stone figures"><LiveCount collection={c.slug} fallback={piecesIn(c).length} withUnit={false} /></span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      {/* Chapters */}
      {collections.map((c, i) => {
        if (c.heroVideo) {
          // One chapter told on film, full bleed, to break the rhythm.
          return (
            <section key={c.slug} id={c.slug} aria-labelledby={`${c.slug}-title`} className="relative scroll-mt-28 overflow-hidden bg-ink text-white" style={{ minHeight: "88svh" }}>
              <VideoBlock video={c.heroVideo} control className="absolute inset-0" />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-r from-ink/80 via-ink/40 to-transparent" />
              <div className="shell pointer-events-none relative flex flex-col justify-center py-24" style={{ minHeight: "88svh" }}>
                <div className="pointer-events-auto max-w-prose">
                  <p className="eyebrow flex items-center gap-4 text-gold-pale">
                    <span className="figures">{String(i + 1).padStart(2, "0")}</span>
                    <span aria-hidden="true" className="h-px w-8 bg-gold-pale" />
                    <LiveCount collection={c.slug} fallback={piecesIn(c).length} />
                  </p>
                  <RevealText as="h2" id={`${c.slug}-title`} className="mt-6 display-section">
                    {c.name}
                  </RevealText>
                  <p className="mt-4 font-serif text-xl italic text-gold-pale">{c.line}</p>
                  <p className="mt-6 text-white/85">{c.intro}</p>
                  <p className="mt-6 text-sm text-white/60">{categoriesIn(c).join(" · ")}</p>
                  <div className="mt-10">
                    <Button href={`/collections/${c.slug}`} variant="light" arrow>
                      Explore {c.name}
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        const flip = i % 2 === 1;
        return (
          <section key={c.slug} id={c.slug} aria-label={c.name} className={`scroll-mt-28 section-y ${flip ? "bg-ivory" : "bg-white"}`}>
            <div className="shell grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
              <div className={`relative lg:col-span-6 ${flip ? "lg:order-2 lg:col-start-7" : ""}`}>
                <Link href={`/collections/${c.slug}`} className="group block" aria-label={`Explore ${c.name}`} tabIndex={-1}>
                  <RevealImage
                    image={c.cover}
                    sizes="(min-width: 1024px) 48vw, 100vw"
                    parallax={6}
                    from={flip ? "right" : "left"}
                    hoverZoom
                    objectPosition={c.heroPosition}
                    className="aspect-portrait"
                  />
                </Link>
                <div className={`absolute -bottom-12 hidden w-2/5 border-8 md:block ${flip ? "-left-8 border-ivory" : "-right-8 border-white"}`}>
                  <RevealImage image={c.detail} sizes="20vw" delay={0.25} className="aspect-square" />
                </div>
              </div>
              <div className={`lg:col-span-5 ${flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-8"} md:pt-12 lg:pt-0`}>
                <ChapterText c={c} index={i} />
              </div>
            </div>
          </section>
        );
      })}

      {/* By category */}
      <section aria-labelledby="by-category" className="bg-white section-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
          <SectionHeading
            id="by-category"
            className="lg:col-span-4"
            eyebrow="Or by category"
            title="Know what you are looking for?"
            size="md"
          />
          <ul className="grid grid-cols-1 border-t border-line sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {categories.map((cat) => {
              const n = products.filter((p) => p.category === cat.slug).length;
              return (
                <li key={cat.slug} className="border-b border-line sm:odd:border-r sm:odd:pr-8 sm:even:pl-8">
                  <Link href={`/category/${cat.slug}`} className="group flex items-baseline justify-between py-5">
                    <span className="font-serif text-2xl font-light text-ink transition-colors group-hover:text-gold-deep">{cat.name}</span>
                    <span className="text-xs text-stone"><LiveCount category={cat.slug} fallback={n} /></span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="shell mt-20 flex flex-col items-start gap-6 border-t border-line pt-10 md:flex-row md:items-center md:justify-between">
          <p className="max-w-prose font-serif text-2xl font-light text-ink">
            The showroom holds more than we photograph. Come and see it in the light.
          </p>
          <div className="flex flex-wrap items-center gap-8">
            <TextLink href="/gold-rate">Today’s gold rate</TextLink>
            <Button href="/book-a-visit" arrow>
              Book a Visit
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
