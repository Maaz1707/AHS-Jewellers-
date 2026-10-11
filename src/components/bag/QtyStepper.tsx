"use client";

import { commerceTerms } from "@/data/site";
import { MinusIcon, PlusIcon } from "../ui/Icons";

/** Quantity control. Removing the last one is left to the separate Remove link. */
export default function QtyStepper({ qty, name, onChange, size = "md" }: { qty: number; name: string; onChange: (n: number) => void; size?: "sm" | "md" }) {
  const box = size === "sm" ? "relative hit-area size-10" : "relative hit-area size-12";
  return (
    <div className="inline-flex items-center border border-line" role="group" aria-label={`Quantity of ${name}`}>
      <button
        type="button"
        onClick={() => onChange(qty - 1)}
        disabled={qty <= 1}
        aria-label={`One fewer ${name}`}
        className={`flex ${box} items-center justify-center text-ink transition-colors hover:text-gold-deep disabled:text-line-strong`}
      >
        <MinusIcon className="size-3" />
      </button>
      <output className="w-8 text-center text-sm figures" aria-live="polite">
        {qty}
      </output>
      <button
        type="button"
        onClick={() => onChange(qty + 1)}
        disabled={qty >= commerceTerms.maxQty}
        aria-label={`One more ${name}`}
        className={`flex ${box} items-center justify-center text-ink transition-colors hover:text-gold-deep disabled:text-line-strong`}
      >
        <PlusIcon className="size-3" />
      </button>
    </div>
  );
}
