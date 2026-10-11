"use client";

import Image from "@/components/ui/Img";
import { useRef, useState, type PointerEvent } from "react";
import { useReducedMotion } from "@/lib/motion";
import { useUI } from "@/store";
import { ExpandIcon } from "../ui/Icons";
import Lightbox, { type GalleryItem } from "./Lightbox";

type Props = { items: GalleryItem[]; title: string };

/**
 * Desktop: thumbnails beside a large frame that magnifies under the cursor.
 * Phones: a swipeable strip with a counter. Either opens the full-screen viewer.
 */
export default function ProductGallery({ items, title }: Props) {
  const [index, setIndex] = useState(0);
  const lightboxOpen = useUI((s) => s.overlay === "lightbox");
  const openOverlay = useUI((s) => s.open);
  const closeOverlay = useUI((s) => s.close);
  const reduced = useReducedMotion();
  const zoomImg = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [zooming, setZooming] = useState(false);

  const openViewer = (i: number) => {
    setIndex(i);
    openOverlay("lightbox");
  };

  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "mouse" || !zoomImg.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    zoomImg.current.style.transformOrigin = `${x}% ${y}%`;
  };

  const onStripScroll = () => {
    const el = strip.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  };

  const current = items[Math.min(index, items.length - 1)];

  return (
    <div>
      {/* ---------------- Desktop ---------------- */}
      <div className="hidden gap-4 md:flex">
        {items.length > 1 ? (
          <ul className="flex w-20 shrink-0 flex-col gap-3" aria-label="Choose an image">
            {items.map((it, i) => (
              <li key={it.src}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show image ${i + 1}: ${it.label}`}
                  aria-current={i === index ? "true" : undefined}
                  className={`relative block aspect-portrait w-full overflow-hidden bg-ivory transition-opacity duration-300 ${
                    i === index ? "opacity-100 outline outline-1 outline-offset-2 outline-gold" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={it.src} alt="" fill sizes="80px" className="object-cover" />
                </button>
                <span className="mt-1 block text-center text-micro uppercase tracking-wide text-stone">{it.label}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <button
          type="button"
          onClick={() => openViewer(index)}
          onPointerEnter={(e) => e.pointerType === "mouse" && !reduced && setZooming(true)}
          onPointerLeave={() => setZooming(false)}
          onPointerMove={onMove}
          aria-label={`Open ${title} full screen, image ${index + 1} of ${items.length}`}
          className={`group relative block aspect-portrait flex-1 overflow-hidden bg-ivory ${zooming ? "cursor-zoom-in" : ""}`}
        >
          <div
            ref={zoomImg}
            className="absolute inset-0 transition-transform duration-500 ease-luxe"
            style={{ transform: zooming ? "scale(2)" : "scale(1)" }}
          >
            <Image key={current.src} src={current.src} alt={current.alt} fill priority sizes="(min-width: 1024px) 50vw, 90vw" className="object-cover [animation:menu-in_0.6s_var(--ease-luxe)]" />
          </div>
          <span className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 px-3 py-2 eyebrow text-ink opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
            <ExpandIcon className="size-4" />
            Full screen
          </span>
        </button>
      </div>

      {/* ---------------- Phones ---------------- */}
      <div className="relative md:hidden">
        <div
          ref={strip}
          onScroll={onStripScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          aria-label={`${title} images`}
        >
          {items.map((it, i) => (
            <button
              key={it.src}
              type="button"
              onClick={() => openViewer(i)}
              aria-label={`Open image ${i + 1} of ${items.length} full screen`}
              className="relative aspect-portrait w-full shrink-0 snap-center bg-ivory"
            >
              <Image src={it.src} alt={it.alt} fill priority={i === 0} sizes="100vw" className="object-cover" />
            </button>
          ))}
        </div>
        {items.length > 1 ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-center gap-2" aria-hidden="true">
            {items.map((it, i) => (
              <span key={it.src} className={`h-px w-6 transition-colors ${i === index ? "bg-ink" : "bg-ink/25"}`} />
            ))}
          </div>
        ) : null}
        <span className="pointer-events-none absolute left-4 top-4 bg-white/90 px-2 py-1 text-micro uppercase tracking-wide text-ink">
          {current.label} · {index + 1}/{items.length}
        </span>
      </div>

      <Lightbox items={items} index={index} open={lightboxOpen} onClose={closeOverlay} onIndex={setIndex} title={title} />
    </div>
  );
}
