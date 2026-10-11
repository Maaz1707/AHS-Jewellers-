import type { Metadata } from "next";
import TextPage from "@/components/sections/TextPage";
import { commerceTerms, digitalGoldTerms, schemeTerms, site } from "@/data/site";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Terms",
  description: `Terms for this website, online orders, the savings scheme and digital gold at ${site.name}.`,
};

export default function TermsPage() {
  return (
    <TextPage
      eyebrow="Terms"
      title="Terms of use and sale"
      updated="Sample terms for the prototype"
      intro={
        <p>
          These are sample terms written for the presentation. The figures come from the sample settings used across the site.
          Final terms must be prepared with {site.name}’s legal adviser before launch.
        </p>
      }
      sections={[
        {
          title: "Prices",
          body: (
            <>
              <p>
                Prices follow the day’s gold rate, published each morning. A price shown on the site is an estimate until you
                pay online or buy at the counter, when it is fixed.
              </p>
              <p>Every bill shows the gold weight, rate, making charge, stones and GST separately.</p>
            </>
          ),
        },
        {
          title: "Online orders",
          body: (
            <>
              <p>
                Only pieces marked &ldquo;Available online&rdquo; can be bought on the site, up to {formatINR(commerceTerms.onlineLimit)}{" "}
                in one order and {commerceTerms.maxQty} of any one piece.
              </p>
              <p>
                Insured delivery is free from {formatINR(commerceTerms.freeDeliveryFrom)} and {formatINR(commerceTerms.insuredDeliveryFee)}{" "}
                below that. Showroom pickups are held for {commerceTerms.pickupHoldDays} days.
              </p>
            </>
          ),
        },
        {
          title: "Returns and exchange",
          body: (
            <p>
              Unworn coins and pieces bought online may be returned within 7 days in their sealed packaging. Any piece bought from us
              can be exchanged at any time at the day’s rate, as set out on the old gold exchange page.
            </p>
          ),
        },
        {
          title: "Savings scheme",
          body: (
            <p>
              Members pay {schemeTerms.instalments} monthly instalments from {formatINR(schemeTerms.minMonthly)}. On completion we add{" "}
              {schemeTerms.bonusInstalments} instalment, and the full value is redeemed in jewellery from month {schemeTerms.redeemMonth},
              within {schemeTerms.redeemWithinDays} days. Instalments more than {schemeTerms.graceDays} days late count as overdue.
            </p>
          ),
        },
        {
          title: "Digital gold",
          body: (
            <p>
              Digital gold is {digitalGoldTerms.fineness} gold held by a licensed vault partner in the buyer’s name, bought online
              from {formatINR(digitalGoldTerms.minRupees)} up to {formatINR(digitalGoldTerms.maxRupees)} a day, with 3% GST. It can be
              redeemed as jewellery at the showroom from {digitalGoldTerms.minRedeemGrams} g.
            </p>
          ),
        },
        {
          title: "This website",
          body: (
            <p>
              Photographs show the style of each piece; the piece you receive is weighed and hallmarked individually, and its weight
              may differ slightly. Business details on this prototype are sample content.
            </p>
          ),
        },
      ]}
    />
  );
}
