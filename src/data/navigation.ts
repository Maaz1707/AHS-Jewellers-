import type { ImageKey } from "./media";

export type NavLink = { label: string; href: string; note?: string };

export type MenuKey = "collections" | "gold" | "story" | "visit";

export type MainNavItem = {
  key: MenuKey;
  label: string;
  href: string;
  /** Simple panels: a list of links with notes, plus a feature image. */
  links?: NavLink[];
  feature: { image: ImageKey; eyebrow: string; title: string; href: string };
};

export const mainNav: MainNavItem[] = [
  {
    key: "collections",
    label: "Collections",
    href: "/collections",
    feature: {
      image: "brideIvoryLehenga",
      eyebrow: "The Bridal Salon",
      title: "Trousseau planning, upstairs",
      href: "/collections/bridal",
    },
  },
  {
    key: "gold",
    label: "Gold",
    href: "/gold",
    links: [
      { label: "Today’s Rate", href: "/gold-rate", note: "24K, 22K, 18K and silver, updated each morning" },
      { label: "Savings Scheme", href: "/savings-scheme", note: "Eleven instalments, the twelfth is ours" },
      { label: "Digital Gold", href: "/digital-gold", note: "Buy 24K gold from ₹100, take it home as jewellery" },
    ],
    feature: {
      image: "giftBar",
      eyebrow: "Dhanteras",
      title: "Coins and bars in 24K, sealed and certified",
      href: "/collections/gifting",
    },
  },
  {
    key: "story",
    label: "Our Story",
    href: "/our-story",
    links: [
      { label: "Heritage", href: "/our-story", note: "A family gold house, three generations in" },
      { label: "Craft", href: "/craft", note: "From the karigar’s bench to your hands" },
      { label: "Hallmarking and Purity", href: "/hallmarking", note: "What the BIS mark and HUID tell you" },
      { label: "Reviews", href: "/reviews", note: "Families, in their own words" },
    ],
    feature: {
      image: "jhumkaWorn",
      eyebrow: "The Craft",
      title: "Five steps, many hands",
      href: "/craft",
    },
  },
  {
    key: "visit",
    label: "Visit",
    href: "/contact",
    links: [
      { label: "Book a Visit", href: "/book-a-visit", note: "A private appointment, with tea" },
      { label: "The Showroom", href: "/contact#floors", note: "Two floors on Bhagwan Das Road" },
      { label: "Contact", href: "/contact", note: "Call, WhatsApp or write to us" },
    ],
    feature: {
      image: "showroomStair",
      eyebrow: "First floor",
      title: "The bridal salon, by appointment",
      href: "/contact#floors",
    },
  },
];

export const footerNav = {
  collections: [
    { label: "Bridal", href: "/collections/bridal" },
    { label: "Diamond", href: "/collections/diamond" },
    { label: "Gold Classics", href: "/collections/gold-classics" },
    { label: "Daily Wear", href: "/collections/daily-wear" },
    { label: "Gifting", href: "/collections/gifting" },
  ],
  customer: [
    { label: "Book a Visit", href: "/book-a-visit" },
    { label: "Today’s Gold Rate", href: "/gold-rate" },
    { label: "Savings Scheme", href: "/savings-scheme" },
    { label: "Digital Gold", href: "/digital-gold" },
    { label: "Virtual Try-On", href: "/try-on" },
    { label: "Track an Order", href: "/orders" },
    { label: "Old Gold Exchange", href: "/exchange" },
    { label: "Jewellery Care", href: "/care" },
    { label: "Questions", href: "/faq" },
    { label: "Reviews", href: "/reviews" },
    { label: "Contact", href: "/contact" },
    { label: "Wishlist", href: "/wishlist" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Owner’s panel", href: "/admin" },
  ],
} satisfies Record<string, NavLink[]>;
