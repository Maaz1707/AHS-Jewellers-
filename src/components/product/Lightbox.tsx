"use client";

import Image from "@/components/ui/Img";
import { useRef } from "react";
import { createPortal } from "react-dom";
import { useHydrated } from "@/lib/motion";
import { useFocusTrap, useOverlayTransition } from "@/lib/overlay";
import { useZoom } from "@/lib/useZoom";
import { ChevronLeft, ChevronRight, CloseIcon, ZoomInIcon, ZoomOutIcon } from "../ui/Icons";

export type GalleryItem = { src: string; alt: string; label: string };

type Props = {
  items: GalleryItem[];
  index: number;
  open: boolean;
  onClose: () => void;
  onIndex: (i: number) => void;
  title: string;
};

/**
 * Full-screen viewer. Arrow keys, swipe, Escape; focus stays inside while open.
 * Double-click or double-tap zooms in at that point (the pointer or finger then
 * pans); swiping between images waits until the zoom is off.
 */
export default function Lightbox({ items, index, open, onClose, onIndex, title }: Props) {
  const hydrated = useHydrated();
  const { mounted, visible } = useOverlayTransition(open, 500);
  const panel = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  useFocusTrap(panel, open, onClose);
  const zoom = useZoom(2.5);

  if (!hydrated || !mounted) return null;

  const go = (d: number) => {
    zoom.reset();
    onIndex((index + d + items.length) % items.length);
  };
  const item = items[index];
  const img = item;

  return createPortal(
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={`${title}, image ${index + 1} of ${items.length}`}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      className={`fixed inset-0 z-50 flex flex-col bg-white transition-opacity duration-500 ease-luxe ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="shell flex h-16 shrink-0 items-center justify-between md:h-20">
        <p className="eyebrow text-stone">
          <span className="text-ink">{title}</span>
          <span className="ml-3 figures">
            {index + 1} / {items.length}
          </span>
          <span className="ml-3 hidden text-gold-deep md:inline">{item.label}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={zoom.toggle}
            aria-pressed={zoom.zoomed}
            aria-label={zoom.zoomed ? "Zoom out" : "Zoom in"}
            className="relative hit-area flex size-10 items-center justify-center text-ink hover:text-gold-deep"
          >
            {zoom.zoomed ? <ZoomOutIcon className="size-5" /> : <ZoomInIcon className="size-5" />}
          </button>
          <button type="button" data-autofocus="" onClick={onClose} aria-label="Close viewer" className="-mr-2 relative hit-area flex size-10 items-center justify-center text-ink hover:text-gold-deep">
            <CloseIcon className="size-6" />
          </button>
        </div>
      </div>

      <div
        className={`relative flex-1 select-none overflow-hidden ${zoom.zoomed ? "cursor-zoom-out touch-none" : "cursor-zoom-in touch-pan-y"}`}
        onDoubleClick={zoom.frame.onDoubleClick}
        onPointerMove={zoom.frame.onPointerMove}
        onPointerDown={(e) => {
          startX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          zoom.frame.onPointerUp(e);
          if (startX.current === null || zoom.zoomed) return;
          const dx = e.clientX - startX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          startX.current = null;
        }}
      >
        <div className="absolute inset-0 transition-transform duration-500 ease-luxe" style={zoom.style}>
          <Image
            key={item.src}
            src={img.src}
            alt={img.alt}
            fill
            sizes="100vw"
            className="object-contain [animation:toast-in_0.5s_var(--ease-luxe)]"
            draggable={false}
          />
        </div>
      </div>

      {items.length > 1 ? (
        <div className="shell flex h-20 shrink-0 items-center justify-center gap-6">
          <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="flex size-12 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white">
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex gap-2">
            {items.map((it, i) => (
              <button
                key={it.src}
                type="button"
                onClick={() => {
                  zoom.reset();
                  onIndex(i);
                }}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={`h-px w-8 transition-colors ${i === index ? "bg-gold" : "bg-line-strong hover:bg-stone"}`}
              />
            ))}
          </div>
          <button type="button" onClick={() => go(1)} aria-label="Next image" className="flex size-12 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white">
            <ChevronRight className="size-5" />
          </button>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
