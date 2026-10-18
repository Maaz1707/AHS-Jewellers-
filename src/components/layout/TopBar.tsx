"use client";

import { site, whatsappLink } from "@/data/site";
import { formatNumber } from "@/lib/format";
import { useUI } from "@/store";
import { WhatsAppIcon } from "../ui/Icons";
import { useRateInfo } from "./useRateInfo";

/** Slim bar above the navigation with the live 24K and 22K rate. On every page. */
export default function TopBar({ transparent }: { transparent: boolean }) {
  const { rates, updated } = useRateInfo();
  const open = useUI((s) => s.open);

  const muted = transparent ? "text-white/70" : "text-stone";
  const strong = transparent ? "text-white" : "text-ink";

  return (
    <div
      className={`border-b transition-colors duration-700 ease-luxe ${
        transparent ? "border-white/15 bg-transparent" : "border-line bg-ivory"
      }`}
    >
      <div className="shell flex h-8 items-center justify-between gap-4 text-xs">
        <button
          type="button"
          onClick={() => open("rates")}
          className={`group/rate flex min-w-0 items-center gap-3 md:gap-4 ${strong}`}
          aria-label={`Gold today 24K ₹${formatNumber(rates["24K"])} 22K ₹${formatNumber(rates["22K"])} per gram. All rates.`}
        >
          <span className={`hidden eyebrow md:inline ${transparent ? "text-gold-pale" : "text-gold-deep"}`}>
            Gold today
          </span>
          <span className="figures">
            <span className={muted}>24K</span> ₹{formatNumber(rates["24K"])}
          </span>
          <span aria-hidden="true" className={`h-3 w-px ${transparent ? "bg-white/30" : "bg-line-strong"}`} />
          <span className="figures">
            <span className={muted}>22K</span> ₹{formatNumber(rates["22K"])}
          </span>
          <span className={`${muted} hidden sm:inline`}>per gram</span>
          <span className={`link-draw hidden lg:inline ${muted} group-hover/rate:text-current`}>All rates</span>
        </button>

        <div className={`flex shrink-0 items-center gap-6 ${muted}`}>
          <span className="figures" aria-live="polite">
            {updated ? (
              <>
                <span className="hidden sm:inline">Updated </span>
                <time dateTime={updated.iso}>
                  {updated.time}
                  <span className="hidden md:inline">, {updated.day}</span>
                </time>
              </>
            ) : (
              <span className="skeleton inline-block h-3 w-16 align-middle" aria-label="Loading update time" />
            )}
          </span>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden items-center gap-2 transition-colors hover:text-current lg:flex ${strong}`}
          >
            <WhatsAppIcon className="size-3" />
            <span className="link-draw">{site.whatsapp.display}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
