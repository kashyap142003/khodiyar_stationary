import {
  Customer,
  Vendor,
  Sale,
  CustomerPayment,
  CustomerAdjustment,
  Purchase,
  VendorPayment,
  Expense,
  BusinessAlert,
  Followup,
  PromiseToPay,
} from '../types';
import { differenceInDays, parseISO, isToday, isBefore, startOfDay } from 'date-fns';

export interface CustomerFinancials {
  balancePaise: number;
  totalSalesPaise: number;
  creditGivenPaise: number;
  totalPaymentsPaise: number;
  totalAdjustmentsPaise: number;
  lastPurchaseDate?: string;
  lastPaymentDate?: string;
  oldestDueDays: number;
  ageing: {
    bucket0to7: number;
    bucket8to30: number;
    bucket31to60: number;
    bucket60plus: number;
  };
  creditLimitExceeded: boolean;
}

export function calculateCustomerFinancials(
  customer: Customer,
  sales: Sale[],
  payments: CustomerPayment[],
  adjustments: CustomerAdjustment[]
): CustomerFinancials {
  const custSales = sales.filter(s => s.customerId === customer.id && !s.deletedAt);
  const custPayments = payments.filter(p => p.customerId === customer.id && !p.deletedAt);
  const custAdjustments = adjustments.filter(a => a.customerId === customer.id && !a.deletedAt);

  let creditSalesPaise = 0;
  let totalSalesPaise = 0;
  let lastPurchaseDate: string | undefined;

  // Sorted by date asc for FIFO
  const sortedSales = [...custSales].sort((a, b) => new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime());
  for (const s of sortedSales) {
    totalSalesPaise += s.totalPaise;
    creditSalesPaise += s.creditPaise;
    lastPurchaseDate = s.saleDate;
  }

  let totalPaymentsPaise = 0;
  let lastPaymentDate: string | undefined;
  const sortedPayments = [...custPayments].sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());
  for (const p of sortedPayments) {
    totalPaymentsPaise += p.amountPaise;
    lastPaymentDate = p.paymentDate;
  }

  let totalAdjustmentsPaise = 0;
  for (const a of custAdjustments) {
    totalAdjustmentsPaise += a.amountPaise;
  }

  // Customer Balance = Opening Balance + Customer Credit Sales − Customer Payments − Adjustments
  const balancePaise = customer.openingBalancePaise + creditSalesPaise - totalPaymentsPaise - totalAdjustmentsPaise;

  // Ageing Calculation (FIFO)
  let paymentPool = totalPaymentsPaise + totalAdjustmentsPaise;
  let oldestDueDays = 0;
  const today = new Date();

  const ageing = {
    bucket0to7: 0,
    bucket8to30: 0,
    bucket31to60: 0,
    bucket60plus: 0,
  };

  // Opening balance treated as oldest charge
  let openingRem = customer.openingBalancePaise;
  if (openingRem > 0) {
    if (paymentPool >= openingRem) {
      paymentPool -= openingRem;
      openingRem = 0;
    } else {
      openingRem -= paymentPool;
      paymentPool = 0;
      const opDate = customer.openingBalanceDate ? parseISO(customer.openingBalanceDate) : new Date(2026, 8, 1);
      const days = differenceInDays(today, opDate);
      if (days > oldestDueDays) oldestDueDays = days;
      ageing.bucket60plus += openingRem;
    }
  }

  // Apply remaining payment pool to credit sales FIFO
  for (const s of sortedSales) {
    if (s.creditPaise <= 0) continue;
    let rem = s.creditPaise;
    if (paymentPool >= rem) {
      paymentPool -= rem;
      rem = 0;
    } else {
      rem -= paymentPool;
      paymentPool = 0;
      const days = differenceInDays(today, parseISO(s.saleDate));
      if (days > oldestDueDays) oldestDueDays = days;

      if (days <= 7) ageing.bucket0to7 += rem;
      else if (days <= 30) ageing.bucket8to30 += rem;
      else if (days <= 60) ageing.bucket31to60 += rem;
      else ageing.bucket60plus += rem;
    }
  }

  const creditLimitExceeded = customer.creditLimitPaise ? balancePaise > customer.creditLimitPaise : false;

  return {
    balancePaise,
    totalSalesPaise,
    creditGivenPaise: creditSalesPaise,
    totalPaymentsPaise,
    totalAdjustmentsPaise,
    lastPurchaseDate,
    lastPaymentDate,
    oldestDueDays,
    ageing,
    creditLimitExceeded,
  };
}

export function calculateVendorBalance(
  vendor: Vendor,
  purchases: Purchase[],
  payments: VendorPayment[]
): {
  balancePaise: number;
  totalPurchasesPaise: number;
  totalPaymentsPaise: number;
  oldestDueDays: number;
} {
  const vendPurchases = purchases.filter(p => p.vendorId === vendor.id && !p.deletedAt);
  const vendPayments = payments.filter(p => p.vendorId === vendor.id && !p.deletedAt);

  let totalPurchasesPaise = 0;
  for (const p of vendPurchases) {
    totalPurchasesPaise += p.amountPaise;
  }

  let totalPaymentsPaise = 0;
  for (const vp of vendPayments) {
    totalPaymentsPaise += vp.amountPaise;
  }

  // Vendor Balance = Opening Balance + Purchases − Vendor Payments
  const balancePaise = vendor.openingBalancePaise + totalPurchasesPaise - totalPaymentsPaise;

  return {
    balancePaise,
    totalPurchasesPaise,
    totalPaymentsPaise,
    oldestDueDays: 14,
  };
}

export interface TodayMetrics {
  totalSalesPaise: number;
  cashSalesPaise: number;
  upiSalesPaise: number;
  creditGivenPaise: number;
  collectionsPaise: number;
  expensesPaise: number;
}

export function calculateTodayMetrics(
  sales: Sale[],
  customerPayments: CustomerPayment[],
  expenses: Expense[]
): TodayMetrics {
  let totalSalesPaise = 0;
  let cashSalesPaise = 0;
  let upiSalesPaise = 0;
  let creditGivenPaise = 0;
  let collectionsPaise = 0;
  let expensesPaise = 0;

  for (const s of sales) {
    if (s.deletedAt) continue;
    if (isToday(parseISO(s.saleDate))) {
      totalSalesPaise += s.totalPaise;
      cashSalesPaise += s.cashPaise;
      upiSalesPaise += s.upiPaise;
      creditGivenPaise += s.creditPaise;
    }
  }

  for (const p of customerPayments) {
    if (p.deletedAt) continue;
    if (isToday(parseISO(p.paymentDate))) {
      collectionsPaise += p.amountPaise;
    }
  }

  for (const e of expenses) {
    if (e.deletedAt) continue;
    if (isToday(parseISO(e.expenseDate))) {
      expensesPaise += e.amountPaise;
    }
  }

  return {
    totalSalesPaise,
    cashSalesPaise,
    upiSalesPaise,
    creditGivenPaise,
    collectionsPaise,
    expensesPaise,
  };
}

export interface DashboardMetrics {
  totalSalesPaise: number;
  collectionsPaise: number;
  creditGivenPaise: number;
  toCollectPaise: number;
  toPayPaise: number;
  approxProfitPaise: number;
  collectionRatePct: number | null;
  cashOnHandPaise: number;
  operationalPositionPaise: number;
  ageingTotals: {
    bucket0to7: number;
    bucket8to30: number;
    bucket31to60: number;
    bucket60plus: number;
  };
}

export function calculateDashboardMetrics(
  customers: Customer[],
  vendors: Vendor[],
  sales: Sale[],
  customerPayments: CustomerPayment[],
  adjustments: CustomerAdjustment[],
  purchases: Purchase[],
  vendorPayments: VendorPayment[],
  expenses: Expense[],
  openingCashPaise: number = 500000
): DashboardMetrics {
  let totalSalesPaise = 0;
  let creditGivenPaise = 0;
  for (const s of sales) {
    if (!s.deletedAt) {
      totalSalesPaise += s.totalPaise;
      creditGivenPaise += s.creditPaise;
    }
  }

  let collectionsPaise = 0;
  let cashCollectionsPaise = 0;
  for (const cp of customerPayments) {
    if (!cp.deletedAt) {
      collectionsPaise += cp.amountPaise;
      if (cp.mode === 'cash') cashCollectionsPaise += cp.amountPaise;
    }
  }

  let totalPurchasesPaise = 0;
  for (const p of purchases) {
    if (!p.deletedAt) totalPurchasesPaise += p.amountPaise;
  }

  let totalExpensesPaise = 0;
  let cashExpensesPaise = 0;
  for (const e of expenses) {
    if (!e.deletedAt) {
      totalExpensesPaise += e.amountPaise;
      if (e.mode === 'cash') cashExpensesPaise += e.amountPaise;
    }
  }

  let cashSalesPaise = 0;
  for (const s of sales) {
    if (!s.deletedAt) cashSalesPaise += s.cashPaise;
  }

  let vendorCashPaymentsPaise = 0;
  for (const vp of vendorPayments) {
    if (!vp.deletedAt && vp.mode === 'cash') {
      vendorCashPaymentsPaise += vp.amountPaise;
    }
  }

  // To Collect (Sum of positive customer balances)
  let toCollectPaise = 0;
  const ageingTotals = {
    bucket0to7: 0,
    bucket8to30: 0,
    bucket31to60: 0,
    bucket60plus: 0,
  };
  let totalOpeningReceivables = 0;

  for (const c of customers) {
    if (c.isArchived) continue;
    totalOpeningReceivables += c.openingBalancePaise;
    const fin = calculateCustomerFinancials(c, sales, customerPayments, adjustments);
    if (fin.balancePaise > 0) {
      toCollectPaise += fin.balancePaise;
      ageingTotals.bucket0to7 += fin.ageing.bucket0to7;
      ageingTotals.bucket8to30 += fin.ageing.bucket8to30;
      ageingTotals.bucket31to60 += fin.ageing.bucket31to60;
      ageingTotals.bucket60plus += fin.ageing.bucket60plus;
    }
  }

  // To Pay (Sum of positive vendor balances)
  let toPayPaise = 0;
  for (const v of vendors) {
    if (v.isArchived) continue;
    const vFin = calculateVendorBalance(v, purchases, vendorPayments);
    if (vFin.balancePaise > 0) {
      toPayPaise += vFin.balancePaise;
    }
  }

  // Approx. Profit = Sales − Purchases − Expenses
  const approxProfitPaise = totalSalesPaise - totalPurchasesPaise - totalExpensesPaise;

  // Collection Rate = Customer Collections ÷ (Opening Receivables + Credit Given) * 100
  const collectionDenominator = totalOpeningReceivables + creditGivenPaise;
  const collectionRatePct = collectionDenominator > 0
    ? Math.min(100, Math.round((collectionsPaise / collectionDenominator) * 100))
    : null;

  // Cash on Hand (Operational)
  const cashOnHandPaise = openingCashPaise + cashSalesPaise + cashCollectionsPaise - cashExpensesPaise - vendorCashPaymentsPaise;

  // Operational Position = Cash + Receivables - Payables
  const operationalPositionPaise = cashOnHandPaise + toCollectPaise - toPayPaise;

  return {
    totalSalesPaise,
    collectionsPaise,
    creditGivenPaise,
    toCollectPaise,
    toPayPaise,
    approxProfitPaise,
    collectionRatePct,
    cashOnHandPaise,
    operationalPositionPaise,
    ageingTotals,
  };
}

export function generateAlerts(
  customers: Customer[],
  vendors: Vendor[],
  sales: Sale[],
  payments: CustomerPayment[],
  adjustments: CustomerAdjustment[],
  followups: Followup[],
  promises: PromiseToPay[],
  lang: 'en' | 'gu' = 'gu'
): BusinessAlert[] {
  const alerts: BusinessAlert[] = [];
  const today = startOfDay(new Date());
  const isGu = lang === 'gu';

  // 1. Customer Overdue & High Credit Alerts
  for (const c of customers) {
    if (c.isArchived) continue;
    const fin = calculateCustomerFinancials(c, sales, payments, adjustments);
    if (fin.balancePaise > 0) {
      if (fin.oldestDueDays >= 30) {
        alerts.push({
          id: `alert_cust_overdue_${c.id}`,
          alertType: 'customer_overdue',
          severity: fin.oldestDueDays >= 60 ? 'critical' : 'warning',
          customerId: c.id,
          customerName: c.name,
          title: isGu
            ? `${c.name} - ${fin.oldestDueDays} દિવસથી બાકી`
            : `${c.name} is ${fin.oldestDueDays} days overdue`,
          body: isGu
            ? `બાકી રકમ: ₹${(fin.balancePaise / 100).toLocaleString('en-IN')}. સૌથી જૂનું બિલ ${fin.oldestDueDays} દિવસ પહેલાનું છે.`
            : `Pending balance: ₹${(fin.balancePaise / 100).toLocaleString('en-IN')}. Oldest unpaid charge from ${fin.oldestDueDays} days ago.`,
          dueAt: new Date().toISOString(),
          status: 'open',
          amountPaise: fin.balancePaise,
        });
      }
      if (fin.creditLimitExceeded && c.creditLimitPaise) {
        alerts.push({
          id: `alert_cust_limit_${c.id}`,
          alertType: 'customer_credit_limit',
          severity: 'warning',
          customerId: c.id,
          customerName: c.name,
          title: isGu
            ? `${c.name} ની ઉધાર મર્યાદા વટી ગઈ`
            : `${c.name} exceeded credit limit`,
          body: isGu
            ? `બાકી રકમ ₹${(fin.balancePaise / 100).toLocaleString('en-IN')} નિયત મર્યાદા ₹${(c.creditLimitPaise / 100).toLocaleString('en-IN')} કરતાં વધુ છે.`
            : `Balance of ₹${(fin.balancePaise / 100).toLocaleString('en-IN')} exceeds credit limit of ₹${(c.creditLimitPaise / 100).toLocaleString('en-IN')}.`,
          dueAt: new Date().toISOString(),
          status: 'open',
          amountPaise: fin.balancePaise,
        });
      }
    }
  }

  // 2. Follow-ups Due
  for (const f of followups) {
    if (f.status === 'won' || f.status === 'lost' || f.completedAt) continue;
    const fDate = parseISO(f.followUpAt);
    if (isToday(fDate) || isBefore(fDate, today)) {
      alerts.push({
        id: `alert_fol_${f.id}`,
        alertType: 'followup_due',
        severity: isBefore(fDate, today) ? 'critical' : 'info',
        followupId: f.id,
        title: isGu ? `ફોલો-અપ: ${f.personName}` : `Follow-up: ${f.personName}`,
        body: `${f.requirement} (${isGu ? 'અંદાજિત' : 'Est.'} ₹${((f.estimatedValuePaise || 0) / 100).toLocaleString('en-IN')})`,
        dueAt: f.followUpAt,
        status: 'open',
        amountPaise: f.estimatedValuePaise,
      });
    }
  }

  // 3. Promises to Pay Due
  for (const p of promises) {
    if (p.status === 'open') {
      const pDate = parseISO(p.promisedFor);
      if (isToday(pDate) || isBefore(pDate, today)) {
        alerts.push({
          id: `alert_prom_${p.id}`,
          alertType: 'promise_due',
          severity: isBefore(pDate, today) ? 'critical' : 'warning',
          customerId: p.customerId,
          customerName: p.customerName,
          promiseId: p.id,
          title: isGu ? `વાયદો (ચુકવણી): ${p.customerName}` : `Promise to Pay: ${p.customerName}`,
          body: isGu
            ? `તારીખ ${p.promisedFor} ના રોજ ₹${(p.amountPaise / 100).toLocaleString('en-IN')} આપવાનો વાયદો હતો. ${p.note || ''}`
            : `Promised ₹${(p.amountPaise / 100).toLocaleString('en-IN')} on ${p.promisedFor}. ${p.note || ''}`,
          dueAt: p.promisedFor,
          status: 'open',
          amountPaise: p.amountPaise,
        });
      }
    }
  }

  return alerts;
}
