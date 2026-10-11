"use client";

import { useAnimatedNumber } from "@/lib/useAnimatedNumber";

/** Circular progress for instalments paid. The figure in the middle carries the meaning; the ring is decoration. */
export default function ProgressRing({ value, max, size = 176 }: { value: number; max: number; size?: number }) {
  const shown = useAnimatedNumber(value, 900);
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, shown / max);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true" className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-chart)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-serif text-5xl font-light text-ink figures">{Math.round(shown)}</span>
        <span className="text-xs text-stone">of {max} paid</span>
      </div>
    </div>
  );
}
