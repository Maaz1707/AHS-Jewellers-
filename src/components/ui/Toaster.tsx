"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useToast } from "@/store";
import type { Toast } from "@/store/toast";
import { CheckIcon, CloseIcon } from "./Icons";

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToast((s) => s.dismiss);

  useEffect(() => {
    const t = window.setTimeout(() => dismiss(toast.id), 5000);
    return () => window.clearTimeout(t);
  }, [toast.id, dismiss]);

  return (
    <li className="pointer-events-auto flex w-full items-start gap-4 border border-line bg-white p-5 shadow-panel [animation:toast-in_0.6s_var(--ease-luxe)]">
      <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-gold text-white">
        <CheckIcon className="size-3" />
      </span>
      <div className="flex-1">
        <p className="font-serif text-lg leading-snug text-ink">{toast.title}</p>
        {toast.body ? <p className="mt-1 text-sm text-stone">{toast.body}</p> : null}
        {toast.action ? (
          <Link href={toast.action.href} onClick={() => dismiss(toast.id)} className="link-line mt-3 inline-block eyebrow text-ink">
            {toast.action.label}
          </Link>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss"
        className="-mr-1 -mt-1 relative hit-area flex size-10 items-center justify-center text-stone transition-colors hover:text-ink"
      >
        <CloseIcon className="size-4" />
      </button>
    </li>
  );
}

/** Polite, stacked notifications in the lower corner. */
export default function Toaster() {
  const toasts = useToast((s) => s.toasts);
  return (
    <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed inset-x-0 z-50 p-4 md:inset-x-auto md:right-0 md:px-8 md:py-0"
      style={{ bottom: "calc(var(--app-bar) + var(--spacing-20))" }}>
      <ul className="flex flex-col gap-3 md:w-96">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </ul>
    </div>
  );
}
