import React, { useState } from 'react';
import {
  Bell,
  X,
  Phone,
  MessageSquare,
  ArrowRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Wallet,
  ShieldAlert,
  User,
} from 'lucide-react';
import { Language, getTranslation } from '../lib/i18n';
import { BusinessAlert, Customer } from '../types';
import { StorageService } from '../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  alerts: BusinessAlert[];
  onOpenReceivePayment: (customerId: string, defaultAmount?: number) => void;
  onOpenCustomerDetail: (customerId: string) => void;
  onOpenPromiseToPay?: (customerId: string, amountPaise?: number) => void;
}

export const AlertsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lang,
  alerts,
  onOpenReceivePayment,
  onOpenCustomerDetail,
  onOpenPromiseToPay,
}) => {
  if (!isOpen) return null;
  const t = getTranslation(lang);
  const isGu = lang === 'gu';

  const [activeFilter, setActiveFilter] = useState<'all' | 'promises' | 'overdue' | 'limits' | 'followups'>('all');

  const customers = StorageService.getCustomers();
  const getCustomerPhone = (customerId?: string) => {
    if (!customerId) return '';
    const cust = customers.find(c => c.id === customerId);
    return cust ? cust.phone : '';
  };

  const filteredAlerts = alerts.filter(a => {
    if (activeFilter === 'promises') return a.alertType === 'promise_due';
    if (activeFilter === 'overdue') return a.alertType === 'customer_overdue';
    if (activeFilter === 'limits') return a.alertType === 'customer_credit_limit';
    if (activeFilter === 'followups') return a.alertType === 'followup_due';
    return true;
  });

  const handleWhatsApp = (alert: BusinessAlert) => {
    const phone = getCustomerPhone(alert.customerId);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const amountFormatted = alert.amountPaise ? `₹${(alert.amountPaise / 100).toLocaleString('en-IN')}` : '';

    const msg = isGu
      ? `નમસ્તે ${alert.customerName || 'ગ્રાહક મિત્ર'}, ખોડિયાર સ્ટેશનરી તરફથી સ્નેહપૂર્વક યાદ અપાવવાની કે આપના ખાતાની બાકી રકમ ${amountFormatted} ચૂકવવાની છે. કૃપા કરીને વહેલી તકે જમા કરાવવા વિનંતી. આભાર!`
      : `Hello ${alert.customerName || 'Customer'}, gentle reminder from Khodiyar Stationery regarding your pending account balance of ${amountFormatted}. Please arrange for settlement at your earliest convenience. Thank you!`;

    if (finalPhone) {
      window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  const handleCall = (alert: BusinessAlert) => {
    const phone = getCustomerPhone(alert.customerId);
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 620, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
              }}
            >
              <Bell size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', margin: 0 }}>
                {isGu ? 'યાદી અને એલર્ટ્સ (Reminders)' : 'Alerts & Reminders'}
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {alerts.length > 0
                  ? isGu
                    ? `${alerts.length} મહત્વપૂર્ણ બાબતો પર તાત્કાલિક ધ્યાન આપવાની જરૂર છે`
                    : `${alerts.length} action items require your attention today`
                  : isGu
                  ? 'કોઈ બાકી એલર્ટ નથી. બધું બરાબર છે!'
                  : 'All caught up! No pending alerts.'}
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Filter Chips */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: '10px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`badge ${activeFilter === 'all' ? 'badge-primary' : ''}`}
            style={{
              cursor: 'pointer',
              border: activeFilter === 'all' ? 'none' : '1px solid var(--border-subtle)',
              background: activeFilter === 'all' ? '#4f46e5' : '#ffffff',
              color: activeFilter === 'all' ? '#ffffff' : 'var(--text-muted)',
              padding: '5px 10px',
              borderRadius: 14,
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {isGu ? 'બધા' : 'All'} ({alerts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('promises')}
            style={{
              cursor: 'pointer',
              border: activeFilter === 'promises' ? 'none' : '1px solid var(--border-subtle)',
              background: activeFilter === 'promises' ? '#d97706' : '#ffffff',
              color: activeFilter === 'promises' ? '#ffffff' : 'var(--text-muted)',
              padding: '5px 10px',
              borderRadius: 14,
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {isGu ? 'ઉઘરાણી વાયદા' : 'Promises'} (
            {alerts.filter((a) => a.alertType === 'promise_due').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('overdue')}
            style={{
              cursor: 'pointer',
              border: activeFilter === 'overdue' ? 'none' : '1px solid var(--border-subtle)',
              background: activeFilter === 'overdue' ? '#dc2626' : '#ffffff',
              color: activeFilter === 'overdue' ? '#ffffff' : 'var(--text-muted)',
              padding: '5px 10px',
              borderRadius: 14,
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {isGu ? '30+ દિવસ બાકી' : 'Overdue'} (
            {alerts.filter((a) => a.alertType === 'customer_overdue').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('limits')}
            style={{
              cursor: 'pointer',
              border: activeFilter === 'limits' ? 'none' : '1px solid var(--border-subtle)',
              background: activeFilter === 'limits' ? '#ea580c' : '#ffffff',
              color: activeFilter === 'limits' ? '#ffffff' : 'var(--text-muted)',
              padding: '5px 10px',
              borderRadius: 14,
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {isGu ? 'મર્યાદા વટી' : 'Limit Exceeded'} (
            {alerts.filter((a) => a.alertType === 'customer_credit_limit').length})
          </button>
        </div>

        {/* Alerts List */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
          {filteredAlerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '35px 20px', color: 'var(--text-muted)' }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <CheckCircle2 size={26} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {isGu ? 'કોઈ પેન્ડિંગ એલર્ટ નથી' : 'No Pending Alerts'}
              </div>
              <p style={{ fontSize: '0.8rem', marginTop: 4 }}>
                {isGu
                  ? 'આ કેટેગરીમાં હાલ કોઈ ઉઘરાણી કે વાયદો બાકી નથી.'
                  : 'All customers and promises in this category are up to date.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredAlerts.map((alert) => {
                const phone = getCustomerPhone(alert.customerId);
                const isCritical = alert.severity === 'critical';

                return (
                  <div
                    key={alert.id}
                    className="glass-card"
                    style={{
                      padding: 12,
                      borderLeft: `4px solid ${
                        isCritical ? '#ef4444' : alert.alertType === 'promise_due' ? '#f59e0b' : '#3b82f6'
                      }`,
                      background: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {alert.alertType === 'promise_due' ? (
                          <Clock size={16} color="#d97706" />
                        ) : alert.alertType === 'customer_credit_limit' ? (
                          <ShieldAlert size={16} color="#ea580c" />
                        ) : (
                          <AlertTriangle size={16} color={isCritical ? '#dc2626' : '#d97706'} />
                        )}
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                          {alert.title}
                        </span>
                      </div>

                      {alert.amountPaise !== undefined && alert.amountPaise > 0 && (
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: '0.92rem',
                            color: '#dc2626',
                          }}
                        >
                          ₹{(alert.amountPaise / 100).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                      {alert.body}
                    </p>

                    {/* Interactive Action Bar */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 4,
                        paddingTop: 8,
                        borderTop: '1px solid var(--border-subtle)',
                        gap: 6,
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* Left actions: Call & WhatsApp */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        {phone && (
                          <button
                            type="button"
                            onClick={() => handleCall(alert)}
                            style={{
                              padding: '5px 9px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              background: '#f8fafc',
                              color: 'var(--text-main)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              cursor: 'pointer',
                            }}
                          >
                            <Phone size={13} color="#2563eb" />
                            <span>{phone}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleWhatsApp(alert)}
                          style={{
                            padding: '5px 9px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            background: '#25d366',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            cursor: 'pointer',
                          }}
                        >
                          <MessageSquare size={13} />
                          <span>WhatsApp</span>
                        </button>
                      </div>

                      {/* Right actions: Receive Payment & Ledger View */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        {alert.customerId && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenReceivePayment(alert.customerId!, alert.amountPaise);
                            }}
                            style={{
                              padding: '5px 10px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              borderRadius: 'var(--radius-sm)',
                              border: 'none',
                              background: '#10b981',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              cursor: 'pointer',
                            }}
                          >
                            <Wallet size={13} />
                            <span>{isGu ? 'જમા કરો' : 'Receive'}</span>
                          </button>
                        )}

                        {alert.customerId && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenCustomerDetail(alert.customerId!);
                            }}
                            style={{
                              padding: '5px 9px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              background: '#f1f5f9',
                              color: 'var(--text-main)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                              cursor: 'pointer',
                            }}
                          >
                            <span>{isGu ? 'ખાતાવહી' : 'Ledger'}</span>
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {isGu ? 'ખોડિયાર સ્ટેશનરી ઓટો-રિમાઇન્ડર સિસ્ટમ' : 'Khodiyar Stationery Auto-Reminder Engine'}
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
            {isGu ? 'બંધ કરો' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
