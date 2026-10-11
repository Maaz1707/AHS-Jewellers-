import type { ReactNode } from "react";
import type { ImageKey } from "@/data/media";
import RevealImage from "../ui/RevealImage";
import RevealText from "../ui/RevealText";

/** Opening of an editorial content page: label, serif headline, intro and an image beside it. */
export default function PageHero({
  eyebrow,
  title,
  intro,
  image,
  children,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  intro: ReactNode;
  image: ImageKey;
  children?: ReactNode;
}) {
  return (
    <section className="bg-white hero-y">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-6">
          <p className="eyebrow flex items-center gap-4 text-gold-deep">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            {eyebrow}
          </p>
          <RevealText as="h1" immediate delay={0.2} className="mt-6 display-page text-ink">
            {title}
          </RevealText>
          <div className="mt-6 lede text-ink-soft">{intro}</div>
          {children ? <div className="mt-10 flex flex-wrap items-center gap-8">{children}</div> : null}
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <RevealImage image={image} immediate priority sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-portrait" />
        </div>
      </div>
    </section>
  );
}
