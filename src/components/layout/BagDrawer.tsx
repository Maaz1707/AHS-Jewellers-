"use client";

import Image from "@/components/ui/Img";
import Link from "next/link";
import { useBag } from "@/lib/bag";
import { formatGrams, formatINR } from "@/lib/format";
import { pieceImage } from "@/lib/pieces";
import { useCart, useUI } from "@/store";
import QtyStepper from "../bag/QtyStepper";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import { BagIcon } from "../ui/Icons";

export default function BagDrawer() {
  const open = useUI((s) => s.overlay === "bag");
  const close = useUI((s) => s.close);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const bag = useBag();
  const { lines } = bag;

  return (
    <Drawer
      open={open}
      onClose={close}
      eyebrow="Your bag"
      title={lines.length ? `${bag.count} ${bag.count === 1 ? "piece" : "pieces"}` : "Your bag is empty"}
      footer={
        lines.length ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow text-stone">Total</span>
              <span className="font-serif text-2xl text-ink figures">{formatINR(bag.subtotal)}</span>
            </div>
            <p className="text-xs text-stone">
              At today’s rate, with making charges and 3% GST. Insured delivery or showroom pickup is chosen at checkout.
            </p>
            <Button href="/checkout" size="lg" arrow className="w-full" onClick={close}>
              Checkout
            </Button>
            <Link href="/bag" onClick={close} className="self-center py-2 eyebrow text-ink hover:text-gold-deep">
              <span className="link-draw">View bag and price breakdown</span>
            </Link>
          </div>
        ) : null
      }
    >
      {lines.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center py-12 text-center">
          <span className="flex size-16 items-center justify-center rounded-full border border-line text-gold-deep">
            <BagIcon className="size-6" />
          </span>
          <p className="mt-6 max-w-label font-serif text-2xl font-light text-ink">Nothing in your bag yet.</p>
          <p className="mt-3 max-w-label text-sm text-stone">
            Gold coins and selected lighter pieces can be bought here and delivered, insured, to your door.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Button href="/collections?online=1" arrow onClick={close}>
              See pieces available online
            </Button>
            <Link href="/book-a-visit" onClick={close} className="link-draw eyebrow text-ink">
              Or book a visit
            </Link>
          </div>
        </div>
      ) : (
        <>
          <ul className="flex flex-col">
            {lines.map(({ item, product, unit }) => {
              const img = pieceImage(product);
              return (
                <li key={item.slug} className="flex gap-5 border-b border-line py-5 first:pt-0">
                  <Link href={`/jewellery/${product.slug}`} onClick={close} className="relative block size-24 shrink-0 overflow-hidden bg-ivory">
                    <Image src={img.src} alt={img.alt} fill sizes="96px" className="object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link href={`/jewellery/${product.slug}`} onClick={close} className="font-serif text-xl leading-snug text-ink hover:text-gold-deep">
                      {product.name}
                    </Link>
                    <span className="mt-1 text-xs text-stone">
                      {product.purity} · {formatGrams(product.weight)} · {formatINR(unit)} each
                    </span>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <QtyStepper size="sm" qty={item.qty} name={product.name} onChange={(n) => setQty(item.slug, n)} />
                      <span className="text-sm text-ink figures">{formatINR(unit * item.qty)}</span>
                    </div>
                    <button type="button" onClick={() => remove(item.slug)} className="self-start inline-flex h-12 items-center text-xs text-stone underline-offset-4 hover:text-ink hover:underline">
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {bag.unavailable.length ? <Unavailable items={bag.unavailable} onRemove={remove} /> : null}
        </>
      )}
    </Drawer>
  );
}

/** Pieces taken off online sale since they were added. */
export function Unavailable({ items, onRemove }: { items: { item: { slug: string }; name: string }[]; onRemove: (slug: string) => void }) {
  return (
    <div className="mt-6 border-l-2 border-gold bg-ivory p-4 text-sm text-ink-soft">
      <p>{items.length === 1 ? "This piece is" : "These pieces are"} no longer available online. Ask us about it on WhatsApp or in the showroom.</p>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((u) => (
          <li key={u.item.slug} className="flex items-center justify-between gap-4">
            <span className="text-ink">{u.name}</span>
            <button type="button" onClick={() => onRemove(u.item.slug)} className="inline-flex h-12 items-center text-xs text-stone underline-offset-4 hover:text-ink hover:underline">
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
