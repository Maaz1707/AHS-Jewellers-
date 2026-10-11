# Design audit

Design-director review of the finished prototype, written before any refinement. Screenshots of every page type at 375px
and 1440px are in `design-review/before/`. Each finding is tagged with the step of the brief that fixes it. Status was filled in after the
refinement; after-screenshots are in `design-review/after/`.

Legend: **S2** consistency · **S3** typography · **S4** imagery · **S5** motion · **S6** UX · **S7** copy

## Sitewide

| # | Finding | Step | Status |
| --- | --- | --- | --- |
| G1 | Page openings use six different layouts (full-bleed film, split text/image, title + full-width image below, title + data table, title + form, bare title) and four different headline sizes (`text-5xl` to `text-7xl`). | S2 | Fixed. Three patterns: immersive (`ImmersiveHero`, home, collections), split (`PageHero` and the scheme, digital gold, gold rate and booking pages), header (bag, checkout, account, try-on, orders, text pages). Three headline sizes: `display-hero`, `display-page`, `display-section`. |
| G2 | Section headings are hand-built in many places: label-to-heading gap varies (`mt-4`, `mt-6`), intros sit below on some sections and far right on others, and some sections have no label at all. | S2 | Fixed. Every section label has the gold hairline; label to heading is always `mt-6`, heading to intro `mt-6`; intros use `lede`. |
| G3 | Section padding varies with no reason: `py-20 md:py-32`, `py-20 md:py-28`, `pb-16 md:pb-24`, `pb-20 md:pb-32` sit next to each other. | S2 | Fixed. `hero-y`, `section-y`, `band-y` and `page-y` utilities replace every hand-set padding. |
| G4 | Headlines break badly at phone width: "Eleven / months. / The twelfth is / ours.", "Gold by the / gram,", "Try it on, at / home", "Gold, made / to be handed / down.", "Three / generations…". `text-5xl` (64px) on a 335px column is too large for long headlines. | S3 | Fixed. Balanced wrapping on all headings, pretty wrapping on paragraphs, one size step smaller on phones. |
| G5 | Captions, hints, codes and notes are 12px (`text-xs`) and uppercase labels 11px on phones: below the 14px minimum for reading text. | S3 | Fixed. On phones `text-xs` is 14px; tracked capitals are 12px (see report). |
| G6 | Straight apostrophes and quotes throughout ("today's", "Owner's"), not typographic ones. | S3 | Fixed. Typographic apostrophes in all copy. |
| G7 | Serif prices use old-style, proportional figures in some places and lining figures in others, so columns of prices do not align. | S3 | Fixed. Lining figures sitewide; `figures` (lining + tabular) on prices, rates and weights. |
| G8 | Photography reads as several stock libraries: red and green festive clutter, black backgrounds, purple bokeh, rust velvet, beige studio. No common tone. | S4 | Fixed. One photographic grade on every image; six off-tone photographs replaced. |
| G9 | Images load into a blank white box with no tone placeholder. | S4 | Fixed. Every image sits on a warm tone while it loads. |
| G10 | Easing and duration vary: GSAP uses `expo.out`, `expo.inOut`, `power3`, `power4`; CSS transitions use 300, 500, 700 and 1000ms almost at random. | S5 | Fixed. `MOTION` scale in `lib/gsap.ts` and one CSS curve with four durations. |
| G11 | The hero scroll cue animates forever; the review carousel advances on its own. Both pull the eye while reading. | S5 | Fixed. Scroll cue plays three times; reviews advance for one round, then wait. |
| G12 | Small icon buttons (wishlist hearts, drawer and modal close, bag quantity steppers) are 32–40px, under the 44px touch minimum. | S6 | Fixed. `hit-area` gives icon buttons a larger target; steppers and bag actions are 48px. |
| G13 | "Demo" is labelled five different ways in two styles: "Demo mode" (filled badge), "Demo", "Demo checkout", "Demo checkout, no payment taken", "Demo order", "Demo, nothing charged", "Demo, no real gold". | S7 | Fixed. One small “Demo” tag everywhere. |
| G14 | The footer repeats the home hero line word for word ("Gold, made to be handed down."), so it appears twice on the home page and once on every other page. | S7 | Fixed. Footer now reads “Weighed in front of you, since 1987.” |

## Home

| # | Finding | Step | Status |
| --- | --- | --- | --- |
| H1 | Hero subtitle leaves "hallmarked." alone on the last line at 1440. | S3 | Fixed (balanced wrapping). |
| H2 | Featured pieces mix three card shapes (portrait, tall, square) and a staggered offset, so prices and names never line up; on phones the offset leaves large holes. | S4 | Fixed. One card shape; desktop keeps a gentle offset, phones do not. |
| H3 | Product meta row ends in a dangling "\|" separator when the price wraps on phones. | S3 | Fixed. Price drops to its own line below desktop; no separator. |
| H4 | Phone cards carry two overlapping round buttons (wishlist and WhatsApp) on a 160px image. | S6 | Fixed. Phone cards keep only the wishlist heart. |
| H5 | Visit section: the map panel is an empty beige box until clicked. | S4 | Not changed: it is the live map loading (skeleton, then map). See report. |
| H6 | Savings teaser chips wrap three-and-one on phones; calculator labels ("You pay, 11 months") wrap. | S3 | Fixed. Chips sit on an even four-column grid. |
| H7 | Showroom: the bridal-salon photo is a saturated red interior that looks like a different building from the ground-floor photo. | S4 | Fixed. Bridal salon now shows the ivory staircase. |

## Collection and category

| # | Finding | Step | Status |
| --- | --- | --- | --- |
| C1 | Bridal grid: red wrapping and gift box (Shagun Kada), dark green and red tray (Vivaah Haar Set) break the calm of the grid. | S4 | Fixed. Shagun Kada and Vivaah Haar Set re-photographed with clean backgrounds. |
| C2 | Gold Classics: Nakshi Bangles and Meena Kangan use the same photograph; four pieces sit on near-black. | S4 | Fixed. Meena Kangan has its own photograph. |
| C3 | Diamond: the halo ring is shot on purple bokeh and looks like clip-art stock. | S4 | Fixed. Halo ring and halo pendant on light backgrounds. |

## Product

| # | Finding | Step | Status |
| --- | --- | --- | --- |
| P1 | Five stacked actions: one filled button, then three outlined boxes and two half-width boxes. Visually all five shout. | S2 | Fixed. One filled, one outlined, then quiet text actions. |
| P2 | "Approximate total" wraps to two lines on phones. | S3 | Fixed. Label shortened to “Total today”. |
| P3 | Price breakdown sub-labels at 12px. | S3 | Fixed (14px on phones). |

## Our story

| # | Finding | Step | Status |
| --- | --- | --- | --- |
| O1 | Opening layout (title, offset intro, full-width image) is a pattern used nowhere else. | S2 | Fixed. Uses the immersive opening. |
| O2 | The drop cap squeezes the first lines into a narrow column on phones. | S3 | Fixed. Drop cap from tablet up only. |
| O3 | Opening photo (palace through a red arch with a flag) reads as a tourist stock shot. | S4 | Fixed. Opens on the workshop at the bench. |

## Craft

| # | Finding | Step | Status |
| --- | --- | --- | --- |
| K1 | Hero poster and film open on saturated red-and-yellow molten metal: the loudest image on the site. | S4 | Fixed. Craft opens on the setting film. |

## Gold rate

| # | Finding | Step | Status |
| --- | --- | --- | --- |
| R1 | Headline "Today's gold / rate" breaks before the last word on phones. | S3 | Fixed. |
| R2 | Gold step numerals were pale gold on ivory (fixed for contrast in Phase 4; check consistency with other numbered lists). | S2 | Checked: consistent with the other numbered lists. |

## Savings scheme

| # | Finding | Step | Status |
| --- | --- | --- | --- |
| SS1 | `text-7xl` headline, four lines on phones, ends on "ours." alone. | S3 | Fixed. `display-page`, two lines on phones. |
| SS2 | Amount chips wrap unevenly; the stats band mixes "₹2,000 / 11 / 1 month / Month 12" in four different units with uneven baselines. | S3 | Chips fixed; the stats band is unchanged (see report). |

## Book a visit

| # | Finding | Step | Status |
| --- | --- | --- | --- |
| B1 | "A private / visit, / with tea": three lines for three words on phones. | S3 | Fixed. |
| B2 | Form hints at 12px. | S3 | Fixed (14px on phones). |

## Digital gold

| # | Finding | Step | Status |
| --- | --- | --- | --- |
| D1 | Headline set in `text-7xl`, larger than any other split hero. | S2 | Fixed. |
| D2 | Coin photograph looks like chocolate coins; reused in the Gold mega menu. | S4 | Fixed. New coin photograph; Gold menu shows the minted bar. |
| D3 | Quick-amount chips wrap three-and-one on phones. | S3 | Fixed. |
| D4 | Section headings built by hand rather than with the shared heading. | S2 | Fixed. |

## Virtual try-on

| # | Finding | Step | Status |
| --- | --- | --- | --- |
| T1 | Headline breaks between "at" and "home" on phones. | S3 | Fixed. |
| T2 | Page ends on the piece panel with no route onward. | S6 | Fixed. Closing band leads to a booked visit. |

## Bag and checkout

| # | Finding | Step | Status |
| --- | --- | --- | --- |
| BC1 | Demo labels: "Demo checkout" on the bag, a second long label wrapping under the eyebrow on checkout. | S7 | Fixed. |
| BC2 | "Remove" and "Move to wishlist" are 12px text with no touch padding. | S6 | Fixed. 48px tall. |
| BC3 | Drawer quantity buttons 32px. | S6 | Fixed. 40px with an enlarged hit area in the drawer, 48px on the bag page; a sticky checkout bar on phones. |

## Account

| # | Finding | Step | Status |
| --- | --- | --- | --- |
| A1 | "Demo mode" filled badge differs from the "Demo" tag used elsewhere. | S7 | Fixed. |
| A2 | Payment history table is cut off on phones (Amount column off-screen). | S6 | Fixed. Method column hidden on phones; table fits. |
| A3 | "Sign out" floats under the greeting on phones with no relation to the tabs. | S2 | Fixed. Sign out sits with “Signed in as”; header follows the page pattern. |

## Owner's panel

| # | Finding | Step | Status |
| --- | --- | --- | --- |
| AD1 | Sidebar "Demo mode, sample data" label is a third demo style. | S7 | Fixed. |
| AD2 | Two-line nav item ("Scheme members") wraps in the sidebar. | S2 | Fixed. Labels truncate instead of wrapping. |
| AD3 | Stat-card values are coloured red for "alert" even when the number is good news (for example 3 new enquiries). | S2 | Fixed. Gold for counts that need action, red only for overdue. |

## Menus

| # | Finding | Step | Status |
| --- | --- | --- | --- |
| M1 | Gold mega menu: three links in a two-column grid leave an empty quarter; feature image is the chocolate-coin shot. | S5 | Fixed. Short menus use one column; feature image is the minted bar. |
| M2 | Collections mega menu feature image is the most saturated portrait on the site. | S4 | Fixed. Ivory lehenga portrait. |
| M3 | Mobile menu: the quick links below the main list are cut off by the sticky footer at 812px height. | S6 | Fixed. The list scrolls; quick links are 48px tall. |
