"use client";

import { useCallback, useRef, useState, type CSSProperties, type PointerEvent } from "react";

/**
 * Zoom on request, never on hover. Double-click (or double-tap) zooms in at
 * that point; while zoomed, moving the pointer (or a finger) pans; double-click
 * again, the zoom button or `reset()` zooms out. Spread `frame` onto the
 * element that receives the pointer, and `style` onto the image wrapper.
 */
export function useZoom(scale = 2.5) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const lastTap = useRef(0);

  const aim = (x: number, y: number, el: Element) => {
    const r = el.getBoundingClientRect();
    const px = Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100));
    const py = Math.min(100, Math.max(0, ((y - r.top) / r.height) * 100));
    setOrigin(`${px.toFixed(1)}% ${py.toFixed(1)}%`);
  };

  const toggleAt = (x: number, y: number, el: Element) => {
    if (!zoomed) aim(x, y, el);
    setZoomed((z) => !z);
  };

  /** Zoom in or out from the centre (the zoom button, keyboard users). */
  const toggle = useCallback(() => {
    if (!zoomed) setOrigin("50% 50%");
    setZoomed((z) => !z);
  }, [zoomed]);

  const reset = useCallback(() => setZoomed(false), []);

  const frame = {
    onDoubleClick: (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      toggleAt(e.clientX, e.clientY, e.currentTarget);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (zoomed) aim(e.clientX, e.clientY, e.currentTarget);
    },
    // Touch has no reliable dblclick: two taps within 300ms count as one.
    onPointerUp: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType === "mouse") return;
      const now = performance.now();
      if (now - lastTap.current < 300) {
        toggleAt(e.clientX, e.clientY, e.currentTarget);
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    },
  };

  const style: CSSProperties = { transform: zoomed ? `scale(${scale})` : "scale(1)", transformOrigin: origin };

  return { zoomed, toggle, reset, frame, style };
}
