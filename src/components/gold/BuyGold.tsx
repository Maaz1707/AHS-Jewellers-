"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { SAMPLE_MEMBER } from "@/data/demo";
import { digitalGoldTerms } from "@/data/site";
import { formatIndianMobile } from "@/lib/booking";
import { formatINR, formatNumber } from "@/lib/format";
import { balanceOf, formatVaultGrams, goldQuote, gramsForRupees, rupeesForGrams } from "@/lib/gold";
import { useHydrated } from "@/lib/motion";
import { samePhone } from "@/store/scheme";
import type { GoldTxn } from "@/store/gold";
import { useGold, useSession, useToast } from "@/store";
import { useRateInfo } from "../layout/useRateInfo";
import Button from "../ui/Button";
import { TextField, validators } from "../ui/Field";
import { CheckIcon, RefreshIcon, VaultIcon } from "../ui/Icons";
import { DemoTag } from "../ui/Tags";
import AnimatedValue from "../ui/AnimatedValue";

type Unit = "rupees" | "grams";
type Method = "upi" | "card" | "netbanking";

const RUPEE_CHIPS = [500, 1000, 5000, 10000];
const GRAM_CHIPS = [0.5, 1, 5, 10];
const METHODS: { value: Method; label: string }[] = [
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "netbanking", label: "Net banking" },
];
/** Seconds a quoted rate is held before it is refreshed. */
const HOLD = 300;

/**
 * Buy digital gold: enter rupees or grams, see the conversion at today’s 24K
 * rate, then a demo confirmation. Nothing is charged and no gold is bought.
 */
export default function BuyGold() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { rates, updated } = useRateInfo();
  const rate = rates["24K"];
  const member = useSession((s) => s.member);
  const signIn = useSession((s) => s.signIn);
  const txns = useGold((s) => s.txns);
  const buy = useGold((s) => s.buy);
  const show = useToast((s) => s.show);

  const [unit, setUnit] = useState<Unit>("rupees");
  const [input, setInput] = useState("1,000");
  const [stage, setStage] = useState<"amount" | "confirm" | "processing" | "done">("amount");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<Method>("upi");
  const [errors, setErrors] = useState<{ amount?: string; name?: string; phone?: string }>({});
  const [attempt, setAttempt] = useState(0);
  const [receipt, setReceipt] = useState<GoldTxn | null>(null);
  const [left, setLeft] = useState(HOLD);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (attempt) box.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [attempt]);

  // The quoted rate is held for five minutes on the confirmation step.
  useEffect(() => {
    if (stage !== "confirm") return;
    const t = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [stage]);

  const value = Number(input.replace(/[^\d.]/g, "")) || 0;
  const rupees = unit === "rupees" ? Math.round(value) : rupeesForGrams(value, rate);
  const grams = unit === "rupees" ? gramsForRupees(value, rate) : Math.floor(value * 10000) / 10000;
  const quote = goldQuote(rupees, rate);

  const switchUnit = (u: Unit) => {
    if (u === unit) return;
    // Carry the amount across so the visitor sees the same purchase in the other unit.
    setInput(u === "grams" ? (grams ? String(grams) : "") : rupees ? formatNumber(rupees) : "");
    setUnit(u);
    setErrors({});
  };

  const checkAmount = () => {
    if (!value) return "Enter an amount to buy.";
    if (rupees < digitalGoldTerms.minRupees) return `The smallest purchase is ${formatINR(digitalGoldTerms.minRupees)}.`;
    if (rupees > digitalGoldTerms.maxRupees) return `Online purchases are up to ${formatINR(digitalGoldTerms.maxRupees)} a day. For more, visit us.`;
    return "";
  };

  const toConfirm = (e: FormEvent) => {
    e.preventDefault();
    const err = checkAmount();
    if (err) {
      setErrors({ amount: err });
      return setAttempt((a) => a + 1);
    }
    setErrors({});
    setLeft(HOLD);
    setStage("confirm");
  };

  const confirm = () => {
    const who = member ?? { name: name.trim(), phone };
    if (!member) {
      const found: typeof errors = {};
      if (!name.trim()) found.name = "Please tell us your name.";
      const p = validators.phoneIN(phone);
      if (p) found.phone = p;
      if (found.name || found.phone) {
        setErrors(found);
        return setAttempt((a) => a + 1);
      }
    }
    setStage("processing");
    window.setTimeout(() => {
      const txn = buy({ name: who.name, phone: formatIndianMobile(who.phone), grams, rate, amount: rupees, method });
      if (!member) signIn({ name: who.name, phone: formatIndianMobile(who.phone) });
      setReceipt(txn);
      setStage("done");
      show({ title: "Demo purchase recorded", body: `${formatVaultGrams(txn.grams)} of 24K gold added to your wallet.` });
    }, 1400);
  };

  const reset = () => {
    setStage("amount");
    setReceipt(null);
  };

  if (!hydrated) return <div className="skeleton h-96 w-full" aria-label="Loading the gold calculator" />;

  /* ---------------------------------------------------------------- Done */
  if (stage === "done" && receipt) {
    const balance = balanceOf(txns.filter((t) => samePhone(t.phone, receipt.phone)));
    return (
      <div role="status" className="[animation:menu-in_0.6s_var(--ease-luxe)]">
        <div className="flex items-center justify-between gap-4">
          <span className="flex size-12 items-center justify-center rounded-full border border-gold text-gold-deep">
            <CheckIcon className="size-5" />
          </span>
          <DemoTag />
        </div>
        <p className="mt-6 font-serif text-3xl font-light text-ink">{formatVaultGrams(receipt.grams)} added to your vault</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-line py-5 text-sm">
          <div>
            <dt className="eyebrow text-stone">Paid (demo)</dt>
            <dd className="mt-1 text-ink figures">{formatINR(receipt.amount)}</dd>
          </div>
          <div>
            <dt className="eyebrow text-stone">Rate</dt>
            <dd className="mt-1 text-ink figures">{formatINR(receipt.rate)}/g</dd>
          </div>
          <div>
            <dt className="eyebrow text-stone">Your balance</dt>
            <dd className="mt-1 text-ink figures">{formatVaultGrams(balance)}</dd>
          </div>
          <div>
            <dt className="eyebrow text-stone">Reference</dt>
            <dd className="mt-1 text-ink">{receipt.id}</dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button onClick={() => router.push("/account#gold")} arrow>
            See my gold wallet
          </Button>
          <button type="button" onClick={reset} className="eyebrow text-stone hover:text-ink">
            <span className="link-draw">Buy more</span>
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- Confirm */
  if (stage === "confirm" || stage === "processing") {
    const expired = left === 0;
    return (
      <div ref={box} className="[animation:menu-in_0.5s_var(--ease-luxe)]">
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow text-gold-deep">Confirm your purchase</p>
          <DemoTag />
        </div>
        <p className="mt-4 font-serif text-4xl text-ink figures">{formatVaultGrams(grams)}</p>
        <p className="mt-1 text-sm text-stone">of 24K gold ({digitalGoldTerms.fineness}) for {formatINR(rupees)}</p>
        <p className={`mt-4 flex items-center gap-2 text-xs ${expired ? "text-error" : "text-stone"}`} aria-live="polite">
          {expired ? (
            <>
              The rate hold has ended.
              <button type="button" onClick={() => setLeft(HOLD)} className="inline-flex items-center gap-1 text-ink underline underline-offset-4">
                <RefreshIcon className="size-4" /> Refresh the rate
              </button>
            </>
          ) : (
            <>
              Rate of {formatINR(rate)}/g held for {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
            </>
          )}
        </p>

        <fieldset className="mt-8" disabled={stage === "processing"}>
          {member ? (
            <p className="text-sm text-ink-soft">
              Buying as <span className="text-ink">{member.name || member.phone}</span>, {member.phone}.
            </p>
          ) : (
            <>
              <legend className="eyebrow text-stone">Whose vault?</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 sm:gap-x-6">
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
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setName(SAMPLE_MEMBER.name);
                  setPhone(SAMPLE_MEMBER.phone);
                  setErrors({});
                }}
                className="text-xs text-stone underline-offset-4 hover:text-ink hover:underline"
              >
                Presenting? Use the sample member
              </button>
            </>
          )}

          <div className="mt-6">
            <p className="eyebrow text-stone">Pay with</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`flex h-12 cursor-pointer items-center justify-center border text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold-deep ${
                    method === m.value ? "border-ink bg-ink text-white" : "border-line-strong text-ink hover:border-ink"
                  }`}
                >
                  <input type="radio" name="gold-method" value={m.value} checked={method === m.value} onChange={() => setMethod(m.value)} className="sr-only" />
                  {m.label}
                </label>
              ))}
            </div>
          </div>
        </fieldset>
        <p className="mt-4 text-xs text-stone">A demonstration: no card, bank or UPI details are asked for, and nothing is charged.</p>
        <div className="mt-6 flex flex-wrap items-center gap-6">
          <Button onClick={confirm} disabled={stage === "processing" || expired} size="lg">
            {stage === "processing" ? "Recording your purchase" : `Pay ${formatINR(rupees)} (demo)`}
          </Button>
          <button type="button" onClick={() => setStage("amount")} disabled={stage === "processing"} className="eyebrow text-stone hover:text-ink">
            Back
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------- Amount */
  const err = errors.amount;
  return (
    <div ref={box}>
    <form onSubmit={toConfirm} noValidate aria-label="Buy digital gold">
      <div className="flex items-center justify-between gap-4">
        <div role="tablist" aria-label="Buy in" className="inline-flex border border-line-strong">
          {(["rupees", "grams"] as Unit[]).map((u) => (
            <button
              key={u}
              type="button"
              role="tab"
              aria-selected={unit === u}
              onClick={() => switchUnit(u)}
              className={`h-10 px-4 text-sm transition-colors ${unit === u ? "bg-ink text-white" : "text-ink-soft hover:text-ink"}`}
            >
              {u === "rupees" ? "In rupees" : "In grams"}
            </button>
          ))}
        </div>
        <DemoTag />
      </div>

      <label htmlFor="gold-amount" className="mt-8 block eyebrow text-stone">
        {unit === "rupees" ? "I want to spend" : "I want to buy"}
      </label>
      <div className={`mt-2 flex items-baseline gap-2 border-b pb-2 transition-colors ${err ? "border-error" : "border-line-strong focus-within:border-ink"}`}>
        <span aria-hidden="true" className="font-serif text-4xl text-stone">
          {unit === "rupees" ? "₹" : ""}
        </span>
        <input
          id="gold-amount"
          inputMode="decimal"
          autoComplete="off"
          value={input}
          onChange={(e) => {
            const raw = e.target.value.replace(unit === "rupees" ? /[^\d]/g : /[^\d.]/g, "");
            setInput(unit === "rupees" && raw ? formatNumber(Number(raw)) : raw);
            setErrors({});
          }}
          aria-invalid={err ? true : undefined}
          aria-describedby="gold-amount-note"
          className="w-full min-w-0 flex-1 bg-transparent font-serif text-5xl text-ink figures outline-none focus-visible:outline-none"
        />
        {unit === "grams" ? (
          <span aria-hidden="true" className="font-serif text-3xl text-stone">
            g
          </span>
        ) : null}
      </div>
      <p id="gold-amount-note" className={`mt-2 min-h-6 text-xs ${err ? "text-error" : "text-stone"}`} aria-live="polite">
        {err || `From ${formatINR(digitalGoldTerms.minRupees)}. GST of 3% is included.`}
      </p>

      <div className="mt-2 grid grid-cols-4 gap-2">
        {(unit === "rupees" ? RUPEE_CHIPS : GRAM_CHIPS).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setInput(unit === "rupees" ? formatNumber(c) : String(c));
              setErrors({});
            }}
            className="chip"
          >
            {unit === "rupees" ? formatINR(c) : `${c} g`}
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-4 bg-ivory p-5">
        <VaultIcon className="size-8 shrink-0 text-gold-deep" />
        <p className="text-sm text-ink-soft" aria-live="polite">
          {unit === "rupees" ? (
            <>
              You get <AnimatedValue value={grams} format={formatVaultGrams} className="font-serif text-2xl text-ink" /> of 24K gold
            </>
          ) : (
            <>
              You pay <AnimatedValue value={rupees} format={formatINR} className="font-serif text-2xl text-ink" />
            </>
          )}
        </p>
      </div>
      <dl className="mt-4 flex flex-col gap-2 text-sm figures">
        <div className="flex justify-between gap-4">
          <dt className="text-stone">Gold value at {formatINR(rate)}/g</dt>
          <dd className="text-ink">{formatINR(quote.value)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-stone">GST (3%)</dt>
          <dd className="text-ink">{formatINR(quote.gst)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-stone">Today’s 24K rate{updated ? `, updated ${updated.time}` : ""}. Held in your name by a licensed vault partner.</p>

      <div className="mt-8">
        <Button type="submit" size="lg" arrow className="w-full">
          {rupees ? `Buy ${formatINR(rupees)} of gold` : "Buy gold"}
        </Button>
      </div>
    </form>
    </div>
  );
}
