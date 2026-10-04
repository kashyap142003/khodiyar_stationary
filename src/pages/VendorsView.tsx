import React, { useState } from 'react';
import {
  Truck,
  Search,
  Plus,
  Phone,
  PackagePlus,
  ArrowUpRight,
  Printer,
  ChevronRight,
  X,
} from 'lucide-react';
import { Language, getTranslation } from '../lib/i18n';
import { formatINR } from '../lib/money';
import { formatDate } from '../lib/dates';
import { StorageService } from '../services/storage';
import { calculateVendorBalance } from '../services/businessLogic';
import { PrivacyValue } from '../components/PrivacyValue';
import { Vendor } from '../types';

interface Props {
  lang: Language;
  isPrivacyMode: boolean;
  onOpenPurchase: (vendorId?: string) => void;
  onOpenPayVendor: (vendorId?: string) => void;
}

export const VendorsView: React.FC<Props> = ({
  lang,
  isPrivacyMode,
  onOpenPurchase,
  onOpenPayVendor,
}) => {
  const t = getTranslation(lang);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'payables'>('all');
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [activeVendorId, setActiveVendorId] = useState<string | null>(null);

  const vendors = StorageService.getVendors().filter(v => !v.isArchived);
  const purchases = StorageService.getPurchases();
  const vendorPayments = StorageService.getVendorPayments();

  // Summary statistics
  let totalToPayPaise = 0;
  let vendorsWithPayablesCount = 0;

  const vendorStatsMap = new Map();
  for (const v of vendors) {
    const fin = calculateVendorBalance(v, purchases, vendorPayments);
    vendorStatsMap.set(v.id, fin);
    if (fin.balancePaise > 0) {
      totalToPayPaise += fin.balancePaise;
      vendorsWithPayablesCount++;
    }
  }

  const filteredVendors = vendors.filter((v) => {
    const fin = vendorStatsMap.get(v.id);
    if (filter === 'payables' && (!fin || fin.balancePaise <= 0)) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return v.name.toLowerCase().includes(q) || v.phone.includes(q);
    }
    return true;
  });

  // State for new vendor
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [terms, setTerms] = useState('30');
  const [openingBal, setOpeningBal] = useState('');

  const handleAddVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newVendor: Vendor = {
      id: 'vend_' + Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      paymentTermsDays: parseInt(terms) || 30,
      openingBalancePaise: openingBal ? Math.round(parseFloat(openingBal) * 100) : 0,
      openingBalanceDate: new Date().toISOString().split('T')[0],
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveVendor(newVendor);
    setIsAddVendorOpen(false);
    setName('');
    setPhone('');
    setAddress('');
    setOpeningBal('');
  };

  const activeVendor = vendors.find(v => v.id === activeVendorId);
  const activeFin = activeVendor ? calculateVendorBalance(activeVendor, purchases, vendorPayments) : null;

  const activeVendorPurchases = activeVendor
    ? purchases.filter(p => p.vendorId === activeVendor.id && !p.deletedAt)
    : [];
  const activeVendorPaymentsList = activeVendor
    ? vendorPayments.filter(vp => vp.vendorId === activeVendor.id && !vp.deletedAt)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t.vendors}</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Supplier payables & invoice settlement tracking
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={() => onOpenPurchase()} style={{ padding: '8px 14px' }}>
            <PackagePlus size={16} color="#fbbf24" />
            <span>{t.newPurchase}</span>
          </button>
          <button className="btn-primary" onClick={() => setIsAddVendorOpen(true)}>
            <Plus size={16} />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        <div className="glass-card" style={{ padding: 14 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            {t.kpiToPay}
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: 4, color: '#fb7185' }}>
            <PrivacyValue paise={totalToPayPaise} isPrivacyMode={isPrivacyMode} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 2 }}>
            {vendorsWithPayablesCount} vendors pending payment
          </div>
        </div>

        <div className="glass-card" style={{ padding: 14 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Active Suppliers
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: 4, color: 'var(--text-main)' }}>
            {vendors.length}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 2 }}>
            Notebooks, Copier paper, Pens
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn-secondary ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              background: filter === 'all' ? 'var(--accent-primary)' : undefined,
              color: filter === 'all' ? '#fff' : undefined,
            }}
          >
            {t.all} ({vendors.length})
          </button>
          <button
            className={`btn-secondary ${filter === 'payables' ? 'active' : ''}`}
            onClick={() => setFilter('payables')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              background: filter === 'payables' ? 'var(--accent-primary)' : undefined,
              color: filter === 'payables' ? '#fff' : undefined,
            }}
          >
            Has Dues ({vendorsWithPayablesCount})
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
            placeholder="Search suppliers by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Vendor List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredVendors.length === 0 ? (
          <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-dim)' }}>
            No vendors found.
          </div>
        ) : (
          filteredVendors.map((vendor) => {
            const fin = vendorStatsMap.get(vendor.id);
            const balancePaise = fin ? fin.balancePaise : 0;

            return (
              <div
                key={vendor.id}
                className="glass-card"
                onClick={() => setActiveVendorId(vendor.id)}
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(244, 63, 94, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fb7185',
                      fontWeight: 700,
                    }}
                  >
                    <Truck size={20} />
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                      {vendor.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 2 }}>
                      {vendor.phone} • Terms: {vendor.paymentTermsDays || 30} days
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        color: balancePaise > 0 ? '#fb7185' : '#34d399',
                      }}
                    >
                      <PrivacyValue paise={balancePaise} isPrivacyMode={isPrivacyMode} />
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      {balancePaise > 0 ? 'To Pay' : 'All Cleared'}
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--text-dim)" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Vendor Drawer / Detailed Ledger Modal */}
      {activeVendor && activeFin && (
        <div className="modal-overlay" onClick={() => setActiveVendorId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <div>
                <h2>{activeVendor.name}</h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', gap: 10, marginTop: 2 }}>
                  <span>{activeVendor.phone}</span>
                  <span>•</span>
                  <span>{activeVendor.address || 'Supplier'}</span>
                  <span>•</span>
                  <span>Terms: {activeVendor.paymentTermsDays || 30} days</span>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setActiveVendorId(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Action Ribbon */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                padding: '12px 20px',
                background: 'rgba(0, 0, 0, 0.25)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <button
                className="btn-secondary"
                style={{ padding: '8px 10px', fontSize: '0.78rem' }}
                onClick={() => {
                  setActiveVendorId(null);
                  onOpenPurchase(activeVendor.id);
                }}
              >
                <PackagePlus size={14} color="#fbbf24" />
                <span>+ Purchase Bill</span>
              </button>

              <button
                className="btn-primary"
                style={{ padding: '8px 10px', fontSize: '0.78rem' }}
                onClick={() => {
                  setActiveVendorId(null);
                  onOpenPayVendor(activeVendor.id);
                }}
              >
                <ArrowUpRight size={14} />
                <span>Pay Supplier</span>
              </button>

              <button
                className="btn-secondary"
                style={{ padding: '8px 10px', fontSize: '0.78rem' }}
                onClick={() => {
                  if (activeVendor.phone) window.open(`tel:${activeVendor.phone}`);
                }}
              >
                <Phone size={14} color="#34d399" />
                <span>Call Supplier</span>
              </button>
            </div>

            <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div className="glass-card" style={{ padding: 12 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current Payable</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 4, color: '#fb7185' }}>
                  <PrivacyValue paise={activeFin.balancePaise} isPrivacyMode={isPrivacyMode} />
                </div>
              </div>

              <div className="glass-card" style={{ padding: 12 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Purchases</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 4 }}>
                  <PrivacyValue paise={activeFin.totalPurchasesPaise} isPrivacyMode={isPrivacyMode} />
                </div>
              </div>

              <div className="glass-card" style={{ padding: 12 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Paid</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 4, color: '#34d399' }}>
                  <PrivacyValue paise={activeFin.totalPaymentsPaise} isPrivacyMode={isPrivacyMode} />
                </div>
              </div>
            </div>

            {/* Purchases & Payments tabs */}
            <div style={{ padding: '0 20px 20px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 8 }}>
                Purchases & Payments Statement
              </div>

              <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.05)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '8px 12px' }}>Date</th>
                      <th style={{ padding: '8px 12px' }}>Type / Ref</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Bill Amt</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeVendorPurchases.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 12px', color: 'var(--text-dim)' }}>{formatDate(p.purchaseDate)}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Purchase Bill {p.billNumber ? `#${p.billNumber}` : ''}</div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>{p.note || ''}</div>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#fb7185' }}>
                          {formatINR(p.amountPaise, isPrivacyMode)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#34d399' }}>
                          {p.paidNowPaise > 0 ? formatINR(p.paidNowPaise, isPrivacyMode) : '—'}
                        </td>
                      </tr>
                    ))}
                    {activeVendorPaymentsList.map((vp) => (
                      <tr key={vp.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 12px', color: 'var(--text-dim)' }}>{formatDate(vp.paymentDate)}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 600, color: '#34d399' }}>Vendor Payment ({vp.mode.toUpperCase()})</div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>{vp.reference || vp.note || ''}</div>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>—</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#34d399' }}>
                          {formatINR(vp.amountPaise, isPrivacyMode)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => window.print()}>
                <Printer size={16} />
                <span>Print Vendor Statement</span>
              </button>
              <button className="btn-secondary" onClick={() => setActiveVendorId(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {isAddVendorOpen && (
        <div className="modal-overlay" onClick={() => setIsAddVendorOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Supplier / Vendor</h2>
              <button className="btn-icon" onClick={() => setIsAddVendorOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddVendorSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Vendor / Company Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Navneet Education Ltd / Camlin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="022-..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Terms (Days)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Depot / Warehouse Address</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Area, City"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Opening Payable Due (₹)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    className="form-input"
                    placeholder="0"
                    value={openingBal}
                    onChange={(e) => setOpeningBal(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddVendorOpen(false)}>
                  {t.cancel}
                </button>
                <button type="submit" className="btn-primary">
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
