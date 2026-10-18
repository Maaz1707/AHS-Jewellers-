"use client";

import type { Product } from "@/data/products";
import { formatGrams } from "@/lib/format";
import Price from "./Price";

type Props = {
  product: Product;
  /** A compact, consistent lock-up for product cards and feature tiles. */
  tone?: "default" | "light";
  className?: string;
};

/**
 * The AHS catalogue lock-up. Purity, gross weight and indicative value are
 * always shown in this order, whether a piece is in a card or a feature tile.
 */
export default function ProductValueLockup({ product, tone = "default", className = "" }: Props) {
  const muted = tone === "light" ? "text-white/60" : "text-stone";
  const strong = tone === "light" ? "text-white" : "text-ink";

  return (
    <dl className={`grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 figures ${className}`}>
      <div>
        <dt className={`eyebrow ${muted}`}>Purity</dt>
        <dd className={`mt-1 text-sm ${strong}`}>{product.purity}</dd>
      </div>
      <div>
        <dt className={`eyebrow ${muted}`}>Gross weight</dt>
        <dd className={`mt-1 text-sm ${strong}`}>{formatGrams(product.weight)}</dd>
      </div>
      <div className="col-span-2 flex items-end justify-between gap-4">
        <dt className={`eyebrow ${muted}`}>Indicative value</dt>
        <dd className={`font-serif text-xl ${strong}`}>
          <span aria-hidden="true" className={muted}>≈ </span>
          <span className="sr-only">Approximately </span>
          <Price product={product} />
        </dd>
      </div>
    </dl>
  );
}
