"use client";

import Image from "@/components/ui/Img";
import Link from "next/link";
import { useMemo, useState } from "react";
import { enquiryReplyMessage, waTo } from "@/lib/admin";
import { stamp } from "@/lib/dates";
import { productPath } from "@/lib/enquiry";
import { useHydrated } from "@/lib/motion";
import { pieceImage } from "@/lib/pieces";
import { enquiryStatusLabels, enquiryTypeLabels, type Enquiry, type EnquiryStatus } from "@/store/enquiries";
import { useEnquiries, useProducts, useToast } from "@/store";
import { WhatsAppIcon } from "../ui/Icons";
import { AdminEmpty, AdminPageHeader, FilterTabs, Pill, SearchBox } from "./AdminUI";

type Tab = "all" | EnquiryStatus;
const STATUSES: EnquiryStatus[] = ["new", "replied", "closed"];

export default function EnquiriesManager() {
  const hydrated = useHydrated();
  const enquiries = useEnquiries((s) => s.enquiries);
  const saveStatus = useEnquiries((s) => s.setStatus);
  const show = useToast((s) => s.show);
  // Every change is confirmed, so the owner knows it was saved.
  const setStatus = (id: string, status: EnquiryStatus) => {
    saveStatus(id, status);
    show({ title: `Marked as ${enquiryStatusLabels[status].toLowerCase()}`, body: "Saved." });
  };
  const products = useProducts((s) => s.products);
  const [tab, setTab] = useState<Tab>("new");
  const [q, setQ] = useState("");

  const pieceNames = (e: Enquiry) =>
    (e.productSlugs ?? (e.productSlug ? [e.productSlug] : [])).map((s) => products.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  const list = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return enquiries
      .filter((e) => tab === "all" || e.status === tab)
      .filter((e) => {
        const hay = `${e.name ?? ""} ${e.phone ?? ""} ${e.subject ?? ""} ${e.message ?? ""} ${pieceNames(e).map((p) => `${p.name} ${p.code}`).join(" ")}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enquiries, tab, q, products]);

  if (!hydrated) return <div className="skeleton h-96 w-full" aria-label="Loading enquiries" />;

  const count = (s: EnquiryStatus) => enquiries.filter((e) => e.status === s).length;

  return (
    <div>
      <AdminPageHeader
        title="Enquiries"
        intro="Every WhatsApp enquiry and message sent from the site. Reply, then mark it replied or closed so nothing is missed."
      />

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs<Tab>
          label="Enquiry status"
          value={tab}
          onChange={setTab}
          options={[
            { value: "new", label: "New", count: count("new") },
            { value: "replied", label: "Replied", count: count("replied") },
            { value: "closed", label: "Closed", count: count("closed") },
            { value: "all", label: "All", count: enquiries.length },
          ]}
        />
        <div className="lg:w-96">
          <SearchBox value={q} onChange={setQ} placeholder="Search name, phone or piece" label="Search enquiries" />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-6">
          <AdminEmpty
            title={tab === "new" && !q ? "No new enquiries" : "Nothing matches"}
            body={tab === "new" && !q ? "Everything has been answered. New WhatsApp enquiries from the site will appear here." : "Try another search or status."}
          />
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {list.map((e) => {
            const pieces = pieceNames(e);
            const reply = waTo(e.phone, enquiryReplyMessage(e, pieces.map((p) => p.name)));
            return (
              <li key={e.id} className="border border-line bg-white p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-stone">
                      {e.status === "new" ? <Pill tone="alert">New</Pill> : <Pill>{enquiryStatusLabels[e.status]}</Pill>}
                      <span>{stamp(e.createdAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{e.channel === "whatsapp" ? "WhatsApp" : "Contact form"}</span>
                      <span aria-hidden="true">·</span>
                      <span>{enquiryTypeLabels[e.type]}</span>
                    </div>
                    <p className="mt-3 text-lg text-ink">
                      {e.name ?? "A visitor on WhatsApp"}
                      {e.phone ? <span className="ml-3 text-base text-stone figures">{e.phone}</span> : null}
                    </p>
                    {e.subject ? <p className="mt-1 text-base text-ink-soft">{e.subject}</p> : null}
                    {e.message ? <p className="mt-2 max-w-prose text-base text-ink-soft">&ldquo;{e.message}&rdquo;</p> : null}
                    {pieces.length ? (
                      <ul className="mt-4 flex flex-wrap gap-3">
                        {pieces.map((p) => (
                          <li key={p.slug}>
                            <Link href={productPath(p)} target="_blank" className="flex items-center gap-3 border border-line pr-3 hover:border-ink">
                              <span className="relative block size-12 overflow-hidden bg-ivory">
                                <Image src={pieceImage(p).src} alt="" fill sizes="48px" className="object-cover" />
                              </span>
                              <span className="text-sm">
                                <span className="block text-ink">{p.name}</span>
                                <span className="block text-stone">{p.code}</span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : e.type === "general" ? (
                      <p className="mt-2 text-sm text-stone">General WhatsApp message from the site{e.pageUrl ? `, on ${new URL(e.pageUrl).pathname}` : ""}.</p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col gap-3 md:w-64">
                    {reply ? (
                      <a
                        href={reply}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => e.status === "new" && setStatus(e.id, "replied")}
                        className="flex h-12 items-center justify-center gap-2 bg-ink px-4 text-base text-white hover:bg-gold-deep"
                      >
                        <WhatsAppIcon className="size-4" />
                        Reply on WhatsApp
                      </a>
                    ) : (
                      <p className="text-sm text-stone">
                        The visitor wrote to you directly. Reply from your WhatsApp chats; their number is there.
                      </p>
                    )}
                    <label className="flex flex-col gap-1 text-sm text-stone">
                      Status
                      <select
                        value={e.status}
                        onChange={(ev) => setStatus(e.id, ev.target.value as EnquiryStatus)}
                        className="h-12 border border-line-strong bg-white px-3 text-base text-ink"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {enquiryStatusLabels[s]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
