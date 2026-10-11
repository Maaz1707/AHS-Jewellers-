"use client";

import type { ReactNode } from "react";
import { commerceTerms } from "@/data/site";
import { formatGrams, formatINR } from "@/lib/format";
import { GST_RATE } from "@/lib/pricing";
import AnimatedValue from "../ui/AnimatedValue";

type Props = {
  gold: number;
  making: number;
  stones: number;
  gst: number;
  subtotal: number;
  weight: number;
  /** Insured delivery charge, or null when not yet chosen. */
  delivery?: number | null;
  /** Shown under the total. */
  note?: ReactNode;
};

/** The bag and checkout price breakdown: gold, making, stones, GST, delivery. */
export default function PriceSummary({ gold, making, stones, gst, subtotal, weight, delivery = null, note }: Props) {
  const total = subtotal + (delivery ?? 0);
  // Each piece is priced to the nearest ₹10, so the GST line absorbs those few rupees and the column adds up.
  const gstShown = subtotal - Math.round(gold) - Math.round(making) - Math.round(stones);
  return (
    <dl className="flex flex-col gap-3 text-sm figures">
      <Row label="Gold value" detail={`${formatGrams(Math.round(weight * 10) / 10)} at today’s rate`} value={formatINR(gold)} />
      <Row label="Making charges" value={formatINR(making)} />
      {stones ? <Row label="Stones" value={formatINR(stones)} /> : null}
      <Row label={`GST (${Math.round(GST_RATE * 100)}%)`} value={formatINR(gstShown || gst)} />
      <Row
        label="Insured delivery"
        detail={delivery === null ? `Free from ${formatINR(commerceTerms.freeDeliveryFrom)}, or collect from the showroom` : undefined}
        value={delivery === null ? "At checkout" : delivery === 0 ? "Free" : formatINR(delivery)}
      />
      <div className="mt-2 flex items-baseline justify-between gap-6 border-t border-line-strong pt-4">
        <dt className="eyebrow text-ink">Total</dt>
        <dd className="font-serif text-3xl text-ink">
          <AnimatedValue value={total} format={formatINR} />
        </dd>
      </div>
      {note ? <div className="text-xs leading-relaxed text-stone">{note}</div> : null}
    </dl>
  );
}

function Row({ label, detail, value }: { label: string; detail?: string; value: string }) {
  return (
    <div className="flex justify-between gap-6">
      <dt className="text-ink-soft">
        {label}
        {detail ? <span className="block text-xs text-stone">{detail}</span> : null}
      </dt>
      <dd className="shrink-0 text-ink">{value}</dd>
    </div>
  );
}
