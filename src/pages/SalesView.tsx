import React, { useState } from 'react';
import { ShoppingBag, UserCheck, Search, Filter, Calendar } from 'lucide-react';
import { Language, getTranslation } from '../lib/i18n';
import { formatINR } from '../lib/money';
import { formatDate } from '../lib/dates';
import { StorageService } from '../services/storage';
import { PrivacyValue } from '../components/PrivacyValue';
import { InfoButton } from '../components/InfoButton';
import { Sale } from '../types';

interface Props {
  lang: Language;
  isPrivacyMode: boolean;
  onOpenWalkInSale: () => void;
  onOpenCustomerSale: () => void;
  onOpenInfo: (docId: string) => void;
}

export const SalesView: React.FC<Props> = ({
  lang,
  isPrivacyMode,
  onOpenWalkInSale,
  onOpenCustomerSale,
  onOpenInfo,
}) => {
  const t = getTranslation(lang);
  const isGu = lang === 'gu';
  const sales = StorageService.getSales().filter(s => !s.deletedAt);

  const [tab, setTab] = useState<'all' | 'walk_in' | 'customer'>('all');
  const [search, setSearch] = useState('');

  const filteredSales = sales.filter((s) => {
    if (tab === 'walk_in' && s.saleType !== 'walk_in') return false;
    if (tab === 'customer' && s.saleType !== 'customer') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = s.customerName?.toLowerCase().includes(q);
      const matchNote = s.note?.toLowerCase().includes(q);
      return matchName || matchNote;
    }
    return true;
  });

  // Calculate totals
  let totalSalesPaise = 0;
  let totalCashPaise = 0;
  let totalUpiPaise = 0;
  let totalCreditPaise = 0;

  for (const s of filteredSales) {
    totalSalesPaise += s.totalPaise;
    totalCashPaise += s.cashPaise;
    totalUpiPaise += s.upiPaise;
    totalCreditPaise += s.creditPaise;
  }

  const collectionsFromSales = totalCashPaise + totalUpiPaise;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px' }}>
      {/* Top Header with Quick Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t.sales}</h2>
            <InfoButton docId="sales" onClick={onOpenInfo} size={15} color="#4f46e5" />
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {isGu
              ? 'વેચાણ નોંધણી: દૈનિક છૂટક લમ્પસમ અને સ્કૂલ/ઉધાર ખાતાવહી'
              : 'Sales register: Daily counter totals & school/credit accounts'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={onOpenWalkInSale} style={{ padding: '8px 14px' }}>
            <ShoppingBag size={16} color="#38bdf8" />
            <span>{t.walkInSale}</span>
          </button>

          <button className="btn-primary" onClick={onOpenCustomerSale} style={{ padding: '8px 14px' }}>
            <UserCheck size={16} />
            <span>{t.customerSale}</span>
          </button>
        </div>
      </div>

      {/* Summary Strip (Distinct Sales, Collections from sales, Credit Given) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <div className="glass-card" style={{ padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              {t.sales}
            </div>
            <InfoButton docId="sales" onClick={onOpenInfo} size={13} color="#4f46e5" />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: 4 }}>
            <PrivacyValue paise={totalSalesPaise} isPrivacyMode={isPrivacyMode} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#059669', textTransform: 'uppercase', fontWeight: 600 }}>
              {isGu ? 'રોકડ વસૂલ' : 'Collected'}
            </div>
            <InfoButton docId="collections" onClick={onOpenInfo} size={13} color="#059669" />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669', marginTop: 4 }}>
            <PrivacyValue paise={collectionsFromSales} isPrivacyMode={isPrivacyMode} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#d97706', textTransform: 'uppercase', fontWeight: 600 }}>
              {t.kpiCreditGiven}
            </div>
            <InfoButton docId="credit_given" onClick={onOpenInfo} size={13} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#d97706', marginTop: 4 }}>
            <PrivacyValue paise={totalCreditPaise} isPrivacyMode={isPrivacyMode} />
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          <button
            className={`btn-secondary ${tab === 'all' ? 'active' : ''}`}
            onClick={() => setTab('all')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              background: tab === 'all' ? 'var(--accent-primary)' : undefined,
              color: tab === 'all' ? '#fff' : undefined,
            }}
          >
            {t.all} ({sales.length})
          </button>
          <button
            className={`btn-secondary ${tab === 'walk_in' ? 'active' : ''}`}
            onClick={() => setTab('walk_in')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              background: tab === 'walk_in' ? 'var(--accent-primary)' : undefined,
              color: tab === 'walk_in' ? '#fff' : undefined,
            }}
          >
            {t.walkInSale}
          </button>
          <button
            className={`btn-secondary ${tab === 'customer' ? 'active' : ''}`}
            onClick={() => setTab('customer')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              background: tab === 'customer' ? 'var(--accent-primary)' : undefined,
              color: tab === 'customer' ? '#fff' : undefined,
            }}
          >
            {t.customerSale}
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search by customer name or item note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Sales List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredSales.length === 0 ? (
          <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-dim)' }}>
            No sales matching your filter.
          </div>
        ) : (
          filteredSales.map((sale) => (
            <div
              key={sale.id}
              className="glass-card"
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-sm)',
                    background:
                      sale.saleType === 'walk_in'
                        ? 'rgba(56, 189, 248, 0.15)'
                        : 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: sale.saleType === 'walk_in' ? '#38bdf8' : '#818cf8',
                  }}
                >
                  {sale.saleType === 'walk_in' ? <ShoppingBag size={20} /> : <UserCheck size={20} />}
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {sale.saleType === 'walk_in' ? 'Walk-in Counter Sale' : sale.customerName}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 2 }}>
                    {formatDate(sale.saleDate)} {sale.note ? `• ${sale.note}` : ''}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                  <PrivacyValue paise={sale.totalPaise} isPrivacyMode={isPrivacyMode} />
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 4 }}>
                  {sale.cashPaise > 0 && (
                    <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                      Cash: {formatINR(sale.cashPaise, isPrivacyMode)}
                    </span>
                  )}
                  {sale.upiPaise > 0 && (
                    <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                      UPI: {formatINR(sale.upiPaise, isPrivacyMode)}
                    </span>
                  )}
                  {sale.creditPaise > 0 && (
                    <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                      Credit: {formatINR(sale.creditPaise, isPrivacyMode)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
