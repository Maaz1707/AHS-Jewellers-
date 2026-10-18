"use client";

import { useEffect, useRef, useState } from "react";
import { images, type ImageKey } from "@/data/media";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion, useReducedMotion, usePageVisible } from "@/lib/motion";
import { useDragScroll } from "@/lib/useDragScroll";
import Button from "../ui/Button";
import { PlayPause } from "../ui/Controls";
import Image from "../ui/Img";
import Sheen from "../ui/Sheen";
import VideoBlock from "../ui/VideoBlock";

/** The lookbook: five portraits from the bridal salon. */
const FRAMES: { image: ImageKey; caption: string }[] = [
  { image: "bridePortraitIvory", caption: "The engagement, in ivory and polki" },
  { image: "brideGoldChoker", caption: "Mehendi, with a gold choker" },
  { image: "brideVelvet", caption: "The wedding, in velvet and kundan" },
  { image: "brideTikkaDetail", caption: "A maang tikka, set by hand" },
  { image: "brideIvoryLehenga", caption: "The reception, lighter gold" },
];

/** Pixels per second the lookbook drifts. */
const SPEED = 28;

function Frame({ image, caption, hidden = false }: { image: ImageKey; caption: string; hidden?: boolean }) {
  return (
    <li aria-hidden={hidden || undefined} className="flex shrink-0 items-end gap-4 pr-10 md:pr-14">
      <span className="relative block h-40 w-32 shrink-0 overflow-hidden bg-ivory">
        <Image src={images[image].src} alt={hidden ? "" : images[image].alt} fill sizes="128px" className="object-cover" draggable={false} />
      </span>
      <span className="w-40 pb-1 font-serif text-lg italic leading-snug text-ink-soft">{caption}</span>
    </li>
  );
}

/**
 * A slow marquee of the lookbook. Drifts by itself; pauses under the mouse,
 * with keyboard focus, off screen, or with the pause button; can be dragged
 * either way. With reduced motion it is a still row to swipe or drag.
 */
function Lookbook() {
  const reduced = useReducedMotion();
  const pageVisible = usePageVisible();
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const still = useRef<HTMLUListElement>(null);
  const position = useRef(0);
  const [stopped, setStopped] = useState(false);
  const stoppedRef = useRef(stopped);
  useEffect(() => {
    stoppedRef.current = stopped;
  }, [stopped]);
  useDragScroll(still);

  useEffect(() => {
    const box = wrap.current;
    const el = track.current;
    if (reduced || !pageVisible || !box || !el || stopped) return;
    let x = position.current;
    let last = performance.now();
    let raf = 0;
    let hover = false;
    let focus = false;
    let seen = false;
    let drag: { start: number; x0: number; moved: boolean } | null = null;

    let width = el.scrollWidth / 2;
    const resize = new ResizeObserver(() => { width = el.scrollWidth / 2; });
    resize.observe(el);
    const half = () => width;
    const place = () => {
      const h = half();
      if (h > 0) x = ((x % h) - h) % h;
      el.style.transform = `translate3d(${x}px, 0, 0)`;
    };
    const tick = (now: number) => {
      raf = 0;
      if (!seen || hover || focus || stoppedRef.current) return;
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      if (!drag && !hover && !focus && seen && !stoppedRef.current) {
        x -= SPEED * dt;
        place();
      }
      raf = requestAnimationFrame(tick);
    };
    const resume = () => {
      if (!raf && seen && !hover && !focus && !stoppedRef.current) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen) resume();
      else { cancelAnimationFrame(raf); raf = 0; }
    });
    io.observe(box);
    const enter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hover = true;
    };
    const leave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") { hover = false; resume(); }
    };
    const focusIn = () => {
      focus = true;
    };
    const focusOut = () => {
      focus = false;
      resume();
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if ((e.target as Element).closest("button")) return;
      drag = { start: e.clientX, x0: x, moved: false };
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.start;
      if (Math.abs(dx) > 4) drag.moved = true;
      x = drag.x0 + dx;
      place();
    };
    const up = () => {
      drag = null;
    };

    box.addEventListener("pointerenter", enter);
    box.addEventListener("pointerleave", leave);
    box.addEventListener("focusin", focusIn);
    box.addEventListener("focusout", focusOut);
    box.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      position.current = x;
      cancelAnimationFrame(raf);
      io.disconnect();
      resize.disconnect();
      box.removeEventListener("pointerenter", enter);
      box.removeEventListener("pointerleave", leave);
      box.removeEventListener("focusin", focusIn);
      box.removeEventListener("focusout", focusOut);
      box.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [reduced, pageVisible, stopped]);

  if (reduced) {
    return (
      <ul ref={still} aria-label="The bridal lookbook" className="no-scrollbar flex cursor-grab overflow-x-auto px-5 md:px-10 xl:px-16">
        {FRAMES.map((f) => (
          <Frame key={f.image} {...f} />
        ))}
      </ul>
    );
  }

  return (
    <div ref={wrap} className="relative flex items-center gap-4">
      <div className="min-w-0 flex-1 cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing">
        <ul ref={track} aria-label="The bridal lookbook" className="flex w-max will-change-transform">
          {FRAMES.map((f) => (
            <Frame key={f.image} {...f} />
          ))}
          {FRAMES.map((f) => (
            <Frame key={`${f.image}-again`} {...f} hidden />
          ))}
        </ul>
      </div>
      <div className="shrink-0 bg-white pr-5 md:pr-10 xl:pr-16">
        <PlayPause enabled stopped={stopped} onToggle={() => setStopped((s) => !s)} label="the lookbook" />
      </div>
    </div>
  );
}

/**
 * The bridal campaign in one screen: a full-bleed film with one large italic
 * line, and beneath it the lookbook drifting slowly past.
 */
export default function BridalCampaign() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-campaign-line]",
        { autoAlpha: 0, y: 32 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 60%", once: true } },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="campaign-title" className="flex flex-col bg-white lg:h-svh">
      {/* The film */}
      <div className="campaign-film relative overflow-hidden bg-ink text-white">
        <VideoBlock video="bridalCampaign" control controlPosition="top-right" className="absolute inset-0" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/80 via-ink/20 to-ink/10" />
        <div className="shell pointer-events-none relative flex h-full flex-col justify-end pb-10 md:pb-14">
          <p className="eyebrow flex items-center gap-4 text-gold-pale">
            <span aria-hidden="true" className="h-px w-8 bg-gold-pale" />
            The bridal salon
          </p>
          <h2 id="campaign-title" data-campaign-line="" className="mt-6 max-w-content display-hero">
            <em>Seven ceremonies.</em>
            <br />
            <Sheen tone="gold-pale" className="italic">
              One trousseau.
            </Sheen>
          </h2>
          <div className="pointer-events-auto mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-prose text-white/85">
              Planned upstairs, over tea, with the whole family: kundan, polki and meenakari for every function from the
              haldi to the vidaai.
            </p>
            <Button href="/collections/bridal" variant="outline-light" arrow>
              The Bridal collection
            </Button>
          </div>
        </div>
      </div>

      {/* The lookbook */}
      <div className="py-6 md:py-8">
        <Lookbook />
      </div>
    </section>
  );
}
