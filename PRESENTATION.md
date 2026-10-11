# Presenting the AHS Jewellers prototype

## Before the meeting (5 minutes)

1. Open the site in Chrome on the laptop you will present from, and the same URL on a phone.
2. Go to **Owner's panel** (footer link, or `/admin`) → **Enter demo admin** → **Demo and settings** → **Reset demo
   data**. Everything returns to the starting sample, dated around today.
3. Open a second tab on the home page. Rate changes made in the owner's panel appear there without a refresh, which makes
   a good moment in the demo.
4. On the phone, try the camera once in **Virtual try-on** so the browser has already asked for permission.

## A 10-minute walkthrough

| Time | Where | What to show |
| --- | --- | --- |
| 0:00 | Home | The film, the morning rate under the hero, featured pieces, the craft story. Scroll slowly; the motion is the point. |
| 1:00 | Collections → Bridal | Filters (category, purity, weight, *Available online*) and how the grid rearranges. Open the **Polki Rani Haar**. |
| 2:00 | Product page | Live price breakdown (gold, making, stones, GST), *Enquire on WhatsApp*, *Try it on*, *Book a visit to see it*. |
| 3:00 | Virtual try-on | Turn on the camera, switch earrings and necklaces, take a photo and show the share and save options. If the camera is not available, *Use our model instead* shows the same thing on a model. |
| 4:30 | Gold coin, 5 g → bag → checkout | An online piece: add to bag, see the price breakdown, PIN code check (try 302001 for Jaipur, 400011 for Mumbai), insured delivery or showroom pickup, demo payment, order confirmation. Open **Track this order**. |
| 6:00 | Digital gold | Buy ₹1,000 in rupees or grams with **Use the sample member**, then **See my gold wallet**: balance, value chart, history, *Redeem as jewellery*. |
| 7:00 | Savings scheme and member area | The calculator, then **My account → Use sample member**: scheme tracker, demo instalment payment, orders and the gold wallet in one place. |
| 8:00 | Owner's panel | Dashboard; change today's rate and switch to the shop tab to see prices move; mark the new order as packed and show the customer's tracking page update; enquiries with *Reply on WhatsApp*; Reports. |
| 9:30 | Phone | Add to home screen (or `?app=1`) to show the app with its bottom tab bar. |

## What is real and what is a demonstration

**Fully working in the prototype** (on sample data, saved in the browser):

- Every page, navigation, search, filters, wishlist and sharing; responsive from phone to desktop.
- Live pricing from the gold rate everywhere, and rate changes from the owner's panel reaching the whole site at once.
- WhatsApp enquiries with the piece and its link filled in, recorded for the owner's panel.
- Visit booking with calendar invite, the savings scheme calculator and enrolment, old gold estimate, PIN code check.
- Owner's panel: rates, pieces (add, edit, hide, delete), orders, enquiries, visits and calendar, scheme members,
  digital gold, customers, reports, reset.
- Virtual try-on with live face tracking, photo capture, share and download, and the model-photo fallback.
- Installable app with offline page, SEO (titles, descriptions, sitemap, Open Graph image, jeweller structured data).

**Demonstrations, labelled "Demo" on screen:**

- Sign-in for members and the owner (any number, any four-digit code; no password for the owner's panel).
- All payments: scheme instalments, checkout and digital gold. Method choices only; no card, bank or UPI details are
  asked for and nothing is charged.
- Digital gold: no gold is bought and no vault partner is connected.
- Orders, couriers and tracking references; delivery dates from a sample PIN code table.
- Reports: every figure is sample data.
- Data is per browser. Nothing is shared between devices until a backend is built.

## Replace before going live

| What | Where | Notes |
| --- | --- | --- |
| Photographs | `src/data/media.ts` | All are Pexels stock. Replace with the shop's own photography of its pieces, showroom and family. |
| Videos | `src/data/media.ts` | Pexels stock streamed through `/media/video`. Replace with the shop's own films on proper video hosting. |
| Try-on artwork and model | `public/tryon`, `src/data/tryon.ts` | Drawn stand-ins. Replace with cut-out photographs (transparent PNG) of the real pieces; re-measure points if the model photo changes. |
| Gold rate source | `src/data/rates.ts`, owner's panel | Rates are typed in by hand on sample data; the 30-day and longer history is generated. Decide whether to keep manual entry or connect a rate feed. |
| Reviews | `src/data/reviews.ts` | Written as samples. Replace with real, attributable reviews (for example from Google). |
| Address, phone, WhatsApp number, email, hours, map position | `src/data/site.ts` | The WhatsApp number receives every enquiry; it must be the shop's real number. Opening hours are also mirrored in `src/lib/booking.ts` and `src/components/seo/StoreJsonLd.tsx`. |
| Founding year, family story, timeline, values | `src/data/site.ts` (`story`) | Sample family history. |
| Hallmark details | `src/data/site.ts` (`hallmark`) | Confirm the wording and the shop's BIS registration details. |
| Savings scheme terms | `src/data/site.ts` (`schemeTerms`), scheme FAQs | Instalments, bonus, minimum, grace days and redemption window are samples, as is the FAQ wording (including members' making-charge benefit and late payments). |
| Online shop terms | `src/data/site.ts` (`commerceTerms`), `/terms` | Delivery charge, free-delivery threshold, order limit, pickup hold time, and the 7-day return wording. |
| Exchange and buyback terms | `src/data/site.ts` (`exchangeTerms`) | Percentages shown on `/exchange`, the FAQ and product pages. |
| Digital gold terms and partner | `src/data/site.ts` (`digitalGoldTerms`), `/digital-gold` | Name the licensed vault partner and publish its licence details. |
| Pieces available online | `online: true` in `src/data/products.ts` | Currently coins and eleven lighter pieces. |
| Catalogue | `src/data/products.ts` | Sample pieces, weights, making charges and stone values. |
| Privacy notice and terms | `/privacy`, `/terms` | Sample text; must be prepared with a lawyer. |
| Domain | `site.url` in `src/data/site.ts` | Used by the sitemap, Open Graph and structured data. |
| Social links | `site.social` | Currently point to the platforms' home pages. |

## Needed for a real launch (beyond content)

A backend and database (rates, catalogue, orders, enquiries, bookings, members), real sign-in for customers and staff,
a payment gateway, a courier integration with live PIN code serviceability, the digital gold partner's API, and
analytics. The front end is built so each of these replaces a store in `src/store` without changing the pages.
