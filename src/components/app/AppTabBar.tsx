"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAppMode } from "@/lib/app";
import { CoinIcon, GridIcon, HomeIcon, TrendIcon, UserIcon } from "../ui/Icons";

const TABS = [
  { href: "/", label: "Home", Icon: HomeIcon, match: (p: string) => p === "/" },
  { href: "/collections", label: "Collections", Icon: GridIcon, match: (p: string) => /^\/(collections|category|jewellery)/.test(p) },
  { href: "/gold-rate", label: "Rate", Icon: TrendIcon, match: (p: string) => p.startsWith("/gold-rate") },
  { href: "/savings-scheme", label: "Scheme", Icon: CoinIcon, match: (p: string) => p.startsWith("/savings-scheme") },
  { href: "/account", label: "Account", Icon: UserIcon, match: (p: string) => p.startsWith("/account") || p === "/wishlist" },
];

/**
 * Bottom tab bar, shown only when the site runs as an installed app on a phone
 * or tablet. It also flags app mode on <html> so fixed elements can sit above it.
 */
export default function AppTabBar() {
  const app = useAppMode();
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (app) root.dataset.app = "true";
    else delete root.dataset.app;
  }, [app]);

  if (!app) return null;

  return (
    <nav
      aria-label="App"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {TABS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-16 flex-col items-center justify-center gap-1 transition-colors duration-300 ${
                  active ? "text-gold-deep" : "text-stone hover:text-ink"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-6 top-0 h-px bg-gold transition-transform duration-500 ease-luxe ${active ? "scale-x-100" : "scale-x-0"}`}
                />
                <Icon className="size-5" />
                <span className="text-micro font-medium uppercase tracking-wide">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
