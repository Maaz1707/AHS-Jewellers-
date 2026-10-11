/** Hosts whose photographs this site’s optimiser resizes (also listed in next.config.ts). */
export const OPTIMISED_HOST = /^https:\/\/images\.(pexels|unsplash)\.com\//;

/**
 * Ask the stock CDN for a compressed copy no wider than 2000 px, so the
 * optimiser never has to download a full-size original.
 */
export function upstreamSrc(src: string) {
  if (!OPTIMISED_HOST.test(src) || src.includes("?")) return src;
  return src.includes("images.pexels.com") ? `${src}?auto=compress&cs=tinysrgb&w=2000` : `${src}?auto=format&fit=max&w=2000&q=80`;
}

/** The optimised, same-origin URL for a stock photograph, for places that cannot use next/image (canvas). */
export const optimisedImage = (src: string, width: 640 | 750 | 828 | 1080 | 1200 | 1920, quality = 75) =>
  `/_next/image?url=${encodeURIComponent(upstreamSrc(src))}&w=${width}&q=${quality}`;
