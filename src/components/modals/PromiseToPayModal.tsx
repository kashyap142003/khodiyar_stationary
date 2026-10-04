import React, { useState } from 'react';
import { CalendarCheck, X } from 'lucide-react';
import { Language, getTranslation } from '../../lib/i18n';
import { rupeesToPaise, formatINR } from '../../lib/money';
import { StorageService } from '../../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSuccess: () => void;
  defaultCustomerId?: string;
  defaultAmountPaise?: number;
}

export const PromiseToPayModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lang,
  onSuccess,
  defaultCustomerId,
  defaultAmountPaise,
}) => {
  if (!isOpen) return null;
  const t = getTranslation(lang);

  const customers = StorageService.getCustomers().filter(c => !c.isArchived);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    defaultCustomerId || (customers[0]?.id || '')
  );
  const [amount, setAmount] = useState<string>(
    defaultAmountPaise ? (defaultAmountPaise / 100).toString() : ''
  );
  const [promisedDate, setPromisedDate] = useState<string>(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] // 3 days default
  );
  const [note, setNote] = useState<string>('');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const amountPaise = rupeesToPaise(amount || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || amountPaise <= 0) return;

    StorageService.savePromiseToPay({
      id: 'prom_' + Date.now(),
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      amountPaise,
      promisedFor: promisedDate,
      note: note.trim() || undefined,
      status: 'open',
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
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <CalendarCheck size={18} />
            </div>
            <h2>{t.promiseToPay}</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">{t.customers}</label>
              <select
                className="form-select"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.segment}) - {c.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Promised Amount</label>
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

            <div className="form-group">
              <label className="form-label">Promised Date</label>
              <input
                type="date"
                className="form-input"
                value={promisedDate}
                onChange={(e) => setPromisedDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.notes}</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Promised to transfer via GPay by evening"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              * Promise to Pay will notify you on {promisedDate} and will automatically mark itself as fulfilled as soon as customer payment is recorded.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="btn-primary" disabled={amountPaise <= 0}>
              Save Promise ({formatINR(amountPaise)})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
