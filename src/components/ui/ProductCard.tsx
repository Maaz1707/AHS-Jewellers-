"use client";

import Image from "@/components/ui/Img";
import Link from "next/link";
import { useRef } from "react";
import { collectionBySlug } from "@/data/collections";
import { useTilt } from "@/lib/useTilt";
import { pieceImage } from "@/lib/pieces";
import type { Product } from "@/data/products";
import { productPath, useProductEnquiry } from "@/lib/enquiry";
import { WhatsAppIcon } from "./Icons";
import ProductValueLockup from "./ProductValueLockup";
import { OnlineTag } from "./Tags";
import WishlistButton from "./WishlistButton";

type Props = {
  product: Product;
  sizes?: string;
  /** Frame shape. Editorial grids mix these. */
  frame?: "portrait" | "tall" | "square";
  priority?: boolean;
  className?: string;
  /** Show the collection label above the name (off inside a single collection). */
  showCollection?: boolean;
};

const frames = {
  portrait: "aspect-portrait",
  tall: "aspect-slim",
  square: "aspect-square",
};

export default function ProductCard({
  product,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  frame = "portrait",
  priority,
  className = "",
  showCollection = true,
}: Props) {
  const enquire = useProductEnquiry(product);
  const primary = pieceImage(product, 0);
  const collection = collectionBySlug(product.collection);
  const href = productPath(product);
  const tilt = useRef<HTMLDivElement>(null);
  useTilt(tilt);

  return (
    <article className={`group relative ${className}`}>
      <div ref={tilt} className={`product-stage relative overflow-hidden ${frames[frame]}`}>
        <Link href={href} className="absolute inset-0 block" aria-label={`${product.name}, ${product.code}`}>
          {/* One soft tone under every photograph: whites take on the ivory, so mixed sources sit together. */}
          <Image
            src={primary.src}
            alt={primary.alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-[1.04]"
          />
        </Link>

        {product.online ? <OnlineTag className="pointer-events-none absolute left-3 top-3" /> : null}
        <WishlistButton product={product} className="absolute right-3 top-3" />

        {/* Hover and keyboard focus: purity, weight and a quiet enquiry, on larger screens. */}
        <div className="absolute inset-x-3 bottom-3 hidden translate-y-4 items-center justify-between gap-4 bg-white/95 px-4 py-3 opacity-0 backdrop-blur-sm transition-[opacity,transform] duration-700 ease-luxe group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 md:flex">
          <span className="text-sm text-ink-soft figures">{product.purity} · {product.weight} g</span>
          <a {...enquire} aria-label={`Enquire about ${product.name} on WhatsApp`} className="inline-flex items-center gap-2 eyebrow text-ink hover:text-gold-deep">
            <WhatsAppIcon className="size-4" />
            <span className="link-draw">Enquire</span>
          </a>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-1">
        {showCollection ? <p className="eyebrow text-gold-deep">{collection?.name}</p> : null}
        <h3 className="font-serif text-xl leading-snug text-ink">
          <Link href={href} className="link-draw">
            {product.name}
          </Link>
        </h3>
        <p className="text-xs tracking-wide text-stone">{product.code}</p>
        <ProductValueLockup product={product} className="mt-3" />
      </div>
    </article>
  );
}
