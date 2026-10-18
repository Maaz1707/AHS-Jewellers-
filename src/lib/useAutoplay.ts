"use client";

import { useCallback, useEffect, useState, type CSSProperties, type RefObject } from "react";
import { useReducedMotion, usePageVisible } from "./motion";

type Options = {
  /** Milliseconds each item stays before the next. */
  interval: number;
};

/**
 * Time-based cycling for tabs, slides and showcases. The progress bar on the
 * active item is a CSS animation whose end advances the cycle, so the bar and
 * the timing can never drift apart, and pausing is a single play-state switch.
 *
 * The cycle always carries on: a tap, swipe or hover only holds it for as long
 * as it lasts, then it resumes from wherever the visitor left it. It holds while
 * the block is off screen, while the mouse rests on the part marked `data-hold`,
 * under a finger, or while it holds keyboard focus. Only the visitor's own pause button stops it. Never runs with reduced
 * motion: everything is shown statically and moved with the controls.
 */
export function useAutoplay(root: RefObject<HTMLElement | null>, count: number, { interval }: Options) {
  const reduced = useReducedMotion();
  const pageVisible = usePageVisible();
  const [index, setIndex] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [touching, setTouching] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const enabled = !reduced && count > 1;
  const running = enabled && pageVisible && !stopped && !hovered && !touching && !focused && visible;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    // Hover holds the cycle only over the part being read (marked `data-hold`),
    // not the whole section: these sections fill the screen, so the mouse is
    // nearly always somewhere inside them.
    const over = (e: PointerEvent) => {
      if (e.pointerType === "mouse") setHovered(Boolean((e.target as Element).closest?.("[data-hold]")));
    };
    const leave = (e: PointerEvent) => e.pointerType === "mouse" && setHovered(false);
    const down = (e: PointerEvent) => e.pointerType !== "mouse" && setTouching(true);
    const up = () => setTouching(false);
    // Keyboard focus only: a mouse click on a tab should not hold the cycle.
    const focusIn = (e: FocusEvent) => (e.target as Element).matches?.(":focus-visible") && setFocused(true);
    const focusOut = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node | null)) setFocused(false);
    };
    el.addEventListener("pointerover", over);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("focusin", focusIn);
    el.addEventListener("focusout", focusOut);
    return () => {
      io.disconnect();
      el.removeEventListener("pointerover", over);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("focusin", focusIn);
      el.removeEventListener("focusout", focusOut);
    };
  }, [root]);

  const wrap = useCallback((i: number) => ((i % count) + count) % count, [count]);

  /** The visitor chose an item; the cycle carries on from there. */
  const pick = useCallback((i: number) => setIndex(wrap(i)), [wrap]);
  /** Keep the index in step with something the visitor scrolled. */
  const sync = pick;
  const next = useCallback(() => pick(index + 1), [pick, index]);
  const prev = useCallback(() => pick(index - 1), [pick, index]);
  const toggle = useCallback(() => setStopped((s) => !s), []);

  /**
   * Spread onto the progress bar of the active item (with the `autoplay-bar`
   * class). Render the bar inside the active item so it starts afresh each time.
   */
  const bar = {
    onAnimationEnd: () => {
      if (running) setIndex((i) => wrap(i + 1));
    },
    style: {
      animationDuration: `${interval}ms`,
      animationPlayState: running ? "running" : "paused",
    } as CSSProperties,
  };

  return { index, pick, sync, next, prev, toggle, stopped, running, enabled, bar };
}

/**
 * The item shown before the current one, so a swap can keep it underneath while
 * the new one arrives. `-1` until the first change.
 */
export function useSwap(index: number) {
  const [state, setState] = useState({ now: index, before: -1 });
  if (state.now !== index) setState({ now: index, before: state.now });
  return state.now !== index ? state.now : state.before;
}
