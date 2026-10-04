import React from 'react';
import { Home, TrendingUp, Users, Truck, PhoneCall, LayoutDashboard, Settings, Plus } from 'lucide-react';
import { Language, getTranslation } from '../lib/i18n';

export type NavTab = 'home' | 'sales' | 'customers' | 'vendors' | 'followups' | 'dashboard' | 'settings';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
  lang: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickAdd,
  lang,
}) => {
  const t = getTranslation(lang);

  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${currentTab === 'home' ? 'active' : ''}`}
        onClick={() => onSelectTab('home')}
      >
        <Home size={20} />
        <span>{t.home}</span>
      </button>

      <button
        className={`nav-item ${currentTab === 'sales' ? 'active' : ''}`}
        onClick={() => onSelectTab('sales')}
      >
        <TrendingUp size={20} />
        <span>{t.sales}</span>
      </button>

      <button
        className={`nav-item ${currentTab === 'customers' ? 'active' : ''}`}
        onClick={() => onSelectTab('customers')}
      >
        <Users size={20} />
        <span>{t.customers}</span>
      </button>

      {/* Floating Center Quick Add Button */}
      <button
        className="nav-fab-btn"
        onClick={onOpenQuickAdd}
        title={t.quickAdd}
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <button
        className={`nav-item ${currentTab === 'vendors' ? 'active' : ''}`}
        onClick={() => onSelectTab('vendors')}
      >
        <Truck size={20} />
        <span>{t.vendors}</span>
      </button>

      <button
        className={`nav-item ${currentTab === 'followups' ? 'active' : ''}`}
        onClick={() => onSelectTab('followups')}
      >
        <PhoneCall size={20} />
        <span>{t.followups}</span>
      </button>

      <button
        className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => onSelectTab('dashboard')}
      >
        <LayoutDashboard size={20} />
        <span>{t.dashboard}</span>
      </button>
    </nav>
  );
};
