"use client";

import Link from "next/link";
import { useState } from "react";
import { orderUpdateMessage, waTo } from "@/lib/admin";
import { stamp, todayKey } from "@/lib/dates";
import { formatGrams, formatINR } from "@/lib/format";
import { useHydrated } from "@/lib/motion";
import { isOrderOpen, nextStatus, orderPaymentLabels, orderStatusLabels, type Order, type OrderStatus } from "@/store/orders";
import { useOrders, useToast } from "@/store";
import { StoreIcon, TruckIcon, WhatsAppIcon } from "../ui/Icons";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { AdminEmpty, AdminPageHeader, FilterTabs, Pill, SearchBox, StatCard } from "./AdminUI";

type Tab = "action" | "open" | "done" | "cancelled" | "all";

/** Plain-language label for the button that moves an order on. */
const actionLabel: Partial<Record<OrderStatus, string>> = {
  packed: "Mark weighed and packed",
  shipped: "Hand to the courier",
  "out-for-delivery": "Mark out for delivery",
  delivered: "Mark delivered",
  ready: "Mark ready to collect",
  collected: "Mark collected",
};

const tone = (s: OrderStatus) => (s === "cancelled" ? "alert" : s === "placed" ? "gold" : s === "delivered" || s === "collected" ? "neutral" : "good");

/** Orders waiting on the shop: to pack, or to hand over. */
const needsAction = (o: Order) => o.status === "placed" || o.status === "packed" || o.status === "ready";

function OrderRow({ o, onCancel }: { o: Order; onCancel: (o: Order) => void }) {
  const advance = useOrders((s) => s.advance);
  const show = useToast((s) => s.show);
  const next = nextStatus(o);
  const wa = waTo(o.phone, orderUpdateMessage(o, orderStatusLabels[o.status]));
  const items = o.lines.reduce((n, l) => n + l.qty, 0);

  return (
    <li className="border border-line bg-white p-5 md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={tone(o.status)}>{orderStatusLabels[o.status]}</Pill>
            <span className="text-sm text-stone">
              {o.id} · {stamp(o.createdAt)}
            </span>
          </div>
          <p className="mt-3 font-serif text-2xl text-ink">
            {o.lines.map((l) => `${l.name}${l.qty > 1 ? ` × ${l.qty}` : ""}`).join(", ")}
          </p>
          <p className="mt-1 text-lg text-ink">
            {o.name} <span className="ml-2 text-base text-stone figures">{o.phone}</span>
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 text-base text-ink-soft">
            {o.fulfilment === "pickup" ? <StoreIcon className="size-4" /> : <TruckIcon className="size-4" />}
            {o.fulfilment === "pickup"
              ? "Showroom pickup"
              : `Insured delivery to ${[o.address?.line1, o.address?.city, o.address?.pin].filter(Boolean).join(", ")}`}
          </p>
          <p className="mt-2 text-sm text-stone figures">
            {formatINR(o.total)} paid by {orderPaymentLabels[o.payment.method]} (demo) · {items} {items === 1 ? "piece" : "pieces"},{" "}
            {formatGrams(o.lines.reduce((g, l) => g + l.weight * l.qty, 0))}
            {o.courierRef ? ` · courier ${o.courierRef}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:w-64 lg:flex-col">
          {next ? (
            <button
              type="button"
              onClick={() => {
                const s = advance(o.id);
                if (s) show({ title: orderStatusLabels[s], body: `${o.id}, ${o.name}. The tracking page is updated.` });
              }}
              className="h-12 flex-1 lg:flex-none bg-ink px-4 text-base text-white hover:bg-gold-deep"
            >
              {actionLabel[next]}
            </button>
          ) : null}
          {wa && o.status !== "cancelled" ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="flex h-12 flex-1 lg:flex-none items-center justify-center gap-2 border border-line-strong px-4 text-base text-ink hover:border-ink">
              <WhatsAppIcon className="size-4" />
              Send an update
            </a>
          ) : null}
          <Link href={`/orders/${o.id}`} target="_blank" className="flex h-12 flex-1 lg:flex-none items-center justify-center px-4 text-base text-stone hover:text-ink">
            <span className="link-draw">Customer’s tracking page</span>
          </Link>
          {o.status === "placed" || o.status === "packed" ? (
            <button type="button" onClick={() => onCancel(o)} className="h-12 px-4 text-base text-stone hover:text-error">
              Cancel order
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default function OrdersManager() {
  const hydrated = useHydrated();
  const orders = useOrders((s) => s.orders);
  const cancel = useOrders((s) => s.cancel);
  const show = useToast((s) => s.show);
  const [tab, setTab] = useState<Tab>("action");
  const [q, setQ] = useState("");
  const [cancelling, setCancelling] = useState<Order | null>(null);
  if (!hydrated) return <div className="skeleton h-96 w-full" aria-label="Loading orders" />;

  const month = todayKey().slice(0, 7);
  const sales = orders.filter((o) => o.status !== "cancelled" && todayKey(new Date(o.createdAt)).startsWith(month));
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const filters: Record<Tab, (o: Order) => boolean> = {
    action: needsAction,
    open: isOrderOpen,
    done: (o) => o.status === "delivered" || o.status === "collected",
    cancelled: (o) => o.status === "cancelled",
    all: () => true,
  };
  const list = orders
    .filter(filters[tab])
    .filter((o) => words.every((w) => `${o.id} ${o.name} ${o.phone} ${o.lines.map((l) => l.name).join(" ")}`.toLowerCase().includes(w)));
  const count = (t: Tab) => orders.filter(filters[t]).length;

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        intro="Coins and lighter pieces bought online. Move each order along as it is packed and handed over; the customer’s tracking page updates at once."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="To pack" value={orders.filter((o) => o.status === "placed").length} note="Paid, waiting to be weighed and packed" tone={orders.some((o) => o.status === "placed") ? "gold" : "default"} />
        <StatCard label="On the way" value={orders.filter((o) => ["packed", "shipped", "out-for-delivery"].includes(o.status)).length} note="Packed or with the courier" />
        <StatCard label="Ready to collect" value={orders.filter((o) => o.status === "ready").length} note="Waiting at the counter" />
        <StatCard label="Online sales this month" value={formatINR(sales.reduce((s, o) => s + o.total, 0))} note={`${sales.length} ${sales.length === 1 ? "order" : "orders"}, demo payments`} tone="gold" />
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs<Tab>
          label="Which orders"
          value={tab}
          onChange={setTab}
          options={[
            { value: "action", label: "Needs action", count: count("action") },
            { value: "open", label: "All open", count: count("open") },
            { value: "done", label: "Completed", count: count("done") },
            { value: "cancelled", label: "Cancelled", count: count("cancelled") },
            { value: "all", label: "All", count: orders.length },
          ]}
        />
        <div className="lg:w-80">
          <SearchBox value={q} onChange={setQ} placeholder="Order, name, phone or piece" label="Search orders" />
        </div>
      </div>

      {list.length ? (
        <ul className="mt-6 flex flex-col gap-3">
          {list.map((o) => (
            <OrderRow key={o.id} o={o} onCancel={setCancelling} />
          ))}
        </ul>
      ) : (
        <div className="mt-6">
          <AdminEmpty
            title={tab === "action" ? "Nothing waiting" : "No orders here"}
            body={tab === "action" ? "Every paid order is packed and on its way. New orders appear here first." : "Try another filter or search."}
          />
        </div>
      )}

      <Modal open={cancelling !== null} onClose={() => setCancelling(null)} eyebrow="Cancel order" title={`Cancel ${cancelling?.id ?? ""}?`}>
        <p className="text-base text-ink-soft">
          The customer’s tracking page will show the order as cancelled. In the live shop, the payment would be returned to
          the original method.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button
            magnetic={false}
            onClick={() => {
              if (cancelling) {
                cancel(cancelling.id);
                show({ title: "Order cancelled", body: `${cancelling.id}, ${cancelling.name}` });
              }
              setCancelling(null);
            }}
          >
            Yes, cancel it
          </Button>
          <button type="button" onClick={() => setCancelling(null)} className="text-base text-stone hover:text-ink">
            Keep the order
          </button>
        </div>
      </Modal>
    </div>
  );
}
