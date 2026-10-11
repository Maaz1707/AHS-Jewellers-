"use client";

import { useEffect, useRef, useState } from "react";
import { formatINR } from "@/lib/format";

function useWidth(min = 280) {
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
 * Single-series bar chart (counts per day). Each bar is focusable and shows a
 * tooltip; a hidden table carries the same numbers for screen readers.
 */
export function BarChart({
  data,
  label,
  unit = ["enquiry", "enquiries"],
  format,
}: {
  data: { label: string; short: string; value: number }[];
  label: string;
  /** Singular and plural for the tooltip, when values are counts. */
  unit?: [string, string];
  /** Formats values (axis and tooltip) when they are not plain counts, e.g. rupees. */
  format?: (v: number) => string;
}) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const H = 200;
  const pad = { top: 12, right: 8, bottom: 28, left: format ? 48 : 28 };
  const max = Math.max(2, ...data.map((d) => d.value));
  const ticks = Array.from(new Set([0, Math.ceil(max / 2), max]));
  const tick = (v: number) => (format ? compact(v) : String(v));
  const innerW = width - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const slot = innerW / data.length;
  const barW = Math.max(4, slot - 6);
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;
  const every = data.length > 10 && width < 520 ? 3 : data.length > 10 ? 2 : 1;

  return (
    <div ref={ref} className="relative">
      <svg viewBox={`0 0 ${width} ${H}`} width="100%" height={H} role="img" aria-label={label} className="block">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke="var(--color-line)" />
            <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--color-stone)">
              {tick(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.left + i * slot + (slot - barW) / 2;
          const h = Math.max(d.value ? 2 : 0, (d.value / max) * innerH);
          const r = Math.min(4, barW / 2, h);
          const top = pad.top + innerH - h;
          return (
            <g
              key={d.label}
              tabIndex={0}
              role="img"
              aria-label={`${d.label}: ${format ? format(d.value) : d.value}`}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="outline-none"
            >
              {/* Larger invisible hit area than the bar itself */}
              <rect x={pad.left + i * slot} y={pad.top} width={slot} height={innerH} fill="transparent" />
              {h > 0 ? (
                <path
                  d={`M${x},${top + h}V${top + r}Q${x},${top} ${x + r},${top}H${x + barW - r}Q${x + barW},${top} ${x + barW},${top + r}V${top + h}Z`}
                  fill="var(--color-chart)"
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              ) : null}
              {i % every === 0 || i === data.length - 1 ? (
                <text x={pad.left + i * slot + slot / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--color-stone)">
                  {d.short}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {hover !== null ? (
        <div
          className="pointer-events-none absolute top-0 border border-line bg-white px-3 py-2 text-xs shadow-soft"
          style={{ left: `${((pad.left + hover * slot + slot / 2) / width) * 100}%`, transform: "translateX(-50%)" }}
        >
          <span className="block text-stone">{data[hover].label}</span>
          <span className="block font-medium text-ink figures">
            {format ? format(data[hover].value) : `${data[hover].value} ${data[hover].value === 1 ? unit[0] : unit[1]}`}
          </span>
        </div>
      ) : null}
      <div className="sr-only">
        <table>
          <caption>{label}</caption>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <th scope="row">{d.label}</th>
                <td>{format ? format(d.value) : d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Short axis labels for rupee values: ₹45k, ₹1.2L. */
function compact(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(v >= 1000000 ? 0 : 1)}L`;
  if (v >= 1000) return `₹${Math.round(v / 1000)}k`;
  return `₹${v}`;
}

/** Compact single-series line for a rate, with the latest value marked. */
export function MiniLine({ values, label }: { values: number[]; label: string }) {
  const [ref, width] = useWidth(200);
  const [hover, setHover] = useState<number | null>(null);
  const H = 120;
  const pad = 8;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const x = (i: number) => pad + (i / (values.length - 1)) * (width - pad * 2);
  const y = (v: number) => pad + (1 - (v - lo) / (hi - lo || 1)) * (H - pad * 2);
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const i = hover ?? values.length - 1;

  return (
    <div ref={ref} className="relative">
      <svg
        viewBox={`0 0 ${width} ${H}`}
        width="100%"
        height={H}
        role="img"
        aria-label={`${label}: from ${formatINR(values[0])} to ${formatINR(values.at(-1) ?? 0)}`}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * width;
          setHover(Math.min(values.length - 1, Math.max(0, Math.round(((px - pad) / (width - pad * 2)) * (values.length - 1)))));
        }}
        onPointerLeave={() => setHover(null)}
        className="block touch-pan-y"
      >
        <path d={d} fill="none" stroke="var(--color-chart)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(i)} cy={y(values[i])} r={5} fill="var(--color-chart)" stroke="var(--color-white)" strokeWidth={2} />
      </svg>
      <p className="mt-2 flex justify-between text-xs text-stone figures">
        <span>30 days ago</span>
        <span className="text-ink">
          {hover === null ? "Today" : `${values.length - 1 - hover} days ago`} · {formatINR(values[i])}
        </span>
      </p>
    </div>
  );
}
