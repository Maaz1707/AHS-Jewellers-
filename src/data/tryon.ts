import type { Product } from "./products";

/**
 * Virtual try-on artwork: transparent PNGs in /public/tryon, drawn for the
 * prototype to stand in for each piece. Replace with cut-out photography of
 * the real pieces (same proportions, transparent background) before launch.
 */
export type TryOnKind = "earrings" | "necklace";

export type TryOnPiece = {
  id: string;
  name: string;
  kind: TryOnKind;
  /** One earring (drawn for the left ear and mirrored) or the whole necklace. */
  src: string;
  /** The catalogue piece this artwork shows. */
  productSlug: string;
  /** Other catalogue pieces close enough in style to try this artwork for. */
  alsoFor?: string[];
  /** Width relative to the width of the face (cheek to cheek). */
  scale: number;
  /** Point of the artwork that sits on the anchor (earlobe or the centre of the neckline), as fractions of its size. */
  anchor: { x: number; y: number };
};

export const tryOnPieces: TryOnPiece[] = [
  { id: "temple-jhumka", name: "Temple Jhumka", kind: "earrings", src: "/tryon/temple-jhumka.png", productSlug: "temple-jhumka", scale: 0.27, anchor: { x: 0.5, y: 0.08 } },
  { id: "ruby-jhumka", name: "Ruby Jhumka", kind: "earrings", src: "/tryon/ruby-jhumka.png", productSlug: "ruby-jhumka", scale: 0.27, anchor: { x: 0.5, y: 0.08 } },
  { id: "panna-chandbali", name: "Panna Chandbali", kind: "earrings", src: "/tryon/panna-chandbali.png", productSlug: "panna-chandbali", scale: 0.3, anchor: { x: 0.5, y: 0.08 } },
  { id: "solitaire-studs", name: "Solitaire Studs", kind: "earrings", src: "/tryon/solitaire-studs.png", productSlug: "solitaire-studs", scale: 0.07, anchor: { x: 0.5, y: 0.5 } },
  { id: "petite-studs", name: "Petite Bar Studs", kind: "earrings", src: "/tryon/petite-studs.png", productSlug: "petite-studs", scale: 0.06, anchor: { x: 0.5, y: 0.07 } },
  {
    id: "kundan-choker",
    name: "Meenakari Bridal Choker",
    kind: "necklace",
    src: "/tryon/kundan-choker.png",
    productSlug: "meenakari-bridal-choker",
    alsoFor: ["neelkanth-kundan-set"],
    scale: 0.9,
    anchor: { x: 0.5, y: 0.22 },
  },
  {
    id: "polki-rani-haar",
    name: "Polki Rani Haar",
    kind: "necklace",
    src: "/tryon/polki-rani-haar.png",
    productSlug: "polki-rani-haar",
    alsoFor: ["satlada-bridal-necklace", "vivaah-haar-set"],
    scale: 1.0,
    anchor: { x: 0.5, y: 0.04 },
  },
  {
    id: "diamond-line",
    name: "Tennis Necklace",
    kind: "necklace",
    src: "/tryon/diamond-line.png",
    productSlug: "tennis-necklace",
    alsoFor: ["leher-diamond-necklace"],
    scale: 0.85,
    anchor: { x: 0.5, y: 0.1 },
  },
];

export const tryOnById = (id: string | null | undefined) => tryOnPieces.find((p) => p.id === id);

/**
 * The try-on artwork for a catalogue piece: its own, or the closest in style.
 * Only earrings and necklaces can be tried on.
 */
export function tryOnFor(product: Pick<Product, "slug" | "category" | "stones">): TryOnPiece | undefined {
  const own = tryOnPieces.find((p) => p.productSlug === product.slug || p.alsoFor?.includes(product.slug));
  if (own) return own;
  if (product.category === "earrings") return tryOnPieces.find((p) => p.id === (product.stones ? "panna-chandbali" : "temple-jhumka"));
  if (product.category === "necklaces") return tryOnPieces.find((p) => p.id === (product.stones ? "kundan-choker" : "polki-rani-haar"));
  return undefined;
}

/**
 * Points measured on the fallback model photograph (media.ts `tryOnModel`),
 * as fractions of the image size, so pieces sit correctly without detection.
 * The model’s right ear is on the viewer’s left.
 */
export const tryOnModel = {
  image: "tryOnModel" as const,
  /** Pixel size of the source photograph. */
  aspect: 900 / 1350,
  ears: [
    { x: 0.218, y: 0.528 },
    { x: 0.655, y: 0.522 },
  ],
  /** Where a necklace’s top line sits: the sides of the neck, just above the collarbones. */
  neck: { x: 0.44, y: 0.705 },
  /** Cheek-to-cheek width as a fraction of the image width. */
  faceWidth: 0.44,
  /** Head tilt in degrees (clockwise positive). */
  roll: 3.5,
};
