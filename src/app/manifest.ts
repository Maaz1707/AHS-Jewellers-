import type { MetadataRoute } from "next";
import { site } from "@/data/site";

const sizes = [48, 72, 96, 128, 144, 152, 192, 256, 384, 512];

/** Web app manifest: installable in the shop’s name, ivory splash, ink icon. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: "/?source=app",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#faf7f2",
    theme_color: "#faf7f2",
    lang: "en-IN",
    categories: ["shopping", "lifestyle"],
    icons: [
      ...sizes.map((s) => ({ src: `/icons/icon-${s}.png`, sizes: `${s}x${s}`, type: "image/png", purpose: "any" as const })),
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Today’s gold rate", short_name: "Rate", url: "/gold-rate", icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }] },
      { name: "Book a visit", short_name: "Visit", url: "/book-a-visit", icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }] },
      { name: "My savings scheme", short_name: "Scheme", url: "/account", icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }] },
    ],
  };
}
