import React, { useState } from 'react';
import {
  TrendingUp,
  CreditCard,
  Clock,
  Users,
  Truck,
  DollarSign,
  Percent,
  Wallet,
  PieChart,
  BarChart3,
  Calendar,
  MessageSquare,
  Phone,
  ArrowRight,
  QrCode,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { Language, getTranslation } from '../lib/i18n';
import { formatINR } from '../lib/money';
import { StorageService } from '../services/storage';
import { calculateDashboardMetrics, calculateCustomerFinancials } from '../services/businessLogic';
import { PrivacyValue } from '../components/PrivacyValue';
import { InfoButton } from '../components/InfoButton';

interface Props {
  lang: Language;
  isPrivacyMode: boolean;
  onNavigateToTab: (tab: any) => void;
  onOpenInfo: (docId: string) => void;
}

export const DashboardView: React.FC<Props> = ({
  lang,
  isPrivacyMode,
  onNavigateToTab,
  onOpenInfo,
}) => {
  const t = getTranslation(lang);
  const isGu = lang === 'gu';

  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'today'>('all');

  const business = StorageService.getBusiness();
  const allCustomers = StorageService.getCustomers();
  const allVendors = StorageService.getVendors();
  const allSales = StorageService.getSales();
  const allCustomerPayments = StorageService.getCustomerPayments();
  const allAdjustments = StorageService.getCustomerAdjustments();
  const allPurchases = StorageService.getPurchases();
  const allVendorPayments = StorageService.getVendorPayments();
  const allExpenses = StorageService.getExpenses();

  // Filter items by selected date range if needed
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.substring(0, 7);

  const sales = allSales.filter((s) => {
    if (dateFilter === 'today') return s.saleDate === todayStr;
    if (dateFilter === 'month') return s.saleDate.startsWith(currentMonthPrefix);
    return true;
  });

  const customerPayments = allCustomerPayments.filter((p) => {
    if (dateFilter === 'today') return p.paymentDate === todayStr;
    if (dateFilter === 'month') return p.paymentDate.startsWith(currentMonthPrefix);
    return true;
  });

  const purchases = allPurchases.filter((p) => {
    if (dateFilter === 'today') return p.purchaseDate === todayStr;
    if (dateFilter === 'month') return p.purchaseDate.startsWith(currentMonthPrefix);
    return true;
  });

  const expenses = allExpenses.filter((e) => {
    if (dateFilter === 'today') return e.expenseDate === todayStr;
    if (dateFilter === 'month') return e.expenseDate.startsWith(currentMonthPrefix);
    return true;
  });

  const metrics = calculateDashboardMetrics(
    allCustomers,
    allVendors,
    sales,
    customerPayments,
    allAdjustments,
    purchases,
    allVendorPayments,
    expenses,
    business.openingCashPaise
  );

  // Cash vs UPI Digital Revenue breakdown
  let cashSalesTotal = 0;
  let upiSalesTotal = 0;
  for (const s of sales) {
    if (!s.deletedAt) {
      cashSalesTotal += s.cashPaise;
      upiSalesTotal += s.upiPaise;
    }
  }
  for (const cp of customerPayments) {
    if (!cp.deletedAt) {
      if (cp.mode === 'cash') cashSalesTotal += cp.amountPaise;
      else if (cp.mode === 'upi') upiSalesTotal += cp.amountPaise;
    }
  }
  const collectedTotal = cashSalesTotal + upiSalesTotal || 1;
  const upiPercent = Math.round((upiSalesTotal / collectedTotal) * 100);
  const cashPercent = 100 - upiPercent;

  // Expense breakdown by category
  const expenseByCategory = new Map<string, number>();
  for (const e of expenses) {
    if (!e.deletedAt) {
      const prev = expenseByCategory.get(e.category) || 0;
      expenseByCategory.set(e.category, prev + e.amountPaise);
    }
  }
  const topExpenses = Array.from(expenseByCategory.entries())
    .map(([cat, amount]) => ({ cat, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Top 5 Customers by Outstanding Balance
  const topDebtCustomers = allCustomers
    .filter((c) => !c.isArchived)
    .map((c) => {
      const fin = calculateCustomerFinancials(c, allSales, allCustomerPayments, allAdjustments);
      return {
        customer: c,
        balancePaise: fin.balancePaise,
        oldestDueDays: fin.oldestDueDays,
        creditLimitExceeded: fin.creditLimitExceeded,
      };
    })
    .filter((c) => c.balancePaise > 0)
    .sort((a, b) => b.balancePaise - a.balancePaise)
    .slice(0, 5);

  const handleWhatsApp = (custName: string, phone: string, balancePaise: number) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const amountStr = `₹${(balancePaise / 100).toLocaleString('en-IN')}`;

    const msg = isGu
      ? `નમસ્તે ${custName}, ખોડિયાર સ્ટેશનરી તરફથી સ્નેહપૂર્વક યાદ અપાવવાની કે આપના ખાતાની બાકી રકમ ${amountStr} ચૂકવવાની છે. કૃપા કરીને વહેલી તકે જમા કરાવવા વિનંતી.`
      : `Hello ${custName}, friendly reminder from Khodiyar Stationery regarding your pending account balance of ${amountStr}. Please arrange for settlement at your earliest convenience.`;

    if (finalPhone) {
      window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '16px' }}>
      {/* Top Header & Range Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t.dashboard}</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {isGu
              ? 'ઓપરેશનલ હિસાબ, નાણાંકીય સદ્ધરતા અને ઉઘરાણી વિશ્લેષણ'
              : 'Operational financial position, debt ageing & performance insights'}
          </p>
        </div>

        {/* Date Filter Segment */}
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            border: '1px solid var(--border-subtle)',
            borderRadius: 18,
            padding: 3,
            gap: 2,
          }}
        >
          <button
            type="button"
            onClick={() => setDateFilter('today')}
            style={{
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              borderRadius: 14,
              border: 'none',
              cursor: 'pointer',
              background: dateFilter === 'today' ? '#4f46e5' : 'transparent',
              color: dateFilter === 'today' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            {isGu ? 'આજે' : 'Today'}
          </button>
          <button
            type="button"
            onClick={() => setDateFilter('month')}
            style={{
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              borderRadius: 14,
              border: 'none',
              cursor: 'pointer',
              background: dateFilter === 'month' ? '#4f46e5' : 'transparent',
              color: dateFilter === 'month' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            {isGu ? 'આ મહિને' : 'This Month'}
          </button>
          <button
            type="button"
            onClick={() => setDateFilter('all')}
            style={{
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              borderRadius: 14,
              border: 'none',
              cursor: 'pointer',
              background: dateFilter === 'all' ? '#4f46e5' : 'transparent',
              color: dateFilter === 'all' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            {isGu ? 'કુલ (ઓલ-ટાઇમ)' : 'All Time'}
          </button>
        </div>
      </div>

      {/* The 6 Primary KPI Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {/* 1. Sales */}
        <div className="glass-panel" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#4f46e5' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {t.kpiSales}
            </div>
            <InfoButton docId="sales" onClick={onOpenInfo} size={14} color="#4f46e5" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: 6, color: 'var(--text-main)' }}>
            <PrivacyValue paise={metrics.totalSalesPaise} isPrivacyMode={isPrivacyMode} />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
            {isGu ? 'છૂટક + ખાતા વેચાણ' : 'Walk-in + Named Sales'}
          </div>
        </div>

        {/* 2. Collections */}
        <div className="glass-panel" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#059669' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
              {t.kpiCollections}
            </div>
            <InfoButton docId="collections" onClick={onOpenInfo} size={14} color="#059669" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: 6, color: '#059669' }}>
            <PrivacyValue paise={metrics.collectionsPaise} isPrivacyMode={isPrivacyMode} />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
            {isGu ? 'ગ્રાહક પાસેથી વસૂલ રકમ' : 'Customer Cash/UPI Recovered'}
          </div>
        </div>

        {/* 3. Credit Given */}
        <div className="glass-panel" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#d97706' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>
              {t.kpiCreditGiven}
            </div>
            <InfoButton docId="credit_given" onClick={onOpenInfo} size={14} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: 6, color: '#d97706' }}>
            <PrivacyValue paise={metrics.creditGivenPaise} isPrivacyMode={isPrivacyMode} />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
            {isGu ? 'બાકી ઉધાર વેચાણ' : 'Unpaid Customer Sales'}
          </div>
        </div>

        {/* 4. To Collect */}
        <div className="glass-panel" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#0284c7' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
              {t.kpiToCollect}
            </div>
            <InfoButton docId="fifo_ageing" onClick={onOpenInfo} size={14} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: 6, color: '#0284c7' }}>
            <PrivacyValue paise={metrics.toCollectPaise} isPrivacyMode={isPrivacyMode} />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
            {isGu ? 'બજારમાંથી કુલ લેણી રકમ' : 'Total Customer Dues'}
          </div>
        </div>

        {/* 5. To Pay */}
        <div className="glass-panel" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#f43f5e' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fb7185', textTransform: 'uppercase' }}>
              {t.kpiToPay}
            </div>
            <InfoButton docId="operational_position" onClick={onOpenInfo} size={14} color="#fb7185" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: 6, color: '#fb7185' }}>
            <PrivacyValue paise={metrics.toPayPaise} isPrivacyMode={isPrivacyMode} />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
            {isGu ? 'વેપારીઓને ચૂકવવાના બિલ' : 'Supplier Invoices Payable'}
          </div>
        </div>

        {/* 6. Approx. Profit with explicit non-accounting disclaimer */}
        <div className="glass-panel" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#a855f7' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#c084fc', textTransform: 'uppercase' }}>
              {t.kpiApproxProfit}
            </div>
            <InfoButton docId="approx_profit" onClick={onOpenInfo} size={14} color="#c084fc" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: 6, color: '#c084fc' }}>
            <PrivacyValue paise={metrics.approxProfitPaise} isPrivacyMode={isPrivacyMode} />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
            {isGu ? 'વેચાણ − ખરીદી − ખર્ચ' : 'Sales − Purchases − Expenses'}
          </div>
        </div>
      </section>

      {/* Cash vs UPI Digital Breakdown Velocity Card */}
      <section className="glass-panel" style={{ padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <QrCode size={18} color="#4f46e5" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              {isGu ? 'રોકડ વિરુદ્ધ ડિજિટલ (UPI) આવક ગુણોત્તર' : 'Cash vs. UPI Digital Inflow Velocity'}
            </h3>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5' }}>
            UPI: {upiPercent}% | {isGu ? 'રોકડ' : 'Cash'}: {cashPercent}%
          </div>
        </div>

        <div style={{ width: '100%', height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${upiPercent}%`, background: 'linear-gradient(90deg, #4f46e5, #6366f1)', height: '100%' }} />
          <div style={{ width: `${cashPercent}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', height: '100%' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5' }} />
            <span style={{ color: 'var(--text-muted)' }}>UPI / QR Pay:</span>
            <span style={{ fontWeight: 700 }}>{formatINR(upiSalesTotal, isPrivacyMode)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ color: 'var(--text-muted)' }}>{isGu ? 'રોકડ (Cash)' : 'Cash'}:</span>
            <span style={{ fontWeight: 700 }}>{formatINR(cashSalesTotal, isPrivacyMode)}</span>
          </div>
        </div>
      </section>

      {/* Collection Rate & Operational Money Position */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {/* Collection Rate */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Percent size={18} color="#059669" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t.collectionRate}</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>
                {metrics.collectionRatePct !== null ? `${metrics.collectionRatePct}%` : '—'}
              </span>
              <InfoButton docId="collection_rate" onClick={onOpenInfo} size={15} color="#059669" />
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {isGu
              ? 'સૂત્ર: વસૂલ ઉઘરાણી ÷ (શરૂઆતનું લેણું + નવું ઉધાર) × 100'
              : 'Formula: Customer Collections ÷ (Opening Receivables + Credit Given) × 100'}
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', height: 8, background: 'var(--border-subtle)', borderRadius: 4, marginTop: 12, overflow: 'hidden' }}>
            <div
              style={{
                width: `${metrics.collectionRatePct || 0}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #059669, #10b981)',
                borderRadius: 4,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Operational Business Money Position */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wallet size={18} color="#0284c7" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t.operationalPosition}</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                <PrivacyValue paise={metrics.operationalPositionPaise} isPrivacyMode={isPrivacyMode} />
              </span>
              <InfoButton docId="operational_position" onClick={onOpenInfo} size={15} color="#0284c7" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t.estimatedDrawerCash}:</span>
              <span>{formatINR(metrics.cashOnHandPaise, isPrivacyMode)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t.customerReceivables}:</span>
              <span style={{ color: '#059669', fontWeight: 600 }}>+{formatINR(metrics.toCollectPaise, isPrivacyMode)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t.supplierPayables}:</span>
              <span style={{ color: '#e11d48', fontWeight: 600 }}>-{formatINR(metrics.toPayPaise, isPrivacyMode)}</span>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 10 }}>
            * {isGu ? 'દુકાનની રોકડ સદ્ધરતા દર્શાવે છે - ઓડિટેડ નેટવર્થ નથી.' : 'Operational liquidity view — not accounting net worth.'}
          </div>
        </div>
      </section>

      {/* Top 5 High Balance Khata Accounts */}
      <section className="glass-panel" style={{ padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={18} color="#4f46e5" />
            <span>{isGu ? 'સૌથી વધુ બાકી વાળા મુખ્ય ખાતાઓ (Top Receivables)' : 'Top Accounts by Outstanding'}</span>
          </h3>
          <button
            type="button"
            onClick={() => onNavigateToTab('customers')}
            style={{
              background: 'none',
              border: 'none',
              color: '#4f46e5',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <span>{isGu ? 'બધા ગ્રાહકો' : 'View All'}</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {topDebtCustomers.length === 0 ? (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '14px 0' }}>
            {isGu ? 'હાલ કોઈ ગ્રાહકનું ઉધાર બાકી નથી.' : 'No customer receivables pending.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topDebtCustomers.map(({ customer, balancePaise, oldestDueDays, creditLimitExceeded }) => (
              <div
                key={customer.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    {customer.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: 8, marginTop: 2 }}>
                    <span>{customer.segment}</span>
                    <span>• {oldestDueDays} {isGu ? 'દિવસથી બાકી' : 'days due'}</span>
                    {creditLimitExceeded && (
                      <span style={{ color: '#ea580c', fontWeight: 700 }}>• {isGu ? 'મર્યાદા વટી' : 'Limit Exceeded'}</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#dc2626' }}>
                      <PrivacyValue paise={balancePaise} isPrivacyMode={isPrivacyMode} />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleWhatsApp(customer.name, customer.phone, balancePaise)}
                    title={isGu ? 'વોટ્સએપ રીમાઇન્ડર મોકલો' : 'Send WhatsApp Reminder'}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      border: 'none',
                      background: '#25d366',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <MessageSquare size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Customer Receivable Ageing (FIFO buckets) */}
      <section className="glass-panel" style={{ padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} color="#d97706" />
            <span>{t.receivableAgeing}</span>
          </h3>
          <InfoButton docId="fifo_ageing" onClick={onOpenInfo} size={15} color="#d97706" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
          <div className="glass-card" style={{ padding: '12px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{isGu ? '૦-૭ દિવસ' : '0–7 Days'}</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669', marginTop: 4 }}>
              <PrivacyValue paise={metrics.ageingTotals.bucket0to7} isPrivacyMode={isPrivacyMode} />
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 }}>
              {isGu ? 'તાજું બિલ' : 'Current & fresh'}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '12px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{isGu ? '૮-૩૦ દિવસ' : '8–30 Days'}</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#d97706', marginTop: 4 }}>
              <PrivacyValue paise={metrics.ageingTotals.bucket8to30} isPrivacyMode={isPrivacyMode} />
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 }}>
              {isGu ? 'સામાન્ય સાયકલ' : 'Within cycle'}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '12px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{isGu ? '૩૧-૬૦ દિવસ' : '31–60 Days'}</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ea580c', marginTop: 4 }}>
              <PrivacyValue paise={metrics.ageingTotals.bucket31to60} isPrivacyMode={isPrivacyMode} />
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 }}>
              {isGu ? 'ફોલો-અપ કરો' : 'Follow-up due'}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '12px' }}>
            <div style={{ fontSize: '0.72rem', color: '#e11d48' }}>{isGu ? '૬૦+ દિવસ ઓવરડ્યુ' : '60+ Days Overdue'}</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#e11d48', marginTop: 4 }}>
              <PrivacyValue paise={metrics.ageingTotals.bucket60plus} isPrivacyMode={isPrivacyMode} />
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 }}>
              {isGu ? 'પ્રાથમિકતા ઉઘરાણી' : 'Priority recovery'}
            </div>
          </div>
        </div>
      </section>

      {/* Expense Breakdown */}
      <section className="glass-panel" style={{ padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <PieChart size={18} color="#c026d3" />
            <span>{t.expenseBreakdown}</span>
          </h3>
          <InfoButton docId="expenses" onClick={onOpenInfo} size={15} color="#c026d3" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {topExpenses.map((item) => (
            <div
              key={item.cat}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
              }}
            >
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{item.cat}</span>
              <span style={{ fontWeight: 700, color: '#e11d48' }}>
                <PrivacyValue paise={item.amount} isPrivacyMode={isPrivacyMode} />
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

