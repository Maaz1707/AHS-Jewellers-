"use client";

import { useState } from "react";

const MARKS = [
  {
    key: "bis",
    label: "The BIS mark",
    short: "Tested under Indian standards",
    body: "A triangle, the standard mark of the Bureau of Indian Standards. It shows the piece was assayed at a BIS-recognised centre, not just declared pure by the seller.",
  },
  {
    key: "purity",
    label: "Purity grade",
    short: "Karat and fineness",
    body: "Karat and fineness together, such as 22K916: 916 parts of pure gold in every 1,000. 18K is marked 18K750 and 24K is marked 24K999.",
  },
  {
    key: "huid",
    label: "HUID",
    short: "This piece’s own number",
    body: "A six-character code of letters and numbers, unique to this one piece. Enter it on the BIS CARE app to see its purity, type and where it was hallmarked.",
  },
] as const;

type Key = (typeof MARKS)[number]["key"];

/**
 * A magnified hallmark as found on the inside of a bangle, with the three marks
 * explained. Selecting a mark or its explanation highlights the other.
 */
export default function HallmarkVisual() {
  const [active, setActive] = useState<Key>("bis");
  const on = (k: Key) => (active === k ? 1 : 0.35);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
      <figure className="lg:col-span-7">
        <div className="relative overflow-hidden border border-line bg-ivory p-6 md:p-10">
          <svg viewBox="0 0 720 300" role="img" aria-labelledby="hallmark-svg-title" className="w-full">
            <title id="hallmark-svg-title">
              A hallmark magnified: the BIS triangle, the purity grade 22K916 and the HUID AB12C3, struck in a row on gold.
            </title>
            <defs>
              <linearGradient id="gold-plate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#E8D3A3" />
                <stop offset="0.45" stopColor="#C9A465" />
                <stop offset="0.55" stopColor="#B8914F" />
                <stop offset="1" stopColor="#D8BC85" />
              </linearGradient>
              <linearGradient id="gold-sheen" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.35" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* The gold surface, as the inside face of a bangle */}
            <rect x="10" y="60" width="700" height="180" rx="90" fill="url(#gold-plate)" />
            <rect x="10" y="60" width="700" height="180" rx="90" fill="url(#gold-sheen)" />
            <rect x="10" y="60" width="700" height="180" rx="90" fill="none" stroke="#86663A" strokeOpacity="0.4" />

            {/* 1. BIS triangle */}
            <g style={{ opacity: on("bis"), transition: "opacity .4s" }}>
              <rect x="90" y="105" width="150" height="90" rx="6" fill="none" stroke="#5E4522" strokeWidth="2" />
              <path d="M165 118 L205 182 L125 182 Z" fill="none" stroke="#3B2A12" strokeWidth="5" strokeLinejoin="round" />
              <path d="M165 142 L182 170 L148 170 Z" fill="#3B2A12" opacity="0.85" />
            </g>
            {/* 2. Purity */}
            <g style={{ opacity: on("purity"), transition: "opacity .4s" }}>
              <rect x="270" y="105" width="180" height="90" rx="6" fill="none" stroke="#5E4522" strokeWidth="2" />
              <text x="360" y="165" textAnchor="middle" fontFamily="Georgia, serif" fontSize="40" fontWeight="600" fill="#3B2A12" letterSpacing="2">
                22K916
              </text>
            </g>
            {/* 3. HUID */}
            <g style={{ opacity: on("huid"), transition: "opacity .4s" }}>
              <rect x="480" y="105" width="150" height="90" rx="6" fill="none" stroke="#5E4522" strokeWidth="2" />
              <text x="555" y="165" textAnchor="middle" fontFamily="'Courier New', monospace" fontSize="34" fontWeight="700" fill="#3B2A12" letterSpacing="3">
                AB12C3
              </text>
            </g>

            {/* Callout numbers */}
            {[165, 360, 555].map((x, i) => (
              <g key={x} style={{ opacity: on(MARKS[i].key), transition: "opacity .4s" }}>
                <line x1={x} y1="40" x2={x} y2="100" stroke="#86663A" strokeWidth="1" />
                <circle cx={x} cy="28" r="16" fill="#ffffff" stroke="#86663A" />
                <text x={x} y="34" textAnchor="middle" fontFamily="Georgia, serif" fontSize="16" fill="#1A1714">
                  {i + 1}
                </text>
              </g>
            ))}
            <text x="360" y="285" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" letterSpacing="3" fill="#6B635A">
              MAGNIFIED ABOUT 20 TIMES
            </text>
          </svg>
        </div>
        <figcaption className="mt-3 text-xs text-stone">
          Illustration. Marks are laser-engraved, usually on the clasp or inner face, and need a loupe to read.
        </figcaption>
      </figure>

      <ol className="flex flex-col gap-3 lg:col-span-5">
        {MARKS.map((m, i) => {
          const isActive = active === m.key;
          return (
            <li key={m.key}>
              <button
                type="button"
                onClick={() => setActive(m.key)}
                onPointerEnter={() => setActive(m.key)}
                onFocus={() => setActive(m.key)}
                aria-pressed={isActive}
                className={`flex w-full gap-5 border p-5 text-left transition-colors duration-500 md:p-6 ${
                  isActive ? "border-gold bg-white" : "border-line bg-transparent hover:border-line-strong"
                }`}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full border font-serif transition-colors duration-500 ${
                    isActive ? "border-gold bg-gold text-white" : "border-line-strong text-stone"
                  }`}
                >
                  {i + 1}
                </span>
                <span>
                  <span className="block font-serif text-2xl text-ink">{m.label}</span>
                  <span className="mt-1 block eyebrow text-gold-deep">{m.short}</span>
                  <span className="mt-3 block text-sm text-ink-soft">{m.body}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
