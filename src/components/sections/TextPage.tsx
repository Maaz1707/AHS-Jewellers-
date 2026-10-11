import type { ReactNode } from "react";
import RevealText from "../ui/RevealText";
import NextStep from "./NextStep";

/** Long-form text pages (privacy, terms): a narrow measure with numbered sections. */
export default function TextPage({
  eyebrow,
  title,
  intro,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  updated: string;
  sections: { title: string; body: ReactNode }[];
}) {
  return (
    <>
      <section className="bg-white page-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <p className="eyebrow flex items-center gap-4 text-gold-deep">
                <span aria-hidden="true" className="h-px w-8 bg-gold" />
                {eyebrow}
              </p>
              <RevealText as="h1" immediate delay={0.2} className="mt-6 display-page text-ink">
                {title}
              </RevealText>
              <p className="mt-6 text-sm text-stone">{updated}</p>
              <nav aria-label="Sections" className="mt-10 hidden lg:block">
                <ol className="flex flex-col gap-2 text-sm">
                  {sections.map((s, i) => (
                    <li key={s.title}>
                      <a href={`#s${i + 1}`} data-transition="off" className="link-draw text-stone hover:text-ink">
                        {i + 1}. {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <div className="border-l-2 border-gold bg-ivory p-5 text-sm text-ink-soft">{intro}</div>
            <ol className="mt-12 flex flex-col gap-12">
              {sections.map((s, i) => (
                <li key={s.title} id={`s${i + 1}`} className="scroll-mt-32">
                  <h2 className="flex gap-4 font-serif text-3xl font-light text-ink">
                    <span className="text-gold-deep">{i + 1}.</span>
                    {s.title}
                  </h2>
                  <div className="mt-4 flex max-w-prose flex-col gap-4 text-ink-soft">{s.body}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
      <NextStep
        eyebrow="Questions"
        title="Anything unclear? Ask us, and a person will answer."
        action={{ label: "Contact us", href: "/contact" }}
        alternative={{ label: "Common questions", href: "/faq" }}
      />
    </>
  );
}
