"use client";

import Image from "@/components/ui/Img";
import Link from "next/link";
import { useRef } from "react";
import { collections } from "@/data/collections";
import { images } from "@/data/media";
import { useVisibleProducts } from "@/lib/pieces";
import { gsap, useGSAP } from "@/lib/gsap";
import { ArrowRight } from "../ui/Icons";
import SectionHeading from "../ui/SectionHeading";
import TextLink from "../ui/TextLink";


/**
 * Desktop: the section pins and the five collections travel past horizontally
 * as you scroll. Phones and reduced motion: a native swipeable row with snap.
 */
export default function CollectionsShowcase() {
  const section = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const visible = useVisibleProducts();
  const countIn = (slug: string) => visible.filter((p) => p.collection === slug).length;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const wrap = scroller.current!;
        wrap.style.overflowX = "hidden";
        const distance = () => el.scrollWidth - window.innerWidth;

        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progress.current) progress.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        });

        // Each photograph drifts inside its frame as it crosses the screen.
        gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -6 },
            {
              xPercent: 6,
              ease: "none",
              scrollTrigger: { trigger: img, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
            },
          );
        });

        return () => {
          wrap.style.overflowX = "";
        };
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} aria-labelledby="collections-title" className="relative overflow-hidden bg-white lg:h-svh">
      <div
        ref={scroller}
        className="no-scrollbar snap-x snap-mandatory scroll-px-5 overflow-x-auto py-20 md:scroll-px-10 md:py-24 lg:flex lg:h-full lg:snap-none lg:items-center lg:py-0"
      >
        <div ref={track} className="flex w-max items-stretch gap-5 px-5 md:gap-8 md:px-10 lg:items-center lg:gap-12 xl:px-16">
          {/* Intro panel */}
          <div className="showcase-intro flex shrink-0 snap-start flex-col justify-center lg:pr-8">
            <SectionHeading
              id="collections-title"
              eyebrow="The collections"
              title={
                <>
                  Five ways
                  <br />
                  to wear gold
                </>
              }
              intro="From the wedding trousseau to the chain you never take off. Each collection is made in our workshop and priced at today’s rate."
            />
            <div className="mt-10 flex items-center gap-6">
              <TextLink href="/collections">All collections</TextLink>
              <span aria-hidden="true" className="relative hidden h-px w-24 overflow-hidden bg-line lg:block">
                <span ref={progress} className="absolute inset-0 origin-left scale-x-0 bg-gold" />
              </span>
            </div>
          </div>

          {collections.map((c, i) => {
            const img = images[c.cover];
            return (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}`}
                className={`group showcase-card relative flex shrink-0 snap-start flex-col ${
                  i % 2 === 1 ? "lg:mt-24" : "lg:-mt-24"
                }`}
              >
                <span className="showcase-frame relative block overflow-hidden bg-ivory">
                  <span data-drift="" className="drift-bleed absolute inset-y-0 block">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(min-width: 1024px) 34vw, (min-width: 768px) 44vw, 78vw"
                      className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-105"
                    />
                  </span>
                  <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/50 via-transparent to-transparent opacity-80 transition-opacity duration-700 group-hover:opacity-100" />
                  <span className="absolute left-5 top-5 eyebrow text-white/85 md:left-6 md:top-6">{String(i + 1).padStart(2, "0")}</span>
                  <span className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white md:bottom-6 md:left-6 md:right-6">
                    <span className="font-serif text-3xl font-light md:text-4xl">{c.name}</span>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/50 transition-colors duration-500 group-hover:border-white group-hover:bg-white group-hover:text-ink">
                      <ArrowRight className="size-4" />
                    </span>
                  </span>
                </span>
                <span className="mt-5 flex items-start justify-between gap-6">
                  <span className="max-w-label text-sm text-stone lg:max-w-prose">{c.line}</span>
                  <span className="shrink-0 eyebrow text-gold-deep">{countIn(c.slug)} pieces</span>
                </span>
              </Link>
            );
          })}

          {/* Spacer so the last card can travel fully into view. */}
          <span aria-hidden="true" className="showcase-end shrink-0" />
        </div>
      </div>
    </section>
  );
}
