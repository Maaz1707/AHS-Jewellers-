/**
 * Checks that every image and video URL in src/data/media.ts responds.
 * Usage: npm run verify:media
 */
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/data/media.ts", import.meta.url), "utf8");

// px(12345) shorthand -> full Pexels URL; pv(id, "file") -> full video URL.
const urls = new Set();
for (const [, id] of source.matchAll(/px\((\d+)\)/g)) urls.add(`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`);
for (const [, id, file] of source.matchAll(/pv\((\d+),\s*"([^"]+)"\)/g)) urls.add(`https://videos.pexels.com/video-files/${id}/${file}`);
for (const [url] of source.matchAll(/https:\/\/images\.pexels\.com\/[^"`\s]+\.(?:jpe?g|png)/g)) {
  if (!url.includes("${")) urls.add(url);
}

const check = async (url) => {
  const isImage = url.includes("images.pexels.com");
  const target = isImage ? `${url}?auto=compress&cs=tinysrgb&w=400` : url;
  try {
    const res = await fetch(target, { method: isImage ? "GET" : "HEAD" });
    const type = res.headers.get("content-type") ?? "";
    const ok = res.ok && (isImage ? type.startsWith("image/") : type.startsWith("video/"));
    return { url, ok, status: res.status, type };
  } catch (error) {
    return { url, ok: false, status: 0, type: String(error) };
  }
};

const results = [];
const list = [...urls];
for (let i = 0; i < list.length; i += 8) results.push(...(await Promise.all(list.slice(i, i + 8).map(check))));

const failed = results.filter((r) => !r.ok);
console.log(`Checked ${results.length} media URLs: ${results.length - failed.length} OK, ${failed.length} failed.`);
for (const f of failed) console.log(`  FAIL ${f.status} ${f.type}  ${f.url}`);
process.exit(failed.length ? 1 : 0);
