"use client";

import { useState } from "react";
import { schemeTerms } from "@/data/site";
import { shortDate } from "@/lib/dates";
import { formatINR } from "@/lib/format";
import { nextDue } from "@/lib/scheme";
import { paymentMethodLabels, type PaymentMethod, type SchemeMember, type SchemePayment } from "@/store/scheme";
import { useScheme, useToast } from "@/store";
import Button from "../ui/Button";
import { CheckIcon } from "../ui/Icons";
import Modal from "../ui/Modal";
import { DemoBadge } from "./DemoSignIn";

const METHODS: PaymentMethod[] = ["upi", "card", "netbanking"];

/**
 * A demonstration of paying an instalment. It asks for no payment details and
 * moves no money: choosing a method and confirming simply records the
 * instalment against the member so the tracker updates.
 */
export default function DemoPayment({ member, open, onClose }: { member: SchemeMember; open: boolean; onClose: () => void }) {
  const record = useScheme((s) => s.recordPayment);
  const show = useToast((s) => s.show);
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [stage, setStage] = useState<"choose" | "processing" | "done">("choose");
  const [receipt, setReceipt] = useState<SchemePayment | null>(null);
  const due = nextDue(member);

  const close = () => {
    onClose();
    window.setTimeout(() => {
      setStage("choose");
      setReceipt(null);
    }, 500);
  };

  const confirm = () => {
    setStage("processing");
    window.setTimeout(() => {
      const p = record(member.id, method, { demo: true });
      setReceipt(p);
      setStage("done");
      if (p) show({ title: "Demo payment recorded", body: `Instalment ${p.n} of ${schemeTerms.instalments}, ${formatINR(p.amount)}` });
    }, 1400);
  };

  return (
    <Modal open={open} onClose={close} eyebrow="Demonstration only" title={stage === "done" ? "Instalment received" : "Pay this month’s instalment"}>
      <DemoBadge />
      {stage === "done" && receipt ? (
        <div className="mt-6" role="status">
          <span className="flex size-12 items-center justify-center rounded-full border border-gold text-gold-deep">
            <CheckIcon className="size-5" />
          </span>
          <p className="mt-6 text-ink-soft">
            Instalment {receipt.n} of {schemeTerms.instalments} is recorded. No money has moved; this shows how the member
            area will work once payments are connected.
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-line py-5 text-sm">
            <div>
              <dt className="eyebrow text-stone">Amount</dt>
              <dd className="mt-1 text-ink">{formatINR(receipt.amount)}</dd>
            </div>
            <div>
              <dt className="eyebrow text-stone">Receipt</dt>
              <dd className="mt-1 text-ink">{receipt.ref}</dd>
            </div>
            <div>
              <dt className="eyebrow text-stone">Method</dt>
              <dd className="mt-1 text-ink">{paymentMethodLabels[receipt.method]} (demo)</dd>
            </div>
            <div>
              <dt className="eyebrow text-stone">Date</dt>
              <dd className="mt-1 text-ink">{shortDate(receipt.paidOn)}</dd>
            </div>
          </dl>
          <div className="mt-8">
            <Button onClick={close}>Back to my scheme</Button>
          </div>
        </div>
      ) : due ? (
        <div className="mt-6">
          <p className="text-ink-soft">
            Instalment {due.n} of {schemeTerms.instalments}, due {shortDate(due.date)}.
          </p>
          <p className="mt-2 font-serif text-4xl text-ink figures">{formatINR(member.monthly)}</p>

          <fieldset className="mt-8" disabled={stage === "processing"}>
            <legend className="eyebrow text-stone">How would you pay?</legend>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {METHODS.map((m) => (
                <label
                  key={m}
                  className={`flex h-12 cursor-pointer items-center justify-center border text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold-deep ${
                    method === m ? "border-ink bg-ink text-white" : "border-line-strong text-ink hover:border-ink"
                  }`}
                >
                  <input type="radio" name="demo-method" value={m} checked={method === m} onChange={() => setMethod(m)} className="sr-only" />
                  {paymentMethodLabels[m]}
                </label>
              ))}
            </div>
          </fieldset>
          <p className="mt-4 border-l-2 border-gold bg-ivory p-4 text-sm text-ink-soft">
            This is a demonstration. You will not be asked for any card, bank or UPI details, and nothing is charged.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Button onClick={confirm} disabled={stage === "processing"} size="lg">
              {stage === "processing" ? "Recording demo payment" : `Confirm demo payment of ${formatINR(member.monthly)}`}
            </Button>
            <button type="button" onClick={close} className="eyebrow text-stone hover:text-ink">
              Cancel
            </button>
          </div>
          {stage === "processing" ? (
            <div className="mt-6 h-px w-full overflow-hidden bg-line" aria-hidden="true">
              <div className="skeleton h-full w-full" />
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-6 text-ink-soft">All {schemeTerms.instalments} instalments are paid. Your scheme is ready to redeem.</p>
      )}
    </Modal>
  );
}
