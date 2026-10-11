"use client";

import { useState } from "react";
import { exchangeTerms } from "@/data/site";
import { formatINR } from "@/lib/format";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";
import { useRateInfo } from "../layout/useRateInfo";

const PURITIES = [
  { value: "24K", label: "24K (999)", fineness: 0.999 },
  { value: "22K", label: "22K (916)", fineness: 0.916 },
  { value: "20K", label: "20K (833)", fineness: 0.833 },
  { value: "18K", label: "18K (750)", fineness: 0.75 },
  { value: "14K", label: "14K (585)", fineness: 0.585 },
] as const;

/** Rough value of old gold at today’s 24K rate. The counter test decides the real figure. */
export default function ExchangeEstimator() {
  const { rates, updated } = useRateInfo();
  const [weight, setWeight] = useState("20");
  const [purity, setPurity] = useState<(typeof PURITIES)[number]["value"]>("22K");
  const [ours, setOurs] = useState(false);

  const grams = Math.max(0, Math.min(2000, Number(weight.replace(/[^\d.]/g, "")) || 0));
  const fineness = PURITIES.find((p) => p.value === purity)!.fineness;
  const value = grams * fineness * rates["24K"];
  const terms = ours ? exchangeTerms.ours : exchangeTerms.other;
  const exchange = useAnimatedNumber(value * terms.exchange);
  const cash = useAnimatedNumber(value * terms.buyback);

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-12">
      <div className="flex min-w-0 flex-col gap-8">
        <div>
          <label htmlFor="ex-weight" className="eyebrow text-stone">
            Weight of your gold
          </label>
          <div className="mt-2 flex items-baseline gap-2 border-b border-line-strong pb-2 focus-within:border-ink">
            <input
              id="ex-weight"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value.replace(/[^\d.]/g, "").slice(0, 7))}
              className="w-full min-w-0 flex-1 bg-transparent font-serif text-5xl text-ink figures outline-none focus-visible:outline-none"
              aria-describedby="ex-weight-hint"
            />
            <span className="font-serif text-3xl text-stone" aria-hidden="true">
              g
            </span>
          </div>
          <p id="ex-weight-hint" className="mt-2 text-xs text-stone">
            A kitchen scale is close enough. We weigh it properly at the counter.
          </p>
        </div>

        <fieldset>
          <legend className="eyebrow text-stone">Purity, if you know it</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {PURITIES.map((p) => (
              <label
                key={p.value}
                className={`flex h-10 cursor-pointer items-center border px-4 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold-deep ${
                  purity === p.value ? "border-ink bg-ink text-white" : "border-line-strong text-ink-soft hover:border-ink"
                }`}
              >
                <input type="radio" name="ex-purity" className="sr-only" checked={purity === p.value} onChange={() => setPurity(p.value)} />
                {p.label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-stone">Look for the number stamped inside a ring or on a clasp. Most Indian jewellery is 22K.</p>
        </fieldset>

        <fieldset>
          <legend className="eyebrow text-stone">Where it was bought</legend>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              [true, "From AHS"],
              [false, "Elsewhere"],
            ].map(([v, label]) => (
              <label
                key={String(v)}
                className={`flex h-12 cursor-pointer items-center justify-center border text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold-deep ${
                  ours === v ? "border-ink bg-ink text-white" : "border-line-strong text-ink-soft hover:border-ink"
                }`}
              >
                <input type="radio" name="ex-ours" className="sr-only" checked={ours === v} onChange={() => setOurs(v as boolean)} />
                {label as string}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex min-w-0 flex-col justify-between gap-8 bg-ivory p-6 md:p-8" aria-live="polite">
        <dl className="flex flex-col gap-8">
          <div>
            <dt className="eyebrow text-gold-deep">Towards new jewellery</dt>
            <dd className="mt-2 font-serif text-5xl text-ink figures">{formatINR(exchange)}</dd>
            <dd className="mt-1 text-sm text-stone">{Math.round(terms.exchange * 100)}% of the gold value</dd>
          </div>
          <div className="border-t border-line-strong pt-6">
            <dt className="eyebrow text-stone">Or paid to your bank</dt>
            <dd className="mt-2 font-serif text-3xl text-ink figures">{formatINR(cash)}</dd>
            <dd className="mt-1 text-sm text-stone">{Math.round(terms.buyback * 100)}% of the gold value</dd>
          </div>
        </dl>
        <p className="text-xs leading-relaxed text-stone">
          An estimate at today’s 24K rate of {formatINR(rates["24K"])}/g{updated ? `, updated ${updated.time}` : ""}. Stones are
          valued separately. The figure we pay is set by the purity test at the counter. (Sample terms for the prototype.)
        </p>
      </div>
    </div>
  );
}
