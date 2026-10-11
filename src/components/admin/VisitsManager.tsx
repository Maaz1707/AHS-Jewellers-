"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { visitConfirmMessage, waTo } from "@/lib/admin";
import { longDate, slotLabel } from "@/lib/booking";
import { addDaysKey, relativeDay, todayKey } from "@/lib/dates";
import { productPath } from "@/lib/enquiry";
import { useHydrated } from "@/lib/motion";
import { bookingStatusLabels, occasionLabels, type Booking, type BookingStatus } from "@/store/bookings";
import { useBookings, useProducts, useToast } from "@/store";
import { ChevronLeft, ChevronRight, WhatsAppIcon } from "../ui/Icons";
import { AdminEmpty, AdminPageHeader, FilterTabs, Pill } from "./AdminUI";

type View = "list" | "calendar";
type Tab = "upcoming" | "requested" | "past" | "all";

const tone: Record<BookingStatus, "gold" | "good" | "neutral" | "alert"> = {
  requested: "gold",
  confirmed: "good",
  completed: "neutral",
  cancelled: "alert",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function VisitRow({ b }: { b: Booking }) {
  const setStatus = useBookings((s) => s.setStatus);
  const products = useProducts((s) => s.products);
  const show = useToast((s) => s.show);
  const piece = products.find((p) => p.slug === b.pieceSlug);
  const wa = waTo(b.phone, visitConfirmMessage(b));
  const change = (status: BookingStatus) => {
    setStatus(b.id, status);
    show({ title: `Visit ${bookingStatusLabels[status].toLowerCase()}`, body: `${b.name}, ${longDate(b.date)}` });
  };

  return (
    <li className="border border-line bg-white p-5 md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={tone[b.status]}>{bookingStatusLabels[b.status]}</Pill>
            <span className="text-sm text-stone">{relativeDay(b.date)}</span>
          </div>
          <p className="mt-3 font-serif text-2xl text-ink">
            {longDate(b.date)}, {slotLabel(b.slot)}
          </p>
          <p className="mt-1 text-lg text-ink">
            {b.name} <span className="ml-2 text-base text-stone figures">{b.phone}</span>
          </p>
          <p className="mt-1 text-base text-ink-soft">
            {occasionLabels[b.occasion].label} · {b.floor === "bridal" ? "First floor, bridal salon" : "Ground floor"}
            {piece ? (
              <>
                {" · "}
                <Link href={productPath(piece)} target="_blank" className="link-line text-ink">
                  {piece.name}
                </Link>{" "}
                to keep ready
              </>
            ) : null}
          </p>
          {b.notes ? <p className="mt-2 max-w-prose text-base text-stone">&ldquo;{b.notes}&rdquo;</p> : null}
        </div>
        <div className="flex flex-wrap gap-2 lg:w-64 lg:flex-col">
          {b.status === "requested" ? (
            <button type="button" onClick={() => change("confirmed")} className="h-12 flex-1 lg:flex-none bg-ink px-4 text-base text-white hover:bg-gold-deep">
              Confirm visit
            </button>
          ) : null}
          {b.status === "confirmed" ? (
            <button type="button" onClick={() => change("completed")} className="h-12 flex-1 lg:flex-none bg-ink px-4 text-base text-white hover:bg-gold-deep">
              Mark as completed
            </button>
          ) : null}
          {wa && (b.status === "requested" || b.status === "confirmed") ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="flex h-12 flex-1 lg:flex-none items-center justify-center gap-2 border border-line-strong px-4 text-base text-ink hover:border-ink">
              <WhatsAppIcon className="size-4" />
              Message on WhatsApp
            </a>
          ) : null}
          {b.status === "requested" || b.status === "confirmed" ? (
            <button type="button" onClick={() => change("cancelled")} className="h-12 px-4 text-base text-stone hover:text-error">
              Cancel visit
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default function VisitsManager() {
  const hydrated = useHydrated();
  const bookings = useBookings((s) => s.bookings);
  const today = useMemo(() => todayKey(), []);
  const [view, setView] = useState<View>("list");
  const [tab, setTab] = useState<Tab>("upcoming");
  const [month, setMonth] = useState(() => today.slice(0, 7));
  const [day, setDay] = useState<string | null>(today);

  const sorted = useMemo(() => [...bookings].sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot)), [bookings]);
  if (!hydrated) return <div className="skeleton h-96 w-full" aria-label="Loading visits" />;

  const upcoming = sorted.filter((b) => b.date >= today && (b.status === "requested" || b.status === "confirmed"));
  const requested = upcoming.filter((b) => b.status === "requested");
  const past = sorted.filter((b) => !upcoming.includes(b)).reverse();
  const list = { upcoming, requested, past, all: sorted }[tab];

  // Calendar grid for the chosen month
  const first = `${month}-01`;
  const lead = new Date(`${first}T00:00:00Z`).getUTCDay();
  const days = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).getUTCDate();
  const cells = [...Array.from({ length: lead }, () => null), ...Array.from({ length: days }, (_, i) => addDaysKey(first, i))];
  while (cells.length % 7) cells.push(null);
  const shift = (n: number) => {
    const d = new Date(`${first}T00:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() + n);
    setMonth(d.toISOString().slice(0, 7));
  };
  const onDay = (key: string) => sorted.filter((b) => b.date === key && b.status !== "cancelled");
  const monthTitle = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${first}T00:00:00Z`));

  return (
    <div>
      <AdminPageHeader
        title="Visit bookings"
        intro="Visits requested on the site. Confirm them, send a WhatsApp, and mark them completed afterwards."
        actions={
          <FilterTabs<View>
            label="View"
            value={view}
            onChange={setView}
            options={[
              { value: "list", label: "List" },
              { value: "calendar", label: "Calendar" },
            ]}
          />
        }
      />

      {view === "list" ? (
        <>
          <div className="mt-8">
            <FilterTabs<Tab>
              label="Which visits"
              value={tab}
              onChange={setTab}
              options={[
                { value: "upcoming", label: "Upcoming", count: upcoming.length },
                { value: "requested", label: "To confirm", count: requested.length },
                { value: "past", label: "Past and cancelled", count: past.length },
                { value: "all", label: "All", count: sorted.length },
              ]}
            />
          </div>
          {list.length ? (
            <ul className="mt-6 flex flex-col gap-3">
              {list.map((b) => (
                <VisitRow key={b.id} b={b} />
              ))}
            </ul>
          ) : (
            <div className="mt-6">
              <AdminEmpty title="No visits here" body="Visits booked on the site will appear in this list." />
            </div>
          )}
        </>
      ) : (
        <div className="mt-8 grid gap-6 xl:grid-cols-5">
          <section className="border border-line bg-white p-5 md:p-8 xl:col-span-3" aria-label="Calendar">
            <div className="flex items-center justify-between">
              <p className="font-serif text-2xl text-ink">{monthTitle}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => shift(-1)} aria-label="Previous month" className="flex size-12 items-center justify-center border border-line-strong hover:border-ink">
                  <ChevronLeft className="size-5" />
                </button>
                <button type="button" onClick={() => shift(1)} aria-label="Next month" className="flex size-12 items-center justify-center border border-line-strong hover:border-ink">
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => (
                <span key={d} className="pb-2 text-center text-sm text-stone">
                  {d}
                </span>
              ))}
              {cells.map((key, i) =>
                key ? (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDay(key)}
                    aria-pressed={day === key}
                    aria-label={`${longDate(key)}: ${onDay(key).length} ${onDay(key).length === 1 ? "visit" : "visits"}`}
                    className={`flex aspect-square flex-col items-center justify-start gap-1 border p-1 text-sm transition-colors md:p-2 ${
                      day === key ? "border-ink bg-ink text-white" : key === today ? "border-gold text-ink" : "border-line text-ink hover:border-ink"
                    }`}
                  >
                    <span className="figures">{Number(key.slice(8))}</span>
                    {onDay(key).length ? (
                      <span className="flex flex-wrap justify-center gap-1" aria-hidden="true">
                        {onDay(key).slice(0, 4).map((b) => (
                          <span key={b.id} className={`size-2 rounded-full ${b.status === "requested" ? "bg-gold" : day === key ? "bg-white" : "bg-ink"}`} />
                        ))}
                      </span>
                    ) : null}
                  </button>
                ) : (
                  <span key={`e${i}`} aria-hidden="true" />
                ),
              )}
            </div>
            <p className="mt-4 flex items-center gap-4 text-sm text-stone">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-gold" /> To confirm
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-ink" /> Confirmed or done
              </span>
            </p>
          </section>
          <section className="xl:col-span-2" aria-label="Visits on the chosen day">
            <h2 className="font-serif text-2xl text-ink">{day ? longDate(day) : "Choose a day"}</h2>
            {day && onDay(day).length ? (
              <ul className="mt-4 flex flex-col gap-3">
                {onDay(day).map((b) => (
                  <VisitRow key={b.id} b={b} />
                ))}
              </ul>
            ) : (
              <div className="mt-4">
                <AdminEmpty title="No visits" body="Nothing booked on this day." />
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
