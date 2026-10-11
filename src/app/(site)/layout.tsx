import SiteChrome from "@/components/layout/SiteChrome";
import StoreJsonLd from "@/components/seo/StoreJsonLd";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SiteChrome>
      <StoreJsonLd />
      {children}
    </SiteChrome>
  );
}
