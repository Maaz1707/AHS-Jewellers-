"use client";

import { useMemo } from "react";
import { digitalGoldTerms } from "@/data/site";
import { monthLabel, shortDate, stamp, todayKey } from "@/lib/dates";
import { formatINR } from "@/lib/format";
import { balanceOf, formatVaultGrams, investedOf, walletSeries } from "@/lib/gold";
import { samePhone } from "@/store/scheme";
import { useGold, useRates } from "@/store";
import LineChart from "../charts/LineChart";
import Button from "../ui/Button";
import { VaultIcon } from "../ui/Icons";
import { DemoTag } from "../ui/Tags";

const methodLabels = { upi: "UPI", card: "Card", netbanking: "Net banking", counter: "At the counter" } as const;

/** The member’s digital gold: balance, value over time, history and redemption. */
export default function GoldWallet({ phone }: { phone: string }) {
  const all = useGold((s) => s.txns);
  const rates = useRates((s) => s.rates);
  const txns = useMemo(() => all.filter((t) => samePhone(t.phone, phone)), [all, phone]);
  const series = useMemo(() => walletSeries(txns, rates), [txns, rates]);

  if (!txns.length) {
    return (
      <div className="border border-dashed border-line-strong px-6 py-14 text-center">
        <VaultIcon className="mx-auto size-8 text-gold-deep" />
        <p className="mt-6 font-serif text-2xl font-light text-ink">No digital gold yet</p>
        <p className="mx-auto mt-3 max-w-prose text-sm text-stone">
          Buy 24K gold from {formatINR(digitalGoldTerms.minRupees)}, held in your name, and turn it into jewellery at the
          showroom whenever you like.
        </p>
        <div className="mt-8 flex justify-center">
          <Button href="/digital-gold#buy" arrow>
            Buy digital gold
          </Button>
        </div>
      </div>
    );
  }

  const grams = balanceOf(txns);
  const value = grams * rates["24K"];
  const invested = investedOf(txns);
  const change = value - invested;
  const pct = invested ? (change / invested) * 100 : 0;
  const canRedeem = grams >= digitalGoldTerms.minRedeemGrams;
  const note = `I would like to redeem ${grams.toFixed(4)} g of my digital gold as jewellery.`;
  const today = todayKey();

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="border border-line p-6 md:p-8 lg:col-span-5" aria-labelledby="balance-title">
          <div className="flex items-center justify-between gap-4">
            <h3 id="balance-title" className="eyebrow text-gold-deep">
              Gold in your vault
            </h3>
            <DemoTag />
          </div>
          <p className="mt-6 font-serif text-5xl text-ink figures">{formatVaultGrams(grams)}</p>
          <p className="mt-2 text-lg text-ink-soft figures">Worth {formatINR(value)} today</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm figures">
            <div>
              <dt className="text-stone">You have put in</dt>
              <dd className="mt-1 text-ink">{formatINR(invested)}</dd>
            </div>
            <div>
              <dt className="text-stone">Change in value</dt>
              <dd className={`mt-1 ${change >= 0 ? "text-success" : "text-error"}`}>
                {change >= 0 ? "+" : "−"}
                {formatINR(Math.abs(change))} ({Math.abs(pct).toFixed(1)}%)
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-stone">
            At today’s 24K rate of {formatINR(rates["24K"])}/g. What you paid includes 3% GST, which is why a new purchase starts
            slightly below cost.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {canRedeem ? (
              <Button href={`/book-a-visit?occasion=investment&note=${encodeURIComponent(note)}`} arrow className="w-full">
                Redeem as jewellery
              </Button>
            ) : (
              <p className="text-sm text-stone">
                You can redeem from {digitalGoldTerms.minRedeemGrams} g. Keep adding a little and it will be there before long.
              </p>
            )}
            <Button href="/digital-gold#buy" variant="secondary" magnetic={false} className="w-full">
              Buy more
            </Button>
          </div>
        </section>

        <section className="border border-line p-6 md:p-8 lg:col-span-7" aria-labelledby="value-title">
          <h3 id="value-title" className="eyebrow text-gold-deep">
            Value over time
          </h3>
          <div className="mt-6">
            <LineChart
              label="Value of your digital gold"
              format={formatINR}
              points={series.map((p, i) => ({
                label: `${shortDate(p.date)} · ${formatVaultGrams(p.grams)}`,
                short: i === 0 || p.date.slice(5, 7) !== series[i - 1].date.slice(5, 7) ? monthLabel(p.date).split(" ")[0] : undefined,
                value: p.value,
              }))}
            />
          </div>
          <p className="mt-4 text-xs text-stone">Each step up is a purchase; the slope between them is the gold rate. Earlier rates are sample data.</p>
        </section>
      </div>

      <section aria-labelledby="history-title">
        <h3 id="history-title" className="eyebrow text-gold-deep">
          Transactions
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-96 text-left text-sm">
            <caption className="sr-only">Your digital gold purchases and redemptions</caption>
            <thead>
              <tr className="border-b border-line-strong text-xs text-stone">
                <th scope="col" className="py-3 pr-4 font-normal">Date</th>
                <th scope="col" className="py-3 pr-4 font-normal">Type</th>
                <th scope="col" className="py-3 pr-4 text-right font-normal">Gold</th>
                <th scope="col" className="hidden py-3 pr-4 text-right font-normal md:table-cell">Rate</th>
                <th scope="col" className="py-3 text-right font-normal">Amount</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id} className="border-b border-line">
                  <td className="py-4 pr-4 text-ink-soft">
                    {todayKey(new Date(t.at)) === today ? "Today" : shortDate(todayKey(new Date(t.at)))}
                    <span className="block text-xs text-stone">{t.id}</span>
                  </td>
                  <td className="py-4 pr-4 text-ink">
                    {t.type === "buy" ? "Bought" : "Redeemed"}
                    <span className="block text-xs text-stone">
                      {t.note ?? (t.method ? methodLabels[t.method] : "")}
                      {t.demo ? " · demo" : ""}
                    </span>
                  </td>
                  <td className={`py-4 pr-4 text-right figures ${t.type === "buy" ? "text-ink" : "text-stone"}`}>
                    {t.type === "buy" ? "+" : "−"}
                    {t.grams.toFixed(4)} g
                  </td>
                  <td className="hidden py-4 pr-4 text-right figures text-ink-soft md:table-cell">{formatINR(t.rate)}/g</td>
                  <td className="py-4 text-right figures text-ink">{formatINR(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-stone">Last transaction {stamp(txns[0].at)}.</p>
      </section>
    </div>
  );
}
