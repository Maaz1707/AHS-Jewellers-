"use client";

import { useId, useState, type ReactNode } from "react";
import { MinusIcon, PlusIcon } from "./Icons";

export type AccordionItem = { title: string; content: ReactNode };

type Props = {
  items: AccordionItem[];
  /** Index open on first render, or null for all closed. */
  defaultOpen?: number | null;
  /** Allow several panels open at once. */
  multiple?: boolean;
  className?: string;
};

/** Hairline accordion. Buttons carry aria-expanded; closed panels are inert. */
export default function Accordion({ items, defaultOpen = null, multiple = false, className = "" }: Props) {
  const [open, setOpen] = useState<number[]>(defaultOpen === null ? [] : [defaultOpen]);
  const base = useId();

  const toggle = (i: number) =>
    setOpen((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : multiple ? [...cur, i] : [i]));

  return (
    <div className={`border-t border-line ${className}`}>
      {items.map((item, i) => {
        const isOpen = open.includes(i);
        const id = `${base}-${i}`;
        return (
          <div key={item.title} className="border-b border-line">
            <h3>
              <button
                type="button"
                id={`${id}-btn`}
                aria-expanded={isOpen}
                aria-controls={`${id}-panel`}
                onClick={() => toggle(i)}
                className="group flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span className="font-serif text-xl text-ink transition-colors duration-300 group-hover:text-gold-deep">
                  {item.title}
                </span>
                <span className="text-gold-deep">
                  {isOpen ? <MinusIcon className="size-4" /> : <PlusIcon className="size-4" />}
                </span>
              </button>
            </h3>
            <div
              id={`${id}-panel`}
              role="region"
              aria-labelledby={`${id}-btn`}
              className={`grid transition-[grid-template-rows] duration-500 ease-luxe ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <div className="pb-6 text-sm leading-relaxed text-ink-soft">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
