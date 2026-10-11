"use client";

import { useRef } from "react";
import { site } from "@/data/site";
import { gsap, useGSAP, MOTION } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import Button from "../ui/Button";
import RevealText from "../ui/RevealText";
import VideoBlock from "../ui/VideoBlock";

export default function Hero() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // The words fade in with CSS (.hero-fade), so they never wait for scripts to load.
      gsap.fromTo("[data-hero-media]", { scale: 1.08 }, { scale: 1, duration: MOTION.settle, ease: MOTION.ease });

      // As the page scrolls on, the film drifts and the words step back.
      const tl = gsap.timeline({
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom top", scrub: true },
      });
      tl.to("[data-hero-parallax]", { yPercent: 18, ease: "none" }, 0).to(
        "[data-hero-content]",
        { yPercent: -18, autoAlpha: 0.2, ease: "none" },
        0,
      );
    },
    { scope: section },
  );

  return (
    <section ref={section} aria-label="Introduction" className="relative h-svh overflow-hidden bg-ink text-white" style={{ minHeight: "36rem" }}>
      <div data-hero-parallax="" className="absolute inset-0">
        <div data-hero-media="" className="absolute inset-0">
          <VideoBlock video="heroBride" eager priority control controlPosition="bottom-right" className="absolute inset-0" />
        </div>
      </div>

      {/* Soft overlay: dark at the foot for the words, lighter through the face. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/80 via-ink/25 to-ink/30" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-r from-ink/40 to-transparent" />

      <div data-hero-content="" className="shell pointer-events-none relative flex h-full flex-col justify-end pb-24 md:pb-32">
        <p style={{ "--d": "0.3s" } as React.CSSProperties} className="hero-fade eyebrow flex items-center gap-4 text-gold-pale">
          <span aria-hidden="true" className="h-px w-8 bg-gold-pale" />
          {site.address.city} · Since {site.foundedYear}
        </p>
        <RevealText
          as="h1"
          immediate
          delay={0.35}
          className="mt-6 max-w-narrow display-hero"
        >
          Gold, made to be <br />
          <em className="text-gold-pale">handed down.</em>
        </RevealText>
        <p style={{ "--d": "0.55s" } as React.CSSProperties} className="hero-fade mt-6 lede text-white/85">
          Bridal, diamond and everyday gold, made by our own karigars. Every piece hallmarked.
        </p>
        <div style={{ "--d": "0.7s" } as React.CSSProperties} className="hero-fade pointer-events-auto mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button href="/collections" variant="light" size="lg" arrow magnetic>
            Explore Collections
          </Button>
          <Button href="/book-a-visit" variant="outline-light" size="lg">
            Book a Visit
          </Button>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        style={{ "--d": "1.1s" } as React.CSSProperties}
        className="hero-fade absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
      >
        <span className="eyebrow text-white/70">Scroll</span>
        <span className="relative block h-12 w-px overflow-hidden bg-white/20">
          <span className="absolute inset-0 animate-cue bg-white" />
        </span>
      </div>
    </section>
  );
}
