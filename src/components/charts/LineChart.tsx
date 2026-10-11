"use client";

import { useEffect, useRef, useState } from "react";

export type LinePoint = { label: string; short?: string; value: number };

function useWidth(min = 240) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(min, Math.round(e.contentRect.width))));
    ro.observe(node);
    return () => ro.disconnect();
  }, [min]);
  return [ref, w] as const;
}

/**
 * Single-series line with a soft fill, a hover/keyboard readout and a hidden
 * table for screen readers. Colours come from --color-chart.
 */
export default function LineChart({
  points,
  label,
  format,
  height = 220,
  zeroBased = false,
}: {
  points: LinePoint[];
  label: string;
  format: (v: number) => string;
  height?: number;
  /** Start the value axis at zero (counts) rather than near the lowest value (prices). */
  zeroBased?: boolean;
}) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const H = height;
  const pad = { top: 16, right: 12, bottom: 28, left: 12 };
  const values = points.map((p) => p.value);
  const rawLo = Math.min(...values);
  const hi = Math.max(...values);
  const lo = zeroBased ? 0 : rawLo - (hi - rawLo || hi * 0.05) * 0.15;
  const span = hi - lo || 1;
  const innerW = width - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const x = (i: number) => pad.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => pad.top + (1 - (v - lo) / span) * innerH;
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join("");
  const area = `${line}L${x(points.length - 1).toFixed(1)},${pad.top + innerH}L${x(0).toFixed(1)},${pad.top + innerH}Z`;
  const i = hover ?? points.length - 1;
  const labelled = points.map((p, k) => ({ p, k })).filter(({ p }) => p.short);
  const every = Math.max(1, Math.ceil(labelled.length / Math.max(2, Math.floor(innerW / 64))));
  const gradient = `fill-${label.replace(/\W/g, "").slice(0, 24)}`;

  if (!points.length) return null;

  return (
    <div ref={ref} className="relative">
      <svg
        viewBox={`0 0 ${width} ${H}`}
        width="100%"
        height={H}
        role="img"
        aria-label={`${label}: from ${format(values[0])} to ${format(values.at(-1) ?? 0)}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setHover((h) => Math.max(0, (h ?? points.length - 1) - 1));
          if (e.key === "ArrowRight") setHover((h) => Math.min(points.length - 1, (h ?? points.length - 1) + 1));
        }}
        onBlur={() => setHover(null)}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * width;
          setHover(Math.min(points.length - 1, Math.max(0, Math.round(((px - pad.left) / innerW) * (points.length - 1)))));
        }}
        onPointerLeave={() => setHover(null)}
        className="block touch-pan-y outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
      >
        <defs>
          <linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--color-chart)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={pad.left} x2={width - pad.right} y1={pad.top + innerH} y2={pad.top + innerH} stroke="var(--color-line)" />
        <path d={area} fill={`url(#${gradient})`} />
        <path d={line} fill="none" stroke="var(--color-chart)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null ? <line x1={x(i)} x2={x(i)} y1={pad.top} y2={pad.top + innerH} stroke="var(--color-line-strong)" strokeDasharray="3 3" /> : null}
        <circle cx={x(i)} cy={y(points[i].value)} r={5} fill="var(--color-chart)" stroke="var(--color-white)" strokeWidth={2} />
        {labelled.map(({ p, k }, n) =>
          (n % every === 0 && (k === points.length - 1 || x(points.length - 1) - x(k) > 56)) || (k === points.length - 1 && n % every !== 0) ? (
            <text key={k} x={x(k)} y={H - 8} textAnchor={k === 0 ? "start" : k === points.length - 1 ? "end" : "middle"} fontSize={11} fill="var(--color-stone)">
              {p.short}
            </text>
          ) : null,
        )}
      </svg>
      {hover !== null ? (
        <div
          className="pointer-events-none absolute top-0 border border-line bg-white px-3 py-2 text-xs shadow-soft"
          style={{ left: `${(x(i) / width) * 100}%`, transform: `translateX(${i > points.length / 2 ? "-100%" : "0"})` }}
          aria-live="polite"
        >
          <span className="block text-stone">{points[i].label}</span>
          <span className="block font-medium text-ink figures">{format(points[i].value)}</span>
        </div>
      ) : null}
      <div className="sr-only">
        <table>
          <caption>{label}</caption>
          <tbody>
            {points.map((p, k) => (
              <tr key={k}>
                <th scope="row">{p.label}</th>
                <td>{format(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
