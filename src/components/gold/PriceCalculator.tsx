"use client";

import { useState } from "react";
import type { Purity } from "@/data/products";
import { formatINR } from "@/lib/format";
import { GST_RATE } from "@/lib/pricing";
import { useRates } from "@/store";
import { SelectField, TextField } from "../ui/Field";
import AnimatedValue from "../ui/AnimatedValue";

const PURITIES: Purity[] = ["22K", "18K", "24K"];

const parse = (v: string) => (v.trim() === "" ? NaN : Number(v));

/** weight × rate for the purity, + making, + GST. Validates as you type. */
export default function PriceCalculator() {
  const rates = useRates((s) => s.rates);
  const [weight, setWeight] = useState("10");
  const [purity, setPurity] = useState<Purity>("22K");
  const [making, setMaking] = useState("12");

  const w = parse(weight);
  const m = parse(making);
  const weightError = Number.isNaN(w) ? "Enter a weight in grams." : w <= 0 ? "Weight must be more than 0 g." : w > 1000 ? "For more than 1 kg, please speak to us." : "";
  const makingError = Number.isNaN(m) ? "Enter a making charge." : m < 0 || m > 40 ? "Making charges are usually between 0% and 40%." : "";
  const valid = !weightError && !makingError;

  const rate = rates[purity];
  const gold = valid ? w * rate : 0;
  const makingValue = valid ? gold * (m / 100) : 0;
  const gst = (gold + makingValue) * GST_RATE;
  const total = gold + makingValue + gst;

  return (
    <div className="grid gap-10 border border-line-strong bg-white p-6 md:grid-cols-2 md:p-10">
      <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()} noValidate aria-label="Gold price calculator">
        <TextField
          label="Weight (grams)"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          error={weightError}
        />
        <SelectField label="Purity" value={purity} onChange={(e) => setPurity(e.target.value as Purity)} hint={`Today: ${formatINR(rate)} per gram`}>
          {PURITIES.map((p) => (
            <option key={p} value={p}>
              {p} gold
            </option>
          ))}
        </SelectField>
        <TextField
          label="Making charges (%)"
          type="number"
          inputMode="decimal"
          min={0}
          max={40}
          step="0.5"
          value={making}
          onChange={(e) => setMaking(e.target.value)}
          error={makingError}
          hint="Plain chains from 8%, bridal work up to 20% or more."
        />
      </form>

      <div className="flex flex-col justify-between bg-ivory p-6">
        <dl className="flex flex-col gap-3 text-sm figures" aria-live="polite">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">
              Gold value
              <span className="block text-xs text-stone">{valid ? `${w} g × ${formatINR(rate)}` : "–"}</span>
            </dt>
            <dd className="text-ink">{valid ? formatINR(gold) : "–"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Making ({valid ? `${m}%` : "–"})</dt>
            <dd className="text-ink">{valid ? formatINR(makingValue) : "–"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">GST ({Math.round(GST_RATE * 100)}%)</dt>
            <dd className="text-ink">{valid ? formatINR(gst) : "–"}</dd>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-line-strong pt-4">
            <dt className="eyebrow text-ink">Approximate price</dt>
            <dd className="font-serif text-3xl text-ink">{valid ? <AnimatedValue value={total} format={formatINR} /> : "–"}</dd>
          </div>
        </dl>
        <p className="mt-6 text-xs leading-relaxed text-stone">
          An estimate for plain gold. Stones, enamel and certification are priced separately, and the final figure is
          confirmed in store after weighing.
        </p>
      </div>
    </div>
  );
}
