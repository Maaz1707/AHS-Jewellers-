"use client";

import type { Product } from "@/data/products";
import { useHydrated } from "@/lib/motion";
import { useToast, useWishlist } from "@/store";
import { HeartIcon } from "./Icons";

type Props = {
  product: Pick<Product, "slug" | "name">;
  /** "icon": round button for cards. "full": labelled outline button. "text": quiet labelled action. */
  variant?: "icon" | "full" | "text";
  className?: string;
};

/** Toggle a piece in the wishlist, with a toast that links to it. */
export default function WishlistButton({ product, variant = "icon", className = "" }: Props) {
  const saved = useWishlist((s) => s.slugs.includes(product.slug));
  const toggle = useWishlist((s) => s.toggle);
  const show = useToast((s) => s.show);
  const hydrated = useHydrated();
  const isSaved = hydrated && saved;

  const onClick = () => {
    const now = toggle(product.slug);
    show(
      now
        ? { title: "Saved to your wishlist", body: product.name, action: { label: "View wishlist", href: "/wishlist" } }
        : { title: "Removed from your wishlist", body: product.name },
    );
  };

  const label = isSaved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`;

  if (variant === "text") {
    return (
      <button type="button" onClick={onClick} aria-pressed={isSaved} className={`group inline-flex h-12 items-center gap-2 eyebrow text-ink hover:text-gold-deep ${className}`}>
        <HeartIcon filled={isSaved} className={`size-4 transition-transform duration-300 ease-luxe group-active:scale-90 ${isSaved ? "text-gold-deep" : ""}`} />
        <span className="link-draw">{isSaved ? "Saved" : "Save"}</span>
      </button>
    );
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isSaved}
        className={`group flex h-12 items-center justify-center gap-3 border border-line-strong px-5 eyebrow text-ink transition-colors duration-500 hover:border-ink ${className}`}
      >
        <HeartIcon
          filled={isSaved}
          className={`size-4 transition-transform duration-500 ease-luxe group-active:scale-90 ${isSaved ? "text-gold-deep" : ""}`}
        />
        {isSaved ? "Saved" : "Wishlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSaved}
      aria-label={label}
      className={`hit-area flex size-10 items-center justify-center rounded-full bg-white/90 text-ink backdrop-blur-sm transition-[color,transform] duration-500 ease-luxe hover:text-gold-deep active:scale-90 ${className}`}
    >
      <HeartIcon filled={isSaved} className={`size-4 ${isSaved ? "text-gold-deep" : ""}`} />
    </button>
  );
}
