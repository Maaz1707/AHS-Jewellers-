import type { Metadata } from "next";
import ProductView from "@/components/product/ProductView";
import { images, type ImageKey } from "@/data/media";
import { productBySlug, products } from "@/data/products";

type Params = { params: Promise<{ id: string }> };

/**
 * Catalogue pieces are pre-rendered. Pieces added in the admin panel live only
 * in the browser’s store, so other ids render on demand and the client view
 * looks them up.
 */
export const dynamicParams = true;

export function generateStaticParams() {
  return products.map((p) => ({ id: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const p = productBySlug(id);
  if (!p) return { title: "A piece from the showroom" };
  const first = p.images[0];
  const src = first in images ? images[first as ImageKey].src : first;
  return {
    title: `${p.name} (${p.code})`,
    description: p.description,
    openGraph: { images: [{ url: `${src}?auto=compress&cs=tinysrgb&w=1200` }] },
  };
}

export default async function JewelleryPage({ params }: Params) {
  const { id } = await params;
  return <ProductView slug={id} seed={productBySlug(id)} />;
}
