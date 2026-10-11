"use client";

import { scrollToTarget } from "../providers/SmoothScroll";
import { ArrowRight } from "../ui/Icons";

/** Return to the top of the page, then hand focus to the skip-link target so keyboard users start again from the top. */
export default function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => {
        scrollToTarget(0);
        document.getElementById("main")?.focus({ preventScroll: true });
      }}
      className="group inline-flex items-center gap-3 eyebrow text-white/75 transition-colors duration-300 hover:text-white"
    >
      <span className="relative flex size-10 items-center justify-center rounded-full border border-white/25 transition-colors duration-300 group-hover:border-gold-pale">
        <ArrowRight className="size-4 -rotate-90 transition-transform duration-500 ease-luxe group-hover:-translate-y-1" />
      </span>
      <span className="link-draw">Back to top</span>
    </button>
  );
}
