import React, { useState, useEffect } from 'react';
import { UserCheck, AlertTriangle, Info, X } from 'lucide-react';
import { Language, getTranslation } from '../../lib/i18n';
import { rupeesToPaise, formatINR } from '../../lib/money';
import { StorageService } from '../../services/storage';
import { calculateCustomerFinancials } from '../../services/businessLogic';
import { CustomerAutocompleteInput } from '../CustomerAutocompleteInput';
import { Customer } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSuccess: () => void;
  defaultCustomerId?: string;
}

export const CustomerSaleModal: React.FC<Props> = ({
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
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [receivedNow, setReceivedNow] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi'>('upi');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');

  // Find if current name matches an existing customer
  const matchedCustomer = customers.find(
    c => c.name.toLowerCase() === customerName.trim().toLowerCase()
  );

  const fin = matchedCustomer
    ? calculateCustomerFinancials(matchedCustomer, sales, payments, adjustments)
    : null;

  const totalPaise = rupeesToPaise(totalAmount || 0);
  const receivedPaise = Math.min(totalPaise, rupeesToPaise(receivedNow || 0));
  const creditPaise = Math.max(0, totalPaise - receivedPaise);

  const currentBalancePaise = fin ? fin.balancePaise : 0;
  const resultingBalancePaise = currentBalancePaise + creditPaise;

  const isLimitExceeded = matchedCustomer?.creditLimitPaise
    ? resultingBalancePaise > matchedCustomer.creditLimitPaise
    : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || totalPaise <= 0) return;

    // Get or auto-create customer seamlessly
    const customer = StorageService.getOrCreateCustomerByName(customerName, customerPhone);

    const cashPaise = paymentMode === 'cash' ? receivedPaise : 0;
    const upiPaise = paymentMode === 'upi' ? receivedPaise : 0;

    StorageService.addSale({
      id: 'sale_' + Date.now(),
      customerId: customer.id,
      customerName: customer.name,
      saleType: 'customer',
      saleDate: new Date(date).toISOString(),
      totalPaise,
      cashPaise,
      upiPaise,
      otherPaidPaise: 0,
      creditPaise,
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
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(79, 70, 229, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5',
              }}
            >
              <UserCheck size={18} />
            </div>
            <div>
              <h2>{t.customerSale}</h2>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                {lang === 'gu'
                  ? 'સ્કૂલ, કોચિંગ અને ઉધાર ગ્રાહકો માટે (ખાતાવહી નોંધ)'
                  : 'For schools, coaching, lease buyers & credit accounts'}
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

            {/* Current Balance Notice */}
            {matchedCustomer && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-secondary)',
                  fontSize: '0.8rem',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>Previous Unpaid Balance:</span>
                <span style={{ fontWeight: 700, color: currentBalancePaise > 0 ? '#d97706' : '#059669' }}>
                  {formatINR(currentBalancePaise)}
                </span>
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

            <div className="form-group">
              <label className="form-label">Total Bill Amount</label>
              <div className="amount-input-wrap">
                <span className="currency-prefix">₹</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0"
                  className="form-input"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">Amount Paid Now (₹)</label>
                <div className="amount-input-wrap">
                  <span className="currency-prefix">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0"
                    className="form-input"
                    value={receivedNow}
                    onChange={(e) => setReceivedNow(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Paid Mode</label>
                <select
                  className="form-select"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                >
                  <option value="upi">UPI / GPay</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t.notes}</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 50 longbooks, bill ref, Xerox"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Financial Impact Breakdown */}
            <div
              className="glass-card"
              style={{
                padding: '12px 14px',
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Bill Value</span>
                <span style={{ fontWeight: 700 }}>{formatINR(totalPaise)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Paid Now</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>{formatINR(receivedPaise)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t.kpiCreditGiven}</span>
                <span style={{ fontWeight: 700, color: '#d97706' }}>{formatINR(creditPaise)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 6,
                  borderTop: '1px dashed var(--border-strong)',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Customer New Balance</span>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                  {formatINR(resultingBalancePaise)}
                </span>
              </div>
            </div>

            {/* Credit Limit Alert Banner */}
            {isLimitExceeded && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-amber-bg)',
                  border: '1px solid var(--accent-amber-border)',
                  color: 'var(--accent-amber)',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <AlertTriangle size={16} />
                <span>
                  Resulting balance exceeds credit limit of{' '}
                  {formatINR(matchedCustomer?.creditLimitPaise || 0)}
                </span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="btn-primary" disabled={totalPaise <= 0 || !customerName.trim()}>
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
