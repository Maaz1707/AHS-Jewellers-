import type { TryOnPiece } from "@/data/tryon";

/**
 * Geometry for the virtual try-on. Points are in canvas pixels.
 * Landmark indices are from MediaPipe’s 478-point face mesh.
 */
export type Pt = { x: number; y: number };

export type Pose = {
  /** Earlobes: [the person’s right ear (viewer’s left in a plain photo), left ear]. */
  ears: [Pt, Pt];
  /** Centre of the neckline where a necklace’s top line sits. */
  neck: Pt;
  /** Cheek-to-cheek width. */
  faceWidth: number;
  /** Head tilt in radians. */
  roll: number;
  /** How visible each ear is (0 hidden behind the cheek, 1 fully visible) as the head turns. */
  earVisible: [number, number];
};

const LM = { cheekR: 234, cheekL: 454, chin: 152, nose: 1 } as const;

/**
 * Offsets in face widths, measured by running detection on the model
 * photograph and solving for its hand-measured earlobes and neckline, so the
 * camera and the model photo place pieces the same way.
 */
const EAR_DOWN = 0.13;
const EAR_OUT = 0.035;
const NECK_DOWN = 0.14;
/** Cheek landmarks sit inside the face outline; this brings their width up to the cheek-to-cheek width pieces are sized against. */
const WIDTH_SCALE = 1.09;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** Turn normalised face landmarks into a pose in canvas pixels. */
export function poseFromLandmarks(lm: { x: number; y: number }[], w: number, h: number): Pose {
  const p = (i: number) => ({ x: lm[i].x * w, y: lm[i].y * h });
  const a = p(LM.cheekR);
  const b = p(LM.cheekL);
  const chin = p(LM.chin);
  const nose = p(LM.nose);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const faceWidth = Math.hypot(dx, dy) || 1;
  const right = { x: dx / faceWidth, y: dy / faceWidth };
  const down = { x: -right.y, y: right.x };
  const at = (o: Pt, d: number, s: number) => ({
    x: o.x + down.x * d * faceWidth + right.x * s * faceWidth,
    y: o.y + down.y * d * faceWidth + right.y * s * faceWidth,
  });
  // Nose position across the face: 0.5 is straight on. Turning hides the far ear.
  const across = ((nose.x - a.x) * right.x + (nose.y - a.y) * right.y) / faceWidth;
  return {
    ears: [at(a, EAR_DOWN, -EAR_OUT), at(b, EAR_DOWN, EAR_OUT)],
    neck: at(chin, NECK_DOWN, 0),
    faceWidth: faceWidth * WIDTH_SCALE,
    roll: Math.atan2(dy, dx),
    earVisible: [clamp((across - 0.22) / 0.12), clamp((0.78 - across) / 0.12)],
  };
}

/** Blend towards the new pose so the jewellery does not jitter. */
export function smoothPose(prev: Pose | null, next: Pose, k = 0.45): Pose {
  if (!prev) return next;
  const m = (a: number, b: number) => a + (b - a) * k;
  const mp = (a: Pt, b: Pt) => ({ x: m(a.x, b.x), y: m(a.y, b.y) });
  return {
    ears: [mp(prev.ears[0], next.ears[0]), mp(prev.ears[1], next.ears[1])],
    neck: mp(prev.neck, next.neck),
    faceWidth: m(prev.faceWidth, next.faceWidth),
    roll: m(prev.roll, next.roll),
    earVisible: [m(prev.earVisible[0], next.earVisible[0]), m(prev.earVisible[1], next.earVisible[1])],
  };
}

function drawAt(ctx: CanvasRenderingContext2D, img: HTMLImageElement, piece: TryOnPiece, at: Pt, faceWidth: number, roll: number, flip = false, alpha = 1) {
  if (alpha <= 0.02 || !img.complete || !img.naturalWidth) return;
  const w = piece.scale * faceWidth;
  const h = (img.naturalHeight / img.naturalWidth) * w;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(at.x, at.y);
  // Earrings hang straight down whatever the tilt; necklaces follow the head a little.
  ctx.rotate(piece.kind === "necklace" ? roll * 0.5 : 0);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -piece.anchor.x * w, -piece.anchor.y * h, w, h);
  ctx.restore();
}

/** Draw the chosen pieces for a pose. Necklace first, so earrings sit over it. */
export function drawPieces(
  ctx: CanvasRenderingContext2D,
  pose: Pose,
  worn: { piece: TryOnPiece; img: HTMLImageElement }[],
) {
  for (const { piece, img } of worn.filter((x) => x.piece.kind === "necklace")) {
    drawAt(ctx, img, piece, pose.neck, pose.faceWidth, pose.roll);
  }
  for (const { piece, img } of worn.filter((x) => x.piece.kind === "earrings")) {
    drawAt(ctx, img, piece, pose.ears[0], pose.faceWidth, pose.roll, false, pose.earVisible[0]);
    drawAt(ctx, img, piece, pose.ears[1], pose.faceWidth, pose.roll, true, pose.earVisible[1]);
  }
}

/** Cover-fit a source of size sw×sh into w×h: the scale and offsets. */
export function coverFit(sw: number, sh: number, w: number, h: number) {
  const s = Math.max(w / sw, h / sh);
  return { s, ox: (w - sw * s) / 2, oy: (h - sh * s) / 2 };
}
