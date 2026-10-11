"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CategorySlug } from "@/data/collections";
import type { Product, Purity } from "@/data/products";
import { whatsappLink } from "@/data/site";
import {
  PURITIES,
  activeFilterCount,
  applyFilters,
  emptyFilters,
  filtersToQuery,
  matches,
  metalKey,
  metalLabels,
  parseFilters,
  priceBands,
  sortLabels,
  stoneKey,
  stoneLabels,
  weightBounds,
  type Filters,
  type Group,
  type MetalKey,
  type PriceKey,
  type StoneKey,
} from "@/lib/filters";
import { formatGrams } from "@/lib/format";
import { priceFor } from "@/lib/pricing";
import { Flip } from "gsap/Flip";
import { gsap, MOTION } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useRates, useUI } from "@/store";
import { useVisibleProducts } from "@/lib/pieces";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import { CloseIcon, FilterIcon } from "../ui/Icons";
import Popover from "../ui/Popover";
import ProductCard from "../ui/ProductCard";
import ProductFeature from "../ui/ProductFeature";
import TextLink from "../ui/TextLink";
import { CheckList, FacetGroup, SortList, Toggle, WeightRange, categoryLabel, type Option } from "./FilterControls";

// Flip is only needed on listings, so it is registered here rather than sitewide.
if (typeof window !== "undefined") gsap.registerPlugin(Flip);

type Props = {
  /** Which pieces this listing covers. */
  scope: { collection?: string; category?: string };
  /** Offer the category filter (off on category pages). */
  categoryFilter?: boolean;
  /** Plural noun for the empty state, e.g. "bridal pieces". */
  noun: string;
};

/**
 * A collection or category listing.
 * Desktop: a sticky toolbar (filter toggle, count, sort) over a filter sidebar
 * of collapsible groups and the grid. Phones and tablets: Filter and Sort
 * buttons, each opening its own sheet. Every option shows how many pieces it
 * would leave, given the other filters in use; options that would leave none
 * are dimmed. Filters live in the URL (`?category=&price=&purity=&metal=&stone=&min=&max=&online=&sort=`).
 */
export default function ProductListing({ scope, categoryFilter = true, noun }: Props) {
  const all = useVisibleProducts();
  const rates = useRates((s) => s.rates);
  const pathname = usePathname();
  const params = useSearchParams();
  const overlay = useUI((s) => s.overlay);
  const openOverlay = useUI((s) => s.open);
  const closeOverlay = useUI((s) => s.close);
  const [panel, setPanel] = useState(true);
  const grid = useRef<HTMLUListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const base = useMemo(
    () => all.filter((p) => (!scope.collection || p.collection === scope.collection) && (!scope.category || p.category === scope.category)),
    [all, scope.collection, scope.category],
  );
  const categories = useMemo(() => [...new Set(base.map((p) => p.category))], [base]);
  const bounds = useMemo(() => weightBounds(base), [base]);

  const filters = useMemo(() => {
    const f = parseFilters(new URLSearchParams(params.toString()), categories);
    // Keep hand-edited URLs sensible: clamp weights into this set’s range, in order.
    const clamp = (n: number | null) => (n === null ? null : Math.min(Math.max(n, bounds.lo), bounds.hi));
    let min = clamp(f.min);
    let max = clamp(f.max);
    if (min !== null && max !== null && min > max) [min, max] = [max, min];
    return { ...f, min: min === bounds.lo ? null : min, max: max === bounds.hi ? null : max };
  }, [params, categories, bounds]);
  const results = useMemo(() => applyFilters(base, filters, rates), [base, filters, rates]);
  const active = activeFilterCount(filters);

  /** How many pieces each option would leave, counting every other filter in use. */
  const facet = useMemo(() => {
    const within = (g: Group) => base.filter((p) => matches(p, filters, rates, g));
    const options = <T extends string>(g: Group, values: readonly T[], label: (v: T) => string, test: (p: Product, v: T) => boolean): Option<T>[] => {
      const pool = within(g);
      return values
        .map((v) => ({ value: v, label: label(v), count: pool.filter((p) => test(p, v)).length, inSet: base.some((p) => test(p, v)) }))
        .filter((o) => o.inSet)
        .map(({ value, label, count }) => ({ value, label, count }));
    };
    return {
      categories: options<CategorySlug>("categories", categories, categoryLabel, (p, v) => p.category === v),
      prices: options<PriceKey>(
        "prices",
        priceBands.map((b) => b.key),
        (k) => priceBands.find((b) => b.key === k)!.label,
        (p, k) => {
          const b = priceBands.find((x) => x.key === k)!;
          const price = priceFor(p, rates);
          return price >= b.lo && price < b.hi;
        },
      ),
      purities: options<Purity>("purities", PURITIES, (v) => v, (p, v) => p.purity === v),
      metals: options<MetalKey>("metals", Object.keys(metalLabels) as MetalKey[], (v) => metalLabels[v], (p, v) => metalKey(p.metal) === v),
      stones: options<StoneKey>("stones", Object.keys(stoneLabels) as StoneKey[], (v) => stoneLabels[v], (p, v) => stoneKey(p) === v),
      online: within("online").filter((p) => p.online && !p.hidden).length,
      anyOnline: base.some((p) => p.online && !p.hidden),
    };
  }, [base, categories, filters, rates]);

  /** Capture card positions, then write the new filters to the URL (no reload, no scroll). */
  const update = (patch: Partial<Filters>) => {
    if (grid.current && !prefersReducedMotion()) {
      flipState.current = Flip.getState(grid.current.querySelectorAll("[data-card]"));
    }
    const next = { ...filters, ...patch };
    window.history.replaceState(null, "", `${pathname}${filtersToQuery(next)}`);
  };
  const clear = () => update({ ...emptyFilters, sort: filters.sort });

  // Animate cards from their old positions to the new layout.
  const resultKey = results.map((p) => p.slug).join("|") + (panel ? "+" : "-");
  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;
    Flip.from(state, {
      duration: MOTION.fast,
      ease: "power3.inOut",
      stagger: 0.02,
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: MOTION.fast, delay: 0.15, stagger: 0.05, ease: "expo.out" }),
    });
  }, [resultKey]);

  const togglePanel = () => {
    if (grid.current && !prefersReducedMotion()) flipState.current = Flip.getState(grid.current.querySelectorAll("[data-card]"));
    setPanel((p) => !p);
  };

  const weightLabel = `${formatGrams(filters.min ?? bounds.lo)} – ${formatGrams(filters.max ?? bounds.hi)}`;

  type Tag = { key: string; label: string; group: Group; value: string };
  const tags: Tag[] = [
    ...filters.categories.map((v) => ({ key: `c-${v}`, label: categoryLabel(v), group: "categories" as const, value: v })),
    ...filters.prices.map((v) => ({ key: `p-${v}`, label: priceBands.find((b) => b.key === v)!.label, group: "prices" as const, value: v })),
    ...filters.purities.map((v) => ({ key: `k-${v}`, label: v, group: "purities" as const, value: v })),
    ...filters.metals.map((v) => ({ key: `m-${v}`, label: metalLabels[v], group: "metals" as const, value: v })),
    ...filters.stones.map((v) => ({ key: `s-${v}`, label: stoneLabels[v], group: "stones" as const, value: v })),
    ...(filters.min !== null || filters.max !== null ? [{ key: "w", label: weightLabel, group: "weight" as const, value: "" }] : []),
    ...(filters.online ? [{ key: "o", label: "Buy online", group: "online" as const, value: "" }] : []),
  ];
  const removeTag = (t: Tag) => {
    if (t.group === "weight") update({ min: null, max: null });
    else if (t.group === "online") update({ online: false });
    else update({ [t.group]: (filters[t.group] as string[]).filter((x) => x !== t.value) } as Partial<Filters>);
  };

  /** The filter groups, shared by the sidebar and the phone sheet. Groups with a single choice are left out. */
  const facets = (
    <div className="border-t border-line">
      {categoryFilter && facet.categories.length > 1 ? (
        <FacetGroup title="Category" selected={filters.categories.length} onClear={() => update({ categories: [] })}>
          <CheckList legend="Category" options={facet.categories} selected={filters.categories} onChange={(categories) => update({ categories })} />
        </FacetGroup>
      ) : null}
      {facet.prices.length > 1 ? (
        <FacetGroup title="Price" selected={filters.prices.length} onClear={() => update({ prices: [] })}>
          <CheckList legend="Price" options={facet.prices} selected={filters.prices} onChange={(prices) => update({ prices })} />
          <p className="mt-2 text-xs text-stone">Indicative, at today’s gold rate, with making and GST.</p>
        </FacetGroup>
      ) : null}
      {facet.purities.length > 1 ? (
        <FacetGroup title="Purity" selected={filters.purities.length} onClear={() => update({ purities: [] })}>
          <CheckList legend="Purity" options={facet.purities} selected={filters.purities} onChange={(purities) => update({ purities })} />
        </FacetGroup>
      ) : null}
      {facet.metals.length > 1 ? (
        <FacetGroup title="Metal colour" selected={filters.metals.length} onClear={() => update({ metals: [] })}>
          <CheckList legend="Metal colour" options={facet.metals} selected={filters.metals} onChange={(metals) => update({ metals })} />
        </FacetGroup>
      ) : null}
      {facet.stones.length > 1 ? (
        <FacetGroup title="Stones" selected={filters.stones.length} onClear={() => update({ stones: [] })}>
          <CheckList legend="Stones" options={facet.stones} selected={filters.stones} onChange={(stones) => update({ stones })} />
        </FacetGroup>
      ) : null}
      {bounds.hi > bounds.lo ? (
        <FacetGroup
          title="Gold weight"
          selected={filters.min !== null || filters.max !== null ? 1 : 0}
          defaultOpen={false}
          onClear={() => update({ min: null, max: null })}
        >
          <WeightRange bounds={bounds} min={filters.min} max={filters.max} onChange={(min, max) => update({ min, max })} />
        </FacetGroup>
      ) : null}
      {facet.anyOnline ? (
        <FacetGroup title="Availability" selected={filters.online ? 1 : 0}>
          <Toggle label="Buy online" count={facet.online} checked={filters.online} onChange={(online) => update({ online })} />
          <p className="mt-1 text-xs text-stone">Every other piece is reserved on WhatsApp or at the showroom.</p>
        </FacetGroup>
      ) : null}
    </div>
  );

  const countText = (
    <>
      <span className="figures text-ink">{results.length}</span>
      {results.length !== base.length ? (
        <>
          {" "}
          of <span className="figures">{base.length}</span>
        </>
      ) : null}{" "}
      {base.length === 1 ? "piece" : "pieces"}
    </>
  );

  const sortMenu = (
    <Popover label={<span><span className="text-stone">Sort by:</span> {sortLabels[filters.sort]}</span>} align="right">
      {(close) => (
        <SortList
          legend={false}
          value={filters.sort}
          onChange={(sort) => {
            update({ sort });
            close();
          }}
        />
      )}
    </Popover>
  );

  return (
    <section aria-labelledby="listing-title" className="bg-white pb-16 md:pb-32">
      <h2 id="listing-title" className="sr-only">
        Pieces
      </h2>

      {/* ---------------- Toolbar ---------------- */}
      <div
        className="sticky z-20 border-b border-line bg-white/95 backdrop-blur-sm transition-[top] duration-700 ease-luxe"
        style={{ top: "var(--header-offset, 0px)" }}
      >
        {/* Desktop */}
        <div className="shell hidden h-16 items-center gap-6 lg:flex">
          <button
            type="button"
            onClick={togglePanel}
            aria-expanded={panel}
            aria-controls="listing-filters"
            className="flex h-10 items-center gap-3 border border-line-strong px-4 text-sm text-ink transition-colors duration-300 hover:border-ink"
          >
            <FilterIcon className="size-4 text-gold-deep" />
            {panel ? "Hide filters" : "Show filters"}
            {active ? <span className="flex size-5 items-center justify-center rounded-full bg-ink text-micro text-white figures">{active}</span> : null}
          </button>
          <p className="text-sm text-stone" aria-live="polite">
            {countText}
          </p>
          <div className="ml-auto">{sortMenu}</div>
        </div>

        {/* Phones and tablets */}
        <div className="grid grid-cols-2 divide-x divide-line lg:hidden">
          <button
            type="button"
            onClick={() => openOverlay("filters")}
            aria-haspopup="dialog"
            className="flex h-14 items-center justify-center gap-2 text-sm text-ink"
          >
            <FilterIcon className="size-4 text-gold-deep" />
            Filter
            {active ? <span className="flex size-5 items-center justify-center rounded-full bg-ink text-micro text-white figures">{active}</span> : null}
          </button>
          <button
            type="button"
            onClick={() => openOverlay("sort")}
            aria-haspopup="dialog"
            className="flex h-14 flex-col items-center justify-center text-sm text-ink"
          >
            Sort
            <span className="text-micro text-stone">{sortLabels[filters.sort]}</span>
          </button>
        </div>
      </div>

      {/* Phones and tablets: sheets */}
      <Drawer
        open={overlay === "filters"}
        onClose={closeOverlay}
        side="bottom"
        eyebrow="Refine"
        title="Filter"
        footer={
          <div className="flex items-center gap-4">
            <button type="button" onClick={clear} disabled={!active} className="eyebrow text-stone disabled:opacity-40">
              Clear all
            </button>
            <Button onClick={closeOverlay} size="lg" className="flex-1">
              Show {results.length} {results.length === 1 ? "piece" : "pieces"}
            </Button>
          </div>
        }
      >
        {facets}
      </Drawer>
      <Drawer open={overlay === "sort"} onClose={closeOverlay} side="bottom" eyebrow="Order" title="Sort">
        <SortList
          legend={false}
          value={filters.sort}
          onChange={(sort) => {
            update({ sort });
            closeOverlay();
          }}
        />
      </Drawer>

      <div className="shell lg:grid lg:grid-cols-12 lg:gap-10">
        {/* Desktop: filter sidebar */}
        {panel ? (
          <aside id="listing-filters" aria-label="Filters" className="hidden lg:col-span-3 lg:block">
            <div
              className="no-scrollbar sticky overflow-y-auto pb-10 pt-8"
              style={{ top: "calc(var(--header-offset, 0px) + 4rem)", maxHeight: "calc(100svh - var(--header-offset, 0px) - 4rem)" }}
              data-lenis-prevent=""
            >
              <div className="flex items-baseline justify-between pb-4">
                <p className="eyebrow text-gold-deep">Refine</p>
                {active ? (
                  <button type="button" onClick={clear} className="text-xs text-stone underline-offset-4 hover:text-ink hover:underline">
                    Clear all
                  </button>
                ) : null}
              </div>
              {facets}
            </div>
          </aside>
        ) : null}

        <div className={panel ? "lg:col-span-9" : "lg:col-span-12"}>
          {/* Count (phones) and active filters */}
          <div className="flex flex-wrap items-center gap-2 pt-6 lg:pt-8">
            <p className="mr-2 text-sm text-stone lg:hidden" aria-live="polite">
              {countText}
            </p>
            {tags.length ? (
              <>
                <ul className="contents" aria-label="Active filters">
                  {tags.map((t) => (
                    <li key={t.key}>
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        aria-label={`Remove filter: ${t.label}`}
                        className="flex h-8 items-center gap-2 rounded-full border border-line-strong bg-white pl-3 pr-2 text-xs text-ink transition-colors duration-300 hover:border-ink"
                      >
                        {t.label}
                        <CloseIcon className="size-3 text-stone" />
                      </button>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={clear} className="ml-1 text-xs text-stone underline underline-offset-4 hover:text-ink">
                  Clear all
                </button>
              </>
            ) : null}
          </div>

          {results.length === 0 ? (
            <div className="mx-auto max-w-prose py-24 text-center">
              <p className="eyebrow text-gold-deep">Nothing matches</p>
              <p className="mt-4 font-serif text-3xl font-light text-ink">No {noun} fit every filter.</p>
              <p className="mt-4 text-stone">
                Try removing a filter or widening the price or weight. Our showroom holds more than we photograph, so if
                you have something particular in mind, ask us.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
                <Button onClick={clear} variant="secondary">
                  Clear filters
                </Button>
                <TextLink href={whatsappLink(`Hello AHS Jewellers, I am looking for ${noun} that I could not find online.`)} external>
                  Ask on WhatsApp
                </TextLink>
              </div>
            </div>
          ) : (
            <ul
              ref={grid}
              className={`grid grid-flow-row-dense grid-cols-2 gap-x-4 gap-y-12 pt-6 md:grid-cols-3 md:gap-x-8 md:gap-y-16 lg:pt-8 ${
                panel ? "" : "xl:grid-cols-4 xl:gap-x-10"
              }`}
            >
              {results.map((p: Product, i) =>
                // Every fifth piece breaks the rhythm as a large feature tile.
                i % 5 === 4 ? (
                  <li key={p.slug} data-card="" data-flip-id={p.slug} className="col-span-2">
                    <ProductFeature product={p} sizes="(min-width: 1280px) 46vw, (min-width: 768px) 62vw, 100vw" />
                  </li>
                ) : (
                  <li key={p.slug} data-card="" data-flip-id={p.slug}>
                    <ProductCard
                      product={p}
                      priority={i < 4}
                      showCollection={!scope.collection}
                      sizes={panel ? "(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 46vw" : "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"}
                    />
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Server-rendered stand-in while URL filters resolve: the full set in the
 * default order, so pieces and their links are in the HTML for search engines
 * and for anyone without JavaScript. The live listing replaces it on hydration.
 */
export function ProductListingFallback({ products, showCollection }: { products: Product[]; showCollection: boolean }) {
  const sorted = applyFilters(products, emptyFilters);
  return (
    <section aria-labelledby="listing-title" className="bg-white pb-16 md:pb-32">
      <h2 id="listing-title" className="sr-only">
        Pieces
      </h2>
      <div className="border-b border-line">
        <div className="shell flex h-14 items-center justify-between lg:h-16">
          <span className="skeleton block h-4 w-40" aria-hidden="true" />
          <p className="text-sm text-stone">
            <span className="figures text-ink">{sorted.length}</span> pieces
          </p>
        </div>
      </div>
      <ul className="shell grid grid-cols-2 gap-x-4 gap-y-12 pt-10 md:grid-cols-3 md:gap-x-8 md:gap-y-16 md:pt-12 xl:grid-cols-4 xl:gap-x-10">
        {sorted.map((p, i) => (
          <li key={p.slug}>
            <ProductCard product={p} priority={i < 4} showCollection={showCollection} sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}
