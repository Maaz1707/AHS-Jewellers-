import { MONOGRAM } from "@/data/monogram";

/**
 * The AHS monogram: interlocked serif letters inside a cusped Jaipur arch.
 * The arch is a gold line; the letters take the current text colour.
 * `data-draw` hooks let the opening sequence draw it stroke by stroke.
 */
export default function Monogram({
  className = "",
  frame = "var(--color-gold)",
  title,
}: {
  className?: string;
  /** Colour of the arch, rule and petal. */
  frame?: string;
  /** Accessible name; omit when the mark sits beside visible text. */
  title?: string;
}) {
  return (
    <svg viewBox={MONOGRAM.viewBox} className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path data-draw="frame" d={MONOGRAM.outer} pathLength={1} fill="none" stroke={frame} strokeWidth={1.2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path data-draw="frame" d={MONOGRAM.inner} pathLength={1} fill="none" stroke={frame} strokeWidth={0.6} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path data-draw="letters" d={MONOGRAM.letters} fill="currentColor" />
      <path data-draw="detail" d={MONOGRAM.rule} stroke={frame} strokeWidth={0.7} vectorEffect="non-scaling-stroke" />
      <path data-draw="detail" d={MONOGRAM.petal} fill={frame} />
    </svg>
  );
}
