"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Desktop-only cursor companion: a small gold dot that follows the pointer and
 * opens into a labelled circle (“View”, “Drag”) over elements marked
 * with `data-cursor`. The system cursor is hidden only over those elements.
 * Not rendered for touch, coarse pointers or reduced motion.
 */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const check = () => setEnabled(fine.matches && !prefersReducedMotion());
    check();
    fine.addEventListener("change", check);
    return () => fine.removeEventListener("change", check);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = ring.current;
    if (!el) return;
    document.documentElement.classList.add("has-cursor");
    let x = -100;
    let y = -100;
    let cx = x;
    let cy = y;
    let raf = 0;
    let shown = false;

    const tick = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        cx = x;
        cy = y;
        shown = true;
        el.style.opacity = "1";
      }
      const target = (e.target as Element | null)?.closest?.("[data-cursor]");
      setLabel(target ? target.getAttribute("data-cursor") : null);
    };
    const onLeave = () => {
      shown = false;
      el.style.opacity = "0";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={ring} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-70 opacity-0 transition-opacity duration-300">
      <div
        className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-[width,height,background-color] duration-500 ease-luxe ${
          label ? "size-20 bg-ink/85 backdrop-blur-sm" : "size-2 bg-gold"
        }`}
      >
        <span className={`eyebrow text-white transition-opacity duration-300 ${label ? "opacity-100 delay-100" : "opacity-0"}`}>{label}</span>
      </div>
    </div>
  );
}
