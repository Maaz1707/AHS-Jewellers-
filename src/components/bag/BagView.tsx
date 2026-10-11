"use client";

import Image from "@/components/ui/Img";
import Link from "next/link";
import { collectionBySlug } from "@/data/collections";
import { commerceTerms } from "@/data/site";
import { isOnline, useBag } from "@/lib/bag";
import { productPath } from "@/lib/enquiry";
import { formatGrams, formatINR } from "@/lib/format";
import { useHydrated } from "@/lib/motion";
import { pieceImage, useVisibleProducts } from "@/lib/pieces";
import { useCart, useToast, useWishlist } from "@/store";
import { useRateInfo } from "../layout/useRateInfo";
import { Unavailable } from "../layout/BagDrawer";
import Button from "../ui/Button";
import { BagIcon } from "../ui/Icons";
import ProductCard from "../ui/ProductCard";
import PriceSummary from "./PriceSummary";
import QtyStepper from "./QtyStepper";

export default function BagView() {
  const hydrated = useHydrated();
  const bag = useBag();
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const toggleWish = useWishlist((s) => s.toggle);
  const hasWish = useWishlist((s) => s.has);
  const show = useToast((s) => s.show);
  const { rates, updated } = useRateInfo();
  const online = useVisibleProducts().filter(isOnline);

  if (!hydrated) {
    return (
      <div className="grid gap-12 lg:grid-cols-12" aria-busy="true" aria-label="Loading your bag">
        <div className="flex flex-col gap-6 lg:col-span-7">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-6">
              <div className="skeleton size-32 shrink-0" />
              <div className="flex-1">
                <div className="skeleton h-6 w-48" />
                <div className="skeleton mt-3 h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
        <div className="skeleton h-96 lg:col-span-4 lg:col-start-9" />
      </div>
    );
  }

  if (!bag.lines.length) {
    return (
      <div>
        <div className="mx-auto max-w-prose py-12 text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full border border-line text-gold-deep">
            <BagIcon className="size-6" />
          </span>
          <p className="mt-8 font-serif text-3xl font-light text-ink">Nothing in your bag yet.</p>
          <p className="mt-4 text-stone">
            Gold coins and selected lighter pieces can be bought here and sent to you, insured. Everything else is best seen
            in person, and we are happy to keep it ready for you.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <Button href="/collections?online=1" arrow>
              See everything available online
            </Button>
            <Button href="/book-a-visit" variant="secondary" magnetic={false}>
              Book a visit
            </Button>
          </div>
        </div>
        {bag.unavailable.length ? (
          <div className="mx-auto max-w-prose">
            <Unavailable items={bag.unavailable} onRemove={remove} />
          </div>
        ) : null}
        {online.length ? (
          <section aria-labelledby="online-title" className="mt-16 border-t border-line pt-16">
            <h2 id="online-title" className="eyebrow text-gold-deep">
              Available online
            </h2>
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-8">
              {online.slice(0, 4).map((p) => (
                <li key={p.slug}>
                  <ProductCard product={p} sizes="(min-width: 768px) 22vw, 46vw" />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    );
  }

  const overLimit = bag.subtotal > commerceTerms.onlineLimit;

  return (
    <div className="grid gap-12 pb-24 md:pb-0 lg:grid-cols-12 lg:gap-10">
      {/* Phones: total and checkout always within reach of the thumb. */}
      <div className="foot-offset fixed inset-x-0 z-30 border-t border-line bg-white/95 backdrop-blur-sm md:hidden">
        <div className="shell flex items-center gap-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-stone">
              {bag.count} {bag.count === 1 ? "piece" : "pieces"} · total
            </p>
            <p className="font-serif text-2xl text-ink figures">{formatINR(bag.subtotal)}</p>
          </div>
          {overLimit ? (
            <Button href="/book-a-visit" magnetic={false}>
              Book a visit
            </Button>
          ) : (
            <Button href="/checkout" magnetic={false} arrow>
              Checkout
            </Button>
          )}
        </div>
      </div>
      <div className="lg:col-span-7">
        <ul className="border-t border-line">
          {bag.lines.map(({ item, product, unit }) => {
            const img = pieceImage(product);
            const wished = hasWish(product.slug);
            return (
              <li key={item.slug} className="flex gap-5 border-b border-line py-6 md:gap-8">
                <Link href={productPath(product)} className="group relative block size-24 shrink-0 overflow-hidden bg-ivory md:size-32">
                  <Image src={img.src} alt={img.alt} fill sizes="128px" className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-105" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:justify-between md:gap-6">
                  <div className="min-w-0">
                    <p className="eyebrow text-gold-deep">{collectionBySlug(product.collection)?.name}</p>
                    <Link href={productPath(product)} className="mt-1 block font-serif text-2xl leading-snug text-ink hover:text-gold-deep">
                      {product.name}
                    </Link>
                    <p className="mt-1 text-xs text-stone">
                      {product.code} · {product.purity} {product.metal.toLowerCase()} · {formatGrams(product.weight)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-6 text-xs text-stone">
                      <button type="button" onClick={() => remove(item.slug)} className="inline-flex h-12 items-center underline-offset-4 hover:text-ink hover:underline">
                        Remove
                      </button>
                      {!wished ? (
                        <button
                          type="button"
                          onClick={() => {
                            toggleWish(product.slug);
                            remove(item.slug);
                            show({ title: "Moved to your wishlist", body: product.name, action: { label: "View wishlist", href: "/wishlist" } });
                          }}
                          className="inline-flex h-12 items-center underline-offset-4 hover:text-ink hover:underline"
                        >
                          Move to wishlist
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:justify-start">
                    <QtyStepper qty={item.qty} name={product.name} onChange={(n) => setQty(item.slug, n)} />
                    <p className="text-right figures">
                      <span className="block font-serif text-xl text-ink">{formatINR(unit * item.qty)}</span>
                      {item.qty > 1 ? <span className="block text-xs text-stone">{formatINR(unit)} each</span> : null}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {bag.unavailable.length ? <Unavailable items={bag.unavailable} onRemove={remove} /> : null}
        <ul className="mt-10 grid gap-6 text-sm text-ink-soft sm:grid-cols-3">
          {[
            ["Insured to your door", "Sent fully insured and handed over only against a signature. Or collect it from the showroom."],
            ["Hallmarked and weighed", "Every gold piece is BIS hallmarked. Its HUID and weight are printed on your invoice."],
            ["Prices follow the rate", "Your price is set at today’s rate and fixed the moment you pay."],
          ].map(([t, b]) => (
            <li key={t} className="border-t border-gold pt-4">
              <p className="font-serif text-xl text-ink">{t}</p>
              <p className="mt-2">{b}</p>
            </li>
          ))}
        </ul>
      </div>

      <aside className="lg:col-span-4 lg:col-start-9" aria-labelledby="summary-title">
        <div className="border border-line bg-ivory p-6 md:p-8 lg:sticky lg:top-32">
          <h2 id="summary-title" className="eyebrow text-gold-deep">
            Price breakdown
          </h2>
          <div className="mt-6">
            <PriceSummary
              gold={bag.gold}
              making={bag.making}
              stones={bag.stones}
              gst={bag.gst}
              subtotal={bag.subtotal}
              weight={bag.weight}
              note={
                <p>
                  Today’s rates: 24K {formatINR(rates["24K"])}/g · 22K {formatINR(rates["22K"])}/g · 18K {formatINR(rates["18K"])}/g
                  {updated ? `, updated ${updated.time}` : ""}.
                </p>
              }
            />
          </div>
          {overLimit ? (
            <p className="mt-6 border-l-2 border-gold bg-white p-4 text-sm text-ink-soft">
              Online orders are limited to {formatINR(commerceTerms.onlineLimit)}. For a larger order, book a visit and we will
              have everything ready for you.
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3">
            {overLimit ? (
              <Button href="/book-a-visit" size="lg" arrow className="w-full">
                Book a visit
              </Button>
            ) : (
              <Button href="/checkout" size="lg" arrow className="w-full">
                Checkout
              </Button>
            )}
            <Link href="/collections?online=1" className="self-center py-2 eyebrow text-ink hover:text-gold-deep">
              <span className="link-draw">Continue shopping</span>
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
