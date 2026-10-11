// Renders the app icons in public/icons from the monogram (src/data/monogram.ts).
// Run after scripts/monogram.py.
import sharp from "sharp";
import { readFileSync } from "node:fs";

const src = readFileSync("src/data/monogram.ts", "utf8");
const get = (k) => src.match(new RegExp(`${k}: "([^"]+)"`))[1];
const outer = get("outer"), inner = get("inner"), letters = get("letters"), rule = get("rule"), petal = get("petal");

/** Square icon: ink ground, gold arch, ivory letters. `safe` shrinks the mark for maskable icons. */
const svg = (safe) => {
  // The mark is 100 x 120; the square tile is 120 x safe on each side, centred on it.
  const vbW = 120 * safe;
  const vbH = vbW;
  const x = 50 - vbW / 2, y = 60 - vbH / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${vbW} ${vbH}">
<rect x="${x}" y="${y}" width="${vbW}" height="${vbH}" fill="#1A1714"/>
<path d="${outer}" fill="none" stroke="#C9A86A" stroke-width="1.8" stroke-linejoin="round"/>
<path d="${inner}" fill="none" stroke="#C9A86A" stroke-width="0.8" stroke-linejoin="round"/>
<path d="${letters}" fill="#F3E7CF"/>
<path d="${rule}" stroke="#C9A86A" stroke-width="0.8"/>
<path d="${petal}" fill="#C9A86A"/>
</svg>`;
};

const jobs = [
  ...[48, 72, 96, 128, 144, 152, 192, 256, 384, 512].map((s) => [`icon-${s}.png`, s, 1.18]),
  ["apple-touch-icon.png", 180, 1.25],
  ["maskable-192.png", 192, 1.6],
  ["maskable-512.png", 512, 1.6],
];
for (const [name, size, safe] of jobs) {
  await sharp(Buffer.from(svg(safe)), { density: Math.ceil((size / 140) * 96) + 24 }).resize(size, size).png().toFile(`public/icons/${name}`);
}
console.log("icons", jobs.length);
