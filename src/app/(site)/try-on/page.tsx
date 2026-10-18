import type { Metadata } from "next";
import { Suspense } from "react";
import TryOn from "@/components/tryon/TryOn";
import RevealText from "@/components/ui/RevealText";
import { DemoTag } from "@/components/ui/Tags";
import { site } from "@/data/site";
import NextStep from "@/components/sections/NextStep";

export const metadata: Metadata = {
  title: "Virtual Try-On",
  description: `Try earrings and necklaces from ${site.name} on yourself with your camera, or on our model. Nothing is recorded or uploaded.`,
};

export default function TryOnPage() {
  return (
    <>
      <section className="bg-white page-y">
        <div className="shell">
          <div className="flex flex-wrap items-center gap-4">
            <p className="eyebrow flex items-center gap-4 text-gold-deep">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              Virtual try-on
            </p>
            <DemoTag />
          </div>
          <RevealText as="h1" immediate delay={0.2} className="mt-6 max-w-narrow display-page text-ink">
            Try it on, <em className="text-gold-deep">at home</em>
          </RevealText>
          <p className="mt-6 lede text-ink-soft">
            Hold your phone at arm’s length and turn your head: earrings follow your ears and necklaces sit at your neckline.
            Choose a pair of earrings and a necklace to see them together.
          </p>
          <div className="mt-12">
            <Suspense fallback={<div className="skeleton aspect-tall w-full lg:w-7/12" aria-label="Loading the try-on" />}>
              <TryOn />
            </Suspense>
          </div>
        </div>
      </section>
      <NextStep
        eyebrow="In person"
        title="Found one you like? We will have it ready to try."
        action={{ label: "Book a visit", href: "/book-a-visit" }}
        alternative={{ label: "Browse earrings", href: "/category/earrings" }}
      />
    </>
  );
}
