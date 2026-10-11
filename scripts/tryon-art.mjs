// Renders scripts/tryon-svg/*.svg to transparent PNGs in public/tryon (run after tryon-art.py).
import sharp from "sharp";
import { mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const src = join("scripts", "tryon-svg");
const out = join("public", "tryon");
mkdirSync(out, { recursive: true });
for (const f of readdirSync(src).filter((x) => x.endsWith(".svg"))) {
  const name = f.replace(".svg", ".png");
  await sharp(join(src, f), { density: 72 }).png({ compressionLevel: 9, palette: false }).toFile(join(out, name));
  console.log(name);
}
