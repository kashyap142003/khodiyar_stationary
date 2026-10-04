import React, { useState } from 'react';
import { CreditCard, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, getTranslation } from '../../lib/i18n';
import { rupeesToPaise, formatINR } from '../../lib/money';
import { StorageService } from '../../services/storage';
import { calculateCustomerFinancials } from '../../services/businessLogic';
import { CustomerAutocompleteInput } from '../CustomerAutocompleteInput';
import { PaymentMode } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSuccess: () => void;
  defaultCustomerId?: string;
}

export const PaymentReceivedModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lang,
  onSuccess,
  defaultCustomerId,
}) => {
  if (!isOpen) return null;
  const t = getTranslation(lang);

  const customers = StorageService.getCustomers().filter(c => !c.isArchived);
  const sales = StorageService.getSales();
  const payments = StorageService.getCustomerPayments();
  const adjustments = StorageService.getCustomerAdjustments();

  const defaultCust = defaultCustomerId ? customers.find(c => c.id === defaultCustomerId) : null;

  const [customerName, setCustomerName] = useState<string>(defaultCust ? defaultCust.name : '');
  const [customerPhone, setCustomerPhone] = useState<string>(defaultCust ? defaultCust.phone : '');
  const [amount, setAmount] = useState<string>('');
  const [mode, setMode] = useState<PaymentMode>('upi');
  const [reference, setReference] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');

  const matchedCustomer = customers.find(
    c => c.name.toLowerCase() === customerName.trim().toLowerCase()
  );

  const fin = matchedCustomer
    ? calculateCustomerFinancials(matchedCustomer, sales, payments, adjustments)
    : null;

  const currentDuePaise = fin ? fin.balancePaise : 0;
  const paymentPaise = rupeesToPaise(amount || 0);
  const remainingDuePaise = currentDuePaise - paymentPaise;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || paymentPaise <= 0) return;

    // Auto-create or get customer
    const customer = StorageService.getOrCreateCustomerByName(customerName, customerPhone);

    StorageService.addCustomerPayment({
      id: 'cpay_' + Date.now(),
      customerId: customer.id,
      customerName: customer.name,
      paymentDate: new Date(date).toISOString(),
      amountPaise: paymentPaise,
      mode,
      reference: reference.trim() || undefined,
      note: note.trim() || undefined,
      source: 'manual',
      createdAt: new Date().toISOString(),
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}

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
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(5, 150, 105, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
              }}
            >
              <CreditCard size={18} />
            </div>
            <div>
              <h2>{t.receivePayment}</h2>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                {lang === 'gu' ? 'ઉઘરાણી / જૂના બાકી પૈસા જમા લીધા' : 'Collecting pending debt / balance from customer'}
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Freeform Customer Name + History Auto-Suggest */}
            <CustomerAutocompleteInput
              customerName={customerName}
              onChangeName={setCustomerName}
              customerPhone={customerPhone}
              onChangePhone={setCustomerPhone}
              onSelectCustomer={(cust) => {
                setCustomerName(cust.name);
                setCustomerPhone(cust.phone);
              }}
            />

            <div className="form-group">
              <label className="form-label">{t.amount} Received</label>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select
                  className="form-select"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as PaymentMode)}
                >
                  <option value="upi">UPI / GPay / PhonePe</option>
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
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
              <label className="form-label">Ref / UTR / Remarks</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. GPay ref, cheque no, or note"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            {/* Reconciliation Preview Strip */}
            <div
              className="glass-card"
              style={{
                padding: '12px 14px',
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Current Pending Due</span>
                <span style={{ fontWeight: 700 }}>{formatINR(currentDuePaise)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Payment Amount</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>{formatINR(paymentPaise)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 6,
                  borderTop: '1px dashed var(--border-strong)',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  {remainingDuePaise < 0 ? 'Advance Credit' : 'Remaining Due'}
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: remainingDuePaise <= 0 ? '#059669' : '#d97706',
                  }}
                >
                  {formatINR(Math.abs(remainingDuePaise))}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="btn-primary" disabled={paymentPaise <= 0 || !customerName.trim()}>
              Record Collection ({formatINR(paymentPaise)})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
