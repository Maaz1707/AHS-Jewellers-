import Hero from "@/components/home/Hero";
import RateStrip from "@/components/home/RateStrip";
import CollectionsShowcase from "@/components/home/CollectionsShowcase";
import FeaturedPieces from "@/components/home/FeaturedPieces";
import CraftStory from "@/components/home/CraftStory";
import Showroom from "@/components/home/Showroom";
import SchemeTeaser from "@/components/home/SchemeTeaser";
import Reviews from "@/components/home/Reviews";
import VisitCTA from "@/components/home/VisitCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <RateStrip />
      <CollectionsShowcase />
      <FeaturedPieces />
      <CraftStory />
      <Showroom />
      <SchemeTeaser />
      <Reviews />
      <VisitCTA />
    </>
  );
}
