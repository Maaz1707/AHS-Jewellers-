"use client";

import { useMemo, useState } from "react";
import { schemeTerms } from "@/data/site";
import { reminderMessage, waTo } from "@/lib/admin";
import { relativeDay, shortDate } from "@/lib/dates";
import { formatINR } from "@/lib/format";
import { useHydrated } from "@/lib/motion";
import { dueDate, gramsFor, maturityDate, memberState, nextDue, paidTotal, schemeMaturity, type MemberState } from "@/lib/scheme";
import { downloadStatement } from "@/lib/statement";
import { paymentMethodLabels, type PaymentMethod, type SchemeMember } from "@/store/scheme";
import { useRates, useScheme, useToast } from "@/store";
import { StateChip } from "../account/SchemeTracker";
import Drawer from "../ui/Drawer";
import { DownloadIcon, WhatsAppIcon } from "../ui/Icons";
import { AdminEmpty, AdminPageHeader, FilterTabs, SearchBox, StatCard } from "./AdminUI";

type Tab = "all" | MemberState;

function Progress({ m }: { m: SchemeMember }) {
  const pct = (m.payments.length / schemeTerms.instalments) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="relative block h-1 w-24 overflow-hidden bg-line">
        <span className="absolute inset-y-0 left-0 bg-chart" style={{ width: `${pct}%` }} />
      </span>
      <span className="text-sm figures text-ink-soft">
        {m.payments.length}/{schemeTerms.instalments}
      </span>
    </div>
  );
}

function MemberDetail({ m }: { m: SchemeMember }) {
  const record = useScheme((s) => s.recordPayment);
  const rate22 = useRates((s) => s.rates["22K"]);
  const show = useToast((s) => s.show);
  const [method, setMethod] = useState<PaymentMethod>("counter");
  const next = nextDue(m);
  const reminder = waTo(m.phone, reminderMessage(m));
  const { total } = schemeMaturity(m.monthly);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3">
        <StateChip state={memberState(m)} />
        <span className="text-base text-stone figures">{m.phone}</span>
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-base">
        <div>
          <dt className="text-sm text-stone">Monthly</dt>
          <dd className="text-ink figures">{formatINR(m.monthly)}</dd>
        </div>
        <div>
          <dt className="text-sm text-stone">Paid so far</dt>
          <dd className="text-ink figures">{formatINR(paidTotal(m))}</dd>
        </div>
        <div>
          <dt className="text-sm text-stone">Next due</dt>
          <dd className="text-ink">{next ? `${shortDate(next.date)} (${relativeDay(next.date)})` : "All paid"}</dd>
        </div>
        <div>
          <dt className="text-sm text-stone">Redeem from</dt>
          <dd className="text-ink">{shortDate(maturityDate(m))}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-sm text-stone">Redemption value</dt>
          <dd className="text-ink figures">
            {formatINR(total)} <span className="text-stone">≈ {gramsFor(total, rate22).toFixed(2)} g of 22K today</span>
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3 sm:flex-row">
        {reminder ? (
          <a href={reminder} target="_blank" rel="noopener noreferrer" className="flex h-12 sm:flex-1 items-center justify-center gap-2 bg-ink px-4 text-base text-white hover:bg-gold-deep">
            <WhatsAppIcon className="size-4" />
            {next ? "Send reminder on WhatsApp" : "Invite to redeem on WhatsApp"}
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => downloadStatement(m, rate22)}
          className="flex h-12 sm:flex-1 items-center justify-center gap-2 border border-line-strong px-4 text-base text-ink hover:border-ink"
        >
          <DownloadIcon className="size-4" />
          Statement
        </button>
      </div>
      {reminder ? (
        <details className="-mt-4 text-sm text-stone">
          <summary className="cursor-pointer">See the message</summary>
          <p className="mt-2 border-l-2 border-gold bg-ivory p-3 text-ink-soft">{reminderMessage(m)}</p>
        </details>
      ) : null}

      <section aria-label="Payment record">
        <h3 className="eyebrow text-gold-deep">Payment record</h3>
        <ul className="mt-3 border-t border-line">
          {Array.from({ length: schemeTerms.instalments }, (_, i) => {
            const n = i + 1;
            const p = m.payments.find((x) => x.n === n);
            const isNext = next?.n === n;
            return (
              <li key={n} className={`flex flex-wrap items-center justify-between gap-3 border-b border-line py-3 ${isNext ? "bg-ivory px-3" : ""}`}>
                <div>
                  <p className="text-base text-ink">
                    Instalment {n} <span className="text-stone">· due {shortDate(dueDate(m, n))}</span>
                  </p>
                  {p ? (
                    <p className="text-sm text-success">
                      Received {shortDate(p.paidOn)} · {paymentMethodLabels[p.method]}
                      {p.demo ? " (demo)" : ""} · {p.ref}
                    </p>
                  ) : isNext ? (
                    <p className={`text-sm ${memberState(m) === "overdue" ? "text-error" : "text-stone"}`}>Due {relativeDay(dueDate(m, n))}</p>
                  ) : null}
                </div>
                {isNext ? (
                  <div className="flex items-center gap-2">
                    <label className="sr-only" htmlFor={`method-${m.id}`}>
                      Paid by
                    </label>
                    <select
                      id={`method-${m.id}`}
                      value={method}
                      onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                      className="h-12 border border-line-strong bg-white px-3 text-base text-ink"
                    >
                      {(Object.keys(paymentMethodLabels) as PaymentMethod[]).map((k) => (
                        <option key={k} value={k}>
                          {paymentMethodLabels[k]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const pay = record(m.id, method);
                        if (pay) show({ title: "Instalment marked as received", body: `${m.name}, instalment ${pay.n} of ${schemeTerms.instalments}` });
                      }}
                      className="h-12 bg-ink px-4 text-base text-white hover:bg-gold-deep"
                    >
                      Mark received
                    </button>
                  </div>
                ) : (
                  <span className="text-base figures text-ink">{p ? formatINR(p.amount) : ""}</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export default function MembersManager() {
  const hydrated = useHydrated();
  const members = useScheme((s) => s.members);
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const withState = useMemo(() => members.map((m) => ({ m, state: memberState(m) })), [members]);
  if (!hydrated) return <div className="skeleton h-96 w-full" aria-label="Loading scheme members" />;

  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const list = withState
    .filter((x) => tab === "all" || x.state === tab)
    .filter((x) => words.every((w) => `${x.m.name} ${x.m.phone} ${x.m.id}`.toLowerCase().includes(w)))
    .sort((a, b) => (nextDue(a.m)?.date ?? "9999").localeCompare(nextDue(b.m)?.date ?? "9999"));
  const count = (s: MemberState) => withState.filter((x) => x.state === s).length;
  const open = members.find((m) => m.id === openId) ?? null;
  const monthlyBook = members.filter((m) => nextDue(m)).reduce((s, m) => s + m.monthly, 0);

  return (
    <div>
      <AdminPageHeader title="Scheme members" intro="Everyone saving with the scheme. Mark instalments as received, and send a friendly reminder to anyone who is late." />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Active members" value={withState.filter((x) => x.state !== "matured").length} note={`${formatINR(monthlyBook)} expected each month`} />
        <StatCard label="Overdue" value={count("overdue")} note={`More than ${schemeTerms.graceDays} days past due`} tone={count("overdue") ? "alert" : "default"} />
        <StatCard label="Ready to redeem" value={count("matured")} note="All instalments paid" tone="gold" />
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs<Tab>
          label="Member status"
          value={tab}
          onChange={setTab}
          options={[
            { value: "all", label: "All", count: members.length },
            { value: "overdue", label: "Overdue", count: count("overdue") },
            { value: "due-soon", label: "Due this week", count: count("due-soon") },
            { value: "on-track", label: "On track", count: count("on-track") },
            { value: "matured", label: "Ready to redeem", count: count("matured") },
          ]}
        />
        <div className="lg:w-80">
          <SearchBox value={q} onChange={setQ} placeholder="Name, phone or number" label="Search members" />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-6">
          <AdminEmpty title="No members here" body={tab === "overdue" ? "Nobody is overdue. Well done." : "Try another filter or search."} />
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {list.map(({ m, state }) => {
            const next = nextDue(m);
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(m.id)}
                  className="grid w-full gap-3 border border-line bg-white p-5 text-left transition-colors hover:border-ink md:grid-cols-12 md:items-center md:gap-6"
                >
                  <span className="md:col-span-4">
                    <span className="block text-lg text-ink">{m.name}</span>
                    <span className="block text-sm text-stone figures">
                      {m.id} · {m.phone}
                    </span>
                  </span>
                  <span className="text-base figures text-ink md:col-span-2">{formatINR(m.monthly)}<span className="text-sm text-stone"> /month</span></span>
                  <span className="md:col-span-2">
                    <Progress m={m} />
                  </span>
                  <span className={`text-base md:col-span-2 ${state === "overdue" ? "text-error" : "text-ink-soft"}`}>
                    {next ? `${shortDate(next.date)}` : "Complete"}
                    {next ? <span className="block text-sm text-stone">{relativeDay(next.date)}</span> : null}
                  </span>
                  <span className="md:col-span-2 md:text-right">
                    <StateChip state={state} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Drawer open={open !== null} onClose={() => setOpenId(null)} eyebrow={open?.id ?? "Member"} title={open?.name ?? ""}>
        {open ? <MemberDetail key={open.id} m={open} /> : null}
      </Drawer>
    </div>
  );
}
