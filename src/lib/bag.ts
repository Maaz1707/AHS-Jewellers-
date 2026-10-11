"use client";

import { useMemo } from "react";
import type { Product } from "@/data/products";
import { useCart, useProducts, useRates } from "@/store";
import type { CartItem } from "@/store/cart";
import { priceParts } from "./pricing";

export type BagLine = { item: CartItem; product: Product; unit: number; parts: ReturnType<typeof priceParts> };

/** Online pieces can be bought on the site; everything else is enquiry-led. */
export const isOnline = (p: Product) => Boolean(p.online) && !p.hidden;

/**
 * The bag, priced live at today’s rates. Pieces that are no longer offered
 * online (hidden, deleted or switched off in the admin) are returned apart so
 * the bag can say so instead of silently dropping them.
 */
export function useBag() {
  const items = useCart((s) => s.items);
  const products = useProducts((s) => s.products);
  const rates = useRates((s) => s.rates);

  return useMemo(() => {
    const lines: BagLine[] = [];
    const unavailable: { item: CartItem; name: string }[] = [];
    for (const item of items) {
      const product = products.find((p) => p.slug === item.slug);
      if (product && isOnline(product)) {
        const parts = priceParts(product, rates);
        lines.push({ item, product, unit: parts.total, parts });
      } else {
        unavailable.push({ item, name: product?.name ?? "A piece no longer in the catalogue" });
      }
    }
    const sum = (f: (l: BagLine) => number) => lines.reduce((n, l) => n + f(l) * l.item.qty, 0);
    const subtotal = sum((l) => l.unit);
    return {
      lines,
      unavailable,
      count: lines.reduce((n, l) => n + l.item.qty, 0),
      weight: sum((l) => l.product.weight),
      gold: sum((l) => l.parts.gold),
      making: sum((l) => l.parts.making),
      stones: sum((l) => l.parts.stones),
      gst: sum((l) => l.parts.gst),
      subtotal,
      rates,
    };
  }, [items, products, rates]);
}
