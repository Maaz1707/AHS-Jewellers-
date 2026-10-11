# AHS Jewellers: website prototype

A presentation-ready prototype for AHS Jewellers, a gold and jewellery showroom in Jaipur. It covers the public website, a
member area, an owner's panel, an installable app, online buying of coins and lighter pieces, digital gold and a virtual
try-on.

Everything runs in the browser on sample data (Zustand stores saved to `localStorage`). There is no backend, no real
sign-in and no real payment. See `PRESENTATION.md` for the walkthrough and the list of content to replace.

## Run it locally

You need Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. To try the production build:

```bash
npm run build
npm run start
```

Other commands:

| Command | What it does |
| --- | --- |
| `npm run lint` | ESLint across the project |
| `npm run verify:media` | Checks every photo and video URL in `src/data/media.ts` still loads |
| `python scripts/tryon-art.py && node scripts/tryon-art.mjs` | Redraws the try-on artwork into `public/tryon` |

`npm run dev` and `npm run build` first copy the MediaPipe runtime from `node_modules` into `public/mediapipe/wasm`
(`scripts/copy-mediapipe.mjs`), so the virtual try-on loads it from this site rather than a CDN. The face model itself is
committed at `public/mediapipe/face_landmarker.task`.

The camera only works on `localhost` or over HTTPS. To test the try-on on a phone, use the deployed site.

## Deploy to Vercel

1. Push the project to a GitHub, GitLab or Bitbucket repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Leave the defaults: framework **Next.js**, build command `npm run build`, output handled by Vercel. No environment
   variables are needed.
4. Deploy. Every later push to the main branch redeploys; other branches get preview URLs.
5. Under **Settings → Domains**, add the client's domain, then set `site.url` in `src/data/site.ts` to match so the
   sitemap, Open Graph tags and structured data use it.

Notes for the deployed prototype:

- Data is kept per browser. The presenter's laptop and the client's phone each hold their own copy, and changes made in
  the owner's panel show only in that browser. Use **Owner's panel → Demo and settings → Reset demo data** before
  presenting.
- Stock photographs are resized by Vercel's image optimiser (`/_next/image`). Stock videos stream through the
  `/media/video` route. Both are within a hobby plan's limits for a presentation; real photography and video hosting
  should replace them before launch.
- The service worker (`public/sw.js`) registers only in production. If an old version seems stuck after a deploy, bump
  `VERSION` in that file.

## Where things live

- Business details, scheme, shop, exchange and digital gold terms: `src/data/site.ts`
- Every photo and video URL: `src/data/media.ts`
- Catalogue: `src/data/products.ts` (pieces marked `online: true` can be bought on the site)
- Demo customers, orders and transactions: `src/data/demo.ts`; Reports sample figures: `src/data/reports.ts`
- Try-on pieces and the measured model photo: `src/data/tryon.ts`
- Design tokens: `src/app/globals.css`; project rules and implementation notes: `CLAUDE.md`
