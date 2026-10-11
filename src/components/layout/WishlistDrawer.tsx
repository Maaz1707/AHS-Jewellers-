"use client";

import Image from "@/components/ui/Img";
import Link from "next/link";
import { pieceImage, useVisibleProducts } from "@/lib/pieces";
import { whatsappLink } from "@/data/site";
import { productPath, useOrigin, wishlistMessage } from "@/lib/enquiry";
import { formatGrams } from "@/lib/format";
import { useEnquiries, useUI, useWishlist } from "@/store";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import { HeartIcon, WhatsAppIcon } from "../ui/Icons";
import Price from "../ui/Price";

/** Hook shared by the drawer and the /wishlist page. */
export function useWishlistItems() {
  const slugs = useWishlist((s) => s.slugs);
  const products = useVisibleProducts();
  return slugs.map((slug) => products.find((p) => p.slug === slug)).filter((p): p is NonNullable<typeof p> => Boolean(p));
}

/** WhatsApp link for every saved piece, which also records one wishlist enquiry. */
export function useWishlistEnquiry() {
  const list = useWishlistItems();
  const origin = useOrigin();
  const addEnquiry = useEnquiries((s) => s.addEnquiry);
  return {
    href: whatsappLink(wishlistMessage(list, origin)),
    onClick: () =>
      addEnquiry({ type: "wishlist", channel: "whatsapp", productSlugs: list.map((p) => p.slug), pageUrl: `${origin}/wishlist` }),
  };
}

export default function WishlistDrawer() {
  const open = useUI((s) => s.overlay === "wishlist");
  const close = useUI((s) => s.close);
  const remove = useWishlist((s) => s.remove);
  const list = useWishlistItems();
  const enquire = useWishlistEnquiry();

  return (
    <Drawer
      open={open}
      onClose={close}
      eyebrow="Wishlist"
      title={list.length ? `${list.length} ${list.length === 1 ? "piece" : "pieces"} saved` : "Nothing saved yet"}
      footer={
        list.length ? (
          <div className="flex flex-col gap-3">
            <Button
              href={enquire.href}
              external
              size="lg"
              className="w-full"
              icon={<WhatsAppIcon className="size-4" />}
              onClick={enquire.onClick}
            >
              Enquire about all on WhatsApp
            </Button>
            <Link href="/wishlist" onClick={close} className="py-2 text-center eyebrow text-ink">
              <span className="link-draw">Open the full wishlist</span>
            </Link>
          </div>
        ) : null
      }
    >
      {list.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center py-12 text-center">
          <span className="flex size-16 items-center justify-center rounded-full border border-line text-gold-deep">
            <HeartIcon className="size-6" />
          </span>
          <p className="mt-6 max-w-label font-serif text-2xl font-light text-ink">Keep the pieces you love here.</p>
          <p className="mt-3 max-w-label text-sm text-stone">
            Tap the heart on any piece. Your wishlist stays on this device, ready to share or bring to the showroom.
          </p>
          <div className="mt-8">
            <Button href="/collections" arrow onClick={close}>
              Explore collections
            </Button>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col">
          {list.map((p) => {
            const img = pieceImage(p);
            return (
              <li key={p.slug} className="flex gap-5 border-b border-line py-5 first:pt-0">
                <Link href={productPath(p)} onClick={close} className="relative block size-24 shrink-0 overflow-hidden bg-ivory">
                  <Image src={img.src} alt={img.alt} fill sizes="96px" className="object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link href={productPath(p)} onClick={close} className="font-serif text-xl leading-snug text-ink hover:text-gold-deep">
                    {p.name}
                  </Link>
                  <span className="mt-1 text-xs text-stone">
                    {p.code} · {p.purity} · {formatGrams(p.weight)}
                  </span>
                  <span className="mt-2 text-sm text-ink">
                    ≈ <Price product={p} />
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(p.slug)}
                    aria-label={`Remove ${p.name} from wishlist`}
                    className="mt-auto self-start pt-2 text-xs text-stone underline-offset-4 hover:text-ink hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}
