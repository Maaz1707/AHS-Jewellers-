"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useVisibleProducts } from "@/lib/pieces";
import { nearestItem, scrollToItem, useDragScroll } from "@/lib/useDragScroll";
import { Arrows } from "../ui/Controls";
import ProductCard from "../ui/ProductCard";
import SectionHeading from "../ui/SectionHeading";
import TextLink from "../ui/TextLink";

/**
 * Eight pieces in one row: drag, swipe or use the arrows. Snaps to a card,
 * glides a little after a drag. Four at a time on desktop, a card and a third
 * on phones.
 */
export default function FeaturedPieces() {
  const products = useVisibleProducts();
  const featured = useMemo(
    () =>
      products
        .filter((p) => p.featured)
        .sort((a, b) => (a.featured ?? 0) - (b.featured ?? 0))
        .slice(0, 8),
    [products],
  );
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  useDragScroll(rail);

  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const start = el.scrollLeft < 8;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    setEdge((e) => (e.start === start && e.end === end ? e : { start, end }));
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, featured.length]);

  const step = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    scrollToItem(el, Math.max(0, Math.min(featured.length - 1, nearestItem(el) + dir)));
  };

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-card]",
        { autoAlpha: 0, y: 32 },
        { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.025, ease: "expo.out", scrollTrigger: { trigger: rail.current, start: "top 88%", once: true } },
      );
    },
    { scope: root, dependencies: [featured.length] },
  );

  return (
    <section ref={root} aria-labelledby="featured-title" className="bg-white screen-fit">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <SectionHeading
            id="featured-title"
            size="md"
            className="lg:col-span-6"
            eyebrow="Featured pieces"
            title={
              <>
                Chosen this season
                <br />
                from the workshop
              </>
            }
          />
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="text-stone">
              Eight pieces our family would wear first. Prices move with today’s gold rate; weights are exact to the
              tenth of a gram.
            </p>
            <div className="mt-6 flex items-center justify-between gap-6">
              <TextLink href="/collections">Browse every collection</TextLink>
              {featured.length > 1 ? (
                <Arrows label="pieces" onPrev={() => step(-1)} onNext={() => step(1)} prevDisabled={edge.start} nextDisabled={edge.end} />
              ) : null}
            </div>
          </div>
        </div>

        {featured.length === 0 ? (
          <div className="mt-12 border border-line bg-ivory px-6 py-16 text-center">
            <p className="font-serif text-2xl font-light text-ink">New pieces are being photographed.</p>
            <p className="mt-2 text-sm text-stone">The featured edit returns shortly. Every collection is open meanwhile.</p>
          </div>
        ) : (
          <ul
            ref={rail}
            onScroll={measure}
            aria-label="Featured pieces"
            className="no-scrollbar mt-10 flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto pb-2 active:cursor-grabbing md:mt-12 md:gap-6 lg:gap-8"
          >
            {featured.map((p) => (
              <li key={p.slug} data-card="" className="carousel-item shrink-0 snap-start">
                <ProductCard product={p} sizes="(min-width: 1024px) 22vw, (min-width: 768px) 38vw, 74vw" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
