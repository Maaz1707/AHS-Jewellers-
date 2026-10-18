"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, MOTION } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/motion";

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Seconds before the first line moves. */
  delay?: number;
  /** Render immediately without a reveal (first-screen headings). */
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
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    // First-screen copy paints directly from HTML. Below-fold headings are
    // measured only on entry, avoiding a page-wide SplitText layout pass.
    if (!el || reduced || immediate) return;
    let context: gsap.Context | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      context = gsap.context(() => {
        if (mode === "block") {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: MOTION.reveal, delay: Math.min(delay, 0.1), ease: MOTION.ease },
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
              stagger: { amount: 0.1 },
              delay: Math.min(delay, 0.1),
              ease: MOTION.ease,
            });
          },
        });
      }, el);
    }, { rootMargin: "0px 0px -8% 0px" });
    observer.observe(el);
    return () => { observer.disconnect(); context?.revert(); };
  }, [reduced, immediate, mode, delay]);

  return (
    <Tag ref={ref} id={id} data-reveal="" className={className}>
      {children}
    </Tag>
  );
}
