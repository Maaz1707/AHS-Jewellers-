"use client";

import { useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap, useOverlayTransition } from "@/lib/overlay";
import { useHydrated } from "@/lib/motion";
import { CloseIcon } from "./Icons";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** "right": side sheet. "bottom": sheet that rises from the foot of the screen (phone filters). */
  side?: "right" | "bottom";
};

/** Right-hand sheet for the bag and similar short tasks. Full width on phones. */
export default function Drawer({ open, onClose, title, eyebrow, children, footer, side = "right" }: Props) {
  const hydrated = useHydrated();
  const { mounted, visible } = useOverlayTransition(open, 700);
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(panel, open, onClose);

  if (!hydrated || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-700 ease-luxe ${visible ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`absolute flex w-full flex-col bg-white shadow-panel transition-transform duration-700 ease-luxe ${
          side === "bottom"
            ? `inset-x-0 bottom-0 ${visible ? "translate-y-0" : "translate-y-full"}`
            : `inset-y-0 right-0 md:max-w-narrow lg:max-w-prose ${visible ? "translate-x-0" : "translate-x-full"}`
        }`}
        style={side === "bottom" ? { maxHeight: "88svh" } : undefined}
      >
        {side === "bottom" ? <span aria-hidden="true" className="mx-auto mt-3 block h-1 w-10 rounded-full bg-line-strong" /> : null}
        <header className="flex items-center justify-between border-b border-line px-6 py-5 md:px-10">
          <div>
            {eyebrow ? <p className="eyebrow text-gold-deep">{eyebrow}</p> : null}
            <h2 id={titleId} className="font-serif text-2xl font-light text-ink">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 relative hit-area flex size-10 items-center justify-center text-ink transition-colors hover:text-gold-deep"
          >
            <CloseIcon className="size-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10" data-lenis-prevent="">
          {children}
        </div>
        {footer ? <footer className="border-t border-line px-6 py-6 md:px-10">{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
}
