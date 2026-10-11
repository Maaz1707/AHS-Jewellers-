import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import CollectionHero from "@/components/collections/CollectionHero";
import LiveCount from "@/components/collections/LiveCount";
import OtherCollections from "@/components/collections/OtherCollections";
import ProductListing, { ProductListingFallback } from "@/components/collections/ProductListing";
import { collectionBySlug, collections } from "@/data/collections";
import { products } from "@/data/products";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = collectionBySlug(slug);
  return c ? { title: `${c.name} Collection`, description: c.intro } : {};
}

export default async function CollectionPage({ params }: Params) {
  const { slug } = await params;
  const c = collectionBySlug(slug);
  if (!c) notFound();
  const count = products.filter((p) => p.collection === c.slug).length;

  return (
    <>
      <CollectionHero
        eyebrow="Collection"
        meta={<LiveCount collection={c.slug} fallback={count} />}
        title={c.name}
        lines={c.heroLines}
        image={c.cover}
        video={c.heroVideo}
        objectPosition={c.heroPosition}
        trail={[
          { label: "Collections", href: "/collections" },
          { label: c.name, href: `/collections/${c.slug}` },
        ]}
      />
      <Suspense fallback={<ProductListingFallback products={products.filter((p) => p.collection === c.slug)} showCollection={false} />}>
        <ProductListing scope={{ collection: c.slug }} noun={`${c.name.toLowerCase()} pieces`} />
      </Suspense>
      <OtherCollections current={c.slug} />
    </>
  );
}
