"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site, whatsappLink } from "@/data/site";
import { generalMessage, useOrigin } from "@/lib/enquiry";
import { useEnquiries, useUI } from "@/store";
import { WhatsAppIcon } from "../ui/Icons";

/**
 * Sitewide WhatsApp button with a general pre-typed message. It waits until the
 * visitor has scrolled a little, steps aside while overlays are open, and on
 * phones gives way to the product page’s own sticky enquiry bar.
 */
export default function FloatingWhatsApp() {
  const pathname = usePathname();
  const overlay = useUI((s) => s.overlay);
  const addEnquiry = useEnquiries((s) => s.addEnquiry);
  const origin = useOrigin();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Pages with their own sticky action bar on phones keep the bottom edge for it.
  const onProduct = pathname.startsWith("/jewellery/") || pathname === "/bag" || pathname === "/checkout";
  const visible = shown && !overlay;

  return (
    <a
      href={whatsappLink(generalMessage)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => addEnquiry({ type: "general", channel: "whatsapp", pageUrl: `${origin}${pathname}` })}
      aria-label={`Chat with ${site.name} on WhatsApp`}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`group fab-offset fixed z-30 flex h-14 items-center gap-3 rounded-full bg-ink pl-4 pr-4 text-white shadow-panel transition-[opacity,transform,padding] duration-700 ease-luxe hover:pr-6 focus-visible:pr-6 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      } ${onProduct ? "max-md:hidden" : ""}`}
    >
      <WhatsAppIcon className="size-6 shrink-0 text-gold-pale" />
      <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-700 ease-luxe group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]">
        <span className="overflow-hidden whitespace-nowrap eyebrow">Chat with us</span>
      </span>
    </a>
  );
}
