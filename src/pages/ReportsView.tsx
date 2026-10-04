import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Users,
  Truck,
  TrendingUp,
  Receipt,
  BookOpen,
} from 'lucide-react';
import { Language, getTranslation } from '../lib/i18n';
import { formatINR } from '../lib/money';
import { formatDate } from '../lib/dates';
import { StorageService } from '../services/storage';
import { calculateCustomerFinancials, calculateVendorBalance } from '../services/businessLogic';
import { PrivacyValue } from '../components/PrivacyValue';

interface Props {
  lang: Language;
  isPrivacyMode: boolean;
}

export const ReportsView: React.FC<Props> = ({ lang, isPrivacyMode }) => {
  const t = getTranslation(lang);

  const [activeReport, setActiveReport] = useState<
    'outstanding' | 'payables' | 'daybook' | 'profit'
  >('outstanding');

  const customers = StorageService.getCustomers().filter(c => !c.isArchived);
  const vendors = StorageService.getVendors().filter(v => !v.isArchived);
  const sales = StorageService.getSales().filter(s => !s.deletedAt);
  const payments = StorageService.getCustomerPayments().filter(p => !p.deletedAt);
  const adjustments = StorageService.getCustomerAdjustments().filter(a => !a.deletedAt);
  const purchases = StorageService.getPurchases().filter(p => !p.deletedAt);
  const vendorPayments = StorageService.getVendorPayments().filter(vp => !vp.deletedAt);
  const expenses = StorageService.getExpenses().filter(e => !e.deletedAt);

  // Customer outstanding items
  const outstandingList = customers
    .map((c) => {
      const fin = calculateCustomerFinancials(c, sales, payments, adjustments);
      return {
        customer: c,
        balancePaise: fin.balancePaise,
        oldestDays: fin.oldestDueDays,
        phone: c.phone,
        segment: c.segment,
      };
    })
    .filter((item) => item.balancePaise > 0)
    .sort((a, b) => b.balancePaise - a.balancePaise);

  // Vendor payables items
  const payablesList = vendors
    .map((v) => {
      const fin = calculateVendorBalance(v, purchases, vendorPayments);
      return {
        vendor: v,
        balancePaise: fin.balancePaise,
        phone: v.phone,
        terms: v.paymentTermsDays || 30,
      };
    })
    .filter((item) => item.balancePaise > 0)
    .sort((a, b) => b.balancePaise - a.balancePaise);

  // Day Book items (Sales, Collections, Expenses)
  const todayStr = new Date().toISOString().split('T')[0];
  const dayBookSales = sales.filter(s => s.saleDate.startsWith(todayStr));
  const dayBookCollections = payments.filter(p => p.paymentDate.startsWith(todayStr));
  const dayBookExpenses = expenses.filter(e => e.expenseDate.startsWith(todayStr));

  // Approx Profit Statement calculation
  let totalSales = 0;
  for (const s of sales) totalSales += s.totalPaise;

  let totalPurchases = 0;
  for (const p of purchases) totalPurchases += p.amountPaise;

  let totalExpenses = 0;
  for (const e of expenses) totalExpenses += e.amountPaise;

  const approxProfit = totalSales - totalPurchases - totalExpenses;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeReport === 'outstanding') {
      csvContent += 'Customer Name,Phone,Segment,Outstanding Dues (INR),Oldest Due Days\n';
      outstandingList.forEach((row) => {
        csvContent += `"${row.customer.name}","${row.phone}","${row.segment}",${row.balancePaise / 100},${row.oldestDays}\n`;
      });
    } else if (activeReport === 'payables') {
      csvContent += 'Supplier Name,Phone,Terms Days,Payable Amount (INR)\n';
      payablesList.forEach((row) => {
        csvContent += `"${row.vendor.name}","${row.phone}",${row.terms},${row.balancePaise / 100}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ShopBook_${activeReport}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t.reports}</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Financial statements, Day Book & receivable recovery lists
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={handleExportCSV}>
            <Download size={16} />
            <span>CSV Export</span>
          </button>
          <button className="btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        <button
          className={`btn-secondary ${activeReport === 'outstanding' ? 'active' : ''}`}
          onClick={() => setActiveReport('outstanding')}
          style={{
            padding: '8px 14px',
            fontSize: '0.82rem',
            background: activeReport === 'outstanding' ? 'var(--accent-primary)' : undefined,
            color: activeReport === 'outstanding' ? '#fff' : undefined,
          }}
        >
          Customer Outstanding ({outstandingList.length})
        </button>

        <button
          className={`btn-secondary ${activeReport === 'payables' ? 'active' : ''}`}
          onClick={() => setActiveReport('payables')}
          style={{
            padding: '8px 14px',
            fontSize: '0.82rem',
            background: activeReport === 'payables' ? 'var(--accent-primary)' : undefined,
            color: activeReport === 'payables' ? '#fff' : undefined,
          }}
        >
          Vendor Payables ({payablesList.length})
        </button>

        <button
          className={`btn-secondary ${activeReport === 'daybook' ? 'active' : ''}`}
          onClick={() => setActiveReport('daybook')}
          style={{
            padding: '8px 14px',
            fontSize: '0.82rem',
            background: activeReport === 'daybook' ? 'var(--accent-primary)' : undefined,
            color: activeReport === 'daybook' ? '#fff' : undefined,
          }}
        >
          Today's Day Book
        </button>

        <button
          className={`btn-secondary ${activeReport === 'profit' ? 'active' : ''}`}
          onClick={() => setActiveReport('profit')}
          style={{
            padding: '8px 14px',
            fontSize: '0.82rem',
            background: activeReport === 'profit' ? 'var(--accent-primary)' : undefined,
            color: activeReport === 'profit' ? '#fff' : undefined,
          }}
        >
          {t.kpiApproxProfit} Statement
        </button>
      </div>

      {/* Report Container */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        {activeReport === 'outstanding' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Customer Outstanding Recovery Report</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Ranked by highest unpaid credit balance
                </p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.05)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '10px 12px' }}>Customer</th>
                  <th style={{ padding: '10px 12px' }}>Phone</th>
                  <th style={{ padding: '10px 12px' }}>Segment</th>
                  <th style={{ padding: '10px 12px' }}>Oldest Age</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Due Amount</th>
                </tr>
              </thead>
              <tbody>
                {outstandingList.map((row) => (
                  <tr key={row.customer.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{row.customer.name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-dim)' }}>{row.phone}</td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge badge-indigo">{row.segment}</span>
                    </td>
                    <td style={{ padding: '12px', color: row.oldestDays >= 30 ? '#fb7185' : '#fbbf24' }}>
                      {row.oldestDays} days
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#fbbf24' }}>
                      <PrivacyValue paise={row.balancePaise} isPrivacyMode={isPrivacyMode} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'payables' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Supplier Payables Calendar</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Upcoming vendor settlements
                </p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '10px 12px' }}>Supplier</th>
                  <th style={{ padding: '10px 12px' }}>Phone</th>
                  <th style={{ padding: '10px 12px' }}>Terms</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Payable Due</th>
                </tr>
              </thead>
              <tbody>
                {payablesList.map((row) => (
                  <tr key={row.vendor.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{row.vendor.name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-dim)' }}>{row.phone}</td>
                    <td style={{ padding: '12px' }}>{row.terms} days</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#fb7185' }}>
                      <PrivacyValue paise={row.balancePaise} isPrivacyMode={isPrivacyMode} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'daybook' && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>
              Today's Day Book ({new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#818cf8', marginBottom: 8 }}>1. Sales Incurred</h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                  {dayBookSales.length} sales entered today.
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#34d399', marginBottom: 8 }}>2. Customer Collections (Money In)</h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                  {dayBookCollections.length} collections recorded today.
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#fb7185', marginBottom: 8 }}>3. Operational Expenses (Money Out)</h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                  {dayBookExpenses.length} expenses logged today.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeReport === 'profit' && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>
              {t.kpiApproxProfit} Calculation Statement
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 16 }}>
              {t.approxProfitNote}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 500, fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span>Total Recorded Sales (Revenue)</span>
                <span style={{ fontWeight: 700, color: '#34d399' }}>+{formatINR(totalSales, isPrivacyMode)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span>Less: Purchases Incurred</span>
                <span style={{ fontWeight: 700, color: '#fb7185' }}>-{formatINR(totalPurchases, isPrivacyMode)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span>Less: Operational Expenses</span>
                <span style={{ fontWeight: 700, color: '#fb7185' }}>-{formatINR(totalExpenses, isPrivacyMode)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderTop: '2px solid var(--border-strong)',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                }}
              >
                <span>{t.kpiApproxProfit}</span>
                <span style={{ color: approxProfit >= 0 ? '#34d399' : '#fb7185' }}>
                  {formatINR(approxProfit, isPrivacyMode)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
