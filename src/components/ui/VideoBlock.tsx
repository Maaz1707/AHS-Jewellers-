"use client";

import Image from "@/components/ui/Img";
import { useEffect, useRef, useState } from "react";
import { videos, type MediaVideo, type VideoKey } from "@/data/media";
import { useReducedMotion } from "@/lib/motion";
import { PauseIcon, PlayIcon } from "./Icons";

type Props = {
  video: VideoKey;
  className?: string;
  /** Load and play straight away (hero). Otherwise loads when near the viewport. */
  eager?: boolean;
  /** Controlled playback, e.g. only the active craft step plays. */
  active?: boolean;
  /** Show a small pause / play control. */
  control?: boolean;
  controlPosition?: "bottom-left" | "bottom-right";
  sizes?: string;
  priority?: boolean;
};

/**
 * Muted, looping, inline background video with a poster image underneath.
 * Off-screen videos never download; on-screen ones pause when scrolled away.
 * With reduced motion the poster is shown and playback waits for the user.
 */
const POSITIONED = /(^|\s)(absolute|fixed)(\s|$)/;

export default function VideoBlock({
  video,
  className = "",
  eager = false,
  active = true,
  control = false,
  controlPosition = "bottom-right",
  sizes = "100vw",
  priority = false,
}: Props) {
  const data: MediaVideo = videos[video];
  const wrap = useRef<HTMLDivElement>(null);
  const el = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(eager);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);

  // Hero films wait until the page has finished loading, so the poster and text
  // paint first. On Save-Data or slow connections the poster stays on its own.
  useEffect(() => {
    if (!eager) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn?.saveData || /(^|-)(2g|3g)$/.test(conn?.effectiveType ?? "")) return;
    let idle = 0;
    const start = () => {
      idle = window.setTimeout(() => setNear(true), 600);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      window.clearTimeout(idle);
    };
  }, [eager]);

  // Only fetch the file when the block approaches the viewport.
  useEffect(() => {
    const node = wrap.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !eager) setNear(true);
      },
      { rootMargin: "400px 0px" },
    );
    const view = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    io.observe(node);
    view.observe(node);
    return () => {
      io.disconnect();
      view.disconnect();
    };
  }, [eager]);

  // Reduced motion: paused unless the user presses play.
  const paused = userPaused ?? reduced;
  const shouldPlay = near && inView && active && !paused;

  useEffect(() => {
    const v = el.current;
    if (!v || !near) return;
    if (shouldPlay) {
      const p = v.play();
      if (p) p.catch(() => setPlaying(false));
    } else {
      v.pause();
    }
  }, [shouldPlay, near]);

  const posterSrc = data.poster;


  return (
    <div
      ref={wrap}
      // Callers may position the block themselves (e.g. "absolute inset-0").
      className={`${POSITIONED.test(className) ? "" : "relative"} overflow-hidden bg-ink ${className}`}
    >
      <Image
        src={posterSrc}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
      {near ? (
        <video
          ref={el}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ease-luxe ${
            playing ? "opacity-100" : "opacity-0"
          }`}
          muted
          loop
          playsInline
          preload={eager ? "auto" : "metadata"}
          aria-label={data.alt}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          {data.sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} media={s.media} />
          ))}
        </video>
      ) : null}

      {control ? (
        <button
          type="button"
          onClick={() => setUserPaused(!paused)}
          aria-label={paused ? "Play video" : "Pause video"}
          className={`absolute bottom-5 z-10 hit-area flex size-10 items-center justify-center rounded-full border border-white/50 text-white backdrop-blur-sm transition-colors duration-500 hover:bg-white hover:text-ink md:bottom-8 ${
            controlPosition === "bottom-right" ? "right-5 md:right-10 xl:right-16" : "left-5 md:left-10 xl:left-16"
          }`}
        >
          {paused ? <PlayIcon className="size-4" /> : <PauseIcon className="size-4" />}
        </button>
      ) : null}
    </div>
  );
}
