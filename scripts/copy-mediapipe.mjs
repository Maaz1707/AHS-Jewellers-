// Copies the MediaPipe vision runtime (WebAssembly) from node_modules into
// /public so the virtual try-on loads it from this site, not a third-party CDN.
// Runs automatically before `dev` and `build`.
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const from = join("node_modules", "@mediapipe", "tasks-vision", "wasm");
const to = join("public", "mediapipe", "wasm");

if (!existsSync(from)) {
  console.warn("[copy-mediapipe] @mediapipe/tasks-vision is not installed; skipping.");
  process.exit(0);
}
mkdirSync(to, { recursive: true });
for (const f of readdirSync(from)) copyFileSync(join(from, f), join(to, f));
console.log(`[copy-mediapipe] ${readdirSync(to).length} files copied to ${to}`);
