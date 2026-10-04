# ShopBook v2 — Updated Documentation Pack

## Documents

1. `01-PRD-ShopBook-v2.md` — Product requirements, scope, business rules, KPIs, reports, UAT.
2. `02-TRD-ShopBook-v2.md` — Technical architecture, database model, APIs/query contracts, offline sync, security and testing.
3. `03-App-Flow-ShopBook-v2.md` — Navigation, screens, UX states and end-to-end flows.

## Key scope decision

ShopBook v2 is **not an inventory product**.

There is no product catalogue, stock quantity, SKU, barcode, POS or inventory workflow.

The product focuses on:

- Sales
- Collections
- Credit Given
- Customer receivables
- Vendor payables
- Expenses
- Approx. Profit
- Customer follow-ups
- Promise-to-Pay
- Business alerts
- Dashboard and reports
- Offline-first transaction capture

## Important terminology

Use **Approx. Profit**, never unqualified “Net Profit”, because the product does not track inventory or item-level COGS.

Keep **Sales** and **Collections** as separate metrics.

Use actionable debt-alert actions such as **Call, Receive Payment, Snooze and Promise to Pay** instead of a generic “Done”.

## New v2 capability

A lightweight customer/prospect follow-up module is included. It tracks requirements, status and next follow-up date but does not become a full CRM or quotation system.

## Implementation rule

Any future request involving inventory, GST, POS, product-level billing, WhatsApp/SMS, multi-user or multi-shop must be treated as a scope change and should update the PRD/TRD/App Flow before implementation.
