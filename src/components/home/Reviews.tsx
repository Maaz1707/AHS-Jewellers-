import { images } from "@/data/media";
import { reviews } from "@/data/reviews";
import Image from "../ui/Img";
import { OrnamentDivider, PetalCorner } from "../ui/Motif";
import RevealImage from "../ui/RevealImage";
import RevealText from "../ui/RevealText";
import TextLink from "../ui/TextLink";

/**
 * Reviews as an editorial page: one story set large beside its portrait, and
 * three shorter voices placed off the grid around it.
 */
export default function Reviews() {
  const [lead, ...rest] = reviews;
  const others = rest.slice(0, 3);
  // A different image from the lookbook directly above.
  const portrait = "brideSareeDetail" as const;

  return (
    <section aria-labelledby="reviews-title" className="relative bg-white section-y">
      <OrnamentDivider className="mb-16 md:mb-24" />
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
          <figure className="relative lg:col-span-5">
            <RevealImage image={portrait} sizes="(min-width: 1024px) 38vw, 100vw" className="aspect-portrait" />
            <PetalCorner className="absolute -left-3 -top-3 size-16" />
            <figcaption className="mt-3 text-xs text-stone">
              {lead.occasion}, {lead.year}
            </figcaption>
          </figure>

          <div className="lg:col-span-6 lg:col-start-7">
            <p className="eyebrow flex items-center gap-4 text-gold-deep">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              <span id="reviews-title">In their words</span>
            </p>
            <blockquote className="mt-8">
              <span aria-hidden="true" className="block font-serif text-7xl leading-none text-gold">
                &ldquo;
              </span>
              <RevealText as="p" className="font-serif text-3xl font-light italic leading-snug text-ink md:text-5xl">
                {lead.quote}
              </RevealText>
            </blockquote>
            <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="text-sm font-medium text-ink">{lead.name}</span>
              <span aria-hidden="true" className="h-px w-6 bg-gold" />
              <span className="text-sm text-stone">{lead.city}</span>
            </p>
          </div>
        </div>

        <ul className="mt-20 grid gap-12 md:mt-28 md:grid-cols-3 md:gap-10">
          {others.map((r, i) => (
            <li key={r.name} className={i === 1 ? "md:mt-16" : i === 2 ? "md:mt-6" : ""}>
              <figure className="border-t border-gold pt-6">
                <div className="flex items-center gap-4">
                  {r.image ? (
                    <span className="relative block size-12 shrink-0 overflow-hidden rounded-full bg-ivory">
                      <Image src={images[r.image].src} alt="" fill sizes="48px" className="object-cover" />
                    </span>
                  ) : null}
                  <figcaption className="text-sm">
                    <span className="block font-medium text-ink">{r.name}</span>
                    <span className="block text-stone">
                      {r.occasion}, {r.city}
                    </span>
                  </figcaption>
                </div>
                <blockquote className="mt-5 font-serif text-2xl font-light leading-snug text-ink">&ldquo;{r.quote}&rdquo;</blockquote>
              </figure>
            </li>
          ))}
        </ul>

        <div className="mt-16 flex justify-center">
          <TextLink href="/reviews">Read every story</TextLink>
        </div>
      </div>
    </section>
  );
}
