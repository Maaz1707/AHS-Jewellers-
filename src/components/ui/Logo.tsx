import Link from "next/link";
import { site } from "@/data/site";

/** Wordmark: spaced serif initials over a small sans descriptor. */
export default function Logo({ tone = "ink", className = "" }: { tone?: "ink" | "light"; className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name}, home`}
      className={`group/logo inline-flex flex-col items-center leading-none transition-colors duration-500 ${
        tone === "light" ? "text-white" : "text-ink"
      } ${className}`}
    >
      <span className="font-serif text-2xl font-medium tracking-logo md:text-3xl" style={{ marginRight: "-0.34em" }}>
        {site.shortName}
      </span>
      <span className="mt-1 flex items-center gap-2 text-micro font-medium uppercase tracking-label">
        <span aria-hidden="true" className="h-px w-3 bg-gold transition-all duration-700 ease-luxe group-hover/logo:w-5" />
        {site.descriptor}
        <span aria-hidden="true" className="h-px w-3 bg-gold transition-all duration-700 ease-luxe group-hover/logo:w-5" />
      </span>
    </Link>
  );
}
