import type { NextConfig } from "next";

/**
 * Stock photographs are resized by this site's own optimiser at /_next/image
 * (WebP/AVIF, same origin, cached for a month). Only the hosts below are
 * optimised; image links from other hosts are shown as they are (see
 * src/components/ui/Img.tsx), so the optimiser is never an open proxy.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Phase 1 URLs, kept working after the Phase 2 route names were settled.
  async redirects() {
    return [
      { source: "/products/:slug", destination: "/jewellery/:slug", permanent: false },
      { source: "/gold/rates", destination: "/gold-rate", permanent: false },
      { source: "/our-story/craft", destination: "/craft", permanent: false },
      { source: "/our-story/hallmarking", destination: "/hallmarking", permanent: false },
      { source: "/our-story/heritage", destination: "/our-story", permanent: false },
      { source: "/visit/book", destination: "/book-a-visit", permanent: false },
      { source: "/visit/contact", destination: "/contact", permanent: false },
      { source: "/visit/showroom", destination: "/contact", permanent: false },
      { source: "/visit", destination: "/contact", permanent: false },
      // Phase 3
      { source: "/gold/savings-scheme", destination: "/savings-scheme", permanent: false },
      // Phase 4
      { source: "/gold/digital-gold", destination: "/digital-gold", permanent: false },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
