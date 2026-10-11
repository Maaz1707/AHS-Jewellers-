import type { Metadata } from "next";
import ExchangeEstimator from "@/components/exchange/ExchangeEstimator";
import PageHero from "@/components/sections/PageHero";
import Accordion from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";
import { site, whatsappLink } from "@/data/site";

export const metadata: Metadata = {
  title: "Old Gold Exchange",
  description: `Bring old gold to ${site.name}. We test its purity in front of you and value it at today’s rate, to exchange for new jewellery or paid to your bank.`,
};

const STEPS = [
  { title: "Tested in front of you", body: "A non-destructive purity test at the counter, on a screen you can read. Nothing is cut, scraped or melted." },
  { title: "Weighed on a certified scale", body: "Stones, lac and wax are taken out of the weight before we value the gold." },
  { title: "Valued at today’s rate", body: "The pure gold content at the morning’s 24K rate, written down for you to keep." },
  { title: "Your choice", body: "Set it against any new piece, or have it paid to your bank the same day." },
];

const BRING = [
  "The jewellery, in any condition: broken chains, single earrings, old coins",
  "Your photo ID, as the law requires for buying gold",
  "The original bill if you have it, though it is not needed",
  "For payment to your bank: a cancelled cheque or your account details",
];

export default function ExchangePage() {
  return (
    <>
      <PageHero
        eyebrow="Old gold exchange"
        title={
          <>
            Old gold, <em className="text-gold-deep">fairly valued</em>
          </>
        }
        intro={
          <p>
            Bring old jewellery in any condition. We test it while you watch, value it at today’s rate, and set it against
            something new, whether or not you bought it here.
          </p>
        }
        image="banglesAssorted"
      >
        <Button href="#estimate" arrow data-transition="off">
          Estimate its value
        </Button>
        <TextLink href="/book-a-visit">Book a visit</TextLink>
      </PageHero>

      <section id="estimate" className="scroll-mt-32 bg-white pb-20 md:pb-32" aria-labelledby="estimate-title">
        <div className="shell">
          <div className="border border-line p-6 md:p-12">
            <p className="eyebrow flex items-center gap-4 text-gold-deep">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              Estimate
            </p>
            <h2 id="estimate-title" className="mt-6 display-section text-ink">
              What is my gold worth today?
            </h2>
            <div className="mt-10">
              <ExchangeEstimator />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory section-y" aria-labelledby="how-title">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <p className="eyebrow flex items-center gap-4 text-gold-deep">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              At the counter
            </p>
            <h2 id="how-title" className="mt-6 display-section text-ink">
              Twenty minutes, with tea
            </h2>
          </div>
          <ol className="grid gap-x-10 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t border-line-strong py-8">
                <p className="font-serif text-2xl text-gold-deep">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 font-serif text-2xl text-ink">{s.title}</h3>
                <p className="mt-2 text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white section-y" aria-labelledby="bring-title">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <h2 id="bring-title" className="display-section text-ink">
              What to bring
            </h2>
            <ul className="mt-8 flex flex-col">
              {BRING.map((b) => (
                <li key={b} className="flex gap-4 border-b border-line py-4 text-ink-soft">
                  <span aria-hidden="true" className="mt-3 size-1 shrink-0 rounded-full bg-gold" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-8">
              <Button href="/book-a-visit" arrow>
                Book a visit
              </Button>
              <TextLink href={whatsappLink(`Hello ${site.name}, I would like to exchange some old gold.`)} external>
                Ask on WhatsApp
              </TextLink>
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Accordion
              defaultOpen={0}
              items={[
                {
                  title: "Do you take gold bought elsewhere?",
                  content: "Yes. Gold bought from other jewellers is valued the same way, with a small difference in the share we pay, shown in the estimate above.",
                },
                {
                  title: "What if my gold is not hallmarked?",
                  content: "That is fine. The purity test tells us what it is, and you see the reading yourself.",
                },
                {
                  title: "How are stones handled?",
                  content: "Kundan, polki and coloured stones are taken out and their weight removed before valuing the gold. Diamonds over a certain size are valued separately.",
                },
                {
                  title: "Can I use it with my savings scheme?",
                  content: "Yes. When your scheme matures, old gold can be added to its value to choose a larger piece.",
                },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
