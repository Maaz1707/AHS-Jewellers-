"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { categories, collections } from "@/data/collections";
import { mainNav, type MenuKey } from "@/data/navigation";
import { site, whatsappLink } from "@/data/site";
import { gsap, useGSAP, MOTION } from "@/lib/gsap";
import { formatNumber } from "@/lib/format";
import { prefersReducedMotion, useHydrated } from "@/lib/motion";
import { useFocusTrap, useOverlayTransition } from "@/lib/overlay";
import { useUI } from "@/store";
import Button from "../ui/Button";
import { CloseIcon, MinusIcon, PhoneIcon, PlusIcon, WhatsAppIcon } from "../ui/Icons";
import Logo from "../ui/Logo";
import { useRateInfo } from "./useRateInfo";

/** Full-screen phone menu. Large serif links with accordion sub-menus. */
export default function MobileMenu() {
  const open = useUI((s) => s.overlay === "menu");
  const close = useUI((s) => s.close);
  const openOverlay = useUI((s) => s.open);
  const hydrated = useHydrated();
  const { mounted, visible } = useOverlayTransition(open, 700);
  const panel = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<MenuKey | null>(null);
  const { rates, updated } = useRateInfo();
  useFocusTrap(panel, open, close);

  useGSAP(
    () => {
      if (!visible || prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-menu-item]",
        { y: 48, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: MOTION.base, stagger: 0.04, delay: 0.15, ease: MOTION.ease },
      );
    },
    { scope: panel, dependencies: [visible] },
  );

  if (!hydrated || !mounted) return null;

  const subLinks = (key: MenuKey) => {
    if (key === "collections") {
      return [
        ...collections.map((c) => ({ label: c.name, href: `/collections/${c.slug}` })),
        ...categories.filter((c) => c.inMenu).map((c) => ({ label: c.name, href: `/category/${c.slug}`, small: true })),
        { label: "Available online", href: "/collections?online=1", small: true },
        { label: "Virtual try-on", href: "/try-on", small: true },
      ];
    }
    return mainNav.find((n) => n.key === key)?.links ?? [];
  };

  return createPortal(
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className={`fixed inset-0 z-50 flex flex-col bg-white transition-[clip-path] duration-700 ease-curtain lg:hidden`}
      style={{ clipPath: visible ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}
    >
      <div className="shell flex h-16 shrink-0 items-center justify-between border-b border-line">
        <span className="w-10" />
        <Logo />
        <button
          type="button"
          onClick={close}
          aria-label="Close menu"
          className="-mr-2 relative hit-area flex size-10 items-center justify-center text-ink"
        >
          <CloseIcon className="size-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" data-lenis-prevent="">
        <nav aria-label="Main" className="shell pb-10 pt-8">
          <ul className="flex flex-col">
            {mainNav.map((item) => {
              const isOpen = expanded === item.key;
              const links = subLinks(item.key);
              return (
                <li key={item.key} data-menu-item="" className="border-b border-line">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`m-${item.key}`}
                    onClick={() => setExpanded(isOpen ? null : item.key)}
                    className="flex w-full items-center justify-between py-5 text-left font-serif text-4xl font-light text-ink"
                  >
                    {item.label}
                    <span className="flex size-10 items-center justify-center text-gold-deep">
                      {isOpen ? <MinusIcon className="size-5" /> : <PlusIcon className="size-5" />}
                    </span>
                  </button>
                  <div
                    id={`m-${item.key}`}
                    className={`grid transition-[grid-template-rows] duration-500 ease-luxe ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <ul className="flex flex-col gap-1 pb-6" inert={!isOpen}>
                        <li>
                          <Link href={item.href} className="flex py-2 eyebrow text-gold-deep">
                            All of {item.label}
                          </Link>
                        </li>
                        {links.map((l) => (
                          <li key={l.href}>
                            <Link
                              href={l.href}
                              className={`flex py-2 ${
                                "small" in l && l.small ? "text-sm text-stone" : "text-lg text-ink-soft"
                              }`}
                            >
                              {l.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div data-menu-item="" className="mt-10 grid grid-cols-2 gap-x-6">
            <button type="button" onClick={() => openOverlay("search")} className="flex h-12 items-center text-left text-sm text-ink-soft">
              Search
            </button>
            <button type="button" onClick={() => openOverlay("wishlist")} className="flex h-12 items-center text-left text-sm text-ink-soft">
              Wishlist
            </button>
            <button type="button" onClick={() => openOverlay("bag")} className="flex h-12 items-center text-left text-sm text-ink-soft">
              Your bag
            </button>
            <Link href="/gold-rate" className="flex h-12 items-center text-sm text-ink-soft">
              Today’s rate
            </Link>
            <Link href="/orders" className="flex h-12 items-center text-sm text-ink-soft">
              Track an order
            </Link>
          </div>
        </nav>
      </div>

      <div data-menu-item="" className="shrink-0 border-t border-line bg-ivory">
        <div className="shell flex flex-col gap-5 py-6">
          <div className="flex items-center justify-between text-xs text-stone">
            <span className="figures">
              <span className="eyebrow text-gold-deep">Today</span>
              <span className="ml-3 text-ink">24K ₹{formatNumber(rates["24K"])}</span>
              <span className="ml-3 text-ink">22K ₹{formatNumber(rates["22K"])}</span>
            </span>
            <span>{updated ? updated.time : ""}</span>
          </div>
          <Button href="/book-a-visit" size="lg" arrow className="w-full">
            Book a Visit
          </Button>
          <div className="flex items-center justify-between text-sm">
            <a href={site.phone.href} className="flex items-center gap-2 text-ink">
              <PhoneIcon className="size-4 text-gold-deep" />
              {site.phone.display}
            </a>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-ink">
              <WhatsAppIcon className="size-4 text-gold-deep" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
