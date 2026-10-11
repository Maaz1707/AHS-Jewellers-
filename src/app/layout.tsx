import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { site } from "@/data/site";
import { INTRO_SCRIPT } from "@/lib/intro";
import ServiceWorker from "@/components/app/ServiceWorker";
import StoreHydrator from "@/components/providers/StoreHydrator";
import Toaster from "@/components/ui/Toaster";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Bridal, Diamond and Gold Jewellery in ${site.address.city}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${site.name}: ${site.tagline}` }],
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
  appleWebApp: {
    capable: true,
    title: site.shortName,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Shared by the public site and the admin panel. Site chrome lives in (site)/layout. */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        {/* Decides before first paint whether the first-visit opening plays (see lib/intro.ts). */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body>
        <noscript>
          <style>{`[data-reveal]{visibility:visible!important}`}</style>
        </noscript>
        <StoreHydrator />
        <ServiceWorker />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
