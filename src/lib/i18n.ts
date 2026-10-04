export type Language = 'en' | 'gu';

export const translations = {
  en: {
    appName: 'Khodiyar Stationery',
    appSubtitle: 'Stationery Ledger & Collections',
    home: 'Home',
    sales: 'Sales',
    customers: 'Customers',
    vendors: 'Vendors',
    dashboard: 'Dashboard',
    followups: 'Follow-ups',
    reports: 'Reports',
    settings: 'Settings',
    quickAdd: 'Quick Add',
    
    // KPI names
    kpiSales: 'Sales',
    kpiCollections: 'Collections',
    kpiCreditGiven: 'Credit Given',
    kpiToCollect: 'To Collect',
    kpiToPay: 'To Pay',
    kpiApproxProfit: 'Approx. Profit',
    collectionRate: 'Collection Rate',
    approxProfitNote: 'Operational estimate (Sales − Purchases − Expenses). Not accounting-grade COGS.',
    
    // Actions
    walkInSale: 'Daily Counter Total',
    customerSale: 'School / Khata Sale',
    receivePayment: 'Receive Payment',
    newPurchase: 'New Purchase',
    payVendor: 'Pay Vendor',
    expense: 'Expense',
    cashClose: 'Daily Cash Close',
    newFollowup: 'New Follow-up',
    promiseToPay: 'Promise to Pay',
    call: 'Call',
    snooze: 'Snooze',
    reschedule: 'Reschedule',
    complete: 'Complete',
    statement: 'Statement',
    edit: 'Edit',
    archive: 'Archive',
    
    // Quick Sections
    todaySummary: "Today's Summary",
    needsAttention: 'Needs Attention',
    followupsDue: 'Follow-ups Due',
    todayActivity: "Today's Activity",
    
    // Common
    cash: 'Cash',
    upi: 'UPI',
    bank: 'Bank',
    cheque: 'Cheque',
    other: 'Other',
    save: 'Save Entry',
    cancel: 'Cancel',
    amount: 'Amount',
    date: 'Date',
    notes: 'Notes / Remarks',
    search: 'Search...',
    all: 'All',
    overdue: 'Overdue',
    dueSoon: 'Due Soon',
    advance: 'Advance',
    balance: 'Current Balance',
    newBalance: 'Resulting Balance',
    creditLimit: 'Credit Limit',
    
    // Extended Dashboard & Metrics
    operationalPosition: 'Operational Money Position',
    estimatedDrawerCash: 'Estimated Drawer Cash',
    customerReceivables: 'Customer Receivables (+)',
    supplierPayables: 'Supplier Payables (−)',
    receivableAgeing: 'Customer Receivable Ageing (FIFO)',
    expenseBreakdown: 'Shop Expense Breakdown',
    whatIsThis: 'What is this?',
    clickForInfo: 'Click for card details & guidance',

    // Google sheets & sync
    googleSheetsDb: 'Google Sheets Database',
    syncStatus: 'Sync Status',
    synced: 'Synced',
    pending: 'Pending Sync',
    syncNow: 'Sync to Sheets Now',
    privacyMode: 'Privacy Eye',
  },
  gu: {
    appName: 'ખોડિયાર સ્ટેશનરી',
    appSubtitle: 'સ્ટેશનરી ખાતાવહી અને ઉઘરાણી ડેશબોર્ડ',
    home: 'હોમ',
    sales: 'કુલ વેચાણ',
    customers: 'ગ્રાહકો',
    vendors: 'વેપારીઓ',
    dashboard: 'ડેશબોર્ડ',
    followups: 'ફોલો-અપ',
    reports: 'રિપોર્ટ્સ',
    settings: 'સેટિંગ્સ',
    quickAdd: 'ઝડપી એન્ટ્રી',
    
    // KPI names
    kpiSales: 'કુલ વેચાણ',
    kpiCollections: 'ઉઘરાણી આવક',
    kpiCreditGiven: 'ઉધાર આપેલ',
    kpiToCollect: 'લેવાના બાકી',
    kpiToPay: 'ચૂકવવાના બાકી',
    kpiApproxProfit: 'અંદાજિત નફો',
    collectionRate: 'ઉઘરાણી દર (%)',
    approxProfitNote: 'અંદાજિત હિસાબ (વેચાણ − ખરીદી − ખર્ચ). આ ચોખ્ખો ઓડિટેડ નફો નથી.',
    
    // Actions
    walkInSale: 'દૈનિક છૂટક વેચાણ (લમ્પસમ)',
    customerSale: 'સ્કૂલ / ખાતા વેચાણ (ઉધાર)',
    receivePayment: 'ઉઘરાણી જમા લો',
    newPurchase: 'નવી ખરીદી નોંધો',
    payVendor: 'વેપારીને ચૂકવણી',
    expense: 'દુકાન ખર્ચ',
    cashClose: 'રોજમેળ / કેશ મેળ',
    newFollowup: 'નવો ફોલો-અપ',
    promiseToPay: 'વાયદો (ચુકવણી તારીખ)',
    call: 'ફોન કરો',
    snooze: 'પાછળ ઠેલો',
    reschedule: 'નવી તારીખ આપો',
    complete: 'પૂર્ણ થયું',
    statement: 'ખાતાવહી સ્ટેટમેન્ટ',
    edit: 'સુધારો',
    archive: 'સંગ્રહિત કરો',
    
    // Quick Sections
    todaySummary: 'આજનો હિસાબ',
    needsAttention: 'ધ્યાન આપવાની જરૂરિયાત',
    followupsDue: 'આજના ફોલો-અપ',
    todayActivity: 'આજની લેવડદેવડ',
    
    // Common
    cash: 'રોકડા',
    upi: 'UPI / ઓનલાઇન',
    bank: 'બેંક ટ્રાન્સફર',
    cheque: 'ચેક',
    other: 'અન્ય',
    save: 'એન્ટ્રી સેવ કરો',
    cancel: 'રદ કરો',
    amount: 'રકમ (₹)',
    date: 'તારીખ',
    notes: 'નોંધ / વિગત',
    search: 'શોધો...',
    all: 'બધા',
    overdue: 'મુદત વીતી ગઈ',
    dueSoon: 'ટૂંક સમયમાં બાકી',
    advance: 'એડવાન્સ જમા',
    balance: 'હાલનું બાકી લેણું',
    newBalance: 'નવું બાકી લેણું',
    creditLimit: 'ઉધાર મર્યાદા',

    // Extended Dashboard & Metrics
    operationalPosition: 'ઓપરેશનલ કેશ પોઝિશન',
    estimatedDrawerCash: 'ગલ્લામાં અંદાજિત રોકડ',
    customerReceivables: 'ગ્રાહકો પાસેથી લેવાના (+)',
    supplierPayables: 'વેપારીઓને ચૂકવવાના (−)',
    receivableAgeing: 'ગ્રાહક બાકી મુદત વિશ્લેષણ (FIFO)',
    expenseBreakdown: 'દુકાન ખર્ચ વિશ્લેષણ',
    whatIsThis: 'આ શું છે?',
    clickForInfo: 'કાર્ડ સમજૂતી અને માર્ગદર્શન માટે ક્લિક કરો',
    
    // Google sheets & sync
    googleSheetsDb: 'ગૂગલ શીટ્સ ડેટાબેઝ',
    syncStatus: 'સિંક સ્થિતિ',
    synced: 'સિંક થયેલ છે',
    pending: 'બાકી સિંક',
    syncNow: 'હમણાં શીટ્સમાં સિંક કરો',
    privacyMode: 'પ્રાઇવસી આઇ',
  }
};

export function getTranslation(lang: Language = 'en') {
  return translations[lang] || translations.en;
}
