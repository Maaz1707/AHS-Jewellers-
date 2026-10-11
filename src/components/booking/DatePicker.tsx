"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { addDays, BOOKING_WINDOW_DAYS, istDateKey, weekdayOf } from "@/lib/booking";
import { ChevronLeft, ChevronRight } from "../ui/Icons";

type Props = {
  value: string | null;
  onChange: (key: string) => void;
  /** Dates with no free slot are shown but cannot be chosen. */
  isFull?: (key: string) => boolean;
  labelledBy?: string;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const monthTitle = (y: number, m: number) =>
  new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m, 1)));

/**
 * Month calendar as an ARIA grid. Arrow keys move by day and week, PageUp and
 * PageDown by month; only dates inside the booking window can be chosen.
 */
export default function DatePicker({ value, onChange, isFull, labelledBy }: Props) {
  const today = useMemo(() => istDateKey(new Date()), []);
  const last = useMemo(() => addDays(today, BOOKING_WINDOW_DAYS), [today]);
  const start = value ?? today;
  const [view, setView] = useState(() => ({ y: Number(start.slice(0, 4)), m: Number(start.slice(5, 7)) - 1 }));
  const [focusKey, setFocusKey] = useState(start);
  const grid = useRef<HTMLDivElement>(null);

  const first = `${view.y}-${String(view.m + 1).padStart(2, "0")}-01`;
  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const lead = weekdayOf(first);
  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => addDays(first, i)),
  ];
  while (cells.length % 7) cells.push(null);

  const selectable = (k: string) => k >= today && k <= last && !isFull?.(k);
  const canPrev = first > today.slice(0, 8) + "01";
  const canNext = `${view.y}-${String(view.m + 1).padStart(2, "0")}` < last.slice(0, 7);

  const shiftMonth = (d: number) =>
    setView((v) => {
      const m = v.m + d;
      return { y: v.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 };
    });

  const moveFocus = (key: string) => {
    if (key < today || key > last) return;
    setFocusKey(key);
    const y = Number(key.slice(0, 4));
    const m = Number(key.slice(5, 7)) - 1;
    if (y !== view.y || m !== view.m) setView({ y, m });
    requestAnimationFrame(() => grid.current?.querySelector<HTMLButtonElement>(`[data-key="${key}"]`)?.focus());
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, key: string) => {
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, PageUp: -30, PageDown: 30 };
    if (e.key in moves) {
      e.preventDefault();
      moveFocus(addDays(key, moves[e.key]));
    }
  };

  return (
    <div className="select-none">
      <div className="flex items-center justify-between">
        <p className="font-serif text-2xl text-ink" aria-live="polite">
          {monthTitle(view.y, view.m)}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            disabled={!canPrev}
            aria-label="Previous month"
            className="relative hit-area flex size-10 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-ink disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            disabled={!canNext}
            aria-label="Next month"
            className="relative hit-area flex size-10 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-ink disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div ref={grid} role="grid" aria-labelledby={labelledBy} className="mt-6">
        <div role="row" className="grid grid-cols-7">
          {WEEKDAYS.map((d) => (
            <span key={d} role="columnheader" aria-label={d} className="pb-3 text-center eyebrow text-stone">
              {d.slice(0, 2)}
            </span>
          ))}
        </div>
        {Array.from({ length: cells.length / 7 }, (_, r) => (
          <div key={r} role="row" className="grid grid-cols-7">
            {cells.slice(r * 7, r * 7 + 7).map((key, c) =>
              key ? (
                <div key={key} role="gridcell" aria-selected={value === key} className="p-px">
                  <button
                    type="button"
                    data-key={key}
                    disabled={!selectable(key)}
                    tabIndex={key === focusKey ? 0 : -1}
                    onClick={() => onChange(key)}
                    onKeyDown={(e) => onKey(e, key)}
                    onFocus={() => setFocusKey(key)}
                    aria-label={`${new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${key}T00:00:00Z`))}${
                      key === today ? ", today" : ""
                    }${isFull?.(key) ? ", fully booked" : ""}`}
                    className={`relative flex aspect-square w-full items-center justify-center text-sm figures transition-colors duration-300 disabled:cursor-not-allowed disabled:text-line-strong ${
                      value === key
                        ? "bg-ink text-white"
                        : "text-ink hover:bg-ivory-deep"
                    }`}
                  >
                    {Number(key.slice(8))}
                    {key === today ? (
                      <span aria-hidden="true" className={`absolute bottom-1 size-1 rounded-full ${value === key ? "bg-gold-pale" : "bg-gold"}`} />
                    ) : null}
                  </button>
                </div>
              ) : (
                <div key={`e${r}-${c}`} role="gridcell" aria-hidden="true" />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
