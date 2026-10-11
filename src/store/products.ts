import { create } from "zustand";
import { persist } from "zustand/middleware";
import { products as seed, type Product } from "@/data/products";
import { storage } from "./storage";

type ProductsState = {
  products: Product[];
  upsert: (product: Product) => void;
  remove: (slug: string) => void;
  reset: () => void;
};

export const useProducts = create<ProductsState>()(
  persist(
    (set) => ({
      products: seed,
      upsert: (product) =>
        set((s) => {
          const exists = s.products.some((p) => p.slug === product.slug);
          return {
            products: exists
              ? s.products.map((p) => (p.slug === product.slug ? product : p))
              : [...s.products, product],
          };
        }),
      remove: (slug) => set((s) => ({ products: s.products.filter((p) => p.slug !== slug) })),
      reset: () => set({ products: seed }),
    }),
    {
      name: "ahs-products",
      // Bump when the seed catalogue changes so stale local copies are replaced.
      // v3: hidden flag and URL images. v4: "Available online" pieces.
      version: 4,
      storage,
      skipHydration: true,
      migrate: () => ({ products: seed }) as ProductsState,
    },
  ),
);
