"use client";

import Link from "next/link";
import { useEffect } from "react";
import { collectionBySlug } from "@/data/collections";
import { images } from "@/data/media";
import type { Product } from "@/data/products";
import { pieceImage, useLiveProduct, useProductsReady, useVisibleProducts } from "@/lib/pieces";
import Button from "../ui/Button";
import ProductCard from "../ui/ProductCard";
import SectionHeading from "../ui/SectionHeading";
import TextLink from "../ui/TextLink";
import type { GalleryItem } from "./Lightbox";
import ProductDetail from "./ProductDetail";
import ProductCloseUp from "./ProductCloseUp";
import ProductGallery from "./ProductGallery";

/** The piece first, then its collection’s styled photographs for context. */
function galleryFor(p: Product): GalleryItem[] {
  const c = collectionBySlug(p.collection);
  const items: GalleryItem[] = p.images.map((_, i) => ({ ...pieceImage(p, i), label: i === 0 ? "The piece" : "Detail" }));
  for (const key of [c?.cover, c?.detail]) {
    if (!key) continue;
    const img = images[key];
    if (!items.some((it) => it.src === img.src) && items.length < 4) items.push({ src: img.src, alt: img.alt, label: "Styled" });
  }
  return items;
}

/**
 * Product page body. Reads the live piece from the store, so admin edits show at
 * once and pieces added in the admin panel get a page too. `seed` is the
 * build-time copy used for the server render.
 */
export default function ProductView({ slug, seed }: { slug: string; seed?: Product }) {
  const ready = useProductsReady();
  const product = useLiveProduct(slug, seed);
  const visible = useVisibleProducts();

  // Pieces added in the admin panel are unknown at build time; give the tab its proper title.
  const title = product && !product.hidden ? `${product.name} (${product.code}) | AHS Jewellers` : null;
  useEffect(() => {
    if (title && !seed) document.title = title;
  }, [title, seed]);

  if (!product || product.hidden) {
    // Before hydration an admin-added piece is unknown to the server: show a quiet loading state.
    if (!ready) return <div className="shell pb-32 pt-16"><div className="skeleton aspect-landscape w-full" aria-label="Loading this piece" /></div>;
    return (
      <section className="bg-white">
        <div className="shell mx-auto max-w-prose py-32 text-center">
          <p className="eyebrow text-gold-deep">No longer shown</p>
          <h1 className="mt-6 display-page text-ink">This piece is not on display at the moment.</h1>
          <p className="mt-6 text-ink-soft">It may have found its owner, or be away being photographed. Ask us and we will tell you where it is.</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
            <Button href="/collections" arrow>
              Explore collections
            </Button>
            <TextLink href="/contact">Ask us</TextLink>
          </div>
        </div>
      </section>
    );
  }

  const collection = collectionBySlug(product.collection);
  const same = visible.filter((x) => x.slug !== product.slug && x.collection === product.collection);
  const cat = visible.filter((x) => x.slug !== product.slug && x.collection !== product.collection && x.category === product.category);
  const related = [...cat.slice(0, 1), ...same].slice(0, 4);

  return (
    <>
      <section className="bg-white pb-20 pt-6 md:pb-32 md:pt-10">
        <div className="shell">
          <nav aria-label="Breadcrumb" className="mb-6 md:mb-10">
            <ol className="flex flex-wrap items-center gap-2 text-xs text-stone">
              <li>
                <Link href="/" className="link-draw hover:text-ink">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/collections" className="link-draw hover:text-ink">
                  Collections
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/collections/${product.collection}`} className="link-draw hover:text-ink">
                  {collection?.name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink">
                {product.name}
              </li>
            </ol>
          </nav>
        </div>
        <div className="md:shell grid gap-10 md:grid-cols-12 lg:gap-12">
          <div className="md:col-span-7 lg:col-span-8">
            <div className="md:sticky md:top-28">
              <ProductGallery items={galleryFor(product)} title={product.name} />
            </div>
          </div>
          <div className="px-5 md:col-span-5 md:px-0 lg:col-span-4">
            <ProductDetail product={product} />
          </div>
        </div>
      </section>

      <ProductCloseUp product={product} />

      {related.length ? (
        <section aria-labelledby="related" className="border-t border-line bg-ivory section-y">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading id="related" eyebrow="You may also like" title={`More from ${collection?.name}`} size="md" />
              <TextLink href={`/collections/${product.collection}`}>The full collection</TextLink>
            </div>
            <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-8">
              {related.map((p) => (
                <li key={p.slug}>
                  <ProductCard product={p} sizes="(min-width: 768px) 23vw, 46vw" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
