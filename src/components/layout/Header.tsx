"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { mainNav, type MenuKey } from "@/data/navigation";
import { useBag } from "@/lib/bag";
import { useUI, useWishlist } from "@/store";
import { useHydrated } from "@/lib/motion";
import Button from "../ui/Button";
import { BagIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from "../ui/Icons";
import Logo from "../ui/Logo";
import MegaMenu from "./MegaMenu";
import TopBar from "./TopBar";

const OPEN_DELAY = 140;
const CLOSE_DELAY = 220;

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const overlay = useUI((s) => s.overlay);
  const openOverlay = useUI((s) => s.open);
  const bag = useBag();
  const hydrated = useHydrated();
  const count = hydrated ? bag.count : 0;
  const saved = useWishlist((s) => s.slugs.length);
  const savedCount = hydrated ? saved : 0;

  const [active, setActive] = useState<MenuKey | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const header = useRef<HTMLElement>(null);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const triggers = useRef<Partial<Record<MenuKey, HTMLAnchorElement | null>>>({});
  /** Set while focus is returned to a trigger, so it does not reopen its panel. */
  const returningFocus = useRef(false);

  /* ------------------------------------------------------------ scroll */
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 8);
        if (Math.abs(y - lastY) > 6) {
          setHidden(y > lastY && y > 240);
          lastY = y;
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Publish the header’s visible height so sticky bars can sit right under it.
  const isHidden = hidden && !active && !overlay;
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const h = header.current?.offsetHeight ?? 0;
      root.style.setProperty("--header-offset", `${isHidden ? 0 : h}px`);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [isHidden]);

  /* ------------------------------------------------------- mega menu */
  const clearTimers = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  };

  const close = useCallback(() => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    setActive(null);
  }, []);

  const hoverOpen = (key: MenuKey) => {
    clearTimers();
    // Moving between items while open switches instantly; a fresh open waits a beat.
    if (active) setActive(key);
    else openTimer.current = window.setTimeout(() => setActive(key), OPEN_DELAY);
  };

  const hoverClose = () => {
    window.clearTimeout(openTimer.current);
    closeTimer.current = window.setTimeout(() => setActive(null), CLOSE_DELAY);
  };

  // Close on outside click, route change and when an overlay takes over.
  useEffect(() => {
    if (!active) return;
    const onDown = (e: PointerEvent) => {
      if (header.current && !header.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const key = active;
        close();
        returningFocus.current = true;
        triggers.current[key]?.focus();
        returningFocus.current = false;
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [active, close]);

  // A new route or an overlay taking over closes the mega menu.
  const routeKey = `${pathname}|${overlay ?? ""}`;
  const [lastRouteKey, setLastRouteKey] = useState(routeKey);
  if (routeKey !== lastRouteKey) {
    setLastRouteKey(routeKey);
    setActive(null);
  }

  useEffect(() => () => clearTimers(), []);

  const onTriggerKey = (e: ReactKeyboardEvent<HTMLAnchorElement>, key: MenuKey) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(key);
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>(`#mega-${key} a`)?.focus(),
      );
    }
  };

  // Leaving the header with the keyboard closes the panel.
  const onBlurCapture = (e: React.FocusEvent) => {
    if (!header.current?.contains(e.relatedTarget as Node | null)) hoverClose();
  };

  /* --------------------------------------------------- shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      const typing = target?.closest("input, textarea, select, [contenteditable]");
      if ((e.key === "/" && !typing) || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        openOverlay("search");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openOverlay]);

  const transparent = isHome && !scrolled && !active;
  const ink = transparent ? "text-white" : "text-ink";
  const activeItem = mainNav.find((n) => n.key === active);

  return (
    <>
      <header
        ref={header}
        onPointerLeave={hoverClose}
        onPointerEnter={() => window.clearTimeout(closeTimer.current)}
        onBlurCapture={onBlurCapture}
        className={`fixed inset-x-0 top-0 z-40 transition-transform duration-700 ease-luxe ${
          isHidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <a
          href="#main"
          className="sr-only z-50 bg-ink px-4 py-2 text-sm text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
        >
          Skip to content
        </a>

        <TopBar transparent={transparent} />

        <div
          className={`relative border-b transition-colors duration-700 ease-luxe ${
            transparent ? "border-transparent bg-transparent" : scrolled || active ? "border-line bg-white" : "border-transparent bg-white"
          }`}
        >
          {/* Soft scrim keeps white type legible over bright video frames. */}
          {transparent ? (
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-32 -translate-y-8 bg-linear-to-b from-ink/40 to-transparent" />
          ) : null}

          <div className="shell relative flex h-16 items-center gap-6 lg:h-20">
            <button
              type="button"
              onClick={() => openOverlay("menu")}
              aria-label="Open menu"
              aria-haspopup="dialog"
              className={`-ml-2 relative hit-area flex size-10 items-center justify-center lg:hidden ${ink}`}
            >
              <MenuIcon className="size-6" />
            </button>

            <Logo compact tone={transparent ? "light" : "ink"} className="max-lg:absolute max-lg:left-1/2 max-lg:-translate-x-1/2" />

            <nav aria-label="Main" className="ml-12 hidden h-full lg:block xl:ml-16">
              <ul className="flex h-full items-center gap-8 xl:gap-10">
                {mainNav.map((item) => {
                  const isActive = active === item.key;
                  const isCurrent = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.key} className="flex h-full items-center" onPointerEnter={() => hoverOpen(item.key)}>
                      <Link
                        ref={(el) => {
                          triggers.current[item.key] = el;
                        }}
                        href={item.href}
                        aria-haspopup="true"
                        aria-expanded={isActive}
                        aria-controls={`mega-${item.key}`}
                        aria-current={isCurrent ? "page" : undefined}
                        onFocus={() => {
                          if (returningFocus.current) return;
                          clearTimers();
                          setActive(item.key);
                        }}
                        onKeyDown={(e) => onTriggerKey(e, item.key)}
                        className={`relative flex h-full items-center eyebrow transition-colors duration-500 ${ink} hover:text-gold-deep ${
                          transparent ? "hover:text-gold-pale" : ""
                        }`}
                      >
                        {item.label}
                        <span
                          aria-hidden="true"
                          className={`absolute inset-x-0 bottom-0 h-px origin-left bg-gold transition-transform duration-700 ease-luxe ${
                            isActive || isCurrent ? "scale-x-100" : "scale-x-0"
                          }`}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className={`ml-auto flex items-center gap-1 md:gap-2 ${ink}`}>
              <button
                type="button"
                onClick={() => openOverlay("search")}
                aria-label="Search (press / )"
                aria-haspopup="dialog"
                className="relative hit-area flex size-10 items-center justify-center transition-colors duration-500 hover:text-gold-deep"
              >
                <SearchIcon className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => openOverlay("wishlist")}
                aria-label={savedCount ? `Wishlist, ${savedCount} saved` : "Wishlist, empty"}
                aria-haspopup="dialog"
                className="relative hit-area flex size-10 items-center justify-center transition-colors duration-500 hover:text-gold-deep"
              >
                <HeartIcon className="size-5" />
                {savedCount ? (
                  <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-gold text-micro font-medium leading-none text-white figures">
                    {savedCount}
                  </span>
                ) : null}
              </button>
              <Link
                href="/account"
                aria-label="My account"
                className="hidden size-10 items-center justify-center transition-colors duration-500 hover:text-gold-deep md:flex"
              >
                <UserIcon className="size-5" />
              </Link>
              <button
                type="button"
                onClick={() => openOverlay("bag")}
                aria-label={count ? `Bag, ${count} ${count === 1 ? "piece" : "pieces"}` : "Bag, empty"}
                aria-haspopup="dialog"
                className="relative -mr-2 hit-area flex size-10 items-center justify-center transition-colors duration-500 hover:text-gold-deep lg:mr-0"
              >
                <BagIcon className="size-5" />
                {count ? (
                  <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-gold text-micro font-medium leading-none text-white figures">
                    {count}
                  </span>
                ) : null}
              </button>
              <div className="ml-4 hidden lg:block">
                <Button href="/book-a-visit" variant={transparent ? "outline-light" : "primary"} magnetic={false}>
                  Book a Visit
                </Button>
              </div>
            </div>
          </div>

          {/* Mega menu panel */}
          <div
            className={`absolute inset-x-0 top-full hidden border-b border-line bg-white shadow-soft transition-[opacity,clip-path] duration-700 ease-luxe lg:block ${
              activeItem ? "visible opacity-100" : "invisible opacity-0"
            }`}
            style={{ clipPath: activeItem ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}
          >
            {activeItem ? <MegaMenu key={activeItem.key} id={`mega-${activeItem.key}`} item={activeItem} onNavigate={close} /> : null}
          </div>
        </div>
      </header>

      {/* Dim the page under an open mega menu. */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-30 hidden bg-ink/20 transition-opacity duration-700 ease-luxe lg:block ${
          active ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Fixed header offset everywhere except the full-bleed home hero. */}
      {isHome ? null : <div aria-hidden="true" className="h-24 lg:h-28" />}
    </>
  );
}
