"use client";

import type { CategorySlug } from "@/data/collections";
import { images, type ImageKey } from "@/data/media";
import type { Product } from "@/data/products";
import { formatGrams } from "@/lib/format";
import { pieceImage } from "@/lib/pieces";
import Image from "../ui/Img";
import { PetalCorner } from "../ui/Motif";

/** A current ₹10 coin weighs 7.74 g: a weight most people have held. */
const COIN_GRAMS = 7.74;

/** Where each kind of piece sits, and a photograph of it being worn. */
const WORN: Partial<Record<CategorySlug, { image: ImageKey; where: string }>> = {
  necklaces: { image: "brideGoldChoker", where: "Sits at the collarbone and falls to the neckline of a blouse." },
  earrings: { image: "jhumkaWorn", where: "Hangs from the lobe to about the line of the jaw." },
  pendants: { image: "dailyLayeredWorn", where: "Rests just below the collarbone on a fine chain." },
  chains: { image: "dailyLayeredWorn", where: "Lies flat at the base of the neck, or lower with a pendant." },
  bangles: { image: "brideHands", where: "Sits at the wrist; sized to pass over the hand." },
  bracelets: { image: "brideHands", where: "Sits at the wrist bone, with room to move." },
  headpieces: { image: "brideTikkaDetail", where: "Rests on the parting, the drop at the centre of the forehead." },
  rings: { image: "diaTwinRing", where: "Sized at the counter to the finger it is meant for." },
  coins: { image: "giftCoins", where: "Sealed in its assay card, to keep or to give." },
};

/** Three crops of the piece's own photograph: focus point (fractions) and zoom. */
const CROPS = [
  { fx: 0.5, fy: 0.42, zoom: 2.2 },
  { fx: 0.28, fy: 0.3, zoom: 3 },
  { fx: 0.66, fy: 0.74, zoom: 2.6 },
];

export default function ProductCloseUp({ product }: { product: Product }) {
  const main = pieceImage(product, 0);
  const worn = WORN[product.category];
  const coins = Math.max(1, Math.round(product.weight / COIN_GRAMS));
  const notes = [
    `${product.purity} ${product.metal.toLowerCase()}, ${formatGrams(product.weight)} gross.`,
    product.stones ? `${product.stones.label}, each one set by hand.` : "Finished by hand, then polished twice.",
    "BIS hallmark and HUID, stamped where it will not show.",
  ];

  return (
    <section aria-labelledby="closeup-title" className="bg-white section-y">
      <div className="shell">
        <p className="eyebrow flex items-center gap-4 text-gold-deep">
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
          Details up close
        </p>
        <h2 id="closeup-title" className="mt-6 display-section text-ink">
          The {product.name.toLowerCase()}, <em className="text-emerald">closer</em>
        </h2>

        <ul className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
          {CROPS.map((c, i) => {
            const limit = (c.zoom - 1) * 50;
            const clamp = (v: number) => Math.max(-limit, Math.min(limit, v));
            return (
              <li key={i}>
                <div className="relative aspect-square overflow-hidden bg-ivory" data-cursor="View">
                  <div
                    className="absolute inset-0"
                    style={{
                      transform: `translate(${clamp((0.5 - c.fx) * 100 * c.zoom)}%, ${clamp((0.5 - c.fy) * 100 * c.zoom)}%) scale(${c.zoom})`,
                    }}
                  >
                    <Image src={main.src} alt="" fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover" />
                  </div>
                </div>
                <p className="mt-4 flex gap-4 text-sm text-ink-soft">
                  <span className="font-serif text-xl text-gold-deep figures">{String(i + 1).padStart(2, "0")}</span>
                  <span className="pt-1">{notes[i]}</span>
                </p>
              </li>
            );
          })}
        </ul>

        {worn ? (
          <div className="mt-20 grid items-center gap-10 md:mt-28 lg:grid-cols-12 lg:gap-10">
            <div className="relative lg:col-span-6">
              <div className="relative aspect-portrait overflow-hidden bg-ivory">
                <Image src={images[worn.image].src} alt={images[worn.image].alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              </div>
              <PetalCorner className="absolute -right-3 -top-3 size-16 -scale-x-100" />
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <p className="eyebrow flex items-center gap-4 text-gold-deep">
                <span aria-hidden="true" className="h-px w-8 bg-gold" />
                How it is worn
              </p>
              <p className="mt-6 font-serif text-3xl font-light leading-snug text-ink md:text-4xl">{worn.where}</p>
              <div className="mt-10 border-t border-line pt-6">
                <p className="eyebrow text-stone">For scale</p>
                <p className="mt-3 text-ink-soft">
                  {formatGrams(product.weight)}, about the weight of {coins === 1 ? "one ₹10 coin" : `${coins} ₹10 coins`} in the hand.
                </p>
                <div aria-hidden="true" className="mt-5 flex flex-wrap gap-2">
                  {Array.from({ length: Math.min(coins, 14) }, (_, i) => (
                    <span key={i} className="size-6 rounded-full border border-gold" />
                  ))}
                  {coins > 14 ? <span className="self-center text-xs text-stone figures">+{coins - 14}</span> : null}
                </div>
                <p className="mt-6 text-sm text-stone">Photographed on a model. Every piece can be tried at the counter, with tea.</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
