import type { Metadata } from "next";
import BagView from "@/components/bag/BagView";
import { DemoTag } from "@/components/ui/Tags";
import RevealText from "@/components/ui/RevealText";

export const metadata: Metadata = {
  title: "Your Bag",
  description: "Gold coins and selected lighter pieces, priced live at today’s rate and delivered insured.",
  robots: { index: false },
};

export default function BagPage() {
  return (
    <section className="bg-white page-y">
      <div className="shell">
        <div className="flex flex-wrap items-center gap-4">
          <p className="eyebrow flex items-center gap-4 text-gold-deep">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            Your bag
          </p>
          <DemoTag />
        </div>
        <RevealText as="h1" immediate delay={0.2} className="mt-6 display-page text-ink">
          Your <em className="text-gold-deep">bag</em>
        </RevealText>
        <p className="mt-6 lede text-ink-soft">
          Priced live at today’s gold rate, with every charge shown. Coins and lighter pieces are sent insured, or kept
          ready at the showroom for you.
        </p>
        <div className="mt-12">
          <BagView />
        </div>
      </div>
    </section>
  );
}
