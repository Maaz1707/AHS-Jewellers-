"use client";

import Link from "next/link";
import { useState } from "react";
import { resetDemoData, useBookings, useEnquiries, useGold, useOrders, useProducts, useScheme, useSession, useToast } from "@/store";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { AdminPageHeader } from "./AdminUI";

export default function SettingsPanel() {
  const show = useToast((s) => s.show);
  const exit = useSession((s) => s.exitAdmin);
  const products = useProducts((s) => s.products.length);
  const enquiries = useEnquiries((s) => s.enquiries.length);
  const bookings = useBookings((s) => s.bookings.length);
  const members = useScheme((s) => s.members.length);
  const orders = useOrders((s) => s.orders.length);
  const gold = useGold((s) => s.txns.length);
  const [confirming, setConfirming] = useState(false);

  return (
    <div>
      <AdminPageHeader title="Demo and settings" intro="Everything in this panel runs on sample data stored in this browser. Nothing is sent anywhere." />

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="border border-line bg-white p-6 md:p-8" aria-labelledby="reset-title">
          <h2 id="reset-title" className="font-serif text-3xl font-light text-ink">
            Reset demo data
          </h2>
          <p className="mt-3 text-base text-ink-soft">
            Before a presentation, restore everything to the starting sample: the catalogue, today’s rates, enquiries,
            visit bookings, scheme members, orders and digital gold, with dates set around today. Wishlists, bags and the demo member sign-in on
            this browser are cleared too.
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-line py-5 text-base sm:grid-cols-3">
            {[
              ["Pieces", products],
              ["Enquiries", enquiries],
              ["Visits", bookings],
              ["Members", members],
              ["Orders", orders],
              ["Gold entries", gold],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-sm text-stone">{k}</dt>
                <dd className="font-serif text-2xl text-ink figures">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6">
            <Button onClick={() => setConfirming(true)} size="lg" magnetic={false}>
              Reset demo data
            </Button>
          </div>
        </section>

        <section className="border border-line bg-white p-6 md:p-8" aria-labelledby="about-title">
          <h2 id="about-title" className="font-serif text-3xl font-light text-ink">
            About this panel
          </h2>
          <ul className="mt-4 flex flex-col gap-3 text-base text-ink-soft">
            <li>There is no real sign-in. Anyone opening /admin on this browser can enter the demo.</li>
            <li>Changes are saved in this browser only. Another computer or phone shows its own copy.</li>
            <li>An open shop tab in this browser updates as soon as you save here.</li>
            <li>No messages are sent. WhatsApp buttons open WhatsApp with the message ready for you to send.</li>
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link href="/" className="link-draw text-base text-ink">
              View the shop
            </Link>
            <button type="button" onClick={exit} className="link-draw text-base text-stone hover:text-ink">
              Exit demo admin
            </button>
          </div>
        </section>
      </div>

      <Modal open={confirming} onClose={() => setConfirming(false)} eyebrow="Reset demo data" title="Start the demo afresh?">
        <p className="text-base text-ink-soft">
          Pieces you added or edited, rate changes, enquiries, bookings, orders, digital gold and payments made in the demo will
          be replaced by the sample data.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button
            magnetic={false}
            onClick={() => {
              resetDemoData();
              setConfirming(false);
              show({ title: "Demo data restored", body: "Everything is back to the starting sample, dated around today." });
            }}
          >
            Yes, reset everything
          </Button>
          <button type="button" onClick={() => setConfirming(false)} className="text-base text-stone hover:text-ink">
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
