"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { images } from "@/data/media";
import { productBySlug } from "@/data/products";
import { productPath, useProductEnquiry } from "@/lib/enquiry";
import { formatGrams } from "@/lib/format";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useLiveProduct } from "@/lib/pieces";
import { nearestItem, scrollToItem } from "@/lib/useDragScroll";
import Button from "../ui/Button";
import { Dots } from "../ui/Controls";
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

/** Centre a focus point, but never pan past the photograph's edge. */
const crop = (s: (typeof STOPS)[number]) => {
  const limit = (s.zoom - 1) * 50;
  const clamp = (v: number) => Math.max(-limit, Math.min(limit, v));
  return { scale: s.zoom, xPercent: clamp((0.5 - s.fx) * 100 * s.zoom), yPercent: clamp((0.5 - s.fy) * 100 * s.zoom) };
};

/** Loupe magnification, relative to the whole photograph on the stage. */
const LOUPE = 3.2;

/**
 * “The piece”: one necklace, very large. Desktop: the one pinned section on
 * the home page, for half a screen of scroll; the camera moves
 * across three close-ups and pulls back to the whole piece, and the pointer
 * works as a loupe. Below 1024px nothing pins: the close-ups are a swipeable
 * strip with their captions, then the piece itself.
 */
export default function Spotlight() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const lensInner = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLUListElement>(null);
  const [stripIndex, setStripIndex] = useState(0);
  const product = useLiveProduct(SLUG, seed) ?? seed;
  const enquire = useProductEnquiry(product);
  const media = images.bridalPolkiEmerald;

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const img = el.querySelector<HTMLElement>("[data-spot-image]");
        const steps = gsap.utils.toArray<HTMLElement>("[data-spot-step]", el);
        if (!img || !steps.length) return;
        gsap.set(img, crop(STOPS[0]));
        gsap.set(steps, { autoAlpha: 0, y: 24 });
        gsap.set(steps[0], { autoAlpha: 1, y: 0 });

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: { trigger: el, start: "top top", end: "+=50%", pin: true, scrub: 0.6, anticipatePin: 1 },
        });
        STOPS.slice(1).forEach((s, i) => {
          tl.to(img, { ...crop(s), duration: 1 })
            .to(steps[i], { autoAlpha: 0, y: -24, duration: 0.4 }, "<")
            .to(steps[i + 1], { autoAlpha: 1, y: 0, duration: 0.4 }, "<0.5")
            .to({}, { duration: 0.3 });
        });
        // Pull back to the whole piece.
        tl.to(img, { scale: 1, xPercent: 0, yPercent: 0, duration: 1.1 })
          .to(steps[STOPS.length - 1], { autoAlpha: 0, y: -24, duration: 0.4 }, "<")
          .to(steps[STOPS.length], { autoAlpha: 1, y: 0, duration: 0.5 }, "<0.5")
          .to({}, { duration: 0.3 });
      });
      requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => mm.revert();
    },
    { scope: root },
  );

  // The loupe: a round lens that follows the pointer and magnifies whatever is under it.
  const moveLens = (e: React.PointerEvent) => {
    const box = stage.current?.querySelector<HTMLElement>("[data-spot-image]");
    const l = lens.current;
    const inner = lensInner.current;
    const frame = stage.current;
    if (e.pointerType !== "mouse" || !box || !l || !inner || !frame) return;
    const f = frame.getBoundingClientRect();
    const r = box.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    const fy = (e.clientY - r.top) / r.height;
    const W = f.width * LOUPE;
    const H = f.height * LOUPE;
    const R = l.offsetWidth / 2;
    l.style.opacity = "1";
    l.style.transform = `translate3d(${e.clientX - f.left - R}px, ${e.clientY - f.top - R}px, 0)`;
    inner.style.width = `${W}px`;
    inner.style.height = `${H}px`;
    inner.style.transform = `translate3d(${R - fx * W}px, ${R - fy * H}px, 0)`;
  };
  const hideLens = () => {
    if (lens.current) lens.current.style.opacity = "0";
  };

  const finalStep = (
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
  );

  return (
    <section ref={root} aria-labelledby="spotlight-title" className="relative overflow-hidden bg-white section-y lg:h-svh lg:py-0">
      <div className="shell grid gap-8 lg:h-full lg:grid-cols-12 lg:items-center lg:gap-10">
        <p className="eyebrow flex items-center gap-4 text-gold-deep lg:hidden">
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
          The piece
        </p>

        <div className="min-w-0 lg:col-span-7">
          {/* Desktop: the stage, with a loupe */}
          <div className="relative hidden lg:block">
            <div
              ref={stage}
              onPointerMove={moveLens}
              onPointerLeave={hideLens}
              className="relative overflow-hidden bg-ivory stage-frame"
            >
              <div data-spot-image="" className="absolute inset-0 will-change-transform">
                {/* The camera zooms to 2.6×, so the stage asks for a wide file. */}
                <Image src={media.src} alt={media.alt} fill sizes="150vw" className="object-cover" />
              </div>
              <div
                ref={lens}
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 z-10 size-48 overflow-hidden rounded-full border border-white bg-ivory opacity-0 shadow-panel transition-opacity duration-300"
              >
                <div ref={lensInner} className="absolute left-0 top-0 size-full">
                  <Image src={media.src} alt="" fill sizes="200vw" className="object-cover" />
                </div>
              </div>
              <p className="pointer-events-none absolute bottom-4 right-4 z-10 bg-white/90 px-3 py-1 text-xs text-stone">Move across the piece to look closer</p>
            </div>
            <PetalCorner className="absolute -left-3 -top-3 size-16" />
          </div>

          {/* Below 1024px: the close-ups as a swipeable strip */}
          <div className="lg:hidden">
            <ul
              ref={strip}
              onScroll={() => strip.current && setStripIndex(nearestItem(strip.current))}
              aria-label="Close-ups of the piece"
              className="no-scrollbar -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 md:-mx-10 md:scroll-px-10 md:px-10"
            >
              {STOPS.map((s, i) => {
                const c = crop(s);
                return (
                  <li key={s.label} className="swipe-card shrink-0 snap-start">
                    <div className="relative aspect-square overflow-hidden bg-ivory">
                      <div
                        className="absolute inset-0"
                        style={{ transform: `translate(${c.xPercent}%, ${c.yPercent}%) scale(${c.scale})` }}
                      >
                        <Image src={media.src} alt="" fill sizes="(min-width: 768px) 44vw, 78vw" className="object-cover" />
                      </div>
                    </div>
                    <p className="mt-4 flex items-baseline gap-3">
                      <span className="font-serif text-3xl font-light text-gold-deep figures">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-serif text-2xl font-light text-ink">{s.label}</span>
                    </p>
                    <p className="mt-2 text-sm text-ink-soft">{s.line}</p>
                  </li>
                );
              })}
            </ul>
            <Dots
              className="mt-6"
              count={STOPS.length}
              active={stripIndex}
              onPick={(i) => strip.current && scrollToItem(strip.current, i)}
              label="Close-ups"
              names={STOPS.map((s) => s.label)}
            />
          </div>
        </div>

        {/* The words: on desktop one step at a time; with reduced motion, all of them in order. */}
        <div className="lg:col-span-4 lg:col-start-9">
          <p className="hidden items-center gap-4 eyebrow text-gold-deep lg:flex">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            The piece
          </p>
          <div className="grid lg:mt-8 lg:motion-safe:[&>*]:col-start-1 lg:motion-safe:[&>*]:row-start-1">
            {STOPS.map((s, i) => (
              <div key={s.label} data-spot-step="" className="hidden motion-reduce:mb-8 lg:block">
                <p className="relative font-serif text-6xl font-light text-gold-deep figures">
                  <span aria-hidden="true" className="bg-jaali jaali-fade absolute -left-6 -top-6 size-28 opacity-60" />
                  <span className="relative">{String(i + 1).padStart(2, "0")}</span>
                </p>
                <h3 className="mt-2 font-serif text-3xl font-light text-ink">{s.label}</h3>
                <p className="mt-4 max-w-prose text-ink-soft">{s.line}</p>
              </div>
            ))}
            {finalStep}
          </div>
        </div>
      </div>
    </section>
  );
}
