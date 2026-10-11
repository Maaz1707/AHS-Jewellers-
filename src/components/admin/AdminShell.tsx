"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { site } from "@/data/site";
import { todayKey } from "@/lib/dates";
import { memberState } from "@/lib/scheme";
import { useBookings, useEnquiries, useOrders, useScheme, useSession } from "@/store";
import Button from "../ui/Button";
import {
  BagIcon,
  CalendarIcon,
  ChartIcon,
  ChatIcon,
  CloseIcon,
  CoinIcon,
  GridIcon,
  HomeIcon,
  MenuIcon,
  SettingsIcon,
  TrendIcon,
  UsersIcon,
  VaultIcon,
} from "../ui/Icons";
import Logo from "../ui/Logo";
import { DemoTag } from "../ui/Tags";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: HomeIcon },
  { href: "/admin/rates", label: "Gold rates", Icon: TrendIcon },
  { href: "/admin/pieces", label: "Pieces", Icon: GridIcon },
  { href: "/admin/orders", label: "Orders", Icon: BagIcon, badge: "orders" },
  { href: "/admin/enquiries", label: "Enquiries", Icon: ChatIcon, badge: "enquiries" },
  { href: "/admin/visits", label: "Visit bookings", Icon: CalendarIcon, badge: "visits" },
  { href: "/admin/members", label: "Scheme members", Icon: CoinIcon, badge: "members" },
  { href: "/admin/digital-gold", label: "Digital gold", Icon: VaultIcon },
  { href: "/admin/customers", label: "Customers", Icon: UsersIcon },
  { href: "/admin/reports", label: "Reports", Icon: ChartIcon },
  { href: "/admin/settings", label: "Demo and settings", Icon: SettingsIcon },
] as const;

function useSessionReady() {
  return useSyncExternalStore(
    (cb) => useSession.persist.onFinishHydration(cb),
    () => useSession.persist.hasHydrated(),
    () => false,
  );
}

function Gate() {
  const enter = useSession((s) => s.enterAdmin);
  return (
    <main className="flex min-h-svh items-center justify-center bg-ivory p-5">
      <div className="w-full max-w-narrow border border-line bg-white p-8 text-center md:p-14">
        <Logo />
        <div className="mt-10">
          <DemoTag />
        </div>
        <h1 className="mt-6 font-serif text-4xl font-light text-ink md:text-5xl">The owner’s panel</h1>
        <p className="mx-auto mt-4 max-w-prose text-stone">
          Update today’s gold rate, manage pieces, send out orders, reply to enquiries, confirm visits and look after scheme members. In
          the prototype there is no password: everything runs on sample data in this browser.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <Button onClick={enter} size="lg" arrow>
            Enter demo admin
          </Button>
          <Link href="/" className="link-draw text-sm text-stone hover:text-ink">
            Back to the shop
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const ready = useSessionReady();
  const admin = useSession((s) => s.admin);
  const exit = useSession((s) => s.exitAdmin);
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const enquiries = useEnquiries((s) => s.enquiries);
  const bookings = useBookings((s) => s.bookings);
  const members = useScheme((s) => s.members);
  const orders = useOrders((s) => s.orders);

  if (!ready) return <div className="min-h-svh bg-ivory" aria-busy="true" />;
  if (!admin) return <Gate />;

  const today = todayKey();
  const badges = {
    enquiries: enquiries.filter((q) => q.status === "new").length,
    visits: bookings.filter((b) => b.status === "requested" && b.date >= today).length,
    members: members.filter((m) => memberState(m) === "overdue").length,
    orders: orders.filter((o) => o.status === "placed").length,
  };
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav aria-label="Admin">
      <ul className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = isActive(item.href);
          const count = "badge" in item ? badges[item.badge] : 0;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMenu(false)}
                aria-current={active ? "page" : undefined}
                className={`flex h-12 items-center gap-4 px-4 text-base transition-colors ${
                  active ? "bg-white text-ink shadow-soft" : "text-ink-soft hover:bg-white/60 hover:text-ink"
                }`}
              >
                <item.Icon className={`size-5 ${active ? "text-gold-deep" : ""}`} />
                <span className="flex-1 truncate">{item.label}</span>
                {count ? (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-gold px-2 text-xs font-medium text-white figures">{count}</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const footer = (
    <div className="flex flex-col gap-3 border-t border-line-strong pt-6 text-sm">
      <span className="flex items-center gap-3 text-stone">
        <DemoTag />
        Sample data in this browser
      </span>
      <Link href="/" className="link-draw self-start text-ink-soft hover:text-ink">
        View the shop
      </Link>
      <button type="button" onClick={exit} className="link-draw self-start text-left text-ink-soft hover:text-ink">
        Exit demo admin
      </button>
    </div>
  );

  return (
    <div className="min-h-svh bg-ivory lg:grid lg:grid-cols-[18rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh flex-col gap-10 overflow-y-auto border-r border-line-strong p-8 lg:flex">
        <div>
          <Logo />
          <p className="mt-4 eyebrow text-stone">Owner’s panel</p>
        </div>
        <div className="flex-1">{nav}</div>
        {footer}
      </aside>

      {/* Phone and tablet top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line-strong bg-ivory/95 px-5 backdrop-blur-sm lg:hidden">
        <button type="button" onClick={() => setMenu(true)} aria-label="Open admin menu" aria-expanded={menu} className="-ml-2 relative hit-area flex size-10 items-center justify-center">
          <MenuIcon className="size-6" />
        </button>
        <span className="eyebrow text-ink">{site.shortName} · Owner’s panel</span>
        <span className="w-10" />
      </header>
      {menu ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMenu(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-full flex-col gap-8 overflow-y-auto bg-ivory p-6 [animation:menu-in_0.4s_var(--ease-luxe)]">
            <div className="flex items-center justify-between">
              <Logo />
              <button type="button" onClick={() => setMenu(false)} aria-label="Close menu" className="relative hit-area flex size-10 items-center justify-center">
                <CloseIcon className="size-6" />
              </button>
            </div>
            <div className="flex-1">{nav}</div>
            {footer}
          </div>
        </div>
      ) : null}

      <main id="main" className="min-w-0 px-5 py-10 md:px-10 lg:px-16 lg:py-14">
        <div className="mx-auto max-w-content">{children}</div>
      </main>
    </div>
  );
}
