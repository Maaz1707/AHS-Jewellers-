"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { schemeTerms, site, whatsappLink } from "@/data/site";
import { formatIndianMobile } from "@/lib/booking";
import { shortDate } from "@/lib/dates";
import { formatINR, formatNumber } from "@/lib/format";
import { useHydrated } from "@/lib/motion";
import { dueDate, maturityDate, schemeMaturity } from "@/lib/scheme";
import { samePhone, type SchemeMember } from "@/store/scheme";
import { useScheme, useSession } from "@/store";
import Button from "../ui/Button";
import { CheckboxField, TextField, validators } from "../ui/Field";
import { CheckIcon } from "../ui/Icons";

type Errors = Partial<Record<"name" | "phone" | "monthly" | "consent", string>>;

export default function EnrolForm({ monthly, onMonthly }: { monthly: number; onMonthly: (n: number) => void }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const members = useScheme((s) => s.members);
  const enrol = useScheme((s) => s.enrol);
  const signIn = useSession((s) => s.signIn);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<SchemeMember | null>(null);
  const form = useRef<HTMLFormElement>(null);

  const existing = phone && !validators.phoneIN(phone) ? members.find((m) => samePhone(m.phone, phone) && m.payments.length < schemeTerms.instalments) : undefined;

  useEffect(() => {
    if (attempt) form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [attempt]);

  const amountValue = amount !== null ? Number(amount.replace(/[^\d]/g, "")) : monthly;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found: Errors = {};
    if (!name.trim()) found.name = "Please tell us your name.";
    const p = validators.phoneIN(phone);
    if (p) found.phone = p;
    if (!amountValue || amountValue < schemeTerms.minMonthly) found.monthly = `The minimum is ${formatINR(schemeTerms.minMonthly)} a month.`;
    else if (amountValue > schemeTerms.maxMonthly) found.monthly = `For more than ${formatINR(schemeTerms.maxMonthly)} a month, please speak to us.`;
    else if (amountValue % schemeTerms.step) found.monthly = `Please use steps of ${formatINR(schemeTerms.step)}.`;
    if (!consent) found.consent = "Please accept the scheme terms to enrol.";
    setErrors(found);
    if (Object.keys(found).length) {
      setAttempt((a) => a + 1);
      return;
    }
    setSending(true);
    window.setTimeout(() => {
      const member = enrol({ name: name.trim(), phone: formatIndianMobile(phone), monthly: amountValue });
      setSending(false);
      setDone(member);
    }, 800);
  };

  if (done) {
    const { total, bonus } = schemeMaturity(done.monthly);
    const openAccount = () => {
      signIn({ name: done.name, phone: done.phone });
      router.push("/account");
    };
    return (
      <div role="status" className="[animation:menu-in_0.8s_var(--ease-luxe)]">
        <span className="flex size-14 items-center justify-center rounded-full border border-gold text-gold-deep">
          <CheckIcon className="size-6" />
        </span>
        <h3 className="mt-8 font-serif text-4xl font-light text-ink">Welcome to the scheme, {done.name.split(" ")[0]}.</h3>
        <p className="mt-4 max-w-prose text-ink-soft">
          Your membership is set up. Pay your first instalment at the counter or in your member area, and we will send a
          receipt on WhatsApp each month.
        </p>
        <dl className="mt-10 grid gap-6 border-y border-line py-8 sm:grid-cols-2">
          {[
            ["Membership number", done.id],
            ["Monthly instalment", formatINR(done.monthly)],
            ["First instalment due", shortDate(dueDate(done, 1))],
            [`Last instalment (${schemeTerms.instalments})`, shortDate(dueDate(done, schemeTerms.instalments))],
            ["Redeem from", shortDate(maturityDate(done))],
            ["Redemption value", `${formatINR(total)}, including our ${formatINR(bonus)}`],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="eyebrow text-stone">{k}</dt>
              <dd className="mt-2 text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button onClick={openAccount} arrow>
            Open my member area
          </Button>
          <Button
            href={whatsappLink(`Hello ${site.name}, I have just enrolled in the ${schemeTerms.name} (${done.id}).`)}
            external
            variant="secondary"
            magnetic={false}
          >
            Tell us on WhatsApp
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form ref={form} onSubmit={onSubmit} noValidate aria-label="Enrol in the savings scheme" className="grid gap-2 md:grid-cols-2 md:gap-x-8">
      <TextField label="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
      <TextField
        label="Mobile number"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="98765 43210"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
        hint={existing ? `This number already has scheme ${existing.id}.` : "Receipts and reminders come on WhatsApp."}
      />
      <TextField
        label="Monthly amount (₹)"
        inputMode="numeric"
        value={amount ?? formatNumber(monthly)}
        onChange={(e) => setAmount(e.target.value)}
        onBlur={() => {
          if (amountValue >= schemeTerms.minMonthly && amountValue <= schemeTerms.maxMonthly && amountValue % schemeTerms.step === 0) {
            onMonthly(amountValue);
            setAmount(null);
          }
        }}
        error={errors.monthly}
        hint={`From ${formatINR(schemeTerms.minMonthly)}, in steps of ${formatINR(schemeTerms.step)}.`}
        className="md:col-span-2"
      />
      {existing ? (
        <p className="text-sm text-stone md:col-span-2">
          Already a member?{" "}
          <Link href="/account" className="link-line text-ink">
            See your scheme in the member area
          </Link>
          . You can still start a second one below.
        </p>
      ) : null}
      <CheckboxField
        className="mt-2 md:col-span-2"
        label={`I accept the sample scheme terms: ${schemeTerms.instalments} monthly instalments, a bonus of ${schemeTerms.bonusInstalments} instalment, redeemed in jewellery from month ${schemeTerms.redeemMonth}.`}
        checked={consent}
        onChange={(e) => setConsent(e.target.checked)}
        error={errors.consent}
      />
      <div className="mt-6 md:col-span-2">
        <Button type="submit" size="lg" arrow disabled={!hydrated || sending}>
          {sending ? "Enrolling" : `Enrol at ${formatINR(amountValue || monthly)} a month`}
        </Button>
      </div>
    </form>
  );
}
