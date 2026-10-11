/**
 * The house motif, drawn from Jaipur kundan work: a jaali lattice (see the
 * `bg-jaali` utility) and a kundan petal. Fine gold line, used sparingly.
 */

/** A single kundan petal: a pointed oval, the shape of a foil-set stone. */
const PETAL = "M0,-10 C4.2,-5.5 4.2,5.5 0,10 C-4.2,5.5 -4.2,-5.5 0,-10 Z";

/** A small rosette of five petals, for dividers and seals. */
export function Rosette({ className = "", tone = "var(--color-gold)" }: { className?: string; tone?: string }) {
  return (
    <svg viewBox="-26 -26 52 52" aria-hidden="true" className={className}>
      <g fill="none" stroke={tone} strokeWidth={0.9} vectorEffect="non-scaling-stroke">
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} d={PETAL} transform={`rotate(${a}) translate(0,-12)`} />
        ))}
        <circle r={3.2} />
      </g>
    </svg>
  );
}

/** Section divider: hairline, rosette, hairline. */
export function OrnamentDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center justify-center gap-5 ${className}`}>
      <span className="h-px w-16 bg-gold/60 md:w-24" />
      <Rosette className="size-6" />
      <span className="h-px w-16 bg-gold/60 md:w-24" />
    </div>
  );
}

/** A fan of three petals for the corner of a card or panel. Place inside a positioned parent. */
export function PetalCorner({ className = "", tone = "var(--color-gold)" }: { className?: string; tone?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={`pointer-events-none ${className}`}>
      <g fill="none" stroke={tone} strokeWidth={0.8} vectorEffect="non-scaling-stroke">
        <path d="M2,2 L38,2 M2,2 L2,38" />
        {[20, 45, 70].map((a) => (
          <path key={a} d={PETAL} transform={`translate(4,4) rotate(${a + 90}) translate(0,-15) scale(0.9)`} />
        ))}
      </g>
    </svg>
  );
}
