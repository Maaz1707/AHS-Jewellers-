import { showroomFloors } from "@/data/craft";
import Button from "../ui/Button";
import RevealImage from "../ui/RevealImage";
import RevealText from "../ui/RevealText";
import SectionHeading from "../ui/SectionHeading";
import TextLink from "../ui/TextLink";

/** The two floors of the showroom building, each with its own character. */
export default function Showroom({ compact = false }: { compact?: boolean }) {
  return (
    <section id={compact ? "floors" : undefined} aria-labelledby="showroom-title" className="scroll-mt-28 bg-white section-y">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <SectionHeading
            id="showroom-title"
            className="lg:col-span-7"
            eyebrow="The showroom"
            title={
              <>
                Two floors,
                <br />
                one house
              </>
            }
          />
          <p className="text-stone lg:col-span-4 lg:col-start-9">
            Our own building on Bhagwan Das Road. Come in for a chain on the way home, or spend an afternoon upstairs
            choosing a trousseau with the whole family.
          </p>
        </div>

        <div className="mt-16 flex flex-col gap-24 md:mt-24 md:gap-32">
          {showroomFloors.map((f, i) => {
            const flip = i % 2 === 1;
            return (
              <article key={f.floor} className="grid gap-8 lg:grid-cols-12 lg:gap-10">
                <div className={`relative lg:col-span-7 ${flip ? "lg:order-2 lg:col-start-6" : ""}`}>
                  <RevealImage
                    image={f.image}
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    parallax={8}
                    from={flip ? "right" : "left"}
                    className="aspect-landscape"
                  />
                  <div
                    className={`absolute -bottom-16 hidden w-1/3 border-8 border-white md:block ${
                      flip ? "-left-10 xl:-left-16" : "-right-10 xl:-right-16"
                    }`}
                  >
                    <RevealImage image={f.detail} sizes="20vw" className="aspect-portrait" delay={0.25} />
                  </div>
                </div>

                <div
                  className={`flex flex-col justify-center lg:col-span-4 ${
                    flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-9"
                  } ${flip ? "md:pr-16" : "md:pl-16"} lg:px-0`}
                >
                  <div className="flex items-baseline gap-5">
                    <span aria-hidden="true" className="font-serif text-7xl font-light leading-none text-gold">
                      {f.floor}
                    </span>
                    <span className="eyebrow text-stone">{f.floor === "G" ? "Ground floor" : "First floor"}</span>
                  </div>
                  <RevealText as="h3" className="mt-6 font-serif text-4xl font-light text-ink">
                    {f.name}
                  </RevealText>
                  <p className="mt-2 font-serif text-xl italic text-gold-deep">{f.line}</p>
                  <p className="mt-6 text-ink-soft">{f.body}</p>
                  <ul className="mt-8 border-t border-line">
                    {f.offers.map((o) => (
                      <li key={o} className="flex items-center gap-4 border-b border-line py-3 text-sm text-ink">
                        <span aria-hidden="true" className="size-1 rounded-full bg-gold" />
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        {compact ? null : (
        <div className="mt-24 flex flex-col items-start gap-6 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between md:mt-32">
          <p className="max-w-prose font-serif text-2xl font-light text-ink">
            The bridal salon is kept for one family at a time.
          </p>
          <div className="flex flex-wrap items-center gap-8">
            <TextLink href="/contact#floors">Walk through both floors</TextLink>
            <Button href="/book-a-visit" arrow>
              Book the salon
            </Button>
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
