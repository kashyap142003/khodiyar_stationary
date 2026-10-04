# TRD: ShopBook
**Technical Requirements & Design — v2.0**  
Updated 4 Oct 2026 · React/Vite/TypeScript · Supabase · IndexedDB · PWA

---

# 1. Architecture

## 1.1 Stack

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form + Zod
- Recharts
- date-fns
- lucide-react

### Persistence / Offline
- IndexedDB via Dexie
- Service Worker / PWA cache
- Offline mutation queue
- Sync Centre

### Backend
- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security
- Postgres functions/triggers for authoritative financial calculations
- pg_cron for scheduled jobs where supported

### Automation
- ActivePieces for weekly/monthly reports and operational notifications.
- Email provider for owner-only reports.
- Nightly database backup/watchdog.

---

# 2. Design Principles

1. **Database owns business rules.**
2. **Client owns presentation and interaction.**
3. **No inventory model.**
4. **Sales and collections are separate concepts.**
5. **Approx. Profit is explicitly non-accounting.**
6. **Offline creation is first-class.**
7. **All financial writes are idempotent.**
8. **Soft-delete instead of destructive delete.**
9. **IST is the business timezone.**
10. **Money uses integer paise internally.**
11. **All tenant data is protected by RLS.**
12. **Follow-up workflow is separate from debt alerts.**

---

# 3. Repository Structure

```text
src/
  app/
  components/
    ui/
    forms/
    ledger/
    dashboard/
    alerts/
    followups/
  pages/
    auth/
    home/
    customers/
    vendors/
    sales/
    expenses/
    dashboard/
    reports/
    settings/
  hooks/
  lib/
    money.ts
    dates.ts
    permissions.ts
    validation.ts
    sync/
    notifications/
  db/
    indexeddb/
  services/
    customers/
    sales/
    payments/
    vendors/
    expenses/
    followups/
    reports/
  types/
  i18n/
```

---

# 4. Tenancy

v2 remains:

- Single owner
- Single business
- Single tenant

Schema should retain `business_id` on business data so a future multi-tenant migration is possible.

Do not implement multi-shop UI.

---

# 5. Database Model

## 5.1 Core tables

### businesses
```sql
id uuid primary key
owner_user_id uuid not null references auth.users(id)
name text not null
phone text
address text
timezone text not null default 'Asia/Kolkata'
currency text not null default 'INR'
locale text not null default 'en-IN'
language text not null default 'en'
created_at timestamptz
updated_at timestamptz
```

### customers
```sql
id uuid primary key
business_id uuid not null
name text not null
phone text
address text
segment text
credit_limit_paise bigint
opening_balance_paise bigint not null default 0
opening_balance_date date
notes text
is_archived boolean not null default false
created_at timestamptz
updated_at timestamptz
```

### vendors
```sql
id uuid primary key
business_id uuid not null
name text not null
phone text
address text
payment_terms_days integer
opening_balance_paise bigint not null default 0
opening_balance_date date
notes text
is_archived boolean not null default false
created_at timestamptz
updated_at timestamptz
```

---

# 6. Transaction Tables

## 6.1 sales

One row represents one sale event.

```sql
id uuid primary key
business_id uuid not null
customer_id uuid null
sale_type text not null check (sale_type in ('walk_in','customer'))
sale_date timestamptz not null
total_paise bigint not null
cash_paise bigint not null default 0
upi_paise bigint not null default 0
other_paid_paise bigint not null default 0
note text
source text not null default 'manual'
client_mutation_id uuid unique
deleted_at timestamptz
created_at timestamptz
updated_at timestamptz
```

Constraints:

- Walk-in sales require `customer_id IS NULL`.
- Customer sales require `customer_id IS NOT NULL`.
- `cash + upi + other_paid <= total`.
- `total > 0`.

The unpaid portion becomes credit.

`credit_paise = total_paise - cash_paise - upi_paise - other_paid_paise`

## 6.2 customer_payments

```sql
id uuid primary key
business_id uuid not null
customer_id uuid not null
payment_date timestamptz not null
amount_paise bigint not null
mode text not null
reference text
note text
source text not null default 'manual'
client_mutation_id uuid unique
deleted_at timestamptz
created_at timestamptz
updated_at timestamptz
```

## 6.3 customer_adjustments

```sql
id uuid primary key
business_id uuid not null
customer_id uuid not null
adjustment_type text not null check (adjustment_type in ('write_off','discount'))
amount_paise bigint not null
adjustment_date timestamptz not null
reason text not null
source text not null default 'manual'
deleted_at timestamptz
created_at timestamptz
updated_at timestamptz
```

---

# 7. Vendor Tables

## purchases

```sql
id uuid primary key
business_id uuid not null
vendor_id uuid not null
bill_number text
purchase_date timestamptz not null
amount_paise bigint not null
paid_now_paise bigint not null default 0
due_date date
payment_mode text
note text
source text not null default 'manual'
client_mutation_id uuid unique
deleted_at timestamptz
created_at timestamptz
updated_at timestamptz
```

No product, SKU, stock quantity, barcode or inventory columns.

## vendor_payments

```sql
id uuid primary key
business_id uuid not null
vendor_id uuid not null
payment_date timestamptz not null
amount_paise bigint not null
mode text not null
reference text
note text
source text not null default 'manual'
client_mutation_id uuid unique
deleted_at timestamptz
created_at timestamptz
updated_at timestamptz
```

---

# 8. Expenses

```sql
id uuid primary key
business_id uuid not null
expense_date timestamptz not null
category text not null
amount_paise bigint not null
mode text not null
note text
is_recurring boolean not null default false
recurrence_rule jsonb
source text not null default 'manual'
client_mutation_id uuid unique
deleted_at timestamptz
created_at timestamptz
updated_at timestamptz
```

---

# 9. Follow-up / Lightweight CRM

## followups

```sql
id uuid primary key
business_id uuid not null
customer_id uuid null
person_name text not null
phone text
segment text
requirement text
estimated_value_paise bigint
status text not null
follow_up_at timestamptz
notes text
completed_at timestamptz
created_at timestamptz
updated_at timestamptz
deleted_at timestamptz
```

Allowed status values:

```text
new
contacted
interested
quotation
won
lost
```

`quotation` is a pipeline state only. No quotation document generation is implemented.

## promises_to_pay

```sql
id uuid primary key
business_id uuid not null
customer_id uuid not null
amount_paise bigint not null
promised_for date not null
note text
status text not null default 'open'
fulfilled_at timestamptz
created_at timestamptz
updated_at timestamptz
```

Statuses:

```text
open
fulfilled
cancelled
```

---

# 10. Alerts

```sql
alerts
------
id uuid
business_id uuid
alert_type text
severity text
customer_id uuid null
vendor_id uuid null
followup_id uuid null
promise_id uuid null
title text
body text
due_at timestamptz
status text
snoozed_until timestamptz
created_at timestamptz
updated_at timestamptz
```

Alert types:

```text
customer_overdue
customer_credit_limit
customer_high_receivable
vendor_due
vendor_overdue
followup_due
promise_due
sales_dip
no_sales
cash_close
report_ready
seasonal
```

Statuses:

```text
open
snoozed
completed
```

Debt alerts should not use “completed” as the normal action. They are resolved by payment, follow-up, snooze or explicit state transition.

---

# 11. Reference / Audit Metadata

All transactional tables should contain:

```text
source:
  manual
  import
  offline
  recurring
  system

client_mutation_id:
  UUID for idempotency where applicable
```

For high-value edits, retain edit history:

```sql
edit_history
------------
id uuid
business_id uuid
entity_type text
entity_id uuid
action text
before_json jsonb
after_json jsonb
changed_at timestamptz
```

---

# 12. Balance Functions

## Customer balance

```text
opening_balance
+ customer_credit_sales
- customer_payments
- customer_adjustments
```

Positive = receivable.  
Negative = customer advance.

Customer credit sales use only the unpaid portion of each customer sale.

## Vendor balance

```text
opening_balance
+ purchases
- vendor_payments
```

---

# 13. FIFO Allocation

## Customer payments

Oldest unpaid customer sale first.

Pseudo:

```text
for charge in customer_charges ordered by charge_date asc:
    allocation = min(payment_remaining, charge_remaining)
    apply allocation
    payment_remaining -= allocation
    if payment_remaining == 0: stop
```

If payment remains after all charges are cleared, the remainder is an advance.

## Vendor payments

Apply to earliest due purchase first.

---

# 14. Dashboard Query Contract

The backend should expose one aggregated dashboard query/view to avoid repeated client-side financial calculations.

Return:

```text
sales_total
collections_total
credit_given_total
customer_receivable_total
vendor_payable_total
approx_profit
collection_rate
cash_total
upi_total
expense_total
purchase_total
previous_period_sales
sales_growth
receivable_ageing
payables_calendar
top_customers
top_defaulters
followups_due
promise_to_pay_due
expense_breakdown
cash_forecast
```

## Definitions

### Sales

```text
sum(walk_in sales)
+ sum(full customer sales)
```

### Collections

```text
sum(customer payments)
```

### Credit Given

```text
sum(customer sale total - amount received at sale)
```

### Approx. Profit

```text
sales - purchases - expenses
```

### Collection Rate

```text
collections / (opening_receivables + credit_given)
```

Return null/“—” when denominator is zero.

---

# 15. Approx. Profit Safety

Every API/UI representation must use the field/name:

```text
approx_profit
```

Never present it as accounting `net_profit`.

Tooltip:

> Operational estimate = Sales − Purchases − Expenses. ShopBook does not track stock or item-level cost of goods sold.

---

# 16. Receivable Ageing

Buckets:

```text
0-7
8-30
31-60
60+
```

Age is calculated against the oldest remaining charge after FIFO allocation.

---

# 17. Customer Risk

Suggested database function:

```text
get_customer_risk(customer_id)
```

Rules:

- High: overdue ≥30 days OR balance > credit limit.
- Medium: overdue ≥15 days OR balance ≥80% of credit limit.
- Low: otherwise.

Configurable thresholds can be stored in business settings.

---

# 18. Reports

Server-side report functions:

```text
monthly_business_summary()
sales_collections_report()
customer_outstanding_report()
customer_sales_report()
followup_report()
vendor_payables_report()
vendor_spend_report()
expense_report()
approx_profit_report()
receivable_concentration_report()
vendor_concentration_report()
day_book_report()
writeoff_discount_report()
```

All reports respect:

- business_id
- date range
- soft deletes
- timezone Asia/Kolkata

---

# 19. Business Money Position

Expose:

```text
cash
+ customer_receivables
- vendor_payables
```

This is an operational liquidity view, not accounting net worth.

If bank/UPI balances are not independently tracked, do not label the result as total bank balance.

---

# 20. Offline Architecture

## Create-first model

Supported offline creates:

- Sales
- Customer payments
- Purchases
- Vendor payments
- Expenses
- Customers/vendors
- Follow-ups

Offline edits to old financial transactions should be restricted or require sync availability.

### Queue item

```text
id
operation
entity
payload
client_mutation_id
created_at
retry_count
status
last_error
```

### Sync

1. Save locally.
2. Add mutation to queue.
3. Show pending state.
4. When online, submit idempotent mutation.
5. Server returns canonical row.
6. Mark queue item complete.
7. Refresh affected queries.

---

# 21. Idempotency

Every create mutation generated by the client must contain a unique `client_mutation_id`.

Server:

```sql
unique(business_id, client_mutation_id)
```

If a request is repeated:

- Do not create a second transaction.
- Return the original transaction.

---

# 22. Soft Delete

Financial records use:

```text
deleted_at
```

Normal queries use:

```text
where deleted_at is null
```

Delete action:

1. Confirmation.
2. Soft delete.
3. Recalculate dependent balances.
4. Add to Trash.
5. Write audit entry.

Restore reverses the process.

---

# 23. Security / RLS

Every business table:

```text
business_id
```

RLS policy checks the authenticated owner.

Example:

```sql
create policy "owner can read business rows"
on customers
for select
using (
  business_id in (
    select id from businesses
    where owner_user_id = auth.uid()
  )
);
```

Apply equivalent policies to every table.

No service-role key in the browser.

---

# 24. Scheduled Jobs

## Daily

- Generate due alerts.
- Escalate overdue customer alerts.
- Generate Promise-to-Pay due alerts.
- Generate no-sales reminder according to settings.
- Check backup/watchdog status.

## Weekly

- Owner summary email.
- Backup verification.

## Monthly

- Business summary.
- Sales vs collections.
- Outstanding and ageing.
- Approx. profit.
- Expense summary.
- Follow-up performance.

---

# 25. Notification Rules

Notifications must be actionable.

### Customer overdue

Primary actions:

- Open customer
- Call
- Receive payment
- Snooze
- Promise to pay

### Follow-up

- Open
- Call
- Reschedule
- Complete

### Vendor

- Open
- Mark for payment planning
- Snooze

### Business

- Open
- Complete
- Snooze

---

# 26. UI State Requirements

Every important screen supports:

- Loading
- Empty
- Error
- Offline
- Syncing
- Success confirmation

Financial actions show the resulting balance before the user leaves the screen.

High-impact edit:

> This change will alter customer outstanding from ₹X to ₹Y.

Confirm / Cancel.

---

# 27. Performance

Targets:

- First meaningful dashboard render <2 sec on 4G.
- Common transaction form interaction <100ms after cached data loads.
- Avoid N+1 customer/vendor queries.
- Paginate long ledgers.
- Aggregate reports server-side.
- Cache dashboard by selected date range.

---

# 28. Localization

All user-facing strings come from translation keys.

Example:

```text
dashboard.sales
dashboard.collections
dashboard.creditGiven
dashboard.toCollect
dashboard.toPay
dashboard.approxProfit
followups.dueToday
alerts.promiseDue
```

Gujarati review must cover:

- Money terminology
- Customer/vendor terminology
- Debt reminders
- Follow-up terminology
- Error messages

---

# 29. Testing

## Unit

- Balance formulas
- FIFO allocation
- Ageing
- Collection rate
- Approx. profit
- Growth
- Risk
- Promise-to-Pay state
- Idempotency

## Integration

- Sale → customer balance
- Payment → balance
- Payment → FIFO
- Purchase → vendor balance
- Vendor payment → FIFO
- Expense → approx. profit
- Follow-up → alert
- Promise → due alert
- Payment → Promise fulfillment
- Delete → recalculation
- Offline → sync

## UAT

Use real-like sample data:

- Walk-in sales
- Customer credit
- Partial payment
- Advance
- Overdue customers
- Vendor bills
- Expenses
- Follow-ups
- Promises

---

# 30. Deployment

Recommended:

- Frontend: Vercel/Netlify
- Backend: Supabase
- Automation: ActivePieces
- Domain: HTTPS
- PWA installability enabled
- Production environment variables separated from development

No financial data in browser logs or third-party analytics.

---

# 31. Explicitly Out of Schema

The following must not be added accidentally:

```text
products
inventory
stock_qty
sku
barcode
warehouse
purchase_item
sale_item
gst_rate
gst_invoice
pos_terminal
```

If a future feature needs one of these, it requires a scope decision and PRD update first.

---

# 32. Definition of Done

A feature is complete only when:

- PRD requirement exists.
- UI flow exists.
- Database/business rule exists.
- RLS exists.
- Offline behaviour is defined if applicable.
- Error/empty states exist.
- English/Gujarati strings exist.
- Tests exist.
- Dashboard/report impact is checked.
- Soft-delete and audit behaviour are defined for financial data.
