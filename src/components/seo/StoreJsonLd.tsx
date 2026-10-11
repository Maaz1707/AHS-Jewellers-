import { images } from "@/data/media";
import { site } from "@/data/site";

/** schema.org JewelryStore, built from the SAMPLE details in site.ts. */
export default function StoreJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: site.name,
    description: site.description,
    url: site.url,
    logo: `${site.url}/icons/icon-512.png`,
    image: [`${site.url}/og.jpg`, images.showroomSalon.src],
    telephone: site.phone.href.replace("tel:", ""),
    email: site.email,
    foundingDate: String(site.foundedYear),
    priceRange: "₹₹₹",
    currenciesAccepted: "INR",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.address.line1}, ${site.address.line2}`,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.pin,
      addressCountry: "IN",
    },
    geo: { "@type": "GeoCoordinates", latitude: site.address.lat, longitude: site.address.lng },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "11:00", closes: "20:30" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "12:00", closes: "19:00" },
    ],
    sameAs: Object.values(site.social),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
