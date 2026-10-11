"use client";

import Image from "@/components/ui/Img";
import Link from "next/link";
import { categories, collections } from "@/data/collections";
import { images } from "@/data/media";
import type { MainNavItem } from "@/data/navigation";
import { useVisibleProducts } from "@/lib/pieces";
import TextLink from "../ui/TextLink";


/** Staggered entrance for each item in a freshly opened panel. */
const stagger = (i: number) => ({ animationDelay: `${80 + i * 45}ms` });
const itemIn = "opacity-0 [animation:menu-in_0.7s_var(--ease-luxe)_forwards]";

export default function MegaMenu({ item, id, onNavigate }: { item: MainNavItem; id: string; onNavigate: () => void }) {
  const feature = images[item.feature.image];
  const visible = useVisibleProducts();
  const countIn = (slug: string) => visible.filter((p) => p.collection === slug).length;

  return (
    <div id={id} className="shell grid grid-cols-12 gap-10 py-12 xl:gap-16">
      {item.key === "collections" ? (
        <>
          <nav aria-label="Collections" className="col-span-4">
            <p className={`eyebrow text-gold-deep ${itemIn}`} style={stagger(0)}>
              Collections
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {collections.map((c, i) => (
                <li key={c.slug} className={itemIn} style={stagger(i + 1)}>
                  <Link
                    href={`/collections/${c.slug}`}
                    onClick={onNavigate}
                    className="group/item flex items-baseline gap-4 font-serif text-3xl font-light text-ink transition-colors duration-500 hover:text-gold-deep focus-visible:text-gold-deep"
                  >
                    <span className="link-draw">{c.name}</span>
                    <span className="text-xs figures text-stone opacity-0 transition-opacity duration-500 group-hover/item:opacity-100 group-focus-visible/item:opacity-100">
                      {countIn(c.slug)} pieces
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Shop by category" className="col-span-3 border-l border-line pl-10 xl:pl-16">
            <p className={`eyebrow text-gold-deep ${itemIn}`} style={stagger(1)}>
              Shop by category
            </p>
            <ul className="mt-6 flex flex-col gap-4">
              {categories
                .filter((c) => c.inMenu)
                .map((c, i) => (
                  <li key={c.slug} className={itemIn} style={stagger(i + 2)}>
                    <Link
                      href={`/category/${c.slug}`}
                      onClick={onNavigate}
                      className="link-draw text-sm text-ink-soft transition-colors hover:text-ink"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
            </ul>
            <div className={`mt-10 ${itemIn}`} style={stagger(8)}>
              <div className="flex flex-wrap gap-x-10 gap-y-4">
                <TextLink href="/collections" onClick={onNavigate}>
                  All collections
                </TextLink>
                <TextLink href="/collections?online=1" onClick={onNavigate}>
                  Available online
                </TextLink>
                <TextLink href="/try-on" onClick={onNavigate}>
                  Virtual try-on
                </TextLink>
              </div>
            </div>
          </nav>
        </>
      ) : (
        <nav aria-label={item.label} className="col-span-7">
          <p className={`eyebrow text-gold-deep ${itemIn}`} style={stagger(0)}>
            {item.label}
          </p>
          <ul className={`mt-6 grid grid-cols-1 gap-x-10 gap-y-8 ${(item.links?.length ?? 0) > 3 ? "xl:grid-cols-2" : ""}`}>
            {item.links?.map((l, i) => (
              <li key={l.href} className={itemIn} style={stagger(i + 1)}>
                <Link href={l.href} onClick={onNavigate} className="group/item block">
                  <span className="link-draw font-serif text-3xl font-light text-ink transition-colors duration-500 group-hover/item:text-gold-deep">
                    {l.label}
                  </span>
                  {l.note ? <span className="mt-2 block max-w-label text-sm text-stone">{l.note}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <Link
        href={item.feature.href}
        onClick={onNavigate}
        className={`group col-span-5 grid grid-cols-5 items-end gap-6 ${itemIn}`}
        style={stagger(2)}
      >
        <span className="relative col-span-3 block aspect-portrait overflow-hidden bg-ivory">
          <Image
            src={feature.src}
            alt={feature.alt}
            fill
            sizes="22vw"
            className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-105"
          />
        </span>
        <span className="col-span-2 flex flex-col gap-3 pb-2">
          <span className="eyebrow text-gold-deep">{item.feature.eyebrow}</span>
          <span className="font-serif text-2xl font-light leading-snug text-ink">{item.feature.title}</span>
          <span className="mt-2 eyebrow text-ink">
            <span className="link-draw pb-1">Discover</span>
          </span>
        </span>
      </Link>
    </div>
  );
}
