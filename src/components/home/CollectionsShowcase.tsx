"use client";

import Image from "@/components/ui/Img";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { collections } from "@/data/collections";
import { images } from "@/data/media";
import { useAutoplay, useSwap } from "@/lib/useAutoplay";
import { nearestItem, scrollToItem } from "@/lib/useDragScroll";
import { useVisibleProducts } from "@/lib/pieces";
import { Dots, PlayPause } from "../ui/Controls";
import { ArrowRight } from "../ui/Icons";
import SectionHeading from "../ui/SectionHeading";
import TextLink from "../ui/TextLink";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * One screen. Tablets and desktop: the five collection names as a list beside
 * one large photograph that changes behind a soft band of gold light as a name
 * is hovered, focused or tapped. Phones: a swipeable row of cards with dots.
 * Cycles every four seconds until the visitor takes over.
 */
export default function CollectionsShowcase() {
  const visible = useVisibleProducts();
  const countIn = (slug: string) => visible.filter((p) => p.collection === slug).length;
  const section = useRef<HTMLElement>(null);
  const play = useAutoplay(section, collections.length, { interval: 4000 });
  const { index, sync } = play;
  const before = useSwap(index);
  const row = useRef<HTMLUListElement>(null);
  const frame = useRef<number>(0);

  // Phones: the row follows the cycle, and the dots follow the row.
  useEffect(() => {
    const el = row.current;
    if (!el || el.offsetParent === null) return;
    if (nearestItem(el) !== index) scrollToItem(el, index);
  }, [index]);
  const onRowScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => row.current && sync(nearestItem(row.current)));
  };

  const active = collections[index];

  return (
    <section ref={section} aria-labelledby="collections-title" className="bg-white screen-fit">
      <div className="shell grid gap-10 md:grid-cols-12 md:items-center lg:gap-10">
        <div className="md:col-span-5">
          <SectionHeading
            id="collections-title"
            size="md"
            eyebrow="The collections"
            title={
              <>
                Five ways
                <br />
                to wear gold
              </>
            }
            intro="From the wedding trousseau to the chain you never take off. Each collection is made in our workshop and priced at today’s rate."
          />

          {/* Tablets and desktop: the list */}
          <ol data-hold="" className="mt-10 hidden border-b border-line md:block">
            {collections.map((c, i) => {
              const on = i === index;
              return (
                <li key={c.slug} className="relative border-t border-line">
                  {on ? (
                    <span aria-hidden="true" className="absolute inset-x-0 -top-px h-px overflow-hidden">
                      {play.enabled ? <span {...play.bar} className="autoplay-bar absolute inset-0 origin-left bg-gold" /> : <span className="absolute inset-0 bg-gold" />}
                    </span>
                  ) : null}
                  <Link
                    href={`/collections/${c.slug}`}
                    onPointerEnter={(e) => e.pointerType === "mouse" && play.pick(i)}
                    onFocus={() => play.pick(i)}
                    aria-current={on ? "true" : undefined}
                    className="group flex items-baseline gap-5 py-3"
                  >
                    <span className={`eyebrow figures transition-colors duration-300 ${on ? "text-gold-deep" : "text-stone"}`}>{pad(i + 1)}</span>
                    <span
                      className={`font-serif text-2xl font-light transition-colors duration-300 lg:text-3xl ${
                        on ? "text-ink" : "text-stone group-hover:text-ink"
                      }`}
                    >
                      {c.name}
                    </span>
                    <span className={`ml-auto shrink-0 eyebrow transition-opacity duration-300 ${on ? "text-gold-deep opacity-100" : "text-stone opacity-0 group-hover:opacity-100"}`}>
                      {countIn(c.slug)} pieces
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>

          <div className="mt-8 hidden items-center gap-6 md:flex">
            <TextLink href="/collections">All collections</TextLink>
            <PlayPause enabled={play.enabled} stopped={play.stopped} onToggle={play.toggle} label="the collections" className="ml-auto" />
          </div>
        </div>

        {/* Tablets and desktop: one large photograph */}
        <div className="hidden md:col-span-7 md:block">
          <Link
            href={`/collections/${active.slug}`}
            tabIndex={-1}
            aria-hidden="true"
            data-hold=""
            className="group relative block overflow-hidden bg-ivory screen-frame"
          >
            {collections.map((c, i) => {
              const on = i === index;
              const under = i === before;
              return (
                <span
                  key={c.slug}
                  className={`absolute inset-0 ${on ? `z-2 ${before >= 0 ? "wipe-in" : ""}` : under ? "z-1" : "opacity-0"}`}
                >
                  <span className={`absolute inset-0 block ${on ? "ken-burns" : ""}`}>
                    <Image src={images[c.cover].src} alt="" fill sizes="(min-width: 1024px) 55vw, 58vw" className="object-cover" />
                  </span>
                </span>
              );
            })}
            {before >= 0 ? <span key={`light-${index}`} aria-hidden="true" className="wipe-light z-3" /> : null}
            <span aria-hidden="true" className="absolute inset-0 z-4 bg-linear-to-t from-ink/60 via-transparent to-transparent" />
            <span key={`cap-${index}`} className="rise-in absolute inset-x-6 bottom-6 z-5 flex items-end justify-between gap-6 text-white lg:inset-x-10 lg:bottom-10">
              <span>
                <span className="block eyebrow text-gold-pale">
                  {pad(index + 1)} / {pad(collections.length)}
                </span>
                <span className="mt-3 block font-serif text-4xl font-light lg:text-5xl">{active.name}</span>
                <span className="mt-2 block max-w-prose text-sm text-white/80">{active.line}</span>
              </span>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/50 transition-colors duration-500 group-hover:border-white group-hover:bg-white group-hover:text-ink">
                <ArrowRight className="size-4" />
              </span>
            </span>
          </Link>
        </div>
      </div>

      {/* Phones: swipeable cards with dots */}
      <div className="mt-10 md:hidden">
        <ul
          ref={row}
          onScroll={onRowScroll}
          className="no-scrollbar flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5"
        >
          {collections.map((c, i) => (
            <li key={c.slug} className="swipe-card shrink-0 snap-start">
              <Link href={`/collections/${c.slug}`} className="group block">
                <span className="relative block aspect-portrait overflow-hidden bg-ivory">
                  <Image src={images[c.cover].src} alt={images[c.cover].alt} fill sizes="78vw" className="object-cover" />
                  <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/60 via-transparent to-transparent" />
                  <span className="absolute left-5 top-5 eyebrow text-white/85">{pad(i + 1)}</span>
                  <span className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-white">
                    <span className="font-serif text-3xl font-light">{c.name}</span>
                    <span className="eyebrow text-gold-pale">{countIn(c.slug)} pieces</span>
                  </span>
                </span>
                <span className="mt-3 block text-sm text-stone">{c.line}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="shell mt-6 flex items-center gap-5">
          <Dots
            count={collections.length}
            active={index}
            onPick={(i) => play.pick(i)}
            label="Collections"
            names={collections.map((c) => c.name)}
            bar={play.enabled ? play.bar : undefined}
          />
          <PlayPause enabled={play.enabled} stopped={play.stopped} onToggle={play.toggle} label="the collections" className="ml-auto" />
        </div>
        <div className="shell mt-4">
          <TextLink href="/collections">All collections</TextLink>
        </div>
      </div>
    </section>
  );
}
