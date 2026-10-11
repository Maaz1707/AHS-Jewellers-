import type { Metadata } from "next";
import OrderTracking from "@/components/orders/OrderTracking";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${decodeURIComponent(id)}`, robots: { index: false } };
}

export default async function OrderPage({ params }: Props) {
  const { id } = await params;
  return (
    <section className="bg-white page-y">
      <div className="shell">
        <OrderTracking id={decodeURIComponent(id)} />
      </div>
    </section>
  );
}
