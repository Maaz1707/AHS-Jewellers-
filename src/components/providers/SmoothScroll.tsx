"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/motion";
import { useUI } from "@/store";

let lenis: Lenis | null = null;

/** The active Lenis instance, or null when motion is reduced or before mount. */
export const getLenis = () => lenis;

/** Scroll to a target with Lenis when available, natively otherwise. */
export function scrollToTarget(target: number | string | HTMLElement, opts?: { immediate?: boolean; offset?: number }) {
  if (lenis) {
    lenis.scrollTo(target, { immediate: opts?.immediate, offset: opts?.offset ?? 0, force: true });
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  const top =
    typeof el === "number" ? el : el ? el.getBoundingClientRect().top + window.scrollY + (opts?.offset ?? 0) : 0;
  window.scrollTo({ top, behavior: opts?.immediate ? "auto" : "smooth" });
}

export default function SmoothScroll() {
  const reduced = useReducedMotion();
  const overlay = useUI((s) => s.overlay);

  useEffect(() => {
    if (reduced) return;

    // A wheel notch travels the same distance as native scrolling, and arrives
    // about as quickly: smoothing only, never slower, never snapping. Touch
    // keeps the device's own scrolling.
    const instance = new Lenis({
      lerp: 0.16,
      smoothWheel: true,
      wheelMultiplier: 1,
      syncTouch: false,
      // Smooth in-page anchor links, landing clear of the fixed header.
      anchors: { offset: -112 },
    });
    lenis = instance;
    // Development only: lets browser tooling drive the smooth scroller.
    if (process.env.NODE_ENV !== "production") (window as Window & { __lenis?: Lenis }).__lenis = instance;

    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenis = null;
    };
  }, [reduced]);

  // Lock page scroll while any overlay is open.
  useEffect(() => {
    const root = document.documentElement;
    if (overlay) {
      lenis?.stop();
      const scrollbar = window.innerWidth - root.clientWidth;
      root.style.overflow = "hidden";
      if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
    } else {
      lenis?.start();
      root.style.overflow = "";
      root.style.paddingRight = "";
    }
  }, [overlay]);

  return null;
}
