import React from 'react';
import {
  ShoppingBag,
  UserCheck,
  CreditCard,
  PackagePlus,
  ArrowUpRight,
  Receipt,
  PhoneCall,
  Lock,
  X,
} from 'lucide-react';
import { Language, getTranslation } from '../lib/i18n';

export type QuickActionType =
  | 'walk_in_sale'
  | 'customer_sale'
  | 'receive_payment'
  | 'purchase'
  | 'pay_vendor'
  | 'expense'
  | 'followup'
  | 'cash_close';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: QuickActionType) => void;
  lang: Language;
}

export const QuickAddModal: React.FC<Props> = ({ isOpen, onClose, onSelectAction, lang }) => {
  if (!isOpen) return null;
  const t = getTranslation(lang);

  const actions = [
    {
      id: 'walk_in_sale' as QuickActionType,
      title: t.walkInSale,
      sub: lang === 'gu' ? '૧૦૦+ ગ્રાહકો માટે રોકડ/UPI લમ્પસમ' : '100+ small walk-ins (Day Total)',
      icon: ShoppingBag,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.15)',
    },
    {
      id: 'customer_sale' as QuickActionType,
      title: t.customerSale,
      sub: lang === 'gu' ? 'સ્કૂલ, કોચિંગ અને ઉધાર ખાતાવહી' : 'Schools, Lease & Credit Customers',
      icon: UserCheck,
      color: '#818cf8',
      bg: 'rgba(99, 102, 241, 0.15)',
    },
    {
      id: 'receive_payment' as QuickActionType,
      title: t.receivePayment,
      sub: lang === 'gu' ? 'ગ્રાહક પાસેથી જૂની ઉઘરાણી જમા' : 'Collect Pending Customer Dues',
      icon: CreditCard,
      color: '#34d399',
      bg: 'rgba(16, 185, 129, 0.15)',
    },
    {
      id: 'purchase' as QuickActionType,
      title: t.newPurchase,
      sub: 'Vendor Bill Entry',
      icon: PackagePlus,
      color: '#fbbf24',
      bg: 'rgba(245, 158, 11, 0.15)',
    },
    {
      id: 'pay_vendor' as QuickActionType,
      title: t.payVendor,
      sub: 'Vendor Bill Settlement',
      icon: ArrowUpRight,
      color: '#fb7185',
      bg: 'rgba(244, 63, 94, 0.15)',
    },
    {
      id: 'expense' as QuickActionType,
      title: t.expense,
      sub: 'Rent, Tea, Electricity, Freight',
      icon: Receipt,
      color: '#e879f9',
      bg: 'rgba(232, 121, 249, 0.15)',
    },
    {
      id: 'followup' as QuickActionType,
      title: t.newFollowup,
      sub: 'Order Requirement & Lead',
      icon: PhoneCall,
      color: '#2dd4bf',
      bg: 'rgba(45, 212, 191, 0.15)',
    },
    {
      id: 'cash_close' as QuickActionType,
      title: t.cashClose,
      sub: 'Evening Cash Tally & Notes',
      icon: Lock,
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.15)',
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h2>{t.quickAdd}</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '16px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
            }}
          >
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  onClick={() => {
                    onClose();
                    onSelectAction(act.id);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = act.color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-sm)',
                      background: act.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: act.color,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      {act.title}
                    </div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-dim)', marginTop: 2 }}>
                      {act.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
