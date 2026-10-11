"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { introPlaying } from "@/lib/intro";
import Monogram from "../ui/Monogram";

/**
 * First-visit opening: the monogram draws itself in gold line, then the hero
 * film is revealed through an opening in the curtain that widens from the
 * centre. Under two seconds; any click, key or scroll skips it. Rendered on
 * the home page only and shown only when `html[data-intro]` is set.
 */
export default function IntroCurtain() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !introPlaying()) return;
    const done = () => {
      document.documentElement.removeAttribute("data-intro");
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("keydown", skip);
    };
    const tl = gsap.timeline({ onComplete: done });
    const skip = () => tl.progress(1);

    gsap.set(el.querySelectorAll('[data-draw="frame"]'), { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(el.querySelectorAll('[data-draw="letters"], [data-draw="detail"]'), { autoAlpha: 0 });
    el.style.setProperty("--hole", "0px");

    tl.to(el.querySelectorAll('[data-draw="frame"]'), { strokeDashoffset: 0, duration: 0.85, ease: "power2.inOut", stagger: 0.08 })
      .to(el.querySelectorAll('[data-draw="letters"]'), { autoAlpha: 1, duration: 0.4, ease: "power1.out" }, 0.45)
      .to(el.querySelectorAll('[data-draw="detail"]'), { autoAlpha: 1, duration: 0.3 }, 0.7)
      .to(el.querySelector("[data-intro-mark]"), { autoAlpha: 0, scale: 0.96, duration: 0.35, ease: "power2.in" }, 1.05)
      .to(el, { "--hole": "150vmax", duration: 0.7, ease: "expo.in" }, 1.05);

    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    window.addEventListener("keydown", skip);
    return () => {
      tl.kill();
      done();
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="intro-curtain fixed inset-0 z-60 items-center justify-center bg-ivory"
      style={{
        WebkitMaskImage: "radial-gradient(circle at 50% 50%, transparent var(--hole, 0px), #000 calc(var(--hole, 0px) + 1px))",
        maskImage: "radial-gradient(circle at 50% 50%, transparent var(--hole, 0px), #000 calc(var(--hole, 0px) + 1px))",
      }}
      onClick={() => document.documentElement.removeAttribute("data-intro")}
    >
      <div data-intro-mark="" className="flex flex-col items-center gap-6">
        <Monogram className="h-48 w-auto text-ink md:h-80" />
      </div>
      <button
        type="button"
        tabIndex={-1}
        className="absolute bottom-8 right-8 eyebrow text-stone hover:text-ink"
        onClick={() => document.documentElement.removeAttribute("data-intro")}
      >
        Skip
      </button>
    </div>
  );
}
