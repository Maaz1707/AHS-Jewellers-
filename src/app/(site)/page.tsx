import Hero from "@/components/home/Hero";
import RateSlate from "@/components/home/RateSlate";
import CollectionsShowcase from "@/components/home/CollectionsShowcase";
import Statement from "@/components/home/Statement";
import CraftStory from "@/components/home/CraftStory";
import FeaturedPieces from "@/components/home/FeaturedPieces";
import Spotlight from "@/components/home/Spotlight";
import BridalCampaign from "@/components/home/BridalCampaign";
import Reviews from "@/components/home/Reviews";
import Showroom from "@/components/home/Showroom";
import SchemeTeaser from "@/components/home/SchemeTeaser";
import VisitCTA from "@/components/home/VisitCTA";

/**
 * Home. No two neighbouring sections share a layout: film, slate, sideways
 * gallery, type-only statement, pinned split, grid, pinned spotlight, film and
 * lookbook, editorial quotes, overlapping images, split calculator, map.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <RateSlate />
      <CollectionsShowcase />
      <Statement />
      <CraftStory />
      <FeaturedPieces />
      <Spotlight />
      <BridalCampaign />
      <Reviews />
      <Showroom />
      <SchemeTeaser />
      <VisitCTA />
    </>
  );
}
