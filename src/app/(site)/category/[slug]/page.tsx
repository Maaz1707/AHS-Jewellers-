import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import CollectionHero from "@/components/collections/CollectionHero";
import LiveCount from "@/components/collections/LiveCount";
import OtherCollections from "@/components/collections/OtherCollections";
import ProductListing, { ProductListingFallback } from "@/components/collections/ProductListing";
import { categories, categoryBySlug } from "@/data/collections";
import type { ImageKey } from "@/data/media";
import { products } from "@/data/products";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

/** Two short lines for each category hero. */
const lines: Record<string, [string, string]> = {
  necklaces: ["Rani haars, chokers and fine diamond necklaces.", "From the wedding day to a quiet dinner."],
  earrings: ["Jhumkas, chandbalis and solitaire studs.", "Each pair weighed and matched by hand."],
  bangles: ["Nakshi bangles, gokhru kadas and slim stacking bangles.", "Sized from 2.2 to 2.10, and resized when life changes."],
  rings: ["Solitaires, toi et moi rings and couple bands.", "Sized at the counter, engraved inside if you wish."],
  chains: ["Box, rope and cable chains in 18K and 22K.", "Strong enough for every day, fine enough to layer."],
  coins: ["24K coins and bars in 999.9 gold.", "Sealed with their assay certificate."],
  pendants: ["Lotus, jaali and diamond pendants.", "Made to hang well on any chain."],
  bracelets: ["Soft link and diamond bracelets.", "Comfortable beside a watch, light on the wrist."],
  headpieces: ["Matha pattis and maang tikkas.", "For the bride, and the women beside her."],
};

const heroImage: Record<string, ImageKey> = {
  necklaces: "bridalLayered",
  earrings: "jhumkaWorn",
  bangles: "bangleNakshi",
  rings: "diaRingsSculpt",
  chains: "dailyLayeredWorn",
  coins: "giftCoins",
  pendants: "pendantLotus",
  bracelets: "giftLeafBracelet",
  headpieces: "bridalMathaPatti",
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = categoryBySlug(slug);
  return c ? { title: c.name, description: lines[c.slug].join(" ") } : {};
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const c = categoryBySlug(slug);
  if (!c) notFound();
  const count = products.filter((p) => p.category === c.slug).length;

  return (
    <>
      <CollectionHero
        eyebrow="Shop by category"
        meta={<LiveCount category={c.slug} fallback={count} />}
        title={c.name}
        lines={lines[c.slug]}
        image={heroImage[c.slug] ?? "showcaseStands"}
        trail={[
          { label: "Collections", href: "/collections" },
          { label: c.name, href: `/category/${c.slug}` },
        ]}
      />
      <Suspense fallback={<ProductListingFallback products={products.filter((p) => p.category === c.slug)} showCollection />}>
        <ProductListing scope={{ category: c.slug }} categoryFilter={false} noun={c.name.toLowerCase()} />
      </Suspense>
      <OtherCollections />
    </>
  );
}
