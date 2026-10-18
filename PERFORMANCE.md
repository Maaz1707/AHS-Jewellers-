# Phase 1: Performance and Accessibility

This is improvement Phase 1, not the original project setup phase.

## Budgets

- Mobile Lighthouse performance: minimum 85, target 90 or above.
- Largest Contentful Paint: below 2.5 seconds.
- Total Blocking Time: below 200 milliseconds.
- Cumulative Layout Shift: below 0.1.
- No inaccessible names, missing image alternatives or concealed reduced-motion content.
- Treat budgets as release gates, not as achieved results.

## Motion Tiers

1. Essential: focus, validation, selected states and navigation must work without animation.
2. Entry: reveal once within one second. First-screen text is visible in server HTML. SplitText measurement and image animation setup wait until near the viewport.
3. Decorative: autoplay, image drift and marquee movement pause off screen and in background tabs. Keep explicit pause controls and keyboard-focus pauses. Reduced motion disables automatic movement.

Touch devices use native scrolling. Desktop Lenis retains normal wheel distance. Product zoom remains explicitly controlled, never hover-triggered.

## Media Rules

- Reserve image dimensions and preserve the existing poster/loading tones.
- Do not preload both responsive gallery variants. Use matching responsive image sizes so the browser can reuse its request.
- Load only active craft footage. Pause videos outside the viewport or in hidden tabs.
- Save-Data and slow connections keep posters until the visitor explicitly plays a film.
- Avoid animated blur on large photographs.

## Measurement

Run against the production server, with no competing browser crawl or build. Record the browser, Lighthouse version and throttling profile. Repeat three times and report the median before claiming a performance gain.

The initial post-change mobile home run reported performance 44, accessibility 100, best practices 100 and SEO 100; LCP 5.0 seconds, TBT 2,500 ms and CLS 0. A crawl overlapped part of that run, so it is diagnostic only, not an accepted benchmark. An earlier attempt lost its Chrome connection.

The performance gate is still open. Further startup profiling and a clean repeat measurement are required. Do not describe Phase 1 as fully signed off on these numbers.

## Final Verification, 16 October 2026

- Production build: passed, 95 generated pages. Lint and TypeScript: passed.
- Crawl: 240 page/viewport combinations at 375, 768, 1024 and 1440 px; 89 internal links, none broken. Intentional 404 tests produced expected console responses.
- The crawl found tablet contact overflow and one mobile-home navigation timeout. Contact wrapping was corrected; isolated final-build retests of home at 375 px and contact at 768 px returned HTTP 200, one H1 and zero horizontal overflow.
- Reduced-motion smoke checks covered home, story, digital gold, collection and product. The only hidden home image was the inactive showroom-floor image, exposed by its selector, not missing content.
- Final isolated Lighthouse mobile home run (Lighthouse 12.8, installed Chrome, default simulated mobile throttling): performance 45, accessibility 100, best practices 100, SEO 100. LCP 7.1 seconds, TBT 670 ms, CLS 0. This is a single run, not a three-run median.
- Remaining: profile the largest-contentful-paint delay and startup work; repeat measurements before accepting the performance budget. A full manual keyboard/form-state audit is not yet complete.
