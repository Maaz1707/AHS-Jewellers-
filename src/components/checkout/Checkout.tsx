"use client";

import Image from "@/components/ui/Img";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { commerceTerms, fullAddress, site, whatsappLink } from "@/data/site";
import { useBag } from "@/lib/bag";
import { formatIndianMobile } from "@/lib/booking";
import { addDaysKey, dayLabel, todayKey } from "@/lib/dates";
import { checkPin, deliveryFee, type PinResult } from "@/lib/delivery";
import { formatGrams, formatINR } from "@/lib/format";
import { useHydrated } from "@/lib/motion";
import { pieceImage } from "@/lib/pieces";
import { orderPaymentLabels, type Fulfilment, type Order, type OrderPayment } from "@/store/orders";
import { useCart, useOrders, useSession } from "@/store";
import PriceSummary from "../bag/PriceSummary";
import Button from "../ui/Button";
import { TextField, validators } from "../ui/Field";
import { BagIcon, CheckIcon, LockIcon, StoreIcon, TruckIcon, WhatsAppIcon } from "../ui/Icons";
import { DemoTag } from "../ui/Tags";

type Contact = { name: string; phone: string; email: string };
type Address = { line1: string; line2: string; city: string; state: string; pin: string };
type Errors = Partial<Record<keyof Contact | keyof Address, string>>;

const STEPS = ["Your details", "Delivery", "Review and pay"] as const;

const METHODS: { value: OrderPayment; label: string; note: string }[] = [
  { value: "upi", label: "UPI", note: "Any UPI app" },
  { value: "card", label: "Card", note: "Credit or debit" },
  { value: "netbanking", label: "Net banking", note: "All major banks" },
];

/** Showroom pickup is ready the next opening day after packing. */
const pickupReady = () => dayLabel(addDaysKey(todayKey(), 1));

export default function Checkout() {
  const hydrated = useHydrated();
  const bag = useBag();
  const [done, setDone] = useState<Order | null>(null);

  if (!hydrated) {
    return (
      <div className="grid gap-12 lg:grid-cols-12" aria-busy="true" aria-label="Loading checkout">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-64 w-full" />
          <div className="skeleton h-16 w-full" />
        </div>
        <div className="skeleton h-96 lg:col-span-4 lg:col-start-9" />
      </div>
    );
  }
  if (done) return <Confirmation order={done} />;
  if (!bag.lines.length) {
    return (
      <div className="mx-auto max-w-prose py-12 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full border border-line text-gold-deep">
          <BagIcon className="size-6" />
        </span>
        <p className="mt-8 font-serif text-3xl font-light text-ink">Your bag is empty.</p>
        <p className="mt-4 text-stone">Add a coin or one of our lighter pieces, and checkout will be waiting here.</p>
        <div className="mt-10 flex justify-center">
          <Button href="/collections?online=1" arrow>
            See pieces available online
          </Button>
        </div>
      </div>
    );
  }
  return <CheckoutFlow onPlaced={setDone} />;
}

function CheckoutFlow({ onPlaced }: { onPlaced: (o: Order) => void }) {
  const bag = useBag();
  const place = useOrders((s) => s.place);
  const clearCart = useCart((s) => s.clear);
  const [step, setStep] = useState(0);
  // Signed-in members (demo) have their details filled in.
  const [contact, setContact] = useState<Contact>(() => {
    const m = useSession.getState().member;
    return { name: m?.name ?? "", phone: m?.phone ?? "", email: m?.email ?? "" };
  });
  const [mode, setMode] = useState<Fulfilment>("delivery");
  const [address, setAddress] = useState<Address>({ line1: "", line2: "", city: "", state: "", pin: "" });
  const [pin, setPin] = useState<PinResult | null>(null);
  const [method, setMethod] = useState<OrderPayment>("upi");
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);
  const [paying, setPaying] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // After a failed attempt, focus the first problem; after moving on, the new step’s heading.
  useEffect(() => {
    if (attempt) root.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [attempt]);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const h = root.current?.querySelector<HTMLElement>(`#step-${step}`);
    h?.focus({ preventScroll: true });
    h?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const fee = deliveryFee(bag.subtotal, mode);
  const total = bag.subtotal + fee;

  const fail = (found: Errors) => {
    setErrors(found);
    setAttempt((a) => a + 1);
  };

  const submitContact = (e: FormEvent) => {
    e.preventDefault();
    const found: Errors = {};
    if (!contact.name.trim()) found.name = "Please tell us your name.";
    const p = validators.phoneIN(contact.phone);
    if (p) found.phone = p;
    if (contact.email.trim()) {
      const em = validators.email(contact.email);
      if (em) found.email = em;
    }
    if (Object.keys(found).length) return fail(found);
    setErrors({});
    setContact((c) => ({ ...c, phone: formatIndianMobile(c.phone) }));
    setStep(1);
  };

  const onPin = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setAddress((a) => ({ ...a, pin: digits }));
    setErrors((e) => ({ ...e, pin: undefined }));
    if (digits.length < 6) return setPin(null);
    const result = checkPin(digits);
    setPin(result);
    if (result.ok) {
      setAddress((a) => ({
        ...a,
        pin: digits,
        state: a.state || (result.region === "the North East" ? "" : result.region),
        city: a.city || (result.local ? site.address.city : ""),
      }));
    }
  };

  const submitDelivery = (e: FormEvent) => {
    e.preventDefault();
    if (mode === "pickup") {
      setErrors({});
      return setStep(2);
    }
    const found: Errors = {};
    if (!address.line1.trim()) found.line1 = "Please add your house or flat and street.";
    if (!address.city.trim()) found.city = "Please add your town or city.";
    if (!address.state.trim()) found.state = "Please add your state.";
    const result = checkPin(address.pin);
    if (!result.ok) found.pin = result.reason;
    if (Object.keys(found).length) return fail(found);
    setErrors({});
    setStep(2);
  };

  const pay = () => {
    setPaying(true);
    window.setTimeout(() => {
      const order = place({
        name: contact.name.trim(),
        phone: contact.phone,
        email: contact.email.trim() || undefined,
        fulfilment: mode,
        address:
          mode === "delivery"
            ? { line1: address.line1.trim(), line2: address.line2.trim() || undefined, city: address.city.trim(), state: address.state.trim(), pin: address.pin }
            : undefined,
        lines: bag.lines.map(({ product, item, unit }) => ({
          slug: product.slug,
          name: product.name,
          code: product.code,
          purity: product.purity,
          weight: product.weight,
          qty: item.qty,
          unitPrice: unit,
        })),
        subtotal: bag.subtotal,
        delivery: fee,
        total,
        rates: bag.rates,
        method,
      });
      clearCart();
      onPlaced(order);
      window.scrollTo({ top: 0 });
    }, 1600);
  };

  const addressLine = [address.line1, address.line2, `${address.city} ${address.pin}`, address.state].filter((x) => x.trim()).join(", ");

  return (
    <div ref={root} className="grid gap-10 lg:grid-cols-12 lg:gap-10">
      {/* Phone: collapsible summary above the steps */}
      <details className="group border border-line bg-ivory lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
          <span className="eyebrow text-ink">
            Order summary · {bag.count} {bag.count === 1 ? "piece" : "pieces"}
          </span>
          <span className="font-serif text-xl text-ink figures">{formatINR(total)}</span>
        </summary>
        <div className="border-t border-line p-5">
          <Summary fee={step > 0 ? fee : null} />
        </div>
      </details>

      <div className="flex flex-col gap-4 lg:col-span-7">
        {/* Step 1 */}
        <Step index={0} current={step} onEdit={() => setStep(0)} summary={`${contact.name} · ${contact.phone}${contact.email ? ` · ${contact.email}` : ""}`}>
          <form onSubmit={submitContact} noValidate aria-label="Your details" className="grid gap-2 md:grid-cols-2 md:gap-x-8">
            <TextField
              label="Full name"
              autoComplete="name"
              value={contact.name}
              onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
              error={errors.name}
              className="md:col-span-2"
            />
            <TextField
              label="Mobile number"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="98765 43210"
              value={contact.phone}
              onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
              error={errors.phone}
              hint="For delivery updates and the courier."
            />
            <TextField
              label="Email (optional)"
              type="email"
              autoComplete="email"
              value={contact.email}
              onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
              error={errors.email}
              hint="For your invoice."
            />
            <div className="mt-4 md:col-span-2">
              <Button type="submit" arrow>
                Continue to delivery
              </Button>
            </div>
          </form>
        </Step>

        {/* Step 2 */}
        <Step
          index={1}
          current={step}
          onEdit={() => setStep(1)}
          summary={mode === "pickup" ? `Showroom pickup, ready from ${pickupReady()}` : `Insured delivery to ${addressLine}`}
        >
          <form onSubmit={submitDelivery} noValidate aria-label="Delivery">
            <fieldset>
              <legend className="sr-only">How would you like to receive it?</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <Choice
                  name="fulfilment"
                  checked={mode === "delivery"}
                  onChange={() => setMode("delivery")}
                  icon={<TruckIcon className="size-6" />}
                  title="Insured delivery"
                  note={bag.subtotal >= commerceTerms.freeDeliveryFrom ? "Free, fully insured, signed for" : `${formatINR(commerceTerms.insuredDeliveryFee)}, fully insured, signed for`}
                />
                <Choice
                  name="fulfilment"
                  checked={mode === "pickup"}
                  onChange={() => setMode("pickup")}
                  icon={<StoreIcon className="size-6" />}
                  title="Collect from the showroom"
                  note={`Free, ready from ${pickupReady()}`}
                />
              </div>
            </fieldset>

            {mode === "delivery" ? (
              <div className="mt-8 grid gap-2 md:grid-cols-2 md:gap-x-8">
                <div className="md:col-span-2">
                  <TextField
                    label="PIN code"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    placeholder="302001"
                    value={address.pin}
                    onChange={(e) => onPin(e.target.value)}
                    error={errors.pin ?? (pin && !pin.ok ? pin.reason : undefined)}
                    hint={pin?.ok ? `✓ Delivers to ${pin.region} by ${pin.by}, insured and signed for.` : "We check it as you type."}
                  />
                </div>
                <TextField
                  label="House or flat, and street"
                  autoComplete="address-line1"
                  value={address.line1}
                  onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
                  error={errors.line1}
                  className="md:col-span-2"
                />
                <TextField
                  label="Area or landmark (optional)"
                  autoComplete="address-line2"
                  value={address.line2}
                  onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))}
                  className="md:col-span-2"
                />
                <TextField
                  label="Town or city"
                  autoComplete="address-level2"
                  value={address.city}
                  onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                  error={errors.city}
                />
                <TextField
                  label="State"
                  autoComplete="address-level1"
                  value={address.state}
                  onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                  error={errors.state}
                />
              </div>
            ) : (
              <div className="mt-8 border-l-2 border-gold bg-ivory p-5 text-sm text-ink-soft">
                <p className="font-serif text-xl text-ink">{site.name}</p>
                <p className="mt-1">{fullAddress()}</p>
                <p className="mt-3">
                  Ready from {pickupReady()}, once it has been weighed and packed. We hold it for {commerceTerms.pickupHoldDays} days. Bring
                  your order number and a photo ID.
                </p>
              </div>
            )}

            <div className="mt-8">
              <Button type="submit" arrow>
                Continue to payment
              </Button>
            </div>
          </form>
        </Step>

        {/* Step 3 */}
        <Step index={2} current={step}>
          <dl className="grid gap-4 border-b border-line pb-6 text-sm sm:grid-cols-2">
            <div>
              <dt className="eyebrow text-stone">Contact</dt>
              <dd className="mt-2 text-ink">
                {contact.name}
                <span className="block text-stone">{contact.phone}</span>
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-stone">{mode === "pickup" ? "Collect from" : "Deliver to"}</dt>
              <dd className="mt-2 text-ink">
                {mode === "pickup" ? (
                  <>
                    The showroom, {site.address.line2}
                    <span className="block text-stone">Ready from {pickupReady()}</span>
                  </>
                ) : (
                  <>
                    {addressLine}
                    {pin?.ok ? <span className="block text-stone">By {pin.by}</span> : null}
                  </>
                )}
              </dd>
            </div>
          </dl>

          <fieldset className="mt-8" disabled={paying}>
            <legend className="flex flex-wrap items-center gap-3">
              <span className="eyebrow text-stone">How would you like to pay?</span>
              <DemoTag />
            </legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`flex cursor-pointer flex-col gap-1 border p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold-deep ${
                    method === m.value ? "border-ink bg-ink text-white" : "border-line-strong text-ink hover:border-ink"
                  }`}
                >
                  <input type="radio" name="pay-method" value={m.value} checked={method === m.value} onChange={() => setMethod(m.value)} className="sr-only" />
                  <span className="text-base">{m.label}</span>
                  <span className={`text-xs ${method === m.value ? "text-white/70" : "text-stone"}`}>{m.note}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <p className="mt-6 border-l-2 border-gold bg-ivory p-4 text-sm text-ink-soft">
            This is a demonstration. You will not be asked for any card, bank or UPI details, and nothing is charged. The order
            is saved in this browser so you can follow it through tracking and the owner’s panel.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Button onClick={pay} size="lg" disabled={paying} icon={<LockIcon className="size-4" />}>
              {paying ? "Placing your order" : `Pay ${formatINR(total)} (demo)`}
            </Button>
            <span className="text-xs text-stone">
              By placing the order you accept our{" "}
              <Link href="/terms" className="link-line">
                terms of sale
              </Link>
              .
            </span>
          </div>
          {paying ? (
            <div className="mt-6 h-px w-full overflow-hidden bg-line" aria-hidden="true">
              <div className="skeleton h-full w-full" />
            </div>
          ) : null}
        </Step>
      </div>

      <aside className="hidden lg:col-span-4 lg:col-start-9 lg:block" aria-label="Order summary">
        <div className="border border-line bg-ivory p-8 lg:sticky lg:top-32">
          <h2 className="eyebrow text-gold-deep">Order summary</h2>
          <div className="mt-6">
            <Summary fee={step > 0 ? fee : null} />
          </div>
        </div>
      </aside>
    </div>
  );
}

function Summary({ fee }: { fee: number | null }) {
  const bag = useBag();
  return (
    <>
      <ul className="flex flex-col gap-4 border-b border-line pb-6">
        {bag.lines.map(({ product, item, unit }) => {
          const img = pieceImage(product);
          return (
            <li key={item.slug} className="flex items-center gap-4">
              <span className="relative block size-16 shrink-0 overflow-hidden bg-white">
                <Image src={img.src} alt="" fill sizes="64px" className="object-cover" />
                {item.qty > 1 ? (
                  <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-ink text-micro text-white figures">{item.qty}</span>
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-serif text-lg text-ink">{product.name}</span>
                <span className="block text-xs text-stone">
                  {product.purity} · {formatGrams(product.weight)}
                  {item.qty > 1 ? ` · ${item.qty} × ${formatINR(unit)}` : ""}
                </span>
              </span>
              <span className="text-sm text-ink figures">{formatINR(unit * item.qty)}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-6">
        <PriceSummary
          gold={bag.gold}
          making={bag.making}
          stones={bag.stones}
          gst={bag.gst}
          subtotal={bag.subtotal}
          weight={bag.weight}
          delivery={fee}
          note={<p>Priced at today’s rate and fixed when you pay.</p>}
        />
      </div>
      <Link href="/bag" className="mt-6 inline-block text-xs text-stone underline-offset-4 hover:text-ink hover:underline">
        Edit bag
      </Link>
    </>
  );
}

function Step({ index, current, summary, onEdit, children }: { index: number; current: number; summary?: string; onEdit?: () => void; children: ReactNode }) {
  const state = index === current ? "active" : index < current ? "done" : "next";
  return (
    <section aria-labelledby={`step-${index}`} className={`border p-6 md:p-8 ${state === "active" ? "border-ink" : "border-line"}`}>
      <div className="flex items-start justify-between gap-4">
        <h2 id={`step-${index}`} tabIndex={-1} className={`flex scroll-mt-32 items-center gap-4 font-serif text-2xl outline-none ${state === "next" ? "text-stone" : "text-ink"}`}>
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-full border font-sans text-sm ${
              state === "done" ? "border-gold bg-gold text-white" : state === "active" ? "border-ink text-ink" : "border-line-strong text-stone"
            }`}
            aria-hidden="true"
          >
            {state === "done" ? <CheckIcon className="size-4" /> : index + 1}
          </span>
          {STEPS[index]}
          <span className="sr-only">{state === "done" ? ", complete" : state === "next" ? ", not started" : ""}</span>
        </h2>
        {state === "done" && onEdit ? (
          <button type="button" onClick={onEdit} className="eyebrow text-stone hover:text-ink">
            <span className="link-draw">Change</span>
          </button>
        ) : null}
      </div>
      {state === "done" && summary ? <p className="mt-3 pl-12 text-sm text-ink-soft">{summary}</p> : null}
      {state === "active" ? <div className="mt-8 [animation:menu-in_0.5s_var(--ease-luxe)]">{children}</div> : null}
    </section>
  );
}

function Choice({ name, checked, onChange, icon, title, note }: { name: string; checked: boolean; onChange: () => void; icon: ReactNode; title: string; note: string }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-4 border p-5 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold-deep ${
        checked ? "border-ink bg-ivory" : "border-line-strong hover:border-ink"
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      <span className={checked ? "text-gold-deep" : "text-stone"}>{icon}</span>
      <span>
        <span className="block text-base text-ink">{title}</span>
        <span className="mt-1 block text-sm text-stone">{note}</span>
      </span>
    </label>
  );
}

function Confirmation({ order }: { order: Order }) {
  const router = useRouter();
  const member = useSession((s) => s.member);
  const signIn = useSession((s) => s.signIn);
  const first = order.name.split(" ")[0];
  const openAccount = () => {
    if (!member) signIn({ name: order.name, phone: order.phone, email: order.email });
    router.push("/account#orders");
  };
  return (
    <div role="status" className="mx-auto max-w-narrow [animation:menu-in_0.8s_var(--ease-luxe)]">
      <span className="flex size-14 items-center justify-center rounded-full border border-gold text-gold-deep">
        <CheckIcon className="size-6" />
      </span>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <p className="eyebrow flex items-center gap-4 text-gold-deep">
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
          Order {order.id}
        </p>
        <DemoTag />
      </div>
      <h2 className="mt-6 display-section text-ink">Thank you, {first}.</h2>
      <p className="mt-4 max-w-prose text-lg text-ink-soft">
        {order.fulfilment === "pickup"
          ? "Your order is placed. We will weigh it, pack it and message you on WhatsApp when it is ready to collect."
          : "Your order is placed. We will weigh it, pack it and hand it to our insured courier, and message you on WhatsApp at each step."}
      </p>
      <dl className="mt-10 grid gap-6 border-y border-line py-8 sm:grid-cols-2">
        {[
          ["Order number", order.id],
          ["Paid (demo)", `${formatINR(order.total)} by ${orderPaymentLabels[order.payment.method]}`],
          [order.fulfilment === "pickup" ? "Collect from" : "Delivering to", order.fulfilment === "pickup" ? `The showroom, from ${pickupReady()}` : `${order.address?.city}, ${order.address?.pin}`],
          ["Pieces", order.lines.map((l) => `${l.name}${l.qty > 1 ? ` × ${l.qty}` : ""}`).join(", ")],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="eyebrow text-stone">{k}</dt>
            <dd className="mt-2 text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Button href={`/orders/${order.id}`} arrow>
          Track this order
        </Button>
        <Button onClick={openAccount} variant="secondary" magnetic={false}>
          See it in my account
        </Button>
      </div>
      <a
        href={whatsappLink(`Hello ${site.name}, I have just placed order ${order.id}.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center gap-2 eyebrow text-ink hover:text-gold-deep"
      >
        <WhatsAppIcon className="size-4" />
        <span className="link-draw">Questions? Message us on WhatsApp</span>
      </a>
    </div>
  );
}
