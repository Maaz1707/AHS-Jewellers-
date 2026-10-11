"use client";

import { useState } from "react";
import { formatINR } from "@/lib/format";
import { useHydrated } from "@/lib/motion";
import { priceFor } from "@/lib/pricing";
import { useRates, useToast, useWishlist } from "@/store";
import { useWishlistEnquiry, useWishlistItems } from "../layout/WishlistDrawer";
import Button from "../ui/Button";
import { HeartIcon, WhatsAppIcon } from "../ui/Icons";
import Modal from "../ui/Modal";
import ProductCard from "../ui/ProductCard";
import Price from "../ui/Price";

export default function WishlistPage() {
  const hydrated = useHydrated();
  const list = useWishlistItems();
  const enquire = useWishlistEnquiry();
  const clear = useWishlist((s) => s.clear);
  const show = useToast((s) => s.show);
  const rates = useRates((s) => s.rates);
  const [confirming, setConfirming] = useState(false);

  if (!hydrated) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Loading your wishlist">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i}>
            <div className="skeleton aspect-portrait" />
            <div className="skeleton mt-5 h-5 w-40" />
          </div>
        ))}
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="mx-auto max-w-prose py-16 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full border border-line text-gold-deep">
          <HeartIcon className="size-6" />
        </span>
        <p className="mt-8 font-serif text-3xl font-light text-ink">Your wishlist is waiting for its first piece.</p>
        <p className="mt-4 text-stone">
          Tap the heart on any piece to keep it here. It stays on this device, ready to share with family or bring to the
          showroom.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
          <Button href="/collections" arrow>
            Explore collections
          </Button>
          <Button href="/collections/bridal" variant="secondary">
            Start with Bridal
          </Button>
        </div>
      </div>
    );
  }

  const total = list.reduce((sum, p) => sum + priceFor(p, rates), 0);

  return (
    <>
      <div className="flex flex-col gap-6 border-y border-line py-6 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-stone">
          <span className="text-ink">
            {list.length} {list.length === 1 ? "piece" : "pieces"}
          </span>{" "}
          · together about <span className="text-ink figures">{formatINR(total)}</span> at today’s rate
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button href={enquire.href} external onClick={enquire.onClick} icon={<WhatsAppIcon className="size-4" />}>
            Enquire about all on WhatsApp
          </Button>
          <Button href={`/book-a-visit?piece=${list[0].slug}`} variant="secondary" magnetic={false}>
            Book a visit to see them
          </Button>
          <button type="button" onClick={() => setConfirming(true)} className="eyebrow text-stone hover:text-ink">
            <span className="link-draw">Clear all</span>
          </button>
        </div>
      </div>

      <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-8 xl:grid-cols-4 xl:gap-x-10">
        {list.map((p) => (
          <li key={p.slug} className="[animation:menu-in_0.6s_var(--ease-luxe)]">
            <ProductCard product={p} sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw" />
          </li>
        ))}
      </ul>

      <Modal open={confirming} onClose={() => setConfirming(false)} eyebrow="Wishlist" title="Clear your wishlist?">
        <p className="text-ink-soft">
          This removes all {list.length} pieces from this device. It cannot be undone, though you can always save them again.
        </p>
        <ul className="mt-6 flex flex-col gap-2 text-sm">
          {list.slice(0, 4).map((p) => (
            <li key={p.slug} className="flex justify-between gap-4 border-b border-line pb-2">
              <span className="text-ink">{p.name}</span>
              <Price product={p} className="text-stone" />
            </li>
          ))}
          {list.length > 4 ? <li className="text-stone">and {list.length - 4} more</li> : null}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button
            onClick={() => {
              clear();
              setConfirming(false);
              show({ title: "Wishlist cleared" });
            }}
          >
            Clear wishlist
          </Button>
          <button type="button" onClick={() => setConfirming(false)} className="eyebrow text-stone hover:text-ink">
            <span className="link-draw">Keep them</span>
          </button>
        </div>
      </Modal>
    </>
  );
}
