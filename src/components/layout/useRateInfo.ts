"use client";

import { useMemo } from "react";
import { formatDayIST, formatTimeIST } from "@/lib/format";
import { useHydrated } from "@/lib/motion";
import { resolveUpdatedAt } from "@/lib/rates";
import { useRates } from "@/store";

/**
 * Rates plus a human "updated" label. The label depends on the visitor’s clock,
 * so it is only produced after hydration; callers show a skeleton until then.
 */
export function useRateInfo() {
  const rates = useRates((s) => s.rates);
  const previous = useRates((s) => s.previous);
  const updatedAt = useRates((s) => s.updatedAt);
  const hydrated = useHydrated();

  const updated = useMemo(() => {
    if (!hydrated) return null;
    const d = resolveUpdatedAt(updatedAt);
    return { time: formatTimeIST(d), day: formatDayIST(d), iso: d.toISOString() };
  }, [hydrated, updatedAt]);

  return { rates, previous, updated };
}
