import type { Metadata } from "next";
import OfflineRates from "@/components/app/OfflineRates";
import Logo from "@/components/ui/Logo";
import { site, whatsappLink } from "@/data/site";

export const metadata: Metadata = { title: "You are offline", robots: { index: false } };

/**
 * Shown by the service worker when a page is requested without a connection.
 * Deliberately light: no site chrome, so it renders from the cache alone.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-svh flex-col bg-ivory">
      <header className="shell flex h-20 items-center justify-center border-b border-line">
        <Logo />
      </header>
      <section className="shell flex flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="eyebrow flex items-center gap-4 text-gold-deep">
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
          No connection
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
        </p>
        <h1 className="mt-6 max-w-narrow display-page text-ink">
          You are offline. The showroom is not.
        </h1>
        <p className="mt-6 max-w-prose text-ink-soft">
          This page will load as soon as you are connected again. Pages you have already opened are still available.
        </p>

        <OfflineRates />

        <div className="mt-12 flex flex-col items-center gap-3 text-sm">
          <a href={site.phone.href} className="link-line text-ink">
            Call {site.phone.display}
          </a>
          <a href={whatsappLink()} className="link-line text-ink">
            WhatsApp {site.whatsapp.display}
          </a>
          <p className="mt-4 text-stone">
            {site.address.line1}, {site.address.line2}, {site.address.city}
          </p>
        </div>
      </section>
    </main>
  );
}
