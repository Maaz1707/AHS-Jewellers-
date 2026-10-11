"use client";

import Link from "next/link";
import { useRef } from "react";
import { images, type ImageKey } from "@/data/media";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useDragScroll } from "@/lib/useDragScroll";
import Button from "../ui/Button";
import Image from "../ui/Img";
import VideoBlock from "../ui/VideoBlock";

/** The lookbook: five portraits, each drifting at its own pace. */
const FRAMES: { image: ImageKey; caption: string; drift: number; offset: string }[] = [
  { image: "bridePortraitIvory", caption: "The engagement, in ivory and polki", drift: -14, offset: "md:mt-0" },
  { image: "brideGoldChoker", caption: "Mehendi, with a gold choker", drift: 10, offset: "md:mt-24" },
  { image: "brideVelvet", caption: "The wedding, in velvet and kundan", drift: -8, offset: "md:mt-8" },
  { image: "brideTikkaDetail", caption: "A maang tikka, set by hand", drift: 16, offset: "md:mt-32" },
  { image: "brideIvoryLehenga", caption: "The reception, lighter gold", drift: -12, offset: "md:mt-12" },
];

/**
 * The bridal campaign: a full-bleed film with one large italic line over it,
 * then a lookbook to drag or swipe sideways, each frame drifting at its own
 * speed as the page scrolls.
 */
export default function BridalCampaign() {
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  useDragScroll(rail);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const book = el.querySelector<HTMLElement>("[data-lookbook]");
        if (!book) return;
        gsap.utils.toArray<HTMLElement>("[data-drift]", el).forEach((f) => {
          gsap.fromTo(
            f,
            { yPercent: -Number(f.dataset.drift) },
            { yPercent: Number(f.dataset.drift), ease: "none", scrollTrigger: { trigger: book, start: "top bottom", end: "bottom top", scrub: true } },
          );
        });
      });
      gsap.fromTo(
        "[data-campaign-line]",
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 60%", once: true } },
      );
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="campaign-title" className="bg-white">
      {/* The film */}
      <div className="relative h-svh overflow-hidden bg-ink text-white" style={{ minHeight: "34rem" }}>
        <VideoBlock video="bridalCampaign" control className="absolute inset-0" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/80 via-ink/20 to-ink/10" />
        <div className="shell pointer-events-none relative flex h-full flex-col justify-end pb-20 md:pb-28">
          <p className="eyebrow flex items-center gap-4 text-gold-pale">
            <span aria-hidden="true" className="h-px w-8 bg-gold-pale" />
            The bridal salon
          </p>
          <h2 id="campaign-title" data-campaign-line="" className="mt-6 max-w-content display-hero">
            <em>Seven ceremonies.</em>
            <br />
            <em className="text-gold-pale">One trousseau.</em>
          </h2>
        </div>
      </div>

      {/* The lookbook */}
      <div data-lookbook="" className="section-y overflow-hidden">
        <div className="shell flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="lede text-ink-soft">
            Planned upstairs, over tea, with the whole family: kundan, polki and meenakari for every function from the haldi to
            the vidaai.
          </p>
          <Button href="/collections/bridal" variant="secondary" magnetic={false} arrow>
            The Bridal collection
          </Button>
        </div>
        <div ref={rail} className="no-scrollbar mt-4 cursor-grab overflow-x-auto overflow-y-hidden py-12 active:cursor-grabbing md:mt-8 md:py-20" data-cursor="Drag">
          <ul className="flex w-max gap-4 px-5 md:gap-8 md:px-10 xl:px-16">
            {FRAMES.map((f) => (
              <li key={f.image} className={`w-64 shrink-0 md:w-80 ${f.offset}`}>
                <Link href="/collections/bridal" className="group block" tabIndex={-1} aria-hidden="true">
                  <span data-drift={f.drift} className="relative block aspect-slim overflow-hidden bg-ivory">
                    <Image
                      src={images[f.image].src}
                      alt=""
                      fill
                      sizes="320px"
                      className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-105"
                    />
                  </span>
                </Link>
                <p className="mt-4 font-serif text-xl italic text-ink-soft">{f.caption}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
