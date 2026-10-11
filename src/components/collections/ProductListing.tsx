"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useLayoutEffect, useMemo, useRef } from "react";
import type { CategorySlug } from "@/data/collections";
import type { Product, Purity } from "@/data/products";
import { whatsappLink } from "@/data/site";
import {
  activeFilterCount,
  applyFilters,
  emptyFilters,
  filtersToQuery,
  parseFilters,
  sortLabels,
  weightBounds,
  type Filters,
} from "@/lib/filters";
import { formatGrams } from "@/lib/format";
import { Flip } from "gsap/Flip";
import { gsap, MOTION } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useUI } from "@/store";
import { useVisibleProducts } from "@/lib/pieces";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import { CheckboxField } from "../ui/Field";
import { CloseIcon, FilterIcon } from "../ui/Icons";
import Popover from "../ui/Popover";
import ProductCard from "../ui/ProductCard";
import TextLink from "../ui/TextLink";
import { CheckList, SortList, WeightRange, categoryLabel, purityLabel } from "./FilterControls";

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

const PURITY_ORDER: Purity[] = ["24K", "22K", "18K"];

export default function ProductListing({ scope, categoryFilter = true, noun }: Props) {
  const all = useVisibleProducts();
  const pathname = usePathname();
  const params = useSearchParams();
  const sheetOpen = useUI((s) => s.overlay === "filters");
  const openOverlay = useUI((s) => s.open);
  const closeOverlay = useUI((s) => s.close);
  const grid = useRef<HTMLUListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const base = useMemo(
    () => all.filter((p) => (!scope.collection || p.collection === scope.collection) && (!scope.category || p.category === scope.category)),
    [all, scope.collection, scope.category],
  );

  const categoryOptions = useMemo(() => {
    const counts = new Map<CategorySlug, number>();
    base.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
    return [...counts].map(([value, count]) => ({ value, count }));
  }, [base]);

  const purityOptions = useMemo(
    () =>
      PURITY_ORDER.map((value) => ({ value, count: base.filter((p) => p.purity === value).length })).filter((o) => o.count > 0),
    [base],
  );

  const bounds = useMemo(() => weightBounds(base), [base]);
  const onlineCount = useMemo(() => base.filter((p) => p.online).length, [base]);
  const filters = useMemo(() => {
    const f = parseFilters(new URLSearchParams(params.toString()), categoryOptions.map((o) => o.value));
    // Keep hand-edited URLs sensible: clamp weights into this set’s range, in order.
    const clamp = (n: number | null) => (n === null ? null : Math.min(Math.max(n, bounds.lo), bounds.hi));
    let min = clamp(f.min);
    let max = clamp(f.max);
    if (min !== null && max !== null && min > max) [min, max] = [max, min];
    return { ...f, min: min === bounds.lo ? null : min, max: max === bounds.hi ? null : max };
  }, [params, categoryOptions, bounds]);
  const results = useMemo(() => applyFilters(base, filters), [base, filters]);
  const active = activeFilterCount(filters);

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
  const resultKey = results.map((p) => p.slug).join("|");
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

  const weightLabel =
    filters.min !== null || filters.max !== null
      ? `${formatGrams(filters.min ?? bounds.lo)} – ${formatGrams(filters.max ?? bounds.hi)}`
      : "Weight";

  type Tag = { key: string; label: string; kind: "category" | "purity" | "weight" | "online"; value: string };
  const tags: Tag[] = [
    ...filters.categories.map((c) => ({ key: `c-${c}`, label: categoryLabel(c), kind: "category" as const, value: c })),
    ...filters.purities.map((p) => ({ key: `p-${p}`, label: p, kind: "purity" as const, value: p })),
    ...(filters.min !== null || filters.max !== null ? [{ key: "w", label: weightLabel, kind: "weight" as const, value: "" }] : []),
    ...(filters.online ? [{ key: "o", label: "Available online", kind: "online" as const, value: "" }] : []),
  ];
  const removeTag = (t: Tag) => {
    if (t.kind === "category") update({ categories: filters.categories.filter((x) => x !== t.value) });
    if (t.kind === "purity") update({ purities: filters.purities.filter((x) => x !== t.value) });
    if (t.kind === "weight") update({ min: null, max: null });
    if (t.kind === "online") update({ online: false });
  };

  const count = (
    <p className="text-sm text-stone" aria-live="polite">
      <span className="figures text-ink">{results.length}</span> {results.length === 1 ? "piece" : "pieces"}
    </p>
  );

  return (
    <section aria-labelledby="listing-title" className="bg-white pb-20 md:pb-32">
      <h2 id="listing-title" className="sr-only">
        Pieces
      </h2>
      {/* ---------------- Desktop: sticky filter bar ---------------- */}
      <div
        className="sticky z-20 hidden border-b border-line bg-white/95 backdrop-blur-sm transition-[top] duration-700 ease-luxe md:block"
        style={{ top: "var(--header-offset, 0px)" }}
      >
        <div className="shell flex h-16 items-center gap-3">
          <FilterIcon className="mr-2 size-5 text-gold-deep" aria-hidden="true" />
          {categoryFilter && categoryOptions.length > 1 ? (
            <Popover label={filters.categories.length ? `Category (${filters.categories.length})` : "Category"} active={filters.categories.length > 0}>
              <CheckList
                legend="Category"
                options={categoryOptions}
                selected={filters.categories}
                onChange={(categories) => update({ categories })}
                labelFor={categoryLabel}
              />
            </Popover>
          ) : null}
          {purityOptions.length > 1 ? (
            <Popover label={filters.purities.length ? `Purity (${filters.purities.length})` : "Purity"} active={filters.purities.length > 0}>
              <CheckList
                legend="Purity"
                options={purityOptions}
                selected={filters.purities}
                onChange={(purities) => update({ purities })}
                labelFor={purityLabel}
              />
            </Popover>
          ) : null}
          {bounds.hi > bounds.lo ? (
            <Popover label={weightLabel} active={filters.min !== null || filters.max !== null}>
              <div className="w-64">
                <WeightRange bounds={bounds} min={filters.min} max={filters.max} onChange={(min, max) => update({ min, max })} />
              </div>
            </Popover>
          ) : null}
          {onlineCount ? (
            <button
              type="button"
              aria-pressed={filters.online}
              onClick={() => update({ online: !filters.online })}
              className={`flex h-10 items-center gap-2 border px-4 text-sm transition-colors duration-300 ${
                filters.online ? "border-ink bg-ink text-white" : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"
              }`}
            >
              Available online
              <span className={`figures ${filters.online ? "text-white/70" : "text-stone"}`}>{onlineCount}</span>
            </button>
          ) : null}
          {active ? (
            <button type="button" onClick={clear} className="ml-2 eyebrow text-stone hover:text-ink">
              <span className="link-draw">Clear all</span>
            </button>
          ) : null}
          <div className="ml-auto flex items-center gap-6">
            {count}
            <Popover label={`Sort: ${sortLabels[filters.sort]}`} align="right">
              {(close) => (
                <SortList
                  value={filters.sort}
                  onChange={(sort) => {
                    update({ sort });
                    close();
                  }}
                />
              )}
            </Popover>
          </div>
        </div>
      </div>

      {/* ---------------- Phones: compact bar + bottom sheet ---------------- */}
      <div className="sticky z-20 border-b border-line bg-white/95 backdrop-blur-sm transition-[top] duration-700 ease-luxe md:hidden" style={{ top: "var(--header-offset, 0px)" }}>
        <div className="shell flex h-14 items-center justify-between">
          <button
            type="button"
            onClick={() => openOverlay("filters")}
            aria-haspopup="dialog"
            className="flex items-center gap-2 eyebrow text-ink"
          >
            <FilterIcon className="size-5 text-gold-deep" />
            Filter and sort{active ? ` (${active})` : ""}
          </button>
          {count}
        </div>
      </div>

      <Drawer
        open={sheetOpen}
        onClose={closeOverlay}
        side="bottom"
        eyebrow="Refine"
        title="Filter and sort"
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
        <div className="flex flex-col gap-10">
          <SortList value={filters.sort} onChange={(sort) => update({ sort })} />
          {categoryFilter && categoryOptions.length > 1 ? (
            <CheckList legend="Category" options={categoryOptions} selected={filters.categories} onChange={(categories) => update({ categories })} labelFor={categoryLabel} />
          ) : null}
          {purityOptions.length > 1 ? (
            <CheckList legend="Purity" options={purityOptions} selected={filters.purities} onChange={(purities) => update({ purities })} labelFor={purityLabel} />
          ) : null}
          {bounds.hi > bounds.lo ? (
            <WeightRange bounds={bounds} min={filters.min} max={filters.max} onChange={(min, max) => update({ min, max })} />
          ) : null}
          {onlineCount ? (
            <CheckboxField
              label={`Only pieces available online (${onlineCount})`}
              checked={filters.online}
              onChange={(e) => update({ online: e.target.checked })}
            />
          ) : null}
        </div>
      </Drawer>

      <div className="shell">
        {/* Active filter tags */}
        {tags.length ? (
          <ul className="flex flex-wrap items-center gap-2 pt-6" aria-label="Active filters">
            {tags.map((t) => (
              <li key={t.key}>
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  aria-label={`Remove filter: ${t.label}`}
                  className="flex items-center gap-2 border border-line bg-ivory px-3 py-1 text-xs text-ink transition-colors hover:border-ink"
                >
                  {t.label}
                  <CloseIcon className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {results.length === 0 ? (
          <div className="mx-auto max-w-prose py-24 text-center">
            <p className="eyebrow text-gold-deep">Nothing matches</p>
            <p className="mt-4 font-serif text-3xl font-light text-ink">No {noun} fit every filter.</p>
            <p className="mt-4 text-stone">
              Try widening the weight range or removing a filter. Our showroom holds more than we photograph, so if you
              have something particular in mind, ask us.
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
          <ul ref={grid} className="grid grid-cols-2 gap-x-4 gap-y-12 pt-10 md:grid-cols-3 md:gap-x-8 md:gap-y-16 md:pt-12 xl:grid-cols-4 xl:gap-x-10">
            {results.map((p: Product, i) => (
              <li key={p.slug} data-card="" data-flip-id={p.slug}>
                <ProductCard
                  product={p}
                  priority={i < 4}
                  showCollection={!scope.collection}
                  sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/**
 * Server-rendered stand-in while URL filters resolve: the full set in default
 * (newest) order, so pieces and their links are in the HTML for search engines
 * and for anyone without JavaScript. The live listing replaces it on hydration.
 */
export function ProductListingFallback({ products, showCollection }: { products: Product[]; showCollection: boolean }) {
  const sorted = applyFilters(products, emptyFilters);
  return (
    <section aria-labelledby="listing-title" className="bg-white pb-20 md:pb-32">
      <h2 id="listing-title" className="sr-only">
        Pieces
      </h2>
      <div className="border-b border-line">
        <div className="shell flex h-14 items-center justify-between md:h-16">
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
