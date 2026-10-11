"use client";

import { metalLabels, type Metal } from "@/data/rates";
import { formatChange, formatINR } from "@/lib/format";
import { useUI } from "@/store";
import Modal from "../ui/Modal";
import TextLink from "../ui/TextLink";
import { useRateInfo } from "./useRateInfo";

const ORDER: Metal[] = ["24K", "22K", "18K", "silver"];

export default function RatesModal() {
  const open = useUI((s) => s.overlay === "rates");
  const close = useUI((s) => s.close);
  const { rates, previous, updated } = useRateInfo();

  return (
    <Modal open={open} onClose={close} eyebrow="Gold today" title="Today’s rate, per gram">
      <table className="w-full text-left">
        <caption className="sr-only">Gold and silver rates per gram, with change since yesterday</caption>
        <thead>
          <tr className="border-b border-line eyebrow text-stone">
            <th scope="col" className="pb-3 font-medium">Metal</th>
            <th scope="col" className="pb-3 text-right font-medium">Per gram</th>
            <th scope="col" className="pb-3 text-right font-medium">Since yesterday</th>
          </tr>
        </thead>
        <tbody>
          {ORDER.map((m) => {
            const change = formatChange(rates[m], previous[m]);
            const down = rates[m] < previous[m];
            return (
              <tr key={m} className="border-b border-line">
                <th scope="row" className="py-4 font-normal">
                  <span className="block font-serif text-xl text-ink">{metalLabels[m].name}</span>
                  <span className="block text-xs text-stone">{metalLabels[m].detail}</span>
                </th>
                <td className="py-4 text-right font-serif text-xl text-ink figures">{formatINR(rates[m])}</td>
                <td className={`py-4 text-right text-sm figures ${down ? "text-error" : "text-success"}`}>{change}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-stone">
          {updated ? `Updated ${updated.time}, ${updated.day}. ` : ""}Rates apply at our counter today.
        </p>
        <TextLink href="/gold-rate" onClick={close}>
          Full rate page
        </TextLink>
      </div>
    </Modal>
  );
}
