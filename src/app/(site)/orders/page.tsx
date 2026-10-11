import type { Metadata } from "next";
import OrderLookup from "@/components/orders/OrderLookup";
import RevealText from "@/components/ui/RevealText";
import { DemoTag } from "@/components/ui/Tags";
import { site, whatsappLink } from "@/data/site";
import NextStep from "@/components/sections/NextStep";

export const metadata: Metadata = {
  title: "Track an Order",
  description: `Follow an order from ${site.name}: weighed and packed, with the insured courier, delivered or ready to collect.`,
};

export default function OrdersPage() {
  return (
    <>
      <section className="bg-white page-y">
        <div className="shell max-w-narrow">
          <div className="flex flex-wrap items-center gap-4">
            <p className="eyebrow flex items-center gap-4 text-gold-deep">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              Your order
            </p>
            <DemoTag />
          </div>
          <RevealText as="h1" immediate delay={0.2} className="mt-6 display-page text-ink">
            Track an order
          </RevealText>
          <p className="mt-6 lede text-ink-soft">
            Enter your order number and the mobile number you ordered with. Members see every order in their account.
          </p>
          <div className="mt-12 border border-line p-6 md:p-8">
            <OrderLookup />
          </div>
          <p className="mt-8 text-sm text-stone">
            Need a hand?{" "}
            <a href={whatsappLink(`Hello ${site.name}, I would like to check on my order.`)} target="_blank" rel="noopener noreferrer" className="link-line text-ink">
              Message us on WhatsApp
            </a>{" "}
            or call{" "}
            <a href={site.phone.href} className="link-line text-ink">
              {site.phone.display}
            </a>
            .
          </p>
        </div>
      </section>
      <NextStep
        eyebrow="While you wait"
        title="Coins and lighter pieces, sent insured to your door."
        action={{ label: "Shop online", href: "/collections?online=1" }}
        alternative={{ label: "Book a visit", href: "/book-a-visit" }}
      />
    </>
  );
}
