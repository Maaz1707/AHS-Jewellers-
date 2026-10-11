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
  /** Width of the panel. */
  size?: "md" | "lg";
};

/** Centred dialog. Focus is trapped, Escape and backdrop click close it. */
export default function Modal({ open, onClose, title, eyebrow, children, size = "md" }: Props) {
  const hydrated = useHydrated();
  const { mounted, visible } = useOverlayTransition(open, 500);
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(panel, open, onClose);

  if (!hydrated || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-8" data-lenis-prevent="">
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-ink/50 backdrop-blur-sm transition-opacity duration-500 ease-luxe ${visible ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full overflow-y-auto bg-white p-6 shadow-panel transition-all duration-500 ease-luxe md:p-10 ${
          size === "lg" ? "md:max-w-narrow" : "md:max-w-prose"
        } ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        style={{ maxHeight: "90svh" }}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            {eyebrow ? <p className="eyebrow text-gold-deep">{eyebrow}</p> : null}
            <h2 id={titleId} className="mt-3 font-serif text-3xl font-light text-ink">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-2 relative hit-area flex size-10 shrink-0 items-center justify-center text-ink transition-colors hover:text-gold-deep"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
