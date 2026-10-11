"use client";

import Image from "@/components/ui/Img";
import { useRef, useState } from "react";
import { images, type ImageKey } from "@/data/media";
import { story } from "@/data/site";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import RevealImage from "../ui/RevealImage";
import RevealText from "../ui/RevealText";

/**
 * Desktop: the photograph column stays pinned while the years scroll past, and
 * the image cross-fades to match the year in view. Phones: each year carries
 * its own photograph inline.
 */
export default function HeritageTimeline() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const items = story.timeline;

  useGSAP(
    () => {
      const blocks = root.current?.querySelectorAll<HTMLElement>("[data-year]") ?? [];
      blocks.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="heritage" aria-labelledby="heritage-title" className="scroll-mt-28 bg-ivory section-y">
      <div className="shell">
        <p className="eyebrow flex items-center gap-4 text-gold-deep">
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
          Heritage
        </p>
        <RevealText as="h2" id="heritage-title" className="mt-6 max-w-narrow display-section text-ink">
          From one counter to two floors
        </RevealText>
      </div>

      <div className="shell mt-16 grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* Pinned photographs (desktop) */}
        <div className="hidden lg:col-span-6 lg:block">
          <div className="sticky top-28">
            <div className="relative aspect-portrait overflow-hidden bg-ivory-deep viewport-frame">
              {items.map((t, i) => {
                const img = images[t.image as ImageKey];
                return (
                  <div
                    key={t.year}
                    aria-hidden={i !== active}
                    className={`absolute inset-0 transition-[opacity,transform] duration-1000 ease-luxe ${
                      i === active ? "scale-100 opacity-100" : "scale-105 opacity-0"
                    }`}
                  >
                    <Image src={img.src} alt={img.alt} fill sizes="48vw" className="object-cover" />
                  </div>
                );
              })}
              <p className="absolute bottom-6 left-6 bg-white/90 px-4 py-2 font-serif text-3xl text-ink figures">
                {items[active].year}
              </p>
            </div>
          </div>
        </div>

        {/* Years */}
        <ol className="lg:col-span-5 lg:col-start-8">
          {items.map((t, i) => (
            <li
              key={t.year}
              data-year=""
              className={`relative border-l pl-8 transition-colors duration-700 md:pl-12 lg:flex lg:flex-col lg:justify-center ${
                i === active ? "border-gold" : "border-line-strong"
              }`}
              style={{ minHeight: "min(70svh, 40rem)" }}
            >
              <span
                aria-hidden="true"
                className={`absolute -left-1 top-2 size-2 rounded-full transition-colors duration-700 lg:top-1/2 ${i === active ? "bg-gold" : "bg-line-strong"}`}
              />
              <p className="font-serif text-6xl font-light text-gold-deep figures md:text-7xl">{t.year}</p>
              <h3 className="mt-4 font-serif text-3xl font-light text-ink">{t.title}</h3>
              <p className="mt-4 max-w-prose text-ink-soft">{t.body}</p>
              <div className="mt-8 pb-16 lg:hidden">
                <RevealImage image={t.image as ImageKey} sizes="(min-width: 768px) 80vw, 100vw" className="aspect-landscape" />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
