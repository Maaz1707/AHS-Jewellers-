import { schemeTerms } from "@/data/site";
import type { SchemeMember } from "@/store/scheme";
import { addDaysKey, addMonthsKey, daysBetween, todayKey } from "./dates";

/** What a monthly amount adds up to over the scheme. */
export const schemeMaturity = (monthly: number) => ({
  paid: monthly * schemeTerms.instalments,
  bonus: monthly * schemeTerms.bonusInstalments,
  total: monthly * (schemeTerms.instalments + schemeTerms.bonusInstalments),
});

/** Due date of instalment n (1-based). Instalment 1 is due on the start date. */
export const dueDate = (m: Pick<SchemeMember, "startDate">, n: number) => addMonthsKey(m.startDate, n - 1);

/** Redemption opens one month after the last instalment. */
export const maturityDate = (m: Pick<SchemeMember, "startDate">) => addMonthsKey(m.startDate, schemeTerms.instalments);

export const paidCount = (m: SchemeMember) => m.payments.length;
export const paidTotal = (m: SchemeMember) => m.payments.reduce((s, p) => s + p.amount, 0);
export const isComplete = (m: SchemeMember) => paidCount(m) >= schemeTerms.instalments;

export const nextDue = (m: SchemeMember) => (isComplete(m) ? null : { n: paidCount(m) + 1, date: dueDate(m, paidCount(m) + 1) });

export type MemberState = "matured" | "overdue" | "due-soon" | "on-track";

export const memberStateLabels: Record<MemberState, string> = {
  matured: "Ready to redeem",
  overdue: "Overdue",
  "due-soon": "Due this week",
  "on-track": "On track",
};

/** Where a member stands today. "Due soon" means within the next seven days. */
export function memberState(m: SchemeMember, today = todayKey()): MemberState {
  const next = nextDue(m);
  if (!next) return "matured";
  const days = daysBetween(today, next.date);
  if (days < -schemeTerms.graceDays) return "overdue";
  if (days <= 7) return "due-soon";
  return "on-track";
}

/** Approximate grams of gold a rupee value buys at a per-gram rate. */
export const gramsFor = (value: number, ratePerGram: number) => (ratePerGram > 0 ? value / ratePerGram : 0);

/** Reference shown on statements: SC-2026-0142 style. */
export const memberRef = (m: Pick<SchemeMember, "id">) => m.id;

export const isDueThisWeek = (m: SchemeMember, today = todayKey()) => {
  const next = nextDue(m);
  return Boolean(next && next.date >= addDaysKey(today, -schemeTerms.graceDays) && next.date <= addDaysKey(today, 7));
};
