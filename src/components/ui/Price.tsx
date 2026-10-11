"use client";

import type { Product } from "@/data/products";
import { formatINR } from "@/lib/format";
import { priceFor } from "@/lib/pricing";
import { useRates } from "@/store";

/** Indicative price at today’s rate. Re-renders when the rate changes. */
export default function Price({ product, className = "" }: { product: Product; className?: string }) {
  const rates = useRates((s) => s.rates);
  return <span className={`figures ${className}`}>{formatINR(priceFor(product, rates))}</span>;
}
