import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "./Icons";

type Props = {
  href: string;
  children: ReactNode;
  external?: boolean;
  tone?: "ink" | "gold" | "light" | "muted";
  arrow?: boolean;
  className?: string;
  onClick?: () => void;
};

const tones = {
  ink: "text-ink",
  gold: "text-gold-deep",
  light: "text-white",
  muted: "text-stone hover:text-ink",
};

/** Small uppercase link with an underline that draws in, and an arrow that nudges. */
export default function TextLink({ href, children, external, tone = "ink", arrow = true, className = "", onClick }: Props) {
  const classes = `group/link inline-flex items-center gap-2 eyebrow ${tones[tone]} ${className}`;
  const content = (
    <>
      <span className="link-draw pb-1">{children}</span>
      {arrow ? (
        external ? (
          <ArrowUpRight className="size-4 transition-transform duration-500 ease-luxe group-hover/link:-translate-y-px group-hover/link:translate-x-px" />
        ) : (
          <ArrowRight className="size-4 transition-transform duration-500 ease-luxe group-hover/link:translate-x-1" />
        )
      ) : null}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} onClick={onClick}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} onClick={onClick}>
      {content}
    </Link>
  );
}
