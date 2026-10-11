"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import Sheen from "../ui/Sheen";

const LEAD = "Every piece is weighed in front of you, priced at the morning’s rate, and made".split(" ");
const EMPHASIS = ["one", "floor", "above", "the", "counter."];

/**
 * One sentence, set large, in no more than half a screen. The words come up
 * from grey to ink once, as it arrives; the last phrase catches the light.
 * With reduced motion it is simply printed.
 */
export default function Statement() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-word]",
        { opacity: 0.14 },
        { opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.025, scrollTrigger: { trigger: root.current, start: "top 80%", once: true } },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Our promise" className="relative overflow-hidden bg-white py-12 md:py-20">
      <div aria-hidden="true" className="bg-jaali jaali-fade pointer-events-none absolute -right-24 top-1/2 size-96 -translate-y-1/2 opacity-40" />
      <div className="shell relative grid gap-6 lg:grid-cols-12 lg:gap-10">
        <p className="eyebrow flex items-center gap-4 text-gold-deep lg:col-span-2 lg:pt-4">
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
          Since 1987
        </p>
        <p className="max-w-content font-serif text-3xl font-light leading-tight tracking-tight text-ink md:text-5xl lg:col-span-10">
          {LEAD.map((w, i) => (
            <span key={i}>
              <span data-word="">{w}</span>{" "}
            </span>
          ))}
          <Sheen tone="emerald" className="italic">
            {EMPHASIS.map((w, i) => (
              <span key={i}>
                <span data-word="">{w}</span>
                {i < EMPHASIS.length - 1 ? " " : ""}
              </span>
            ))}
          </Sheen>
        </p>
      </div>
    </section>
  );
}
