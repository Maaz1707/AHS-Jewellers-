"use client";

import { useRef } from "react";
import { type Metal } from "@/data/rates";
import { site } from "@/data/site";
import { formatChange, formatINR } from "@/lib/format";
import { gsap, useGSAP, MOTION } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useRateInfo } from "../layout/useRateInfo";
import Button from "../ui/Button";
import RevealText from "../ui/RevealText";
import RollingNumber from "../ui/RollingNumber";
import TextLink from "../ui/TextLink";
import VideoBlock from "../ui/VideoBlock";
import IntroCurtain from "./IntroCurtain";

const BOARD: { metal: Metal; label: string }[] = [
  { metal: "24K", label: "24K gold" },
  { metal: "22K", label: "22K gold" },
  { metal: "silver", label: "Silver" },
];

/** Today’s rate as a slim board along the foot of the film. Figures roll into place. */
function RateBoard() {
  const { rates, previous, updated } = useRateInfo();
  return (
    <div aria-labelledby="hero-rate-title" role="region" className="absolute inset-x-0 bottom-0 z-10 border-t border-white/15 bg-ink/50 backdrop-blur-md">
      <div className="shell flex flex-col gap-3 py-4 md:flex-row md:items-center md:gap-10 md:py-5">
        <div className="flex items-center justify-between gap-6 md:block md:shrink-0">
          <p id="hero-rate-title" className="eyebrow text-gold-pale">
            Today’s rate
          </p>
          <p className="hidden text-xs text-white/60 md:mt-1 md:block">
            Per gram{updated ? <>, <time dateTime={updated.iso}>{updated.time}</time></> : null}
          </p>
          <span className="md:hidden">
            <TextLink href="/gold-rate" tone="light">
              Rate page
            </TextLink>
          </span>
        </div>
        <dl className="grid flex-1 grid-cols-3 divide-x divide-white/15 md:max-w-content">
          {BOARD.map(({ metal, label }) => (
            <div key={metal} className="flex flex-col gap-1 px-3 first:pl-0 md:px-8">
              <dt className="eyebrow text-white/60">{label}</dt>
              <dd className="font-serif text-xl leading-none text-white md:text-3xl">
                <RollingNumber text={formatINR(rates[metal])} />
              </dd>
              <dd className="text-micro text-white/60 figures">
                <span className="sr-only">Change since yesterday: </span>
                {formatChange(rates[metal], previous[metal])}
              </dd>
            </div>
          ))}
        </dl>
        <span className="hidden md:block md:shrink-0">
          <TextLink href="/gold-rate" tone="light">
            The full rate page
          </TextLink>
        </span>
      </div>
    </div>
  );
}

export default function Hero() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // The words fade in with CSS (.hero-fade), so they never wait for scripts to load.
      gsap.fromTo("[data-hero-media]", { scale: 1.08 }, { scale: 1, duration: MOTION.settle, ease: MOTION.ease });
    },
    { scope: section },
  );

  return (
    <>
      <IntroCurtain />
      <section ref={section} aria-label="Introduction" className="relative h-svh overflow-hidden bg-ink text-white" style={{ minHeight: "38rem" }}>
        <div data-hero-media="" className="absolute inset-0">
          <VideoBlock video="heroBride" eager priority control controlPosition="top-right" className="absolute inset-0" />
        </div>

        {/* Soft overlay: dark at the foot for the words, lighter through the face. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/80 via-ink/25 to-ink/30" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-r from-ink/40 to-transparent" />

        <div className="shell pointer-events-none relative flex h-full flex-col justify-end pb-40 md:pb-36">
          <p style={{ "--d": "0.1s" } as React.CSSProperties} className="hero-fade eyebrow flex items-center gap-4 text-gold-pale">
            <span aria-hidden="true" className="h-px w-8 bg-gold-pale" />
            {site.address.city} · Since {site.foundedYear}
          </p>
          <RevealText as="h1" immediate delay={0.1} className="mt-6 max-w-narrow display-hero">
            Gold, made to be <br />
            <em className="text-gold-pale">handed down.</em>
          </RevealText>
          <p style={{ "--d": "0.2s" } as React.CSSProperties} className="hero-fade mt-6 lede text-white/85">
            Bridal, diamond and everyday gold, made by our own karigars. Every piece hallmarked.
          </p>
          <div style={{ "--d": "0.3s" } as React.CSSProperties} className="hero-fade pointer-events-auto mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button href="/collections" variant="light" size="lg" arrow magnetic>
              Explore Collections
            </Button>
            <Button href="/book-a-visit" variant="outline-light" size="lg">
              Book a Visit
            </Button>
          </div>
        </div>

        <RateBoard />
      </section>
    </>
  );
}
