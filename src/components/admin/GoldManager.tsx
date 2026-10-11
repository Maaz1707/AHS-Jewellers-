"use client";

import { useMemo, useState } from "react";
import { addDaysKey, longDateKey, shortDate, stamp, todayKey } from "@/lib/dates";
import { formatINR } from "@/lib/format";
import { balanceOf, formatVaultGrams } from "@/lib/gold";
import { useHydrated } from "@/lib/motion";
import { phoneDigits } from "@/lib/admin";
import type { GoldTxn } from "@/store/gold";
import { useGold, useRates } from "@/store";
import { BarChart } from "./AdminCharts";
import { DemoTag } from "../ui/Tags";
import { AdminEmpty, AdminPageHeader, FilterTabs, Pill, SearchBox, StatCard } from "./AdminUI";

type Tab = "all" | "buy" | "redeem";
const methodLabels = { upi: "UPI", card: "Card", netbanking: "Net banking", counter: "At the counter" } as const;

export default function GoldManager() {
  const hydrated = useHydrated();
  const txns = useGold((s) => s.txns);
  const rate = useRates((s) => s.rates["24K"]);
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const today = todayKey();

  const perDay = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const key = addDaysKey(today, i - 29);
        const value = txns.filter((t) => t.type === "buy" && todayKey(new Date(t.at)) === key).reduce((s, t) => s + t.amount, 0);
        return { label: longDateKey(key), short: String(Number(key.slice(8))), value };
      }),
    [txns, today],
  );

  const holders = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; txns: GoldTxn[] }>();
    for (const t of txns) {
      const k = phoneDigits(t.phone) ?? t.phone;
      const h = map.get(k) ?? { name: t.name, phone: t.phone, txns: [] };
      h.txns.push(t);
      map.set(k, h);
    }
    return [...map.values()].map((h) => ({ ...h, grams: balanceOf(h.txns) })).sort((a, b) => b.grams - a.grams);
  }, [txns]);

  if (!hydrated) return <div className="skeleton h-96 w-full" aria-label="Loading digital gold" />;

  const held = holders.reduce((g, h) => g + h.grams, 0);
  const month = today.slice(0, 7);
  const thisMonth = txns.filter((t) => t.type === "buy" && todayKey(new Date(t.at)).startsWith(month));
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const list = txns
    .filter((t) => tab === "all" || t.type === tab)
    .filter((t) => words.every((w) => `${t.name} ${t.phone} ${t.id}`.toLowerCase().includes(w)));

  return (
    <div>
      <AdminPageHeader
        title="Digital gold"
        intro="Purchases made on the site and redemptions at the counter. In the live shop these come from the vault partner; here they are sample data."
        actions={<DemoTag />}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Held for customers" value={formatVaultGrams(held)} note={`Worth ${formatINR(held * rate)} at today’s 24K rate`} tone="gold" />
        <StatCard label="Customers holding gold" value={holders.filter((h) => h.grams > 0).length} note="With a balance above zero" />
        <StatCard label="Bought this month" value={formatINR(thisMonth.reduce((s, t) => s + t.amount, 0))} note={`${thisMonth.length} purchases, ${formatVaultGrams(thisMonth.reduce((g, t) => g + t.grams, 0))}`} />
        <StatCard label="Ready to redeem" value={holders.filter((h) => h.grams >= 0.5).length} note="Customers with 0.5 g or more" />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-3">
        <section className="border border-line bg-white p-6 md:p-8 xl:col-span-2" aria-label="Purchases, last 30 days">
          <h2 className="font-serif text-2xl text-ink">Purchases, last 30 days</h2>
          <div className="mt-6">
            <BarChart data={perDay} label="Rupees of digital gold bought each day over the last 30 days" format={formatINR} />
          </div>
        </section>
        <section className="border border-line bg-white p-6 md:p-8" aria-label="Largest balances">
          <h2 className="font-serif text-2xl text-ink">Largest balances</h2>
          <ul className="mt-6 flex flex-col">
            {holders.slice(0, 6).map((h) => (
              <li key={h.phone} className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-b-0">
                <span>
                  <span className="block text-base text-ink">{h.name}</span>
                  <span className="block text-sm text-stone figures">{h.phone}</span>
                </span>
                <span className="text-right figures">
                  <span className="block text-base text-ink">{formatVaultGrams(h.grams)}</span>
                  <span className="block text-sm text-stone">{formatINR(h.grams * rate)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs<Tab>
          label="Transaction type"
          value={tab}
          onChange={setTab}
          options={[
            { value: "all", label: "All", count: txns.length },
            { value: "buy", label: "Purchases", count: txns.filter((t) => t.type === "buy").length },
            { value: "redeem", label: "Redemptions", count: txns.filter((t) => t.type === "redeem").length },
          ]}
        />
        <div className="lg:w-80">
          <SearchBox value={q} onChange={setQ} placeholder="Name, phone or reference" label="Search transactions" />
        </div>
      </div>

      {list.length ? (
        <div className="mt-6 overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-96 text-left text-base">
            <caption className="sr-only">Digital gold transactions</caption>
            <thead>
              <tr className="border-b border-line-strong text-sm text-stone">
                <th scope="col" className="px-4 py-3 font-normal">Customer</th>
                <th scope="col" className="px-4 py-3 font-normal">When</th>
                <th scope="col" className="px-4 py-3 text-right font-normal">Gold</th>
                <th scope="col" className="hidden px-4 py-3 text-right font-normal md:table-cell">Rate</th>
                <th scope="col" className="px-4 py-3 text-right font-normal">Amount</th>
                <th scope="col" className="hidden px-4 py-3 font-normal lg:table-cell">How</th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-b-0 hover:bg-ivory">
                  <td className="px-4 py-3">
                    <span className="block text-ink">{t.name}</span>
                    <span className="block text-sm text-stone figures">{t.phone}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-soft">
                    {todayKey(new Date(t.at)) === today ? stamp(t.at) : shortDate(todayKey(new Date(t.at)))}
                    <span className="block text-xs text-stone">{t.id}</span>
                  </td>
                  <td className={`px-4 py-3 text-right figures ${t.type === "buy" ? "text-ink" : "text-stone"}`}>
                    {t.type === "buy" ? "+" : "−"}
                    {t.grams.toFixed(4)} g
                  </td>
                  <td className="hidden px-4 py-3 text-right text-sm figures text-ink-soft md:table-cell">{formatINR(t.rate)}/g</td>
                  <td className="px-4 py-3 text-right figures text-ink">{formatINR(t.amount)}</td>
                  <td className="hidden px-4 py-3 text-sm text-ink-soft lg:table-cell">
                    {t.type === "redeem" ? (t.note ?? "Redeemed") : t.method ? methodLabels[t.method] : ""}
                    {t.demo ? <span className="ml-2"><Pill tone="gold">Site demo</Pill></span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6">
          <AdminEmpty title="No transactions match" body="Try another filter or search." />
        </div>
      )}
    </div>
  );
}
