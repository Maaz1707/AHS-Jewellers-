"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { formatIndianMobile } from "@/lib/booking";
import { useOrigin } from "@/lib/enquiry";
import { useHydrated } from "@/lib/motion";
import { useEnquiries } from "@/store";
import Button from "../ui/Button";
import { CheckboxField, SelectField, TextAreaField, TextField, validators } from "../ui/Field";
import { CheckIcon } from "../ui/Icons";

const SUBJECTS = [
  "A general question",
  "Bridal and trousseau",
  "A custom piece",
  "Old gold exchange",
  "Repairs and cleaning",
  "Savings scheme",
];

type Data = { name: string; phone: string; email: string; subject: string; message: string; consent: boolean };
type Errors = Partial<Record<keyof Data, string>>;

const empty: Data = { name: "", phone: "", email: "", subject: SUBJECTS[0], message: "", consent: false };

function validate(d: Data): Errors {
  const e: Errors = {};
  if (!d.name.trim()) e.name = "Please tell us your name.";
  const phone = validators.phoneIN(d.phone);
  if (phone) e.phone = phone;
  if (d.email.trim() && validators.email(d.email)) e.email = validators.email(d.email);
  if (d.message.trim().length < 10) e.message = "Please write a little more, so we can help properly.";
  if (d.message.length > 1000) e.message = "Please keep your message under 1,000 characters.";
  if (!d.consent) e.consent = "Please confirm we may reply to you.";
  return e;
}

export default function ContactForm() {
  const [data, setData] = useState<Data>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [sentName, setSentName] = useState("");
  const addEnquiry = useEnquiries((s) => s.addEnquiry);
  const origin = useOrigin();
  // Until hydrated the browser would submit natively; keep the button inert.
  const hydrated = useHydrated();
  const form = useRef<HTMLFormElement>(null);
  const [attempt, setAttempt] = useState(0);

  // After a failed submit renders its errors, move focus to the first one.
  useEffect(() => {
    if (attempt) form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [attempt]);

  const set = <K extends keyof Data>(k: K, v: Data[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(data);
    setErrors(found);
    if (Object.keys(found).length) {
      setAttempt((a) => a + 1);
      return;
    }
    setStatus("sending");
    window.setTimeout(() => {
      addEnquiry({
        type: "contact",
        channel: "form",
        name: data.name.trim(),
        phone: formatIndianMobile(data.phone),
        email: data.email.trim() || undefined,
        subject: data.subject,
        message: data.message.trim(),
        pageUrl: `${origin}/contact`,
      });
      setSentName(data.name.trim().split(" ")[0]);
      setData(empty);
      setStatus("sent");
    }, 700);
  };

  if (status === "sent") {
    return (
      <div role="status" className="[animation:menu-in_0.8s_var(--ease-luxe)]">
        <span className="flex size-14 items-center justify-center rounded-full border border-gold text-gold-deep">
          <CheckIcon className="size-6" />
        </span>
        <p className="mt-8 font-serif text-4xl font-light text-ink">Thank you, {sentName}.</p>
        <p className="mt-4 max-w-prose text-ink-soft">
          Your message is with us. Someone from the family will reply today if you wrote before 6 pm, otherwise first
          thing tomorrow.
        </p>
        <button type="button" onClick={() => setStatus("idle")} className="link-line mt-8 eyebrow text-ink">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form ref={form} onSubmit={onSubmit} noValidate aria-label="Contact form" className="grid gap-2 md:grid-cols-2 md:gap-x-8">
      <TextField label="Your name" autoComplete="name" value={data.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
      <TextField
        label="Mobile number"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="98765 43210"
        value={data.phone}
        onChange={(e) => set("phone", e.target.value)}
        error={errors.phone}
      />
      <TextField
        label="Email (optional)"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={data.email}
        onChange={(e) => set("email", e.target.value)}
        error={errors.email}
      />
      <SelectField label="About" value={data.subject} onChange={(e) => set("subject", e.target.value)}>
        {SUBJECTS.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </SelectField>
      <TextAreaField
        label="Your message"
        className="md:col-span-2"
        value={data.message}
        onChange={(e) => set("message", e.target.value)}
        error={errors.message}
        hint={`${data.message.length}/1000`}
        maxLength={1000}
      />
      <CheckboxField
        className="md:col-span-2"
        label="You may reply by phone, WhatsApp or email about this message."
        checked={data.consent}
        onChange={(e) => set("consent", e.target.checked)}
        error={errors.consent}
      />
      <div className="mt-6 md:col-span-2">
        <Button type="submit" size="lg" arrow disabled={!hydrated || status === "sending"}>
          {status === "sending" ? "Sending" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
