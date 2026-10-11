"use client";

import { useState } from "react";
import { schemeTerms } from "@/data/site";
import { formatINR } from "@/lib/format";
import Accordion from "../ui/Accordion";
import SectionHeading from "../ui/SectionHeading";
import EnrolForm from "./EnrolForm";
import SchemeCalculator from "./SchemeCalculator";
import SchemeTimeline from "./SchemeTimeline";

const t = schemeTerms;

const FAQS = [
  {
    title: "What if I miss a month?",
    content: `Pay it with the next instalment; there is no penalty within ${t.graceDays} days of the due date. If a payment is more than a month late, the bonus is reduced in proportion, and we will always call before that happens.`,
  },
  {
    title: "Is the gold price fixed when I join?",
    content:
      "No. You save in rupees, and the full balance buys gold at the rate on the day you redeem. If the rate rises, your money buys a little less; if it falls, a little more. The bonus month is what makes the scheme worth it.",
  },
  {
    title: "Can I redeem for coins or bars?",
    content: "The scheme is for jewellery, from any collection. Coins and bars can be bought separately at the day’s rate.",
  },
  {
    title: "Do I still pay making charges and GST?",
    content:
      "Yes, on the piece you choose, as on any purchase. Members receive 10% off making charges on pieces redeemed through the scheme. (Sample terms.)",
  },
  {
    title: "Can I redeem early?",
    content: `You may redeem from month ${t.instalments} onwards, without the bonus. To receive the bonus, redeem in month ${t.redeemMonth} or within ${t.redeemWithinDays} days of it.`,
  },
  {
    title: "How do I pay each month?",
    content: "At the counter, by UPI or by card in your member area. A receipt follows on WhatsApp every time.",
  },
  {
    title: "Can I change the amount later?",
    content: "The monthly amount stays the same for one scheme. You can start a second scheme alongside it at any time.",
  },
];

/** Calculator, timeline, questions and enrolment, sharing one monthly amount. */
export default function SchemeExperience() {
  const [monthly, setMonthly] = useState(5000);

  return (
    <>
      <section id="calculator" aria-labelledby="calc-title" className="scroll-mt-28 bg-ivory section-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
          <SectionHeading
            id="calc-title"
            className="lg:col-span-4"
            eyebrow="Work it out"
            title="What your savings become"
            size="md"
            intro="Move the slider or type an amount. Everything is shown in rupees and in grams of 22K gold at today’s rate."
          />
          <div className="lg:col-span-8">
            <SchemeCalculator monthly={monthly} onChange={setMonthly} />
          </div>
        </div>
      </section>

      <section aria-labelledby="timeline-title" className="bg-white section-y">
        <div className="shell">
          <SectionHeading
            id="timeline-title"
            eyebrow="Month by month"
            title={`${formatINR(monthly)} a month, starting now`}
            size="md"
          />
          <div className="mt-14">
            <SchemeTimeline monthly={monthly} />
          </div>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="bg-ivory section-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
          <SectionHeading id="faq-title" className="lg:col-span-4" eyebrow="Questions" title="What people ask before they join" size="md" />
          <div className="lg:col-span-7 lg:col-start-6">
            <Accordion items={FAQS} defaultOpen={0} />
            <p className="mt-6 text-xs text-stone">These are sample terms for the prototype and will be replaced by the scheme’s published terms.</p>
          </div>
        </div>
      </section>

      <section id="enrol" aria-labelledby="enrol-title" className="scroll-mt-28 bg-white section-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
          <SectionHeading
            id="enrol-title"
            className="lg:col-span-4"
            eyebrow="Enrol now"
            title="Start this month"
            size="md"
            intro="Three details and you are in. Your first instalment can be paid at the counter or online from your member area."
          />
          <div className="border border-line p-6 md:p-10 lg:col-span-7 lg:col-start-6">
            <EnrolForm monthly={monthly} onMonthly={setMonthly} />
          </div>
        </div>
      </section>
    </>
  );
}
