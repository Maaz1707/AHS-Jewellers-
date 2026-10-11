"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Mount/visible pair for CSS-transitioned overlays: `mounted` stays true until the
 * exit transition finishes, `visible` drives the transition classes.
 */
export function useOverlayTransition(open: boolean, exitMs = 500) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  // Mount immediately when opened (adjusting state during render, not in an effect).
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (open) {
      // Two frames so the closed styles paint before the transition starts.
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }
    const frame = requestAnimationFrame(() => setVisible(false));
    const t = window.setTimeout(() => setMounted(false), exitMs);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(t);
    };
  }, [open, exitMs]);

  return { mounted, visible };
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps keyboard focus inside `ref` while active, closes on Escape and returns
 * focus to whatever opened it.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, onEscape?: () => void) {
  const escapeRef = useRef(onEscape);
  useEffect(() => {
    escapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    const previous = document.activeElement as HTMLElement | null;

    const focusFirst = () => {
      if (!node) return;
      const preferred = node.querySelector<HTMLElement>("[data-autofocus]");
      const first = preferred ?? node.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? node).focus({ preventScroll: true });
    };
    const id = window.setTimeout(focusFirst, 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        escapeRef.current?.();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKey);
      if (previous && document.contains(previous)) previous.focus({ preventScroll: true });
    };
  }, [active, ref]);
}
