"use client";

import { useProductsReady, useVisibleProducts } from "@/lib/pieces";

type Props = {
  collection?: string;
  category?: string;
  /** Build-time count, shown until the live catalogue has loaded. */
  fallback: number;
  /** Append "piece" / "pieces". */
  withUnit?: boolean;
};

/** Number of visible pieces in a collection or category, following admin changes. */
export default function LiveCount({ collection, category, fallback, withUnit = true }: Props) {
  const ready = useProductsReady();
  const visible = useVisibleProducts();
  const n = ready
    ? visible.filter((p) => (!collection || p.collection === collection) && (!category || p.category === category)).length
    : fallback;
  return (
    <span className="figures">
      {n}
      {withUnit ? ` ${n === 1 ? "piece" : "pieces"}` : null}
    </span>
  );
}
