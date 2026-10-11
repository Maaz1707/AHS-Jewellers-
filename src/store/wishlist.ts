import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storage } from "./storage";

type WishlistState = {
  slugs: string[];
  has: (slug: string) => boolean;
  /** Adds or removes; returns true if the piece is now saved. */
  toggle: (slug: string) => boolean;
  remove: (slug: string) => void;
  clear: () => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      has: (slug) => get().slugs.includes(slug),
      toggle: (slug) => {
        const saved = get().slugs.includes(slug);
        set((s) => ({ slugs: saved ? s.slugs.filter((x) => x !== slug) : [slug, ...s.slugs] }));
        return !saved;
      },
      remove: (slug) => set((s) => ({ slugs: s.slugs.filter((x) => x !== slug) })),
      clear: () => set({ slugs: [] }),
    }),
    { name: "ahs-wishlist", version: 1, storage, skipHydration: true },
  ),
);
