"use client";

import { useMemo, type ReactNode } from "react";
import { sampleReports, type Point } from "@/data/reports";
import { dayLabel, longDateKey, monthLabel, shortDate } from "@/lib/dates";
import { formatINR, formatNumber } from "@/lib/format";
import { useHydrated } from "@/lib/motion";
import LineChart from "../charts/LineChart";
import { BarChart } from "./AdminCharts";
import { DemoTag } from "../ui/Tags";
import { AdminPageHeader, StatCard } from "./AdminUI";

function Panel({ title, note, children, className = "" }: { title: string; note?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`border border-line bg-white p-6 md:p-8 ${className}`} aria-label={title}>
      <h2 className="font-serif text-2xl text-ink">{title}</h2>
      <div className="mt-6">{children}</div>
      {note ? <p className="mt-4 text-xs text-stone">{note}</p> : null}
    </section>
  );
}

const sum = (p: Point[]) => p.reduce((s, x) => s + x.value, 0);
const change = (now: number, before: number) => {
  if (!before) return "New this period";
  const pct = ((now - before) / before) * 100;
  return `${pct >= 0 ? "Up" : "Down"} ${Math.abs(pct).toFixed(0)}% on the period before`;
};
const weeks = (p: Point[]) => p.map((x) => ({ label: `Week of ${shortDate(x.key)}`, short: shortDate(x.key).split(" ").slice(0, 2).join(" "), value: x.value }));
const months = (p: Point[]) => p.map((x) => ({ label: monthLabel(x.key), short: monthLabel(x.key).split(" ")[0], value: x.value }));

export default function Reports() {
  const hydrated = useHydrated();
  const data = useMemo(() => sampleReports(), []);
  if (!hydrated) return <div className="skeleton h-96 w-full" aria-label="Loading reports" />;

  const v30 = data.visitors.slice(-30);
  const vPrev = data.visitors.slice(0, 30);
  const enq4 = sum(data.enquiries.slice(-4));
  const enqPrev = sum(data.enquiries.slice(-8, -4));
  const bk4 = sum(data.bookings.slice(-4));
  const bkPrev = sum(data.bookings.slice(-8, -4));
  const online = data.onlineSales.at(-1)!.value;
  const onlinePrev = data.onlineSales.at(-2)!.value;
  const collections = data.schemeCollections.at(-1)!.value;

  return (
    <div>
      <AdminPageHeader
        title="Reports"
        intro="How the shop is doing, at a glance: visitors to the site, enquiries, visits, the savings scheme and sales."
        actions={<DemoTag />}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        <StatCard label="Site visitors, 30 days" value={formatNumber(sum(v30))} note={change(sum(v30), sum(vPrev))} />
        <StatCard label="Enquiries, 4 weeks" value={enq4} note={change(enq4, enqPrev)} />
        <StatCard label="Visits booked, 4 weeks" value={bk4} note={change(bk4, bkPrev)} />
        <StatCard label="Online sales this month" value={formatINR(online)} note={change(online, onlinePrev)} tone="gold" />
        <StatCard label="Scheme collections this month" value={formatINR(collections)} note={`${data.schemeMembers.at(-1)!.value} active members`} />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-3">
        <Panel title="Site visitors, last 30 days" className="xl:col-span-2" note="Busier at weekends, and rising into the festive season.">
          <LineChart
            label="Site visitors each day over the last 30 days"
            format={(n) => `${formatNumber(n)} visitors`}
            zeroBased
            points={v30.map((p, i) => ({ label: longDateKey(p.key), short: i % 7 === 0 || i === v30.length - 1 ? dayLabel(p.key).split(", ")[1] : undefined, value: p.value }))}
          />
        </Panel>
        <Panel title="Where visitors come from">
          <ul className="flex flex-col gap-4">
            {data.sources.map((s) => (
              <li key={s.label}>
                <div className="flex justify-between text-sm">
                  <span className="text-ink">{s.label}</span>
                  <span className="figures text-stone">{s.value}%</span>
                </div>
                <div className="mt-2 h-2 bg-ivory" aria-hidden="true">
                  <div className="h-full bg-chart" style={{ width: `${s.value}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <Panel title="Enquiries per week" note="WhatsApp, the contact form and calls, last twelve weeks.">
          <BarChart data={weeks(data.enquiries)} label="Enquiries per week over the last twelve weeks" />
        </Panel>
        <Panel title="Visits booked per week" note="Appointments made on the site, last twelve weeks.">
          <BarChart data={weeks(data.bookings)} label="Visit bookings per week over the last twelve weeks" unit={["visit", "visits"]} />
        </Panel>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <Panel title="Savings scheme members" note="Active members at the end of each month.">
          <LineChart
            label="Active savings scheme members by month"
            format={(n) => `${n} members`}
            points={months(data.schemeMembers)}
          />
        </Panel>
        <Panel title="Scheme collections per month" note="Instalments received, at the counter and online.">
          <BarChart data={months(data.schemeCollections)} label="Savings scheme instalments collected each month" format={formatINR} />
        </Panel>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <Panel title="Showroom sales per month" note="All jewellery sold at the counter, including scheme redemptions.">
          <BarChart data={months(data.showroomSales)} label="Showroom sales each month" format={formatINR} />
        </Panel>
        <Panel title="Online sales per month" note="Coins and lighter pieces bought on the site, since online sales began.">
          <BarChart data={months(data.onlineSales)} label="Online sales each month" format={formatINR} />
        </Panel>
      </div>

      <p className="mt-8 text-sm text-stone">
        Every figure on this page is sample data for the presentation. In the live shop it would come from site analytics,
        the counter’s billing system and online orders.
      </p>
    </div>
  );
}
