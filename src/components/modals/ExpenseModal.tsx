import React, { useState } from 'react';
import { Receipt, X } from 'lucide-react';
import { Language, getTranslation } from '../../lib/i18n';
import { rupeesToPaise, formatINR } from '../../lib/money';
import { StorageService } from '../../services/storage';
import { PaymentMode } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSuccess: () => void;
}

export const EXPENSE_CATEGORIES = [
  'Tea & miscellaneous',
  'Transport & freight',
  'Staff salary',
  'Rent',
  'Electricity',
  'Repairs & maintenance',
  'Phone & internet',
  'Packaging & bags',
  'Other',
];

export const ExpenseModal: React.FC<Props> = ({ isOpen, onClose, lang, onSuccess }) => {
  if (!isOpen) return null;
  const t = getTranslation(lang);

  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState<string>('');
  const [mode, setMode] = useState<PaymentMode>('cash');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);

  const amountPaise = rupeesToPaise(amount || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountPaise <= 0) return;

    StorageService.addExpense({
      id: 'exp_' + Date.now(),
      category,
      amountPaise,
      mode,
      expenseDate: new Date(date).toISOString(),
      note: note.trim() || undefined,
      isRecurring,
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
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(232, 121, 249, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e879f9',
              }}
            >
              <Receipt size={18} />
            </div>
            <h2>{t.expense}</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t.amount}</label>
              <div className="amount-input-wrap">
                <span className="currency-prefix">₹</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0"
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select
                  className="form-select"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as PaymentMode)}
                >
                  <option value="cash">Cash Drawer</option>
                  <option value="upi">UPI / Online</option>
                  <option value="bank">Bank Account</option>
                </select>
              </div>

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
            </div>

            <div className="form-group">
              <label className="form-label">{t.notes}</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Refreshments for staff, parcel auto fare"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--accent-primary)' }}
              />
              <label htmlFor="isRecurring" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                Recurring monthly expense (Rent / Salary / Wifi)
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="btn-primary" disabled={amountPaise <= 0}>
              {t.save} ({formatINR(amountPaise)})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
