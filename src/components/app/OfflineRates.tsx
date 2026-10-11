"use client";

import { formatINR } from "@/lib/format";
import { useHydrated } from "@/lib/motion";
import { useRateInfo } from "../layout/useRateInfo";

/** The last rates this device saw, so the offline page is still useful. */
export default function OfflineRates() {
  const hydrated = useHydrated();
  const { rates, updated } = useRateInfo();
  if (!hydrated) return null;
  return (
    <div className="mt-12 w-full max-w-prose border border-line bg-white p-6">
      <p className="eyebrow text-stone">Last rates seen on this device</p>
      <dl className="mt-4 grid grid-cols-3 gap-4 text-left">
        {(["24K", "22K", "18K"] as const).map((m) => (
          <div key={m}>
            <dt className="text-xs text-stone">{m}</dt>
            <dd className="font-serif text-2xl text-ink figures">{formatINR(rates[m])}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs text-stone">
        Per gram{updated ? `, updated ${updated.time}, ${updated.day}` : ""}. Confirm today’s rate before you buy.
      </p>
    </div>
  );
}
