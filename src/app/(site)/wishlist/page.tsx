import type { Metadata } from "next";
import RevealText from "@/components/ui/RevealText";
import WishlistPage from "@/components/wishlist/WishlistPage";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "The pieces you have saved, ready to share or to see in the showroom.",
  robots: { index: false },
};

export default function Page() {
  return (
    <section className="bg-white page-y">
      <div className="shell">
        <p className="eyebrow flex items-center gap-4 text-gold-deep">
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
          Wishlist
        </p>
        <RevealText as="h1" immediate delay={0.2} className="mt-6 display-page text-ink">
          Pieces you have <em className="text-gold-deep">saved</em>
        </RevealText>
        <p className="mt-6 lede text-ink-soft">
          Send the list to us on WhatsApp and we will reply with availability, or bring it to the showroom and we will
          have every piece ready.
        </p>
        <div className="mt-12">
          <WishlistPage />
        </div>
      </div>
    </section>
  );
}
