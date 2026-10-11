import type { Metadata } from "next";
import ImmersiveHero from "@/components/sections/ImmersiveHero";
import CraftSequence from "@/components/story/CraftSequence";
import Button from "@/components/ui/Button";
import RevealImage from "@/components/ui/RevealImage";
import RevealText from "@/components/ui/RevealText";
import TextLink from "@/components/ui/TextLink";

export const metadata: Metadata = {
  title: "The Craft",
  description: "Design, casting, setting, finishing and hallmarking: how a piece is made in the AHS workshop.",
};

export default function CraftPage() {
  return (
    <>
      <ImmersiveHero
        video="craftSetting"
        eyebrow="The craft"
        title={
          <>
            Made at the bench, <em className="text-gold-pale">by hand</em>
          </>
        }
        intro="Five steps and several pairs of hands stand between a drawing and the piece you wear. This is how they go."
      />

      {/* Workshop introduction */}
      <section aria-labelledby="workshop-title" className="bg-white section-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-6">
            <p className="eyebrow flex items-center gap-4 text-gold-deep">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              The workshop
            </p>
            <RevealText as="h2" id="workshop-title" className="mt-6 display-section text-ink">
              Upstairs, eleven karigars and a window onto Bhagwan Das Road
            </RevealText>
            <RevealText mode="block" className="mt-6 lede text-ink-soft">
              Most of what you see in the showroom is made one floor above it. Our karigars have worked together for
              years; several trained under the people they now sit beside. A bridal set passes through every one of the
              steps below, and usually takes four to six weeks from first drawing to hallmark.
            </RevealText>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:col-span-5 lg:col-start-8">
            <RevealImage image="craftSketching" sizes="(min-width: 1024px) 20vw, 45vw" parallax={6} className="aspect-slim" />
            <div className="pt-16">
              <RevealImage image="craftFlame" sizes="(min-width: 1024px) 20vw, 45vw" parallax={6} delay={0.2} className="aspect-slim" />
            </div>
          </div>
        </div>
      </section>

      <CraftSequence />

      {/* Commission */}
      <section aria-labelledby="commission-title" className="bg-ivory section-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-5">
            <RevealImage image="craftBench" sizes="(min-width: 1024px) 40vw, 100vw" parallax={6} className="aspect-portrait" />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="eyebrow flex items-center gap-4 text-gold-deep">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              Commissions
            </p>
            <RevealText as="h2" id="commission-title" className="mt-6 display-section text-ink">
              Bring us the piece you cannot find
            </RevealText>
            <p className="mt-6 max-w-prose text-ink-soft">
              An old photograph, a grandmother’s necklace, a sketch on a napkin. Our designer will sit with you
              upstairs, draw it out, and give you the weight and price before a single gram is cast.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-8">
              <Button href="/book-a-visit" arrow>
                Book a design visit
              </Button>
              <TextLink href="/hallmarking">How hallmarking works</TextLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
