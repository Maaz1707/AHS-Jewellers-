import type { MetadataRoute } from "next";
import { categories, collections } from "@/data/collections";
import { products } from "@/data/products";
import { site } from "@/data/site";

/** Public pages only. Account, bag, checkout, orders and the owner’s panel are left out. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly" = "monthly") => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    page("", 1, "daily"),
    page("/gold-rate", 0.9, "daily"),
    page("/collections", 0.9, "weekly"),
    ...collections.map((c) => page(`/collections/${c.slug}`, 0.8, "weekly")),
    ...categories.map((c) => page(`/category/${c.slug}`, 0.7, "weekly")),
    ...products.filter((p) => !p.hidden).map((p) => page(`/jewellery/${p.slug}`, 0.6, "daily")),
    ...["/book-a-visit", "/savings-scheme", "/digital-gold", "/try-on", "/gold"].map((p) => page(p, 0.8)),
    ...["/our-story", "/craft", "/hallmarking", "/reviews", "/contact", "/exchange", "/care", "/faq"].map((p) => page(p, 0.6)),
    ...["/orders", "/privacy", "/terms"].map((p) => page(p, 0.3)),
  ];
}
