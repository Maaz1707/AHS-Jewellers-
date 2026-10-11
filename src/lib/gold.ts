import { sampleHistory, type RatePoint, type RateSet } from "@/data/rates";
import { digitalGoldTerms } from "@/data/site";
import type { GoldTxn } from "@/store/gold";
import { addDaysKey, daysBetween, todayKey } from "./dates";

/** Grams bought with a rupee amount (GST included), rounded down to 0.0001 g. */
export const gramsForRupees = (rupees: number, rate24: number) =>
  Math.floor((rupees / (rate24 * (1 + digitalGoldTerms.gst))) * 10000) / 10000;

/** Rupees to pay (GST included) for a weight, rounded up to the rupee. */
export const rupeesForGrams = (grams: number, rate24: number) => Math.ceil(grams * rate24 * (1 + digitalGoldTerms.gst));

/** A buy quote split into gold value and GST. */
export function goldQuote(rupees: number, rate24: number) {
  const grams = gramsForRupees(rupees, rate24);
  const value = rupees / (1 + digitalGoldTerms.gst);
  return { grams, value, gst: rupees - value };
}

/** "1.2345 g": vault balances always show four decimals. */
export const formatVaultGrams = (g: number) => `${g.toFixed(4)} g`;

/** Balance in grams after the given transactions (redemptions reduce it). */
export const balanceOf = (txns: GoldTxn[]) =>
  Math.max(0, Math.round(txns.reduce((g, t) => g + (t.type === "buy" ? t.grams : -t.grams), 0) * 10000) / 10000);

/** Rupees put in, less the value of anything already redeemed. */
export const investedOf = (txns: GoldTxn[]) => txns.reduce((s, t) => s + (t.type === "buy" ? t.amount : -t.amount), 0);

/**
 * SAMPLE 24K rate on a past day, from the deterministic sample history that
 * ends on the given rates. Used for seed transactions and the wallet chart.
 */
export function rateOn(dayKey: string, rates: RateSet, today = todayKey(), history: RatePoint[] = sampleHistory(rates, 400)) {
  const ago = Math.min(history.length - 1, Math.max(0, daysBetween(dayKey, today)));
  return history[history.length - 1 - ago]["24K"];
}

export type WalletPoint = { date: string; grams: number; value: number };

/** Value of a wallet over time, from its first purchase until today. */
export function walletSeries(txns: GoldTxn[], rates: RateSet, today = todayKey()): WalletPoint[] {
  if (!txns.length) return [];
  const sorted = [...txns].sort((a, b) => a.at.localeCompare(b.at));
  const start = todayKey(new Date(sorted[0].at));
  const span = Math.max(1, daysBetween(start, today));
  const history = sampleHistory(rates, Math.max(31, span + 1));
  const step = span > 120 ? 7 : span > 30 ? 3 : 1;
  const points: WalletPoint[] = [];
  for (let d = 0; d < span; d += step) {
    const date = addDaysKey(start, d);
    const held = balanceOf(sorted.filter((t) => todayKey(new Date(t.at)) <= date));
    points.push({ date, grams: held, value: held * rateOn(date, rates, today, history) });
  }
  const held = balanceOf(sorted);
  points.push({ date: today, grams: held, value: held * rates["24K"] });
  return points;
}
