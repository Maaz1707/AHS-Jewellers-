"use client";

import { useState, type CSSProperties } from "react";
import { showroomFloors } from "@/data/craft";
import { images } from "@/data/media";
import { useSwap } from "@/lib/useAutoplay";
import Button from "../ui/Button";
import Image from "../ui/Img";
import SectionHeading from "../ui/SectionHeading";
import TextLink from "../ui/TextLink";

const floorName = (f: (typeof showroomFloors)[number]) => (f.floor === "G" ? "Ground floor" : "First floor");

/**
 * The two floors of the building in one screen. A small brass lift panel
 * moves between Ground and First; the photograph, title, words and list slide
 * vertically, as the view does from a lift. Starts on the ground floor.
 */
export default function FloorsToggle() {
  const [index, setIndex] = useState(0);
  const before = useSwap(index);
  const up = before >= 0 && index > before;
  const f = showroomFloors[index];

  return (
    <section aria-labelledby="showroom-title" className="bg-white screen-fit">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-10">
        {/* The floor, photographed */}
        <div className="relative lg:col-span-7">
          <div className="relative overflow-hidden bg-ivory screen-frame">
            {showroomFloors.map((fl, i) => {
              const on = i === index;
              const leaving = i === before;
              const motion = before < 0 ? "" : on ? (up ? "floor-in-up" : "floor-in-down") : leaving ? (up ? "floor-out-up" : "floor-out-down") : "";
              return (
                <div key={fl.floor} aria-hidden={!on} className={`absolute inset-0 ${on || leaving ? "" : "invisible"} ${on ? "z-2" : "z-1"} ${motion}`}>
                  <div className={`absolute inset-0 ${on ? "ken-burns" : ""}`}>
                    <Image src={images[fl.image].src} alt={on ? images[fl.image].alt : ""} fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
                  </div>
                </div>
              );
            })}
            {/* Lift panel, mounted on the photograph: First above Ground. */}
            <div role="group" aria-label="Choose a floor" className="absolute bottom-4 left-4 z-10 flex flex-col-reverse gap-3 rounded-full border border-gold/50 bg-ivory/90 p-2 shadow-soft backdrop-blur-sm lg:bottom-6 lg:left-6">
              {showroomFloors.map((fl, i) => {
                const on = i === index;
                return (
                  <button
                    key={fl.floor}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-pressed={on}
                    aria-label={`${fl.floor}, ${floorName(fl)}`}
                    className={`relative flex size-12 items-center justify-center rounded-full border font-serif text-xl transition-[color,background-color,border-color,box-shadow] duration-300 ${
                      on
                        ? "border-gold bg-ink text-gold-pale ring-3 ring-gold-pale"
                        : "border-line-strong bg-white text-ink hover:border-gold hover:text-gold-deep"
                    }`}
                  >
                    {fl.floor}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="absolute -bottom-8 right-4 hidden w-1/4 border-8 border-white bg-white shadow-soft md:block lg:-right-8">
            <div key={f.floor} className="rise-in relative aspect-portrait overflow-hidden bg-ivory" style={{ "--rise": up ? "-24px" : "24px" } as CSSProperties}>
              <Image src={images[f.detail].src} alt={images[f.detail].alt} fill sizes="15vw" className="object-cover" />
            </div>
          </div>
        </div>

        {/* The words */}
        <div className="lg:col-span-5">
          <SectionHeading
            id="showroom-title"
            size="md"
            eyebrow="The showroom"
            title={
              <>
                Two floors,
                <br />
                one house
              </>
            }
          />
          <p className="mt-4 text-sm text-stone">
            Our own building on Bhagwan Das Road. Come in for a chain on the way home, or spend an afternoon upstairs
            choosing a trousseau with the whole family.
          </p>

          <div className="mt-6">
            {/* The floor, described */}
            <div aria-live="polite" className="overflow-hidden">
              <div key={f.floor} className="rise-in" style={{ "--rise": up ? "-32px" : "32px" } as CSSProperties}>
                <p className="eyebrow text-stone">{floorName(f)}</p>
                <h3 className="mt-2 font-serif text-3xl font-light text-ink">{f.name}</h3>
                <p className="mt-1 font-serif text-xl italic text-gold-deep">{f.line}</p>
                <p className="mt-3 text-sm text-ink-soft">{f.body}</p>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4">
                  {f.offers.map((o) => (
                    <li key={o} className="flex items-center gap-2 text-sm text-ink">
                      <span aria-hidden="true" className="size-1 shrink-0 rounded-full bg-gold" />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-start gap-4 border-t border-line pt-5">
            <p className="font-serif text-lg italic text-ink-soft">The bridal salon is kept for one family at a time.</p>
            <div className="flex flex-wrap items-center gap-8">
              <Button href="/book-a-visit" arrow>
                Book the salon
              </Button>
              <TextLink href="/contact#floors">Walk through both floors</TextLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
