"use client";

import { useAnimatedNumber } from "@/lib/useAnimatedNumber";

/**
 * A number that eases to its new value when it changes (rates, totals,
 * calculators). Jumps straight there with reduced motion. Screen readers get
 * the final value only.
 */
export default function AnimatedValue({ value, format, className = "" }: { value: number; format: (n: number) => string; className?: string }) {
  const shown = useAnimatedNumber(value);
  return (
    <span className={`figures ${className}`}>
      <span aria-hidden="true">{format(shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
