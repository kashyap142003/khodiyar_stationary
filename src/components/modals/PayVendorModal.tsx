import React, { useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { Language, getTranslation } from '../../lib/i18n';
import { rupeesToPaise, formatINR } from '../../lib/money';
import { StorageService } from '../../services/storage';
import { calculateVendorBalance } from '../../services/businessLogic';
import { PaymentMode } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSuccess: () => void;
  defaultVendorId?: string;
}

export const PayVendorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lang,
  onSuccess,
  defaultVendorId,
}) => {
  if (!isOpen) return null;
  const t = getTranslation(lang);

  const vendors = StorageService.getVendors().filter(v => !v.isArchived);
  const purchases = StorageService.getPurchases();
  const payments = StorageService.getVendorPayments();

  const [selectedVendorId, setSelectedVendorId] = useState<string>(
    defaultVendorId || (vendors[0]?.id || '')
  );
  const [amount, setAmount] = useState<string>('');
  const [mode, setMode] = useState<PaymentMode>('bank');
  const [reference, setReference] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');

  const selectedVendor = vendors.find(v => v.id === selectedVendorId);
  const vFin = selectedVendor
    ? calculateVendorBalance(selectedVendor, purchases, payments)
    : null;

  const currentPayablePaise = vFin ? vFin.balancePaise : 0;
  const paymentPaise = rupeesToPaise(amount || 0);
  const remainingPayablePaise = Math.max(0, currentPayablePaise - paymentPaise);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor || paymentPaise <= 0) return;

    StorageService.addVendorPayment({
      id: 'vpay_' + Date.now(),
      vendorId: selectedVendor.id,
      vendorName: selectedVendor.name,
      paymentDate: new Date(date).toISOString(),
      amountPaise: paymentPaise,
      mode,
      reference: reference.trim() || undefined,
      note: note.trim() || undefined,
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
                background: 'rgba(244, 63, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fb7185',
              }}
            >
              <ArrowUpRight size={18} />
            </div>
            <h2>{t.payVendor}</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">{t.vendors}</label>
              <select
                className="form-select"
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                required
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} - Payable: {formatINR(calculateVendorBalance(v, purchases, payments).balancePaise)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t.amount} to Pay</label>
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
                  <option value="bank">Bank (NEFT / RTGS)</option>
                  <option value="upi">UPI</option>
                  <option value="cheque">Cheque</option>
                  <option value="cash">Cash</option>
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
              <label className="form-label">NEFT Ref / Cheque No.</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. UTR-3948102"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.notes}</label>
              <input
                type="text"
                className="form-input"
                placeholder="Remarks"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Reconciliation Preview */}
            <div
              className="glass-card"
              style={{
                padding: '14px',
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Due</span>
                <span style={{ fontWeight: 700 }}>{formatINR(currentPayablePaise)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Payment</span>
                <span style={{ fontWeight: 700, color: '#fb7185' }}>{formatINR(paymentPaise)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 8,
                  borderTop: '1px dashed var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Remaining Payable</span>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                  {formatINR(remainingPayablePaise)}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="btn-primary" disabled={paymentPaise <= 0}>
              Record Vendor Payment ({formatINR(paymentPaise)})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
