import React, { useState } from 'react';
import { PhoneCall, X } from 'lucide-react';
import { Language, getTranslation } from '../../lib/i18n';
import { rupeesToPaise, formatINR } from '../../lib/money';
import { StorageService } from '../../services/storage';
import { FollowupStatus, CustomerSegment } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSuccess: () => void;
  defaultCustomerId?: string;
}

export const FollowupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lang,
  onSuccess,
  defaultCustomerId,
}) => {
  if (!isOpen) return null;
  const t = getTranslation(lang);

  const customers = StorageService.getCustomers().filter(c => !c.isArchived);

  const [isExistingCust, setIsExistingCust] = useState<boolean>(!!defaultCustomerId);
  const [customerId, setCustomerId] = useState<string>(defaultCustomerId || (customers[0]?.id || ''));
  const [personName, setPersonName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [segment, setSegment] = useState<CustomerSegment>('School');
  const [requirement, setRequirement] = useState<string>('');
  const [estimatedValue, setEstimatedValue] = useState<string>('');
  const [status, setStatus] = useState<FollowupStatus>('new');
  const [followUpDate, setFollowUpDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow default
  );
  const [notes, setNotes] = useState<string>('');

  const selectedCust = customers.find(c => c.id === customerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const name = isExistingCust && selectedCust ? selectedCust.name : personName.trim();
    if (!name || !requirement.trim()) return;

    StorageService.saveFollowup({
      id: 'fol_' + Date.now(),
      customerId: isExistingCust && selectedCust ? selectedCust.id : undefined,
      personName: name,
      phone: (isExistingCust && selectedCust ? selectedCust.phone : phone).trim() || undefined,
      segment: isExistingCust && selectedCust ? selectedCust.segment : segment,
      requirement: requirement.trim(),
      estimatedValuePaise: estimatedValue ? rupeesToPaise(estimatedValue) : undefined,
      status,
      followUpAt: new Date(followUpDate).toISOString(),
      notes: notes.trim() || undefined,
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
                background: 'rgba(45, 212, 191, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2dd4bf',
              }}
            >
              <PhoneCall size={18} />
            </div>
            <h2>{t.newFollowup}</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="custType"
                  checked={!isExistingCust}
                  onChange={() => setIsExistingCust(false)}
                />
                <span>New Prospect / Inquiry</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="custType"
                  checked={isExistingCust}
                  onChange={() => setIsExistingCust(true)}
                />
                <span>Existing Customer</span>
              </label>
            </div>

            {isExistingCust ? (
              <div className="form-group">
                <label className="form-label">{t.customers}</label>
                <select
                  className="form-select"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.segment}) - {c.phone}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Person / Business Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Navsarjan Tuition Classes"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="98250..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Segment</label>
                <select
                  className="form-select"
                  value={segment}
                  onChange={(e) => setSegment(e.target.value as CustomerSegment)}
                >
                  <option value="School">School / College</option>
                  <option value="Office">Office / Business</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Stage</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FollowupStatus)}
                >
                  <option value="new">New Inquiry</option>
                  <option value="contacted">Contacted</option>
                  <option value="interested">Interested</option>
                  <option value="quotation">Quotation Given</option>
                  <option value="won">Won (Order Confirmed)</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Requirement / Details</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="e.g. Annual exam papers, 20 reams photocopy paper, 100 geometry boxes"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Estimated Value</label>
                <div className="amount-input-wrap">
                  <span className="currency-prefix">₹</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    className="form-input"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Follow-up Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <input
                type="text"
                className="form-input"
                placeholder="Owner remarks or timing notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="btn-primary">
              Save Follow-up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
