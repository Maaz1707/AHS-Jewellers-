"use client";

import { useId, useState } from "react";
import { formatINR } from "@/lib/format";
import { SCHEME, schemeMaturity } from "@/store/scheme";
import Button from "../ui/Button";
import RevealImage from "../ui/RevealImage";
import SectionHeading from "../ui/SectionHeading";

const PRESETS = [2000, 5000, 10000, 25000];

export default function SchemeTeaser() {
  const [monthly, setMonthly] = useState(5000);
  const id = useId();
  const { paid, bonus, total } = schemeMaturity(monthly);
  const pct = ((monthly - SCHEME.minMonthly) / (SCHEME.maxMonthly - SCHEME.minMonthly)) * 100;

  return (
    <section aria-labelledby="scheme-title" className="overflow-hidden bg-ivory section-y">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="relative lg:col-span-5">
          <RevealImage image="brideHands" sizes="(min-width: 1024px) 40vw, 100vw" parallax={6} className="aspect-portrait" />
          <p className="absolute -bottom-6 left-6 bg-white px-5 py-4 shadow-soft md:left-10">
            <span className="block eyebrow text-gold-deep">Sample terms</span>
            <span className="mt-1 block font-serif text-xl text-ink">11 + 1 months</span>
          </p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <SectionHeading
            id="scheme-title"
            eyebrow="Gold savings scheme"
            title={
              <>
                Eleven months.
                <br />
                <em className="text-gold-deep">The twelfth is ours.</em>
              </>
            }
            intro="Put aside a fixed amount each month. After eleven instalments we add one more, and you choose jewellery to the full value at the day’s rate."
          />

          <div className="mt-12 border border-line-strong bg-white p-6 md:p-10">
            <div className="flex items-baseline justify-between gap-4">
              <label htmlFor={id} className="eyebrow text-stone">
                Monthly instalment
              </label>
              <output htmlFor={id} className="font-serif text-3xl text-ink figures md:text-4xl">
                {formatINR(monthly)}
              </output>
            </div>

            <input
              id={id}
              type="range"
              min={SCHEME.minMonthly}
              max={SCHEME.maxMonthly}
              step={SCHEME.step}
              value={monthly}
              onChange={(e) => setMonthly(Number(e.target.value))}
              aria-valuetext={`${formatINR(monthly)} a month`}
              className="range mt-6 w-full"
              style={{ "--fill": `${pct}%` } as React.CSSProperties}
            />
            <div className="mt-4 grid grid-cols-4 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setMonthly(p)}
                  aria-pressed={monthly === p}
                  className="chip"
                >
                  {formatINR(p)}
                </button>
              ))}
            </div>

            <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-6">
              <div>
                <dt className="text-xs text-stone">You pay, 11 months</dt>
                <dd className="mt-1 font-serif text-xl text-ink figures md:text-2xl">{formatINR(paid)}</dd>
              </div>
              <div>
                <dt className="text-xs text-stone">We add</dt>
                <dd className="mt-1 font-serif text-xl text-gold-deep figures md:text-2xl">+ {formatINR(bonus)}</dd>
              </div>
              <div>
                <dt className="text-xs text-stone">Yours to choose</dt>
                <dd className="mt-1 font-serif text-xl text-ink figures md:text-2xl">{formatINR(total)}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-10">
            <Button href="/savings-scheme" variant="secondary" arrow>
              See the full scheme
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
