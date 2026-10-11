import type { CategorySlug } from "@/data/collections";
import type { Product, Purity } from "@/data/products";

export type SortKey = "newest" | "weight-asc" | "weight-desc";

export const sortLabels: Record<SortKey, string> = {
  newest: "Newest",
  "weight-asc": "Weight, low to high",
  "weight-desc": "Weight, high to low",
};

export type Filters = {
  categories: CategorySlug[];
  purities: Purity[];
  /** Grams. null means "no bound". */
  min: number | null;
  max: number | null;
  /** Only pieces that can be bought online. */
  online: boolean;
  sort: SortKey;
};

export const emptyFilters: Filters = { categories: [], purities: [], min: null, max: null, online: false, sort: "newest" };

const PURITIES: Purity[] = ["24K", "22K", "18K"];
const SORTS = Object.keys(sortLabels) as SortKey[];

const list = (v: string | null) => (v ? v.split(",").map((x) => x.trim()).filter(Boolean) : []);
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
    purities: list(params.get("purity")).filter((p) => PURITIES.includes(p as Purity)) as Purity[],
    min: num(params.get("min")),
    max: num(params.get("max")),
    online: params.get("online") === "1",
    sort: sort && SORTS.includes(sort) ? sort : "newest",
  };
}

/** Write filters back to a query string, leaving defaults out so URLs stay short. */
export function filtersToQuery(f: Filters) {
  // Built by hand so list separators stay as readable commas (?category=rings,earrings).
  const parts: string[] = [];
  const add = (k: string, v: string) => parts.push(`${k}=${v.split(",").map(encodeURIComponent).join(",")}`);
  if (f.categories.length) add("category", f.categories.join(","));
  if (f.purities.length) add("purity", f.purities.join(","));
  if (f.min !== null) add("min", String(f.min));
  if (f.max !== null) add("max", String(f.max));
  if (f.online) add("online", "1");
  if (f.sort !== "newest") add("sort", f.sort);
  return parts.length ? `?${parts.join("&")}` : "";
}

export function applyFilters(products: Product[], f: Filters) {
  const out = products.filter(
    (p) =>
      (!f.categories.length || f.categories.includes(p.category)) &&
      (!f.purities.length || f.purities.includes(p.purity)) &&
      (f.min === null || p.weight >= f.min) &&
      (f.max === null || p.weight <= f.max) &&
      (!f.online || (p.online && !p.hidden)),
  );
  const sorted = [...out];
  if (f.sort === "newest") sorted.sort((a, b) => b.added.localeCompare(a.added));
  if (f.sort === "weight-asc") sorted.sort((a, b) => a.weight - b.weight);
  if (f.sort === "weight-desc") sorted.sort((a, b) => b.weight - a.weight);
  return sorted;
}

/** Whole-gram bounds that contain every piece in the set. */
export function weightBounds(products: Product[]) {
  if (!products.length) return { lo: 0, hi: 0 };
  const ws = products.map((p) => p.weight);
  return { lo: Math.floor(Math.min(...ws)), hi: Math.ceil(Math.max(...ws)) };
}

export const activeFilterCount = (f: Filters) =>
  f.categories.length + f.purities.length + (f.min !== null || f.max !== null ? 1 : 0) + (f.online ? 1 : 0);
