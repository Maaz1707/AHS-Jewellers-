import { create } from "zustand";
import { persist } from "zustand/middleware";
import { commerceTerms } from "@/data/site";
import { storage } from "./storage";

export type CartItem = { slug: string; qty: number; addedAt: string };

type CartState = {
  items: CartItem[];
  add: (slug: string, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
};

const cap = (n: number) => Math.min(commerceTerms.maxQty, n);

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (slug, qty = 1) =>
        set((s) =>
          s.items.some((i) => i.slug === slug)
            ? { items: s.items.map((i) => (i.slug === slug ? { ...i, qty: cap(i.qty + qty) } : i)) }
            : { items: [...s.items, { slug, qty: cap(qty), addedAt: new Date().toISOString() }] },
        ),
      remove: (slug) => set((s) => ({ items: s.items.filter((i) => i.slug !== slug) })),
      setQty: (slug, qty) =>
        set((s) => ({
          items: qty <= 0 ? s.items.filter((i) => i.slug !== slug) : s.items.map((i) => (i.slug === slug ? { ...i, qty: cap(qty) } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    // v2: the bag holds pieces bought online only; earlier "reserve for a visit" lists are cleared.
    { name: "ahs-cart", version: 2, storage, skipHydration: true, migrate: () => ({ items: [] }) as unknown as CartState },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.qty, 0);
