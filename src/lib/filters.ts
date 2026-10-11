import type { CategorySlug } from "@/data/collections";
import type { MetalColour, Product, Purity } from "@/data/products";
import type { RateSet } from "@/data/rates";
import { priceFor } from "./pricing";

/* ------------------------------------------------------------------ Sort */

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "weight-asc" | "weight-desc";

export const sortLabels: Record<SortKey, string> = {
  featured: "Recommended",
  newest: "Newest first",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "weight-asc": "Weight: light to heavy",
  "weight-desc": "Weight: heavy to light",
};
const SORTS = Object.keys(sortLabels) as SortKey[];

/* ---------------------------------------------------------------- Facets */

export type PriceKey = "u1" | "1-2" | "2-5" | "5-10" | "10+";
/** Price bands in lakh, as a counter would quote them. Prices follow today’s rate. */
export const priceBands: { key: PriceKey; label: string; lo: number; hi: number }[] = [
  { key: "u1", label: "Under ₹1 lakh", lo: 0, hi: 1_00_000 },
  { key: "1-2", label: "₹1 – 2 lakh", lo: 1_00_000, hi: 2_00_000 },
  { key: "2-5", label: "₹2 – 5 lakh", lo: 2_00_000, hi: 5_00_000 },
  { key: "5-10", label: "₹5 – 10 lakh", lo: 5_00_000, hi: 10_00_000 },
  { key: "10+", label: "Above ₹10 lakh", lo: 10_00_000, hi: Infinity },
];
const PRICES = priceBands.map((b) => b.key);

export type MetalKey = "yellow" | "rose" | "white";
export const metalLabels: Record<MetalKey, string> = { yellow: "Yellow gold", rose: "Rose gold", white: "White gold" };
const METALS = Object.keys(metalLabels) as MetalKey[];
export const metalKey = (m: MetalColour): MetalKey => (m === "Rose gold" ? "rose" : m === "White gold" ? "white" : "yellow");

export type StoneKey = "plain" | "diamond" | "kundan" | "coloured";
export const stoneLabels: Record<StoneKey, string> = {
  plain: "Plain gold",
  diamond: "Diamonds",
  kundan: "Kundan and polki",
  coloured: "Coloured stones",
};
const STONES = Object.keys(stoneLabels) as StoneKey[];
/** What a piece is set with, read from its stone description. */
export function stoneKey(p: Product): StoneKey {
  const label = p.stones?.label.toLowerCase() ?? "";
  if (!label) return "plain";
  if (/diamond|brilliant|\bct\b/.test(label)) return "diamond";
  if (/kundan|polki|meena/.test(label)) return "kundan";
  return "coloured";
}

export const PURITIES: Purity[] = ["24K", "22K", "18K"];

/* --------------------------------------------------------------- Filters */

export type Filters = {
  categories: CategorySlug[];
  prices: PriceKey[];
  purities: Purity[];
  metals: MetalKey[];
  stones: StoneKey[];
  /** Grams. null means "no bound". */
  min: number | null;
  max: number | null;
  /** Only pieces that can be bought online. */
  online: boolean;
  sort: SortKey;
};

/** A filter group, for counting each option against every other active filter. */
export type Group = "categories" | "prices" | "purities" | "metals" | "stones" | "weight" | "online";

export const emptyFilters: Filters = {
  categories: [],
  prices: [],
  purities: [],
  metals: [],
  stones: [],
  min: null,
  max: null,
  online: false,
  sort: "featured",
};

const list = (v: string | null) => (v ? v.split(",").map((x) => x.trim()).filter(Boolean) : []);
const only = <T extends string>(values: string[], allowed: readonly T[]) => values.filter((v): v is T => allowed.includes(v as T));
const num = (v: string | null) => {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

/** Read filters from the URL. Unknown values are ignored rather than trusted. */
export function parseFilters(params: URLSearchParams, validCategories: string[]): Filters {
  const sort = params.get("sort") as SortKey | null;
  return {
    categories: list(params.get("category")).filter((c) => validCategories.includes(c)) as CategorySlug[],
    prices: only(list(params.get("price")), PRICES),
    purities: only(list(params.get("purity")), PURITIES),
    metals: only(list(params.get("metal")), METALS),
    stones: only(list(params.get("stone")), STONES),
    min: num(params.get("min")),
    max: num(params.get("max")),
    online: params.get("online") === "1",
    sort: sort && SORTS.includes(sort) ? sort : "featured",
  };
}

/** Write filters back to a query string, leaving defaults out so URLs stay short. */
export function filtersToQuery(f: Filters) {
  // Built by hand so list separators stay as readable commas (?category=rings,earrings).
  const parts: string[] = [];
  const add = (k: string, v: string) => parts.push(`${k}=${v.split(",").map(encodeURIComponent).join(",")}`);
  if (f.categories.length) add("category", f.categories.join(","));
  if (f.prices.length) add("price", f.prices.join(","));
  if (f.purities.length) add("purity", f.purities.join(","));
  if (f.metals.length) add("metal", f.metals.join(","));
  if (f.stones.length) add("stone", f.stones.join(","));
  if (f.min !== null) add("min", String(f.min));
  if (f.max !== null) add("max", String(f.max));
  if (f.online) add("online", "1");
  if (f.sort !== "featured") add("sort", f.sort);
  return parts.length ? `?${parts.join("&")}` : "";
}

const inBand = (price: number, keys: PriceKey[]) => keys.some((k) => {
  const b = priceBands.find((x) => x.key === k)!;
  return price >= b.lo && price < b.hi;
});

/** Does a piece pass every filter, optionally ignoring one group (for that group’s own counts)? */
export function matches(p: Product, f: Filters, rates?: RateSet, except?: Group) {
  return (
    (except === "categories" || !f.categories.length || f.categories.includes(p.category)) &&
    (except === "prices" || !f.prices.length || !rates || inBand(priceFor(p, rates), f.prices)) &&
    (except === "purities" || !f.purities.length || f.purities.includes(p.purity)) &&
    (except === "metals" || !f.metals.length || f.metals.includes(metalKey(p.metal))) &&
    (except === "stones" || !f.stones.length || f.stones.includes(stoneKey(p))) &&
    (except === "weight" || ((f.min === null || p.weight >= f.min) && (f.max === null || p.weight <= f.max))) &&
    (except === "online" || !f.online || (Boolean(p.online) && !p.hidden))
  );
}

/** Filter and sort. Price filters and price sorts need today’s rates; without them they fall back gracefully. */
export function applyFilters(products: Product[], f: Filters, rates?: RateSet) {
  const sorted = products.filter((p) => matches(p, f, rates));
  const price = (p: Product) => (rates ? priceFor(p, rates) : p.weight);
  const newest = (a: Product, b: Product) => b.added.localeCompare(a.added);
  switch (f.sort) {
    case "featured":
      // The family’s picks first, in their order; then everything else, newest first.
      sorted.sort((a, b) => (a.featured ?? Infinity) - (b.featured ?? Infinity) || newest(a, b));
      break;
    case "newest":
      sorted.sort(newest);
      break;
    case "price-asc":
      sorted.sort((a, b) => price(a) - price(b));
      break;
    case "price-desc":
      sorted.sort((a, b) => price(b) - price(a));
      break;
    case "weight-asc":
      sorted.sort((a, b) => a.weight - b.weight);
      break;
    case "weight-desc":
      sorted.sort((a, b) => b.weight - a.weight);
      break;
  }
  return sorted;
}

/** Whole-gram bounds that contain every piece in the set. */
export function weightBounds(products: Product[]) {
  if (!products.length) return { lo: 0, hi: 0 };
  const ws = products.map((p) => p.weight);
  return { lo: Math.floor(Math.min(...ws)), hi: Math.ceil(Math.max(...ws)) };
}

export const activeFilterCount = (f: Filters) =>
  f.categories.length +
  f.prices.length +
  f.purities.length +
  f.metals.length +
  f.stones.length +
  (f.min !== null || f.max !== null ? 1 : 0) +
  (f.online ? 1 : 0);
