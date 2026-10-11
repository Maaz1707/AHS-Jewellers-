"use client";

import { useSyncExternalStore } from "react";

const PREVIEW_KEY = "ahs-app-preview";

/**
 * True when the site runs as an installed app (standalone display mode).
 * For presentations and testing, `?app=1` turns app mode on for the browser
 * tab and `?app=0` turns it off again.
 */
function read() {
  if (typeof window === "undefined") return false;
  try {
    const q = new URLSearchParams(window.location.search).get("app");
    if (q === "1") sessionStorage.setItem(PREVIEW_KEY, "1");
    if (q === "0") sessionStorage.removeItem(PREVIEW_KEY);
    if (sessionStorage.getItem(PREVIEW_KEY) === "1") return true;
  } catch {
    /* storage blocked: fall through */
  }
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function subscribe(cb: () => void) {
  const mql = window.matchMedia("(display-mode: standalone)");
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

export function useAppMode() {
  return useSyncExternalStore(subscribe, read, () => false);
}

export const isIOS = () =>
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
