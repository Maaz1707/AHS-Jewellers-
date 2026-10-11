"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

/**
 * The motion scale. Every GSAP tween uses these, so reveals and staggers feel
 * the same on every page. expo.out matches --ease-luxe in globals.css.
 */
export const MOTION = {
  ease: "expo.out",
  /** Menus, filters, page transitions. */
  fast: 0.6,
  /** Content arriving after a navigation. */
  base: 0.9,
  /** Headlines, images and cards revealed on scroll. */
  reveal: 1.2,
  /** Photographs settling from a slight zoom. */
  settle: 1.6,
  /** Between items in a group. */
  stagger: 0.08,
} as const;

let registered = false;

if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.defaults({ ease: MOTION.ease, duration: MOTION.reveal });
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

/** House easing, matching --ease-luxe and --ease-curtain in globals.css. */
export const EASE = {
  luxe: "expo.out",
  curtain: "power4.inOut",
  soft: "power2.out",
} as const;

export { gsap, ScrollTrigger, SplitText, useGSAP };
