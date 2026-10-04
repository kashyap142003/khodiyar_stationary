import React, { useState } from 'react';
import { PackagePlus, X } from 'lucide-react';
import { Language, getTranslation } from '../../lib/i18n';
import { rupeesToPaise, formatINR } from '../../lib/money';
import { StorageService } from '../../services/storage';
import { PaymentMode } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSuccess: () => void;
  defaultVendorId?: string;
}

export const PurchaseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lang,
  onSuccess,
  defaultVendorId,
}) => {
  if (!isOpen) return null;
  const t = getTranslation(lang);

  const vendors = StorageService.getVendors().filter(v => !v.isArchived);

  const [selectedVendorId, setSelectedVendorId] = useState<string>(
    defaultVendorId || (vendors[0]?.id || '')
  );
  const [billNumber, setBillNumber] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paidNow, setPaidNow] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('bank');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const selectedVendor = vendors.find(v => v.id === selectedVendorId);

  const totalPaise = rupeesToPaise(amount || 0);
  const paidNowPaise = Math.min(totalPaise, rupeesToPaise(paidNow || 0));
  const payablePaise = Math.max(0, totalPaise - paidNowPaise);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor || totalPaise <= 0) return;

    StorageService.addPurchase({
      id: 'purch_' + Date.now(),
      vendorId: selectedVendor.id,
      vendorName: selectedVendor.name,
      billNumber: billNumber.trim() || undefined,
      purchaseDate: new Date(purchaseDate).toISOString(),
      amountPaise: totalPaise,
      paidNowPaise,
      dueDate: dueDate || undefined,
      paymentMode: paidNowPaise > 0 ? paymentMode : undefined,
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
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24',
              }}
            >
              <PackagePlus size={18} />
            </div>
            <h2>{t.newPurchase}</h2>
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
                    {v.name} (Terms: {v.paymentTermsDays || 30} days)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Bill / Invoice Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. INV-9021"
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Purchase Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  required
                />
              </div>
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
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Paid Advance / Now</label>
                <div className="amount-input-wrap">
                  <span className="currency-prefix">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0"
                    className="form-input"
                    value={paidNow}
                    onChange={(e) => setPaidNow(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select
                  className="form-select"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                  disabled={paidNowPaise <= 0}
                >
                  <option value="bank">Bank (NEFT)</option>
                  <option value="upi">UPI</option>
                  <option value="cheque">Cheque</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date for Remaining</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.notes}</label>
              <input
                type="text"
                className="form-input"
                placeholder="Cartons received, paper reams, notebook bundles"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Review Strip */}
            <div
              className="glass-card"
              style={{
                padding: '14px',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Purchase Total</span>
                <span style={{ fontWeight: 700 }}>{formatINR(totalPaise)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Paid Now</span>
                <span style={{ fontWeight: 700, color: '#34d399' }}>{formatINR(paidNowPaise)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 8,
                  borderTop: '1px dashed var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Payable Created</span>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fb7185' }}>
                  {formatINR(payablePaise)}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="btn-primary" disabled={totalPaise <= 0}>
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
