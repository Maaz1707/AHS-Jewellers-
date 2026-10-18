"use client";

import Image from "@/components/ui/Img";
import { useRef, useState } from "react";
import { useUI } from "@/store";
import { useZoom } from "@/lib/useZoom";
import { ExpandIcon, ZoomInIcon, ZoomOutIcon } from "../ui/Icons";
import Lightbox, { type GalleryItem } from "./Lightbox";

type Props = { items: GalleryItem[]; title: string };

const control =
  "relative hit-area flex size-10 items-center justify-center rounded-full border border-line-strong bg-white/90 text-ink backdrop-blur-sm transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-white";

/**
 * Desktop: thumbnails beside a large still frame. Nothing moves on hover:
 * double-click zooms in at that point (the pointer then pans), double-click
 * again zooms out; the zoom and full-screen buttons do the same for everyone.
 * Phones: a swipeable strip with a counter; a tap opens the full-screen viewer.
 */
export default function ProductGallery({ items, title }: Props) {
  const [index, setIndex] = useState(0);
  const lightboxOpen = useUI((s) => s.overlay === "lightbox");
  const openOverlay = useUI((s) => s.open);
  const closeOverlay = useUI((s) => s.close);
  const strip = useRef<HTMLDivElement>(null);
  const zoom = useZoom(2.5);

  const show = (i: number) => {
    zoom.reset();
    setIndex(i);
  };

  const openViewer = (i: number) => {
    zoom.reset();
    setIndex(i);
    openOverlay("lightbox");
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
                  onClick={() => show(i)}
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

        <div onPointerLeave={zoom.reset} className="product-stage group relative aspect-portrait flex-1 overflow-hidden">
          <div
            {...zoom.frame}
            className={`absolute inset-0 select-none ${zoom.zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
          >
            <div className="absolute inset-0 transition-transform duration-500 ease-luxe" style={zoom.style}>
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                fill
                loading="eager"
                fetchPriority="high"
                draggable={false}
                sizes="(min-width: 1024px) 50vw, (min-width: 768px) 90vw, 100vw"
                className="object-cover [animation:menu-in_0.6s_var(--ease-luxe)]"
              />
            </div>
          </div>

          <p
            aria-hidden="true"
            className={`pointer-events-none absolute left-4 top-4 bg-white/90 px-3 py-1 text-xs text-ink-soft transition-opacity duration-300 ${
              zoom.zoomed ? "opacity-0" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            Double-click to zoom
          </p>

          {/* Top corner: the frame is sticky and can run below the fold, so its foot is not always in view. */}
          <div className="absolute right-4 top-4 flex gap-2">
            <button
              type="button"
              onClick={zoom.toggle}
              aria-pressed={zoom.zoomed}
              aria-label={zoom.zoomed ? "Zoom out" : "Zoom in"}
              className={control}
            >
              {zoom.zoomed ? <ZoomOutIcon className="size-4" /> : <ZoomInIcon className="size-4" />}
            </button>
            <button type="button" onClick={() => openViewer(index)} aria-label={`Open ${title} full screen, image ${index + 1} of ${items.length}`} className={control}>
              <ExpandIcon className="size-4" />
            </button>
          </div>
        </div>
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
              className="product-stage relative aspect-portrait w-full shrink-0 snap-center"
            >
              <Image src={it.src} alt={it.alt} fill loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "auto"} sizes="(min-width: 1024px) 50vw, (min-width: 768px) 90vw, 100vw" className="object-cover" />
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
        <span className="pointer-events-none absolute bottom-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-ink" aria-hidden="true">
          <ExpandIcon className="size-4" />
        </span>
      </div>

      <Lightbox items={items} index={index} open={lightboxOpen} onClose={closeOverlay} onIndex={setIndex} title={title} />
    </div>
  );
}
