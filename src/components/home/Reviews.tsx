"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { reviews } from "@/data/reviews";
import { useReducedMotion } from "@/lib/motion";
import { ArrowLeft, ArrowRight, PauseIcon, PlayIcon } from "../ui/Icons";
import SectionHeading from "../ui/SectionHeading";

const INTERVAL = 8000;

export default function Reviews() {
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const reduced = useReducedMotion();
  const region = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const total = reviews.length;

  const go = useCallback((dir: number) => setIndex((i) => (i + dir + total) % total), [total]);

  // Advances on its own for one round only, then waits for the visitor.
  const [advanced, setAdvanced] = useState(0);
  const autoplay = !reduced && !userPaused && !hovering && inView && advanced < total - 1;

  useEffect(() => {
    const node = region.current;
    if (!node) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const t = window.setTimeout(() => {
      go(1);
      setAdvanced((n) => n + 1);
    }, INTERVAL);
    return () => window.clearTimeout(t);
  }, [autoplay, index, go]);

  const review = reviews[index];

  return (
    <section aria-labelledby="reviews-title" className="bg-white section-y">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col justify-between gap-10 lg:col-span-4">
          <SectionHeading id="reviews-title" eyebrow="In their words" title={<>Families who<br />come back</>} size="md" />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous review"
              className="flex size-12 items-center justify-center rounded-full border border-line-strong text-ink transition-colors duration-500 hover:border-ink hover:bg-ink hover:text-white"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next review"
              className="flex size-12 items-center justify-center rounded-full border border-line-strong text-ink transition-colors duration-500 hover:border-ink hover:bg-ink hover:text-white"
            >
              <ArrowRight className="size-4" />
            </button>
            {!reduced ? (
              <button
                type="button"
                onClick={() => setUserPaused((p) => !p)}
                aria-label={userPaused ? "Resume automatic rotation" : "Pause automatic rotation"}
                className="ml-2 relative hit-area flex size-10 items-center justify-center text-stone transition-colors hover:text-ink"
              >
                {userPaused ? <PlayIcon className="size-4" /> : <PauseIcon className="size-4" />}
              </button>
            ) : null}
            <span className="ml-auto eyebrow text-stone figures lg:ml-4">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div
          ref={region}
          role="group"
          aria-roledescription="carousel"
          aria-label="Customer reviews"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
          }}
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          onFocus={() => setHovering(true)}
          onBlur={() => setHovering(false)}
          onPointerDown={(e) => {
            startX.current = e.clientX;
          }}
          onPointerUp={(e) => {
            if (startX.current === null) return;
            const dx = e.clientX - startX.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            startX.current = null;
          }}
          className="relative touch-pan-y select-none border-t border-line pt-10 focus-visible:outline-offset-8 lg:col-span-7 lg:col-start-6 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0"
        >
          <span aria-hidden="true" className="block font-serif text-7xl leading-none text-gold">
            &ldquo;
          </span>
          <div aria-live={autoplay ? "off" : "polite"} className="grid">
            {reviews.map((r, i) => (
              <figure
                key={r.name}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${total}`}
                aria-hidden={i !== index}
                className={`col-start-1 row-start-1 transition-[opacity,transform] duration-1000 ease-luxe ${
                  i === index ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
                }`}
              >
                <blockquote className="font-serif text-2xl font-light leading-snug text-ink md:text-4xl">{r.quote}</blockquote>
                <figcaption className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="text-sm font-medium text-ink">{r.name}</span>
                  <span aria-hidden="true" className="h-px w-6 bg-gold" />
                  <span className="text-sm text-stone">
                    {r.occasion}, {r.city}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* Progress */}
          <div className="mt-12 grid gap-2" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
            {reviews.map((r, i) => (
              <button
                key={r.name}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show review ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className="group relative h-6"
              >
                <span className="absolute inset-x-0 top-1/2 block h-px bg-line-strong" />
                <span
                  key={i === index ? `active-${index}` : "idle"}
                  className={`absolute inset-x-0 top-1/2 block h-px origin-left bg-gold ${
                    i < index ? "scale-x-100" : i === index ? (autoplay ? "review-progress" : "scale-x-100") : "scale-x-0"
                  }`}
                />
              </button>
            ))}
          </div>
          {review ? <p className="sr-only">Showing review from {review.name}</p> : null}
        </div>
      </div>
    </section>
  );
}
