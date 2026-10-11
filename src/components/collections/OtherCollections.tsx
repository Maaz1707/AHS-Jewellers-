import Image from "@/components/ui/Img";
import Link from "next/link";
import { collections } from "@/data/collections";
import { images } from "@/data/media";

/** A quiet row of the other collections at the foot of a listing, so no page is a dead end. */
export default function OtherCollections({ current }: { current?: string }) {
  const others = collections.filter((c) => c.slug !== current);
  return (
    <section aria-labelledby="other-collections" className="border-t border-line bg-ivory band-y">
      <div className="shell">
        <h2 id="other-collections" className="eyebrow flex items-center gap-4 text-gold-deep">
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
          {current ? "The other collections" : "The collections"}
        </h2>
        <ul className="mt-10 grid grid-cols-2 gap-4 md:gap-8 lg:grid-cols-4">
          {others.slice(0, 4).map((c) => {
            const img = images[c.cover];
            return (
              <li key={c.slug}>
                <Link href={`/collections/${c.slug}`} className="group block">
                  <span className="relative block aspect-tall overflow-hidden bg-ivory-deep">
                    <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 22vw, 46vw" className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-105" />
                  </span>
                  <span className="mt-4 block font-serif text-2xl font-light text-ink transition-colors group-hover:text-gold-deep">{c.name}</span>
                  <span className="mt-1 block text-sm text-stone">{c.line}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
