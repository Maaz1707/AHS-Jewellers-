"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { metalLabels, sampleHistory, type Metal } from "@/data/rates";
import { formatChange, formatINR } from "@/lib/format";
import { useHydrated } from "@/lib/motion";
import { useRates } from "@/store";

const METALS: Metal[] = ["24K", "22K", "18K", "silver"];
const H = 280;
const PAD = { top: 16, right: 16, bottom: 32, left: 64 };

const dayLabel = (daysAgo: number, opts: Intl.DateTimeFormatOptions) => {
  const d = new Date(Date.now() - daysAgo * 86_400_000);
  return new Intl.DateTimeFormat("en-IN", { ...opts, timeZone: "Asia/Kolkata" }).format(d);
};

/** "Nice" round step for axis ticks. */
function niceStep(range: number, ticks: number) {
  const raw = range / ticks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const n = raw / mag;
  return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
}

/**
 * 30-day trend for one metal at a time. Single series, so the title names it
 * and no legend box is needed. Crosshair + tooltip on hover, arrow keys when
 * focused, and a table view for screen readers and anyone who prefers numbers.
 */
export default function RateChart() {
  const rates = useRates((s) => s.rates);
  const hydrated = useHydrated();
  const [metal, setMetal] = useState<Metal>("22K");
  const [hover, setHover] = useState<number | null>(null);
  const [width, setWidth] = useState(720);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = box.current;
    if (!node) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(node);
    return () => ro.disconnect();
  }, [hydrated]);

  const history = useMemo(() => sampleHistory(rates), [rates]);
  const values = history.map((p) => p[metal]);
  const n = values.length;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const step = niceStep(hi - lo || 1, 4);
  const yMin = Math.floor(lo / step) * step;
  const yMax = Math.ceil(hi / step) * step;
  const innerW = width - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (i / (n - 1)) * innerW;
  const y = (v: number) => PAD.top + (1 - (v - yMin) / (yMax - yMin || 1)) * innerH;
  const line = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const area = `${line}L${x(n - 1)},${PAD.top + innerH}L${x(0)},${PAD.top + innerH}Z`;
  const ticks: number[] = [];
  for (let v = yMin; v <= yMax + 0.001; v += step) ticks.push(v);
  const xTicks = width < 520 ? [0, 14, n - 1] : [0, 7, 14, 21, n - 1];

  const first = values[0];
  const last = values[n - 1];
  const daysAgo = (i: number) => n - 1 - i;

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * width;
    const i = Math.round(((px - PAD.left) / innerW) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") setHover((h) => Math.max(0, (h ?? n - 1) - 1));
    if (e.key === "ArrowRight") setHover((h) => Math.min(n - 1, (h ?? n - 1) + 1));
    if (e.key === "Home") setHover(0);
    if (e.key === "End") setHover(n - 1);
  };

  const hi_i = hover ?? n - 1;

  return (
    <div>
      {/* Metal switch: one row, above the chart */}
      <div role="radiogroup" aria-label="Metal" className="flex flex-wrap gap-2">
        {METALS.map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={metal === m}
            onClick={() => setMetal(m)}
            className={`h-10 border px-4 text-sm transition-colors duration-300 ${
              metal === m ? "border-ink bg-ink text-white" : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"
            }`}
          >
            {metalLabels[m].name}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h3 className="font-serif text-2xl text-ink">{metalLabels[metal].name}, last 30 days</h3>
          <p className="mt-1 text-sm text-stone">Per gram, at our counter each morning. Sample data.</p>
        </div>
        <dl className="flex gap-8 text-sm figures">
          <div>
            <dt className="eyebrow text-stone">30-day low</dt>
            <dd className="mt-1 text-ink">{formatINR(lo)}</dd>
          </div>
          <div>
            <dt className="eyebrow text-stone">30-day high</dt>
            <dd className="mt-1 text-ink">{formatINR(hi)}</dd>
          </div>
          <div>
            <dt className="eyebrow text-stone">Change</dt>
            <dd className="mt-1 text-ink">{formatChange(last, first)}</dd>
          </div>
        </dl>
      </div>

      <div ref={box} className="relative mt-6">
        {!hydrated ? (
          <div className="skeleton w-full" style={{ height: H }} aria-label="Loading chart" />
        ) : (
          <>
            <svg
              viewBox={`0 0 ${width} ${H}`}
              width="100%"
              height={H}
              role="img"
              aria-label={`${metalLabels[metal].name} rate over 30 days, from ${formatINR(first)} to ${formatINR(last)} per gram. Use arrow keys to read each day.`}
              tabIndex={0}
              onKeyDown={onKey}
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
              onBlur={() => setHover(null)}
              className="block touch-pan-y focus-visible:outline-offset-4"
            >
              {/* Recessive grid and y axis */}
              {ticks.map((t) => (
                <g key={t}>
                  <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--color-line)" strokeWidth={1} />
                  <text x={PAD.left - 12} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--color-stone)" className="figures">
                    {formatINR(t)}
                  </text>
                </g>
              ))}
              {xTicks.map((i) => (
                <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fontSize={11} fill="var(--color-stone)">
                  {i === n - 1 ? "Today" : dayLabel(daysAgo(i), { day: "numeric", month: "short" })}
                </text>
              ))}

              <defs>
                <linearGradient id="rate-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--color-chart)" stopOpacity={0.14} />
                  <stop offset="1" stopColor="var(--color-chart)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <path d={area} fill="url(#rate-area)" />
              <path d={line} fill="none" stroke="var(--color-chart)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

              {/* Crosshair + marker */}
              <line x1={x(hi_i)} x2={x(hi_i)} y1={PAD.top} y2={PAD.top + innerH} stroke="var(--color-ink)" strokeOpacity={hover === null ? 0 : 0.25} strokeWidth={1} />
              <circle cx={x(hi_i)} cy={y(values[hi_i])} r={5} fill="var(--color-chart)" stroke="var(--color-white)" strokeWidth={2} />
            </svg>

            {/* Tooltip */}
            <div
              aria-live="polite"
              className="pointer-events-none absolute top-0 border border-line bg-white px-3 py-2 text-xs shadow-soft transition-opacity duration-300"
              style={{
                left: `${(x(hi_i) / width) * 100}%`,
                transform: `translateX(${hi_i > n / 2 ? "calc(-100% - 12px)" : "12px"})`,
                opacity: hover === null ? 0 : 1,
              }}
            >
              <span className="block text-stone">{daysAgo(hi_i) === 0 ? "Today" : dayLabel(daysAgo(hi_i), { weekday: "short", day: "numeric", month: "short" })}</span>
              <span className="block font-medium text-ink figures">{formatINR(values[hi_i])}/g</span>
            </div>
          </>
        )}
      </div>

      <details className="group mt-6 border-t border-line pt-4">
        <summary className="cursor-pointer list-none eyebrow text-ink [&::-webkit-details-marker]:hidden">
          <span className="link-draw">View as a table</span>
        </summary>
        {hydrated ? (
          <div className="mt-4 max-h-80 overflow-y-auto" data-lenis-prevent="">
            <table className="w-full text-left text-sm figures">
              <caption className="sr-only">{metalLabels[metal].name} rate per gram, last 30 days</caption>
              <thead>
                <tr className="border-b border-line eyebrow text-stone">
                  <th scope="col" className="py-2 font-medium">Date</th>
                  <th scope="col" className="py-2 text-right font-medium">Per gram</th>
                  <th scope="col" className="py-2 text-right font-medium">Per 10 g</th>
                </tr>
              </thead>
              <tbody>
                {[...values].reverse().map((v, ri) => (
                  <tr key={ri} className="border-b border-line">
                    <td className="py-2 text-ink-soft">{ri === 0 ? "Today" : dayLabel(ri, { weekday: "short", day: "numeric", month: "short" })}</td>
                    <td className="py-2 text-right text-ink">{formatINR(v)}</td>
                    <td className="py-2 text-right text-ink">{formatINR(v * 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </details>
    </div>
  );
}
