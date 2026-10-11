"use client";

import { useRef } from "react";
import { images, type ImageKey } from "@/data/media";
import { reviews } from "@/data/reviews";
import { useAutoplay, useSwap } from "@/lib/useAutoplay";
import { Arrows, PlayPause } from "../ui/Controls";
import Image from "../ui/Img";
import { PetalCorner } from "../ui/Motif";
import TextLink from "../ui/TextLink";

/** The four stories on the home page, the first with the bridal portrait. */
const STORIES = reviews.slice(0, 4).map((r, i) => ({ ...r, picture: (i === 0 ? "brideSareeDetail" : r.image ?? "brideSareeDetail") as ImageKey }));

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Reviews as an editorial spread in one screen: a portrait beside one story
 * set large. The stories turn every six seconds, pause under the mouse or with
 * keyboard focus, and can be moved with the arrows.
 */
export default function Reviews() {
  const section = useRef<HTMLElement>(null);
  const play = useAutoplay(section, STORIES.length, { interval: 6000 });
  const { index } = play;
  const before = useSwap(index);
  const r = STORIES[index];

  return (
    <section ref={section} aria-labelledby="reviews-title" className="relative bg-white screen-fit">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-10">
        <figure className="relative lg:col-span-5">
          <div className="relative aspect-landscape overflow-hidden bg-ivory lg:aspect-portrait">
            {STORIES.map((s, i) => {
              const on = i === index;
              return (
                <div key={s.name} aria-hidden={!on} className={`absolute inset-0 ${on ? `z-2 ${before >= 0 ? "wipe-in" : ""}` : i === before ? "z-1" : "opacity-0"}`}>
                  <div className={`absolute inset-0 ${on ? "ken-burns" : ""}`}>
                    <Image src={images[s.picture].src} alt={on ? images[s.picture].alt : ""} fill sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover" />
                  </div>
                </div>
              );
            })}
            {before >= 0 ? <span key={`light-${index}`} aria-hidden="true" className="wipe-light z-3" /> : null}
          </div>
          <PetalCorner className="absolute -left-3 -top-3 size-16" />
          <figcaption className="mt-3 text-xs text-stone">
            {r.occasion}, {r.year}
          </figcaption>
        </figure>

        <div className="lg:col-span-6 lg:col-start-7">
          <p className="eyebrow flex items-center gap-4 text-gold-deep">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            <span id="reviews-title">In their words</span>
          </p>

          <div data-hold="" aria-live={play.running ? "off" : "polite"} className="mt-8">
            <figure key={r.name} className="rise-in">
              <span aria-hidden="true" className="block font-serif text-7xl leading-none text-gold">
                &ldquo;
              </span>
              <blockquote className="font-serif text-2xl font-light italic leading-snug text-ink md:text-4xl">{r.quote}</blockquote>
              <figcaption className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-sm font-medium text-ink">{r.name}</span>
                <span aria-hidden="true" className="h-px w-6 bg-gold" />
                <span className="text-sm text-stone">
                  {r.occasion}, {r.city}
                </span>
              </figcaption>
            </figure>
          </div>

          <div className="mt-10 flex items-center gap-5">
            <span className="eyebrow text-stone figures">
              {pad(index + 1)} / {pad(STORIES.length)}
            </span>
            <span aria-hidden="true" className="relative block h-px flex-1 overflow-hidden bg-line">
              {play.enabled ? (
                <span key={`bar-${index}`} {...play.bar} className="autoplay-bar absolute inset-0 origin-left bg-gold" />
              ) : (
                <span className="absolute inset-0 origin-left bg-gold" style={{ transform: `scaleX(${(index + 1) / STORIES.length})` }} />
              )}
            </span>
            <Arrows label="story" onPrev={play.prev} onNext={play.next} />
            <PlayPause enabled={play.enabled} stopped={play.stopped} onToggle={play.toggle} label="the stories" />
          </div>

          <div className="mt-8">
            <TextLink href="/reviews">Read every story</TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}
