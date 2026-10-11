import Hero from "@/components/home/Hero";
import CollectionsShowcase from "@/components/home/CollectionsShowcase";
import Statement from "@/components/home/Statement";
import CraftStory from "@/components/home/CraftStory";
import FeaturedPieces from "@/components/home/FeaturedPieces";
import Spotlight from "@/components/home/Spotlight";
import BridalCampaign from "@/components/home/BridalCampaign";
import Reviews from "@/components/home/Reviews";
import FloorsToggle from "@/components/home/FloorsToggle";
import PlanAndVisit from "@/components/home/PlanAndVisit";

/**
 * Home. Each section holds about one screen and delivers its content by
 * playing by itself or by tap, hover and drag, never by scroll. Only the
 * spotlight pins, on desktop, for half a screen.
 * Neighbours differ in layout: film with rate board, list and image, a single
 * sentence, film with tabs, carousel, pinned stage, film and marquee, portrait
 * and quote, lift panel, two columns.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <CollectionsShowcase />
      <Statement />
      <CraftStory />
      <FeaturedPieces />
      <Spotlight />
      <BridalCampaign />
      <Reviews />
      <FloorsToggle />
      <PlanAndVisit />
    </>
  );
}
