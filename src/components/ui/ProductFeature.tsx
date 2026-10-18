"use client";

import Link from "next/link";
import { collectionBySlug } from "@/data/collections";
import type { Product } from "@/data/products";
import { productPath, useProductEnquiry } from "@/lib/enquiry";
import { pieceImage } from "@/lib/pieces";
import { WhatsAppIcon } from "./Icons";
import Image from "./Img";
import { PetalCorner } from "./Motif";
import ProductValueLockup from "./ProductValueLockup";
import WishlistButton from "./WishlistButton";

/**
 * The large tile that breaks a collection grid every fifth piece: the piece's
 * lifestyle photograph across two columns, with one line about it.
 */
export default function ProductFeature({ product, sizes = "(min-width: 768px) 60vw, 100vw" }: { product: Product; sizes?: string }) {
  const enquire = useProductEnquiry(product);
  const img = pieceImage(product, product.images[1] ? 1 : 0);
  const line = product.description.split(/(?<=\.)\s/)[0];
  const href = productPath(product);

  return (
    <article className="group relative">
      <div className="product-stage relative aspect-landscape overflow-hidden">
        <Link href={href} className="absolute inset-0 block" aria-label={`${product.name}, ${product.code}`}>
          <Image src={img.src} alt={img.alt} fill sizes={sizes} className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-105" />
        </Link>
        <PetalCorner className="absolute left-3 top-3 size-12" tone="var(--color-gold-pale)" />
        <WishlistButton product={product} className="absolute right-3 top-3" />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-5 md:gap-8">
        <div className="md:col-span-3">
          <p className="eyebrow text-gold-deep">{collectionBySlug(product.collection)?.name} · In focus</p>
          <h3 className="mt-2 font-serif text-3xl font-light leading-snug text-ink">
            <Link href={href} className="link-draw">
              {product.name}
            </Link>
          </h3>
          <p className="mt-2 max-w-prose font-serif text-lg italic text-ink-soft">{line}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-stone md:col-span-2">
          <p className="text-right text-xs tracking-wide text-stone">{product.code}</p>
          <ProductValueLockup product={product} className="grid-cols-1 [&>div]:flex [&>div]:items-end [&>div]:justify-between" />
          <a {...enquire} className="mt-2 inline-flex items-center gap-2 eyebrow text-ink hover:text-gold-deep">
            <WhatsAppIcon className="size-4" />
            <span className="link-draw">Enquire</span>
          </a>
        </div>
      </div>
    </article>
  );
}
