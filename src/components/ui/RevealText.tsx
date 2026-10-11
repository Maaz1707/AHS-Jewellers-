"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, MOTION } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Seconds before the first line moves. */
  delay?: number;
  /** Play on mount instead of on scroll (hero headings). */
  immediate?: boolean;
  /** Split into lines (headings) or fade the block as one (paragraphs). */
  mode?: "lines" | "block";
  id?: string;
};

/**
 * Heading reveal: SplitText breaks the text into masked lines that rise in one
 * after another. Re-splits automatically when fonts load or the width changes.
 */
export default function RevealText({ as: Tag = "div", children, className = "", delay = 0, immediate = false, mode = "lines", id }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        gsap.set(el, { visibility: "visible" });
        return;
      }

      const trigger = immediate ? undefined : { trigger: el, start: "top 88%", once: true };

      if (mode === "block") {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: MOTION.reveal, delay, ease: MOTION.ease, scrollTrigger: trigger },
        );
        return;
      }

      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "rl",
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { visibility: "visible" });
          return gsap.from(self.lines, {
            yPercent: 115,
            duration: MOTION.reveal,
            stagger: MOTION.stagger,
            delay,
            ease: "expo.out",
            scrollTrigger: trigger,
          });
        },
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} data-reveal="" className={className}>
      {children}
    </Tag>
  );
}
