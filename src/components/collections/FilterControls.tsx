"use client";

import { useEffect, useId, useState } from "react";
import { categoryBySlug, type CategorySlug } from "@/data/collections";
import type { Purity } from "@/data/products";
import { sortLabels, type Filters, type SortKey } from "@/lib/filters";
import { formatGrams } from "@/lib/format";

/* Building blocks shared by the desktop popovers and the phone filter sheet. */

type Option<T extends string> = { value: T; count: number };

export function CheckList<T extends string>({
  legend,
  options,
  selected,
  onChange,
  labelFor,
}: {
  legend: string;
  options: Option<T>[];
  selected: T[];
  onChange: (next: T[]) => void;
  labelFor: (v: T) => string;
}) {
  return (
    <fieldset>
      <legend className="eyebrow text-stone">{legend}</legend>
      <ul className="mt-4 flex flex-col gap-1">
        {options.map((o) => {
          const checked = selected.includes(o.value);
          return (
            <li key={o.value}>
              <label className="group flex cursor-pointer items-center gap-3 py-2 text-sm text-ink">
                <span className="relative flex size-4 shrink-0 items-center justify-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onChange(checked ? selected.filter((v) => v !== o.value) : [...selected, o.value])}
                    className="peer size-4 cursor-pointer appearance-none border border-line-strong transition-colors duration-300 checked:border-gold checked:bg-gold group-hover:border-ink"
                  />
                  <svg viewBox="0 0 16 16" aria-hidden="true" className="pointer-events-none absolute size-3 text-white opacity-0 peer-checked:opacity-100">
                    <path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
                <span className="flex-1">{labelFor(o.value)}</span>
                <span className="text-xs figures text-stone">{o.count}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

export function SortList({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const name = useId();
  return (
    <fieldset>
      <legend className="eyebrow text-stone">Sort by</legend>
      <ul className="mt-4 flex flex-col gap-1">
        {(Object.keys(sortLabels) as SortKey[]).map((k) => (
          <li key={k}>
            <label className="flex cursor-pointer items-center gap-3 py-2 text-sm text-ink">
              <input
                type="radio"
                name={name}
                checked={value === k}
                onChange={() => onChange(k)}
                className="size-4 cursor-pointer appearance-none rounded-full border border-line-strong transition-[border-color,border-width] duration-300 checked:border-4 checked:border-gold"
              />
              {sortLabels[k]}
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

/** Two overlaid range inputs sharing one hairline track. Commits after the drag settles. */
export function WeightRange({
  bounds,
  min,
  max,
  onChange,
}: {
  bounds: { lo: number; hi: number };
  min: number | null;
  max: number | null;
  onChange: (min: number | null, max: number | null) => void;
}) {
  const [lo, setLo] = useState(min ?? bounds.lo);
  const [hi, setHi] = useState(max ?? bounds.hi);
  const id = useId();

  // Follow outside changes (clear filters, back button).
  const [prev, setPrev] = useState({ min, max, bounds });
  if (prev.min !== min || prev.max !== max || prev.bounds.lo !== bounds.lo || prev.bounds.hi !== bounds.hi) {
    setPrev({ min, max, bounds });
    setLo(min ?? bounds.lo);
    setHi(max ?? bounds.hi);
  }

  useEffect(() => {
    const t = window.setTimeout(() => {
      const nextMin = lo <= bounds.lo ? null : lo;
      const nextMax = hi >= bounds.hi ? null : hi;
      if (nextMin !== min || nextMax !== max) onChange(nextMin, nextMax);
    }, 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lo, hi]);

  const span = Math.max(1, bounds.hi - bounds.lo);
  const left = ((lo - bounds.lo) / span) * 100;
  const right = ((hi - bounds.lo) / span) * 100;

  return (
    <fieldset>
      <legend className="eyebrow text-stone">Gold weight</legend>
      <p className="mt-4 flex justify-between font-serif text-xl text-ink figures" aria-live="polite">
        <span>{formatGrams(lo)}</span>
        <span aria-hidden="true" className="text-stone">to</span>
        <span>{formatGrams(hi)}</span>
      </p>
      <div className="relative mt-4 h-6">
        <span className="absolute inset-x-0 top-1/2 h-px bg-line-strong" />
        <span className="absolute top-1/2 h-px bg-gold" style={{ left: `${left}%`, right: `${100 - right}%` }} />
        <label htmlFor={`${id}-lo`} className="sr-only">
          Minimum weight in grams
        </label>
        <input
          id={`${id}-lo`}
          type="range"
          min={bounds.lo}
          max={bounds.hi}
          step={1}
          value={lo}
          onChange={(e) => setLo(Math.min(Number(e.target.value), hi))}
          aria-valuetext={formatGrams(lo)}
          className="range-dual"
        />
        <label htmlFor={`${id}-hi`} className="sr-only">
          Maximum weight in grams
        </label>
        <input
          id={`${id}-hi`}
          type="range"
          min={bounds.lo}
          max={bounds.hi}
          step={1}
          value={hi}
          onChange={(e) => setHi(Math.max(Number(e.target.value), lo))}
          aria-valuetext={formatGrams(hi)}
          className="range-dual"
        />
      </div>
    </fieldset>
  );
}

export const categoryLabel = (c: CategorySlug) => categoryBySlug(c)?.name ?? c;
export const purityLabel = (p: Purity) => p;

export type FilterSetters = {
  filters: Filters;
  update: (patch: Partial<Filters>) => void;
};
