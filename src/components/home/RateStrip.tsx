"use client";

import { metalLabels, type Metal } from "@/data/rates";
import { formatChange, formatNumber } from "@/lib/format";
import { useRateInfo } from "../layout/useRateInfo";
import TextLink from "../ui/TextLink";

const SHOWN: Metal[] = ["24K", "22K", "silver"];

/** Today’s rates, set like a printed board. Directly under the hero. */
export default function RateStrip() {
  const { rates, previous, updated } = useRateInfo();

  return (
    <section aria-labelledby="rate-strip-title" className="border-b border-line bg-ivory">
      <div className="shell grid gap-8 py-10 md:py-12 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-3">
          <h2 id="rate-strip-title" className="eyebrow text-gold-deep">
            Today’s rate
          </h2>
          <p className="mt-2 text-sm text-stone">
            Per gram, at our counter.{" "}
            {updated ? (
              <>
                Updated <time dateTime={updated.iso}>{updated.time}</time>.
              </>
            ) : (
              <span className="skeleton inline-block h-3 w-20 align-middle" aria-label="Loading update time" />
            )}
          </p>
        </div>

        <dl className="grid grid-cols-3 divide-x divide-line-strong lg:col-span-7">
          {SHOWN.map((m, i) => {
            const down = rates[m] < previous[m];
            return (
              <div key={m} className={`flex flex-col gap-1 ${i === 0 ? "pr-4 md:pr-8" : "px-4 md:px-8"}`}>
                <dt className="eyebrow text-stone">{m === "silver" ? "Silver" : `${m} Gold`}</dt>
                <dd className="font-serif text-2xl font-light text-ink figures md:text-4xl">
                  <span className="text-xl md:text-2xl">₹</span>
                  {formatNumber(rates[m])}
                </dd>
                <dd className={`text-xs figures ${down ? "text-error" : "text-success"}`}>
                  <span className="sr-only">{metalLabels[m].name} change since yesterday: </span>
                  {formatChange(rates[m], previous[m])}
                  <span className="hidden text-stone md:inline"> since yesterday</span>
                </dd>
              </div>
            );
          })}
        </dl>

        <div className="lg:col-span-2 lg:justify-self-end">
          <TextLink href="/gold-rate">Full rate page</TextLink>
        </div>
      </div>
    </section>
  );
}
