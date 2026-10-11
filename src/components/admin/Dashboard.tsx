"use client";

import Link from "next/link";
import { useMemo } from "react";
import { sampleHistory } from "@/data/rates";
import { schemeTerms } from "@/data/site";
import { greeting, reminderMessage, waTo } from "@/lib/admin";
import { slotLabel } from "@/lib/booking";
import { addDaysKey, longDateKey, relativeDay, stamp, todayKey } from "@/lib/dates";
import { formatINR } from "@/lib/format";
import { isDueThisWeek, memberState, nextDue } from "@/lib/scheme";
import { useHydrated } from "@/lib/motion";
import { occasionLabels } from "@/store/bookings";
import { enquiryTypeLabels } from "@/store/enquiries";
import { isOrderOpen } from "@/lib/orders";
import { useBookings, useEnquiries, useOrders, useProducts, useRates, useScheme } from "@/store";
import { useRateInfo } from "../layout/useRateInfo";
import { WhatsAppIcon } from "../ui/Icons";
import { BarChart, MiniLine } from "./AdminCharts";
import { AdminEmpty, Pill, StatCard } from "./AdminUI";

function Panel({ title, href, linkLabel, children }: { title: string; href?: string; linkLabel?: string; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-white p-6 md:p-8" aria-label={title}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-2xl text-ink">{title}</h2>
        {href ? (
          <Link href={href} className="link-draw text-sm text-stone hover:text-ink">
            {linkLabel ?? "See all"}
          </Link>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function Dashboard() {
  const hydrated = useHydrated();
  const { rates, updated } = useRateInfo();
  const previous = useRates((s) => s.previous);
  const enquiries = useEnquiries((s) => s.enquiries);
  const bookings = useBookings((s) => s.bookings);
  const members = useScheme((s) => s.members);
  const products = useProducts((s) => s.products);
  const orders = useOrders((s) => s.orders);
  const today = todayKey();

  const perDay = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const key = addDaysKey(today, i - 13);
        const n = enquiries.filter((q) => todayKeyOf(q.createdAt) === key).length;
        return { label: longDateKey(key), short: String(Number(key.slice(8))), value: n };
      }),
    [enquiries, today],
  );
  const history = useMemo(() => sampleHistory(rates).map((p) => p["22K"]), [rates]);

  if (!hydrated) return <div className="skeleton h-96 w-full" aria-label="Loading the dashboard" />;

  const newEnquiries = enquiries.filter((q) => q.status === "new");
  const week = addDaysKey(today, 7);
  const upcoming = bookings
    .filter((b) => b.date >= today && b.date <= week && b.status !== "cancelled" && b.status !== "completed")
    .sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot));
  const active = members.filter((m) => m.status === "active");
  const overdue = members.filter((m) => memberState(m) === "overdue");
  const dueWeek = members.filter((m) => isDueThisWeek(m) && memberState(m) !== "overdue");
  const dueTotal = dueWeek.reduce((s, m) => s + m.monthly, 0);
  const change = rates["22K"] - previous["22K"];
  const toPack = orders.filter((o) => o.status === "placed" || o.status === "packed");
  const ready = orders.filter((o) => o.status === "ready");

  return (
    <div>
      <header className="border-b border-line pb-8">
        <p className="eyebrow text-gold-deep">{longDateKey(today)}</p>
        <h1 className="mt-3 font-serif text-4xl font-light text-ink md:text-5xl">{greeting()}.</h1>
        <p className="mt-3 text-base text-stone">
          {newEnquiries.length
            ? `${newEnquiries.length} new ${newEnquiries.length === 1 ? "enquiry is" : "enquiries are"} waiting, and ${upcoming.length} ${upcoming.length === 1 ? "visit" : "visits"} this week.`
            : `All enquiries are answered. ${upcoming.length} ${upcoming.length === 1 ? "visit" : "visits"} this week.`}
          {toPack.length ? ` ${toPack.length} online ${toPack.length === 1 ? "order needs" : "orders need"} sending out.` : ""}
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Today’s 22K rate"
          value={formatINR(rates["22K"])}
          note={
            <>
              {change === 0 ? "Unchanged since yesterday" : `${change > 0 ? "Up" : "Down"} ${formatINR(Math.abs(change))} since yesterday`}
              <span className="block">
                24K {formatINR(rates["24K"])}
                {updated ? ` · updated ${updated.time}` : ""}
              </span>
            </>
          }
          href="/admin/rates"
          tone="gold"
        />
        <StatCard label="New enquiries" value={newEnquiries.length} note={`${enquiries.length} in total`} href="/admin/enquiries" tone={newEnquiries.length ? "gold" : "default"} />
        <StatCard
          label="Orders to send out"
          value={toPack.length}
          note={ready.length ? `${ready.length} waiting to be collected` : `${orders.filter(isOrderOpen).length} open in total`}
          href="/admin/orders"
          tone={toPack.length ? "gold" : "default"}
        />
        <StatCard label="Visits this week" value={upcoming.length} note={`${upcoming.filter((b) => b.status === "requested").length} to confirm`} href="/admin/visits" />
        <StatCard label="Scheme members" value={active.length} note={overdue.length ? `${overdue.length} overdue` : "None overdue"} href="/admin/members" tone={overdue.length ? "alert" : "default"} />
        <StatCard label="Instalments due this week" value={dueWeek.length} note={dueTotal ? `${formatINR(dueTotal)} expected` : "Nothing due"} href="/admin/members" />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Panel title="Enquiries, last 14 days" href="/admin/enquiries">
            <BarChart data={perDay} label="Enquiries received each day over the last 14 days" />
          </Panel>
        </div>
        <Panel title="22K rate, 30 days" href="/admin/rates" linkLabel="Change rate">
          <MiniLine values={history} label="22K gold rate over the last 30 days" />
          <p className="mt-4 text-xs text-stone">Earlier days are sample data; today is your saved rate.</p>
        </Panel>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-3">
        <Panel title="Coming in" href="/admin/visits">
          {upcoming.length ? (
            <ul className="flex flex-col">
              {upcoming.slice(0, 5).map((b) => (
                <li key={b.id} className="flex items-start justify-between gap-4 border-b border-line py-3 last:border-b-0">
                  <div>
                    <p className="text-base text-ink">{b.name}</p>
                    <p className="text-sm text-stone">
                      {relativeDay(b.date)}, {slotLabel(b.slot)} · {occasionLabels[b.occasion].label}
                    </p>
                  </div>
                  <Pill tone={b.status === "confirmed" ? "good" : "gold"}>{b.status === "confirmed" ? "Confirmed" : "To confirm"}</Pill>
                </li>
              ))}
            </ul>
          ) : (
            <AdminEmpty title="A quiet week" body="No visits booked for the next seven days." />
          )}
        </Panel>

        <Panel title="Latest enquiries" href="/admin/enquiries">
          <ul className="flex flex-col">
            {enquiries.slice(0, 5).map((q) => {
              const piece = products.find((p) => p.slug === (q.productSlug ?? q.productSlugs?.[0]));
              return (
                <li key={q.id} className="flex items-start justify-between gap-4 border-b border-line py-3 last:border-b-0">
                  <div className="min-w-0">
                    <p className="truncate text-base text-ink">{q.name ?? piece?.name ?? q.subject ?? enquiryTypeLabels[q.type]}</p>
                    <p className="text-sm text-stone">
                      {stamp(q.createdAt)} · {q.channel === "whatsapp" ? "WhatsApp" : "Form"}
                    </p>
                  </div>
                  {q.status === "new" ? <Pill tone="alert">New</Pill> : null}
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Needs a reminder" href="/admin/members">
          {overdue.length + dueWeek.length ? (
            <ul className="flex flex-col">
              {[...overdue, ...dueWeek].slice(0, 5).map((m) => {
                const next = nextDue(m);
                const link = waTo(m.phone, reminderMessage(m));
                return (
                  <li key={m.id} className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-b-0">
                    <div>
                      <p className="text-base text-ink">{m.name}</p>
                      <p className={`text-sm ${memberState(m) === "overdue" ? "text-error" : "text-stone"}`}>
                        {next ? `Instalment ${next.n} of ${schemeTerms.instalments}, ${relativeDay(next.date)}` : "Complete"} · {formatINR(m.monthly)}
                      </p>
                    </div>
                    {link ? (
                      <a href={link} target="_blank" rel="noopener noreferrer" aria-label={`Send ${m.name} a reminder on WhatsApp`} className="relative hit-area flex size-10 shrink-0 items-center justify-center border border-line-strong text-ink hover:border-ink">
                        <WhatsAppIcon className="size-4" />
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <AdminEmpty title="Everyone is up to date" body="No instalments are due or overdue this week." />
          )}
        </Panel>
      </div>
    </div>
  );
}

/** IST calendar date of an ISO timestamp. */
function todayKeyOf(iso: string) {
  return todayKey(new Date(iso));
}
