"use client";

import { useRef } from "react";
import { schemeTerms } from "@/data/site";
import { addMonthsKey, monthLabel, todayKey } from "@/lib/dates";
import { formatINR } from "@/lib/format";
import { gsap, useGSAP, MOTION } from "@/lib/gsap";
import { useHydrated, useReducedMotion } from "@/lib/motion";

/**
 * Twelve months at a glance: eleven instalments building up, then the bonus
 * and redemption. Horizontal on desktop, a vertical list on phones.
 */
export default function SchemeTimeline({ monthly }: { monthly: number }) {
  const root = useRef<HTMLOListElement>(null);
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  // Month names depend on today’s date, so they appear after hydration.
  const start = hydrated ? todayKey() : null;
  const months = Array.from({ length: schemeTerms.redeemMonth }, (_, i) => i + 1);

  useGSAP(
    () => {
      if (reduced || !root.current) return;
      gsap.fromTo(
        root.current.querySelectorAll("[data-month]"),
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: MOTION.base, stagger: 0.04, ease: MOTION.ease, scrollTrigger: { trigger: root.current, start: "top 85%", once: true } },
      );
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <ol ref={root} className="grid gap-0 lg:grid-cols-12" aria-label="The scheme month by month">
      {months.map((m) => {
        const last = m === schemeTerms.redeemMonth;
        const saved = monthly * Math.min(m, schemeTerms.instalments);
        return (
          <li
            key={m}
            data-month=""
            className={`relative flex gap-5 border-l pb-8 pl-6 lg:flex-col lg:gap-3 lg:border-l-0 lg:border-t lg:pb-0 lg:pl-0 lg:pr-2 lg:pt-6 ${
              last ? "border-gold" : "border-line-strong"
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute -left-1 top-1 size-2 rounded-full lg:-top-1 lg:left-0 ${last ? "bg-gold" : "bg-ink"}`}
            />
            <div className="min-w-20">
              <p className={`font-serif text-2xl figures ${last ? "text-gold-deep" : "text-ink"}`}>{String(m).padStart(2, "0")}</p>
              <p className="text-xs text-stone">{start ? monthLabel(addMonthsKey(start, m - 1)) : <span className="skeleton inline-block h-3 w-12" />}</p>
            </div>
            <div className="text-sm">
              {last ? (
                <>
                  <p className="text-gold-deep">We add {formatINR(monthly * schemeTerms.bonusInstalments)}</p>
                  <p className="mt-1 font-medium text-ink">Redeem {formatINR(monthly * (schemeTerms.instalments + schemeTerms.bonusInstalments))}</p>
                </>
              ) : (
                <>
                  <p className="text-ink-soft">You pay {formatINR(monthly)}</p>
                  <p className="mt-1 text-xs text-stone figures">Saved {formatINR(saved)}</p>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
