"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/* Small building blocks for the admin panel: calm, large, plain-language. */

export function AdminPageHeader({ title, intro, actions }: { title: string; intro?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-serif text-4xl font-light text-ink md:text-5xl">{title}</h1>
        {intro ? <p className="mt-3 max-w-prose text-base text-stone">{intro}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}

export function StatCard({
  label,
  value,
  note,
  href,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  href?: string;
  tone?: "default" | "alert" | "gold";
}) {
  const body = (
    <>
      <p className="eyebrow text-stone">{label}</p>
      <p className={`mt-3 font-serif text-4xl figures ${tone === "alert" ? "text-error" : tone === "gold" ? "text-gold-deep" : "text-ink"}`}>{value}</p>
      {note ? <p className="mt-2 text-sm text-stone">{note}</p> : null}
    </>
  );
  const cls = "block border border-line bg-white p-6 transition-colors duration-300";
  return href ? (
    <Link href={href} className={`${cls} hover:border-ink`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

const pillTones = {
  neutral: "border-line-strong text-ink-soft",
  good: "border-success text-success",
  alert: "border-error text-error",
  gold: "border-gold text-gold-deep",
  ink: "border-ink bg-ink text-white",
};

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: keyof typeof pillTones }) {
  return <span className={`inline-flex items-center whitespace-nowrap border px-2 py-1 text-micro font-medium uppercase tracking-wide ${pillTones[tone]}`}>{children}</span>;
}

/** Large, labelled filter tabs with counts. */
export function FilterTabs<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="no-scrollbar flex gap-2 overflow-x-auto">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`flex h-10 shrink-0 items-center gap-2 border px-4 text-sm transition-colors ${
            value === o.value ? "border-ink bg-ink text-white" : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"
          }`}
        >
          {o.label}
          {o.count !== undefined ? <span className="figures opacity-70">{o.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function AdminEmpty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="border border-dashed border-line-strong bg-white px-6 py-16 text-center">
      <p className="font-serif text-2xl font-light text-ink">{title}</p>
      <p className="mx-auto mt-3 max-w-prose text-sm text-stone">{body}</p>
      {action ? <div className="mt-8 flex justify-center">{action}</div> : null}
    </div>
  );
}

/** Large search box. */
export function SearchBox({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <label className="flex h-12 min-w-0 flex-1 items-center gap-3 border border-line-strong bg-white px-4 focus-within:border-ink">
      <span className="sr-only">{label}</span>
      <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-stone" fill="none" stroke="currentColor" strokeWidth={1.25} aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-stone/70 focus-visible:outline-none"
      />
    </label>
  );
}

/** Large select used in admin toolbars. */
export function AdminSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <label className="relative flex h-12 items-center border border-line-strong bg-white focus-within:border-ink">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-full appearance-none bg-transparent pl-4 pr-10 text-base text-ink outline-none">
        {children}
      </select>
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-3 size-4 text-stone" fill="none" stroke="currentColor" strokeWidth={1.25} aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </label>
  );
}
