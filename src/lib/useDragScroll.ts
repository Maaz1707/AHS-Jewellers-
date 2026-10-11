"use client";

import { useEffect, type RefObject } from "react";
import { prefersReducedMotion } from "./motion";

/**
 * Lets a mouse drag a horizontally scrolling row, the way a finger already can,
 * with a little momentum after release and a settle onto the nearest item when
 * the row snaps. A drag never counts as a click on the links inside it.
 * Touch keeps the browser's own scrolling, which already has both.
 */
export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startX = 0;
    let startLeft = 0;
    let down = false;
    let moved = false;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let raf = 0;

    const snaps = () => getComputedStyle(el).scrollSnapType !== "none";

    /** Glide to the nearest item start, then hand snapping back to the browser. */
    const settle = () => {
      if (!el.style.scrollSnapType) return;
      scrollToItem(el, nearestItem(el));
      window.setTimeout(() => {
        el.style.scrollSnapType = "";
      }, 450);
    };

    const glide = () => {
      velocity *= 0.92;
      el.scrollLeft -= velocity;
      if (Math.abs(velocity) > 0.4) raf = requestAnimationFrame(glide);
      else settle();
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      cancelAnimationFrame(raf);
      down = true;
      moved = false;
      startX = lastX = e.clientX;
      lastT = performance.now();
      startLeft = el.scrollLeft;
      velocity = 0;
      // Free movement while dragging; snapping returns on release.
      if (snaps()) el.style.scrollSnapType = "none";
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      velocity = ((e.clientX - lastX) / dt) * 16;
      lastX = e.clientX;
      lastT = now;
      el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      if (moved && !prefersReducedMotion() && Math.abs(velocity) > 1) raf = requestAnimationFrame(glide);
      else settle();
    };
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    const onDragStart = (e: DragEvent) => e.preventDefault();

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    el.addEventListener("dragstart", onDragStart);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("dragstart", onDragStart);
    };
  }, [ref]);
}

/**
 * The index of the item nearest the start of a scrolling row, and a way to
 * bring an item to the start. For swipe rows with dots.
 */
export function nearestItem(el: HTMLElement) {
  const items = [...el.children] as HTMLElement[];
  if (!items.length) return 0;
  const base = items[0].offsetLeft;
  let best = 0;
  items.forEach((it, i) => {
    if (Math.abs(it.offsetLeft - base - el.scrollLeft) < Math.abs(items[best].offsetLeft - base - el.scrollLeft)) best = i;
  });
  // At the very end, the last item counts even if it cannot reach the start.
  if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) best = items.length - 1;
  return best;
}

export function scrollToItem(el: HTMLElement, i: number) {
  const items = [...el.children] as HTMLElement[];
  const it = items[i];
  if (!it) return;
  el.scrollTo({ left: it.offsetLeft - items[0].offsetLeft, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}
