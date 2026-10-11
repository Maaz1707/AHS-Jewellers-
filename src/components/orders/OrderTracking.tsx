"use client";

import Link from "next/link";
import { site, whatsappLink } from "@/data/site";
import { addDaysKey, dayLabel, stamp, todayKey } from "@/lib/dates";
import { checkPin } from "@/lib/delivery";
import { formatGrams, formatINR } from "@/lib/format";
import { useStoreReady } from "@/lib/ready";
import { orderFlow, orderPaymentLabels, orderStatusLabels, type Order, type OrderStatus } from "@/store/orders";
import { useOrders } from "@/store";
import Button from "../ui/Button";
import { CheckIcon, PhoneIcon, WhatsAppIcon } from "../ui/Icons";
import { DemoTag } from "../ui/Tags";
import OrderLookup from "./OrderLookup";

/** What each step means, in a line. */
const stepNotes: Record<OrderStatus, string> = {
  placed: "Payment received and the order confirmed.",
  packed: "Weighed in front of a camera, sealed and labelled with its HUID.",
  shipped: "Handed to our insured courier.",
  "out-for-delivery": "On its way to you today. Keep a photo ID handy.",
  delivered: "Signed for and delivered.",
  ready: "Waiting for you at the counter.",
  collected: "Collected from the showroom.",
  cancelled: "Cancelled. Any payment is returned to the original method.",
};

/** Expected arrival for an open delivery order, from the date it was placed. */
function expected(o: Order) {
  if (o.fulfilment === "pickup") return null;
  const placed = todayKey(new Date(o.createdAt));
  const pin = checkPin(o.address?.pin ?? "", placed);
  return pin.ok ? pin.by : dayLabel(addDaysKey(placed, 4));
}

export default function OrderTracking({ id }: { id: string }) {
  const ready = useStoreReady(useOrders);
  const order = useOrders((s) => s.orders.find((o) => o.id.toLowerCase() === id.toLowerCase()));

  if (!ready) {
    return (
      <div aria-busy="true" aria-label="Loading your order">
        <div className="skeleton h-6 w-40" />
        <div className="skeleton mt-6 h-12 w-96 max-w-full" />
        <div className="skeleton mt-12 h-80 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-narrow">
        <p className="eyebrow text-gold-deep">Order {id}</p>
        <h1 className="mt-6 display-page text-ink">We could not find this order</h1>
        <p className="mt-6 lede text-ink-soft">
          Orders in this prototype are kept in the browser they were placed in. Check the number, or look it up with your
          mobile number.
        </p>
        <div className="mt-12 border border-line p-6 md:p-8">
          <OrderLookup />
        </div>
      </div>
    );
  }

  const flow = order.status === "cancelled" ? [...orderFlow[order.fulfilment].filter((s) => order.history.some((h) => h.status === s)), "cancelled" as const] : orderFlow[order.fulfilment];
  const reached = (s: OrderStatus) => order.history.find((h) => h.status === s);
  const by = expected(order);
  const open = !["delivered", "collected", "cancelled"].includes(order.status);

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-7">
        <div className="flex flex-wrap items-center gap-4">
          <p className="eyebrow text-gold-deep">Order {order.id}</p>
          <DemoTag />
        </div>
        <h1 className="mt-6 display-page text-ink">{orderStatusLabels[order.status]}</h1>
        <p className="mt-4 text-lg text-ink-soft">
          {order.status === "cancelled"
            ? "This order was cancelled."
            : open && by
              ? `Expected by ${by}.`
              : open && order.fulfilment === "pickup"
                ? `For collection from ${site.name}, ${site.address.line2}.`
                : `Placed ${stamp(order.createdAt)}.`}
        </p>

        <ol className="mt-12" aria-label="Order progress">
          {flow.map((s, i) => {
            const at = reached(s);
            const current = s === order.status;
            const last = i === flow.length - 1;
            return (
              <li key={s} className="relative flex gap-6 pb-10 last:pb-0" aria-current={current ? "step" : undefined}>
                {!last ? <span aria-hidden="true" className={`absolute left-4 top-8 h-full w-px ${reached(flow[i + 1]) ? "bg-gold" : "bg-line-strong"}`} /> : null}
                <span
                  aria-hidden="true"
                  className={`relative flex size-8 shrink-0 items-center justify-center rounded-full border ${
                    s === "cancelled" ? "border-error text-error" : at ? "border-gold bg-gold text-white" : "border-line-strong bg-white text-stone"
                  } ${current && s !== "cancelled" ? "ring-4 ring-gold-pale" : ""}`}
                >
                  {at && s !== "cancelled" ? <CheckIcon className="size-4" /> : <span className="size-2 rounded-full bg-current" />}
                </span>
                <div className="pt-1">
                  <p className={`font-serif text-2xl ${at ? "text-ink" : "text-stone"}`}>
                    {orderStatusLabels[s]}
                    <span className="sr-only">{at ? ", done" : ", to come"}</span>
                  </p>
                  <p className="mt-1 text-sm text-stone">{stepNotes[s]}</p>
                  {at ? <p className="mt-1 text-xs text-stone">{stamp(at.at)}</p> : null}
                  {s === "shipped" && order.courierRef ? <p className="mt-1 text-xs text-ink-soft">Courier reference {order.courierRef} (sample)</p> : null}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-line pt-8">
          <Button href={whatsappLink(`Hello ${site.name}, I have a question about order ${order.id}.`)} external icon={<WhatsAppIcon className="size-4" />}>
            Ask about this order
          </Button>
          <a href={site.phone.href} className="inline-flex items-center gap-2 eyebrow text-ink hover:text-gold-deep">
            <PhoneIcon className="size-4" />
            <span className="link-draw">{site.phone.display}</span>
          </a>
        </div>
      </div>

      <aside className="lg:col-span-4 lg:col-start-9" aria-label="Order details">
        <div className="border border-line bg-ivory p-6 md:p-8">
          <h2 className="eyebrow text-gold-deep">In this order</h2>
          <ul className="mt-4 flex flex-col">
            {order.lines.map((l) => (
              <li key={l.slug} className="flex justify-between gap-4 border-b border-line py-3 text-sm">
                <span>
                  <Link href={`/jewellery/${l.slug}`} className="link-draw font-serif text-lg text-ink">
                    {l.name}
                  </Link>
                  <span className="block text-xs text-stone">
                    {l.code} · {l.purity} · {formatGrams(l.weight)}
                    {l.qty > 1 ? ` · ${l.qty} × ${formatINR(l.unitPrice)}` : ""}
                  </span>
                </span>
                <span className="text-ink figures">{formatINR(l.unitPrice * l.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 flex flex-col gap-2 text-sm figures">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Insured delivery</dt>
              <dd className="text-ink">{order.delivery ? formatINR(order.delivery) : "Free"}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line-strong pt-3">
              <dt className="eyebrow text-ink">Paid</dt>
              <dd className="font-serif text-2xl text-ink">{formatINR(order.total)}</dd>
            </div>
          </dl>
          <dl className="mt-8 flex flex-col gap-5 text-sm">
            <div>
              <dt className="eyebrow text-stone">{order.fulfilment === "pickup" ? "Collect from" : "Delivering to"}</dt>
              <dd className="mt-2 text-ink">
                {order.fulfilment === "pickup" ? (
                  `${site.name}, ${site.address.line1}, ${site.address.city}`
                ) : (
                  <>
                    {order.name}
                    <span className="block text-ink-soft">
                      {[order.address?.line1, order.address?.line2, `${order.address?.city} ${order.address?.pin}`, order.address?.state].filter(Boolean).join(", ")}
                    </span>
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-stone">Payment</dt>
              <dd className="mt-2 text-ink">
                {orderPaymentLabels[order.payment.method]} (demo) · {order.payment.ref}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-stone">Priced at</dt>
              <dd className="mt-2 text-ink">
                24K {formatINR(order.rates["24K"])}/g · 22K {formatINR(order.rates["22K"])}/g
              </dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
