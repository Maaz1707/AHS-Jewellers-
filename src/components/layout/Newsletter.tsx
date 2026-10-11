"use client";

import { useState, type FormEvent } from "react";
import { useHydrated } from "@/lib/motion";
import { useEnquiries } from "@/store";
import { TextField, validators } from "../ui/Field";
import { ArrowRight, CheckIcon } from "../ui/Icons";

/** Footer newsletter sign-up with inline validation and a designed success state. */
export default function Newsletter() {
  const subscribe = useEnquiries((s) => s.subscribe);
  const hydrated = useHydrated();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "added" | "exists">("idle");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const message = validators.email(email);
    setError(message);
    if (message) return;
    setStatus("sending");
    // A short pause so the state change reads as deliberate.
    window.setTimeout(() => setStatus(subscribe(email)), 600);
  };

  if (status === "added" || status === "exists") {
    return (
      <div className="flex items-start gap-4 border-t border-white/15 pt-6" role="status">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gold text-gold-pale">
          <CheckIcon className="size-4" />
        </span>
        <div>
          <p className="font-serif text-2xl font-light text-white">
            {status === "added" ? "Thank you. You are on our list." : "You are already on our list."}
          </p>
          <p className="mt-2 text-sm text-white/70">
            {status === "added"
              ? "Expect a short letter before each festival season, and first word of new bridal work. Nothing more."
              : "We will keep writing to you there. Nothing has changed."}
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setEmail("");
              setTouched(false);
            }}
            className="link-line mt-4 eyebrow text-white/70 hover:text-white"
          >
            Use another address
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex items-end gap-4">
      <TextField
        tone="dark"
        label="Email address"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (touched) setError(validators.email(e.target.value));
        }}
        onBlur={() => {
          if (email) {
            setTouched(true);
            setError(validators.email(email));
          }
        }}
        error={error}
        className="flex-1"
      />
      <button
        type="submit"
        disabled={!hydrated || status === "sending"}
        aria-label="Subscribe"
        className="group mb-8 flex size-12 shrink-0 items-center justify-center rounded-full border border-white/40 text-white transition-colors duration-500 hover:border-gold-pale hover:bg-gold-pale hover:text-ink disabled:opacity-60"
      >
        {status === "sending" ? (
          <span className="size-4 animate-breathe rounded-full bg-current" />
        ) : (
          <ArrowRight className="size-5 transition-transform duration-500 group-hover:translate-x-1" />
        )}
      </button>
    </form>
  );
}
