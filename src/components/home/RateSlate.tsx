"use client";

import { useMemo } from "react";
import { sampleHistory, type Metal } from "@/data/rates";
import { formatChange, formatINR } from "@/lib/format";
import { useRateInfo } from "../layout/useRateInfo";
import { Rosette } from "../ui/Motif";
import RollingNumber from "../ui/RollingNumber";
import TextLink from "../ui/TextLink";

const ROWS: { metal: Metal; label: string; note: string }[] = [
  { metal: "24K", label: "24K", note: "Coins and bars" },
  { metal: "22K", label: "22K", note: "Most of our jewellery" },
  { metal: "18K", label: "18K", note: "Diamond settings" },
];

/** Fine line of the last 30 days of 22K, drawn on the slate. */
function Sparkline({ values }: { values: number[] }) {
  const W = 240;
  const H = 48;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const x = (i: number) => (i / (values.length - 1)) * W;
  const y = (v: number) => 4 + (1 - (v - lo) / (hi - lo || 1)) * (H - 8);
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-12 w-full" role="img" aria-label={`22K over 30 days: from ${formatINR(values[0])} to ${formatINR(values.at(-1) ?? 0)}`}>
      <path d={d} fill="none" stroke="var(--color-gold-pale)" strokeWidth={1} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />

    </svg>
  );
}

/**
 * The gold rate as an object: the slate that hangs by the shop door, in deep
 * emerald with a double gold frame. Figures roll into place; a fine line shows
 * the last thirty days.
 */
export default function RateSlate() {
  const { rates, previous, updated } = useRateInfo();
  const history = useMemo(() => sampleHistory(rates).map((p) => p["22K"]), [rates]);

  return (
    <section aria-labelledby="slate-title" className="bg-ivory band-y">
      <div className="shell grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <p className="eyebrow flex items-center gap-4 text-gold-deep">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            By the door, every morning
          </p>
          <h2 id="slate-title" className="mt-6 display-section text-ink">
            Today’s <em className="text-gold-deep">rate</em>
          </h2>
          <p className="mt-6 lede text-ink-soft">
            Written on the slate at 10:30 and on this site at the same moment. Every price you see moves with it.
          </p>
          <div className="mt-8">
            <TextLink href="/gold-rate">The full rate page</TextLink>
          </div>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <div className="relative bg-emerald-deep p-2 text-ivory shadow-panel">
            <div className="relative border border-gold/50 p-1">
              <div className="relative overflow-hidden border border-gold/30 px-6 py-8 md:px-12 md:py-12">
                <div aria-hidden="true" className="bg-jaali-light jaali-fade pointer-events-none absolute inset-0 opacity-10" />
                <div className="relative flex items-center justify-between gap-6">
                  <p className="eyebrow text-gold-pale">Per gram · {updated ? `${updated.day}, ${updated.time}` : "this morning"}</p>
                  <Rosette className="size-6" tone="var(--color-gold)" />
                </div>
                <dl className="relative mt-8 flex flex-col">
                  {ROWS.map(({ metal, label, note }) => {
                    const down = rates[metal] < previous[metal];
                    return (
                      <div key={metal} className="flex items-baseline justify-between gap-6 border-t border-gold/25 py-5 first:border-t-0 first:pt-0">
                        <dt>
                          <span className="block font-serif text-3xl text-gold-pale md:text-4xl">{label}</span>
                          <span className="mt-1 block text-xs text-ivory/60">{note}</span>
                        </dt>
                        <dd className="text-right">
                          <RollingNumber text={formatINR(rates[metal])} className="font-serif text-4xl text-ivory md:text-6xl" />
                          <span className={`mt-1 block text-xs figures ${down ? "text-gold-pale" : "text-ivory/70"}`}>
                            {formatChange(rates[metal], previous[metal])} since yesterday
                          </span>
                        </dd>
                      </div>
                    );
                  })}
                </dl>
                <div className="relative mt-8 border-t border-gold/25 pt-6">
                  <div className="flex items-baseline justify-between text-xs text-ivory/60">
                    <span>22K, last 30 days</span>
                    <span className="figures">Today {formatINR(rates["22K"])}</span>
                  </div>
                  <div className="mt-3">
                    <Sparkline values={history} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
