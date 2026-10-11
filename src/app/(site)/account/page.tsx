import type { Metadata } from "next";
import AccountArea from "@/components/account/AccountArea";

export const metadata: Metadata = {
  title: "My Account",
  description: "Your savings scheme, saved pieces, visits and enquiries.",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <section className="bg-white page-y">
      <div className="shell">
        <AccountArea />
      </div>
    </section>
  );
}
