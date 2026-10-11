"use client";

import Image from "@/components/ui/Img";
import { useRef } from "react";
import { images, type ImageKey } from "@/data/media";
import { gsap, useGSAP, MOTION } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

type Props = {
  image: ImageKey;
  sizes: string;
  /** Tailwind aspect / height classes for the frame. */
  className?: string;
  /** Parallax travel as a percentage of the frame height. 0 disables. */
  parallax?: number;
  /** Direction the mask opens from. */
  from?: "bottom" | "top" | "left" | "right";
  priority?: boolean;
  /** Slow zoom inside the frame when a parent `.group` is hovered. */
  hoverZoom?: boolean;
  /** Override alt text from media.ts. */
  alt?: string;
  objectPosition?: string;
  /** Play immediately rather than on scroll. */
  immediate?: boolean;
  delay?: number;
};

const clipFrom = {
  bottom: "inset(100% 0% 0% 0%)",
  top: "inset(0% 0% 100% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
};

/**
 * Masked image reveal: the frame opens like a blind while the photograph settles
 * from a slight zoom. Optional scroll-linked parallax inside the fixed frame.
 */
export default function RevealImage({
  image,
  sizes,
  className = "",
  parallax = 0,
  from = "bottom",
  priority = false,
  hoverZoom = false,
  alt,
  objectPosition = "50% 50%",
  immediate = false,
  delay = 0,
}: Props) {
  const frame = useRef<HTMLDivElement>(null);
  const travel = useRef<HTMLDivElement>(null);
  const settle = useRef<HTMLDivElement>(null);
  const media = images[image];

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const trigger = immediate ? undefined : { trigger: frame.current, start: "top 90%", once: true };

      gsap.fromTo(
        frame.current,
        { clipPath: clipFrom[from] },
        { clipPath: "inset(0% 0% 0% 0%)", duration: MOTION.reveal, delay, ease: MOTION.ease, scrollTrigger: trigger },
      );
      gsap.fromTo(
        settle.current,
        { scale: 1.1 },
        { scale: 1, duration: MOTION.settle, delay, ease: MOTION.ease, scrollTrigger: trigger },
      );

      if (parallax > 0) {
        gsap.fromTo(
          travel.current,
          { yPercent: -parallax },
          {
            yPercent: parallax,
            ease: "none",
            scrollTrigger: { trigger: frame.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      }
    },
    { scope: frame, dependencies: [parallax, from, immediate] },
  );

  const bleed = parallax > 0 ? `${-parallax * 1.2}%` : "0%";

  return (
    <div ref={frame} className={`relative overflow-hidden bg-ivory-deep ${className}`}>
      <div ref={travel} className="absolute inset-x-0" style={{ top: bleed, bottom: bleed }}>
        <div ref={settle} className="absolute inset-0">
          <Image
            src={media.src}
            alt={alt ?? media.alt}
            fill
            sizes={sizes}
            priority={priority}
            className={`object-cover ${
              hoverZoom ? "transition-transform duration-1000 ease-luxe group-hover:scale-105" : ""
            }`}
            style={{ objectPosition }}
          />
        </div>
      </div>
    </div>
  );
}
