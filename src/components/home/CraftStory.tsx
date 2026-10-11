"use client";

import { useRef, useState } from "react";
import { craftSteps } from "@/data/craft";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scrollToTarget } from "../providers/SmoothScroll";
import RevealText from "../ui/RevealText";
import TextLink from "../ui/TextLink";
import VideoBlock from "../ui/VideoBlock";

/**
 * Desktop: the section pins; scrolling advances through five steps while the
 * footage cross-fades. Phones: the same steps as a simple vertical sequence.
 */
export default function CraftStory() {
  const section = useRef<HTMLElement>(null);
  const pinned = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const total = craftSteps.length;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const st = ScrollTrigger.create({
          trigger: pinned.current,
          start: "top top",
          end: () => `+=${window.innerHeight * (total - 0.4)}`,
          pin: true,
          onUpdate: (self) => {
            const idx = Math.min(total - 1, Math.round(self.progress * (total - 1)));
            setActive((prev) => (prev === idx ? prev : idx));
          },
        });
        trigger.current = st;
        return () => {
          trigger.current = null;
        };
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  const goTo = (i: number) => {
    const st = trigger.current;
    if (!st) return;
    scrollToTarget(st.start + ((st.end - st.start) * i) / (total - 1));
  };

  const step = craftSteps[active];

  return (
    <section ref={section} aria-labelledby="craft-title" className="bg-ivory">
      {/* ---------------- Desktop: pinned ---------------- */}
      <div ref={pinned} className="hidden h-svh lg:grid lg:grid-cols-2">
        <div className="relative h-full overflow-hidden bg-ink">
          {craftSteps.map((s, i) => (
            <div
              key={s.number}
              aria-hidden={i !== active}
              className={`absolute inset-0 transition-[opacity,transform] duration-1000 ease-luxe ${
                i === active ? "scale-100 opacity-100" : "scale-105 opacity-0"
              }`}
            >
              <VideoBlock video={s.video} active={i === active} sizes="50vw" className="absolute inset-0" />
            </div>
          ))}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/50 to-transparent" />
          <p className="absolute bottom-10 left-16 font-serif text-7xl font-light text-white/90 figures">
            {step.number}
            <span className="text-2xl text-white/50"> / {String(total).padStart(2, "0")}</span>
          </p>
        </div>

        <div className="flex h-full flex-col justify-between px-16 pb-16 pt-40 xl:px-24">
          <div>
            <p className="eyebrow flex items-center gap-4 text-gold-deep">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              The craft
            </p>
            <RevealText as="h2" id="craft-title" className="mt-6 display-section text-ink">
              From the bench,
              <br />
              by hand
            </RevealText>
          </div>

          <div aria-live="polite" className="relative min-h-64">
            <div key={step.number} className="[animation:menu-in_0.9s_var(--ease-luxe)]">
              <p className="eyebrow text-stone">Step {step.number}</p>
              <h3 className="mt-4 font-serif text-6xl font-light text-ink">{step.title}</h3>
              <p className="mt-6 lede text-ink-soft">{step.body}</p>
            </div>
          </div>

          <div>
            <ol className="grid grid-cols-5 gap-3" aria-label="Craft steps">
              {craftSteps.map((s, i) => (
                <li key={s.number}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === active ? "step" : undefined}
                    className="group flex w-full flex-col items-start gap-3 text-left"
                  >
                    <span className="relative block h-px w-full overflow-hidden bg-line-strong">
                      <span
                        className={`absolute inset-0 origin-left bg-gold transition-transform duration-700 ease-luxe ${
                          i <= active ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </span>
                    <span
                      className={`eyebrow transition-colors duration-500 ${
                        i === active ? "text-ink" : "text-stone group-hover:text-ink"
                      }`}
                    >
                      {s.title}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="mt-10">
              <TextLink href="/craft">Inside the workshop</TextLink>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Phones and tablets: stacked ---------------- */}
      <div className="py-20 md:py-24 lg:hidden">
        <div className="shell">
          <p className="eyebrow flex items-center gap-4 text-gold-deep">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            The craft
          </p>
          <RevealText as="h2" className="mt-6 display-section text-ink">
            From the bench, by hand
          </RevealText>
        </div>
        <ol className="mt-12 flex flex-col gap-16">
          {craftSteps.map((s) => (
            <li key={s.number} className="shell grid gap-6 md:grid-cols-2 md:items-center md:gap-10">
              <VideoBlock video={s.video} sizes="(min-width: 768px) 50vw, 100vw" className="aspect-landscape" />
              <div>
                <p className="eyebrow text-stone">Step {s.number}</p>
                <h3 className="mt-3 font-serif text-3xl font-light text-ink">{s.title}</h3>
                <p className="mt-3 text-ink-soft">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="shell mt-12">
          <TextLink href="/craft">Inside the workshop</TextLink>
        </div>
      </div>
    </section>
  );
}
