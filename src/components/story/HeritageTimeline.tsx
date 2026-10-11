"use client";

import Image from "@/components/ui/Img";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { images, type ImageKey } from "@/data/media";
import { story } from "@/data/site";
import { useSwap } from "@/lib/useAutoplay";
import RevealImage from "../ui/RevealImage";
import RevealText from "../ui/RevealText";

/**
 * Desktop: one screen, nothing pinned. The years are a vertical list of tabs
 * beside the photograph; hovering, focusing or choosing a year changes the
 * photograph and its story. Phones: each year with its own photograph inline.
 */
export default function HeritageTimeline() {
  const items = story.timeline;
  const [active, setActive] = useState(0);
  const before = useSwap(active);
  const uid = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const t = items[active];

  const onKey = (e: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowDown: active + 1, ArrowUp: active - 1, Home: 0, End: items.length - 1 };
    if (e.key in keys) {
      e.preventDefault();
      const n = (keys[e.key] + items.length) % items.length;
      setActive(n);
      tabs.current[n]?.focus();
    }
  };

  return (
    <section id="heritage" aria-labelledby="heritage-title" className="scroll-mt-28 bg-ivory section-y">
      <div className="shell">
        <p className="eyebrow flex items-center gap-4 text-gold-deep">
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
          Heritage
        </p>
        <RevealText as="h2" id="heritage-title" className="mt-6 max-w-narrow display-section text-ink">
          From one counter to two floors
        </RevealText>
      </div>

      {/* Desktop: photograph and year tabs */}
      <div className="shell mt-12 hidden lg:grid lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="relative col-span-6 overflow-hidden bg-ivory-deep screen-frame">
          {items.map((it, i) => {
            const img = images[it.image as ImageKey];
            const on = i === active;
            return (
              <div
                key={it.year}
                aria-hidden={!on}
                className={`absolute inset-0 ${on ? `z-2 ${before >= 0 ? "wipe-in" : ""}` : i === before ? "z-1" : "opacity-0"}`}
              >
                <div className={`absolute inset-0 ${on ? "ken-burns" : ""}`}>
                  <Image src={img.src} alt={on ? img.alt : ""} fill sizes="48vw" className="object-cover" />
                </div>
              </div>
            );
          })}
          {before >= 0 ? <span key={`light-${active}`} aria-hidden="true" className="wipe-light z-3" /> : null}
          <p className="absolute bottom-6 left-6 z-4 bg-white/90 px-4 py-2 font-serif text-3xl text-ink figures">{t.year}</p>
        </div>

        <div className="col-span-5 col-start-8">
          <div role="tablist" aria-orientation="vertical" aria-label="Years" onKeyDown={onKey} className="flex flex-col border-l border-line-strong">
            {items.map((it, i) => {
              const on = i === active;
              return (
                <button
                  key={it.year}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${i}`}
                  aria-selected={on}
                  aria-controls={`${uid}-panel`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                  className={`group relative -ml-px flex items-baseline gap-6 border-l py-2 pl-8 text-left transition-colors duration-300 ${
                    on ? "border-gold" : "border-transparent"
                  }`}
                >
                  <span className={`font-serif text-3xl font-light figures transition-colors duration-300 ${on ? "text-gold-deep" : "text-stone group-hover:text-ink"}`}>
                    {it.year}
                  </span>
                  <span className={`text-sm transition-colors duration-300 ${on ? "text-ink" : "text-stone group-hover:text-ink"}`}>{it.title}</span>
                </button>
              );
            })}
          </div>
          <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${active}`} aria-live="polite" className="mt-10 pl-8">
            <div key={t.year} className="rise-in">
              <h3 className="font-serif text-3xl font-light text-ink">{t.title}</h3>
              <p className="mt-4 max-w-prose text-ink-soft">{t.body}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Phones and tablets: each year with its photograph */}
      <ol className="shell mt-12 flex flex-col gap-12 lg:hidden">
        {items.map((it) => (
          <li key={it.year} className="relative border-l border-line-strong pl-8 md:pl-12">
            <span aria-hidden="true" className="absolute -left-1 top-2 size-2 rounded-full bg-gold" />
            <p className="font-serif text-6xl font-light text-gold-deep figures">{it.year}</p>
            <h3 className="mt-4 font-serif text-3xl font-light text-ink">{it.title}</h3>
            <p className="mt-4 max-w-prose text-ink-soft">{it.body}</p>
            <div className="mt-6">
              <RevealImage image={it.image as ImageKey} sizes="(min-width: 768px) 80vw, 100vw" className="aspect-landscape" />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
