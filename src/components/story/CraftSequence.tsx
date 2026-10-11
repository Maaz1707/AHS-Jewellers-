"use client";

import Image from "@/components/ui/Img";
import { useRef, useState } from "react";
import { craftSteps } from "@/data/craft";
import { images } from "@/data/media";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import RevealImage from "../ui/RevealImage";
import VideoBlock from "../ui/VideoBlock";

/**
 * The making process as a pinned sequence. On desktop the film and macro
 * photograph stay fixed while each step scrolls through; the media changes to
 * match. On phones every step is self-contained.
 */
export default function CraftSequence() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      root.current?.querySelectorAll<HTMLElement>("[data-step]").forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 50%",
          end: "bottom 50%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="The five steps" className="bg-white">
      <div className="shell grid lg:grid-cols-12 lg:gap-16">
        {/* Pinned media (desktop) */}
        <div className="hidden lg:col-span-6 lg:block">
          <div className="sticky top-0 flex h-svh items-center py-28">
            <div className="relative h-full w-full">
              <div className="relative h-full overflow-hidden bg-ink">
                {craftSteps.map((s, i) => (
                  <div
                    key={s.number}
                    aria-hidden={i !== active}
                    className={`absolute inset-0 transition-[opacity,transform] duration-1000 ease-luxe ${
                      i === active ? "scale-100 opacity-100" : "scale-105 opacity-0"
                    }`}
                  >
                    <VideoBlock video={s.video} active={i === active} sizes="50vw" className="absolute inset-0" />
                  </div>
                ))}
                <p className="absolute left-6 top-6 font-serif text-6xl font-light text-white/90 figures">
                  {craftSteps[active].number}
                </p>
              </div>
              {/* Macro inset */}
              <div className="absolute -bottom-10 -right-6 w-2/5 border-8 xl:-right-10 border-white bg-white shadow-soft">
                <div className="relative aspect-square overflow-hidden">
                  {craftSteps.map((s, i) => (
                    <Image
                      key={s.number}
                      src={images[s.macro].src}
                      alt={i === active ? images[s.macro].alt : ""}
                      fill
                      sizes="20vw"
                      className={`object-cover transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0"}`}
                    />
                  ))}
                </div>
              </div>
              {/* Progress */}
              <ol className="absolute -left-8 top-1/2 flex -translate-y-1/2 flex-col gap-3" aria-hidden="true">
                {craftSteps.map((s, i) => (
                  <li key={s.number} className={`h-8 w-px transition-colors duration-500 ${i <= active ? "bg-gold" : "bg-line-strong"}`} />
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Steps */}
        <ol className="lg:col-span-5 lg:col-start-8">
          {craftSteps.map((s, i) => (
            <li key={s.number} data-step="" className="flex flex-col justify-center py-16 lg:min-h-svh lg:py-0">
              <div className="lg:hidden">
                <VideoBlock video={s.video} sizes="100vw" className="aspect-landscape" />
                <div className="-mt-12 ml-auto w-1/2 border-8 border-white bg-white md:w-1/3">
                  <RevealImage image={s.macro} sizes="50vw" className="aspect-square" />
                </div>
              </div>
              <p className={`mt-8 eyebrow transition-colors duration-500 lg:mt-0 ${i === active ? "text-gold-deep" : "text-stone"}`}>
                Step {s.number} of {String(craftSteps.length).padStart(2, "0")}
              </p>
              <h2 className="mt-4 font-serif text-5xl font-light tracking-tight text-ink md:text-6xl lg:text-5xl xl:text-6xl">{s.title}</h2>
              <p className="mt-6 font-serif text-2xl font-light leading-snug text-ink">{s.body}</p>
              <p className="mt-6 text-ink-soft">{s.detail}</p>
              <dl className="mt-8 grid grid-cols-2 border-t border-line pt-6 text-sm">
                <div>
                  <dt className="eyebrow text-stone">Hands</dt>
                  <dd className="mt-2 text-ink">{s.hands}</dd>
                </div>
                <div>
                  <dt className="eyebrow text-stone">Time, bridal piece</dt>
                  <dd className="mt-2 text-ink">{s.time}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
