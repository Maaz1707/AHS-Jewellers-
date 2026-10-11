"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { SAMPLE_MEMBER } from "@/data/demo";
import { formatIndianMobile } from "@/lib/booking";
import { samePhone } from "@/store/scheme";
import { useBookings, useEnquiries, useScheme, useSession } from "@/store";
import Button from "../ui/Button";
import { TextField, validators } from "../ui/Field";
import { LockIcon } from "../ui/Icons";
import { DemoTag } from "../ui/Tags";

/** The visible "this is not real" marker used across the member area: the same tag as every other demo. */
export function DemoBadge({ className = "" }: { className?: string }) {
  return <DemoTag className={className} />;
}

/**
 * Demo sign-in: any Indian mobile number and any four-digit code. Nothing is
 * sent anywhere. The name is filled from the scheme, bookings or enquiries
 * already held for that number on this device.
 */
export default function DemoSignIn() {
  const signIn = useSession((s) => s.signIn);
  const members = useScheme((s) => s.members);
  const bookings = useBookings((s) => s.bookings);
  const enquiries = useEnquiries((s) => s.enquiries);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    box.current?.querySelector<HTMLElement>(attempt ? '[aria-invalid="true"]' : "input")?.focus();
  }, [step, attempt]);

  const knownName = () =>
    members.find((m) => samePhone(m.phone, phone))?.name ??
    bookings.find((b) => samePhone(b.phone, phone))?.name ??
    enquiries.find((q) => samePhone(q.phone, phone))?.name ??
    "";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (step === "phone") {
      const err = validators.phoneIN(phone);
      setError(err);
      if (err) return setAttempt((a) => a + 1);
      setStep("code");
      return;
    }
    if (!/^\d{4}$/.test(code.trim())) {
      setError("Enter any four digits. This is a demonstration, so every code works.");
      return setAttempt((a) => a + 1);
    }
    signIn({ name: knownName(), phone: formatIndianMobile(phone) });
  };

  return (
    <div ref={box} className="mx-auto max-w-prose">
      <DemoBadge />
      <h1 className="mt-6 display-page text-ink">Your account</h1>
      <p className="mt-4 text-ink-soft">
        Your savings scheme, saved pieces, visits and messages, in one place. In this prototype, sign-in is a demonstration:
        no message is sent and any four-digit code is accepted.
      </p>

      <form onSubmit={submit} noValidate className="mt-10 border border-line p-6 md:p-8" aria-label="Demo sign-in">
        {step === "phone" ? (
          <TextField
            label="Mobile number"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setError("");
            }}
            error={error}
            hint="We would send a code by SMS. In the demo, nothing is sent."
          />
        ) : (
          <>
            <p className="text-sm text-stone">
              Code for <span className="text-ink">{formatIndianMobile(phone)}</span>.{" "}
              <button type="button" onClick={() => setStep("phone")} className="link-line text-ink">
                Change number
              </button>
            </p>
            <TextField
              className="mt-4"
              label="Four-digit code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              placeholder="Any 4 digits"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              error={error}
            />
          </>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <Button type="submit" arrow icon={step === "code" ? <LockIcon className="size-4" /> : undefined}>
            {step === "phone" ? "Send code" : "Sign in"}
          </Button>
          <span className="text-xs text-stone">Step {step === "phone" ? 1 : 2} of 2</span>
        </div>
      </form>

      <div className="mt-8 flex flex-col items-start gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone">Presenting? See a member partway through the scheme.</p>
        <Button variant="secondary" magnetic={false} onClick={() => signIn(SAMPLE_MEMBER)}>
          Use sample member
        </Button>
      </div>
    </div>
  );
}
