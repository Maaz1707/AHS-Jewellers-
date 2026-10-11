import type { ImageKey, VideoKey } from "./media";

export type CollectionSlug = "bridal" | "diamond" | "gold-classics" | "daily-wear" | "gifting";

export type Collection = {
  slug: CollectionSlug;
  name: string;
  /** One line used on cards and menus. */
  line: string;
  /** Two or three sentences for the collection page intro. */
  intro: string;
  cover: ImageKey;
  codePrefix: string;
  /** Two short lines under the collection title. */
  heroLines: [string, string];
  /** Optional film for the collection hero; the cover is its poster fallback. */
  heroVideo?: VideoKey;
  /** CSS object-position for the cover in a wide hero crop. */
  heroPosition?: string;
  /** Second editorial image for the collections landing page. */
  detail: ImageKey;
};

export const collections: Collection[] = [
  {
    slug: "bridal",
    name: "Bridal",
    line: "Kundan, polki and heavy 22K gold for the wedding and every ceremony around it.",
    intro:
      "Rani haars, chokers, kadas and matha pattis, made for the day and for the family who will wear them after. Trousseau planning happens upstairs, in our bridal salon.",
    cover: "bridePortraitIvory",
    codePrefix: "BR",
    heroLines: ["Kundan, polki and heavy 22K gold for every ceremony.", "Planned upstairs, in our bridal salon, at your pace."],
    heroPosition: "50% 28%",
    detail: "bridalKundanTeal",
  },
  {
    slug: "diamond",
    name: "Diamond",
    line: "Certified diamonds in 18K gold, from solitaires to evening necklaces.",
    intro:
      "Solitaires, halos and fine necklaces in 18K yellow, rose and white gold. Every stone above 0.30 ct comes with its grading report.",
    cover: "diaPortrait",
    codePrefix: "DM",
    heroLines: ["Certified diamonds set in 18K gold.", "Every stone over 0.30 ct comes with its grading report."],
    heroPosition: "50% 30%",
    detail: "diaNecklaceWhite",
  },
  {
    slug: "gold-classics",
    name: "Gold Classics",
    line: "Nakshi, temple and jhumka work in 22K, the pieces every family keeps.",
    intro:
      "Engraved bangles, temple pendants and jhumkas in the forms our karigars have made for three generations. Heavy enough to feel, fine enough to wear often.",
    cover: "showcaseGold",
    codePrefix: "GC",
    heroLines: ["Nakshi, temple and jhumka work in 22K.", "The forms our karigars have made for three generations."],
    heroVideo: "goldWindow",
    heroPosition: "50% 50%",
    detail: "bangleNakshi",
  },
  {
    slug: "daily-wear",
    name: "Daily Wear",
    line: "Light chains, pendants and bangles for every day of the week.",
    intro:
      "Fine chains, small pendants and slim bangles in 18K and 22K, made light enough to forget you are wearing them and strong enough not to need it.",
    cover: "dailyLayeredWorn",
    codePrefix: "DW",
    heroLines: ["Light chains, pendants and bangles.", "Made to be worn every day, and to look better for it."],
    heroPosition: "50% 35%",
    detail: "dailyHeartPendant",
  },
  {
    slug: "gifting",
    name: "Gifting",
    line: "Coins, bars and small pieces, wrapped and ready for the occasion.",
    intro:
      "24K coins and bars for Dhanteras and Akshaya Tritiya, and small pieces for birthdays, anniversaries and the first visit to a new home. Each one arrives in our ivory box.",
    cover: "giftRingBox",
    codePrefix: "GF",
    heroLines: ["Coins, bars and small pieces for the occasion.", "Each one wrapped in our ivory box."],
    heroPosition: "50% 55%",
    detail: "giftCoins",
  },
];

export const collectionBySlug = (slug: string) => collections.find((c) => c.slug === slug);

export type CategorySlug =
  | "necklaces"
  | "earrings"
  | "bangles"
  | "rings"
  | "chains"
  | "coins"
  | "pendants"
  | "bracelets"
  | "headpieces";

export type Category = { slug: CategorySlug; name: string; inMenu: boolean };

/** `inMenu` categories appear under "Shop by category" in the mega menu. */
export const categories: Category[] = [
  { slug: "necklaces", name: "Necklaces", inMenu: true },
  { slug: "earrings", name: "Earrings", inMenu: true },
  { slug: "bangles", name: "Bangles", inMenu: true },
  { slug: "rings", name: "Rings", inMenu: true },
  { slug: "chains", name: "Chains", inMenu: true },
  { slug: "coins", name: "Coins & Bars", inMenu: true },
  { slug: "pendants", name: "Pendants", inMenu: false },
  { slug: "bracelets", name: "Bracelets", inMenu: false },
  { slug: "headpieces", name: "Headpieces", inMenu: false },
];

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
