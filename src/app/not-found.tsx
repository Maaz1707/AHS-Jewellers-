import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";
import RevealImage from "@/components/ui/RevealImage";
import SiteChrome from "@/components/layout/SiteChrome";

export const metadata: Metadata = { title: "Page not found" };

/** Unmatched URLs render here, outside the (site) group, so the chrome is added directly. */
export default function NotFound() {
  return (
    <SiteChrome>
    <section className="bg-white">
      <div className="shell grid gap-12 page-y lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-6">
          <p className="eyebrow flex items-center gap-4 text-gold-deep">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            Page not found
          </p>
          <h1 className="mt-6 display-page text-ink">
            This piece has moved,
            <br />
            <em className="text-gold-deep">or was never made.</em>
          </h1>
          <p className="mt-6 lede text-ink-soft">
            The page you were looking for is not here. The collections are, and so are we, on WhatsApp or at the showroom.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-8">
            <Button href="/" arrow>
              Return home
            </Button>
            <TextLink href="/collections">Explore collections</TextLink>
          </div>
          <nav aria-label="Useful pages" className="mt-12 border-t border-line pt-6">
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
              {[
                ["Today’s gold rate", "/gold-rate"],
                ["Book a visit", "/book-a-visit"],
                ["Track an order", "/orders"],
                ["Contact us", "/contact"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="link-draw text-stone hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <RevealImage image="dailyStill" immediate priority sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-portrait" />
        </div>
      </div>
    </section>
    </SiteChrome>
  );
}
