import Link from "next/link";
import Monogram from "./Monogram";
import { Rosette } from "./Motif";

type Props = {
  compact?: boolean;
  className?: string;
};

/**
 * A house assurance, not a certification. It consistently explains the three
 * things AHS can show a customer at the counter and on their invoice.
 */
export default function AhsAssurance({ compact = false, className = "" }: Props) {
  const points = compact
    ? ["Weighed in front of you", "BIS hallmark and HUID", "Price explained at today’s rate"]
    : ["Weighed in front of you", "BIS hallmark and six-digit HUID", "Price explained at today’s rate"];

  return (
    <aside aria-label="AHS assurance" className={`relative overflow-hidden border border-gold/50 bg-emerald-deep px-5 py-5 text-white ${className}`}>
      <div aria-hidden="true" className="bg-jaali-light pointer-events-none absolute inset-y-0 right-0 w-32 opacity-25" />
      <div className="relative flex gap-4">
        <Monogram frame="var(--color-gold)" className="h-14 w-auto shrink-0 text-gold-pale" />
        <div className="min-w-0">
          <p className="eyebrow flex items-center gap-3 text-gold-pale">
            <Rosette className="size-4" tone="var(--color-gold-pale)" />
            AHS assurance
          </p>
          <ul className="mt-3 grid gap-1 text-xs leading-relaxed text-white/85">
            {points.map((point) => (
              <li key={point} className="flex gap-2"><span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-gold" />{point}</li>
            ))}
          </ul>
          {!compact ? (
            <Link href="/hallmarking" className="link-draw mt-4 inline-block text-xs text-white">
              Read how hallmarking works
            </Link>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
