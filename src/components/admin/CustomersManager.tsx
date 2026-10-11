"use client";

import { useMemo, useState } from "react";
import { buildCustomers, waTo, type Customer } from "@/lib/admin";
import { longDate, slotLabel } from "@/lib/booking";
import { stamp } from "@/lib/dates";
import { formatINR } from "@/lib/format";
import { useHydrated } from "@/lib/motion";
import { memberStateLabels } from "@/lib/scheme";
import { bookingStatusLabels, occasionLabels } from "@/store/bookings";
import { enquiryStatusLabels, enquiryTypeLabels } from "@/store/enquiries";
import { orderStatusLabels } from "@/lib/orders";
import { formatVaultGrams, balanceOf } from "@/lib/gold";
import { useBookings, useEnquiries, useGold, useOrders, useProducts, useScheme } from "@/store";
import { StateChip } from "../account/SchemeTracker";
import Drawer from "../ui/Drawer";
import { WhatsAppIcon } from "../ui/Icons";
import { AdminEmpty, AdminPageHeader, Pill, SearchBox } from "./AdminUI";

function Activity({ c }: { c: Customer }) {
  const products = useProducts((s) => s.products);
  const name = (slug?: string) => products.find((p) => p.slug === slug)?.name;
  const items = [
    ...c.bookings.map((b) => ({
      at: b.createdAt,
      title: `Visit ${longDate(b.date)}, ${slotLabel(b.slot)}`,
      body: `${occasionLabels[b.occasion].label}${b.pieceSlug ? ` · ${name(b.pieceSlug) ?? ""}` : ""}`,
      tag: bookingStatusLabels[b.status],
    })),
    ...c.orders.map((o) => ({
      at: o.createdAt,
      title: `Order ${o.id}, ${formatINR(o.total)}`,
      body: o.lines.map((l) => l.name).join(", "),
      tag: orderStatusLabels[o.status],
    })),
    ...c.gold.map((t) => ({
      at: t.at,
      title: `Digital gold ${t.type === "buy" ? "bought" : "redeemed"}, ${formatVaultGrams(t.grams)}`,
      body: formatINR(t.amount),
      tag: t.demo ? "Demo" : "Done",
    })),
    ...c.enquiries.map((q) => ({
      at: q.createdAt,
      title: `${enquiryTypeLabels[q.type]}${q.subject ? `: ${q.subject}` : ""}`,
      body: q.message ?? (q.productSlug ? name(q.productSlug) ?? "" : ""),
      tag: enquiryStatusLabels[q.status],
    })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  const wa = waTo(c.phone, `Namaste ${c.name.split(" ")[0]}, this is AHS Jewellers.`);

  return (
    <div className="flex flex-col gap-8">
      <dl className="grid grid-cols-2 gap-4 text-base">
        <div>
          <dt className="text-sm text-stone">Phone</dt>
          <dd className="text-ink figures">{c.phone}</dd>
        </div>
        <div>
          <dt className="text-sm text-stone">Email</dt>
          <dd className="break-all text-ink">{c.email ?? "–"}</dd>
        </div>
      </dl>
      {wa ? (
        <a href={wa} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 bg-ink px-4 text-base text-white hover:bg-gold-deep">
          <WhatsAppIcon className="size-4" />
          Message on WhatsApp
        </a>
      ) : null}
      {c.gold.length ? (
        <div className="border border-line p-4">
          <p className="text-base text-ink">Digital gold</p>
          <p className="mt-1 text-sm text-stone">{formatVaultGrams(balanceOf(c.gold))} held</p>
        </div>
      ) : null}
      {c.members.map((m) => (
        <div key={m.id} className="border border-line p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-base text-ink">Savings scheme {m.id}</p>
            {c.memberState ? <StateChip state={c.memberState} /> : null}
          </div>
          <p className="mt-1 text-sm text-stone">
            {formatINR(m.monthly)} a month · {m.payments.length} of 11 paid
          </p>
        </div>
      ))}
      <section aria-label="Activity">
        <h3 className="eyebrow text-gold-deep">Activity</h3>
        {items.length ? (
          <ul className="mt-3 border-t border-line">
            {items.map((it, i) => (
              <li key={i} className="border-b border-line py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-base text-ink">{it.title}</p>
                  <Pill>{it.tag}</Pill>
                </div>
                {it.body ? <p className="mt-1 text-sm text-ink-soft">{it.body}</p> : null}
                <p className="mt-1 text-xs text-stone">{stamp(it.at)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-base text-stone">Scheme member only; no visits, orders or messages yet.</p>
        )}
      </section>
    </div>
  );
}

export default function CustomersManager() {
  const hydrated = useHydrated();
  const enquiries = useEnquiries((s) => s.enquiries);
  const bookings = useBookings((s) => s.bookings);
  const members = useScheme((s) => s.members);
  const orders = useOrders((s) => s.orders);
  const gold = useGold((s) => s.txns);
  const [q, setQ] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const customers = useMemo(() => buildCustomers(enquiries, bookings, members, orders, gold), [enquiries, bookings, members, orders, gold]);
  if (!hydrated) return <div className="skeleton h-96 w-full" aria-label="Loading customers" />;

  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const list = customers.filter((c) => words.every((w) => `${c.name} ${c.phone} ${c.email ?? ""}`.toLowerCase().includes(w)));
  const open = customers.find((c) => c.key === openKey) ?? null;
  const anonymous = enquiries.filter((e) => !e.phone).length;

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        intro="Everyone who has left a phone number: through a visit booking, a message, an order, digital gold or the savings scheme."
        actions={<p className="text-base text-stone">{customers.length} customers</p>}
      />
      <div className="mt-8 lg:w-96">
        <SearchBox value={q} onChange={setQ} placeholder="Search name, phone or email" label="Search customers" />
      </div>

      {list.length === 0 ? (
        <div className="mt-6">
          <AdminEmpty title="No customers match" body="Try another name or number." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-96 text-left text-base">
            <caption className="sr-only">Customers with their visits, enquiries, scheme and last activity</caption>
            <thead>
              <tr className="border-b border-line-strong text-sm text-stone">
                <th scope="col" className="px-4 py-3 font-normal">Customer</th>
                <th scope="col" className="px-4 py-3 text-right font-normal">Visits</th>
                <th scope="col" className="px-4 py-3 text-right font-normal">Enquiries</th>
                <th scope="col" className="hidden px-4 py-3 text-right font-normal sm:table-cell">Orders</th>
                <th scope="col" className="hidden px-4 py-3 font-normal md:table-cell">Scheme</th>
                <th scope="col" className="hidden px-4 py-3 font-normal md:table-cell">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.key} className="border-b border-line last:border-b-0 hover:bg-ivory">
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => setOpenKey(c.key)} className="text-left">
                      <span className="link-draw block text-ink">{c.name || "Name not given"}</span>
                      <span className="block text-sm text-stone figures">{c.phone}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right figures text-ink">{c.bookings.length || "–"}</td>
                  <td className="px-4 py-3 text-right figures text-ink">{c.enquiries.length || "–"}</td>
                  <td className="hidden px-4 py-3 text-right figures text-ink sm:table-cell">{c.orders.length || "–"}</td>
                  <td className="hidden px-4 py-3 md:table-cell">{c.memberState ? <span className="text-sm text-ink-soft">{memberStateLabels[c.memberState]}</span> : <span className="text-stone">–</span>}</td>
                  <td className="hidden px-4 py-3 text-sm text-stone md:table-cell">{stamp(c.lastActivity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {anonymous ? (
        <p className="mt-4 text-sm text-stone">
          {anonymous} WhatsApp {anonymous === 1 ? "enquiry came" : "enquiries came"} without a number on the site; those customers are in your WhatsApp chats.
        </p>
      ) : null}

      <Drawer open={open !== null} onClose={() => setOpenKey(null)} eyebrow="Customer" title={open?.name || open?.phone || ""}>
        {open ? <Activity c={open} /> : null}
      </Drawer>
    </div>
  );
}
