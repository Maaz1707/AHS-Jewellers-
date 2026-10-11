import type { Metadata } from "next";
import Checkout from "@/components/checkout/Checkout";
import { DemoTag } from "@/components/ui/Tags";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Your details, delivery or showroom pickup, and payment.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <section className="bg-white page-y">
      <div className="shell">
        <div className="flex flex-wrap items-center gap-4">
          <p className="eyebrow flex items-center gap-4 text-gold-deep">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            Checkout
          </p>
          <DemoTag />
        </div>
        <h1 className="mt-6 display-page text-ink">Checkout</h1>
        <div className="mt-12">
          <Checkout />
        </div>
      </div>
    </section>
  );
}
