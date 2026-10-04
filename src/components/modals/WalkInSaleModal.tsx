import React, { useState } from 'react';
import { ShoppingBag, X, Sparkles, Check } from 'lucide-react';
import { Language, getTranslation } from '../../lib/i18n';
import { rupeesToPaise, formatINR } from '../../lib/money';
import { StorageService } from '../../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSuccess: () => void;
}

export const WalkInSaleModal: React.FC<Props> = ({ isOpen, onClose, lang, onSuccess }) => {
  if (!isOpen) return null;
  const t = getTranslation(lang);

  const [cashAmount, setCashAmount] = useState<string>('');
  const [upiAmount, setUpiAmount] = useState<string>('');
  const [note, setNote] = useState<string>('General Counter & Stationery Sales');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const cashPaise = rupeesToPaise(cashAmount || 0);
  const upiPaise = rupeesToPaise(upiAmount || 0);
  const totalPaise = cashPaise + upiPaise;

  // Check today's already recorded walk-in total
  const todayStr = date;
  const existingTodayWalkIns = StorageService.getSales().filter(
    (s) => s.saleType === 'walk_in' && s.saleDate.startsWith(todayStr) && !s.deletedAt
  );
  const existingWalkInTotalPaise = existingTodayWalkIns.reduce((sum, s) => sum + s.totalPaise, 0);

  const quickCategories = [
    'General Counter Sales',
    'Photocopy / Xerox & Printing',
    'Spiral & Book Binding',
    'Exam Pads & Registers',
    'School Project Materials',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalPaise <= 0) return;

    StorageService.addSale({
      id: 'sale_' + Date.now(),
      saleType: 'walk_in',
      saleDate: new Date(date).toISOString(),
      totalPaise,
      cashPaise,
      upiPaise,
      otherPaidPaise: 0,
      creditPaise: 0, // Walk-ins are always fully settled
      note: note.trim() || undefined,
      source: 'manual',
      createdAt: new Date().toISOString(),
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-cyan-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
              }}
            >
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2>{lang === 'gu' ? 'દૈનિક છૂટક વેચાણ (લમ્પસમ)' : 'Daily Counter / Walk-in Total'}</h2>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                {lang === 'gu'
                  ? 'રોજના ૧૦૦+ નાના ગ્રાહકો માટે સીધા રોકડા + UPI નો સરવાળો'
                  : 'For 100+ small random buyers (Day total / Lump-sum)'}
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Informational Callout */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
                fontSize: '0.78rem',
                color: '#166534',
                lineHeight: 1.4,
              }}
            >
              <Sparkles size={16} style={{ flexShrink: 0, marginTop: 1, color: '#15803d' }} />
              <div>
                <strong>{lang === 'gu' ? 'કોઈ અલગ અલગ એન્ટ્રીની જરૂર નથી:' : 'No need for 100 individual entries:'}</strong>{' '}
                {lang === 'gu'
                  ? 'દિવસે થયેલ કુલ રોકડ અને UPI ગલ્લાનો સરવાળો અહીં ૧ વારમાં જ લખી લો.'
                  : 'Just enter your total Counter Cash & UPI collected today. Individual names are not required.'}
              </div>
            </div>

            {existingWalkInTotalPaise > 0 && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#f8fafc',
                  border: '1px dashed var(--border-subtle)',
                  fontSize: '0.76rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <span>{lang === 'gu' ? 'આ તારીખે અગાઉ નોંધાયેલ વેચાણ:' : 'Already logged for this date:'}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatINR(existingWalkInTotalPaise)}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{t.date}</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t.cash} {lang === 'gu' ? 'ગલ્લો' : 'Drawer'}</span>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>Cash In</span>
                </label>
                <div className="amount-input-wrap">
                  <span className="currency-prefix">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0"
                    className="form-input"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t.upi} {lang === 'gu' ? 'QR / સ્કેનર' : 'Scanner'}</span>
                  <span style={{ fontSize: '0.72rem', color: '#4f46e5', fontWeight: 600 }}>Online</span>
                </label>
                <div className="amount-input-wrap">
                  <span className="currency-prefix">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0"
                    className="form-input"
                    value={upiAmount}
                    onChange={(e) => setUpiAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t.notes}</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. General Counter, Xerox, Spiral binding"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              
              {/* Quick Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {quickCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNote(cat)}
                    style={{
                      fontSize: '0.7rem',
                      padding: '3px 8px',
                      borderRadius: 12,
                      background: note === cat ? 'var(--accent-primary)' : 'var(--bg-card)',
                      color: note === cat ? '#fff' : 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Real-time Review Strip */}
            <div
              className="glass-card"
              style={{
                padding: '12px 14px',
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {lang === 'gu' ? 'આ એન્ટ્રીનું કુલ વેચાણ' : "Today's Entry Total"}
                </span>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                  {formatINR(totalPaise)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                <span>Cash: {formatINR(cashPaise)}</span>
                <span>UPI: {formatINR(upiPaise)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 6,
                  marginTop: 6,
                  borderTop: '1px dashed var(--border-subtle)',
                  fontSize: '0.78rem',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>Outstanding Balance</span>
                <span style={{ fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Check size={13} /> ₹0 (Fully Settled)
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="btn-primary" disabled={totalPaise <= 0}>
              {lang === 'gu' ? 'દૈનિક વેચાણ સેવ કરો' : 'Save Daily Total'} ({formatINR(totalPaise)})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
