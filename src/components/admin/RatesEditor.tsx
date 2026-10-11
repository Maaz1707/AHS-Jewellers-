"use client";

import Image from "@/components/ui/Img";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { FINENESS, metalLabels, type Metal, type RateSet } from "@/data/rates";
import { stamp } from "@/lib/dates";
import { formatChange, formatINR, formatNumber } from "@/lib/format";
import { useHydrated } from "@/lib/motion";
import { pieceImage } from "@/lib/pieces";
import { priceFor } from "@/lib/pricing";
import { useProducts, useRates, useToast } from "@/store";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { AdminPageHeader } from "./AdminUI";

const ORDER: Metal[] = ["24K", "22K", "18K", "silver"];
/** Changes larger than this ask for a second look before saving. */
const WARN_PCT = 8;

export default function RatesEditor() {
  const hydrated = useHydrated();
  const rates = useRates((s) => s.rates);
  const log = useRates((s) => s.log);
  const setRates = useRates((s) => s.setRates);
  const products = useProducts((s) => s.products);
  const show = useToast((s) => s.show);
  const [draft, setDraft] = useState<Record<Metal, string> | null>(null);
  const [confirming, setConfirming] = useState(false);

  if (!hydrated) return <div className="skeleton h-96 w-full" aria-label="Loading rates" />;

  const values: Record<Metal, string> = draft ?? (Object.fromEntries(ORDER.map((m) => [m, String(rates[m])])) as Record<Metal, string>);
  const parsed = Object.fromEntries(ORDER.map((m) => [m, Number(values[m].replace(/[^\d.]/g, ""))])) as RateSet;
  const errors = Object.fromEntries(
    ORDER.map((m) => {
      const v = parsed[m];
      if (!values[m].trim() || !Number.isFinite(v) || v <= 0) return [m, "Enter a rate in rupees per gram."];
      if (m !== "silver" && (v < 1000 || v > 100000)) return [m, "That looks too far off for gold per gram."];
      if (m === "silver" && (v < 10 || v > 2000)) return [m, "That looks too far off for silver per gram."];
      return [m, ""];
    }),
  ) as Record<Metal, string>;
  const order22 = parsed["22K"] > parsed["24K"] || parsed["18K"] > parsed["22K"];
  const valid = ORDER.every((m) => !errors[m]) && !order22;
  const changed = ORDER.some((m) => parsed[m] !== rates[m]);
  const bigMoves = ORDER.filter((m) => Math.abs(((parsed[m] - rates[m]) / rates[m]) * 100) > WARN_PCT);

  const set = (m: Metal, v: string) => setDraft({ ...values, [m]: v });
  const fromTwentyFour = () => {
    const base = parsed["24K"];
    if (!base) return;
    setDraft({ ...values, "22K": String(Math.round(base * FINENESS["22K"])), "18K": String(Math.round(base * FINENESS["18K"])) });
  };

  const save = () => {
    setRates(parsed);
    setDraft(null);
    setConfirming(false);
    show({ title: "Rates updated across the site", body: `22K is now ${formatINR(parsed["22K"])} per gram.`, action: { label: "See the rate page", href: "/gold-rate" } });
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid || !changed) return;
    if (bigMoves.length) setConfirming(true);
    else save();
  };

  // A few pieces to show the effect of the new rate.
  const examples = ["polki-rani-haar", "nakshi-bangles", "solitaire-halo-ring", "lakshmi-gold-coin-10g"]
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div>
      <AdminPageHeader
        title="Gold rates"
        intro="Type today’s rates per gram and press Save. Every price, calculator and rate on the site changes straight away."
      />

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <form onSubmit={onSubmit} noValidate className="min-w-0 border border-line bg-white p-6 md:p-8 xl:col-span-2" aria-label="Today’s rates">
          <div className="grid gap-6 sm:grid-cols-2">
            {ORDER.map((m) => {
              const id = `rate-${m}`;
              const delta = parsed[m] && Number.isFinite(parsed[m]) ? formatChange(parsed[m], rates[m]) : "";
              return (
                <div key={m} className="min-w-0">
                  <label htmlFor={id} className="block text-base text-ink">
                    {metalLabels[m].name} <span className="text-sm text-stone">per gram</span>
                  </label>
                  <div className={`mt-2 flex h-16 items-center gap-2 border bg-white px-4 focus-within:border-ink ${errors[m] ? "border-error" : "border-line-strong"}`}>
                    <span className="font-serif text-2xl text-stone">₹</span>
                    <input
                      id={id}
                      inputMode="decimal"
                      value={values[m]}
                      onChange={(e) => set(m, e.target.value)}
                      aria-invalid={errors[m] ? true : undefined}
                      aria-describedby={`${id}-note`}
                      className="h-full min-w-0 flex-1 bg-transparent font-serif text-3xl text-ink figures outline-none focus-visible:outline-none"
                    />
                  </div>
                  <p id={`${id}-note`} className={`mt-2 min-h-6 text-sm ${errors[m] ? "text-error" : "text-stone"}`}>
                    {errors[m] || (parsed[m] !== rates[m] ? `Was ${formatINR(rates[m])}, ${delta}` : `Current rate. Per 10 g: ${formatINR(rates[m] * 10)}`)}
                  </p>
                </div>
              );
            })}
          </div>
          {order22 ? <p className="mt-2 text-sm text-error">22K should be lower than 24K, and 18K lower than 22K. Please check the figures.</p> : null}

          <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={fromTwentyFour} className="self-start text-base text-ink-soft underline-offset-4 hover:text-ink hover:underline">
              Work out 22K and 18K from 24K
            </button>
            <div className="flex items-center gap-4">
              {draft ? (
                <button type="button" onClick={() => setDraft(null)} className="text-base text-stone hover:text-ink">
                  Undo changes
                </button>
              ) : null}
              <Button type="submit" size="lg" disabled={!valid || !changed} magnetic={false}>
                Save rates
              </Button>
            </div>
          </div>
        </form>

        <aside className="border border-line bg-white p-6 md:p-8" aria-label="Effect on prices">
          <h2 className="font-serif text-2xl text-ink">What customers will see</h2>
          <p className="mt-2 text-sm text-stone">Approximate prices with the rates as typed.</p>
          <ul className="mt-6 flex flex-col">
            {examples.map((p) => {
              const before = priceFor(p, rates);
              const after = valid ? priceFor(p, parsed) : before;
              const img = pieceImage(p);
              return (
                <li key={p.slug} className="flex items-center gap-4 border-b border-line py-3 last:border-b-0">
                  <span className="relative block size-12 shrink-0 overflow-hidden bg-ivory">
                    <Image src={img.src} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base text-ink">{p.name}</span>
                    <span className="block text-xs text-stone">{p.purity}</span>
                  </span>
                  <span className="text-right text-sm figures">
                    <span className="block text-ink">{formatINR(after)}</span>
                    {after !== before ? <span className="block text-xs text-stone line-through">{formatINR(before)}</span> : null}
                  </span>
                </li>
              );
            })}
          </ul>
          <Link href="/gold-rate" target="_blank" className="link-draw mt-6 inline-block text-sm text-ink-soft hover:text-ink">
            Open the public rate page
          </Link>
        </aside>
      </div>

      <section className="mt-8 border border-line bg-white p-6 md:p-8" aria-label="Recent changes">
        <h2 className="font-serif text-2xl text-ink">Recent changes</h2>
        {log.length ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-96 text-left text-base">
              <thead>
                <tr className="border-b border-line-strong text-sm text-stone">
                  <th scope="col" className="py-3 pr-4 font-normal">Saved</th>
                  {ORDER.map((m) => (
                    <th key={m} scope="col" className="py-3 pr-4 text-right font-normal">
                      {m === "silver" ? "Silver" : m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {log.map((l) => (
                  <tr key={l.at} className="border-b border-line">
                    <td className="py-3 pr-4 text-ink-soft">{stamp(l.at)}</td>
                    {ORDER.map((m) => (
                      <td key={m} className="py-3 pr-4 text-right figures text-ink">
                        ₹{formatNumber(l.rates[m])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-base text-stone">No changes saved yet. Today’s figures are the opening sample rates.</p>
        )}
      </section>

      <Modal open={confirming} onClose={() => setConfirming(false)} eyebrow="Please check" title="That is a big change">
        <p className="text-ink-soft">
          {bigMoves.map((m) => `${m === "silver" ? "Silver" : m} moves ${formatChange(parsed[m], rates[m])}`).join(", ")} compared with the current
          rate. Is that right?
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button onClick={save} magnetic={false}>
            Yes, save these rates
          </Button>
          <button type="button" onClick={() => setConfirming(false)} className="text-base text-stone hover:text-ink">
            Go back and check
          </button>
        </div>
      </Modal>
    </div>
  );
}
