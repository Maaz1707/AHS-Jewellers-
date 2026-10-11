"use client";

import { metalLabels, type Metal } from "@/data/rates";
import { formatChange, formatINR } from "@/lib/format";
import { useRateInfo } from "../layout/useRateInfo";
import AnimatedValue from "../ui/AnimatedValue";

const ORDER: Metal[] = ["24K", "22K", "18K", "silver"];

/** Today’s rates per gram and per 10 grams, with the day’s movement. */
export default function RateBoard() {
  const { rates, previous, updated } = useRateInfo();
  return (
    <div>
      <table className="w-full text-left">
        <caption className="sr-only">Gold and silver rates today, per gram and per 10 grams, with change since yesterday</caption>
        <thead>
          <tr className="border-b border-line-strong eyebrow text-stone">
            <th scope="col" className="pb-3 font-medium">Metal</th>
            <th scope="col" className="pb-3 text-right font-medium">Per gram</th>
            <th scope="col" className="pb-3 text-right font-medium">Per 10 g</th>
            <th scope="col" className="hidden pb-3 text-right font-medium sm:table-cell">Since yesterday</th>
          </tr>
        </thead>
        <tbody>
          {ORDER.map((m) => {
            const down = rates[m] < previous[m];
            return (
              <tr key={m} className="border-b border-line">
                <th scope="row" className="py-5 pr-4 font-normal">
                  <span className="block font-serif text-2xl text-ink md:text-3xl">{metalLabels[m].name}</span>
                  <span className="block text-xs text-stone">{metalLabels[m].detail}</span>
                </th>
                <td className="py-5 text-right font-serif text-2xl text-ink figures md:text-3xl">
                  <AnimatedValue value={rates[m]} format={formatINR} />
                </td>
                <td className="py-5 pl-4 text-right text-ink figures">
                  {formatINR(rates[m] * 10)}
                  <span className={`block text-xs sm:hidden ${down ? "text-error" : "text-success"}`}>{formatChange(rates[m], previous[m])}</span>
                </td>
                <td className={`hidden py-5 text-right text-sm figures sm:table-cell ${down ? "text-error" : "text-success"}`}>
                  {down ? "▼" : "▲"} {formatChange(rates[m], previous[m])}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-4 flex items-center gap-2 text-xs text-stone">
        <span aria-hidden="true" className="size-2 rounded-full bg-gold" />
        {updated ? (
          <span>
            Last updated <time dateTime={updated.iso}>{updated.time}, {updated.day}</time>. Rates apply to purchases at our
            counter today, before GST and making charges.
          </span>
        ) : (
          <span className="skeleton inline-block h-3 w-48" aria-label="Loading update time" />
        )}
      </p>
    </div>
  );
}
