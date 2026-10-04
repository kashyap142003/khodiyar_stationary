import {
  BusinessProfile,
  Customer,
  Vendor,
  Sale,
  CustomerPayment,
  CustomerAdjustment,
  Purchase,
  VendorPayment,
  Expense,
  Followup,
  PromiseToPay,
  CashClose,
  SyncMutation,
} from '../types';
import { getGoogleSheetsConfig, syncToGoogleSheets, fetchFromGoogleSheets } from './googleSheets';

const STORAGE_KEY_PREFIX = 'shopbook_v2_';

const DEFAULT_BUSINESS: BusinessProfile = {
  id: 'biz_01',
  name: 'Khodiyar Stationery',
  phone: '',
  address: '',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  locale: 'gu-IN',
  language: 'gu',
  openingCashPaise: 0,
};

const DEFAULT_CUSTOMERS: Customer[] = [];
const DEFAULT_VENDORS: Vendor[] = [];
const DEFAULT_SALES: Sale[] = [];
const DEFAULT_CUSTOMER_PAYMENTS: CustomerPayment[] = [];
const DEFAULT_CUSTOMER_ADJUSTMENTS: CustomerAdjustment[] = [];
const DEFAULT_PURCHASES: Purchase[] = [];
const DEFAULT_VENDOR_PAYMENTS: VendorPayment[] = [];
const DEFAULT_EXPENSES: Expense[] = [];
const DEFAULT_FOLLOWUPS: Followup[] = [];
const DEFAULT_PROMISES: PromiseToPay[] = [];
const DEFAULT_CASH_CLOSES: CashClose[] = [];

// One-time automatic purge of previous cached sample data so the browser starts 100% clean
const PURGE_SAMPLE_KEY = 'shopbook_v2_sample_data_cleared_v4';
if (typeof window !== 'undefined' && localStorage.getItem(PURGE_SAMPLE_KEY) !== 'true') {
  localStorage.removeItem(STORAGE_KEY_PREFIX + 'customers');
  localStorage.removeItem(STORAGE_KEY_PREFIX + 'vendors');
  localStorage.removeItem(STORAGE_KEY_PREFIX + 'sales');
  localStorage.removeItem(STORAGE_KEY_PREFIX + 'customer_payments');
  localStorage.removeItem(STORAGE_KEY_PREFIX + 'customer_adjustments');
  localStorage.removeItem(STORAGE_KEY_PREFIX + 'purchases');
  localStorage.removeItem(STORAGE_KEY_PREFIX + 'vendor_payments');
  localStorage.removeItem(STORAGE_KEY_PREFIX + 'expenses');
  localStorage.removeItem(STORAGE_KEY_PREFIX + 'followups');
  localStorage.removeItem(STORAGE_KEY_PREFIX + 'promises');
  localStorage.removeItem(STORAGE_KEY_PREFIX + 'cash_closes');
  localStorage.removeItem(STORAGE_KEY_PREFIX + 'sync_queue');
  localStorage.setItem(PURGE_SAMPLE_KEY, 'true');
}

// Helper to load or initialize from localStorage
function getOrInit<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!item) {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(item);
  } catch (e) {
    console.error(`Failed to load ${key}`, e);
    return defaultVal;
  }
}

function saveItem<T>(key: string, value: T): void {
  localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  window.dispatchEvent(new Event('shopbook_storage_updated'));
}

// Queue a mutation for Google Sheets background sync
function queueSync(action: 'insert' | 'update' | 'delete', table: string, data: any) {
  const mutations: SyncMutation[] = getOrInit<SyncMutation[]>('sync_queue', []);
  const mutation: SyncMutation = {
    id: 'mut_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    action,
    table,
    data,
    timestamp: new Date().toISOString(),
    status: 'pending',
    retryCount: 0,
  };
  mutations.push(mutation);
  saveItem('sync_queue', mutations);

  // Trigger auto sync if config has webAppUrl
  const config = getGoogleSheetsConfig();
  if (config.webAppUrl && config.isAutoSyncEnabled) {
    setTimeout(() => {
      triggerGoogleSheetsSync();
    }, 500);
  }
}

// Core Store Accessors
export const StorageService = {
  getBusiness: (): BusinessProfile => {
    const biz = getOrInit<BusinessProfile>('business', DEFAULT_BUSINESS);
    if (!biz.name || biz.name.includes('Shree Ganesh') || biz.name.includes('Ganesh')) {
      biz.name = 'Khodiyar Stationery';
      biz.address = 'Shop 4, Sardar Complex, Station Road';
      saveItem('business', biz);
    }
    return biz;
  },
  saveBusiness: (data: BusinessProfile) => {
    saveItem('business', data);
    queueSync('update', 'business', data);
  },

  getCustomers: (): Customer[] => getOrInit('customers', DEFAULT_CUSTOMERS),
  saveCustomer: (customer: Customer) => {
    const list = StorageService.getCustomers();
    const idx = list.findIndex(c => c.id === customer.id);
    if (idx >= 0) {
      list[idx] = customer;
      queueSync('update', 'customers', customer);
    } else {
      list.unshift(customer);
      queueSync('insert', 'customers', customer);
    }
    saveItem('customers', list);
  },

  getOrCreateCustomerByName: (name: string, phone?: string): Customer => {
    const list = StorageService.getCustomers();
    const trimmed = name.trim();
    const existing = list.find(c => c.name.toLowerCase() === trimmed.toLowerCase() && !c.isArchived);
    if (existing) {
      if (phone && phone.trim() && !existing.phone) {
        existing.phone = phone.trim();
        StorageService.saveCustomer(existing);
      }
      return existing;
    }
    const newCust: Customer = {
      id: 'cust_' + Date.now(),
      name: trimmed,
      phone: phone?.trim() || '',
      address: '',
      segment: 'Retail',
      openingBalancePaise: 0,
      openingBalanceDate: new Date().toISOString().split('T')[0],
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    StorageService.saveCustomer(newCust);
    return newCust;
  },

  getVendors: (): Vendor[] => getOrInit('vendors', DEFAULT_VENDORS),
  saveVendor: (vendor: Vendor) => {
    const list = StorageService.getVendors();
    const idx = list.findIndex(v => v.id === vendor.id);
    if (idx >= 0) {
      list[idx] = vendor;
      queueSync('update', 'vendors', vendor);
    } else {
      list.unshift(vendor);
      queueSync('insert', 'vendors', vendor);
    }
    saveItem('vendors', list);
  },

  getSales: (): Sale[] => getOrInit('sales', DEFAULT_SALES),
  addSale: (sale: Sale) => {
    const list = StorageService.getSales();
    list.unshift(sale);
    saveItem('sales', list);
    queueSync('insert', 'sales', sale);
  },

  getCustomerPayments: (): CustomerPayment[] => getOrInit('customer_payments', DEFAULT_CUSTOMER_PAYMENTS),
  addCustomerPayment: (payment: CustomerPayment) => {
    const list = StorageService.getCustomerPayments();
    list.unshift(payment);
    saveItem('customer_payments', list);
    queueSync('insert', 'customer_payments', payment);

    // Auto fulfill any matching promise to pay
    const promises = StorageService.getPromisesToPay();
    const match = promises.find(p => p.customerId === payment.customerId && p.status === 'open');
    if (match) {
      match.status = 'fulfilled';
      match.fulfilledAt = new Date().toISOString();
      saveItem('promises', promises);
      queueSync('update', 'promises', match);
    }
  },

  getCustomerAdjustments: (): CustomerAdjustment[] => getOrInit('customer_adjustments', []),
  addCustomerAdjustment: (adj: CustomerAdjustment) => {
    const list = StorageService.getCustomerAdjustments();
    list.unshift(adj);
    saveItem('customer_adjustments', list);
    queueSync('insert', 'customer_adjustments', adj);
  },

  getPurchases: (): Purchase[] => getOrInit('purchases', DEFAULT_PURCHASES),
  addPurchase: (purchase: Purchase) => {
    const list = StorageService.getPurchases();
    list.unshift(purchase);
    saveItem('purchases', list);
    queueSync('insert', 'purchases', purchase);
  },

  getVendorPayments: (): VendorPayment[] => getOrInit('vendor_payments', DEFAULT_VENDOR_PAYMENTS),
  addVendorPayment: (payment: VendorPayment) => {
    const list = StorageService.getVendorPayments();
    list.unshift(payment);
    saveItem('vendor_payments', list);
    queueSync('insert', 'vendor_payments', payment);
  },

  getExpenses: (): Expense[] => getOrInit('expenses', DEFAULT_EXPENSES),
  addExpense: (expense: Expense) => {
    const list = StorageService.getExpenses();
    list.unshift(expense);
    saveItem('expenses', list);
    queueSync('insert', 'expenses', expense);
  },

  getFollowups: (): Followup[] => getOrInit('followups', DEFAULT_FOLLOWUPS),
  saveFollowup: (followup: Followup) => {
    const list = StorageService.getFollowups();
    const idx = list.findIndex(f => f.id === followup.id);
    if (idx >= 0) {
      list[idx] = followup;
      queueSync('update', 'followups', followup);
    } else {
      list.unshift(followup);
      queueSync('insert', 'followups', followup);
    }
    saveItem('followups', list);
  },

  getPromisesToPay: (): PromiseToPay[] => getOrInit('promises', DEFAULT_PROMISES),
  savePromiseToPay: (promise: PromiseToPay) => {
    const list = StorageService.getPromisesToPay();
    const idx = list.findIndex(p => p.id === promise.id);
    if (idx >= 0) {
      list[idx] = promise;
      queueSync('update', 'promises', promise);
    } else {
      list.unshift(promise);
      queueSync('insert', 'promises', promise);
    }
    saveItem('promises', list);
  },

  getCashCloses: (): CashClose[] => getOrInit('cash_closes', []),
  addCashClose: (cashClose: CashClose) => {
    const list = StorageService.getCashCloses();
    list.unshift(cashClose);
    saveItem('cash_closes', list);
    queueSync('insert', 'cash_closes', cashClose);
  },

  getSyncQueue: (): SyncMutation[] => getOrInit('sync_queue', []),
  clearSyncQueue: () => saveItem('sync_queue', []),

  // Privacy Eye Mode State
  isPrivacyMode: (): boolean => {
    return localStorage.getItem('shopbook_privacy_mode') === 'true';
  },
  togglePrivacyMode: (): boolean => {
    const current = StorageService.isPrivacyMode();
    const next = !current;
    localStorage.setItem('shopbook_privacy_mode', next ? 'true' : 'false');
    window.dispatchEvent(new Event('shopbook_privacy_updated'));
    return next;
  },

  // Reset to default sample data
  resetSampleData: () => {
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'business');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'customers');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'vendors');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'sales');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'customer_payments');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'customer_adjustments');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'purchases');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'vendor_payments');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'expenses');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'followups');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'promises');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'cash_closes');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'sync_queue');
    window.dispatchEvent(new Event('shopbook_storage_updated'));
  },

  // Full snapshot payload for Google Sheets
  getFullSnapshot: () => {
    return {
      business: StorageService.getBusiness(),
      customers: StorageService.getCustomers(),
      vendors: StorageService.getVendors(),
      sales: StorageService.getSales(),
      customerPayments: StorageService.getCustomerPayments(),
      customerAdjustments: StorageService.getCustomerAdjustments(),
      purchases: StorageService.getPurchases(),
      vendorPayments: StorageService.getVendorPayments(),
      expenses: StorageService.getExpenses(),
      followups: StorageService.getFollowups(),
      promises: StorageService.getPromisesToPay(),
      cashCloses: StorageService.getCashCloses(),
    };
  },

  // Merge remote data from Google Sheets safely into local storage
  mergeRemoteSnapshot: (remoteData: any) => {
    if (!remoteData || typeof remoteData !== 'object') return;

    const parseNum = (v: any, fallback = 0): number => {
      const n = Number(v);
      return isNaN(n) ? fallback : n;
    };

    const mergeList = <T extends { id: string }>(
      storageKey: string,
      currentList: T[],
      remoteItems: any[],
      sanitizer: (item: any) => T
    ) => {
      if (!Array.isArray(remoteItems)) return;
      if (remoteItems.length === 0) {
        saveItem(storageKey, []);
        return;
      }
      const map = new Map<string, T>();
      currentList.forEach(item => map.set(item.id, item));
      remoteItems.forEach(item => {
        if (item && item.id) {
          const sanitized = sanitizer(item);
          map.set(item.id, sanitized);
        }
      });
      const merged = Array.from(map.values());
      saveItem(storageKey, merged);
    };

    if (remoteData.customers) {
      mergeList('customers', StorageService.getCustomers(), remoteData.customers, (c) => ({
        id: String(c.id),
        name: String(c.name || ''),
        phone: String(c.phone || ''),
        address: String(c.address || ''),
        segment: c.segment || 'Retail',
        creditLimitPaise: parseNum(c.creditLimitPaise),
        openingBalancePaise: parseNum(c.openingBalancePaise),
        openingBalanceDate: c.openingBalanceDate || new Date().toISOString().split('T')[0],
        notes: c.notes || '',
        isArchived: Boolean(c.isArchived),
        createdAt: c.createdAt || new Date().toISOString(),
        updatedAt: c.updatedAt || new Date().toISOString(),
      }));
    }

    if (remoteData.vendors) {
      mergeList('vendors', StorageService.getVendors(), remoteData.vendors, (v) => ({
        id: String(v.id),
        name: String(v.name || ''),
        phone: String(v.phone || ''),
        address: String(v.address || ''),
        paymentTermsDays: parseNum(v.paymentTermsDays, 30),
        openingBalancePaise: parseNum(v.openingBalancePaise),
        openingBalanceDate: v.openingBalanceDate || new Date().toISOString().split('T')[0],
        notes: v.notes || '',
        isArchived: Boolean(v.isArchived),
        createdAt: v.createdAt || new Date().toISOString(),
        updatedAt: v.updatedAt || new Date().toISOString(),
      }));
    }

    if (remoteData.sales) {
      mergeList('sales', StorageService.getSales(), remoteData.sales, (s) => ({
        id: String(s.id),
        customerId: s.customerId ? String(s.customerId) : undefined,
        customerName: s.customerName ? String(s.customerName) : undefined,
        saleType: s.saleType || 'walk_in',
        saleDate: s.saleDate || new Date().toISOString().split('T')[0],
        totalPaise: parseNum(s.totalPaise),
        cashPaise: parseNum(s.cashPaise),
        upiPaise: parseNum(s.upiPaise),
        otherPaidPaise: parseNum(s.otherPaidPaise),
        creditPaise: parseNum(s.creditPaise),
        note: s.note || '',
        source: s.source || 'import',
        createdAt: s.createdAt || new Date().toISOString(),
      }));
    }

    if (remoteData.customerPayments) {
      mergeList('customer_payments', StorageService.getCustomerPayments(), remoteData.customerPayments, (p) => ({
        id: String(p.id),
        customerId: String(p.customerId),
        customerName: p.customerName ? String(p.customerName) : undefined,
        paymentDate: p.paymentDate || new Date().toISOString().split('T')[0],
        amountPaise: parseNum(p.amountPaise),
        mode: p.mode || 'cash',
        reference: p.reference || '',
        note: p.note || '',
        source: p.source || 'import',
        createdAt: p.createdAt || new Date().toISOString(),
      }));
    }

    if (remoteData.customerAdjustments) {
      mergeList('customer_adjustments', StorageService.getCustomerAdjustments(), remoteData.customerAdjustments, (a) => ({
        id: String(a.id),
        customerId: String(a.customerId),
        customerName: a.customerName ? String(a.customerName) : undefined,
        adjustmentType: a.adjustmentType || 'discount',
        amountPaise: parseNum(a.amountPaise),
        adjustmentDate: a.adjustmentDate || new Date().toISOString().split('T')[0],
        reason: a.reason || '',
        createdAt: a.createdAt || new Date().toISOString(),
      }));
    }

    if (remoteData.purchases) {
      mergeList('purchases', StorageService.getPurchases(), remoteData.purchases, (p) => ({
        id: String(p.id),
        vendorId: String(p.vendorId),
        vendorName: p.vendorName ? String(p.vendorName) : undefined,
        billNumber: p.billNumber || '',
        purchaseDate: p.purchaseDate || new Date().toISOString().split('T')[0],
        amountPaise: parseNum(p.amountPaise),
        paidNowPaise: parseNum(p.paidNowPaise),
        dueDate: p.dueDate || '',
        paymentMode: p.paymentMode || 'cash',
        note: p.note || '',
        createdAt: p.createdAt || new Date().toISOString(),
      }));
    }

    if (remoteData.vendorPayments) {
      mergeList('vendor_payments', StorageService.getVendorPayments(), remoteData.vendorPayments, (vp) => ({
        id: String(vp.id),
        vendorId: String(vp.vendorId),
        vendorName: vp.vendorName ? String(vp.vendorName) : undefined,
        paymentDate: vp.paymentDate || new Date().toISOString().split('T')[0],
        amountPaise: parseNum(vp.amountPaise),
        mode: vp.mode || 'cash',
        reference: vp.reference || '',
        note: vp.note || '',
        createdAt: vp.createdAt || new Date().toISOString(),
      }));
    }

    if (remoteData.expenses) {
      mergeList('expenses', StorageService.getExpenses(), remoteData.expenses, (e) => ({
        id: String(e.id),
        expenseDate: e.expenseDate || new Date().toISOString().split('T')[0],
        category: e.category || 'General',
        amountPaise: parseNum(e.amountPaise),
        mode: e.mode || 'cash',
        note: e.note || '',
        isRecurring: Boolean(e.isRecurring),
        createdAt: e.createdAt || new Date().toISOString(),
      }));
    }

    if (remoteData.followups) {
      mergeList('followups', StorageService.getFollowups(), remoteData.followups, (f) => ({
        id: String(f.id),
        personName: f.personName || '',
        phone: f.phone || '',
        segment: f.segment || 'Retail',
        requirement: f.requirement || '',
        estimatedValuePaise: parseNum(f.estimatedValuePaise),
        status: f.status || 'new',
        followUpAt: f.followUpAt || new Date().toISOString(),
        notes: f.notes || '',
        createdAt: f.createdAt || new Date().toISOString(),
      }));
    }

    if (remoteData.promises) {
      mergeList('promises', StorageService.getPromisesToPay(), remoteData.promises, (pr) => ({
        id: String(pr.id),
        customerId: String(pr.customerId),
        customerName: pr.customerName ? String(pr.customerName) : undefined,
        amountPaise: parseNum(pr.amountPaise),
        promisedFor: pr.promisedFor || new Date().toISOString().split('T')[0],
        note: pr.note || '',
        status: pr.status || 'open',
        createdAt: pr.createdAt || new Date().toISOString(),
      }));
    }

    if (remoteData.cashCloses) {
      mergeList('cash_closes', StorageService.getCashCloses(), remoteData.cashCloses, (cc) => ({
        id: String(cc.id),
        date: cc.date || new Date().toISOString().split('T')[0],
        openingCashPaise: parseNum(cc.openingCashPaise),
        cashSalesPaise: parseNum(cc.cashSalesPaise),
        cashCollectionsPaise: parseNum(cc.cashCollectionsPaise),
        cashExpensesPaise: parseNum(cc.cashExpensesPaise),
        vendorCashPaymentsPaise: parseNum(cc.vendorCashPaymentsPaise),
        expectedCashPaise: parseNum(cc.expectedCashPaise),
        actualCashPaise: parseNum(cc.actualCashPaise),
        diffPaise: parseNum(cc.diffPaise),
        note: cc.note || '',
        closedAt: cc.closedAt || new Date().toISOString(),
      }));
    }

    window.dispatchEvent(new Event('shopbook_storage_updated'));
  }
};

/**
 * Triggers batch or full sync to Google Sheets (Push)
 */
export async function triggerGoogleSheetsSync(): Promise<{ success: boolean; message: string }> {
  const config = getGoogleSheetsConfig();
  if (!config.webAppUrl) {
    return { success: false, message: 'Google Sheets URL not configured in Settings' };
  }

  const snapshot = StorageService.getFullSnapshot();
  const res = await syncToGoogleSheets(config.webAppUrl, {
    action: 'full_backup',
    data: snapshot,
  });

  if (res.success) {
    StorageService.clearSyncQueue();
    config.lastSyncedAt = new Date().toISOString();
    localStorage.setItem('shopbook_google_sheets_config', JSON.stringify(config));
    window.dispatchEvent(new Event('shopbook_sync_updated'));
  }

  return res;
}

/**
 * Fetches latest updates from Google Sheets and merges into local storage (Pull)
 */
export async function triggerGoogleSheetsFetch(): Promise<{ success: boolean; message: string }> {
  const config = getGoogleSheetsConfig();
  if (!config.webAppUrl) {
    return { success: false, message: 'Google Sheets URL not configured in Settings' };
  }

  const res = await fetchFromGoogleSheets(config.webAppUrl);
  if (res.success && res.data) {
    StorageService.mergeRemoteSnapshot(res.data);
    config.lastSyncedAt = new Date().toISOString();
    localStorage.setItem('shopbook_google_sheets_config', JSON.stringify(config));
    window.dispatchEvent(new Event('shopbook_sync_updated'));
  }

  return res;
}

/**
 * Runs a 2-way bi-directional sync: pushes any local unsynced mutations, then pulls latest sheets data
 */
export async function triggerBidirectionalSync(): Promise<{ success: boolean; message: string }> {
  const pushRes = await triggerGoogleSheetsSync();
  const pullRes = await triggerGoogleSheetsFetch();
  return {
    success: pushRes.success || pullRes.success,
    message: `Push: ${pushRes.message} | Pull: ${pullRes.message}`,
  };
}

let syncWorkerInterval: any = null;
let isWorkerSyncing = false;

/**
 * Starts continuous background synchronization worker (every 20s & on focus)
 */
export function startBackgroundSyncWorker(): () => void {
  const runWorkerSync = async () => {
    if (isWorkerSyncing) return;
    const config = getGoogleSheetsConfig();
    if (!config.isAutoSyncEnabled || !config.webAppUrl) return;

    try {
      isWorkerSyncing = true;
      const queue = StorageService.getSyncQueue();
      if (queue.length > 0) {
        await triggerGoogleSheetsSync();
      } else {
        await triggerGoogleSheetsFetch();
      }
    } catch (e) {
      console.warn('Background sync worker loop notice:', e);
    } finally {
      isWorkerSyncing = false;
    }
  };

  // Immediate sync on tab visibility or network reconnect
  const handleVisibilityOrOnline = () => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
      runWorkerSync();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityOrOnline);
  window.addEventListener('online', handleVisibilityOrOnline);

  // Poll loop every 20 seconds
  if (!syncWorkerInterval) {
    syncWorkerInterval = setInterval(runWorkerSync, 20000);
  }

  // Run first sync after 1.5 seconds
  setTimeout(runWorkerSync, 1500);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityOrOnline);
    window.removeEventListener('online', handleVisibilityOrOnline);
    if (syncWorkerInterval) {
      clearInterval(syncWorkerInterval);
      syncWorkerInterval = null;
    }
  };
}
