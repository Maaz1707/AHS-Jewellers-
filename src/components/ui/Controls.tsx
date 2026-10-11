"use client";

import { ArrowLeft, ArrowRight, PauseIcon, PlayIcon } from "./Icons";

type Tone = "dark" | "light";

const ring: Record<Tone, string> = {
  dark: "border-line-strong text-ink hover:border-ink hover:bg-ink hover:text-white",
  light: "border-white/50 text-white hover:border-white hover:bg-white hover:text-ink",
};

const round =
  "relative hit-area flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 disabled:pointer-events-none disabled:opacity-30";

/** Pause or resume anything that plays by itself. Hidden when it cannot play (reduced motion). */
export function PlayPause({
  enabled,
  stopped,
  onToggle,
  label,
  tone = "dark",
  className = "",
}: {
  enabled: boolean;
  stopped: boolean;
  onToggle: () => void;
  /** What plays, e.g. "the collections". */
  label: string;
  tone?: Tone;
  className?: string;
}) {
  if (!enabled) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={stopped ? `Play ${label}` : `Pause ${label}`}
      className={`${round} ${ring[tone]} ${className}`}
    >
      {stopped ? <PlayIcon className="size-4" /> : <PauseIcon className="size-4" />}
    </button>
  );
}

/** Previous / next arrows. */
export function Arrows({
  onPrev,
  onNext,
  label,
  tone = "dark",
  prevDisabled,
  nextDisabled,
  className = "",
}: {
  onPrev: () => void;
  onNext: () => void;
  /** What moves, e.g. "piece" gives “Previous piece”. */
  label: string;
  tone?: Tone;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button type="button" onClick={onPrev} disabled={prevDisabled} aria-label={`Previous ${label}`} className={`${round} ${ring[tone]}`}>
        <ArrowLeft className="size-4" />
      </button>
      <button type="button" onClick={onNext} disabled={nextDisabled} aria-label={`Next ${label}`} className={`${round} ${ring[tone]}`}>
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

/**
 * Dots for a swipeable row. The active dot stretches into a bar; when the row
 * plays by itself, the bar fills over the interval.
 */
export function Dots({
  count,
  active,
  onPick,
  label,
  names,
  bar,
  className = "",
}: {
  count: number;
  active: number;
  onPick: (i: number) => void;
  label: string;
  names?: string[];
  bar?: { onAnimationEnd: () => void; style: React.CSSProperties };
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={`flex items-center gap-2 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(i)}
          aria-label={names?.[i] ?? `${i + 1} of ${count}`}
          aria-current={i === active ? "true" : undefined}
          className="relative hit-area flex h-6 items-center"
        >
          <span
            className={`relative block h-px overflow-hidden transition-[width,background-color] duration-500 ${
              i === active ? "w-10 bg-line-strong" : "w-4 bg-line-strong"
            }`}
          >
            {i === active ? (
              bar ? (
                <span {...bar} className="autoplay-bar absolute inset-0 origin-left bg-gold" />
              ) : (
                <span className="absolute inset-0 bg-gold" />
              )
            ) : null}
          </span>
        </button>
      ))}
    </div>
  );
}
