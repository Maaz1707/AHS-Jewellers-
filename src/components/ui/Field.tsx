"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ChevronDown } from "./Icons";

type Tone = "light" | "dark";

type Shared = {
  label: string;
  error?: string;
  hint?: string;
  tone?: Tone;
  /** Visually hide the label (it stays available to screen readers). */
  hideLabel?: boolean;
  className?: string;
};

const tones: Record<Tone, { label: string; control: string; hint: string; error: string }> = {
  light: {
    label: "text-stone",
    control:
      "border-line-strong text-ink placeholder:text-stone/70 hover:border-stone focus:border-ink aria-[invalid=true]:border-error",
    hint: "text-stone",
    error: "text-error",
  },
  dark: {
    label: "text-white/70",
    control:
      "border-white/30 text-white placeholder:text-white/40 hover:border-white/60 focus:border-gold-pale aria-[invalid=true]:border-gold",
    hint: "text-white/60",
    error: "text-gold-pale",
  },
};

const control =
  "block h-12 w-full border-0 border-b bg-transparent px-0 text-base outline-none transition-colors duration-300 focus-visible:outline-none";

function Wrapper({
  id,
  label,
  error,
  hint,
  tone = "light",
  hideLabel,
  className = "",
  children,
}: Shared & { id: string; children: ReactNode }) {
  const t = tones[tone];
  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={id} className={`eyebrow ${t.label} ${hideLabel ? "sr-only" : "mb-1"}`}>
        {label}
      </label>
      {children}
      <div aria-live="polite" className="min-h-6 pt-2 text-xs">
        {error ? (
          <p id={`${id}-error`} className={t.error}>
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className={t.hint}>
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

const describedBy = (id: string, error?: string, hint?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

export function TextField({
  label,
  error,
  hint,
  tone = "light",
  hideLabel,
  className,
  id: idProp,
  ...input
}: Shared & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Wrapper id={id} label={label} error={error} hint={hint} tone={tone} hideLabel={hideLabel} className={className}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`${control} ${tones[tone].control}`}
        {...input}
      />
    </Wrapper>
  );
}

export function SelectField({
  label,
  error,
  hint,
  tone = "light",
  hideLabel,
  className,
  id: idProp,
  children,
  ...select
}: Shared & SelectHTMLAttributes<HTMLSelectElement>) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Wrapper id={id} label={label} error={error} hint={hint} tone={tone} hideLabel={hideLabel} className={className}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={`${control} appearance-none pr-8 ${tones[tone].control}`}
          {...select}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 size-4 -translate-y-1/2 opacity-60" />
      </div>
    </Wrapper>
  );
}

export function TextAreaField({
  label,
  error,
  hint,
  tone = "light",
  hideLabel,
  className,
  id: idProp,
  ...area
}: Shared & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Wrapper id={id} label={label} error={error} hint={hint} tone={tone} hideLabel={hideLabel} className={className}>
      <textarea
        id={id}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`${control} h-auto resize-none py-3 ${tones[tone].control}`}
        {...area}
      />
    </Wrapper>
  );
}

export function CheckboxField({
  label,
  error,
  tone = "light",
  className = "",
  id: idProp,
  ...input
}: Omit<Shared, "hint" | "hideLabel"> & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const id = idProp ?? auto;
  const t = tones[tone];
  return (
    <div className={className}>
      <label htmlFor={id} className={`flex cursor-pointer items-start gap-3 text-sm ${tone === "dark" ? "text-white/80" : "text-ink-soft"}`}>
        <span className="relative mt-1 flex size-4 shrink-0 items-center justify-center">
          <input
            id={id}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`peer size-4 cursor-pointer appearance-none border transition-colors duration-300 checked:border-gold checked:bg-gold ${
              tone === "dark" ? "border-white/40" : "border-line-strong"
            }`}
            {...input}
          />
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="pointer-events-none absolute size-3 text-white opacity-0 peer-checked:opacity-100"
          >
            <path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
        <span>{label}</span>
      </label>
      {error ? (
        <p id={`${id}-error`} className={`mt-2 text-xs ${t.error}`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Lightweight validators shared by every form. */
export const validators = {
  required: (v: string, what = "This") => (v.trim() ? "" : `${what} is required.`),
  email: (v: string) =>
    !v.trim() ? "Please enter your email address." : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address.",
  phoneIN: (v: string) => {
    const digits = v.replace(/\D/g, "").replace(/^(91|0)/, "");
    if (!digits) return "Please enter your mobile number.";
    return /^[6-9]\d{9}$/.test(digits) ? "" : "Please enter a 10-digit Indian mobile number.";
  },
};
