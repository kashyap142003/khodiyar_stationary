# ShopBook App Flow & Screen Blueprint
**Version 2.0 · Updated 4 Oct 2026**

---

# 1. Navigation

## Mobile bottom navigation

1. Home
2. Sales
3. Customers
4. Vendors
5. Dashboard
6. More

Floating **+ Quick Add** is available from Home and major ledger screens.

Quick Add:

- Walk-in Sale
- Customer Sale
- Receive Payment
- Purchase
- Pay Vendor
- Expense
- Follow-up

---

# 2. Global UX Rules

- Mobile-first.
- Large tap targets.
- Amount input opens numeric keypad.
- INR formatting.
- Save confirmation includes resulting balance.
- Offline state is always visible but unobtrusive.
- Never mix Sales and Collections in the same primary KPI.
- No inventory/product/stock screens.
- Debt alerts use payment/follow-up actions rather than generic “Done”.

---

# 3. Authentication

## Screen: Login

Fields:

- Email
- Password

Actions:

- Sign in
- Forgot password

After sign-in:

- First-time owner → Setup
- Existing owner → Home

---

# 4. First-Time Setup

### Step 1 — Shop

- Shop name
- Phone
- Address

### Step 2 — Preferences

- English / Gujarati
- Currency: INR
- Timezone: Asia/Kolkata

### Step 3 — Opening Data

- Import customers
- Import vendors
- Import opening balances
- Optional historical data

### Step 4 — Reconciliation

Show:

- Opening receivables
- Opening payables
- Opening cash

Owner confirms before entering new transactions.

---

# 5. Home

## Header

- Shop name
- Today
- Privacy toggle
- Sync status
- Alert bell

## Today cards

```text
Sales       ₹XX
Collections ₹XX
Credit Given ₹XX
```

Do not show a combined “money in” number as the primary metric.

## Quick Add

Six primary actions:

- Walk-in
- Customer Sale
- Payment
- Purchase
- Pay Vendor
- Expense

## Needs Attention

Sections:

- Customer dues
- Vendor dues
- Follow-ups
- Promise-to-Pay due
- Business alerts

## Today's Activity

Chronological entries.

---

# 6. Walk-in Sale

### Fields

- Date
- Amount
- Cash
- UPI
- Other
- Note

### Review

Show:

```text
Sale ₹1,250
Received ₹1,250
Outstanding ₹0
```

Save.

---

# 7. Customer Sale

### Step 1

Search/select customer.

Options:

- Existing customer
- Add customer

### Step 2

Enter:

- Sale amount
- Received now
- Cash/UPI/other
- Date
- Note

### Review

```text
Sale Value       ₹5,000
Received Now     ₹2,000
Credit Given     ₹3,000
Old Balance      ₹8,000
New Balance      ₹11,000
```

If credit limit is exceeded:

> This sale will take outstanding above the customer's credit limit.

Continue / Cancel.

---

# 8. Customers List

Search:

- Name
- Phone

Filters:

- Due
- Overdue
- Advance
- Follow-up due
- Segment

Sort:

- Highest balance
- Oldest due
- Last purchase
- Name

Top summary:

```text
To Collect ₹XX
Overdue ₹XX
Advance ₹XX
```

---

# 9. Customer Detail

## Header

- Name
- Phone
- Segment
- Current balance
- Risk
- Credit-limit usage

## Insight strip

```text
Last Purchase: 28 Sep
Last Payment: 02 Oct
Oldest Due: 41 days
Next Follow-up: 06 Oct
```

## Actions

- Sale
- Receive Payment
- Adjust
- Call
- Follow-up
- Statement

## Ledger

Tabs:

- All
- Sales
- Payments
- Adjustments

Each row:

- Date
- Type
- Amount
- Balance after

---

# 10. Receive Payment

Fields:

- Amount
- Mode
- Reference
- Date
- Note

Preview:

```text
Current Due ₹8,000
Payment     ₹5,000
Remaining   ₹3,000
```

If overpayment:

```text
Payment ₹10,000
Due ₹8,000
Advance ₹2,000
```

Confirm.

---

# 11. Promise to Pay

Accessible from Customer Detail and overdue alerts.

Fields:

- Amount
- Promise date
- Note

Confirmation:

> ₹5,000 promised for 8 Oct.

The promise appears in Follow-ups/Action Centre.

---

# 12. Customer Follow-up

## Create Follow-up

Fields:

- Person/business
- Phone
- Existing customer? yes/no
- Segment
- Requirement
- Estimated value
- Status
- Follow-up date
- Notes

Statuses:

- New
- Contacted
- Interested
- Quotation
- Won
- Lost

Actions:

- Save
- Call
- Reschedule

“Quotation” is a pipeline stage only.

---

# 13. Follow-ups List

Tabs:

- Due Today
- Upcoming
- Overdue
- Completed

Each card:

```text
ABC School
Notebook requirement
₹25,000 estimated
Follow-up: Today 4:00 PM
```

Actions:

- Call
- Open
- Reschedule
- Complete

---

# 14. Vendors List

Summary:

```text
To Pay ₹XX
Overdue ₹XX
Due This Week ₹XX
```

Filters:

- Overdue
- Due soon
- Archived

---

# 15. Vendor Detail

Header:

- Vendor
- Current payable
- Oldest due
- Payment terms

Actions:

- Purchase
- Pay Vendor
- Statement

Ledger:

- Purchases
- Payments

---

# 16. Purchase

Fields:

- Vendor
- Bill number
- Date
- Amount
- Paid now
- Due date
- Payment mode
- Note

Preview:

```text
Purchase ₹30,000
Paid now ₹10,000
Payable ₹20,000
```

No item/product/stock entry.

---

# 17. Pay Vendor

Fields:

- Vendor
- Amount
- Mode
- Reference
- Date
- Note

Preview:

```text
Current Payable ₹45,000
Payment          ₹20,000
Remaining        ₹25,000
```

Oldest due is cleared first.

---

# 18. Expenses

List:

- Date
- Category
- Amount
- Mode

Filters:

- Date
- Category

Create:

- Category
- Amount
- Mode
- Date
- Note
- Recurring toggle

---

# 19. Sales Screen

Tabs:

- All
- Walk-in
- Customer

Filters:

- Date
- Customer
- Payment state

Summary:

```text
Sales ₹XX
Collections ₹XX
Credit Given ₹XX
```

This distinction must be visible.

---

# 20. Dashboard

## KPI row

```text
Sales
Collections
Credit Given
To Collect
To Pay
Approx. Profit
```

### Approx. Profit card

Subtitle:

> Sales − Purchases − Expenses

Info:

> Operational estimate only. ShopBook does not track stock or item-level COGS.

## Charts

1. Sales trend
2. Collections trend
3. Credit Given trend
4. Sales vs previous period
5. Receivable ageing
6. Payables calendar
7. Expense breakdown

## Business insights

- Top customers
- Top defaulters
- Receivable concentration
- Vendor concentration
- Best sales days
- Sales dip
- Collection Rate

---

# 21. Collection Rate

Card:

```text
Collection Rate
72%
```

Info:

```text
Customer collections
÷
(Opening receivables + Credit given)
```

If denominator is zero:

```text
—
```

---

# 22. Business Money Position

Show:

```text
Cash                 ₹XX
Receivables          ₹XX
Vendor Payables     -₹XX
-------------------------
Operational Position ₹XX
```

Subtitle:

> Operational liquidity view, not accounting net worth.

---

# 23. Alerts / Action Centre

Tabs:

- Customers
- Vendors
- Follow-ups
- Business

## Customer overdue card

```text
Rajesh Patel
₹12,500 overdue
41 days
```

Actions:

- Open
- Call
- Receive Payment
- Snooze
- Promise to Pay

## Vendor card

```text
ABC Distributors
₹25,000 due in 3 days
```

Actions:

- Open
- Snooze

## Follow-up card

```text
Mehta Office
Call about annual stationery order
Due today
```

Actions:

- Open
- Call
- Reschedule
- Complete

---

# 24. Daily Cash Close

Show:

```text
Opening Cash          ₹10,000
Cash Sales             ₹8,000
Customer Collections   ₹3,000
Cash Expenses          ₹1,000
Vendor Cash Payments   ₹2,000
Expected Cash         ₹18,000
```

Owner enters:

```text
Actual Cash ₹17,500
```

Result:

```text
Difference -₹500
```

Add note.

---

# 25. Reports

List:

- Monthly Business Summary
- Sales & Collections
- Customer Outstanding
- Customer Sales
- Customer Follow-ups
- Vendor Payables
- Vendor Spend
- Expenses
- Approx. Profit
- Receivable Concentration
- Vendor Concentration
- Day Book
- Write-offs & Discounts

Actions:

- View
- Date filter
- Export CSV
- Print

---

# 26. Customer Statement

Header:

- Customer
- Current balance
- Last payment
- Oldest due

Transactions:

- Date
- Sale
- Payment
- Adjustment
- Running balance

Export/print statement.

---

# 27. Vendor Statement

Same pattern:

- Opening
- Purchases
- Payments
- Running payable

---

# 28. Trash

Tabs:

- Sales
- Payments
- Purchases
- Vendor Payments
- Expenses
- Customers/Vendors

Each row:

- Deleted date
- Original date
- Amount
- Deleted by

Actions:

- Restore
- Permanently delete after configured retention, if enabled

---

# 29. Sync Centre

Show:

```text
Synced ✓
Pending 2
Failed 0
Last sync 12:42 PM
```

Pending item:

- Entity
- Time
- Status

Failed item:

- Error
- Retry

Duplicate retry must not create duplicate financial records.

---

# 30. Edit History

Show:

```text
2 Oct 10:20 AM
Customer Sale edited

Before:
₹5,000 total
₹2,000 received

After:
₹5,500 total
₹2,000 received
```

High-impact edits require confirmation.

---

# 31. Settings

Sections:

### Shop
- Name
- Phone
- Address

### Language
- English
- Gujarati

### Customer
- Segments
- Credit limit defaults
- Ageing thresholds

### Follow-ups
- Default reminder time
- Follow-up statuses

### Expenses
- Categories
- Recurring expenses

### Alerts
- Sales dip threshold
- No-sales reminder
- Vendor reminder
- Customer ageing rules

### Security
- PIN
- Idle lock
- Privacy mode

### Data
- Import
- Export
- Backup
- Trash
- Sync Centre

---

# 32. Empty States

Customers:

> No customers yet. Add a customer to start tracking credit.

Sales:

> No sales for this period.

Follow-ups:

> No follow-ups due. You're all caught up.

Alerts:

> Nothing needs your attention.

Vendors:

> No vendor dues.

---

# 33. Error States

Examples:

- “Could not save. Your entry is safely queued for sync.”
- “Payment cannot be greater than the amount allowed unless you want to record an advance.”
- “This transaction could not be synced. Retry.”
- “Something changed while you were editing. Refresh and review the latest balance.”

---

# 34. Explicitly Removed Screens

Do not design:

- Inventory dashboard
- Product list
- Stock list
- Barcode scanner
- POS checkout
- Stock adjustment
- Low-stock alerts
- Product purchase/sale line items
- GST invoice builder

These are outside ShopBook v2.

---

# 35. End-to-End Flows

## Customer credit sale

```text
Home
 → Customer Sale
 → Select Customer
 → Enter Sale
 → Enter Received
 → Review Credit Given
 → Save
 → Updated Customer Balance
 → Optional Follow-up
```

## Customer collection

```text
Home
 → Payment
 → Select Customer
 → Enter Amount
 → Review Remaining
 → Save
 → FIFO allocation
 → Balance updated
 → Related Promise fulfilled if applicable
```

## Customer follow-up

```text
Home / Customers
 → Follow-up
 → Enter requirement
 → Set date
 → Save
 → Due alert
 → Call / Reschedule / Complete
```

## Promise-to-Pay

```text
Overdue Alert
 → Promise to Pay
 → Amount + Date
 → Save
 → Due alert on date
 → Payment
 → Promise fulfilled
```

## Vendor purchase

```text
Home
 → Purchase
 → Vendor
 → Amount
 → Paid Now
 → Due Date
 → Save
 → Vendor payable updated
```

## Daily close

```text
Home
 → Daily Close
 → System calculates expected cash
 → Owner enters actual cash
 → Difference
 → Note
 → Close
```

---

# 36. Design Language

Use:

- Clear financial hierarchy.
- Large amounts.
- Green/positive treatment for money received.
- Red/warning treatment for overdue money.
- Neutral treatment for informational metrics.
- Avoid excessive charts.
- Use plain language:
  - Sales
  - Collections
  - To Collect
  - To Pay
  - Approx. Profit
  - Follow-up

Avoid accounting jargon where possible.
