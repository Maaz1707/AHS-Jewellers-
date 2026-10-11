# AHS Jewellers — Project Rules

Presentation-ready prototype website for AHS Jewellers, a premium gold and jewellery showroom in India, housed in its own two-storey showroom building. The site must look and feel like a ₹10–20 lakh build. Work as a senior UI/UX designer and front-end engineer with 20+ years of luxury retail experience. Every detail, spacing value and line of copy matters.

The project is built in 4 phases. Do only the phase you are asked to do, then stop and report.

## STACK
- Next.js (latest stable, App Router), TypeScript, Tailwind CSS.
- GSAP with ScrollTrigger and SplitText for animation. Lenis for smooth scrolling, synced with ScrollTrigger.
- Zustand with localStorage persistence for all shared data (rates, products, enquiries, bookings, scheme members, cart). No real backend. Seed data lives in /src/data.
- next/image for all images. next/font for fonts.

## DESIGN
- White background throughout. Palette: pure white #FFFFFF, warm ivory #FAF7F2 for alternate sections, ink #1A1714 for text, a restrained antique gold accent (around #B08D57) used sparingly for lines, small labels and hover states, and soft grey hairlines. No dark sections except video overlays and the footer if it genuinely looks better.
- Typography: an elegant high-contrast serif for headings (Cormorant Garamond or similar) and a clean sans for body and UI (Inter or similar). Small uppercase letter-spaced labels above headings. Define a strict type scale and spacing scale as Tailwind tokens and never use off-scale values.
- Layout: editorial, asymmetric, image-led. Generous but purposeful whitespace. Every section must earn its place; no filler sections, no large empty bands, no generic three-icon feature rows.
- Reference feel: Cartier, Tiffany, Tanishq's Rivaah pages. Not a template, not a generic e-commerce theme.
- Fully responsive, designed phone-first. Test at 375px, 768px, 1024px, 1440px.

## MOTION
- Smooth scroll sitewide. Scroll-triggered reveals: masked image reveals, line-by-line heading reveals with SplitText, subtle parallax on images, pinned sections where they add drama.
- Hover states on every interactive element: image zoom inside a fixed frame, underline draw on links, magnetic or fill effect on primary buttons.
- Page transitions between routes (a short, elegant fade or curtain).
- Motion must be smooth at 60fps, never block reading, and fully respect prefers-reduced-motion. Clean up all GSAP contexts on unmount.

## MEDIA
- Use royalty-free stock photos and videos (Pexels, Unsplash) of gold jewellery, bridal jewellery, diamonds, goldsmith craft, molten gold, and elegant showroom interiors. Indian jewellery styles wherever possible.
- Keep every media URL in one file, /src/data/media.ts, with a short description of each, so real photos can be swapped in later. Configure next.config remote image domains.
- Verify every image and video URL actually loads. If one cannot be verified, use a tasteful placeholder and list it in your final report. Videos: muted, looped, playsInline, with a poster image, lazy-loaded when off screen.

## CONTENT
- Brand: AHS Jewellers. All business details (address, phone, WhatsApp number, founding year, hallmark details, reviews) are SAMPLE content. Keep them in /src/data/site.ts so they are replaced in one place. Do not invent awards or certifications.
- Copy: short, confident, warm, written like a luxury house. Indian English. No lorem ipsum, no filler, no exclamation marks, no clichés like "timeless elegance redefined".
- Prices in rupees with Indian number formatting (₹1,24,500). Weights in grams. Purity as 24K / 22K / 18K.

## QUALITY BAR
- No dead links, no empty pages, no console errors. Every form has validation and a designed success state. Every page has designed loading and empty states.
- Keyboard accessible, visible focus states, semantic HTML, alt text, good colour contrast.
- Run the production build and fix all errors and warnings before reporting.

## IMPLEMENTATION NOTES (kept current by each phase)
- Design tokens (colours, type scale, spacing scale, easing) live in `src/app/globals.css` under `@theme` (Tailwind v4). Default Tailwind spacing/type scales are reset; use only the tokens defined there.
- Motion helpers: `src/lib/gsap.ts` registers plugins once; `src/components/providers/SmoothScroll.tsx` owns Lenis. Use `useGSAP` / `gsap.context` and always revert on unmount. Check `prefersReducedMotion()` before any non-essential motion.
- Stores: `src/store/*` (Zustand + persist). Seed data: `src/data/*`. All media URLs: `src/data/media.ts`. All business details: `src/data/site.ts`.
- Every route is built; the Phase 1 placeholder system has been removed. Navigation lives in `src/data/navigation.ts`. Editorial pages use `src/components/sections/PageHero.tsx`; long text pages use `TextPage.tsx`.
- Spacing scale: 0, px, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 64, 80, 96. Anything else silently generates no CSS. Viewport-relative layout sizes are named utilities in globals.css (e.g. `showcase-card`, `viewport-frame`), not arbitrary classes.
- A component that sets its own `relative`/`inline-flex` cannot be overridden by `absolute`/`hidden` from a parent className; wrap it instead.
- A grid or flex child that holds a wide input or a scrolling row needs `min-w-0`, or it overflows at 375px. `body` has `overflow-x: clip` as a safety net only.
- Persisted stores use `skipHydration` and are rehydrated in `StoreHydrator`; anything time- or storage-dependent renders a skeleton until `useHydrated()` is true.
- Page transitions: `PageTransition.tsx` intercepts internal `<a>` clicks. Add `data-transition="off"` to opt a link out.
- `npm run verify:media` re-checks every URL in media.ts. Run it after any media change.
- In development only, `window.__lenis` exposes the smooth scroller for browser tooling.

### Phase 2 additions
- Canonical routes: `/collections`, `/collections/[slug]`, `/category/[slug]`, `/jewellery/[id]` (id = product slug), `/our-story`, `/craft`, `/hallmarking`, `/gold-rate`, `/book-a-visit` (`?piece=slug` preselects a piece), `/reviews`, `/contact` (`#floors`), `/wishlist`. Phase 1 URLs redirect in `next.config.ts`.
- WhatsApp: build every message with `src/lib/enquiry.ts` (`useProductEnquiry`, `wishlistMessage`, `generalMessage`). Each click also writes to the enquiries store (`type`, `channel`, `productSlug(s)`, `pageUrl`, `status`) for the admin.
- Listings: `ProductListing` reads/writes filters in the URL via `history.replaceState` (`?category=a,b&price=1-2,2-5&purity=22K&metal=rose&stone=diamond&min=&max=&online=1&sort=price-asc`), animates with GSAP Flip, and must sit inside `<Suspense>` with `ProductListingFallback` (server-rendered grid, keeps product links in the HTML). Filter logic, price bands (lakh, from live rates via `priceFor`), stone types and sort orders live in `lib/filters.ts`; option counts are faceted (each group counted against every other active filter) and zero options are dimmed. Desktop: toolbar (hide/show filters, count, sort menu) over a sidebar of `FacetGroup`s (`collections/FilterControls.tsx`). Phones and tablets: Filter and Sort buttons, each a bottom sheet (`overlay` "filters" / "sort").
- Product images never zoom on hover. `lib/useZoom.ts`: double-click or double-tap zooms in at that point, the pointer pans, double-click again zooms out; the zoom button does the same from the centre. Used by `ProductGallery` (controls top-right, because the sticky frame can run below the fold) and the full-screen `Lightbox`.
- The fixed header publishes `--header-offset` on `<html>`; sticky bars use `top: var(--header-offset)`.
- Forms: validate on submit, focus the first `[aria-invalid]` in an effect after render, keep submit disabled until `useHydrated()`, and never put `name` on personal fields (a pre-hydration native submit would leak them into the URL).
- Charts use `--color-chart` (#9a6a1e), validated with the dataviz palette script; the brand golds are too low-chroma for data marks.
- Booking time logic (IST dates, opening hours, `.ics`) lives in `src/lib/booking.ts`. Opening hours there mirror `site.hours`; change both together.
- Sample content: family story, timeline and values in `site.ts` (`story`); reviews with year in `reviews.ts`; 30-day rate history is generated by `sampleHistory()` in `rates.ts`; booking slots shown as "already booked" are a deterministic sample in `slotUnavailable()`.

### Phase 3 additions
- Route groups: public pages in `src/app/(site)` (chrome in `components/layout/SiteChrome.tsx`), owner's panel in `src/app/(admin)/admin` (`components/admin/AdminShell.tsx`). `not-found.tsx` wraps itself in `SiteChrome`.
- Demo session (`store/session.ts`): member sign-in accepts any number and four-digit code; `admin` is a flag. `resetDemoData()` in `store/index.ts` restores every store (keeps the admin signed in). Demo people and records are generated relative to today in `src/data/demo.ts`.
- Live catalogue: always read pieces through `lib/pieces.ts` (`useVisibleProducts`, `useLiveProduct`, `pieceImage`) so admin edits, hidden pieces and URL images work. Product pages render `ProductView` client-side for admin-added slugs.
- Scheme maths in `lib/scheme.ts`; terms in `site.ts` (`schemeTerms`).
- App mode: `lib/app.ts` (`useAppMode`, `?app=1` to preview) sets `html[data-app]` and `--app-bar`; use the `fab-offset` / `foot-offset` utilities for anything fixed to the bottom. Service worker `public/sw.js` (bump `VERSION` when its caching changes) registers in production only.

### Phase 4 additions
- Commerce: pieces with `online: true` (`data/products.ts`) can be bought; everything else stays enquiry-led. Price the bag only through `lib/bag.ts` (`useBag`, `isOnline`); terms in `site.ts` (`commerceTerms`). Checkout `components/checkout/Checkout.tsx`; PIN check `lib/delivery.ts`; orders store `store/orders.ts` with types, labels and flows in `lib/orders.ts` (seed data imports `lib/orders`, never the store, to avoid a circular import). Tracking `/orders` and `/orders/[id]`.
- Digital gold: `store/gold.ts`, maths and wallet series in `lib/gold.ts`, terms in `site.ts` (`digitalGoldTerms`). Never name a vault partner; say "a licensed vault partner".
- Virtual try-on: `components/tryon/TryOn.tsx`, geometry in `lib/tryon.ts` (offsets calibrated against the model photo), pieces and model landmarks in `data/tryon.ts`, artwork drawn by `scripts/tryon-art.py` + `tryon-art.mjs` into `public/tryon`. MediaPipe runs from `/mediapipe` (wasm copied by `scripts/copy-mediapipe.mjs` before dev/build; model committed). Its console diagnostics are filtered only while the try-on is mounted.
- Every demo feature carries `DemoTag` (`components/ui/Tags.tsx`); `OnlineTag` marks online pieces.
- Images: import `Image` from `@/components/ui/Img` (not `next/image`). Stock hosts go through the same-origin optimiser with an upstream size cap (`lib/images.ts`); other hosts are shown unoptimised so the optimiser is never an open proxy. Stock videos stream through `app/media/video/[id]/[file]/route.ts`; `media.ts` builds those paths.
- Charts: `components/charts/LineChart.tsx` (site and admin) and `components/admin/AdminCharts.tsx` (`BarChart` takes `unit` or `format`). Hidden data tables sit inside a `div.sr-only`, never on the table itself.
- SEO: `app/sitemap.ts`, `app/robots.ts`, `public/og.jpg`, `components/seo/StoreJsonLd.tsx` (opening hours mirrored there too), FAQ structured data on `/faq`.
- Home hero words fade with CSS (`.hero-fade`), not GSAP, so they do not wait for scripts. Hero films start after the page has loaded and are skipped on Save-Data or 2G/3G.
- Sample Reports data: `data/reports.ts`. Exchange terms: `site.ts` (`exchangeTerms`).

### Design refinement pass (see DESIGN-AUDIT.md)
- Three page openings only: immersive (`components/sections/ImmersiveHero.tsx`; home and collections build the same pattern), split (`PageHero.tsx`, or text left with a panel right), header (label + `display-page` + `lede`). Headline sizes are utilities in globals.css: `display-hero`, `display-page`, `display-section`; opening paragraphs use `lede`. Section labels always carry the gold hairline; label → heading → intro gaps are `mt-6`.
- Vertical rhythm utilities: `hero-y` (openings), `section-y` (content sections), `band-y` (short bands), `page-y` (single-section pages). Do not hand-set section padding.
- Pages that would end on content close with `components/sections/NextStep.tsx` (one primary, one alternative).
- Typography: headings wrap balanced, paragraphs pretty (base layer). Lining figures sitewide; add `figures` (lining + tabular) to prices, rates and weights. On phones `text-xs` resolves to 14px and `text-micro` to 12px. Use typographic apostrophes (’) in copy.
- Images: every `next/image` gets one grade and a warm loading tone from the base layer (`img[data-nimg]`); add `data-raw` to opt out (artwork, icons). One card shape (`aspect-portrait`) for product cards.
- Motion: GSAP durations and easing come from `MOTION` in `lib/gsap.ts`; CSS transitions default to the luxe curve at 500ms. Use 300 (colour), 500 (interface), 700 (cross-fade), 1000 (image zoom) only. Nothing loops indefinitely except loading states.
- Interaction: one filled button per screen; others outline or text. Quick choices use the `chip` utility (aria-pressed for the chosen one). Small icon buttons take `hit-area` (element must be positioned). Animated totals and rates use `components/ui/AnimatedValue.tsx`.
- Demo features carry `<DemoTag />` with no custom label.

### Design elevation pass
- Brand: the AHS monogram (interlocked Cormorant Garamond letters in a cusped Jaipur arch) is generated by `scripts/monogram.py` into `src/data/monogram.ts`, `src/app/icon.svg` and `public/brand/`; `scripts/icons.mjs` renders the app icons from it. Use `components/ui/Monogram.tsx` (logo mark, loader, footer seal, 404, intro). `Logo compact` shows the mark alone below desktop width.
- Motif: the jaali lattice (`bg-jaali`, `bg-jaali-light`, faded with `jaali-fade`) and the kundan petal (`components/ui/Motif.tsx`: `Rosette`, `OrnamentDivider`, `PetalCorner`). Sparingly: dividers, card corners, behind large numerals, the mega menu, the 404, the statement.
- Second accent: `emerald` / `emerald-deep`, one or two moments per page only (home: the statement; product: the close-up headline; 404: the monogram).
- Opening sequence: `components/home/IntroCurtain.tsx`, decided before paint by `INTRO_SCRIPT` in `lib/intro.ts` (first page of the session must be home; never with reduced motion). Immediate reveals and `.hero-fade` wait `INTRO_DELAY` while it plays.
- Home signature sections: see “Home pacing pass” below. Keep neighbouring sections in different layouts.
- Products: every fifth listing item is `components/ui/ProductFeature.tsx` (grid uses `grid-flow-row-dense`). Cards sit images on ivory with `mix-blend-multiply`. Product pages add `ProductCloseUp` (macro crops plus “how it is worn” with a ₹10-coin scale).
- Cursor: the normal system cursor everywhere (the client asked for it; there is no custom cursor). Films are paused only with their round control button.
- Never use a size or spacing number off the scale: `h-11`, `h-36` or `h-56` silently produce no CSS (an SVG or image frame then collapses to zero height).

### Home pacing pass
- Budget: home at most 9,000px tall at 1280×800 and 10,500px at 375×812 (footer included); no section taller than 1.5 screens. Only `Spotlight` pins, desktop only, `end: "+=50%"`; nothing pins below 1024px, and nothing else on the page is driven by scroll (no scrub, no scroll parallax). Scroll only triggers one-off reveals, which finish within a second (`MOTION.reveal` 0.8, `settle` 1).
- Rule: content plays by itself (time), or moves by hover, drag or tap. One-screen sections use `screen-fit` (sets its own padding; do not add `section-y`) and `screen-frame` for the large image beside text.
- Autoplay: `lib/useAutoplay.ts` (`useAutoplay(sectionRef, count, { interval })`). The `autoplay-bar` CSS animation's end advances the cycle. Everything keeps replaying: a tap, swipe or hover only holds the cycle while it lasts (hover counts only over elements marked `data-hold`, never the whole full-screen section) (also off screen and with keyboard focus), then it resumes from where the visitor left it; only the visitor's pause button stops it. Never runs with reduced motion. Still photographs on show drift continuously (`ken-burns`, alternating). Always show `PlayPause` from `components/ui/Controls.tsx` (also `Arrows`, `Dots`). `useSwap(index)` gives the previous item for swaps.
- Swaps: `wipe-in` + `wipe-light` (soft gold band), `ken-burns` on the still on show, `floor-in/out-up/down` for the floors, `rise-in` (set `--rise`) for words. All are off with reduced motion. `Sheen` (`components/ui/Sheen.tsx`) sweeps light once across a phrase; never inside `RevealText`/`SectionHeading` (SplitText breaks it).
- Rows: `useDragScroll` adds mouse drag with momentum and a settle onto the nearest item; `nearestItem` / `scrollToItem` for dots and arrows. Widths: `swipe-card`, `carousel-item`.
- Sections: `Hero` (rate board along the foot, `RollingNumber`), `CollectionsShowcase` (list + image, swipe row on phones, 4s), `Statement` (≤ half a screen), `CraftStory` → `components/sections/CraftPlayer.tsx` (also /craft via `CraftSequence`, `detailed`), `FeaturedPieces` (carousel), `Spotlight` (pin + loupe; swipe strip below 1024px), `BridalCampaign` (film + marquee lookbook), `Reviews` (6s), `FloorsToggle` (lift panel), `PlanAndVisit` (two columns; chips switch halves below 1024px, so its headings are plain, not split). /our-story’s `HeritageTimeline` is a year-tab selector on desktop.
- Lenis uses `lerp: 0.16`, `wheelMultiplier: 1`, native touch: never slower than native, never snapping. `ScrollProgress` (top hairline) sits in `SiteChrome`; `BackToTop` in the footer.
- Phones run one spacing step tighter (`section-y` 16, `band-y` 14). Cards tilt slightly on desktop (`lib/useTilt.ts`).
