"use client";

import Image from "@/components/ui/Img";
import Link from "next/link";
import { useMemo, useState } from "react";
import { categories, categoryBySlug, collectionBySlug, collections } from "@/data/collections";
import type { Product } from "@/data/products";
import { productPath } from "@/lib/enquiry";
import { formatGrams, formatINR } from "@/lib/format";
import { useHydrated } from "@/lib/motion";
import { pieceImage } from "@/lib/pieces";
import { priceFor } from "@/lib/pricing";
import { useProducts, useRates, useToast } from "@/store";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import { EditIcon, EyeIcon, PlusIcon, TrashIcon } from "../ui/Icons";
import Modal from "../ui/Modal";
import { AdminEmpty, AdminPageHeader, AdminSelect, Pill, SearchBox } from "./AdminUI";
import PieceForm from "./PieceForm";

export default function PiecesManager() {
  const hydrated = useHydrated();
  const products = useProducts((s) => s.products);
  const upsert = useProducts((s) => s.upsert);
  const remove = useProducts((s) => s.remove);
  const rates = useRates((s) => s.rates);
  const show = useToast((s) => s.show);
  const [q, setQ] = useState("");
  const [collection, setCollection] = useState("all");
  const [category, setCategory] = useState("all");
  const [visibility, setVisibility] = useState("all");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const list = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return products
      .filter((p) => collection === "all" || p.collection === collection)
      .filter((p) => category === "all" || p.category === category)
      .filter((p) => visibility === "all" || (visibility === "hidden" ? p.hidden : !p.hidden))
      .filter((p) => words.every((w) => `${p.name} ${p.code}`.toLowerCase().includes(w)))
      .sort((a, b) => b.added.localeCompare(a.added));
  }, [products, q, collection, category, visibility]);

  if (!hydrated) return <div className="skeleton h-96 w-full" aria-label="Loading pieces" />;

  const toggle = (p: Product) => {
    upsert({ ...p, hidden: !p.hidden });
    show({ title: p.hidden ? "Piece is back on the site" : "Piece hidden from the site", body: p.name });
  };
  const clearFilters = () => {
    setQ("");
    setCollection("all");
    setCategory("all");
    setVisibility("all");
  };

  const actions = (p: Product) => (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`} className="relative hit-area flex size-10 items-center justify-center text-ink-soft hover:bg-ivory hover:text-ink">
        <EditIcon className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => toggle(p)}
        aria-label={p.hidden ? `Show ${p.name} on the site` : `Hide ${p.name} from the site`}
        aria-pressed={!p.hidden}
        className="relative hit-area flex size-10 items-center justify-center text-ink-soft hover:bg-ivory hover:text-ink"
      >
        <EyeIcon off={p.hidden} className="size-5" />
      </button>
      <button type="button" onClick={() => setDeleting(p)} aria-label={`Delete ${p.name}`} className="relative hit-area flex size-10 items-center justify-center text-ink-soft hover:bg-ivory hover:text-error">
        <TrashIcon className="size-5" />
      </button>
    </div>
  );

  return (
    <div>
      <AdminPageHeader
        title="Pieces"
        intro="Every piece on the site. Changes show on the shop straight away; hidden pieces stay here but disappear from the site."
        actions={
          <Button onClick={() => setEditing("new")} size="lg" magnetic={false} icon={<PlusIcon className="size-4" />}>
            Add a piece
          </Button>
        }
      />

      <div className="mt-8 flex flex-col gap-3 lg:flex-row">
        <SearchBox value={q} onChange={setQ} placeholder="Search by name or code" label="Search pieces" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex">
          <AdminSelect label="Collection" value={collection} onChange={setCollection}>
            <option value="all">All collections</option>
            {collections.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </AdminSelect>
          <AdminSelect label="Category" value={category} onChange={setCategory}>
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </AdminSelect>
          <AdminSelect label="Visibility" value={visibility} onChange={setVisibility}>
            <option value="all">Shown and hidden</option>
            <option value="shown">Shown on site</option>
            <option value="hidden">Hidden</option>
          </AdminSelect>
        </div>
      </div>
      <p className="mt-4 text-sm text-stone" aria-live="polite">
        Showing {list.length} of {products.length} pieces
      </p>

      {list.length === 0 ? (
        <div className="mt-6">
          <AdminEmpty
            title="No pieces match"
            body="Try a different search or clear the filters."
            action={
              <Button variant="secondary" onClick={clearFilters} magnetic={false}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden overflow-x-auto border border-line bg-white lg:block">
            <table className="w-full text-left text-base">
              <caption className="sr-only">Pieces, with collection, purity, weight, making charge, price and whether they are shown</caption>
              <thead>
                <tr className="border-b border-line-strong text-sm text-stone">
                  <th scope="col" className="px-4 py-3 font-normal">Piece</th>
                  <th scope="col" className="px-4 py-3 font-normal">Collection</th>
                  <th scope="col" className="px-4 py-3 text-right font-normal">Weight</th>
                  <th scope="col" className="px-4 py-3 text-right font-normal">Making</th>
                  <th scope="col" className="px-4 py-3 text-right font-normal">Price today</th>
                  <th scope="col" className="px-4 py-3 font-normal">On site</th>
                  <th scope="col" className="px-4 py-3 font-normal">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => {
                  const img = pieceImage(p);
                  return (
                    <tr key={p.slug} className={`border-b border-line last:border-b-0 ${p.hidden ? "bg-ivory/60" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-4">
                          <span className={`relative block size-14 shrink-0 overflow-hidden bg-ivory ${p.hidden ? "opacity-50" : ""}`}>
                            <Image src={img.src} alt="" fill sizes="56px" className="object-cover" />
                          </span>
                          <span className="min-w-0">
                            <Link href={productPath(p)} target="_blank" className="link-draw block text-ink">
                              {p.name}
                            </Link>
                            <span className="text-sm text-stone">{p.code}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {collectionBySlug(p.collection)?.name}
                        <span className="block text-sm text-stone">{categoryBySlug(p.category)?.name}</span>
                      </td>
                      <td className="px-4 py-3 text-right figures text-ink">
                        {formatGrams(p.weight)}
                        <span className="block text-sm text-stone">{p.purity}</span>
                      </td>
                      <td className="px-4 py-3 text-right figures text-ink-soft">{Math.round(p.making * 1000) / 10}%</td>
                      <td className="px-4 py-3 text-right figures text-ink">{formatINR(priceFor(p, rates))}</td>
                      <td className="px-4 py-3">{p.hidden ? <Pill>Hidden</Pill> : <Pill tone="good">Shown</Pill>}</td>
                      <td className="px-2 py-3">{actions(p)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Phone and tablet cards */}
          <ul className="mt-6 flex flex-col gap-3 lg:hidden">
            {list.map((p) => {
              const img = pieceImage(p);
              return (
                <li key={p.slug} className="flex gap-4 border border-line bg-white p-4">
                  <span className={`relative block size-20 shrink-0 overflow-hidden bg-ivory ${p.hidden ? "opacity-50" : ""}`}>
                    <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base text-ink">{p.name}</p>
                    <p className="text-sm text-stone">
                      {p.code} · {p.purity} · {formatGrams(p.weight)}
                    </p>
                    <p className="mt-1 text-sm text-ink figures">{formatINR(priceFor(p, rates))}</p>
                    <div className="mt-2 flex items-center justify-between">
                      {p.hidden ? <Pill>Hidden</Pill> : <Pill tone="good">Shown</Pill>}
                      {actions(p)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        eyebrow={editing === "new" ? "New piece" : "Edit piece"}
        title={editing === "new" || editing === null ? "Add a piece" : editing.name}
      >
        {editing ? (
          <PieceForm
            key={editing === "new" ? "new" : editing.slug}
            piece={editing === "new" ? undefined : editing}
            onDone={(saved, isNew) => {
              setEditing(null);
              show({
                title: isNew ? "Piece added" : "Changes saved",
                body: `${saved.name} ${saved.hidden ? "is saved but hidden" : "is live on the site"}.`,
                action: saved.hidden ? undefined : { label: "View on the site", href: productPath(saved) },
              });
            }}
          />
        ) : null}
      </Drawer>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} eyebrow="Delete piece" title={`Delete ${deleting?.name ?? "this piece"}?`}>
        <p className="text-base text-ink-soft">
          It will be removed from the site and from this list. If you only want to take it off the site for now, hide it
          instead.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button
            magnetic={false}
            onClick={() => {
              if (!deleting) return;
              remove(deleting.slug);
              show({ title: "Piece deleted", body: deleting.name });
              setDeleting(null);
            }}
          >
            Delete piece
          </Button>
          {deleting && !deleting.hidden ? (
            <Button
              variant="secondary"
              magnetic={false}
              onClick={() => {
                toggle(deleting);
                setDeleting(null);
              }}
            >
              Hide instead
            </Button>
          ) : null}
          <button type="button" onClick={() => setDeleting(null)} className="text-base text-stone hover:text-ink">
            Keep it
          </button>
        </div>
      </Modal>
    </div>
  );
}
