# PRD: ShopBook
**Stationery Business Management, Ledger, Sales & Collections Dashboard**  
Version 2.0 · 4 Oct 2026 · Single-owner, single-tenant · English + Gujarati

---

## 1. Product Summary

ShopBook is a mobile-first PWA for a stationery shop owner who currently relies on notebooks to track sales, customer credit, customer payments, vendor purchases, vendor payments and expenses.

The owner enters transactions. ShopBook calculates balances, receivable ageing, vendor payables, sales trends, collections, approximate profit, cash position and business alerts.

The product is intentionally **not an inventory/POS system**. It is a lightweight business-management and ledger system focused on money movement, customer relationships and actionable follow-ups.

### Core promise

> **Enter the transaction once. ShopBook tells the owner what happened, who owes money, whom the shop owes, who needs a follow-up, and how the business is performing.**

### Explicit exclusions from this product scope

- Inventory / stock quantities
- Product/item catalogue
- Barcode scanning
- Item-level billing
- POS checkout
- GST/tax management
- WhatsApp/SMS customer messaging
- Multiple users/roles
- Multiple shops
- Customer-facing portal
- Accounting-grade COGS/profit
- Full quotation/invoicing workflow unless separately approved

---

## 2. Goals

1. Replace the credit notebook, sales register and vendor-payment notebook.
2. Make common entries fast enough for counter use.
3. Give the owner an immediate view of **Sales, Collections, Credit Given and Outstanding** separately.
4. Make customer follow-up actionable instead of treating every reminder as a generic alert.
5. Show vendor dues and payment priorities.
6. Provide useful business insights without pretending to be an accounting system.
7. Keep the product simple enough for a non-technical single owner.
8. Work reliably with intermittent internet.
9. Support English and Gujarati.
10. Provide automated reports and backups with minimal owner maintenance.

---

## 3. Non-goals

The following remain intentionally outside v2:

- Stock/inventory management of any kind.
- Item/product-level sales.
- Barcode/POS.
- GST/tax calculations.
- Customer WhatsApp/SMS automation.
- Staff accounts and permissions.
- Multi-shop tenancy.
- Customer login.
- Full CRM automation.
- Full quotation/invoice lifecycle.
- Accounting-grade inventory-based COGS.

---

## 4. User and Context

**Primary user:** one stationery shop owner.

Typical conditions:

- Uses a phone at the counter.
- May use a desktop/tablet for reports.
- Gets interrupted while entering transactions.
- Internet may be unreliable.
- Customers may see the screen.
- Comfortable with Gujarati and basic English.
- Money is INR.
- Financial year is April–March.
- The owner wants practical answers, not accounting terminology.

---

# 5. Product Scope

## R1 — Replace the Notebook

Core ledger and daily operations:

- Authentication
- Customers
- Walk-in sales
- Named customer sales
- Customer payments
- Customer adjustments
- Vendors
- Purchases
- Vendor payments
- Expenses
- Home / Quick Add
- Sales list
- Customer/vendor ledgers
- Opening-balance import
- Trash / Undo
- Basic customer/vendor balances

## R2 — Insights, Follow-ups & Reminders

- Dashboard
- Separate Sales / Collections / Credit Given / Outstanding KPIs
- Collection Rate
- Approx. Profit
- Receivable ageing
- Payables calendar
- Customer risk
- Customer follow-up / lightweight lead pipeline
- Follow-up reminders
- Promise-to-Pay
- Business alerts
- Daily cash close
- Reports
- Historical monthly import
- CSV export
- Statements
- PIN/privacy mode
- PWA

## R3 — Reliability & Polish

- Offline queue
- Sync Centre
- Edit history
- Gujarati review
- Performance pass
- Backup/restore drill
- UAT fixes
- Advanced business insights

---

# 6. Functional Requirements

## 6.1 Authentication & Security

| ID | Requirement | Pri | Rel |
|---|---|---:|---:|
| FR-A1 | Email/password login for the single owner; public signup disabled | M | R1 |
| FR-A2 | Persistent authenticated session | M | R1 |
| FR-A3 | Change password and sign out | M | R1 |
| FR-A4 | 4–6 digit app PIN with configurable idle lock | S | R2 |
| FR-A5 | Privacy eye masks all monetary amounts | S | R2 |

---

## 6.2 Home / Quick Add

Home is the fastest operational screen.

### Primary actions

- Walk-in Sales
- Customer Sale
- Payment Received
- New Purchase
- Pay Vendor
- Expense

### Today strip

Show separately:

- Total Sales
- Cash Sales
- UPI Sales
- Credit Given
- Collections

Do not combine sales and collections into one KPI.

### Home sections

1. Today
2. Quick Add
3. Needs Attention
4. Follow-ups Due
5. Today's Entries

---

## 6.3 Sales

### A. Walk-in Sales

For untracked customers.

Fields:

- Date
- Cash
- UPI
- Note

Rules:

- Multiple entries per day allowed.
- Total automatically calculated.
- Must be greater than zero.
- Walk-in sales are always fully paid.
- Customer sales must not be entered here.

### B. Customer Sale

For named customers, whether paid immediately or partially/on credit.

Fields:

- Customer
- Date
- Total amount
- Amount received now
- Cash/UPI split
- Note

System calculates:

`Credit Given = Total Sale − Amount Received Now`

Before save, show:

- Current balance
- Credit given
- New balance
- Credit-limit warning if applicable

### Sales list

Filters:

- Date range
- Walk-in/customer
- Customer
- Payment state

Totals:

- Total Sales
- Collections from Customer Sales
- Credit Given

---

# 6.4 Customers & Customer Ledger

### Customer fields

- Name
- Phone
- Address
- Customer segment
- Credit limit (optional)
- Opening balance
- Opening balance date
- Notes

### Customer segments

Owner-configurable defaults:

- Retail
- School
- Office
- Corporate
- Wholesale
- Other

Segmentation is descriptive only; it does not change balance calculations.

### Customer list

Search/sort/filter by:

- Name
- Phone
- Balance
- Oldest due
- Last purchase
- Segment
- Has dues
- Overdue
- Advance
- Archived
- Follow-up due

Totals:

- Total to collect
- Customers with dues
- Overdue customers
- Advance held

### Customer ledger

Show prominently:

- Current balance
- Oldest unpaid age
- Credit-limit usage
- Risk
- Last purchase date
- Last payment date
- Segment
- Next follow-up

Actions:

- Customer Sale
- Receive Payment
- Adjust
- Call
- Follow-up
- Statement
- Edit
- Archive

### Last Purchase

The customer detail screen must show the most recent named customer sale date and amount.

This is an operational insight, not inventory information.

---

# 6.5 Customer Payments & Adjustments

### Receive Payment

Fields:

- Amount
- Mode: Cash / UPI / Bank / Cheque / Other
- Date
- Note

Show:

`Balance after payment: ₹X`

If payment exceeds dues:

> ₹X will be kept as customer advance.

### Adjustment

Types:

- Write-off
- Discount

Write-off requires a reason.

Adjustments are reported separately.

---

# 6.6 Customer Follow-up / Lightweight Lead Module

This is intentionally lightweight. It is **not a full CRM**.

### Purpose

Track customers/prospects who need a business follow-up independently of payment alerts.

### Fields

- Person/business name
- Phone
- Customer or prospect
- Segment
- Requirement / interest
- Estimated value (optional)
- Status
- Follow-up date
- Notes
- Linked customer (optional)

### Statuses

- New
- Contacted
- Interested
- Quotation
- Won
- Lost

**Quotation status is only a pipeline stage.** ShopBook does not generate or manage quotations in v2.

### Follow-up actions

- Call
- Open
- Reschedule
- Mark complete
- Convert/link to customer

### Follow-up reminders

A follow-up reminder is separate from a payment reminder.

Examples:

- “Call Mehta Office Supplies today.”
- “Follow up with Rajesh about the notebook order.”
- “Follow up with ABC School on Friday.”

Follow-ups appear on Home and in the Alerts/Follow-ups area.

---

# 6.7 Vendors, Purchases & Payments

### Vendor fields

- Name
- Phone
- Address
- Payment terms
- Opening balance
- Opening date
- Notes

### Purchase

- Vendor
- Bill number
- Date
- Amount
- Due date
- Paid now
- Payment mode
- Note

### Vendor payment

- Vendor
- Amount
- Mode
- Reference
- Date
- Note

Payments apply to oldest due items first.

### Payables

Groups:

- Overdue
- Due today
- Due within 7 days
- Later

---

# 6.8 Expenses

Fields:

- Date
- Category
- Amount
- Mode
- Note

Seed categories:

- Rent
- Electricity
- Staff salary
- Transport & freight
- Tea & miscellaneous
- Repairs
- Phone & internet
- Packaging
- Other

Recurring expenses are supported.

---

# 6.9 Daily Cash Close

Expected cash:

`Opening Cash + Cash Sales + Cash Customer Collections − Cash Expenses − Cash Vendor Payments`

Owner enters actual cash.

Show:

- Expected
- Actual
- Difference
- Note

---

# 6.10 Dashboard

The dashboard is designed around **money movement and action**, not inventory.

### Primary KPI cards

1. **Sales**
2. **Collections**
3. **Credit Given**
4. **To Collect**
5. **To Pay**
6. **Approx. Profit**

### Definitions

**Sales**

`Walk-in sales + full value of named customer sales`

**Collections**

`Customer payments received`

**Credit Given**

`Credit created from customer sales during the selected period`

**Outstanding / To Collect**

`Sum of positive customer balances`

**To Pay**

`Sum of positive vendor balances`

**Collection Rate**

For a selected period:

`Customer Collections ÷ (Opening Receivables + Credit Given) × 100`

If the denominator is zero, show “—”.

### Approx. Profit

`Sales − Purchases − Expenses`

Label everywhere as:

> **Approx. Profit**

Info text:

> This is an operational estimate based on purchases recorded in ShopBook. Because ShopBook does not track stock or item-level cost of goods sold, it is not accounting-grade profit.

### Other dashboard insights

- Sales vs last month
- Sales vs same period last month
- Sales trend
- Collection trend
- Credit Given trend
- Receivable ageing
- Payables calendar
- Top customers
- Top outstanding customers
- Customer follow-ups due
- Expense breakdown
- Business money position
- Cash-flow forecast
- Best/worst sales days

---

# 6.11 Business Money Position

Show an operational position:

- Cash
- Customer receivables
- Vendor payables
- Optional bank/UPI tracked cash where data supports it

Clearly label:

> Operational money position — not accounting net worth.

---

# 6.12 Alerts & Action Centre

Alerts are separated by purpose:

### Customers

- Overdue
- Credit limit exceeded
- High receivables

### Vendors

- Due soon
- Overdue

### Follow-ups

- Follow-up due today
- Follow-up overdue
- Promise-to-Pay due

### Business

- Sales dip
- No sales logged
- Cash close pending
- Seasonal reminder
- Weekly/monthly report ready

### Alert actions

For customer debt:

- Open
- Call
- Receive Payment
- Snooze
- Promise to Pay

Do **not** use “Done” as the primary action for an unpaid debt.

For a business reminder:

- Open
- Complete
- Snooze

For a follow-up:

- Open
- Call
- Reschedule
- Complete

---

# 6.13 Promise to Pay

A Promise-to-Pay record is created from a customer overdue alert or customer ledger.

Fields:

- Customer
- Amount promised
- Promise date
- Note

Behaviour:

- Appears in Follow-ups due.
- On the promised date, becomes a due alert.
- If payment is recorded, it is automatically shown as fulfilled.
- If unpaid after the date, it remains overdue.

This is not a legal commitment; it is an owner reminder.

---

# 6.14 Data Tools

- Opening customer/vendor import
- Historical monthly import
- CSV export
- Trash
- Restore
- Undo
- Edit history
- Nightly backup

---

# 6.15 Settings

- Shop profile
- Language
- Reminder rules
- Customer segments
- Expense categories
- Recurring expenses
- Seasonal reminders
- Security/PIN
- Backup
- Import
- Follow-up defaults
- Sales-dip threshold
- Collection-rate/forecast assumptions

---

# 7. Business Rules

## 7.1 Customer balance

`Customer Balance = Opening Balance + Customer Credit Sales − Customer Payments − Adjustments`

Positive = customer owes shop.  
Negative = customer advance.

## 7.2 Customer ageing

FIFO:

- 0–7 days
- 8–30 days
- 31–60 days
- 60+ days

Payments and adjustments apply to the oldest unpaid charge first.

## 7.3 Vendor balance

`Vendor Balance = Opening Balance + Purchases − Vendor Payments`

Vendor payments use earliest due date first.

## 7.4 Sales

`Total Sales = Walk-in Sales + Full Customer Sale Value`

## 7.5 Credit Given

`Credit Given = Customer Sale Value − Amount Received at Sale`

## 7.6 Collections

`Collections = Customer Payments`

## 7.7 Approx. Profit

`Approx. Profit = Sales − Purchases − Expenses`

The UI must never call this “Net Profit” without the approximation warning.

## 7.8 Growth

`Growth % = (Current − Previous) / Previous × 100`

Only calculate when previous > 0.

---

# 8. Customer Risk

| Risk | Rule |
|---|---|
| Low | No overdue beyond tier 1 and within credit limit |
| Medium | Ageing between tier 1 and tier 3, or >80% credit-limit usage |
| High | Ageing ≥ tier 3 or balance exceeds credit limit |

Default tiers: 7 / 15 / 30 days.

---

# 9. Reports

| Report | Contents |
|---|---|
| Monthly Business Summary | Sales, collections, credit given, purchases, expenses, approx. profit |
| Sales & Collections | Sales vs money actually collected |
| Customer Outstanding | Balance, ageing, oldest due, last payment |
| Customer Sales | Sales and credit by customer |
| Customer Follow-ups | Open, due, overdue, completed |
| Vendor Payables | Open bills and due dates |
| Vendor Spend | Purchases by vendor |
| Expense Report | Category/month |
| Approx. Profit | Sales − purchases − expenses + methodology warning |
| Receivable Concentration | % of receivables held by top customers |
| Vendor Concentration | % of purchases owed to top vendors |
| Day Book | All transactions chronologically |
| Write-offs & Discounts | Separate totals |

Exports: CSV and browser print where appropriate.

---

# 10. Success Metrics

| Metric | Target |
|---|---|
| Walk-in entry | ≤10 sec |
| Existing-customer sale | ≤15 sec |
| Payment entry | ≤10 sec |
| Day-1 receivables | Exact match after opening import |
| Notebook replacement | Within 2 weeks |
| Data-loss incidents | 0 |
| Dashboard first meaningful view | <2 sec on mobile 4G |
| Follow-up due visibility | 100% of active due follow-ups visible on Home/Action Centre |
| Duplicate transactions | 0 from double-submit/retry |

---

# 11. Non-functional Requirements

- Mobile-first.
- Minimum 44px tap targets.
- INR/en-IN formatting.
- English + Gujarati.
- Offline create support.
- RLS on all data.
- Soft-delete transactions.
- Archive customers/vendors.
- Idempotent writes.
- Nightly backups.
- 30-day backup retention.
- No analytics SDK containing customer financial data.
- Designed for ≤50,000 transactions/year.

---

# 12. Data Migration / Go-live

Import:

1. Customers and opening balances.
2. Vendors and opening balances.
3. Historical monthly sales/purchases/expenses.
4. Optional initial follow-up list.
5. Opening cash.

Reconcile opening receivables and payables against the paper records before go-live.

After go-live, ShopBook becomes the system of record for new entries.

---

# 13. UAT Acceptance

### Core

- Walk-in sale updates Sales immediately.
- Customer sale correctly creates Credit Given.
- Payment reduces outstanding.
- Overpayment becomes advance.
- Vendor payment clears oldest due amount first.
- Expense affects approximate profit.
- Deleted transactions leave all totals and enter Trash.

### Dashboard

- Sales and Collections are separate.
- Credit Given is visible.
- Collection Rate uses the documented formula.
- Approx. Profit includes the methodology warning.
- To Collect matches customer balances.
- To Pay matches vendor balances.

### Follow-ups

- Follow-up due today appears on Home.
- Overdue follow-up appears in Action Centre.
- Call opens phone action.
- Reschedule changes the due date.
- Completed follow-up disappears from active list.
- Promise-to-Pay becomes due on the promised date.
- Payment fulfills a related Promise-to-Pay.

### Alerts

- Debt alerts offer payment/call actions, not only “Done”.
- Snoozed alerts return on the selected date.
- Customer alerts escalate by ageing tier.

### Offline

- New sales/payments/purchases/expenses can be created offline.
- Reconnection creates exactly one record per transaction.

---

# 14. Risks

| Risk | Mitigation |
|---|---|
| Owner forgets entries | Quick Add + no-sales alert + daily summary |
| Sales confused with collections | Separate dashboard KPIs |
| Profit misunderstood | “Approx. Profit” label + methodology warning |
| Inventory expectations creep into scope | Explicit product exclusion |
| Debt alerts become noisy | Purpose-based Action Centre + snooze + Promise-to-Pay |
| Follow-up and payment reminders get mixed | Separate Follow-ups and Customers groups |
| Opening balances wrong | Reconciliation before go-live |
| Gujarati quality | Owner review on real screens |
| Phone lost | Cloud data + password sign-in + PIN privacy |

---

# 15. Future Roadmap

Not included in v2:

- Inventory/product catalogue
- Stock levels
- Barcode/POS
- GST
- WhatsApp/SMS automation
- Full quotation generation
- Staff accounts
- Multi-shop
- AI “ask your data”
- Advanced CRM automation

---

# 16. Glossary

- **Sales:** full value of sales recorded.
- **Collections:** customer payments actually received.
- **Credit Given:** unpaid portion created by customer sales.
- **Outstanding / To Collect:** customer balances owed to the shop.
- **Approx. Profit:** Sales − Purchases − Expenses, explicitly not accounting-grade.
- **Follow-up:** an action the owner needs to take for a customer/prospect.
- **Promise-to-Pay:** owner reminder tied to a customer's promised payment date.
- **Ageing:** how long an unpaid amount has remained outstanding.
- **FIFO:** oldest outstanding amount is cleared first.
