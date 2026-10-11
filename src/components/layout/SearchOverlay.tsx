"use client";

import Image from "@/components/ui/Img";
import Link from "next/link";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { categories, collectionBySlug, categoryBySlug } from "@/data/collections";
import { pieceImage, useVisibleProducts } from "@/lib/pieces";
import type { Product } from "@/data/products";
import { whatsappLink } from "@/data/site";
import { formatGrams } from "@/lib/format";
import { useHydrated } from "@/lib/motion";
import { useFocusTrap, useOverlayTransition } from "@/lib/overlay";
import { useUI } from "@/store";
import { ArrowRight, CloseIcon, SearchIcon } from "../ui/Icons";
import Price from "../ui/Price";
import TextLink from "../ui/TextLink";

const SUGGESTIONS = ["Jhumka", "Kada", "Solitaire", "Kundan", "Gold coin", "Chain", "AHS-BR-101"];
const LIMIT = 12;

const compact = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Every query word must appear in the product’s name, code, category, collection, purity or metal. */
export function searchProducts(all: Product[], query: string) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return all.filter((p) => {
    const haystack = [
      p.name,
      p.code,
      categoryBySlug(p.category)?.name ?? p.category,
      collectionBySlug(p.collection)?.name ?? p.collection,
      p.purity,
      p.metal,
    ]
      .join(" ")
      .toLowerCase();
    const code = compact(p.code);
    return words.every((w) => haystack.includes(w) || (compact(w).length >= 3 && code.includes(compact(w))));
  });
}

export default function SearchOverlay() {
  const open = useUI((s) => s.overlay === "search");
  const close = useUI((s) => s.close);
  const products = useVisibleProducts();
  const hydrated = useHydrated();
  const { mounted, visible } = useOverlayTransition(open, 600);
  const panel = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  useFocusTrap(panel, open, close);

  const results = useMemo(() => searchProducts(products, deferred), [products, deferred]);

  if (!hydrated || !mounted) return null;

  const hasQuery = deferred.trim().length > 0;

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Search the collection">
      <div
        aria-hidden="true"
        onClick={close}
        className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panel}
        className={`relative flex max-h-svh flex-col bg-white shadow-panel transition-[clip-path] duration-700 ease-curtain`}
        style={{ clipPath: visible ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}
      >
        <div className="shell flex items-center gap-4 border-b border-line py-5 md:py-8">
          <SearchIcon className="size-6 shrink-0 text-gold-deep" />
          <label htmlFor="site-search" className="sr-only">
            Search by name, category or product code
          </label>
          <input
            id="site-search"
            data-autofocus=""
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category or code"
            autoComplete="off"
            spellCheck={false}
            className="h-12 min-w-0 flex-1 bg-transparent font-serif text-2xl font-light text-ink outline-none placeholder:text-stone/60 focus-visible:outline-none md:text-4xl [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button type="button" onClick={() => setQuery("")} className="hidden eyebrow text-stone hover:text-ink md:block">
              Clear
            </button>
          ) : null}
          <button
            type="button"
            onClick={close}
            aria-label="Close search"
            className="-mr-2 relative hit-area flex size-10 shrink-0 items-center justify-center text-ink transition-colors hover:text-gold-deep"
          >
            <CloseIcon className="size-6" />
          </button>
        </div>

        <div className="overflow-y-auto" data-lenis-prevent="">
          <div className="shell py-8 md:py-12">
            <p className="sr-only" aria-live="polite">
              {hasQuery ? `${results.length} ${results.length === 1 ? "piece" : "pieces"} found` : ""}
            </p>

            {!hasQuery ? (
              <div className="grid gap-10 md:grid-cols-12">
                <div className="md:col-span-7">
                  <p className="eyebrow text-gold-deep">Often searched</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <li key={s}>
                        <button
                          type="button"
                          onClick={() => setQuery(s)}
                          className="border border-line px-4 py-2 text-sm text-ink-soft transition-colors duration-300 hover:border-ink hover:text-ink"
                        >
                          {s}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-5">
                  <p className="eyebrow text-gold-deep">Browse by category</p>
                  <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
                    {categories
                      .filter((c) => c.inMenu)
                      .map((c) => (
                        <li key={c.slug}>
                          <Link href={`/category/${c.slug}`} className="link-draw text-sm text-ink-soft hover:text-ink">
                            {c.name}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="mx-auto max-w-prose py-8 text-center">
                <p className="eyebrow text-gold-deep">No pieces found</p>
                <p className="mt-4 font-serif text-3xl font-light text-ink">
                  Nothing matches &ldquo;{deferred.trim()}&rdquo;
                </p>
                <p className="mt-4 text-stone">
                  Try a simpler word such as &ldquo;jhumka&rdquo; or &ldquo;chain&rdquo;, or a product code like
                  AHS-DM-203. If you have a piece in mind, send us a photo and we will find or make it.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-6">
                  <TextLink href={whatsappLink("Hello AHS Jewellers, I am looking for a piece I could not find on your website.")} external>
                    Ask on WhatsApp
                  </TextLink>
                  <button type="button" onClick={() => setQuery("")} className="eyebrow text-stone hover:text-ink">
                    Clear search
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="eyebrow text-stone">
                  {results.length > LIMIT ? `Showing ${LIMIT} of ${results.length} pieces` : `${results.length} ${results.length === 1 ? "piece" : "pieces"}`}
                </p>
                <ul className="mt-6 grid gap-x-10 md:grid-cols-2">
                  {results.slice(0, LIMIT).map((p) => {
                    const img = pieceImage(p);
                    return (
                      <li key={p.slug} className="border-b border-line">
                        <Link href={`/jewellery/${p.slug}`} className="group flex items-center gap-5 py-4">
                          <span className="relative block size-16 shrink-0 overflow-hidden bg-ivory md:size-20">
                            <Image src={img.src} alt="" fill sizes="80px" className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-110" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-serif text-xl text-ink group-hover:text-gold-deep">{p.name}</span>
                            <span className="mt-1 block text-xs text-stone">
                              {p.code} · {collectionBySlug(p.collection)?.name} · {p.purity} · {formatGrams(p.weight)}
                            </span>
                          </span>
                          <Price product={p} className="hidden text-sm text-ink sm:block" />
                          <ArrowRight className="size-4 shrink-0 text-stone transition-transform duration-500 group-hover:translate-x-1 group-hover:text-ink" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
