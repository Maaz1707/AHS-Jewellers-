"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import type { ImageKey, VideoKey } from "@/data/media";
import { gsap, useGSAP, MOTION } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import RevealImage from "../ui/RevealImage";
import RevealText from "../ui/RevealText";
import VideoBlock from "../ui/VideoBlock";

type Props = {
  eyebrow: string;
  title: string;
  /** Two short lines of copy. */
  lines: [string, string];
  image: ImageKey;
  video?: VideoKey;
  trail: { label: string; href: string }[];
  meta?: ReactNode;
  objectPosition?: string;
};

/** Full-bleed opening for a collection or category: photograph or film, title and two lines. */
export default function CollectionHero({ eyebrow, title, lines, image, video, trail, meta, objectPosition }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set("[data-hero-fade]", { autoAlpha: 1 });
        return;
      }
      gsap.fromTo("[data-hero-fade]", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: MOTION.reveal, delay: 0.5, stagger: MOTION.stagger, ease: "expo.out" });
      gsap.to("[data-hero-media]", {
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-ink text-white" style={{ height: "78svh", minHeight: "32rem" }}>
      <div data-hero-media="" className="absolute inset-0">
        {video ? (
          <VideoBlock video={video} eager priority control className="absolute inset-0" />
        ) : (
          <RevealImage image={image} priority immediate sizes="100vw" className="h-full" objectPosition={objectPosition} />
        )}
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/80 via-ink/20 to-ink/30" />

      <div className="shell pointer-events-none relative flex h-full flex-col justify-end pb-16 md:pb-20">
        <nav aria-label="Breadcrumb" data-hero-fade="" data-reveal="" className="pointer-events-auto mb-8">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-white/70">
            <li>
              <Link href="/" className="link-draw hover:text-white">
                Home
              </Link>
            </li>
            {trail.map((t, i) => (
              <li key={t.href} className="flex items-center gap-2">
                <span aria-hidden="true">/</span>
                {i === trail.length - 1 ? (
                  <span aria-current="page" className="text-white">
                    {t.label}
                  </span>
                ) : (
                  <Link href={t.href} className="link-draw hover:text-white">
                    {t.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <p data-hero-fade="" data-reveal="" className="eyebrow flex items-center gap-4 text-gold-pale">
          <span aria-hidden="true" className="h-px w-8 bg-gold-pale" />
          {eyebrow}
          {meta ? <span className="text-white/60">· {meta}</span> : null}
        </p>
        <RevealText as="h1" immediate delay={0.3} className="mt-6 display-hero">
          {title}
        </RevealText>
        <div data-hero-fade="" data-reveal="" className="mt-6 lede text-white/85">
          <p>{lines[0]}</p>
          <p>{lines[1]}</p>
        </div>
      </div>
    </section>
  );
}
