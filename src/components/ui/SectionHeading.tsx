import type { ReactNode } from "react";
import RevealText from "./RevealText";

type Props = {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  tone?: "dark" | "light";
  size?: "lg" | "md";
  className?: string;
  id?: string;
};

/** Gold hairline + uppercase label, a serif heading revealed line by line, and an optional intro. */
export default function SectionHeading({
  eyebrow,
  title,
  intro,
  as = "h2",
  align = "left",
  tone = "dark",
  size = "lg",
  className = "",
  id,
}: Props) {
  const centered = align === "center";
  const titleSize =
    size === "lg" ? "display-section" : "font-serif font-light tracking-tight text-3xl md:text-4xl";

  return (
    <div className={`${centered ? "mx-auto text-center" : ""} ${className}`}>
      <p
        className={`eyebrow flex items-center gap-4 ${centered ? "justify-center" : ""} ${
          tone === "light" ? "text-gold-pale" : "text-gold-deep"
        }`}
      >
        <span aria-hidden="true" className={`h-px w-8 ${tone === "light" ? "bg-gold-pale" : "bg-gold"}`} />
        {eyebrow}
        {centered ? <span aria-hidden="true" className="h-px w-8 bg-gold" /> : null}
      </p>
      <RevealText
        as={as}
        id={id}
        className={`mt-6 ${titleSize} ${tone === "light" ? "text-white" : "text-ink"}`}
      >
        {title}
      </RevealText>
      {intro ? (
        <RevealText
          mode="block"
          delay={0.15}
          className={`mt-6 lede ${centered ? "mx-auto" : ""} ${
            tone === "light" ? "text-white/80" : "text-stone"
          }`}
        >
          {intro}
        </RevealText>
      ) : null}
    </div>
  );
}
