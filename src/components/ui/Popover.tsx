"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "./Icons";

type Props = {
  label: ReactNode;
  /** Highlight the trigger when its filter is in use. */
  active?: boolean;
  align?: "left" | "right";
  children: ReactNode | ((close: () => void) => ReactNode);
  className?: string;
};

/** Click-to-open panel under a trigger. Closes on Escape, outside click or focus leaving. */
export default function Popover({ label, active = false, align = "left", children, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrap}
      className={`relative ${className}`}
      onBlur={(e) => {
        if (open && !wrap.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-10 items-center gap-2 border px-4 text-sm transition-colors duration-300 ${
          open || active ? "border-ink text-ink" : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"
        }`}
      >
        {label}
        <ChevronDown className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        id={id}
        hidden={!open}
        className={`absolute top-full z-20 mt-2 min-w-64 border border-line bg-white p-5 shadow-panel ${
          align === "right" ? "right-0" : "left-0"
        } ${open ? "[animation:menu-in_0.4s_var(--ease-luxe)]" : ""}`}
      >
        {typeof children === "function" ? children(close) : children}
      </div>
    </div>
  );
}
