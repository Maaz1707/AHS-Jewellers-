import Link from "next/link";
import { footerNav } from "@/data/navigation";
import { site, whatsappLink, directionsLink } from "@/data/site";
import { FacebookIcon, InstagramIcon, PhoneIcon, WhatsAppIcon, YoutubeIcon } from "../ui/Icons";
import Logo from "../ui/Logo";
import Monogram from "../ui/Monogram";
import Newsletter from "./Newsletter";

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="eyebrow text-gold-pale">{title}</h2>
      <div className="mt-6">{children}</div>
    </div>
  );
}

const linkClass = "link-draw text-sm text-white/75 transition-colors duration-300 hover:text-white";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white">
      <div className="shell pt-20 md:pt-32">
        {/* Sign-off and newsletter */}
        <div className="grid gap-12 border-b border-white/15 pb-16 md:pb-20 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="font-serif text-4xl font-light leading-tight md:text-5xl">
              Weighed in front of you,
              <br />
              <em className="text-gold-pale">since {site.foundedYear}.</em>
            </p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="eyebrow text-gold-pale">The AHS letter</p>
            <p className="mt-4 text-white/75">
              A few times a year: festival collections, new bridal work, and the occasional story from the workshop.
            </p>
            <div className="mt-8">
              <Newsletter />
            </div>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 py-16 md:grid-cols-4 md:py-20 lg:grid-cols-12">
          <div className="lg:col-span-2">
            <Column title="Collections">
              <ul className="flex flex-col gap-3">
                {footerNav.collections.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={linkClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Column>
          </div>
          <div className="lg:col-span-3">
            <Column title="Customer care">
              <ul className="flex flex-col gap-3">
                {footerNav.customer.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={linkClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Column>
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-4">
            <Column title="The showroom">
              <address className="not-italic text-sm leading-relaxed text-white/75">
                {site.address.line1}
                <br />
                {site.address.line2}, {site.address.city} {site.address.pin}
                <br />
                {site.address.state}
              </address>
              <dl className="mt-6 flex flex-col gap-2 text-sm">
                {site.hours.map((h) => (
                  <div key={h.days} className="flex flex-wrap justify-between gap-x-4 border-b border-white/10 pb-2 lg:max-w-label xl:max-w-none">
                    <dt className="text-white/60">{h.days}</dt>
                    <dd className="text-white/90">{h.time}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-white/60">{site.hoursNote}</p>
              <a href={directionsLink()} target="_blank" rel="noopener noreferrer" className={`mt-5 inline-block ${linkClass}`}>
                Get directions
              </a>
            </Column>
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-3">
            <Column title="Speak to us">
              <ul className="flex flex-col gap-4 text-sm">
                <li>
                  <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-3 text-white/90">
                    <WhatsAppIcon className="size-4 text-gold-pale" />
                    <span className="link-draw">WhatsApp {site.whatsapp.display}</span>
                  </a>
                </li>
                <li>
                  <a href={site.phone.href} className="group inline-flex items-center gap-3 text-white/90">
                    <PhoneIcon className="size-4 text-gold-pale" />
                    <span className="link-draw">{site.phone.display}</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${site.email}`} className={linkClass}>
                    {site.email}
                  </a>
                </li>
              </ul>
              <ul className="mt-8 flex gap-2" aria-label="Social media">
                {[
                  { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
                  { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
                  { href: site.social.youtube, label: "YouTube", Icon: YoutubeIcon },
                ].map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${site.name} on ${label}`}
                      className="relative hit-area flex size-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors duration-500 hover:border-gold-pale hover:text-gold-pale"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </Column>
          </div>
        </div>

        {/* Hallmark note */}
        <div className="flex flex-col gap-6 border-t border-white/15 py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            {/* The house seal */}
            <Monogram frame="var(--color-gold)" className="h-20 w-auto shrink-0 text-gold-pale" />
            <p className="max-w-narrow text-sm text-white/75">
              {site.hallmark.short}{" "}
              <Link href="/hallmarking" className="link-line text-white">
                How to read a hallmark
              </Link>
            </p>
          </div>
          <Logo tone="light" mark={false} className="self-start md:self-auto" />
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-4 border-t border-white/15 py-8 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.name}. {site.legal}
          </p>
          <ul className="flex gap-6">
            {footerNav.legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-draw hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
