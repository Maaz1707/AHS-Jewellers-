import type { Metadata } from "next";
import TextPage from "@/components/sections/TextPage";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${site.name} handles the details you share with us.`,
};

export default function PrivacyPage() {
  return (
    <TextPage
      eyebrow="Privacy"
      title="Your privacy"
      updated="Sample notice for the prototype"
      intro={
        <p>
          This is sample text written for the presentation. The final notice must be prepared with {site.name}’s legal
          adviser under India’s Digital Personal Data Protection Act before the site goes live.
        </p>
      }
      sections={[
        {
          title: "What we collect",
          body: (
            <>
              <p>Only what you give us: your name, mobile number and, if you choose, your email address and delivery address.</p>
              <p>When you book a visit or place an order, we also keep the details of that visit or order.</p>
            </>
          ),
        },
        {
          title: "Why we collect it",
          body: <p>To confirm visits, deliver orders, run your savings scheme, answer your questions and, if you ask us to, send our letter a few times a year.</p>,
        },
        {
          title: "Your camera",
          body: (
            <p>
              The virtual try-on uses your camera only on your device. Nothing from the camera is recorded, stored or sent to us.
              A photo exists only if you take one, and stays on your device unless you share it.
            </p>
          ),
        },
        {
          title: "Who sees it",
          body: (
            <p>
              Our own team, and the partners needed to serve you: the insured courier for deliveries, the payment provider for
              payments and the licensed vault partner for digital gold. We never sell your details.
            </p>
          ),
        },
        {
          title: "How long we keep it",
          body: <p>For as long as you are a customer, and afterwards only as long as tax and hallmarking rules require.</p>,
        },
        {
          title: "Your choices",
          body: (
            <p>
              Ask us at {site.email} or on {site.phone.display} to see, correct or delete what we hold about you, or to stop
              messages from us.
            </p>
          ),
        },
      ]}
    />
  );
}
