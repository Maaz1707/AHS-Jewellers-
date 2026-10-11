import type { ReactNode } from "react";
import BagDrawer from "./BagDrawer";
import FloatingWhatsApp from "./FloatingWhatsApp";
import Footer from "./Footer";
import Header from "./Header";
import MobileMenu from "./MobileMenu";
import RatesModal from "./RatesModal";
import ScrollProgress from "./ScrollProgress";
import SearchOverlay from "./SearchOverlay";
import WishlistDrawer from "./WishlistDrawer";
import AppTabBar from "../app/AppTabBar";
import InstallPrompt from "../app/InstallPrompt";
import PageTransition from "../providers/PageTransition";
import SmoothScroll from "../providers/SmoothScroll";

/** Everything around a public page: header, footer, overlays and app chrome. */
export default function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <ScrollProgress />
      <Header />
      <PageTransition>
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
      </PageTransition>
      <MobileMenu />
      <SearchOverlay />
      <BagDrawer />
      <RatesModal />
      <WishlistDrawer />
      <FloatingWhatsApp />
      <InstallPrompt />
      <AppTabBar />
    </>
  );
}
