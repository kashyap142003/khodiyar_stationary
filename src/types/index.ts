export type PaymentMode = 'cash' | 'upi' | 'bank' | 'cheque' | 'other';
export type SaleType = 'walk_in' | 'customer';
export type AdjustmentType = 'write_off' | 'discount';
export type FollowupStatus = 'new' | 'contacted' | 'interested' | 'quotation' | 'won' | 'lost';
export type CustomerSegment = 'Retail' | 'School' | 'Office' | 'Corporate' | 'Wholesale' | 'Other';
export type AlertType =
  | 'customer_overdue'
  | 'customer_credit_limit'
  | 'customer_high_receivable'
  | 'vendor_due'
  | 'vendor_overdue'
  | 'followup_due'
  | 'promise_due'
  | 'sales_dip'
  | 'no_sales'
  | 'cash_close'
  | 'report_ready'
  | 'seasonal';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface BusinessProfile {
  id: string;
  name: string;
  phone: string;
  address: string;
  timezone: string;
  currency: string;
  locale: string;
  language: 'en' | 'gu';
  openingCashPaise: number;
  googleSheetUrl?: string;
  googleAppsScriptUrl?: string;
  lastSyncedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  segment: CustomerSegment;
  creditLimitPaise?: number;
  openingBalancePaise: number;
  openingBalanceDate: string;
  notes?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  phone: string;
  address: string;
  paymentTermsDays?: number;
  openingBalancePaise: number;
  openingBalanceDate: string;
  notes?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName?: string;
  saleType: SaleType;
  saleDate: string;
  totalPaise: number;
  cashPaise: number;
  upiPaise: number;
  otherPaidPaise: number;
  creditPaise: number; // totalPaise - (cash + upi + other)
  note?: string;
  source: 'manual' | 'offline' | 'import';
  deletedAt?: string;
  createdAt: string;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  customerName?: string;
  paymentDate: string;
  amountPaise: number;
  mode: PaymentMode;
  reference?: string;
  note?: string;
  source: 'manual' | 'offline' | 'import';
  deletedAt?: string;
  createdAt: string;
}

export interface CustomerAdjustment {
  id: string;
  customerId: string;
  customerName?: string;
  adjustmentType: AdjustmentType;
  amountPaise: number;
  adjustmentDate: string;
  reason: string;
  deletedAt?: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  vendorId: string;
  vendorName?: string;
  billNumber?: string;
  purchaseDate: string;
  amountPaise: number;
  paidNowPaise: number;
  dueDate?: string;
  paymentMode?: PaymentMode;
  note?: string;
  deletedAt?: string;
  createdAt: string;
}

export interface VendorPayment {
  id: string;
  vendorId: string;
  vendorName?: string;
  paymentDate: string;
  amountPaise: number;
  mode: PaymentMode;
  reference?: string;
  note?: string;
  deletedAt?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  expenseDate: string;
  category: string;
  amountPaise: number;
  mode: PaymentMode;
  note?: string;
  isRecurring: boolean;
  deletedAt?: string;
  createdAt: string;
}

export interface Followup {
  id: string;
  customerId?: string;
  personName: string;
  phone?: string;
  segment?: CustomerSegment;
  requirement: string;
  estimatedValuePaise?: number;
  status: FollowupStatus;
  followUpAt: string; // ISO string
  notes?: string;
  completedAt?: string;
  deletedAt?: string;
  createdAt: string;
}

export interface PromiseToPay {
  id: string;
  customerId: string;
  customerName?: string;
  amountPaise: number;
  promisedFor: string; // YYYY-MM-DD
  note?: string;
  status: 'open' | 'fulfilled' | 'cancelled';
  fulfilledAt?: string;
  createdAt: string;
}

export interface CashClose {
  id: string;
  date: string; // YYYY-MM-DD
  openingCashPaise: number;
  cashSalesPaise: number;
  cashCollectionsPaise: number;
  cashExpensesPaise: number;
  vendorCashPaymentsPaise: number;
  expectedCashPaise: number;
  actualCashPaise: number;
  diffPaise: number;
  note?: string;
  closedAt: string;
}

export interface BusinessAlert {
  id: string;
  alertType: AlertType;
  severity: AlertSeverity;
  customerId?: string;
  customerName?: string;
  vendorId?: string;
  vendorName?: string;
  followupId?: string;
  promiseId?: string;
  title: string;
  body: string;
  dueAt: string;
  status: 'open' | 'snoozed' | 'completed';
  snoozedUntil?: string;
  amountPaise?: number;
}

export interface SyncMutation {
  id: string;
  action: 'insert' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: string;
  status: 'pending' | 'syncing' | 'failed' | 'synced';
  retryCount: number;
  lastError?: string;
}
