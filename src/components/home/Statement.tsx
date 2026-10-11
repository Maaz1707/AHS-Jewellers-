"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/** Words of the statement; the emphasised phrase is set in emerald italic. */
const WORDS: { w: string; em?: boolean }[] = [
  ..."Every piece is weighed in front of you, priced at the morning’s rate, and made".split(" ").map((w) => ({ w })),
  ...["one", "floor", "above", "the", "counter."].map((w) => ({ w, em: true })),
];

/**
 * One sentence, set very large. Words come up from grey to ink as the reader
 * scrolls through it. With reduced motion it is simply printed.
 */
export default function Statement() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-word]",
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.12,
          scrollTrigger: { trigger: root.current, start: "top 75%", end: "bottom 45%", scrub: 0.5 },
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Our promise" className="relative overflow-hidden bg-white section-y">
      <div aria-hidden="true" className="bg-jaali jaali-fade pointer-events-none absolute -right-24 top-1/2 size-96 -translate-y-1/2 opacity-40" />
      <div className="shell relative">
        <p className="eyebrow flex items-center gap-4 text-gold-deep">
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
          Since 1987
        </p>
        <p className="mt-10 max-w-content font-serif text-4xl font-light leading-tight tracking-tight text-ink md:text-6xl xl:text-7xl">
          {WORDS.map(({ w, em }, i) => (
            <span key={i}>
              <span data-word="" className={em ? "italic text-emerald" : undefined}>
                {w}
              </span>{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
