import type { Metadata } from "next";
import { Suspense } from "react";
import BookingForm from "@/components/booking/BookingForm";
import RevealImage from "@/components/ui/RevealImage";
import RevealText from "@/components/ui/RevealText";
import { site, whatsappLink } from "@/data/site";

export const metadata: Metadata = {
  title: "Book a Visit",
  description: `Book a private appointment at ${site.name}, ${site.address.city}. Choose a day and time, and we will have pieces ready for you.`,
};

export default function BookAVisitPage() {
  return (
    <section className="bg-white page-y">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <p className="eyebrow flex items-center gap-4 text-gold-deep">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              Book a visit
            </p>
            <RevealText as="h1" immediate delay={0.2} className="mt-6 display-page text-ink">
              A private visit,
              <br />
              <em className="text-gold-deep">with tea</em>
            </RevealText>
            <p className="mt-6 text-ink-soft">
              Tell us when you would like to come and what you are looking for. We will have pieces ready, and the bridal
              salon held for you if you need it.
            </p>
            <div className="mt-10 hidden lg:block">
              <RevealImage image="showroomTray" immediate sizes="30vw" className="aspect-landscape" />
            </div>
            <dl className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-sm">
              {site.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-4">
                  <dt className="text-stone">{h.days}</dt>
                  <dd className="text-ink">{h.time}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm text-stone">
              Prefer to talk?{" "}
              <a href={site.phone.href} className="link-line text-ink">
                {site.phone.display}
              </a>{" "}
              or{" "}
              <a href={whatsappLink("Hello AHS Jewellers, I would like to book a visit.")} target="_blank" rel="noopener noreferrer" className="link-line text-ink">
                WhatsApp
              </a>
              .
            </p>
          </div>
        </aside>
        <div className="lg:col-span-7 lg:col-start-6">
          <div className="border border-line p-6 md:p-10">
            <Suspense fallback={<div className="skeleton h-96 w-full" aria-label="Loading the booking form" />}>
              <BookingForm />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
