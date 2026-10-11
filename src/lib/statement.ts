import { schemeTerms, site, fullAddress } from "@/data/site";
import type { SchemeMember } from "@/store/scheme";
import { paymentMethodLabels } from "@/store/scheme";
import { shortDate, todayKey } from "./dates";
import { formatINR } from "./format";
import { dueDate, gramsFor, maturityDate, paidTotal, schemeMaturity } from "./scheme";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

/**
 * A self-contained, printable HTML statement for one scheme. Opens in any
 * browser and prints cleanly to PDF. Marked as a demo document.
 */
export function statementHtml(m: SchemeMember, rate22: number) {
  const { total, bonus } = schemeMaturity(m.monthly);
  const paid = paidTotal(m);
  const rows = Array.from({ length: schemeTerms.instalments }, (_, i) => {
    const n = i + 1;
    const p = m.payments.find((x) => x.n === n);
    return `<tr>
      <td>${n}</td>
      <td>${shortDate(dueDate(m, n))}</td>
      <td>${p ? shortDate(p.paidOn) : "&ndash;"}</td>
      <td>${p ? esc(paymentMethodLabels[p.method]) + (p.demo ? " (demo)" : "") : "Not yet due or unpaid"}</td>
      <td>${p ? esc(p.ref) : ""}</td>
      <td class="r">${p ? formatINR(p.amount) : ""}</td>
    </tr>`;
  }).join("");

  return `<!doctype html>
<html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.name)} scheme statement ${esc(m.id)}</title>
<style>
  body{font-family:Georgia,'Times New Roman',serif;color:#1a1714;background:#fff;margin:0;padding:48px 24px}
  .w{max-width:760px;margin:0 auto}
  .demo{display:inline-block;border:1px solid #b08d57;color:#86663a;font:600 11px/1 Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;padding:6px 10px}
  h1{font-weight:400;font-size:34px;margin:24px 0 4px} .muted{color:#6b635a;font:13px/1.6 Arial,sans-serif}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:28px 0;border-top:1px solid #e8e2d9;padding-top:20px}
  .grid div span{display:block;font:600 10px Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#6b635a}
  .grid div b{display:block;font-weight:400;font-size:20px;margin-top:6px}
  table{width:100%;border-collapse:collapse;font:13px Arial,sans-serif;margin-top:8px}
  th{text-align:left;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#6b635a;border-bottom:1px solid #d4cbbe;padding:8px 6px}
  td{border-bottom:1px solid #e8e2d9;padding:9px 6px} .r{text-align:right}
  tfoot td{font-weight:600;border-bottom:0}
  .rule{height:1px;width:48px;background:#b08d57;margin:20px 0}
  @media print{body{padding:0}.demo{border-color:#999}}
</style></head><body><div class="w">
  <span class="demo">Demo statement &middot; not a real account</span>
  <h1>${esc(site.name)}</h1>
  <div class="muted">${esc(fullAddress())} &middot; ${esc(site.phone.display)}</div>
  <div class="rule"></div>
  <div style="font-size:22px">${esc(schemeTerms.name)} statement</div>
  <div class="muted">Issued ${shortDate(todayKey())} for ${esc(m.name)}, ${esc(m.phone)} &middot; Membership ${esc(m.id)}</div>
  <div class="grid">
    <div><span>Monthly instalment</span><b>${formatINR(m.monthly)}</b></div>
    <div><span>Paid so far</span><b>${formatINR(paid)} (${m.payments.length} of ${schemeTerms.instalments})</b></div>
    <div><span>Redeem from</span><b>${shortDate(maturityDate(m))}</b></div>
    <div><span>Our bonus</span><b>${formatINR(bonus)}</b></div>
    <div><span>Redemption value</span><b>${formatINR(total)}</b></div>
    <div><span>At today’s 22K rate</span><b>&asymp; ${gramsFor(total, rate22).toFixed(2)} g</b></div>
  </div>
  <table><thead><tr><th>No.</th><th>Due</th><th>Paid on</th><th>Method</th><th>Receipt</th><th class="r">Amount</th></tr></thead>
  <tbody>${rows}</tbody>
  <tfoot><tr><td colspan="5">Total received</td><td class="r">${formatINR(paid)}</td></tr></tfoot></table>
  <p class="muted" style="margin-top:28px">Grams are approximate, at today’s 22K rate of ${formatINR(rate22)}/g before making charges. The balance is redeemed in jewellery at the rate on the day of redemption. Sample terms for the prototype.</p>
</div></body></html>`;
}

/** Trigger a browser download of the statement. */
export function downloadStatement(m: SchemeMember, rate22: number) {
  const blob = new Blob([statementHtml(m, rate22)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `AHS-statement-${m.id}.html`;
  a.dataset.transition = "off";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
