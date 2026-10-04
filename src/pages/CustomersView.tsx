import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  CreditCard,
  UserCheck,
  CalendarCheck,
  Printer,
  ChevronRight,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Language, getTranslation } from '../lib/i18n';
import { formatINR } from '../lib/money';
import { formatDate } from '../lib/dates';
import { StorageService } from '../services/storage';
import { calculateCustomerFinancials } from '../services/businessLogic';
import { PrivacyValue } from '../components/PrivacyValue';
import { InfoButton } from '../components/InfoButton';
import { Customer, CustomerSegment } from '../types';

interface Props {
  lang: Language;
  isPrivacyMode: boolean;
  selectedCustomerId?: string | null;
  onClearSelectedCustomer: () => void;
  onOpenCustomerSale: (customerId: string) => void;
  onReceivePayment: (customerId: string) => void;
  onOpenPromiseToPay: (customerId: string, amountPaise: number) => void;
  onOpenInfo: (docId: string) => void;
}

export const CustomersView: React.FC<Props> = ({
  lang,
  isPrivacyMode,
  selectedCustomerId,
  onClearSelectedCustomer,
  onOpenCustomerSale,
  onReceivePayment,
  onOpenPromiseToPay,
  onOpenInfo,
}) => {
  const t = getTranslation(lang);
  const isGu = lang === 'gu';

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'dues' | 'overdue' | 'advance'>('all');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [activeLedgerCustomerId, setActiveLedgerCustomerId] = useState<string | null>(
    selectedCustomerId || null
  );

  const customers = StorageService.getCustomers().filter(c => !c.isArchived);
  const sales = StorageService.getSales();
  const payments = StorageService.getCustomerPayments();
  const adjustments = StorageService.getCustomerAdjustments();

  // Summary statistics
  let totalToCollectPaise = 0;
  let totalOverduePaise = 0;
  let totalAdvancePaise = 0;
  let customersWithDuesCount = 0;

  const customerStatsMap = new Map();
  for (const c of customers) {
    const fin = calculateCustomerFinancials(c, sales, payments, adjustments);
    customerStatsMap.set(c.id, fin);
    if (fin.balancePaise > 0) {
      totalToCollectPaise += fin.balancePaise;
      customersWithDuesCount++;
      if (fin.oldestDueDays >= 30) {
        totalOverduePaise += fin.balancePaise;
      }
    } else if (fin.balancePaise < 0) {
      totalAdvancePaise += Math.abs(fin.balancePaise);
    }
  }

  const filteredCustomers = customers.filter((c) => {
    const fin = customerStatsMap.get(c.id);
    if (filter === 'dues' && (!fin || fin.balancePaise <= 0)) return false;
    if (filter === 'overdue' && (!fin || fin.balancePaise <= 0 || fin.oldestDueDays < 30)) return false;
    if (filter === 'advance' && (!fin || fin.balancePaise >= 0)) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.segment.toLowerCase().includes(q);
    }
    return true;
  });

  // State for adding a new customer
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustSegment, setNewCustSegment] = useState<CustomerSegment>('Retail');
  const [newCustCreditLimit, setNewCustCreditLimit] = useState('');
  const [newCustOpeningBal, setNewCustOpeningBal] = useState('');

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const newCust: Customer = {
      id: 'cust_' + Date.now(),
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim(),
      segment: newCustSegment,
      creditLimitPaise: newCustCreditLimit ? Math.round(parseFloat(newCustCreditLimit) * 100) : undefined,
      openingBalancePaise: newCustOpeningBal ? Math.round(parseFloat(newCustOpeningBal) * 100) : 0,
      openingBalanceDate: new Date().toISOString().split('T')[0],
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveCustomer(newCust);
    setIsAddCustomerOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setNewCustCreditLimit('');
    setNewCustOpeningBal('');
  };

  // Selected customer for full Ledger Modal / Drawer
  const activeCustomer = customers.find(c => c.id === activeLedgerCustomerId);
  const activeFin = activeCustomer ? calculateCustomerFinancials(activeCustomer, sales, payments, adjustments) : null;

  // Build unified ledger for active customer
  const activeLedgerItems = activeCustomer
    ? [
        ...(activeCustomer.openingBalancePaise > 0
          ? [
              {
                id: 'op_' + activeCustomer.id,
                date: activeCustomer.openingBalanceDate || activeCustomer.createdAt,
                type: 'Opening Balance',
                description: 'Starting balance from previous records',
                debit: activeCustomer.openingBalancePaise,
                credit: 0,
              },
            ]
          : []),
        ...sales
          .filter(s => s.customerId === activeCustomer.id && !s.deletedAt)
          .map(s => ({
            id: s.id,
            date: s.saleDate,
            type: 'Customer Sale',
            description: s.note || `Bill total: ₹${(s.totalPaise / 100).toLocaleString('en-IN')}`,
            debit: s.creditPaise, // Unpaid portion added to balance
            credit: 0,
          })),
        ...payments
          .filter(p => p.customerId === activeCustomer.id && !p.deletedAt)
          .map(p => ({
            id: p.id,
            date: p.paymentDate,
            type: 'Payment Received',
            description: `${p.mode.toUpperCase()} ${p.reference || ''} ${p.note || ''}`,
            debit: 0,
            credit: p.amountPaise,
          })),
        ...adjustments
          .filter(a => a.customerId === activeCustomer.id && !a.deletedAt)
          .map(a => ({
            id: a.id,
            date: a.adjustmentDate,
            type: `Adjustment (${a.adjustmentType})`,
            description: a.reason,
            debit: 0,
            credit: a.amountPaise,
          })),
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {isGu ? 'ગ્રાહક ખાતાવહી અને હિસાબ' : 'Customer Ledgers & History'}
            </h2>
            <InfoButton docId="customer_sale" onClick={onOpenInfo} size={15} color="#4f46e5" />
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {isGu
              ? 'સ્કૂલ, કોચિંગ અને ઉધાર ગ્રાહકોની ખાતાવહી અને વ્યવહાર ઇતિહાસ'
              : 'Customer credit ledger, dues & individual transaction history'}
          </p>
        </div>

        <button className="btn-primary" onClick={() => setIsAddCustomerOpen(true)}>
          <Plus size={16} />
          <span>{isGu ? 'નવા ગ્રાહક' : 'Add Customer'}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <div className="glass-card" style={{ padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              {t.kpiToCollect}
            </div>
            <InfoButton docId="collections" onClick={onOpenInfo} size={13} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: 4, color: '#d97706' }}>
            <PrivacyValue paise={totalToCollectPaise} isPrivacyMode={isPrivacyMode} />
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 }}>
            {customersWithDuesCount} {isGu ? 'ખાતા બાકી' : 'pending'}
          </div>
        </div>

        <div className="glass-card" style={{ padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#e11d48', textTransform: 'uppercase', fontWeight: 700 }}>
              {t.overdue} (&gt;30d)
            </div>
            <InfoButton docId="fifo_ageing" onClick={onOpenInfo} size={13} color="#e11d48" />
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#e11d48', marginTop: 4 }}>
            <PrivacyValue paise={totalOverduePaise} isPrivacyMode={isPrivacyMode} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: 12 }}>
          <div style={{ fontSize: '0.7rem', color: '#059669', textTransform: 'uppercase', fontWeight: 700 }}>
            {t.advance}
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669', marginTop: 4 }}>
            <PrivacyValue paise={totalAdvancePaise} isPrivacyMode={isPrivacyMode} />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          <button
            className={`btn-secondary ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              background: filter === 'all' ? 'var(--accent-primary)' : undefined,
              color: filter === 'all' ? '#fff' : undefined,
            }}
          >
            {t.all} ({customers.length})
          </button>
          <button
            className={`btn-secondary ${filter === 'dues' ? 'active' : ''}`}
            onClick={() => setFilter('dues')}
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              background: filter === 'dues' ? 'var(--accent-primary)' : undefined,
              color: filter === 'dues' ? '#fff' : undefined,
            }}
          >
            Has Dues ({customersWithDuesCount})
          </button>
          <button
            className={`btn-secondary ${filter === 'overdue' ? 'active' : ''}`}
            onClick={() => setFilter('overdue')}
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              background: filter === 'overdue' ? 'var(--accent-primary)' : undefined,
              color: filter === 'overdue' ? '#fff' : undefined,
            }}
          >
            {t.overdue}
          </button>
          <button
            className={`btn-secondary ${filter === 'advance' ? 'active' : ''}`}
            onClick={() => setFilter('advance')}
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              background: filter === 'advance' ? 'var(--accent-primary)' : undefined,
              color: filter === 'advance' ? '#fff' : undefined,
            }}
          >
            {t.advance}
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
            placeholder="Search by customer name, phone, or segment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Customer List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filteredCustomers.length === 0 ? (
          <div className="glass-card" style={{ padding: 28, textAlign: 'center', color: 'var(--text-dim)' }}>
            No customers found.
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const fin = customerStatsMap.get(cust.id);
            const balancePaise = fin ? fin.balancePaise : 0;
            const oldestDays = fin ? fin.oldestDueDays : 0;

            return (
              <div
                key={cust.id}
                className="glass-card"
                onClick={() => setActiveLedgerCustomerId(cust.id)}
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 'var(--radius-sm)',
                      background: balancePaise > 0 ? 'var(--accent-amber-bg)' : '#eef2ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: balancePaise > 0 ? '#d97706' : '#4f46e5',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  >
                    {cust.name.substring(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{cust.name}</span>
                      <span className="badge badge-indigo" style={{ fontSize: '0.62rem' }}>
                        {cust.segment}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2, display: 'flex', gap: 8 }}>
                      <span>{cust.phone || 'No phone'}</span>
                      {oldestDays > 0 && balancePaise > 0 && (
                        <span style={{ color: oldestDays >= 30 ? '#e11d48' : '#d97706', fontWeight: 600 }}>
                          • {oldestDays}d due
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        color: balancePaise > 0 ? '#d97706' : balancePaise < 0 ? '#059669' : 'var(--text-dim)',
                      }}
                    >
                      <PrivacyValue paise={balancePaise} isPrivacyMode={isPrivacyMode} />
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                      {balancePaise > 0 ? 'To Collect' : balancePaise < 0 ? 'Advance Held' : 'Settled'}
                    </div>
                  </div>
                  <ChevronRight size={16} color="var(--text-dim)" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Full Customer Ledger & Statement Drawer Modal */}
      {activeCustomer && activeFin && (
        <div className="modal-overlay" onClick={() => setActiveLedgerCustomerId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div>
                <h2>{activeCustomer.name}</h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', gap: 8, marginTop: 2 }}>
                  <span>{activeCustomer.phone || 'No phone'}</span>
                  <span>•</span>
                  <span>{activeCustomer.address || 'Anand'}</span>
                  <span>•</span>
                  <span className="badge badge-indigo">{activeCustomer.segment}</span>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setActiveLedgerCustomerId(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Quick Action Ribbon */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 6,
                padding: '10px 16px',
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <button
                className="btn-secondary"
                style={{ padding: '7px 8px', fontSize: '0.75rem' }}
                onClick={() => {
                  setActiveLedgerCustomerId(null);
                  onOpenCustomerSale(activeCustomer.id);
                }}
              >
                <UserCheck size={13} color="#4f46e5" />
                <span>+ Sale</span>
              </button>

              <button
                className="btn-primary"
                style={{ padding: '7px 8px', fontSize: '0.75rem' }}
                onClick={() => {
                  setActiveLedgerCustomerId(null);
                  onReceivePayment(activeCustomer.id);
                }}
              >
                <CreditCard size={13} />
                <span>+ Payment</span>
              </button>

              <button
                className="btn-secondary"
                style={{ padding: '7px 8px', fontSize: '0.75rem' }}
                onClick={() => {
                  if (activeCustomer.phone) window.open(`tel:${activeCustomer.phone}`);
                }}
              >
                <Phone size={13} color="#059669" />
                <span>Call</span>
              </button>

              <button
                className="btn-secondary"
                style={{ padding: '7px 8px', fontSize: '0.75rem' }}
                onClick={() => {
                  setActiveLedgerCustomerId(null);
                  onOpenPromiseToPay(activeCustomer.id, activeFin.balancePaise);
                }}
              >
                <CalendarCheck size={13} color="#d97706" />
                <span>Promise</span>
              </button>
            </div>

            {/* Customer Insight Strip */}
            <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <div className="glass-card" style={{ padding: 10 }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Current Balance</div>
                <div
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    marginTop: 2,
                    color: activeFin.balancePaise > 0 ? '#d97706' : '#059669',
                  }}
                >
                  <PrivacyValue paise={activeFin.balancePaise} isPrivacyMode={isPrivacyMode} />
                </div>
              </div>

              <div className="glass-card" style={{ padding: 10 }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Credit Limit</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 2 }}>
                  {activeCustomer.creditLimitPaise ? formatINR(activeCustomer.creditLimitPaise, isPrivacyMode) : 'No limit'}
                </div>
              </div>

              <div className="glass-card" style={{ padding: 10 }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Oldest Due Age</div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    marginTop: 2,
                    color: activeFin.oldestDueDays >= 30 ? '#e11d48' : 'var(--text-main)',
                  }}
                >
                  {activeFin.oldestDueDays > 0 ? `${activeFin.oldestDueDays} days` : 'Cleared'}
                </div>
              </div>
            </div>

            {/* Detailed Ledger Transactions Table */}
            <div style={{ padding: '0 16px 16px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span>Ledger Statement History</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  {activeLedgerItems.length} transactions
                </span>
              </div>

              <div
                style={{
                  maxHeight: 220,
                  overflowY: 'auto',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '8px 10px' }}>Date</th>
                      <th style={{ padding: '8px 10px' }}>Transaction</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Debit (+)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Credit (-)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeLedgerItems.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '8px 10px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                          {formatDate(item.date)}
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.type}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{item.description}</div>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: item.debit > 0 ? '#d97706' : 'inherit' }}>
                          {item.debit > 0 ? formatINR(item.debit, isPrivacyMode) : '—'}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: item.credit > 0 ? '#059669' : 'inherit' }}>
                          {item.credit > 0 ? formatINR(item.credit, isPrivacyMode) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.print()}
              >
                <Printer size={15} />
                <span>Print Statement</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveLedgerCustomerId(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddCustomerOpen && (
        <div className="modal-overlay" onClick={() => setIsAddCustomerOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Customer Account</h2>
              <button className="btn-icon" onClick={() => setIsAddCustomerOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Customer / Institution Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Sardar Patel School / Rajesh Patel"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="98250..."
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Customer Segment</label>
                    <select
                      className="form-select"
                      value={newCustSegment}
                      onChange={(e) => setNewCustSegment(e.target.value as CustomerSegment)}
                    >
                      <option value="School">School / Coaching</option>
                      <option value="Office">Office / Business</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Retail">Retail</option>
                      <option value="Wholesale">Wholesale</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address / Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Street, Area, Anand"
                    value={newCustAddress}
                    onChange={(e) => setNewCustAddress(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="form-group">
                    <label className="form-label">Credit Limit (₹)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="form-input"
                      placeholder="e.g. 25000"
                      value={newCustCreditLimit}
                      onChange={(e) => setNewCustCreditLimit(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Opening Due (₹)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="form-input"
                      placeholder="0"
                      value={newCustOpeningBal}
                      onChange={(e) => setNewCustOpeningBal(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddCustomerOpen(false)}>
                  {t.cancel}
                </button>
                <button type="submit" className="btn-primary">
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
