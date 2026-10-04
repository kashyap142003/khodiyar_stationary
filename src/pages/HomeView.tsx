import React from 'react';
import {
  ShoppingBag,
  UserCheck,
  CreditCard,
  PackagePlus,
  ArrowUpRight,
  Receipt,
  Phone,
  CalendarCheck,
  Clock,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Lock,
} from 'lucide-react';
import { Language, getTranslation } from '../lib/i18n';
import { formatINR } from '../lib/money';
import { formatRelativeDate, formatDate } from '../lib/dates';
import { StorageService } from '../services/storage';
import { calculateTodayMetrics, generateAlerts } from '../services/businessLogic';
import { QuickActionType } from '../components/QuickAddModal';
import { PrivacyValue } from '../components/PrivacyValue';
import { InfoButton } from '../components/InfoButton';

interface Props {
  lang: Language;
  isPrivacyMode: boolean;
  onSelectAction: (action: QuickActionType) => void;
  onOpenCustomerDetail: (customerId: string) => void;
  onOpenPromiseToPay: (customerId: string, amountPaise: number) => void;
  onReceivePayment: (customerId: string) => void;
  onNavigateToTab: (tab: any) => void;
  onOpenInfo: (docId: string) => void;
}

export const HomeView: React.FC<Props> = ({
  lang,
  isPrivacyMode,
  onSelectAction,
  onOpenCustomerDetail,
  onOpenPromiseToPay,
  onReceivePayment,
  onNavigateToTab,
  onOpenInfo,
}) => {
  const t = getTranslation(lang);

  const sales = StorageService.getSales();
  const customerPayments = StorageService.getCustomerPayments();
  const adjustments = StorageService.getCustomerAdjustments();
  const customers = StorageService.getCustomers();
  const vendors = StorageService.getVendors();
  const expenses = StorageService.getExpenses();
  const followups = StorageService.getFollowups();
  const promises = StorageService.getPromisesToPay();

  const todayMetrics = calculateTodayMetrics(sales, customerPayments, expenses);
  const alerts = generateAlerts(customers, vendors, sales, customerPayments, adjustments, followups, promises);

  // Today's unified timeline (Sales, Payments, Expenses)
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.saleDate.startsWith(todayStr) && !s.deletedAt);
  const todayPayments = customerPayments.filter(p => p.paymentDate.startsWith(todayStr) && !p.deletedAt);
  const todayExpenses = expenses.filter(e => e.expenseDate.startsWith(todayStr) && !e.deletedAt);

  const allTodayActivities = [
    ...todaySales.map(s => ({
      type: 'sale' as const,
      id: s.id,
      date: s.saleDate,
      title: s.saleType === 'walk_in' ? (lang === 'gu' ? 'દૈનિક છૂટક કાઉન્ટર વેચાણ' : 'Walk-in Counter Sale') : s.customerName || (lang === 'gu' ? 'ગ્રાહક ખાતા વેચાણ' : 'Customer Sale'),
      sub: s.note || (s.creditPaise > 0 ? `${lang === 'gu' ? 'ઉધાર બાકી' : 'Credit'}: ₹${(s.creditPaise / 100).toLocaleString('en-IN')}` : (lang === 'gu' ? 'પૂરેપૂરી ચુકવણી' : 'Fully Paid')),
      amount: s.totalPaise,
      badge: s.saleType === 'walk_in' ? (lang === 'gu' ? 'છૂટક' : 'Walk-in') : (lang === 'gu' ? 'ખાતાવહી' : 'Account'),
      badgeColor: 'badge-indigo',
    })),
    ...todayPayments.map(p => ({
      type: 'payment' as const,
      id: p.id,
      date: p.paymentDate,
      title: `${lang === 'gu' ? 'ઉઘરાણી જમા' : 'Payment'}: ${p.customerName || (lang === 'gu' ? 'ગ્રાહક' : 'Customer')}`,
      sub: `${p.mode.toUpperCase()} ${p.reference ? '• ' + p.reference : ''}`,
      amount: p.amountPaise,
      badge: lang === 'gu' ? 'આવક' : 'Collection',
      badgeColor: 'badge-emerald',
    })),
    ...todayExpenses.map(e => ({
      type: 'expense' as const,
      id: e.id,
      date: e.expenseDate,
      title: `${lang === 'gu' ? 'દુકાન ખર્ચ' : 'Expense'}: ${e.category}`,
      sub: e.note || e.mode.toUpperCase(),
      amount: e.amountPaise,
      badge: lang === 'gu' ? 'ખર્ચ' : 'Expense',
      badgeColor: 'badge-rose',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 1. Today Strip: Explicit separation of Sales, Collections, and Credit Given */}
      <section className="today-strip">
        <div className="today-kpi-card sales">
          <div className="today-kpi-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>{t.sales}</span>
              <TrendingUp size={14} color="#4f46e5" />
            </div>
            <InfoButton docId="sales" onClick={onOpenInfo} size={14} color="#4f46e5" />
          </div>
          <div className="today-kpi-value" style={{ color: 'var(--text-main)' }}>
            <PrivacyValue paise={todayMetrics.totalSalesPaise} isPrivacyMode={isPrivacyMode} />
          </div>
          <div className="today-kpi-sub">
            {lang === 'gu' ? 'રોકડા' : 'Cash'}: {formatINR(todayMetrics.cashSalesPaise, isPrivacyMode)} • UPI: {formatINR(todayMetrics.upiSalesPaise, isPrivacyMode)}
          </div>
        </div>

        <div className="today-kpi-card collections">
          <div className="today-kpi-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>{t.kpiCollections}</span>
              <CreditCard size={14} color="#059669" />
            </div>
            <InfoButton docId="collections" onClick={onOpenInfo} size={14} color="#059669" />
          </div>
          <div className="today-kpi-value" style={{ color: '#059669' }}>
            <PrivacyValue paise={todayMetrics.collectionsPaise} isPrivacyMode={isPrivacyMode} />
          </div>
          <div className="today-kpi-sub">
            {lang === 'gu' ? 'ગ્રાહક પાસેથી જૂની ઉઘરાણી વસૂલ' : 'Customer Dues Recovered'}
          </div>
        </div>

        <div className="today-kpi-card credit">
          <div className="today-kpi-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>{t.kpiCreditGiven}</span>
              <Clock size={14} color="#d97706" />
            </div>
            <InfoButton docId="credit_given" onClick={onOpenInfo} size={14} color="#d97706" />
          </div>
          <div className="today-kpi-value" style={{ color: '#d97706' }}>
            <PrivacyValue paise={todayMetrics.creditGivenPaise} isPrivacyMode={isPrivacyMode} />
          </div>
          <div className="today-kpi-sub">
            {lang === 'gu' ? 'ખાતાવહીમાં ઉધાર ઉમેરાયું' : 'Added to Receivables'}
          </div>
        </div>

        <div className="today-kpi-card expenses">
          <div className="today-kpi-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>{t.expense}</span>
              <Receipt size={14} color="#e11d48" />
            </div>
            <InfoButton docId="expenses" onClick={onOpenInfo} size={14} color="#e11d48" />
          </div>
          <div className="today-kpi-value" style={{ color: '#e11d48' }}>
            <PrivacyValue paise={todayMetrics.expensesPaise} isPrivacyMode={isPrivacyMode} />
          </div>
          <div className="today-kpi-sub">
            {lang === 'gu' ? 'દુકાન સંચાલન ખર્ચ' : 'Store Operational Costs'}
          </div>
        </div>
      </section>

      {/* 2. Fast Counter Quick-Add Grid */}
      <section style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {lang === 'gu' ? 'કાઉન્ટર ઝડપી એન્ટ્રી' : 'Counter Quick Actions'}
            </h2>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: 2 }}>
              {lang === 'gu'
                ? '૧૦૦+ નાના ગ્રાહકો માટે સીધું "દૈનિક છૂટક વેચાણ". સ્કૂલ/ઉધાર ગ્રાહકો માટે "ખાતા વેચાણ".'
                : 'Small walk-in buyers → Daily Counter Total. Schools & credit accounts → School / Khata Sale.'}
            </div>
          </div>
          <InfoButton docId="walk_in_total" onClick={onOpenInfo} size={16} />
        </div>

        <div className="quick-add-grid" style={{ padding: 0 }}>
          {/* Action 1: Walk-in Sale */}
          <button className="quick-action-btn" onClick={() => onSelectAction('walk_in_sale')}>
            <div className="quick-action-icon" style={{ background: 'var(--accent-cyan-bg)', color: 'var(--accent-cyan)' }}>
              <ShoppingBag size={18} />
            </div>
            <span>{t.walkInSale}</span>
          </button>

          {/* Action 2: Customer Sale (Named + Credit/Cash) */}
          <button className="quick-action-btn" onClick={() => onSelectAction('customer_sale')}>
            <div className="quick-action-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <UserCheck size={18} />
            </div>
            <span>{t.customerSale}</span>
          </button>

          {/* Action 3: Receive Payment (Collection / Dues) */}
          <button className="quick-action-btn" onClick={() => onSelectAction('receive_payment')}>
            <div className="quick-action-icon" style={{ background: 'var(--accent-emerald-bg)', color: 'var(--accent-emerald)' }}>
              <CreditCard size={18} />
            </div>
            <span>{t.receivePayment}</span>
          </button>

          {/* Action 4: Purchase */}
          <button className="quick-action-btn" onClick={() => onSelectAction('purchase')}>
            <div className="quick-action-icon" style={{ background: 'var(--accent-amber-bg)', color: 'var(--accent-amber)' }}>
              <PackagePlus size={18} />
            </div>
            <span>{t.newPurchase}</span>
          </button>

          {/* Action 5: Pay Vendor */}
          <button className="quick-action-btn" onClick={() => onSelectAction('pay_vendor')}>
            <div className="quick-action-icon" style={{ background: 'var(--accent-rose-bg)', color: 'var(--accent-rose)' }}>
              <ArrowUpRight size={18} />
            </div>
            <span>{t.payVendor}</span>
          </button>

          {/* Action 6: Daily Cash Close */}
          <button className="quick-action-btn" onClick={() => onSelectAction('cash_close')}>
            <div className="quick-action-icon" style={{ background: 'var(--accent-purple-bg)', color: 'var(--accent-purple)' }}>
              <Lock size={18} />
            </div>
            <span>{t.cashClose}</span>
          </button>
        </div>
      </section>

      {/* 3. Needs Attention: Customer Debt, Overdue & Follow-ups */}
      {alerts.length > 0 && (
        <section style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#d97706', display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <AlertTriangle size={15} />
              <span>{t.needsAttention} ({alerts.length})</span>
            </h2>
            <InfoButton docId="needs_attention" onClick={onOpenInfo} size={15} color="#d97706" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className="glass-card"
                style={{
                  padding: '12px 14px',
                  borderLeft: `4px solid ${alert.severity === 'critical' ? '#e11d48' : '#d97706'}`,
                  background: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      {alert.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {alert.body}
                    </div>
                  </div>
                  {alert.amountPaise && (
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: alert.severity === 'critical' ? '#e11d48' : '#d97706' }}>
                      <PrivacyValue paise={alert.amountPaise} isPrivacyMode={isPrivacyMode} />
                    </span>
                  )}
                </div>

                {/* Specific Actionable Buttons (No generic "Done"!) */}
                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  {alert.customerId && (
                    <>
                      <button
                        className="btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                        onClick={() => {
                          const cust = customers.find(c => c.id === alert.customerId);
                          if (cust?.phone) window.open(`tel:${cust.phone}`);
                        }}
                      >
                        <Phone size={13} color="#059669" />
                        <span>{t.call}</span>
                      </button>

                      <button
                        className="btn-primary"
                        style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                        onClick={() => onReceivePayment(alert.customerId!)}
                      >
                        <CreditCard size={13} />
                        <span>{t.receivePayment}</span>
                      </button>

                      <button
                        className="btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                        onClick={() => onOpenPromiseToPay(alert.customerId!, alert.amountPaise || 0)}
                      >
                        <CalendarCheck size={13} color="#4f46e5" />
                        <span>{t.promiseToPay}</span>
                      </button>

                      <button
                        className="btn-secondary"
                        style={{ padding: '5px 8px', fontSize: '0.75rem' }}
                        onClick={() => onOpenCustomerDetail(alert.customerId!)}
                      >
                        <span>History</span>
                        <ChevronRight size={13} />
                      </button>
                    </>
                  )}

                  {alert.followupId && (
                    <button
                      className="btn-secondary"
                      style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                      onClick={() => onNavigateToTab('followups')}
                    >
                      <span>View Follow-up Pipeline</span>
                      <ChevronRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Today's Chronological Stream */}
      <section style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t.todayActivity} ({allTodayActivities.length})
          </h2>
          <button
            onClick={() => onNavigateToTab('sales')}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
          >
            {t.all}
          </button>
        </div>

        {allTodayActivities.length === 0 ? (
          <div className="glass-card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
            No transactions entered today yet. Tap any button above to make an entry!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {allTodayActivities.map((act) => (
              <div
                key={act.id}
                className="glass-card"
                style={{
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 'var(--radius-sm)',
                      background:
                        act.type === 'sale'
                          ? '#eef2ff'
                          : act.type === 'payment'
                          ? 'var(--accent-emerald-bg)'
                          : 'var(--accent-rose-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color:
                        act.type === 'sale'
                          ? '#4f46e5'
                          : act.type === 'payment'
                          ? '#059669'
                          : '#e11d48',
                    }}
                  >
                    {act.type === 'sale' ? (
                      <ShoppingBag size={16} />
                    ) : act.type === 'payment' ? (
                      <CreditCard size={16} />
                    ) : (
                      <Receipt size={16} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                      {act.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      {act.sub}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      color: act.type === 'payment' ? '#059669' : 'var(--text-main)',
                    }}
                  >
                    <PrivacyValue paise={act.amount} isPrivacyMode={isPrivacyMode} />
                  </div>
                  <span className={`badge ${act.badgeColor}`} style={{ fontSize: '0.62rem', marginTop: 2 }}>
                    {act.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
