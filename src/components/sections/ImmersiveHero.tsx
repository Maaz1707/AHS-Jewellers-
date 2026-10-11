import type { ReactNode } from "react";
import { images, type ImageKey, type VideoKey } from "@/data/media";
import Image from "../ui/Img";
import RevealText from "../ui/RevealText";
import VideoBlock from "../ui/VideoBlock";

/**
 * Pattern A of the three page openings: a full-bleed film or photograph with
 * the label, headline and intro set over it. Used by the house pages (craft,
 * our story); the home page and collections build the same pattern themselves.
 */
export default function ImmersiveHero({
  eyebrow,
  title,
  intro,
  video,
  image,
  objectPosition,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  intro: ReactNode;
  video?: VideoKey;
  image?: ImageKey;
  objectPosition?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-ink text-white" style={{ height: "86svh", minHeight: "34rem" }}>
      {video ? (
        <VideoBlock video={video} eager priority control className="absolute inset-0" />
      ) : image ? (
        <Image src={images[image].src} alt={images[image].alt} fill priority sizes="100vw" className="object-cover" style={{ objectPosition }} />
      ) : null}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/85 via-ink/30 to-ink/40" />
      <div className="shell pointer-events-none relative flex h-full flex-col justify-end pb-16 md:pb-24">
        <p className="eyebrow flex items-center gap-4 text-gold-pale">
          <span aria-hidden="true" className="h-px w-8 bg-gold-pale" />
          {eyebrow}
        </p>
        <RevealText as="h1" immediate delay={0.3} className="mt-6 max-w-content display-hero">
          {title}
        </RevealText>
        <p className="mt-6 lede text-white/85">{intro}</p>
      </div>
    </section>
  );
}
