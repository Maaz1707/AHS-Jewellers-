"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A number whose digits roll into place like a mechanical board when it first
 * comes into view, and again whenever it changes. Screen readers get the value
 * as plain text. Reduced motion: the global rule removes the transition.
 */
export default function RollingNumber({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const chars = [...text];
  const digitCount = chars.filter((c) => /\d/.test(c)).length;
  let d = 0;

  return (
    <span ref={ref} className={`relative inline-flex figures ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex">
        {chars.map((c, i) => {
          if (!/\d/.test(c)) return <span key={i}>{c}</span>;
          const n = Number(c);
          const order = d++;
          return (
            <span key={i} className="relative inline-block overflow-hidden" style={{ height: "1.1em", lineHeight: "1.1em" }}>
              {/* Invisible digit holds the width so the column never jumps. */}
              <span className="invisible">{c}</span>
              <span
                className="absolute inset-x-0 top-0 flex flex-col transition-transform ease-luxe"
                style={{
                  transform: `translateY(${shown ? -n * 1.1 : 0}em)`,
                  transitionDuration: "1400ms",
                  transitionDelay: `${(digitCount - order) * 60}ms`,
                }}
              >
                {Array.from({ length: 10 }, (_, k) => (
                  <span key={k} style={{ height: "1.1em" }}>
                    {k}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
