"use client";

import Image from "@/components/ui/Img";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { collections } from "@/data/collections";
import { site, whatsappLink } from "@/data/site";
import {
  bookingIcs,
  formatIndianMobile,
  googleCalendarLink,
  longDate,
  slotLabel,
  slotsFor,
  slotUnavailable,
  visitMinutes,
} from "@/lib/booking";
import { productPath } from "@/lib/enquiry";
import { formatGrams } from "@/lib/format";
import { useHydrated } from "@/lib/motion";
import { occasionLabels, type Booking, type Occasion } from "@/store/bookings";
import { useBookings } from "@/store";
import { pieceImage, useVisibleProducts } from "@/lib/pieces";
import Button from "../ui/Button";
import { CheckboxField, SelectField, TextAreaField, TextField, validators } from "../ui/Field";
import { CalendarIcon, CheckIcon, WhatsAppIcon } from "../ui/Icons";
import DatePicker from "./DatePicker";

type Data = {
  name: string;
  phone: string;
  email: string;
  date: string | null;
  slot: string | null;
  occasion: Occasion | null;
  piece: string;
  notes: string;
  consent: boolean;
};

const STEPS = ["About you", "Date and time", "Your visit", "Review"] as const;

type Errors = Partial<Record<keyof Data, string>>;

function validate(step: number, d: Data): Errors {
  const e: Errors = {};
  if (step === 0) {
    const name = d.name.trim();
    if (!name) e.name = "Please tell us your name.";
    else if (name.length < 2 || !/^[\p{L} .'-]+$/u.test(name)) e.name = "Please use letters only.";
    const phone = validators.phoneIN(d.phone);
    if (phone) e.phone = phone;
    if (d.email.trim() && validators.email(d.email)) e.email = validators.email(d.email);
  }
  if (step === 1) {
    if (!d.date) e.date = "Please choose a day.";
    else if (!d.slot) e.slot = "Please choose a time.";
  }
  if (step === 2) {
    if (!d.occasion) e.occasion = "Please choose what the visit is for.";
    if (d.notes.length > 500) e.notes = "Please keep the note under 500 characters.";
  }
  if (step === 3 && !d.consent) e.consent = "Please confirm we may contact you about this visit.";
  return e;
}

export default function BookingForm() {
  const hydrated = useHydrated();
  const params = useSearchParams();
  const products = useVisibleProducts();
  const bookings = useBookings((s) => s.bookings);
  const addBooking = useBookings((s) => s.add);
  const initialPiece = params.get("piece") ?? "";
  const initialOccasion = params.get("occasion") as Occasion | null;
  const initialNote = (params.get("note") ?? "").slice(0, 500);
  const [data, setData] = useState<Data>({
    name: "",
    phone: "",
    email: "",
    date: null,
    slot: null,
    occasion: initialOccasion && initialOccasion in occasionLabels ? initialOccasion : null,
    piece: products.some((p) => p.slug === initialPiece) ? initialPiece : "",
    notes: initialNote,
    consent: false,
  });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<Booking | null>(null);
  const [sending, setSending] = useState(false);
  /** Bumped on each failed attempt so focus moves to the first problem after it renders. */
  const [attempt, setAttempt] = useState(0);
  const top = useRef<HTMLDivElement>(null);
  const dateLabel = useId();

  const set = <K extends keyof Data>(k: K, v: Data[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const piece = products.find((p) => p.slug === data.piece);
  const slots = data.date ? slotsFor(data.date) : [];
  const dayFull = useMemo(
    () => (key: string) => slotsFor(key).every((s) => slotUnavailable(key, s, bookings)),
    [bookings],
  );

  // Bring the form into view and focus the step heading when the step changes.
  useEffect(() => {
    if (!hydrated) return;
    top.current?.querySelector<HTMLElement>("[data-step-title]")?.focus({ preventScroll: true });
  }, [step, hydrated, done]);

  useEffect(() => {
    if (attempt) top.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-error="true"]')?.focus();
  }, [attempt]);

  const next = (e?: FormEvent) => {
    e?.preventDefault();
    const found = validate(step, data);
    setErrors(found);
    if (Object.keys(found).length) {
      setAttempt((a) => a + 1);
      return;
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    setSending(true);
    window.setTimeout(() => {
      const booking = addBooking({
        name: data.name.trim(),
        phone: formatIndianMobile(data.phone),
        email: data.email.trim() || undefined,
        date: data.date!,
        slot: data.slot!,
        occasion: data.occasion!,
        floor: data.occasion === "wedding" ? "bridal" : "ground",
        pieceSlug: data.piece || undefined,
        notes: data.notes.trim() || undefined,
      });
      setSending(false);
      setDone(booking);
    }, 700);
  };

  if (!hydrated) {
    return <div className="skeleton h-96 w-full" aria-label="Loading the booking form" />;
  }

  /* ---------------------------------------------------------- confirmation */
  if (done) {
    const ics = `data:text/calendar;charset=utf-8,${encodeURIComponent(bookingIcs(done, piece?.name))}`;
    return (
      <div ref={top} className="[animation:menu-in_0.8s_var(--ease-luxe)]">
        <span className="flex size-14 items-center justify-center rounded-full border border-gold text-gold-deep">
          <CheckIcon className="size-6" />
        </span>
        <h2 data-step-title="" tabIndex={-1} className="mt-8 font-serif text-4xl font-light text-ink outline-none md:text-5xl">
          Thank you, {done.name.split(" ")[0]}. We will see you soon.
        </h2>
        <p className="mt-4 max-w-prose text-ink-soft">
          Your visit is requested. We will confirm on WhatsApp within a few hours, and ring if anything needs to change.
        </p>

        <dl className="mt-10 grid gap-6 border-y border-line py-8 sm:grid-cols-2">
          {[
            ["Reference", done.id],
            ["When", `${longDate(done.date)}, ${slotLabel(done.slot)} (about ${visitMinutes(done)} minutes)`],
            ["Where", done.floor === "bridal" ? "First floor, the bridal salon" : "Ground floor, the gold floor"],
            ["For", occasionLabels[done.occasion].label],
            ["Name", done.name],
            ["Phone", done.phone],
            ...(piece ? [["Piece kept aside", `${piece.name} (${piece.code})`]] : []),
            ...(done.notes ? [["Your note", done.notes]] : []),
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="eyebrow text-stone">{k}</dt>
              <dd className="mt-2 text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button href={ics} external download={`ahs-visit-${done.date}.ics`} icon={<CalendarIcon className="size-4" />} magnetic={false}>
            Add to calendar
          </Button>
          <Button href={googleCalendarLink(done)} external variant="secondary" magnetic={false}>
            Google Calendar
          </Button>
          <Button
            href={whatsappLink(`Hello AHS Jewellers, I have booked a visit (${done.id}) for ${longDate(done.date)} at ${slotLabel(done.slot)}.`)}
            external
            variant="secondary"
            magnetic={false}
            icon={<WhatsAppIcon className="size-4" />}
          >
            Message us
          </Button>
        </div>
        <p className="mt-8 text-sm text-stone">
          {site.address.line1}, {site.address.line2}, {site.address.city}.{" "}
          <Link href="/contact" className="link-line text-ink">
            Directions
          </Link>
        </p>
      </div>
    );
  }

  /* ------------------------------------------------------------- the form */
  return (
    <div ref={top}>
      {/* Progress */}
      <ol className="grid grid-cols-4 gap-2" aria-label="Booking steps">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined}>
            <span className="relative block h-px w-full overflow-hidden bg-line-strong">
              <span className={`absolute inset-0 origin-left bg-gold transition-transform duration-700 ease-luxe ${i <= step ? "scale-x-100" : "scale-x-0"}`} />
            </span>
            <span className={`mt-3 hidden eyebrow sm:block ${i === step ? "text-ink" : "text-stone"}`}>
              {String(i + 1).padStart(2, "0")} {s}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-3 eyebrow text-stone sm:hidden">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      <form onSubmit={next} noValidate className="mt-10">
        <div key={step} className="[animation:menu-in_0.6s_var(--ease-luxe)]">
          <h2 data-step-title="" tabIndex={-1} className="font-serif text-3xl font-light text-ink outline-none md:text-4xl">
            {["Who should we expect?", "When would you like to come?", "What brings you in?", "Does this look right?"][step]}
          </h2>

          {step === 0 ? (
            <div className="mt-8 grid gap-2 md:grid-cols-2 md:gap-x-8">
              <TextField label="Your name" autoComplete="name" value={data.name} onChange={(e) => set("name", e.target.value)} error={errors.name} className="md:col-span-2" />
              <TextField
                label="Mobile number"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="98765 43210"
                value={data.phone}
                onChange={(e) => set("phone", e.target.value)}
                error={errors.phone}
                hint="Indian mobile. We confirm on WhatsApp."
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
            </div>
          ) : null}

          {step === 1 ? (
            <div className="mt-8 grid gap-10 md:grid-cols-2">
              <div>
                <p id={dateLabel} className="eyebrow text-stone">
                  Day
                </p>
                <div className="mt-4" data-error={errors.date ? "true" : undefined} tabIndex={errors.date ? -1 : undefined}>
                  <DatePicker
                    value={data.date}
                    onChange={(k) => {
                      setData((d) => ({ ...d, date: k, slot: d.slot && !slotUnavailable(k, d.slot, bookings) ? d.slot : null }));
                      setErrors({});
                    }}
                    isFull={dayFull}
                    labelledBy={dateLabel}
                  />
                </div>
                {errors.date ? <p className="mt-3 text-xs text-error">{errors.date}</p> : null}
              </div>
              <fieldset>
                <legend className="eyebrow text-stone">Time</legend>
                {!data.date ? (
                  <p className="mt-4 border border-dashed border-line-strong p-6 text-sm text-stone">Choose a day to see the times we have free.</p>
                ) : (
                  <>
                    <p className="mt-4 text-sm text-ink-soft">{longDate(data.date)}</p>
                    <div className="mt-4 grid grid-cols-3 gap-2" data-error={errors.slot ? "true" : undefined} tabIndex={errors.slot ? -1 : undefined}>
                      {slots.map((s) => {
                        const why = slotUnavailable(data.date!, s, bookings);
                        const chosen = data.slot === s;
                        return (
                          <label
                            key={s}
                            className={`relative flex h-12 cursor-pointer items-center justify-center border text-sm transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold-deep ${
                              why
                                ? "cursor-not-allowed border-line text-line-strong line-through"
                                : chosen
                                  ? "border-ink bg-ink text-white"
                                  : "border-line-strong text-ink hover:border-ink"
                            }`}
                          >
                            <input
                              type="radio"
                              name="slot"
                              value={s}
                              checked={chosen}
                              disabled={Boolean(why)}
                              onChange={() => set("slot", s)}
                              className="sr-only"
                            />
                            {slotLabel(s)}
                            {why === "booked" ? <span className="sr-only">, already booked</span> : null}
                          </label>
                        );
                      })}
                    </div>
                    {errors.slot ? <p className="mt-3 text-xs text-error">{errors.slot}</p> : null}
                    <p className="mt-4 text-xs text-stone">Struck-through times are already taken.</p>
                  </>
                )}
              </fieldset>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="mt-8 flex flex-col gap-8">
              <fieldset>
                <legend className="eyebrow text-stone">The occasion</legend>
                <div className="mt-4 grid gap-3 sm:grid-cols-2" data-error={errors.occasion ? "true" : undefined} tabIndex={errors.occasion ? -1 : undefined}>
                  {(Object.keys(occasionLabels) as Occasion[]).map((o) => {
                    const chosen = data.occasion === o;
                    return (
                      <label
                        key={o}
                        className={`flex cursor-pointer flex-col gap-1 border p-5 transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold-deep ${
                          chosen ? "border-ink bg-ivory" : "border-line-strong hover:border-ink"
                        }`}
                      >
                        <input type="radio" name="occasion" value={o} checked={chosen} onChange={() => set("occasion", o)} className="sr-only" />
                        <span className="flex items-center justify-between font-serif text-2xl text-ink">
                          {occasionLabels[o].label}
                          <span className={`flex size-5 items-center justify-center rounded-full border ${chosen ? "border-gold bg-gold text-white" : "border-line-strong"}`}>
                            {chosen ? <CheckIcon className="size-3" /> : null}
                          </span>
                        </span>
                        <span className="text-sm text-stone">{occasionLabels[o].note}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.occasion ? <p className="mt-3 text-xs text-error">{errors.occasion}</p> : null}
              </fieldset>

              <SelectField label="A piece you would like to see (optional)" value={data.piece} onChange={(e) => set("piece", e.target.value)} hint="We will have it ready on the counter.">
                <option value="">No particular piece</option>
                {collections.map((c) => (
                  <optgroup key={c.slug} label={c.name}>
                    {products
                      .filter((p) => p.collection === c.slug)
                      .map((p) => (
                        <option key={p.slug} value={p.slug}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                  </optgroup>
                ))}
              </SelectField>
              {piece ? (
                <div className="-mt-4 flex items-center gap-4 border border-line bg-ivory p-3">
                  <span className="relative block size-16 shrink-0 overflow-hidden bg-white">
                    <Image src={pieceImage(piece).src} alt="" fill sizes="64px" className="object-cover" />
                  </span>
                  <span className="text-sm">
                    <Link href={productPath(piece)} className="link-draw font-serif text-lg text-ink">
                      {piece.name}
                    </Link>
                    <span className="block text-stone">
                      {piece.code} · {piece.purity} · {formatGrams(piece.weight)}
                    </span>
                  </span>
                </div>
              ) : null}

              <TextAreaField
                label="Anything we should know? (optional)"
                value={data.notes}
                onChange={(e) => set("notes", e.target.value)}
                error={errors.notes}
                hint={`${data.notes.length}/500. Sizes, budget, who is coming with you.`}
                maxLength={500}
              />
            </div>
          ) : null}

          {step === 3 ? (
            <div className="mt-8">
              <dl className="border-t border-line">
                {[
                  { label: "You", value: `${data.name.trim()} · ${formatIndianMobile(data.phone)}${data.email ? ` · ${data.email.trim()}` : ""}`, step: 0 },
                  { label: "When", value: `${longDate(data.date!)}, ${slotLabel(data.slot!)}`, step: 1 },
                  {
                    label: "For",
                    value: `${occasionLabels[data.occasion!].label} · ${data.occasion === "wedding" ? "First floor, bridal salon" : "Ground floor"}`,
                    step: 2,
                  },
                  { label: "Piece", value: piece ? `${piece.name} (${piece.code})` : "No particular piece", step: 2 },
                  ...(data.notes.trim() ? [{ label: "Note", value: data.notes.trim(), step: 2 }] : []),
                ].map((r) => (
                  <div key={r.label} className="flex items-start justify-between gap-6 border-b border-line py-4">
                    <div>
                      <dt className="eyebrow text-stone">{r.label}</dt>
                      <dd className="mt-1 text-ink">{r.value}</dd>
                    </div>
                    <button type="button" onClick={() => setStep(r.step)} className="shrink-0 text-xs text-stone underline-offset-4 hover:text-ink hover:underline">
                      Change<span className="sr-only"> {r.label.toLowerCase()}</span>
                    </button>
                  </div>
                ))}
              </dl>
              <CheckboxField
                className="mt-8"
                label={`${site.name} may contact me by phone or WhatsApp about this visit.`}
                checked={data.consent}
                onChange={(e) => set("consent", e.target.checked)}
                error={errors.consent}
              />
            </div>
          ) : null}
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-8">
          {step > 0 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="eyebrow text-stone hover:text-ink">
              <span className="link-draw">Back</span>
            </button>
          ) : (
            <span />
          )}
          <Button type="submit" size="lg" arrow={step < 3} disabled={sending}>
            {sending ? "Sending" : step < 3 ? "Continue" : "Request this visit"}
          </Button>
        </div>
      </form>
    </div>
  );
}

