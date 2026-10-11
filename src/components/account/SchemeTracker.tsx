"use client";

import { useState } from "react";
import { schemeTerms } from "@/data/site";
import { relativeDay, shortDate } from "@/lib/dates";
import { formatINR } from "@/lib/format";
import {
  dueDate,
  gramsFor,
  maturityDate,
  memberState,
  memberStateLabels,
  nextDue,
  paidTotal,
  schemeMaturity,
  type MemberState,
} from "@/lib/scheme";
import { downloadStatement } from "@/lib/statement";
import { paymentMethodLabels, type SchemeMember } from "@/store/scheme";
import { useRates } from "@/store";
import Button from "../ui/Button";
import { DownloadIcon } from "../ui/Icons";
import DemoPayment from "./DemoPayment";
import ProgressRing from "./ProgressRing";

export const stateTone: Record<MemberState, string> = {
  matured: "border-gold text-gold-deep",
  overdue: "border-error text-error",
  "due-soon": "border-ink text-ink",
  "on-track": "border-success text-success",
};

export function StateChip({ state }: { state: MemberState }) {
  return <span className={`inline-flex items-center border px-2 py-1 text-micro font-medium uppercase tracking-wide ${stateTone[state]}`}>{memberStateLabels[state]}</span>;
}

/** One scheme: progress, figures, history, statement and the demo payment. */
export default function SchemeTracker({ member }: { member: SchemeMember }) {
  const rate22 = useRates((s) => s.rates["22K"]);
  const [paying, setPaying] = useState(false);
  const paid = paidTotal(member);
  const { total } = schemeMaturity(member.monthly);
  const next = nextDue(member);
  const state = memberState(member);
  const left = schemeTerms.instalments - member.payments.length;

  return (
    <div>
      <div className="flex flex-col gap-10 border border-line p-6 md:flex-row md:items-center md:p-10">
        <ProgressRing value={member.payments.length} max={schemeTerms.instalments} />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <p className="eyebrow text-stone">{member.id}</p>
            <StateChip state={state} />
          </div>
          <p className="mt-3 font-serif text-3xl text-ink">
            {formatINR(member.monthly)} <span className="text-xl text-stone">a month</span>
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 text-sm lg:grid-cols-3">
            <div>
              <dt className="text-stone">Paid so far</dt>
              <dd className="mt-1 font-serif text-2xl text-ink figures">{formatINR(paid)}</dd>
            </div>
            <div>
              <dt className="text-stone">Instalments left</dt>
              <dd className="mt-1 font-serif text-2xl text-ink figures">{left}</dd>
            </div>
            <div>
              <dt className="text-stone">Next due</dt>
              <dd className="mt-1 text-ink">
                {next ? (
                  <>
                    {shortDate(next.date)}
                    <span className={`block text-xs ${state === "overdue" ? "text-error" : "text-stone"}`}>{relativeDay(next.date)}</span>
                  </>
                ) : (
                  "All paid"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-stone">Redeem from</dt>
              <dd className="mt-1 text-ink">{shortDate(maturityDate(member))}</dd>
            </div>
            <div>
              <dt className="text-stone">Your balance today</dt>
              <dd className="mt-1 text-ink figures">≈ {gramsFor(paid, rate22).toFixed(2)} g of 22K</dd>
            </div>
            <div>
              <dt className="text-stone">At redemption</dt>
              <dd className="mt-1 text-ink figures">
                {formatINR(total)} <span className="text-stone">≈ {gramsFor(total, rate22).toFixed(2)} g</span>
              </dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {next ? (
              <Button onClick={() => setPaying(true)} arrow>
                Pay this month’s instalment
              </Button>
            ) : (
              <Button href="/book-a-visit" arrow>
                Book a visit to redeem
              </Button>
            )}
            <Button variant="secondary" magnetic={false} onClick={() => downloadStatement(member, rate22)} icon={<DownloadIcon className="size-4" />}>
              Download statement
            </Button>
          </div>
        </div>
      </div>

      <h3 className="mt-12 eyebrow text-gold-deep">Payment history</h3>
      <div className="mt-4 overflow-x-auto" data-lenis-prevent="">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">All {schemeTerms.instalments} instalments with due date, payment date, method and receipt</caption>
          <thead>
            <tr className="border-b border-line-strong eyebrow text-stone">
              <th scope="col" className="py-3 pr-4 font-medium">No.</th>
              <th scope="col" className="py-3 pr-4 font-medium">Due</th>
              <th scope="col" className="py-3 pr-4 font-medium">Paid</th>
              <th scope="col" className="hidden py-3 pr-4 font-medium md:table-cell">Method</th>
              <th scope="col" className="py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: schemeTerms.instalments }, (_, i) => {
              const n = i + 1;
              const p = member.payments.find((x) => x.n === n);
              const isNext = next?.n === n;
              return (
                <tr key={n} className={`border-b border-line ${isNext ? "bg-ivory" : ""}`}>
                  <td className="py-3 pr-4 figures text-stone">{String(n).padStart(2, "0")}</td>
                  <td className="py-3 pr-4 text-ink-soft">{shortDate(dueDate(member, n))}</td>
                  <td className="py-3 pr-4">
                    {p ? <span className="text-ink">{shortDate(p.paidOn)}</span> : isNext ? <span className="text-gold-deep">Next</span> : <span className="text-stone">–</span>}
                  </td>
                  <td className="hidden py-3 pr-4 text-ink-soft md:table-cell">{p ? `${paymentMethodLabels[p.method]}${p.demo ? " (demo)" : ""}` : ""}</td>
                  <td className="py-3 text-right figures text-ink">{p ? formatINR(p.amount) : ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <DemoPayment member={member} open={paying} onClose={() => setPaying(false)} />
    </div>
  );
}
