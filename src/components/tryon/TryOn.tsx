"use client";

import Image from "@/components/ui/Img";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { images } from "@/data/media";
import { tryOnById, tryOnModel, tryOnPieces, type TryOnKind, type TryOnPiece } from "@/data/tryon";
import { site } from "@/data/site";
import { productPath, useProductEnquiry } from "@/lib/enquiry";
import { formatGrams } from "@/lib/format";
import { useHydrated } from "@/lib/motion";
import { optimisedImage } from "@/lib/images";
import { coverFit, drawPieces, poseFromLandmarks, smoothPose, type Pose } from "@/lib/tryon";
import type { Product } from "@/data/products";
import { useProducts, useToast } from "@/store";
import Button from "../ui/Button";
import { CalendarIcon, CameraIcon, CloseIcon, DownloadIcon, LockIcon, RefreshIcon, ShareIcon, WhatsAppIcon } from "../ui/Icons";
import Modal from "../ui/Modal";
import Price from "../ui/Price";
import { DemoTag } from "../ui/Tags";

type Mode = "intro" | "starting" | "camera" | "photo";
type Landmarker = {
  detectForVideo: (v: HTMLVideoElement, t: number) => { faceLandmarks: { x: number; y: number }[][] };
  close: () => void;
};

const MODEL_SRC = optimisedImage(images[tryOnModel.image].src, 1080);

/**
 * MediaPipe’s WebAssembly runtime writes its start-up diagnostics to the
 * console (one of them as an error). Only those lines are held back, and only
 * while the try-on is open; everything else passes straight through.
 */
const MEDIAPIPE_LOG = /^(?:[IWEF]\d{4} \d\d:\d\d:\d\d|INFO: Created TensorFlow Lite|Graph successfully started running)/;
function quietMediaPipe() {
  const methods = ["log", "info", "warn", "error"] as const;
  const original = methods.map((m) => console[m]);
  methods.forEach((m, i) => {
    console[m] = (...args: unknown[]) => {
      if (typeof args[0] === "string" && MEDIAPIPE_LOG.test(args[0])) return;
      original[i].apply(console, args);
    };
  });
  return () => methods.forEach((m, i) => (console[m] = original[i]));
}

/** Load the MediaPipe face landmarker from files served by this site (see scripts/copy-mediapipe.mjs). */
async function loadLandmarker(): Promise<Landmarker> {
  const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
  const fileset = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
  const make = (delegate: "GPU" | "CPU") =>
    FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: "/mediapipe/face_landmarker.task", delegate },
      runningMode: "VIDEO",
      numFaces: 1,
    });
  try {
    return (await make("GPU")) as unknown as Landmarker;
  } catch {
    return (await make("CPU")) as unknown as Landmarker;
  }
}

const cameraMessage = (err: unknown) => {
  const name = (err as { name?: string })?.name;
  if (name === "NotAllowedError" || name === "SecurityError") return "Camera access was not allowed, so here is our model instead. You can turn the camera on from your browser’s site settings at any time.";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "We could not find a camera on this device, so here is our model instead.";
  if (name === "NotReadableError") return "Your camera is busy in another app, so here is our model instead.";
  return "The camera could not start on this device, so here is our model instead.";
};

export default function TryOn() {
  const hydrated = useHydrated();
  const params = useSearchParams();
  const products = useProducts((s) => s.products);
  const show = useToast((s) => s.show);

  const initial = tryOnById(params.get("piece"));
  const [kind, setKind] = useState<TryOnKind>(initial?.kind ?? "earrings");
  const [earrings, setEarrings] = useState<string | null>(initial?.kind === "necklace" ? null : (initial?.id ?? "temple-jhumka"));
  const [necklace, setNecklace] = useState<string | null>(initial?.kind === "necklace" ? initial.id : null);
  const [focus, setFocus] = useState<string>(initial?.id ?? "temple-jhumka");
  const [mode, setMode] = useState<Mode>("intro");
  const [notice, setNotice] = useState<string | null>(null);
  const [noFace, setNoFace] = useState(false);
  const [shot, setShot] = useState<{ url: string; blob: Blob } | null>(null);

  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const landmarker = useRef<Landmarker | null>(null);
  const pose = useRef<Pose | null>(null);
  const lastSeen = useRef(0);
  const art = useRef<Record<string, HTMLImageElement>>({});
  const model = useRef<HTMLImageElement | null>(null);
  const worn = useRef<TryOnPiece[]>([]);
  const wearing = [earrings, necklace].map((id) => tryOnById(id)).filter((p): p is TryOnPiece => Boolean(p));
  const wearingNames = wearing.map((p) => p.name).join(" and ") || "no pieces";
  // The drawing loop reads the pieces from a ref so it never restarts.
  useEffect(() => {
    worn.current = [earrings, necklace].map((id) => tryOnById(id)).filter((p): p is TryOnPiece => Boolean(p));
  }, [earrings, necklace]);

  useEffect(() => quietMediaPipe(), []);

  // Preload the artwork and the model photograph once.
  useEffect(() => {
    for (const p of tryOnPieces) {
      const img = new window.Image();
      img.src = p.src;
      art.current[p.id] = img;
    }
    const m = new window.Image();
    m.crossOrigin = "anonymous";
    m.src = MODEL_SRC;
    model.current = m;
  }, []);

  /** Size the canvas to the stage at device resolution. */
  const fit = useCallback(() => {
    const c = canvas.current;
    const s = stage.current;
    if (!c || !s) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(s.clientWidth * dpr);
    const h = Math.round(s.clientHeight * dpr);
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
    }
  }, []);

  const pieces = () => worn.current.map((piece) => ({ piece, img: art.current[piece.id] }));

  /** Draw the model photograph with the chosen pieces. */
  const drawPhoto = useCallback(() => {
    const c = canvas.current;
    const img = model.current;
    if (!c || !img) return;
    fit();
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const paint = () => {
      const { s, ox, oy } = coverFit(img.naturalWidth, img.naturalHeight, c.width, c.height);
      const iw = img.naturalWidth * s;
      const ih = img.naturalHeight * s;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(img, ox, oy, iw, ih);
      const at = (p: { x: number; y: number }) => ({ x: ox + p.x * iw, y: oy + p.y * ih });
      drawPieces(
        ctx,
        {
          ears: [at(tryOnModel.ears[0]), at(tryOnModel.ears[1])],
          neck: at(tryOnModel.neck),
          faceWidth: tryOnModel.faceWidth * iw,
          roll: (tryOnModel.roll * Math.PI) / 180,
          earVisible: [1, 1],
        },
        pieces(),
      );
    };
    const ready = [img, ...worn.current.map((p) => art.current[p.id])].every((i) => i?.complete && i.naturalWidth);
    if (ready) paint();
    else {
      const all = [img, ...worn.current.map((p) => art.current[p.id])].filter(Boolean);
      Promise.all(all.map((i) => i.decode().catch(() => undefined))).then(paint);
    }
  }, [fit]);

  const stopCamera = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    pose.current = null;
  }, []);

  const showModel = useCallback(
    (why?: string) => {
      stopCamera();
      setNotice(why ?? null);
      setNoFace(false);
      setMode("photo");
    },
    [stopCamera],
  );

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      showModel("This browser cannot use the camera here, so here is our model instead.");
      return;
    }
    setMode("starting");
    setNotice(null);
    try {
      const [s, lm] = await Promise.all([
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false }),
        landmarker.current ? Promise.resolve(landmarker.current) : loadLandmarker(),
      ]);
      landmarker.current = lm;
      stream.current = s;
      const v = video.current!;
      v.srcObject = s;
      await v.play();
      lastSeen.current = performance.now();
      setMode("camera");
    } catch (err) {
      showModel(cameraMessage(err));
    }
  };

  // Camera loop: detect, smooth, draw, mirrored like a looking glass.
  useEffect(() => {
    if (mode !== "camera") return;
    let raf = 0;
    let missing = false;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const c = canvas.current;
      const v = video.current;
      const lm = landmarker.current;
      if (!c || !v || !lm || v.readyState < 2 || !v.videoWidth) return;
      fit();
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const { s, ox, oy } = coverFit(v.videoWidth, v.videoHeight, c.width, c.height);
      const w = v.videoWidth * s;
      const h = v.videoHeight * s;
      ctx.setTransform(-1, 0, 0, 1, c.width, 0);
      ctx.drawImage(v, ox, oy, w, h);
      const now = performance.now();
      const result = lm.detectForVideo(v, now);
      const face = result.faceLandmarks?.[0];
      if (face) {
        const raw = poseFromLandmarks(face, w, h);
        const shift = (p: { x: number; y: number }) => ({ x: p.x + ox, y: p.y + oy });
        pose.current = smoothPose(pose.current, { ...raw, ears: [shift(raw.ears[0]), shift(raw.ears[1])], neck: shift(raw.neck) });
        lastSeen.current = now;
      }
      const lost = now - lastSeen.current > 700;
      if (lost !== missing) {
        missing = lost;
        setNoFace(lost);
        if (lost) pose.current = null;
      }
      if (pose.current && !lost) drawPieces(ctx, pose.current, pieces());
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, fit]);

  // Redraw the model photograph whenever the pieces or the size change.
  useEffect(() => {
    if (mode !== "photo") return;
    drawPhoto();
    const ro = new ResizeObserver(() => drawPhoto());
    if (stage.current) ro.observe(stage.current);
    return () => ro.disconnect();
  }, [mode, earrings, necklace, drawPhoto]);

  // Release the camera when leaving the page or hiding the tab.
  useEffect(() => {
    const onHide = () => {
      if (document.hidden && stream.current) showModel("The camera was paused while this page was in the background.");
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      stopCamera();
      landmarker.current?.close();
      landmarker.current = null;
    };
  }, [stopCamera, showModel]);

  useEffect(() => () => {
    if (shot) URL.revokeObjectURL(shot.url);
  }, [shot]);

  const choose = (p: TryOnPiece) => {
    setFocus(p.id);
    if (p.kind === "earrings") setEarrings((cur) => (cur === p.id ? null : p.id));
    else setNecklace((cur) => (cur === p.id ? null : p.id));
  };

  const capture = () => {
    const c = canvas.current;
    if (!c || !c.width) return;
    const out = document.createElement("canvas");
    out.width = c.width;
    out.height = c.height;
    const ctx = out.getContext("2d")!;
    ctx.drawImage(c, 0, 0);
    // A quiet signature along the bottom edge.
    const pad = Math.round(out.width * 0.04);
    const size = Math.max(14, Math.round(out.width * 0.035));
    const grad = ctx.createLinearGradient(0, out.height - size * 4, 0, out.height);
    grad.addColorStop(0, "rgba(26,23,20,0)");
    grad.addColorStop(1, "rgba(26,23,20,0.55)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, out.height - size * 4, out.width, size * 4);
    ctx.fillStyle = "#ffffff";
    ctx.font = `${size}px Georgia, serif`;
    ctx.textBaseline = "bottom";
    ctx.fillText(`${site.name} · Virtual try-on`, pad, out.height - pad);
    try {
      out.toBlob((blob) => {
        if (blob) setShot({ blob, url: URL.createObjectURL(blob) });
      }, "image/jpeg", 0.92);
    } catch {
      show({ title: "Could not save this photo", body: "Your browser blocked it. Try again with the camera on." });
    }
  };

  const focused = tryOnById(focus) ?? tryOnPieces[0];
  const product = products.find((p) => p.slug === focused.productSlug && !p.hidden);
  const list = tryOnPieces.filter((p) => p.kind === kind);
  const active = mode === "camera" || mode === "photo";

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
      {/* ------------------------------------------------------------ Stage */}
      <div className="min-w-0 lg:col-span-7">
        <div ref={stage} className="relative aspect-tall w-full overflow-hidden bg-ink">
          <video ref={video} playsInline muted className="hidden" aria-hidden="true" />
          <canvas
            ref={canvas}
            className={`absolute inset-0 size-full transition-opacity duration-700 ${active ? "opacity-100" : "opacity-0"}`}
            role="img"
            aria-label={mode === "camera" ? `Live camera view wearing ${wearingNames}` : `Model wearing ${wearingNames}`}
          />

          {mode === "intro" || mode === "starting" ? (
            <div className="absolute inset-0 flex flex-col justify-end">
              <Image src={images[tryOnModel.image].src} alt="" fill priority sizes="(min-width: 1024px) 56vw, 100vw" className="object-cover opacity-40" />
              <div className="relative m-4 bg-white p-6 md:m-8 md:p-8">
                <p className="eyebrow text-gold-deep">Before we begin</p>
                <p className="mt-3 font-serif text-3xl font-light text-ink">See the pieces on you, using your camera</p>
                <p className="mt-3 text-sm text-ink-soft">
                  Your browser will ask to use the camera. The picture stays on this device: nothing is recorded, saved or
                  uploaded unless you take a photo and choose to share it.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Button onClick={startCamera} disabled={!hydrated || mode === "starting"} icon={<CameraIcon className="size-4" />}>
                    {mode === "starting" ? "Starting the camera" : "Use my camera"}
                  </Button>
                  <button type="button" onClick={() => showModel()} disabled={mode === "starting"} className="eyebrow text-stone hover:text-ink">
                    <span className="link-draw">Use our model instead</span>
                  </button>
                </div>
                {mode === "starting" ? (
                  <div className="mt-6 h-px w-full overflow-hidden bg-line" aria-hidden="true">
                    <div className="skeleton h-full w-full" />
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {mode === "camera" && noFace ? (
            <p className="absolute inset-x-0 top-1/3 mx-auto w-fit bg-white/90 px-4 py-2 text-sm text-ink" role="status">
              Look straight at the camera, with your ears and neck in view.
            </p>
          ) : null}

          {/* The opening panel states the privacy promise in full. Once the model
              or camera is active, keep its compact version on the image itself. */}
          {active ? (
            <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
              <p className="flex items-center gap-2 bg-white/90 px-3 py-2 text-xs text-ink">
                <LockIcon className="size-4 shrink-0 text-gold-deep" />
                Nothing is recorded or uploaded
              </p>
              <DemoTag className="shrink-0 bg-white/90" />
            </div>
          ) : null}
        </div>

        {notice ? <p className="mt-4 border-l-2 border-gold bg-ivory p-4 text-sm text-ink-soft">{notice}</p> : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={capture} disabled={!active} icon={<CameraIcon className="size-4" />}>
              Take a photo
            </Button>
            {mode === "camera" ? (
              <button type="button" onClick={() => showModel()} className="h-12 px-2 eyebrow text-stone hover:text-ink">
                <span className="link-draw">Switch to our model</span>
              </button>
            ) : mode === "photo" ? (
              <button type="button" onClick={startCamera} className="flex h-12 items-center gap-2 px-2 eyebrow text-stone hover:text-ink">
                <RefreshIcon className="size-4" />
                <span className="link-draw">Try with my camera</span>
              </button>
            ) : null}
          </div>
          <p className="text-xs text-stone">A guide to size and style. Every piece looks better in person.</p>
        </div>
      </div>

      {/* ----------------------------------------------------------- Pieces */}
      <div className="min-w-0 lg:col-span-5">
        <div role="tablist" aria-label="Type of piece" className="flex border-b border-line">
          {(["earrings", "necklace"] as TryOnKind[]).map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={kind === k}
              onClick={() => setKind(k)}
              className={`-mb-px border-b py-4 pr-8 eyebrow transition-colors ${kind === k ? "border-gold text-ink" : "border-transparent text-stone hover:text-ink"}`}
            >
              {k === "earrings" ? "Earrings" : "Necklaces"}
            </button>
          ))}
        </div>
        <ul className="no-scrollbar -mx-5 mt-6 flex gap-3 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-2 xl:grid-cols-3" aria-label={kind === "earrings" ? "Earrings to try" : "Necklaces to try"}>
          {list.map((p) => {
            const on = p.id === earrings || p.id === necklace;
            return (
              <li key={p.id} className="w-32 shrink-0 sm:w-auto">
                <button
                  type="button"
                  onClick={() => choose(p)}
                  aria-pressed={on}
                  className={`group flex w-full flex-col items-stretch border p-3 text-left transition-colors ${on ? "border-ink" : "border-line hover:border-line-strong"}`}
                >
                  <span className="product-stage relative block aspect-square">
                    <Image data-raw="" src={p.src} alt="" fill sizes="160px" className="object-contain p-3 transition-transform duration-700 ease-luxe group-hover:scale-105" />
                    {on ? <span className="absolute right-2 top-2 size-2 rounded-full bg-gold" aria-hidden="true" /> : null}
                  </span>
                  <span className="mt-3 block font-serif text-lg leading-snug text-ink">{p.name}</span>
                  <span className="text-xs text-stone">{on ? "Wearing. Tap to remove" : "Tap to try"}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {product ? <PieceDetail product={product} piece={focused} /> : null}
      </div>

      <Modal open={shot !== null} onClose={() => setShot(null)} eyebrow="Your try-on" title="Keep or share it" size="lg">
        {shot ? <ShotActions shot={shot} name={focused.name} onClose={() => setShot(null)} /> : null}
      </Modal>
    </div>
  );
}

function PieceDetail({ product, piece }: { product: Product; piece: TryOnPiece }) {
  const enquire = useProductEnquiry(product);
  const similar = piece.productSlug !== product.slug;
  return (
    <div className="mt-8 border-t border-line pt-8">
      <p className="eyebrow text-gold-deep">{similar ? "Closest in our collection" : "The piece"}</p>
      <p className="mt-3 font-serif text-3xl font-light text-ink">
        <Link href={productPath(product)} className="link-draw">
          {product.name}
        </Link>
      </p>
      <p className="mt-1 text-sm text-stone">
        {product.code} · {product.purity} · {formatGrams(product.weight)} · ≈ <Price product={product} className="text-ink" />
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
        <Button {...enquire} external icon={<WhatsAppIcon className="size-4" />} className="w-full sm:w-auto sm:flex-1 lg:w-full lg:flex-none xl:w-auto xl:flex-1">
          Enquire on WhatsApp
        </Button>
        <Button href={`/book-a-visit?piece=${product.slug}`} variant="secondary" magnetic={false} icon={<CalendarIcon className="size-4" />} className="w-full sm:w-auto sm:flex-1 lg:w-full lg:flex-none xl:w-auto xl:flex-1">
          Try the real one
        </Button>
      </div>
    </div>
  );
}

function ShotActions({ shot, name, onClose }: { shot: { url: string; blob: Blob }; name: string; onClose: () => void }) {
  const file = () => new File([shot.blob], `ahs-try-on-${name.toLowerCase().replace(/\s+/g, "-")}.jpg`, { type: "image/jpeg" });
  const [canShare] = useState(() => {
    try {
      return typeof navigator.canShare === "function" && navigator.canShare({ files: [file()] });
    } catch {
      return false;
    }
  });
  const share = async () => {
    try {
      await navigator.share({ files: [file()], title: `${name} | ${site.name}`, text: `Trying on the ${name} from ${site.name}.` });
    } catch {
      /* closed the share sheet */
    }
  };
  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element -- a local blob, not a remote image */}
      <img src={shot.url} alt={`Your try-on photo wearing the ${name}`} className="mx-auto max-h-96 w-auto" />
      <p className="mt-4 text-xs text-stone">The photo is only on this device until you share or save it.</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {canShare ? (
          <Button onClick={share} icon={<ShareIcon className="size-4" />} magnetic={false}>
            Share
          </Button>
        ) : null}
        <a
          href={shot.url}
          download={file().name}
          data-transition="off"
          className={`inline-flex h-12 items-center gap-3 px-6 eyebrow transition-colors duration-500 ${
            canShare ? "border border-ink text-ink hover:bg-ink hover:text-white" : "bg-ink text-white hover:bg-gold-deep"
          }`}
        >
          <DownloadIcon className="size-4" />
          Save photo
        </a>
        <button type="button" onClick={onClose} className="ml-auto flex items-center gap-2 eyebrow text-stone hover:text-ink">
          <CloseIcon className="size-4" />
          Close
        </button>
      </div>
    </div>
  );
}
