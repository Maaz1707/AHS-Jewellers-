/** Small, quiet markers used on cards and feature pages. */

/** Marks a feature that runs on sample data: no money, gold or card details are involved. */
export function DemoTag({ label = "Demo", className = "" }: { label?: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 border border-gold px-2 py-1 text-micro font-medium uppercase tracking-label text-gold-deep ${className}`}>
      <span aria-hidden="true" className="size-1 rounded-full bg-gold" />
      {label}
    </span>
  );
}

/** Coins and selected lighter pieces that can be bought online. */
export function OnlineTag({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center bg-white/95 px-2 py-1 text-micro font-medium uppercase tracking-label text-ink ${className}`}>
      Available online
    </span>
  );
}
