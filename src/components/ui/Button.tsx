"use client";

import Link from "next/link";
import { useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { gsap, useGSAP, MOTION } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { ArrowRight } from "./Icons";

type Variant = "primary" | "secondary" | "light" | "outline-light";
type Size = "md" | "lg";

type Common = {
  variant?: Variant;
  size?: Size;
  /** Show the trailing arrow. */
  arrow?: boolean;
  /** Subtle pull toward the cursor. On by default for primary buttons. */
  magnetic?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
};

type AsLink = Common & { href: string; external?: boolean } & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">;
type AsButton = Common & { href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-3 overflow-hidden eyebrow transition-colors duration-500 ease-luxe focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-40";

const sizes: Record<Size, string> = {
  md: "h-12 px-6",
  lg: "h-14 px-8",
};

/** Resting colours and the colour of the fill that sweeps up on hover. */
const variants: Record<Variant, { rest: string; fill: string; hoverText: string }> = {
  primary: { rest: "bg-ink text-white", fill: "bg-gold-deep", hoverText: "" },
  secondary: { rest: "border border-ink text-ink", fill: "bg-ink", hoverText: "group-hover/btn:text-white group-focus-visible/btn:text-white" },
  light: { rest: "bg-white text-ink", fill: "bg-ivory-deep", hoverText: "" },
  "outline-light": {
    rest: "border border-white/60 text-white",
    fill: "bg-white",
    hoverText: "group-hover/btn:text-ink group-focus-visible/btn:text-ink",
  },
};

export default function Button(props: AsLink | AsButton) {
  const { variant = "primary", size = "md", arrow = false, magnetic, icon, className = "", children, ...rest } = props;
  const ref = useRef<HTMLElement>(null);
  const v = variants[variant];
  const isMagnetic = magnetic ?? variant === "primary";

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !isMagnetic || prefersReducedMotion() || !window.matchMedia("(hover: hover)").matches) return;
      const xTo = gsap.quickTo(el, "x", { duration: MOTION.fast, ease: MOTION.ease });
      const yTo = gsap.quickTo(el, "y", { duration: MOTION.fast, ease: MOTION.ease });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.18);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.28);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { dependencies: [isMagnetic] },
  );

  const inner = (
    <>
      <span
        aria-hidden="true"
        className={`absolute inset-0 origin-bottom scale-y-0 transition-transform duration-700 ease-luxe group-hover/btn:scale-y-100 group-focus-visible/btn:scale-y-100 ${v.fill}`}
      />
      <span className={`relative flex items-center gap-3 transition-colors duration-500 ${v.hoverText}`}>
        {icon}
        {children}
        {arrow ? (
          <ArrowRight className="size-4 transition-transform duration-500 ease-luxe group-hover/btn:translate-x-1" />
        ) : null}
      </span>
    </>
  );

  const classes = `${base} ${sizes[size]} ${v.rest} ${className}`;

  if ("href" in rest && rest.href !== undefined) {
    const { href, external, ...anchorProps } = rest as AsLink;
    if (external) {
      return (
        <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} target="_blank" rel="noopener noreferrer" className={classes} {...anchorProps}>
          {inner}
        </a>
      );
    }
    return (
      <Link ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={classes} {...anchorProps}>
        {inner}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest as AsButton;
  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} type={type} className={classes} {...buttonProps}>
      {inner}
    </button>
  );
}
