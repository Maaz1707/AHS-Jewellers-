"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger, MOTION } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useUI } from "@/store";
import { scrollToTarget } from "./SmoothScroll";

/**
 * Route transitions. Internal link clicks raise an ivory curtain, navigate, then
 * lift the curtain off the new page. Back/forward and reduced-motion users get a
 * quiet fade only.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const curtain = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const pending = useRef(false);
  const safety = useRef<number | undefined>(undefined);
  const firstRender = useRef(true);
  const closeOverlay = useUI((s) => s.close);

  // Intercept internal anchor clicks.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (anchor.dataset.transition === "off") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const samePage = url.pathname === window.location.pathname && url.search === window.location.search;
      if (samePage) {
        // Same page: close any overlay and glide to the top or the hash.
        e.preventDefault();
        closeOverlay();
        scrollToTarget(url.hash || 0);
        return;
      }

      e.preventDefault();
      const destination = url.pathname + url.search + url.hash;

      if (prefersReducedMotion() || !curtain.current) {
        router.push(destination);
        return;
      }

      pending.current = true;
      gsap.killTweensOf(curtain.current);
      gsap.fromTo(
        curtain.current,
        { yPercent: 100, visibility: "visible" },
        {
          yPercent: 0,
          duration: 0.6,
          ease: "power4.inOut",
          onComplete: () => {
            closeOverlay();
            router.push(destination);
          },
        },
      );
      // Never leave the curtain down if navigation stalls.
      window.clearTimeout(safety.current);
      safety.current = window.setTimeout(() => liftCurtain(), 5000);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router, closeOverlay]);

  function liftCurtain() {
    if (!curtain.current) return;
    window.clearTimeout(safety.current);
    pending.current = false;
    gsap.to(curtain.current, {
      yPercent: -100,
      duration: MOTION.fast,
      delay: 0.08,
      ease: "power4.inOut",
      onComplete: () => {
        gsap.set(curtain.current, { yPercent: 100, visibility: "hidden" });
      },
    });
  }

  // New route mounted.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    closeOverlay();
    scrollToTarget(0, { immediate: true });
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

    if (prefersReducedMotion()) return () => cancelAnimationFrame(raf);

    if (pending.current) liftCurtain();
    if (content.current) {
      gsap.fromTo(
        content.current,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: MOTION.base, delay: pending.current ? 0.2 : 0, ease: MOTION.ease, clearProps: "transform,opacity,visibility" },
      );
    }
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <div ref={content}>{children}</div>
      <div
        ref={curtain}
        aria-hidden="true"
        className="invisible fixed inset-0 z-60 flex translate-y-full items-center justify-center bg-ivory"
      >
        <div className="flex flex-col items-center gap-4">
          <span className="font-serif text-3xl tracking-logo text-ink">AHS</span>
          <span className="h-px w-16 bg-gold" />
        </div>
      </div>
    </>
  );
}
