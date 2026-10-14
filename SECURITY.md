# Security policy

## Reporting a vulnerability

Please report a suspected vulnerability privately by emailing `bestenouf@consultant.com`. Do not open a public issue for payment, download-access, credential, or customer-data vulnerabilities.

Include the affected page or endpoint, the observed behavior, and the minimum steps required to reproduce it. Do not include passwords, payment-card data, private API keys, or customer information.

## Repository boundaries

This public repository contains only the static website. It must never contain:

- Stripe secret or webhook keys;
- PayPal client secrets;
- Railway, Firebase, email-service, or storage credentials;
- paid ebook files or permanent private download URLs;
- customer, payment, or order records;
- `.env` files, private keys, or authentication tokens.

Payment totals, product eligibility, webhook verification, order status, and download authorization must be enforced by the private backend. Browser-supplied names, prices, totals, price IDs, success URLs, and download URLs are untrusted.
