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

The catalog now contains 15 priced books. Checkout is intentionally inactive because the original package has a separate server-side catalog. Do not enable checkout until the payment service is updated.

- `checkout-catalog.json` contains all 15 trusted item IDs with approved prices in cents. Update the EXISTING checkout backend to match it. The older eight IDs are retained for compatibility.
- Connect the six new paid PDFs to that backend's protected download records.
- Test the server's checkout totals, Stripe test-mode completion, order confirmation, and the protected downloads.
- Then change `checkoutEnabled: false` to `true` in `assets/js/store-config.js` and republish that file.

The existing API address is retained as configuration. No API availability, email delivery, or payment transaction has been verified by this merge. No Stripe secret keys or paid PDFs are included.

## Validation

All local page, image, script, stylesheet, and fragment links were checked. Catalog order, 15 approved prices, 15 cover poses, the Original Eight bundle calculation, biography wording, skip links, heading structure, and sitemap coverage were checked. Cart behavior was checked with a local JavaScript harness. Browser/device rendering and live checkout still require verification.
