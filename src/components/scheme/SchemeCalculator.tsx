"use client";

import { useId, useState } from "react";
import { schemeTerms } from "@/data/site";
import { formatINR, formatNumber } from "@/lib/format";
import { gramsFor, schemeMaturity } from "@/lib/scheme";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";
import { useRates } from "@/store";

const PRESETS = [2000, 5000, 10000, 25000];

function Figure({ label, rupees, grams, accent = false, big = false }: { label: string; rupees: number; grams: number; accent?: boolean; big?: boolean }) {
  const r = useAnimatedNumber(rupees);
  const g = useAnimatedNumber(grams);
  return (
    <div className={`flex flex-col justify-between gap-4 p-5 md:p-6 ${big ? "bg-ink text-white" : "bg-white"}`}>
      <dt className={`eyebrow ${big ? "text-gold-pale" : "text-stone"}`}>{label}</dt>
      <dd className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className={`font-serif figures ${big ? "text-4xl" : "text-3xl"} ${accent ? "text-gold-deep" : ""}`}>
          {accent ? "+ " : ""}
          {formatINR(r)}
        </span>
        <span className={`text-sm figures ${big ? "text-white/75" : "text-stone"}`}>≈ {g.toFixed(2)} g</span>
      </dd>
    </div>
  );
}

/** Monthly amount in, total, bonus, redemption value and grams of 22K out. */
export default function SchemeCalculator({ monthly, onChange }: { monthly: number; onChange: (n: number) => void }) {
  const rate22 = useRates((s) => s.rates["22K"]);
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const { paid, bonus, total } = schemeMaturity(monthly);
  const pct = ((monthly - schemeTerms.minMonthly) / (schemeTerms.maxMonthly - schemeTerms.minMonthly)) * 100;

  const commit = (raw: string) => {
    const n = Number(raw.replace(/[^\d]/g, ""));
    const clamped = Math.min(schemeTerms.maxMonthly, Math.max(schemeTerms.minMonthly, Number.isFinite(n) ? n : schemeTerms.minMonthly));
    onChange(Math.round(clamped / schemeTerms.step) * schemeTerms.step);
    setDraft(null);
  };

  const typed = draft !== null ? Number(draft.replace(/[^\d]/g, "")) : monthly;
  const draftError =
    draft !== null && typed < schemeTerms.minMonthly
      ? `The scheme starts at ${formatINR(schemeTerms.minMonthly)} a month.`
      : draft !== null && typed > schemeTerms.maxMonthly
        ? `For more than ${formatINR(schemeTerms.maxMonthly)} a month, please speak to us.`
        : "";

  return (
    <div className="border border-line-strong bg-white">
      <div className="p-6 md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <label htmlFor={`${id}-amount`} className="eyebrow text-stone">
            I would like to set aside, each month
          </label>
          <div className="flex items-baseline gap-2 border-b border-line-strong focus-within:border-ink">
            <span className="font-serif text-3xl text-stone">₹</span>
            <input
              id={`${id}-amount`}
              inputMode="numeric"
              value={draft ?? formatNumber(monthly)}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={(e) => commit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commit((e.target as HTMLInputElement).value)}
              aria-describedby={`${id}-help`}
              aria-invalid={draftError ? true : undefined}
              className="w-40 bg-transparent py-1 text-right font-serif text-4xl text-ink figures outline-none md:text-5xl"
            />
          </div>
        </div>
        <input
          type="range"
          min={schemeTerms.minMonthly}
          max={schemeTerms.maxMonthly}
          step={schemeTerms.step}
          value={monthly}
          onChange={(e) => {
            setDraft(null);
            onChange(Number(e.target.value));
          }}
          aria-label="Monthly amount"
          aria-valuetext={`${formatINR(monthly)} a month`}
          className="range mt-8 w-full"
          style={{ "--fill": `${pct}%` } as React.CSSProperties}
        />
        <div className="mt-2 flex justify-between text-xs text-stone figures">
          <span>{formatINR(schemeTerms.minMonthly)}</span>
          <span>{formatINR(schemeTerms.maxMonthly)}</span>
        </div>
        <p id={`${id}-help`} className={`mt-3 min-h-6 text-xs ${draftError ? "text-error" : "text-stone"}`} aria-live="polite">
          {draftError || `In steps of ${formatINR(schemeTerms.step)}.`}
        </p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setDraft(null);
                onChange(p);
              }}
              aria-pressed={monthly === p}
              className="chip"
            >
              {formatINR(p)}
            </button>
          ))}
        </div>
      </div>

      <dl className="grid gap-px border-t border-line-strong bg-line-strong md:grid-cols-3">
        <Figure label={`You pay over ${schemeTerms.instalments} months`} rupees={paid} grams={gramsFor(paid, rate22)} />
        <Figure label="We add" rupees={bonus} grams={gramsFor(bonus, rate22)} accent />
        <Figure label={`Yours to redeem in month ${schemeTerms.redeemMonth}`} rupees={total} grams={gramsFor(total, rate22)} big />
      </dl>
      <p className="px-6 py-4 text-xs text-stone md:px-10">
        Grams are approximate, in 22K gold at today’s rate of {formatINR(rate22)}/g, before making charges. The gold
        you take home is weighed at the rate on the day you redeem.
      </p>
    </div>
  );
}
