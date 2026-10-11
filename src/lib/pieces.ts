"use client";

import { useMemo, useSyncExternalStore } from "react";
import { images, type ImageKey } from "@/data/media";
import type { ImageRef, Product } from "@/data/products";
import { useProducts } from "@/store";

/** Resolve a media key or URL into src and alt text. */
export function imageFor(ref: ImageRef | undefined, fallbackAlt: string) {
  if (ref && ref in images) {
    const m = images[ref as ImageKey];
    return { src: m.src, alt: m.alt };
  }
  return { src: ref || images.showcaseStands.src, alt: fallbackAlt };
}

/** The nth photograph of a piece (0 = primary). */
export const pieceImage = (p: Pick<Product, "images" | "name">, i = 0) => imageFor(p.images[i] ?? p.images[0], p.name);

export const isVisible = (p: Product) => !p.hidden;

/** Every piece shown on the site, from the live store (admin edits apply at once). */
export function useVisibleProducts() {
  const all = useProducts((s) => s.products);
  return useMemo(() => all.filter(isVisible), [all]);
}

/**
 * The live version of one piece. Before the store loads, the build-time copy
 * stands in; afterwards a piece deleted in the admin panel is really gone.
 */
export function useLiveProduct(slug: string, fallback?: Product) {
  const live = useProducts((s) => s.products.find((p) => p.slug === slug));
  const ready = useProductsReady();
  return live ?? (ready ? undefined : fallback);
}

/** True once the product store has loaded from this browser’s storage. */
export function useProductsReady() {
  return useSyncExternalStore(
    (cb) => useProducts.persist.onFinishHydration(cb),
    () => useProducts.persist.hasHydrated(),
    () => false,
  );
}
