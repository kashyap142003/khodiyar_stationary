import React, { useState } from 'react';
import { Lock, CheckCircle2, AlertCircle, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, getTranslation } from '../../lib/i18n';
import { rupeesToPaise, formatINR } from '../../lib/money';
import { StorageService } from '../../services/storage';
import { calculateTodayMetrics } from '../../services/businessLogic';
import { parseISO, isToday } from 'date-fns';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSuccess: () => void;
}

export const CashCloseModal: React.FC<Props> = ({ isOpen, onClose, lang, onSuccess }) => {
  if (!isOpen) return null;
  const t = getTranslation(lang);

  const business = StorageService.getBusiness();
  const sales = StorageService.getSales();
  const customerPayments = StorageService.getCustomerPayments();
  const vendorPayments = StorageService.getVendorPayments();
  const expenses = StorageService.getExpenses();

  const todayMetrics = calculateTodayMetrics(sales, customerPayments, expenses);

  // Cash collections
  let cashCollectionsPaise = 0;
  for (const cp of customerPayments) {
    if (!cp.deletedAt && cp.mode === 'cash' && isToday(parseISO(cp.paymentDate))) {
      cashCollectionsPaise += cp.amountPaise;
    }
  }

  // Cash expenses
  let cashExpensesPaise = 0;
  for (const exp of expenses) {
    if (!exp.deletedAt && exp.mode === 'cash' && isToday(parseISO(exp.expenseDate))) {
      cashExpensesPaise += exp.amountPaise;
    }
  }

  // Cash paid to vendors
  let vendorCashPaymentsPaise = 0;
  for (const vp of vendorPayments) {
    if (!vp.deletedAt && vp.mode === 'cash' && isToday(parseISO(vp.paymentDate))) {
      vendorCashPaymentsPaise += vp.amountPaise;
    }
  }

  const openingCashPaise = business.openingCashPaise || 500000;
  const cashSalesPaise = todayMetrics.cashSalesPaise;

  const expectedCashPaise =
    openingCashPaise + cashSalesPaise + cashCollectionsPaise - cashExpensesPaise - vendorCashPaymentsPaise;

  const [actualCashInput, setActualCashInput] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const actualCashPaise = actualCashInput ? rupeesToPaise(actualCashInput) : 0;
  const diffPaise = actualCashInput ? actualCashPaise - expectedCashPaise : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualCashInput) return;

    StorageService.addCashClose({
      id: 'cclose_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      openingCashPaise,
      cashSalesPaise,
      cashCollectionsPaise,
      cashExpensesPaise,
      vendorCashPaymentsPaise,
      expectedCashPaise,
      actualCashPaise,
      diffPaise,
      note: note.trim() || undefined,
      closedAt: new Date().toISOString(),
    });

    if (diffPaise === 0) {
      try {
        confetti({ particleCount: 60, spread: 70 });
      } catch {}
    }

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
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <Lock size={18} />
            </div>
            <h2>{t.cashClose}</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Cash Equation Breakdown */}
            <div
              className="glass-card"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Opening Cash in Drawer</span>
                <span>{formatINR(openingCashPaise)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>+ Cash Sales Today</span>
                <span style={{ color: '#34d399' }}>+{formatINR(cashSalesPaise)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>+ Cash Collections (Dues Recovered)</span>
                <span style={{ color: '#34d399' }}>+{formatINR(cashCollectionsPaise)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>- Cash Expenses</span>
                <span style={{ color: '#fb7185' }}>-{formatINR(cashExpensesPaise)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>- Vendor Cash Payments</span>
                <span style={{ color: '#fb7185' }}>-{formatINR(vendorCashPaymentsPaise)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 10,
                  marginTop: 4,
                  borderTop: '1px solid var(--border-subtle)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                }}
              >
                <span>Expected Drawer Cash</span>
                <span style={{ color: '#38bdf8' }}>{formatINR(expectedCashPaise)}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Actual Physical Cash Counted</label>
              <div className="amount-input-wrap">
                <span className="currency-prefix">₹</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Count notes & coins in drawer"
                  className="form-input"
                  value={actualCashInput}
                  onChange={(e) => setActualCashInput(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Difference Callout */}
            {actualCashInput && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background:
                    diffPaise === 0
                      ? 'rgba(16, 185, 129, 0.15)'
                      : diffPaise < 0
                      ? 'rgba(244, 63, 94, 0.15)'
                      : 'rgba(245, 158, 11, 0.15)',
                  border: `1px solid ${
                    diffPaise === 0
                      ? 'rgba(16, 185, 129, 0.3)'
                      : diffPaise < 0
                      ? 'rgba(244, 63, 94, 0.3)'
                      : 'rgba(245, 158, 11, 0.3)'
                  }`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {diffPaise === 0 ? (
                    <CheckCircle2 size={18} color="#34d399" />
                  ) : (
                    <AlertCircle size={18} color={diffPaise < 0 ? '#fb7185' : '#fbbf24'} />
                  )}
                  <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                    {diffPaise === 0
                      ? 'Perfect Tally (No Difference)'
                      : diffPaise < 0
                      ? 'Shortfall in Drawer'
                      : 'Cash Surplus'}
                  </span>
                </div>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: diffPaise === 0 ? '#34d399' : diffPaise < 0 ? '#fb7185' : '#fbbf24',
                  }}
                >
                  {formatINR(diffPaise)}
                </span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Closing Remarks / Note</label>
              <input
                type="text"
                className="form-input"
                placeholder="Reason for discrepancy or denomination notes"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="btn-primary" disabled={!actualCashInput}>
              Save Daily Cash Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
