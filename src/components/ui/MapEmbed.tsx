"use client";

import { useState } from "react";
import { directionsLink, fullAddress, site } from "@/data/site";

const { lat, lng } = site.address;
const bbox = [lng - 0.012, lat - 0.007, lng + 0.012, lat + 0.007].map((n) => n.toFixed(4)).join(",");
const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

/** Lazy OpenStreetMap preview, toned to the palette, with a directions card. */
export default function MapEmbed({ className = "" }: { className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden border border-line-strong bg-ivory-deep ${className}`}>
      {!loaded ? <div aria-hidden="true" className="skeleton absolute inset-0" /> : null}
      <iframe
        title={`Map showing ${site.name}, ${fullAddress()}`}
        src={mapSrc}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 size-full border-0 transition-opacity duration-1000 ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{ filter: "grayscale(1) sepia(0.25) contrast(0.95) brightness(1.04)" }}
      />
      <a
        href={directionsLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="group absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 bg-white p-5 shadow-soft md:bottom-6 md:left-6 md:right-auto md:max-w-prose"
      >
        <span>
          <span className="block eyebrow text-gold-deep">{site.name}</span>
          <span className="mt-1 block text-sm text-ink">{site.address.line1}</span>
        </span>
        <span className="eyebrow text-ink">
          <span className="link-draw">Directions</span>
        </span>
      </a>
    </div>
  );
}
