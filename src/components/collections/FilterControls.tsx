"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { categoryBySlug, type CategorySlug } from "@/data/collections";
import { sortLabels, type SortKey } from "@/lib/filters";
import { formatGrams } from "@/lib/format";
import { ChevronDown } from "../ui/Icons";

/* Building blocks shared by the desktop sidebar and the phone sheets. */

export type Option<T extends string> = { value: T; label: string; count: number };

/** One collapsible filter group with a heading, a count of chosen options, and a clear link. */
export function FacetGroup({
  title,
  selected = 0,
  defaultOpen = true,
  onClear,
  children,
}: {
  title: string;
  selected?: number;
  defaultOpen?: boolean;
  onClear?: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen || selected > 0);
  const id = useId();
  return (
    <div className="border-b border-line">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="group flex w-full items-center gap-3 py-4 text-left"
        >
          <span className="flex-1 eyebrow text-ink">{title}</span>
          {selected ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-ink text-micro text-white figures" aria-label={`${selected} chosen`}>
              {selected}
            </span>
          ) : null}
          <ChevronDown className={`size-4 text-stone transition-transform duration-300 group-hover:text-ink ${open ? "rotate-180" : ""}`} />
        </button>
      </h3>
      <div id={id} hidden={!open} className="pb-5">
        {children}
        {selected && onClear ? (
          <button type="button" onClick={onClear} className="mt-3 text-xs text-stone underline-offset-4 hover:text-ink hover:underline">
            Clear {title.toLowerCase()}
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Checkboxes with live counts. Options that would leave nothing are dimmed and cannot be chosen. */
export function CheckList<T extends string>({
  legend,
  options,
  selected,
  onChange,
}: {
  legend: string;
  options: Option<T>[];
  selected: T[];
  onChange: (next: T[]) => void;
}) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <ul className="flex flex-col">
        {options.map((o) => {
          const checked = selected.includes(o.value);
          const empty = o.count === 0 && !checked;
          return (
            <li key={o.value}>
              <label className={`group flex items-center gap-3 py-2 text-sm ${empty ? "cursor-not-allowed text-stone/60" : "cursor-pointer text-ink"}`}>
                <span className="relative flex size-4 shrink-0 items-center justify-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={empty}
                    onChange={() => onChange(checked ? selected.filter((v) => v !== o.value) : [...selected, o.value])}
                    className="peer size-4 cursor-pointer appearance-none border border-line-strong transition-colors duration-300 checked:border-ink checked:bg-ink enabled:group-hover:border-ink disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <svg viewBox="0 0 16 16" aria-hidden="true" className="pointer-events-none absolute size-3 text-white opacity-0 peer-checked:opacity-100">
                    <path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
                <span className="flex-1">{o.label}</span>
                <span className="text-xs figures text-stone">{o.count}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

/** Sort choices as a radio list (phone sheet) or a menu body (desktop). */
export function SortList({ value, onChange, legend = true }: { value: SortKey; onChange: (v: SortKey) => void; legend?: boolean }) {
  const name = useId();
  return (
    <fieldset>
      <legend className={legend ? "eyebrow text-stone" : "sr-only"}>Sort by</legend>
      <ul className={`flex flex-col ${legend ? "mt-3" : ""}`}>
        {(Object.keys(sortLabels) as SortKey[]).map((k) => (
          <li key={k}>
            <label className="flex cursor-pointer items-center gap-3 py-2 text-sm text-ink">
              <input
                type="radio"
                name={name}
                checked={value === k}
                onChange={() => onChange(k)}
                className="size-4 cursor-pointer appearance-none rounded-full border border-line-strong transition-[border-color,border-width] duration-300 checked:border-4 checked:border-ink"
              />
              <span className={value === k ? "font-medium" : ""}>{sortLabels[k]}</span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

/** A labelled on/off switch. */
export function Toggle({ label, count, checked, onChange }: { label: string; count?: number; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-2 text-sm text-ink">
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer h-5 w-8 cursor-pointer appearance-none rounded-full border border-line-strong bg-ivory-deep transition-colors duration-300 checked:border-ink checked:bg-ink"
        />
        <span aria-hidden="true" className="pointer-events-none absolute left-1 top-1 size-3 rounded-full bg-white shadow-soft transition-transform duration-300 peer-checked:translate-x-3" />
      </span>
      <span className="flex-1">{label}</span>
      {count !== undefined ? <span className="text-xs figures text-stone">{count}</span> : null}
    </label>
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
      <legend className="sr-only">Gold weight</legend>
      <div className="relative h-6">
        <span className="absolute inset-x-0 top-1/2 h-px bg-line-strong" />
        <span className="absolute top-1/2 h-px bg-ink" style={{ left: `${left}%`, right: `${100 - right}%` }} />
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
      <p className="mt-3 grid grid-cols-2 gap-3 text-sm figures" aria-live="polite">
        <span className="border border-line px-3 py-2 text-ink">
          <span className="block text-micro uppercase tracking-wide text-stone">Min</span>
          {formatGrams(lo)}
        </span>
        <span className="border border-line px-3 py-2 text-ink">
          <span className="block text-micro uppercase tracking-wide text-stone">Max</span>
          {formatGrams(hi)}
        </span>
      </p>
    </fieldset>
  );
}

export const categoryLabel = (c: CategorySlug) => categoryBySlug(c)?.name ?? c;
