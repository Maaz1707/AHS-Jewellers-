"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { SAMPLE_MEMBER } from "@/data/demo";
import { useHydrated } from "@/lib/motion";
import { samePhone } from "@/store/scheme";
import { useOrders } from "@/store";
import Button from "../ui/Button";
import { TextField, validators } from "../ui/Field";

/** Find an order by its number and the mobile number it was placed with. */
export default function OrderLookup() {
  const hydrated = useHydrated();
  const router = useRouter();
  const orders = useOrders((s) => s.orders);
  const [id, setId] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ id?: string; phone?: string; form?: string }>({});
  const [attempt, setAttempt] = useState(0);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (attempt) form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [attempt]);

  const sample = orders.find((o) => o.source === "seed" && samePhone(o.phone, SAMPLE_MEMBER.phone) && o.status === "shipped");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found: typeof errors = {};
    if (!id.trim()) found.id = "Please enter your order number.";
    const p = validators.phoneIN(phone);
    if (p) found.phone = p;
    if (!found.id && !found.phone) {
      const order = orders.find((o) => o.id.toLowerCase() === id.trim().toLowerCase() && samePhone(o.phone, phone));
      if (order) return router.push(`/orders/${order.id}`);
      found.id = "We could not find an order with this number and mobile. Please check both.";
    }
    setErrors(found);
    setAttempt((a) => a + 1);
  };

  return (
    <form ref={form} onSubmit={submit} noValidate aria-label="Find your order" className="grid gap-2 md:grid-cols-2 md:gap-x-8">
      <TextField
        label="Order number"
        autoComplete="off"
        placeholder="ORD-2026-1041"
        value={id}
        onChange={(e) => setId(e.target.value.toUpperCase())}
        error={errors.id}
        hint="On your confirmation and WhatsApp message."
      />
      <TextField
        label="Mobile number"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="98765 43210"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
        hint="The number you ordered with."
      />
      <div className="mt-4 flex flex-wrap items-center gap-6 md:col-span-2">
        <Button type="submit" arrow disabled={!hydrated}>
          Track order
        </Button>
        {sample ? (
          <button
            type="button"
            onClick={() => {
              setId(sample.id);
              setPhone(sample.phone);
              setErrors({});
            }}
            className="eyebrow text-stone hover:text-ink"
          >
            <span className="link-draw">Presenting? Fill in a sample order</span>
          </button>
        ) : null}
      </div>
    </form>
  );
}
