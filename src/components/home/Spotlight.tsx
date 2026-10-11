"use client";

import Link from "next/link";
import { useRef } from "react";
import { images } from "@/data/media";
import { productBySlug } from "@/data/products";
import { productPath, useProductEnquiry } from "@/lib/enquiry";
import { formatGrams } from "@/lib/format";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useLiveProduct } from "@/lib/pieces";
import Button from "../ui/Button";
import { WhatsAppIcon } from "../ui/Icons";
import Image from "../ui/Img";
import { PetalCorner } from "../ui/Motif";
import Price from "../ui/Price";

const SLUG = "polki-rani-haar";
const seed = productBySlug(SLUG)!;

/** The camera's stops across the photograph: focus point (fractions) and zoom. */
const STOPS = [
  { fx: 0.6, fy: 0.45, zoom: 2.3, label: "The stones", line: "Uncut polki, each one set by hand on pure gold foil, so it holds the light without a single facet cut." },
  { fx: 0.58, fy: 0.12, zoom: 2.6, label: "The dori", line: "A silk cord wrapped in seed pearls, tied at the nape so the haar sits exactly where you want it." },
  { fx: 0.5, fy: 0.84, zoom: 2.3, label: "The drops", line: "Emerald drops strung one by one and left free to move, so the necklace sways as you do." },
];

/**
 * “The piece”: one necklace, very large, on a pinned stage. Scrolling moves
 * the camera across three macro crops, each with one line about the craft,
 * and ends on the whole piece with its name, weight and an enquiry button.
 */
export default function Spotlight() {
  const root = useRef<HTMLElement>(null);
  const product = useLiveProduct(SLUG, seed) ?? seed;
  const enquire = useProductEnquiry(product);
  const media = images.bridalPolkiEmerald;

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const img = el.querySelector<HTMLElement>("[data-spot-image]");
      const steps = gsap.utils.toArray<HTMLElement>("[data-spot-step]", el);
      if (!img || !steps.length) return;

      // Centre the focus point, but never pan past the photograph's edge.
      const at = (s: (typeof STOPS)[number]) => {
        const limit = (s.zoom - 1) * 50;
        const clamp = (v: number) => Math.max(-limit, Math.min(limit, v));
        return { scale: s.zoom, xPercent: clamp((0.5 - s.fx) * 100 * s.zoom), yPercent: clamp((0.5 - s.fy) * 100 * s.zoom) };
      };
      gsap.set(img, at(STOPS[0]));
      gsap.set(steps, { autoAlpha: 0, y: 24 });
      gsap.set(steps[0], { autoAlpha: 1, y: 0 });

      const mm = gsap.matchMedia();
      mm.add("(min-width: 0px)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: { trigger: el, start: "top top", end: "+=320%", pin: true, scrub: 0.8, anticipatePin: 1 },
        });
        STOPS.slice(1).forEach((s, i) => {
          tl.to(img, { ...at(s), duration: 1 })
            .to(steps[i], { autoAlpha: 0, y: -24, duration: 0.4 }, "<")
            .to(steps[i + 1], { autoAlpha: 1, y: 0, duration: 0.4 }, "<0.5")
            .to({}, { duration: 0.4 });
        });
        // Pull back to the whole piece.
        tl.to(img, { scale: 1, xPercent: 0, yPercent: 0, duration: 1.2 })
          .to(steps[STOPS.length - 1], { autoAlpha: 0, y: -24, duration: 0.4 }, "<")
          .to(steps[STOPS.length], { autoAlpha: 1, y: 0, duration: 0.5 }, "<0.6")
          .to({}, { duration: 0.5 });
      });
      requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="spotlight-title" className="relative overflow-hidden bg-white">
      <div className="shell grid min-h-svh items-center gap-10 py-20 lg:grid-cols-12 lg:gap-10 lg:py-0">
        {/* The stage */}
        <div className="relative lg:col-span-7" data-cursor="View">
          <div className="relative overflow-hidden bg-ivory stage-frame">
            <div data-spot-image="" className="absolute inset-0 will-change-transform">
              <Image src={media.src} alt={media.alt} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
            </div>
          </div>
          <PetalCorner className="absolute -left-3 -top-3 size-16" />
        </div>

        {/* The words: one step at a time; with reduced motion, all of them in order. */}
        <div className="lg:col-span-4 lg:col-start-9">
          <p className="eyebrow flex items-center gap-4 text-gold-deep">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            The piece
          </p>
          <div className="mt-8 grid motion-safe:[&>*]:col-start-1 motion-safe:[&>*]:row-start-1">
            {STOPS.map((s, i) => (
              <div key={s.label} data-spot-step="" className="motion-reduce:mb-8">
                <p className="relative font-serif text-6xl font-light text-gold-deep figures">
                  <span aria-hidden="true" className="bg-jaali jaali-fade absolute -left-6 -top-6 size-28 opacity-60" />
                  <span className="relative">{String(i + 1).padStart(2, "0")}</span>
                </p>
                <h3 className="mt-2 font-serif text-3xl font-light text-ink">{s.label}</h3>
                <p className="mt-4 max-w-prose text-ink-soft">{s.line}</p>
              </div>
            ))}
            <div data-spot-step="">
              <h2 id="spotlight-title" className="display-section text-ink">
                <Link href={productPath(product)} className="link-draw">
                  {product.name}
                </Link>
              </h2>
              <p className="mt-4 text-sm text-stone figures">
                {product.code} · {product.purity} yellow gold · {formatGrams(product.weight)}
              </p>
              <p className="mt-4 font-serif text-3xl text-ink">
                <span aria-hidden="true" className="text-xl text-stone">≈ </span>
                <Price product={product} />
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <Button {...enquire} external icon={<WhatsAppIcon className="size-4" />}>
                  Enquire on WhatsApp
                </Button>
                <Link href={productPath(product)} className="eyebrow text-ink hover:text-gold-deep">
                  <span className="link-draw">See the piece</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
