# Bestenouf — merged GitHub Pages website

This package combines the attached website with a 15-book catalog and the latest author biography.

## Open locally

Extract the ZIP first, then open `index.html`. The navigation uses real page links. Bestenouf opens `index.html`; Books opens `books.html`; Meet the author opens `about.html`. Each View book link opens an individual page in `books/`. The author page contains the revised biography without the three red accent borders.

## Replace the GitHub Pages website

1. Back up the current repository.
2. Copy the CONTENTS of this extracted folder to the existing GitHub Pages publishing folder. `index.html`, `books.html`, `about.html`, `CNAME`, and `assets/` must sit together at the publishing root. Do not upload the ZIP itself or place another enclosing folder in the publishing root.
3. Commit and push the changed files to the branch/folder that GitHub Pages already publishes.
4. Wait for the repository's Pages deployment to finish. Then open `/books.html` and `/about.html` on your domain and refresh the homepage.

`CNAME` still contains `bestenouf.com`. Placeholder portfolio and project pages are intentionally excluded until real case studies are ready. Blog pages, consulting pages, the privacy page, the payment success page, and both HTML and XML sitemaps remain included.

## Payments before launch

The catalog contains 15 priced books. The Railway API address is configured, but checkout remains intentionally disabled until the backend passes the production-readiness checks below.

- Treat `checkout-catalog.json` as display data only. The backend must keep its own trusted product allowlist and calculate every price server-side from catalog IDs.
- Restrict CORS to `https://bestenouf.com` and the exact `www` origin if it remains in use. Never reflect arbitrary origins.
- Implement the frontend contract: `POST /checkout` accepts catalog IDs and quantities; `GET /order?session_id=...` returns only a verified paid order and short-lived download URLs.
- Verify Stripe webhook signatures, enforce idempotency, rate-limit public endpoints, and keep all payment secrets and paid-file locations in Railway variables or another private secret store.
- Test checkout, cancellation, webhook retries, order confirmation, email delivery, and protected downloads in Stripe test mode before enabling live mode.
- Only after those tests pass, change `checkoutEnabled: false` to `true` in `assets/js/store-config.js`.

No Stripe or PayPal secret belongs in this public repository. GitHub Pages also ignores the response headers declared in `firebase.json`; those headers only apply if the site is deployed with Firebase Hosting.

## Validation

All local page, image, script, stylesheet, and fragment links were checked. Catalog order, 15 approved prices, 15 cover poses, the Original Eight bundle calculation, biography wording, skip links, heading structure, and sitemap coverage were checked. Cart behavior was checked with a local JavaScript harness. The repository workflow runs `node scripts/verify-site.mjs` on every push and pull request. Browser/device rendering and live checkout still require verification.
