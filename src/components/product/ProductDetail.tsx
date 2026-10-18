"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { categoryBySlug, collectionBySlug } from "@/data/collections";
import type { Product } from "@/data/products";
import { site } from "@/data/site";
import { productPath, useOrigin, useProductEnquiry } from "@/lib/enquiry";
import { formatGrams, formatINR } from "@/lib/format";
import { GST_RATE, priceFor } from "@/lib/pricing";
import { tryOnFor } from "@/data/tryon";
import { isOnline } from "@/lib/bag";
import { useCart, useRates, useToast, useUI } from "@/store";
import { useRateInfo } from "../layout/useRateInfo";
import Accordion from "../ui/Accordion";
import AhsAssurance from "../ui/AhsAssurance";
import Button from "../ui/Button";
import { BagIcon, CalendarIcon, ShareIcon, SparkleIcon, WhatsAppIcon } from "../ui/Icons";
import RevealText from "../ui/RevealText";
import ProductValueLockup from "../ui/ProductValueLockup";
import WishlistButton from "../ui/WishlistButton";

export default function ProductDetail({ product }: { product: Product }) {
  const rates = useRates((s) => s.rates);
  const { updated } = useRateInfo();
  const enquire = useProductEnquiry(product);
  const origin = useOrigin();
  const add = useCart((s) => s.add);
  const openOverlay = useUI((s) => s.open);
  const show = useToast((s) => s.show);
  const online = isOnline(product);
  const tryOn = tryOnFor(product);
  const addToBag = () => {
    add(product.slug);
    openOverlay("bag");
  };
  const collection = collectionBySlug(product.collection);
  const category = categoryBySlug(product.category);
  const cta = useRef<HTMLDivElement>(null);
  const [ctaVisible, setCtaVisible] = useState(true);

  const rate = rates[product.purity];
  const gold = product.weight * rate;
  const making = gold * product.making;
  const stones = product.stones?.value ?? 0;
  const gst = (gold + making + stones) * GST_RATE;
  const total = priceFor(product, rates);

  // The phone enquiry bar appears once the main buttons have scrolled away.
  useEffect(() => {
    const node = cta.current;
    if (!node) return;
    const io = new IntersectionObserver(([e]) => setCtaVisible(e.isIntersecting || e.boundingClientRect.top > 0), { threshold: 0 });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const share = async () => {
    const url = `${origin}${productPath(product)}`;
    const data = { title: `${product.name} | ${site.name}`, text: `${product.name} (${product.code}) at ${site.name}`, url };
    try {
      if (navigator.share && navigator.canShare?.(data)) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      show({ title: "Link copied", body: "Paste it into a message to share this piece." });
    } catch (err) {
      if ((err as Error).name !== "AbortError") show({ title: "Could not share", body: url });
    }
  };

  const rows: [string, string][] = [
    ["Product code", product.code],
    ["Collection", collection?.name ?? ""],
    ["Category", category?.name ?? ""],
    ["Metal", `${product.purity} ${product.metal.toLowerCase()}`],
    ["Gross weight", formatGrams(product.weight)],
    ...(product.stones ? ([["Stones", product.stones.label]] as [string, string][]) : []),
    ["Hallmark", "BIS mark, purity grade and six-digit HUID"],
  ];

  return (
    <div>
      <p className="eyebrow text-gold-deep">
        <Link href={`/collections/${product.collection}`} className="link-draw">
          {collection?.name}
        </Link>
        <span className="text-stone"> · {category?.name}</span>
      </p>
      <RevealText as="h1" immediate delay={0.15} className="mt-4 font-serif text-4xl font-light tracking-tight text-ink md:text-5xl">
        {product.name}
      </RevealText>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone">
        <span className="tracking-wide">{product.code}</span>
        <span aria-hidden="true">·</span>
        <span>{product.purity} {product.metal.toLowerCase()}</span>
        <span aria-hidden="true">·</span>
        <span>{formatGrams(product.weight)} gross</span>
      </p>

      <ProductValueLockup product={product} className="mt-8" />
      <p className="mt-3 text-xs text-stone">At today’s {product.purity} rate of {formatINR(rate)}/g{updated ? `, updated ${updated.time}` : ""}.</p>

      <p className="mt-8 text-ink-soft">{product.description}</p>

      {online ? (
        <p className="mt-6 flex items-center gap-3 text-sm text-ink-soft">
          <span aria-hidden="true" className="size-2 rounded-full bg-gold" />
          Available online, sent insured or collected from the showroom.
        </p>
      ) : null}

      {/* Actions */}
      <div ref={cta} className="mt-10 flex flex-col gap-3">
        {online ? (
          <Button onClick={addToBag} size="lg" className="w-full" icon={<BagIcon className="size-4" />}>
            Add to bag
          </Button>
        ) : (
          <Button {...enquire} external size="lg" className="w-full" icon={<WhatsAppIcon className="size-4" />}>
            Enquire on WhatsApp
          </Button>
        )}
        {online ? (
          <Button {...enquire} external variant="secondary" magnetic={false} className="w-full" icon={<WhatsAppIcon className="size-4" />}>
            Ask about it on WhatsApp
          </Button>
        ) : (
          <Button href={`/book-a-visit?piece=${product.slug}`} variant="secondary" magnetic={false} className="w-full" icon={<CalendarIcon className="size-4" />}>
            Book a visit to see it
          </Button>
        )}
        {/* Quiet actions: never louder than the two buttons above. */}
        <div className="mt-1 flex flex-wrap items-center gap-x-8 border-t border-line">
          {tryOn ? (
            <Link href={`/try-on?piece=${tryOn.id}`} className="group inline-flex h-12 items-center gap-2 eyebrow text-ink hover:text-gold-deep">
              <SparkleIcon className="size-4" />
              <span className="link-draw">{tryOn.productSlug === product.slug ? "Try it on" : "Try a similar piece"}</span>
            </Link>
          ) : null}
          {online ? (
            <Link href={`/book-a-visit?piece=${product.slug}`} className="group inline-flex h-12 items-center gap-2 eyebrow text-ink hover:text-gold-deep">
              <CalendarIcon className="size-4" />
              <span className="link-draw">See it in store</span>
            </Link>
          ) : null}
          <WishlistButton product={product} variant="text" />
          <button type="button" onClick={share} className="group inline-flex h-12 items-center gap-2 eyebrow text-ink hover:text-gold-deep">
            <ShareIcon className="size-4" />
            <span className="link-draw">Share</span>
          </button>
        </div>
      </div>

      {/* Price breakdown */}
      <section aria-labelledby="breakdown" className="mt-12 border border-line bg-ivory p-6 md:p-8">
        <h2 id="breakdown" className="eyebrow text-gold-deep">
          Price breakdown
        </h2>
        <dl className="mt-6 flex flex-col gap-3 text-sm figures">
          <div className="flex justify-between gap-6">
            <dt className="text-ink-soft">
              Gold value
              <span className="block text-xs text-stone">
                {formatGrams(product.weight)} × {formatINR(rate)}/g ({product.purity})
              </span>
            </dt>
            <dd className="text-ink">{formatINR(gold)}</dd>
          </div>
          <div className="flex justify-between gap-6">
            <dt className="text-ink-soft">
              Making charges
              <span className="block text-xs text-stone">{Math.round(product.making * 100)}% of gold value</span>
            </dt>
            <dd className="text-ink">{formatINR(making)}</dd>
          </div>
          {stones ? (
            <div className="flex justify-between gap-6">
              <dt className="text-ink-soft">
                Stones
                <span className="block text-xs text-stone">{product.stones?.label}</span>
              </dt>
              <dd className="text-ink">{formatINR(stones)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-6">
            <dt className="text-ink-soft">GST ({Math.round(GST_RATE * 100)}%)</dt>
            <dd className="text-ink">{formatINR(gst)}</dd>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-line-strong pt-4">
            <dt className="eyebrow whitespace-nowrap text-ink">Total today</dt>
            <dd className="font-serif text-3xl text-ink figures">{formatINR(total)}</dd>
          </div>
        </dl>
        <p className="mt-5 text-xs leading-relaxed text-stone">
          {online
            ? "At today’s rate. Bought online, the price is fixed the moment you pay, and the weight and HUID are printed on your invoice."
            : "An estimate at today’s rate. The final price is confirmed in store on the day you buy, after the piece is weighed in front of you."}
        </p>
      </section>

      <AhsAssurance className="mt-6" />

      <Accordion
        className="mt-12"
        defaultOpen={0}
        items={[
          {
            title: "Details",
            content: (
              <dl className="flex flex-col">
                {rows.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 border-b border-line py-2 last:border-b-0">
                    <dt className="text-stone">{k}</dt>
                    <dd className="text-right text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            ),
          },
          {
            title: "Purity and Hallmarking",
            content: (
              <>
                <p>
                  This piece is {product.purity} gold ({product.purity === "24K" ? "99.9" : product.purity === "22K" ? "91.6" : "75"}%
                  pure) and carries the BIS hallmark: the BIS mark, its purity grade and a unique six-digit HUID. You can
                  check the HUID yourself on the BIS CARE app.
                </p>
                <Link href="/hallmarking" className="link-line mt-3 inline-block text-ink">
                  How to read a hallmark
                </Link>
              </>
            ),
          },
          {
            title: "Care",
            content: (
              <p>
                Put gold on last and take it off first: after perfume, before the gym. Store pieces separately in the
                pouch they came in. Kundan and polki should be wiped with a soft dry cloth, never washed. We clean and
                polish anything bought here free of charge, for life.
              </p>
            ),
          },
          {
            title: "Exchange and Buyback",
            content: (
              <>
                <p>
                  Exchange this piece at any time for its full gold value at the day’s rate, less only the making
                  charge. For cash buyback we pay the gold value less 2%. Stones are valued separately. (Sample terms for
                  the prototype.)
                </p>
                <Link href="/exchange" className="link-line mt-3 inline-block text-ink">
                  Old gold exchange
                </Link>
              </>
            ),
          },
        ]}
      />

      {/* Phone: sticky enquiry bar */}
      <div
        aria-hidden={ctaVisible}
        className={`foot-offset fixed inset-x-0 z-30 border-t border-line bg-white/95 backdrop-blur-sm transition-transform duration-500 ease-luxe md:hidden ${
          ctaVisible ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="shell flex items-center gap-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-lg text-ink">{product.name}</p>
            <p className="text-xs text-stone figures">≈ {formatINR(total)}</p>
          </div>
          {online ? (
            <button
              type="button"
              onClick={addToBag}
              tabIndex={ctaVisible ? -1 : 0}
              className="flex h-12 shrink-0 items-center gap-2 bg-ink px-5 eyebrow text-white"
            >
              <BagIcon className="size-4" />
              Add to bag
            </button>
          ) : (
            <a
              {...enquire}
              tabIndex={ctaVisible ? -1 : 0}
              className="flex h-12 shrink-0 items-center gap-2 bg-ink px-5 eyebrow text-white"
            >
              <WhatsAppIcon className="size-4" />
              Enquire
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
