"use client";

import { useMemo, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useVisibleProducts } from "@/lib/pieces";
import ProductCard from "../ui/ProductCard";
import SectionHeading from "../ui/SectionHeading";
import TextLink from "../ui/TextLink";

/** One card shape everywhere. On wide screens columns two and four sit lower, for an editorial rhythm. */
const offset = (i: number) => (i % 4 === 1 || i % 4 === 3 ? "lg:mt-24" : "");

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
  const grid = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
      gsap.set(cards, { autoAlpha: 0, y: 32 });
      ScrollTrigger.batch(cards, {
        start: "top 90%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { autoAlpha: 1, y: 0, duration: MOTION.reveal, stagger: MOTION.stagger, ease: MOTION.ease, overwrite: true }),
      });
    },
    { scope: grid, dependencies: [featured.length] },
  );

  return (
    <section aria-labelledby="featured-title" className="bg-white section-y">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <SectionHeading
            id="featured-title"
            className="lg:col-span-7"
            eyebrow="Featured pieces"
            title={
              <>
                Chosen this season
                <br />
                from the workshop
              </>
            }
          />
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="text-stone">
              Eight pieces our family would wear first. Prices move with today’s gold rate; weights are exact to the
              tenth of a gram.
            </p>
            <div className="mt-6">
              <TextLink href="/collections">Browse every collection</TextLink>
            </div>
          </div>
        </div>

        {featured.length === 0 ? (
          <div className="mt-16 border border-line bg-ivory px-6 py-16 text-center">
            <p className="font-serif text-2xl font-light text-ink">New pieces are being photographed.</p>
            <p className="mt-2 text-sm text-stone">The featured edit returns shortly. Every collection is open meanwhile.</p>
          </div>
        ) : (
          <ul ref={grid} className="mt-16 grid grid-cols-2 gap-x-4 gap-y-16 md:mt-24 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4 lg:gap-x-10 lg:gap-y-24">
            {featured.map((p, i) => (
              <li key={p.slug} data-card="" className={offset(i)}>
                <ProductCard
                  product={p}
                  sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 46vw"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
