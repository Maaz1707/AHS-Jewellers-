"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

const TONES = {
  gold: { "--sheen-tone": "var(--color-gold-deep)", "--sheen-light": "var(--color-gold-pale)" },
  "gold-pale": { "--sheen-tone": "var(--color-gold-pale)", "--sheen-light": "var(--color-white)" },
  emerald: { "--sheen-tone": "var(--color-emerald)", "--sheen-light": "var(--color-gold)" },
} as const;

/**
 * A gold (or emerald) phrase that catches one sweep of light the first time it
 * comes into view. Children must not set their own text colour.
 */
export default function Sheen({
  children,
  tone = "gold",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.setAttribute("data-in", "");
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={ref} className={`sheen ${className}`} style={TONES[tone] as CSSProperties}>
      {children}
    </span>
  );
}
