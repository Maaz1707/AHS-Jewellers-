import Link from "next/link";
import { site } from "@/data/site";
import Monogram from "./Monogram";

/** The house mark: the monogram beside spaced serif initials over a small sans descriptor. */
export default function Logo({
  tone = "ink",
  className = "",
  mark = true,
  compact = false,
}: {
  tone?: "ink" | "light";
  className?: string;
  mark?: boolean;
  /** The monogram alone below desktop width (the phone header), the full mark above. */
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label={`${site.name}, home`}
      className={`group/logo inline-flex items-center gap-3 leading-none transition-colors duration-500 ${
        tone === "light" ? "text-white" : "text-ink"
      } ${className}`}
    >
      {mark ? (
        <Monogram
          frame={tone === "light" ? "var(--color-gold-pale)" : "var(--color-gold)"}
          className={`${compact ? "h-12" : "h-10"} w-auto shrink-0 transition-transform duration-700 ease-luxe group-hover/logo:-translate-y-px md:h-12`}
        />
      ) : null}
      <span aria-hidden="true" className={`${compact ? "hidden lg:inline-flex" : "inline-flex"} flex-col items-center`}>
        <span className="font-serif text-2xl font-medium tracking-logo md:text-3xl" style={{ marginRight: "-0.34em" }}>
          {site.shortName}
        </span>
        <span className="mt-1 flex items-center gap-2 text-micro font-medium uppercase tracking-label">
          <span aria-hidden="true" className="h-px w-3 bg-gold transition-all duration-700 ease-luxe group-hover/logo:w-5" />
          {site.descriptor}
          <span aria-hidden="true" className="h-px w-3 bg-gold transition-all duration-700 ease-luxe group-hover/logo:w-5" />
        </span>
      </span>
    </Link>
  );
}
