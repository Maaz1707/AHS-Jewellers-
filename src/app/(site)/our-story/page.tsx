import type { Metadata } from "next";
import Image from "@/components/ui/Img";
import Link from "next/link";
import ImmersiveHero from "@/components/sections/ImmersiveHero";
import HeritageTimeline from "@/components/story/HeritageTimeline";
import Button from "@/components/ui/Button";
import RevealImage from "@/components/ui/RevealImage";
import RevealText from "@/components/ui/RevealText";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import VideoBlock from "@/components/ui/VideoBlock";
import { images } from "@/data/media";
import { site, story } from "@/data/site";

export const metadata: Metadata = {
  title: "Our Story",
  description: story.lede,
};

export default function OurStoryPage() {
  return (
    <>
      <ImmersiveHero image="craftLamp" eyebrow={`Our story · Since ${site.foundedYear}`} title={story.headline} intro={story.lede} objectPosition="50% 45%" />

      {/* The family */}
      <section aria-labelledby="family-title" className="bg-white section-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <SectionHeading id="family-title" eyebrow="The family" title="A promise made at the first counter" size="md" />
              <div className="mt-10 hidden lg:block">
                <RevealImage image="brideSareeDetail" sizes="30vw" className="aspect-portrait" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-6">
            {story.family.map((para, i) => (
              <RevealText
                key={i}
                mode="block"
                as="p"
                className={`mb-8 font-serif text-2xl font-light leading-snug text-ink md:text-3xl ${
                  i === 0 ? "md:first-letter:float-left md:first-letter:mr-3 md:first-letter:font-serif md:first-letter:text-7xl md:first-letter:leading-none md:first-letter:text-gold-deep" : ""
                }`}
              >
                {para}
              </RevealText>
            ))}
          </div>
        </div>
      </section>

      <HeritageTimeline />

      {/* Showroom film */}
      <section aria-labelledby="film-title" className="relative overflow-hidden bg-ink text-white" style={{ minHeight: "90svh" }}>
        <VideoBlock video="goldShowcase" control className="absolute inset-0" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/80 via-ink/20 to-ink/30" />
        <div className="shell pointer-events-none relative flex flex-col justify-end pb-16 pt-40 md:pb-24" style={{ minHeight: "90svh" }}>
          <p className="eyebrow flex items-center gap-4 text-gold-pale">
            <span aria-hidden="true" className="h-px w-8 bg-gold-pale" />
            The showroom
          </p>
          <RevealText as="h2" id="film-title" className="mt-6 max-w-narrow display-section">
            Two floors on Bhagwan Das Road
          </RevealText>
          <p className="mt-6 max-w-prose text-white/85">
            Everyday gold downstairs, bright and open to the street. Upstairs, a quieter salon where bridal pieces are
            brought to you.
          </p>
          <div className="pointer-events-auto mt-8">
            <TextLink href="/contact#floors" tone="light">
              Visit the showroom
            </TextLink>
          </div>
        </div>
      </section>

      {/* Values */}
      <section aria-labelledby="values-title" className="bg-white section-y">
        <div className="shell">
          <SectionHeading id="values-title" eyebrow="What we stand for" title="Four things we will not change" />
          <ol className="mt-16 grid border-t border-line md:grid-cols-2">
            {story.values.map((v, i) => (
              <li
                key={v.title}
                className={`flex gap-6 border-b border-line py-10 md:gap-10 md:py-14 ${i % 2 === 0 ? "md:border-r md:pr-12" : "md:pl-12"}`}
              >
                <span className="font-serif text-5xl font-light leading-none text-gold-deep figures">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-serif text-3xl font-light text-ink">{v.title}</h3>
                  <p className="mt-4 max-w-prose text-ink-soft">{v.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Continue */}
      <section aria-label="Read on" className="bg-ivory band-y">
        <div className="shell grid gap-6 md:grid-cols-2 md:gap-10">
          {[
            { href: "/craft", eyebrow: "The craft", title: "From the bench, by hand", image: "craftBench" as const },
            { href: "/hallmarking", eyebrow: "Hallmarking", title: "What the hallmark tells you", image: "dailyCoinPendant" as const },
          ].map((c) => (
            <Link key={c.href} href={c.href} className="group grid grid-cols-5 items-center gap-6 bg-white p-4 md:p-6">
              <span className="relative col-span-2 block aspect-portrait overflow-hidden bg-ivory">
                <Image src={images[c.image].src} alt={images[c.image].alt} fill sizes="20vw" className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-105" />
              </span>
              <span className="col-span-3">
                <span className="block eyebrow text-gold-deep">{c.eyebrow}</span>
                <span className="mt-3 block font-serif text-3xl font-light text-ink transition-colors group-hover:text-gold-deep">{c.title}</span>
                <span className="mt-6 inline-block eyebrow text-ink">
                  <span className="link-draw pb-1">Read on</span>
                </span>
              </span>
            </Link>
          ))}
        </div>
        <div className="shell mt-16 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-prose font-serif text-2xl font-light text-ink">The family is in the showroom most days. Come and meet us.</p>
          <Button href="/book-a-visit" arrow>
            Book a Visit
          </Button>
        </div>
      </section>
    </>
  );
}
