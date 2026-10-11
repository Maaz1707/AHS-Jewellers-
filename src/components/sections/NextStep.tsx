import type { ReactNode } from "react";
import Button from "../ui/Button";
import TextLink from "../ui/TextLink";

/**
 * The closing band for pages that would otherwise end on content: one primary
 * action, one quiet alternative. Every page leaves the visitor somewhere to go.
 */
export default function NextStep({
  eyebrow = "Next",
  title,
  action,
  alternative,
}: {
  eyebrow?: string;
  title: ReactNode;
  action: { label: string; href: string };
  alternative?: { label: string; href: string; external?: boolean };
}) {
  return (
    <section aria-label={eyebrow} className="border-t border-line bg-ivory band-y">
      <div className="shell flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow flex items-center gap-4 text-gold-deep">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            {eyebrow}
          </p>
          <p className="mt-6 max-w-narrow font-serif text-3xl font-light tracking-tight text-ink md:text-4xl">{title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-8">
          <Button href={action.href} arrow>
            {action.label}
          </Button>
          {alternative ? (
            <TextLink href={alternative.href} external={alternative.external}>
              {alternative.label}
            </TextLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
