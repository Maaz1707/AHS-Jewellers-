"use client";

import Image from "@/components/ui/Img";
import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { craftSteps } from "@/data/craft";
import { images } from "@/data/media";
import { useAutoplay } from "@/lib/useAutoplay";
import { PlayPause } from "../ui/Controls";
import VideoBlock from "../ui/VideoBlock";

type Props = {
  /** Label, heading and link above and below the tabs. */
  eyebrow: string;
  heading: ReactNode;
  headingId: string;
  footer?: ReactNode;
  /** The /craft page: the longer account, who does it, how long it takes, and a macro photograph. */
  detailed?: boolean;
  className?: string;
};

/**
 * The five steps of the making as one screen: a film frame and five tabs.
 * Steps play in turn with a thin progress line on the active tab; a tab jumps
 * straight to its step; hover or keyboard focus pauses; phones can swipe the
 * film. With reduced motion nothing plays and the tabs do all the work.
 */
export default function CraftPlayer({ eyebrow, heading, headingId, footer, detailed = false, className = "" }: Props) {
  const total = craftSteps.length;
  const section = useRef<HTMLElement>(null);
  const play = useAutoplay(section, total, { interval: detailed ? 8000 : 6000 });
  const { index } = play;
  const step = craftSteps[index];
  const uid = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const choose = (i: number, focus = false) => {
    const n = (i + total) % total;
    play.pick(n);
    if (focus) tabs.current[n]?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: total - 1 };
    if (e.key in keys) {
      e.preventDefault();
      choose(keys[e.key], true);
    }
  };

  return (
    <section ref={section} aria-labelledby={headingId} className={className}>
      <div className="shell grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
        {/* The film */}
        <div className="relative lg:col-span-7">
          <div
            className="relative overflow-hidden bg-ink screen-frame"
            onPointerDown={(e) => {
              if (e.pointerType !== "mouse") touch.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerUp={(e) => {
              const t = touch.current;
              touch.current = null;
              if (!t) return;
              const dx = e.clientX - t.x;
              if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - t.y)) choose(index + (dx < 0 ? 1 : -1));
            }}
          >
            {craftSteps.map((s, i) => (
              <div
                key={s.number}
                aria-hidden={i !== index}
                className={`absolute inset-0 transition-opacity duration-700 ease-luxe ${i === index ? "opacity-100" : "opacity-0"}`}
              >
                <VideoBlock video={s.video} active={i === index} sizes="(min-width: 1024px) 58vw, 100vw" className="absolute inset-0" />
              </div>
            ))}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/50 to-transparent" />
            <p aria-hidden="true" className="absolute bottom-5 left-5 font-serif text-5xl font-light text-white/90 figures md:bottom-8 md:left-8 lg:text-7xl">
              {step.number}
              <span className="text-xl text-white/50 lg:text-2xl"> / {String(total).padStart(2, "0")}</span>
            </p>
          </div>
          {detailed ? (
            <div className="absolute -bottom-8 right-4 hidden w-1/4 border-8 border-white bg-white shadow-soft md:block lg:-right-6">
              <div className="relative aspect-square overflow-hidden">
                {craftSteps.map((s, i) => (
                  <Image
                    key={s.number}
                    src={images[s.macro].src}
                    alt={i === index ? images[s.macro].alt : ""}
                    fill
                    sizes="15vw"
                    className={`object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* The words and the tabs */}
        <div className="flex flex-col lg:col-span-5">
          <p className="eyebrow flex items-center gap-4 text-gold-deep">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            {eyebrow}
          </p>
          <h2 id={headingId} className="mt-6 display-section text-ink">
            {heading}
          </h2>

          <div role="tablist" data-hold="" aria-label="Steps of the making" onKeyDown={onKey} className="mt-8 grid grid-cols-5 gap-2 md:gap-3 lg:order-last lg:mt-10">
            {craftSteps.map((s, i) => {
              const on = i === index;
              return (
                <button
                  key={s.number}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${i}`}
                  aria-selected={on}
                  aria-controls={`${uid}-panel`}
                  aria-label={`${s.number} ${s.title}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => choose(i)}
                  className="group flex flex-col items-start gap-3 py-2 text-left"
                >
                  <span className="relative block h-px w-full overflow-hidden bg-line-strong">
                    {on ? (
                      play.enabled ? (
                        <span {...play.bar} className="autoplay-bar absolute inset-0 origin-left bg-gold" />
                      ) : (
                        <span className="absolute inset-0 bg-gold" />
                      )
                    ) : null}
                  </span>
                  <span className={`text-xs font-medium uppercase tracking-wide transition-colors duration-300 ${on ? "text-ink" : "text-stone group-hover:text-ink"}`}>
                    <span className="figures md:hidden">{s.number}</span>
                    <span className="hidden md:inline">{s.title}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div
            id={`${uid}-panel`}
            role="tabpanel"
            data-hold=""
            aria-labelledby={`${uid}-tab-${index}`}
            aria-live={play.running ? "off" : "polite"}
            className="mt-8 lg:mt-10"
          >
            <div key={step.number} className="rise-in">
              <p className="eyebrow text-stone">
                Step {step.number} of {String(total).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-serif text-3xl font-light text-ink lg:text-4xl">{step.title}</h3>
              <p className={`mt-4 ${detailed ? "font-serif text-xl font-light leading-snug text-ink" : "text-ink-soft"}`}>{step.body}</p>
              {detailed ? (
                <>
                  <p className="mt-4 text-sm text-ink-soft">{step.detail}</p>
                  <dl className="mt-6 grid grid-cols-2 border-t border-line pt-4 text-sm">
                    <div>
                      <dt className="eyebrow text-stone">Hands</dt>
                      <dd className="mt-2 text-ink">{step.hands}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow text-stone">Time, bridal piece</dt>
                      <dd className="mt-2 text-ink">{step.time}</dd>
                    </div>
                  </dl>
                </>
              ) : null}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-6 lg:order-last">
            {footer}
            <PlayPause enabled={play.enabled} stopped={play.stopped} onToggle={play.toggle} label="the steps" className="ml-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
