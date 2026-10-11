"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { schemeTerms } from "@/data/site";
import { formatIndianMobile, longDate, slotLabel } from "@/lib/booking";
import { stamp, todayKey } from "@/lib/dates";
import { productPath } from "@/lib/enquiry";
import { useVisibleProducts } from "@/lib/pieces";
import { bookingStatusLabels, occasionLabels } from "@/store/bookings";
import { enquiryStatusLabels, enquiryTypeLabels } from "@/store/enquiries";
import { samePhone } from "@/store/scheme";
import { formatINR } from "@/lib/format";
import { isOrderOpen, orderPaymentLabels, orderStatusLabels } from "@/store/orders";
import { useBookings, useEnquiries, useOrders, useScheme, useSession, useToast } from "@/store";
import GoldWallet from "../gold/GoldWallet";
import { useWishlistItems } from "../layout/WishlistDrawer";
import Button from "../ui/Button";
import { TextField, validators } from "../ui/Field";
import ProductCard from "../ui/ProductCard";
import TextLink from "../ui/TextLink";
import { DemoBadge } from "./DemoSignIn";
import SchemeTracker from "./SchemeTracker";

const TABS = [
  { key: "scheme", label: "My scheme" },
  { key: "gold", label: "Gold wallet" },
  { key: "orders", label: "Orders" },
  { key: "wishlist", label: "Wishlist" },
  { key: "visits", label: "Visits" },
  { key: "enquiries", label: "Enquiries" },
  { key: "profile", label: "Profile" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

function Empty({ title, body, action }: { title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="border border-dashed border-line-strong px-6 py-14 text-center">
      <p className="font-serif text-2xl font-light text-ink">{title}</p>
      <p className="mx-auto mt-3 max-w-prose text-sm text-stone">{body}</p>
      <div className="mt-8 flex justify-center">{action}</div>
    </div>
  );
}

export default function AccountDashboard() {
  const member = useSession((s) => s.member)!;
  const signOut = useSession((s) => s.signOut);
  const updateProfile = useSession((s) => s.updateProfile);
  const show = useToast((s) => s.show);
  const schemes = useScheme((s) => s.members).filter((m) => samePhone(m.phone, member.phone));
  // Bookings always carry a phone, so match on it. WhatsApp enquiries made on this device carry none, so they belong here.
  const bookings = useBookings((s) => s.bookings).filter((b) => samePhone(b.phone, member.phone));
  const enquiries = useEnquiries((s) => s.enquiries).filter(
    (q) => samePhone(q.phone, member.phone) || (q.source === "site" && !q.phone),
  );
  const orders = useOrders((s) => s.orders).filter((o) => samePhone(o.phone, member.phone));
  const wishlist = useWishlistItems();
  const products = useVisibleProducts();
  // Open the tab named in the URL hash (#visits etc.). Rendered client-side only, so window is available.
  const [tab, setTab] = useState<TabKey>(() => {
    const h = window.location.hash.slice(1) as TabKey;
    return TABS.some((t) => t.key === h) ? h : "scheme";
  });
  const [schemeIndex, setSchemeIndex] = useState(0);
  const choose = (k: TabKey) => {
    setTab(k);
    window.history.replaceState(null, "", `#${k}`);
  };

  const today = todayKey();
  const upcoming = bookings.filter((b) => b.date >= today && b.status !== "cancelled" && b.status !== "completed").sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot));
  const past = bookings.filter((b) => !upcoming.includes(b));
  const scheme = schemes[Math.min(schemeIndex, schemes.length - 1)];
  const first = member.name ? member.name.split(" ")[0] : "";

  // Profile form
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email ?? "");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const saveProfile = (e: FormEvent) => {
    e.preventDefault();
    const found = {
      name: name.trim() ? "" : "Please add your name.",
      email: email.trim() ? validators.email(email) : "",
    };
    setErrors(found);
    if (found.name || found.email) return;
    updateProfile({ name: name.trim(), email: email.trim() || undefined });
    show({ title: "Profile saved" });
  };

  const counts: Record<TabKey, number | null> = {
    scheme: schemes.length,
    gold: null,
    orders: orders.filter(isOrderOpen).length,
    wishlist: wishlist.length,
    visits: upcoming.length,
    enquiries: enquiries.length,
    profile: null,
  };

  return (
    <div>
      <div>
        <div className="flex flex-wrap items-center gap-4">
          <p className="eyebrow flex items-center gap-4 text-gold-deep">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            Your account
          </p>
          <DemoBadge />
        </div>
        <h1 className="mt-6 display-page text-ink">
          {first ? (
            <>
              Namaste, <em className="text-gold-deep">{first}</em>
            </>
          ) : (
            "Welcome back"
          )}
        </h1>
        <p className="mt-4 flex flex-wrap items-center gap-x-3 text-sm text-stone">
          Signed in as {member.phone}
          <span aria-hidden="true">·</span>
          <button type="button" onClick={signOut} className="relative hit-area text-ink hover:text-gold-deep">
            <span className="link-line">Sign out</span>
          </button>
        </p>
      </div>

      <div className="mt-10 border-b border-line" role="tablist" aria-label="Account sections">
        <div className="no-scrollbar -mb-px flex gap-8 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`tab-${t.key}`}
              aria-selected={tab === t.key}
              aria-controls={`panel-${t.key}`}
              onClick={() => choose(t.key)}
              className={`flex shrink-0 items-center gap-2 border-b py-4 eyebrow transition-colors ${
                tab === t.key ? "border-gold text-ink" : "border-transparent text-stone hover:text-ink"
              }`}
            >
              {t.label}
              {counts[t.key] ? <span className="rounded-full bg-ivory-deep px-2 text-micro figures">{counts[t.key]}</span> : null}
            </button>
          ))}
        </div>
      </div>

      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="pt-10 [animation:menu-in_0.5s_var(--ease-luxe)]" key={tab}>
        {tab === "scheme" ? (
          scheme ? (
            <>
              {schemes.length > 1 ? (
                <div className="mb-6 flex flex-wrap gap-2">
                  {schemes.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSchemeIndex(i)}
                      aria-pressed={i === schemeIndex}
                      className={`border px-3 py-1 text-xs ${i === schemeIndex ? "border-ink bg-ink text-white" : "border-line-strong text-stone"}`}
                    >
                      {s.id}
                    </button>
                  ))}
                </div>
              ) : null}
              <SchemeTracker member={scheme} />
            </>
          ) : (
            <Empty
              title="No savings scheme yet"
              body={`Put aside a fixed amount for ${schemeTerms.instalments} months and we add the ${schemeTerms.redeemMonth}th. Enrol in a minute.`}
              action={
                <Button href="/savings-scheme#enrol" arrow>
                  Start a scheme
                </Button>
              }
            />
          )
        ) : null}

        {tab === "gold" ? <GoldWallet phone={member.phone} /> : null}

        {tab === "orders" ? (
          orders.length ? (
            <ul className="border-t border-line">
              {orders.map((o) => (
                <li key={o.id} className="flex flex-col gap-4 border-b border-line py-6 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-stone">
                      {o.id} · {stamp(o.createdAt)} · {o.fulfilment === "pickup" ? "Showroom pickup" : "Insured delivery"}
                    </p>
                    <p className="mt-2 font-serif text-2xl text-ink">{o.lines.map((l) => `${l.name}${l.qty > 1 ? ` × ${l.qty}` : ""}`).join(", ")}</p>
                    <p className="mt-1 text-sm text-stone figures">{formatINR(o.total)} · paid by {orderPaymentLabels[o.payment.method]} (demo)</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-6">
                    <span
                      className={`border px-2 py-1 text-micro font-medium uppercase tracking-wide ${
                        o.status === "cancelled" ? "border-error text-error" : isOrderOpen(o) ? "border-gold text-gold-deep" : "border-line-strong text-ink-soft"
                      }`}
                    >
                      {orderStatusLabels[o.status]}
                    </span>
                    <TextLink href={`/orders/${o.id}`}>Track</TextLink>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty
              title="No orders yet"
              body="Gold coins and selected lighter pieces can be bought online and delivered, insured."
              action={
                <Button href="/collections?online=1" arrow>
                  See pieces available online
                </Button>
              }
            />
          )
        ) : null}

        {tab === "wishlist" ? (
          wishlist.length ? (
            <>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-8 xl:grid-cols-4">
                {wishlist.map((p) => (
                  <li key={p.slug}>
                    <ProductCard product={p} sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw" />
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <TextLink href="/wishlist">Open the full wishlist</TextLink>
              </div>
            </>
          ) : (
            <Empty title="Nothing saved yet" body="Tap the heart on any piece to keep it here." action={<Button href="/collections" arrow>Explore collections</Button>} />
          )
        ) : null}

        {tab === "visits" ? (
          bookings.length ? (
            <div className="flex flex-col gap-12">
              {[
                { title: "Upcoming", list: upcoming },
                { title: "Earlier", list: past },
              ]
                .filter((g) => g.list.length)
                .map((g) => (
                  <section key={g.title} aria-label={`${g.title} visits`}>
                    <h3 className="eyebrow text-gold-deep">{g.title}</h3>
                    <ul className="mt-4 border-t border-line">
                      {g.list.map((b) => {
                        const piece = products.find((p) => p.slug === b.pieceSlug);
                        return (
                          <li key={b.id} className="flex flex-col gap-2 border-b border-line py-5 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="font-serif text-2xl text-ink">
                                {longDate(b.date)}, {slotLabel(b.slot)}
                              </p>
                              <p className="mt-1 text-sm text-stone">
                                {occasionLabels[b.occasion].label} · {b.floor === "bridal" ? "Bridal salon" : "Ground floor"}
                                {piece ? (
                                  <>
                                    {" · "}
                                    <Link href={productPath(piece)} className="link-line text-ink">
                                      {piece.name}
                                    </Link>
                                  </>
                                ) : null}
                              </p>
                            </div>
                            <span className="self-start border border-line-strong px-2 py-1 text-micro font-medium uppercase tracking-wide text-ink-soft md:self-auto">
                              {bookingStatusLabels[b.status]}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              <div>
                <Button href="/book-a-visit" arrow>
                  Book another visit
                </Button>
              </div>
            </div>
          ) : (
            <Empty title="No visits booked" body="Choose a time and we will have pieces ready, with tea." action={<Button href="/book-a-visit" arrow>Book a visit</Button>} />
          )
        ) : null}

        {tab === "enquiries" ? (
          enquiries.length ? (
            <ul className="border-t border-line">
              {enquiries.map((q) => {
                const slugs = q.productSlugs ?? (q.productSlug ? [q.productSlug] : []);
                const names = slugs.map((s) => products.find((p) => p.slug === s)?.name).filter(Boolean);
                return (
                  <li key={q.id} className="flex flex-col gap-2 border-b border-line py-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs text-stone">
                        {stamp(q.createdAt)} · {q.channel === "whatsapp" ? "WhatsApp" : "Message"} · {enquiryTypeLabels[q.type]}
                      </p>
                      <p className="mt-2 font-serif text-xl text-ink">
                        {names.length ? names.join(", ") : q.subject ?? "General question"}
                      </p>
                      {q.message ? <p className="mt-1 max-w-prose text-sm text-ink-soft">{q.message}</p> : null}
                    </div>
                    <span className="self-start border border-line-strong px-2 py-1 text-micro font-medium uppercase tracking-wide text-ink-soft">
                      {enquiryStatusLabels[q.status]}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty title="No enquiries yet" body="Ask about any piece on WhatsApp and it will appear here." action={<Button href="/collections" arrow>Explore collections</Button>} />
          )
        ) : null}

        {tab === "profile" ? (
          <form onSubmit={saveProfile} noValidate className="grid max-w-narrow gap-2 md:grid-cols-2 md:gap-x-8" aria-label="Profile">
            <TextField label="Name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
            <TextField label="Mobile number" value={formatIndianMobile(member.phone)} readOnly hint="Your sign-in number." />
            <TextField
              label="Email (optional)"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              className="md:col-span-2"
            />
            <div className="mt-4 md:col-span-2">
              <Button type="submit">Save profile</Button>
            </div>
            <p className="mt-6 text-xs text-stone md:col-span-2">
              Demo mode: profile details are kept only in this browser.
            </p>
          </form>
        ) : null}
      </div>
    </div>
  );
}
