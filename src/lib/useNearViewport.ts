"use client";

import { useEffect, useState, type RefObject } from "react";

/** Activate expensive enhancement once, shortly before its existing HTML enters view. */
export function useNearViewport(ref: RefObject<HTMLElement | null>, margin = "240px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setNear(true);
      observer.disconnect();
    }, { rootMargin: margin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, margin]);
  return near;
}
