"use client";

import type { Product } from "@/data/products";
import { site, whatsappLink } from "@/data/site";
import { useEnquiries } from "@/store";
import { useHydrated } from "./motion";

export const productPath = (p: Pick<Product, "slug">) => `/jewellery/${p.slug}`;

/** The page origin on the client; the canonical site URL during server render. */
export function useOrigin() {
  const hydrated = useHydrated();
  return hydrated ? window.location.origin : site.url;
}

export const productMessage = (p: Product, origin: string) =>
  `Hello AHS Jewellers, I would like to know more about the ${p.name} (${p.code}).\n${origin}${productPath(p)}`;

export const wishlistMessage = (list: Product[], origin: string) =>
  [
    "Hello AHS Jewellers, I would like to know more about these pieces from my wishlist:",
    ...list.map((p, i) => `${i + 1}. ${p.name} (${p.code}) ${origin}${productPath(p)}`),
  ].join("\n");

export const generalMessage = "Hello AHS Jewellers, I have a question about your jewellery.";

/**
 * Link props for a per-piece WhatsApp enquiry. The click also records the
 * enquiry in the store so it appears in the admin panel.
 */
export function useProductEnquiry(product: Product) {
  const origin = useOrigin();
  const addEnquiry = useEnquiries((s) => s.addEnquiry);
  return {
    href: whatsappLink(productMessage(product, origin)),
    target: "_blank",
    rel: "noopener noreferrer",
    onClick: () => {
      addEnquiry({ type: "product", channel: "whatsapp", productSlug: product.slug, pageUrl: `${origin}${productPath(product)}` });
    },
  } as const;
}
