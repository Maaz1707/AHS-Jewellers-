"use client";

/* eslint-disable @next/next/no-img-element -- the preview shows any URL the owner pastes, before it is saved. */
import { useEffect, useRef, useState, type FormEvent } from "react";
import { categories, collections, type CategorySlug, type CollectionSlug } from "@/data/collections";
import type { MetalColour, Product, Purity } from "@/data/products";
import { todayKey } from "@/lib/dates";
import { formatINR } from "@/lib/format";
import { pieceImage } from "@/lib/pieces";
import { priceFor } from "@/lib/pricing";
import { useProducts, useRates } from "@/store";
import Button from "../ui/Button";
import { CheckboxField, SelectField, TextAreaField, TextField } from "../ui/Field";

const PURITIES: Purity[] = ["22K", "18K", "24K"];
const METALS: MetalColour[] = ["Yellow gold", "Rose gold", "White gold"];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "piece";

/** Next free code in a collection’s series, e.g. AHS-BR-109. */
export function suggestCode(collection: CollectionSlug, all: Product[]) {
  const prefix = collections.find((c) => c.slug === collection)?.codePrefix ?? "XX";
  const nums = all.map((p) => p.code.match(new RegExp(`^AHS-${prefix}-(\\d+)$`))?.[1]).filter(Boolean).map(Number);
  const base = { BR: 100, DM: 200, GC: 300, DW: 400, GF: 500 }[prefix] ?? 900;
  return `AHS-${prefix}-${(nums.length ? Math.max(...nums) : base) + 1}`;
}

type Draft = {
  name: string;
  code: string;
  collection: CollectionSlug;
  category: CategorySlug;
  purity: Purity;
  metal: MetalColour;
  weight: string;
  making: string;
  stonesLabel: string;
  stonesValue: string;
  image1: string;
  image2: string;
  description: string;
  shown: boolean;
};

type Errors = Partial<Record<keyof Draft, string>>;

const isUrl = (v: string) => /^https:\/\/[^\s]+$/i.test(v.trim());

export default function PieceForm({ piece, onDone }: { piece?: Product; onDone: (saved: Product, isNew: boolean) => void }) {
  const all = useProducts((s) => s.products);
  const upsert = useProducts((s) => s.upsert);
  const rates = useRates((s) => s.rates);
  const original = piece ? [pieceImage(piece, 0).src, piece.images[1] ? pieceImage(piece, 1).src : ""] : ["", ""];

  const [d, setD] = useState<Draft>(() =>
    piece
      ? {
          name: piece.name,
          code: piece.code,
          collection: piece.collection,
          category: piece.category,
          purity: piece.purity,
          metal: piece.metal,
          weight: String(piece.weight),
          making: String(Math.round(piece.making * 1000) / 10),
          stonesLabel: piece.stones?.label ?? "",
          stonesValue: piece.stones ? String(piece.stones.value) : "",
          image1: original[0],
          image2: original[1],
          description: piece.description,
          shown: !piece.hidden,
        }
      : {
          name: "",
          code: suggestCode("gold-classics", all),
          collection: "gold-classics",
          category: "bangles",
          purity: "22K",
          metal: "Yellow gold",
          weight: "",
          making: "14",
          stonesLabel: "",
          stonesValue: "",
          image1: "",
          image2: "",
          description: "",
          shown: true,
        },
  );
  const [errors, setErrors] = useState<Errors>({});
  const [imgOk, setImgOk] = useState<boolean | null>(null);
  const [attempt, setAttempt] = useState(0);
  const form = useRef<HTMLFormElement>(null);

  // After a failed save renders its errors, move focus to the first one.
  useEffect(() => {
    if (attempt) form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [attempt]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setD((cur) => {
      const next = { ...cur, [k]: v };
      // New pieces: keep the code in step with the chosen collection.
      if (!piece && k === "collection") next.code = suggestCode(v as CollectionSlug, all);
      return next;
    });
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
    if (k === "image1") setImgOk(null);
  };

  const weight = Number(d.weight);
  const making = Number(d.making);
  const stones = d.stonesValue.trim() ? Number(d.stonesValue.replace(/[^\d.]/g, "")) : 0;
  const preview: Product | null =
    weight > 0 && making >= 0
      ? { ...(piece ?? ({} as Product)), purity: d.purity, weight, making: making / 100, stones: stones ? { label: d.stonesLabel, value: stones } : undefined } as Product
      : null;

  const validate = (): Errors => {
    const e: Errors = {};
    if (!d.name.trim()) e.name = "Give the piece a name.";
    if (!/^AHS-[A-Z]{2}-\d{3,4}$/.test(d.code.trim())) e.code = "Use the form AHS-BR-109.";
    else if (all.some((p) => p.code === d.code.trim() && p.slug !== piece?.slug)) e.code = "Another piece already uses this code.";
    if (!(weight > 0 && weight <= 2000)) e.weight = "Enter the gold weight in grams, for example 18.6.";
    if (!(making >= 0 && making <= 60)) e.making = "Enter a making charge between 0 and 60%.";
    if (d.stonesValue.trim() && !(stones >= 0)) e.stonesValue = "Enter the stone value in rupees, or leave it empty.";
    if (stones && !d.stonesLabel.trim()) e.stonesLabel = "Describe the stones, for example 0.40 ct diamonds.";
    if (!isUrl(d.image1)) e.image1 = "Paste an image link starting with https://";
    else if (imgOk === false) e.image1 = "This link does not open an image. Copy the image address again and paste it here.";
    if (d.image2.trim() && !isUrl(d.image2)) e.image2 = "Paste an image link starting with https://, or leave it empty.";
    if (d.description.trim().length < 20) e.description = "Write a sentence or two about the piece.";
    return e;
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      setAttempt((a) => a + 1);
      return;
    }
    // Keep media keys for photographs that were not changed, so their alt text survives.
    const keepOrUrl = (i: number, value: string) => (piece && value.trim() === original[i] ? piece.images[i] : value.trim());
    const images = [keepOrUrl(0, d.image1), ...(d.image2.trim() ? [keepOrUrl(1, d.image2)] : [])];
    let slug = piece?.slug ?? slugify(d.name);
    if (!piece) {
      let n = 2;
      const base = slug;
      while (all.some((p) => p.slug === slug)) slug = `${base}-${n++}`;
    }
    const saved: Product = {
      ...(piece ?? {}),
      slug,
      code: d.code.trim(),
      name: d.name.trim(),
      collection: d.collection,
      category: d.category,
      purity: d.purity,
      metal: d.metal,
      weight: Math.round(weight * 100) / 100,
      making: making / 100,
      stones: stones ? { label: d.stonesLabel.trim(), value: stones } : undefined,
      images,
      description: d.description.trim(),
      hidden: !d.shown,
      added: piece?.added ?? todayKey(),
    };
    upsert(saved);
    onDone(saved, !piece);
  };

  return (
    <form ref={form} onSubmit={onSubmit} noValidate className="flex flex-col gap-2" aria-label={piece ? `Edit ${piece.name}` : "Add a piece"}>
      <TextField label="Name" value={d.name} onChange={(e) => set("name", e.target.value)} error={errors.name} placeholder="Temple Jhumka" />
      <div className="grid gap-x-6 sm:grid-cols-2">
        <SelectField label="Collection" value={d.collection} onChange={(e) => set("collection", e.target.value as CollectionSlug)}>
          {collections.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </SelectField>
        <SelectField label="Category" value={d.category} onChange={(e) => set("category", e.target.value as CategorySlug)}>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </SelectField>
        <TextField label="Product code" value={d.code} onChange={(e) => set("code", e.target.value.toUpperCase())} error={errors.code} hint={piece ? undefined : "Suggested for the collection."} />
        <SelectField label="Purity" value={d.purity} onChange={(e) => set("purity", e.target.value as Purity)}>
          {PURITIES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </SelectField>
        <SelectField label="Metal colour" value={d.metal} onChange={(e) => set("metal", e.target.value as MetalColour)}>
          {METALS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </SelectField>
        <TextField label="Gold weight (grams)" inputMode="decimal" value={d.weight} onChange={(e) => set("weight", e.target.value)} error={errors.weight} placeholder="18.6" />
        <TextField label="Making charge (%)" inputMode="decimal" value={d.making} onChange={(e) => set("making", e.target.value)} error={errors.making} hint="Of the gold value." />
        <TextField label="Stone value (₹, optional)" inputMode="numeric" value={d.stonesValue} onChange={(e) => set("stonesValue", e.target.value)} error={errors.stonesValue} />
      </div>
      <TextField label="Stones (optional)" value={d.stonesLabel} onChange={(e) => set("stonesLabel", e.target.value)} error={errors.stonesLabel} placeholder="0.40 ct diamonds, VS-GH" />

      <div className="grid gap-x-6 sm:grid-cols-[1fr_auto] sm:items-start">
        <TextField
          label="Main photograph (link)"
          type="url"
          value={d.image1}
          onChange={(e) => set("image1", e.target.value)}
          error={errors.image1}
          placeholder="https://"
          hint={imgOk === false ? "This link does not show an image. Check it opens in a browser." : imgOk ? "Image found." : undefined}
        />
        <div className="relative mb-8 mt-2 size-24 overflow-hidden border border-line bg-ivory sm:mt-6" aria-hidden="true">
          {isUrl(d.image1) ? (
            <img src={d.image1} alt="" className="size-full object-cover" onLoad={() => setImgOk(true)} onError={() => setImgOk(false)} />
          ) : (
            <span className="flex size-full items-center justify-center p-2 text-center text-xs text-stone">Preview</span>
          )}
        </div>
      </div>
      <TextField label="Second photograph (link, optional)" type="url" value={d.image2} onChange={(e) => set("image2", e.target.value)} error={errors.image2} placeholder="https://" hint="Shown when a visitor hovers over the piece." />
      <TextAreaField label="Description" value={d.description} onChange={(e) => set("description", e.target.value)} error={errors.description} hint="Two sentences in the house voice." />
      <CheckboxField label="Show this piece on the site" checked={d.shown} onChange={(e) => set("shown", e.target.checked)} />

      <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base text-stone">
          Price at today’s rate: <span className="font-serif text-2xl text-ink figures">{preview ? formatINR(priceFor(preview, rates)) : "–"}</span>
        </p>
        <Button type="submit" size="lg" magnetic={false}>
          {piece ? "Save changes" : "Add piece"}
        </Button>
      </div>
    </form>
  );
}
