import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { QuickAddModal, QuickActionType } from './components/QuickAddModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { InfoModal } from './components/InfoModal';
import { AlertsModal } from './components/AlertsModal';

import { WalkInSaleModal } from './components/modals/WalkInSaleModal';
import { CustomerSaleModal } from './components/modals/CustomerSaleModal';
import { PaymentReceivedModal } from './components/modals/PaymentReceivedModal';
import { PurchaseModal } from './components/modals/PurchaseModal';
import { PayVendorModal } from './components/modals/PayVendorModal';
import { ExpenseModal } from './components/modals/ExpenseModal';
import { FollowupModal } from './components/modals/FollowupModal';
import { PromiseToPayModal } from './components/modals/PromiseToPayModal';
import { CashCloseModal } from './components/modals/CashCloseModal';

import { HomeView } from './pages/HomeView';
import { SalesView } from './pages/SalesView';
import { CustomersView } from './pages/CustomersView';
import { VendorsView } from './pages/VendorsView';
import { FollowupsView } from './pages/FollowupsView';
import { DashboardView } from './pages/DashboardView';
import { SettingsView } from './pages/SettingsView';

import { Language } from './lib/i18n';
import { StorageService, startBackgroundSyncWorker } from './services/storage';
import { generateAlerts } from './services/businessLogic';
import { BusinessProfile, BusinessAlert } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('shopbook_lang') as Language) || 'gu';
  });
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => {
    return StorageService.isPrivacyMode();
  });
  const [business, setBusiness] = useState<BusinessProfile>(() => StorageService.getBusiness());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => StorageService.getSyncQueue().length);
  const [alertsCount, setAlertsCount] = useState<number>(0);
  const [allAlerts, setAllAlerts] = useState<BusinessAlert[]>([]);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState<boolean>(false);

  // Modals state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [activeInfoDocId, setActiveInfoDocId] = useState<string | null>(null);

  const [isWalkInSaleOpen, setIsWalkInSaleOpen] = useState(false);
  const [isCustomerSaleOpen, setIsCustomerSaleOpen] = useState(false);
  const [isPaymentReceivedOpen, setIsPaymentReceivedOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isPayVendorOpen, setIsPayVendorOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isFollowupOpen, setIsFollowupOpen] = useState(false);
  const [isPromiseToPayOpen, setIsPromiseToPayOpen] = useState(false);
  const [isCashCloseOpen, setIsCashCloseOpen] = useState(false);

  // Contextual modal selections
  const [contextCustomerId, setContextCustomerId] = useState<string | undefined>(undefined);
  const [contextVendorId, setContextVendorId] = useState<string | undefined>(undefined);
  const [contextAmountPaise, setContextAmountPaise] = useState<number | undefined>(undefined);

  // Listen for storage / privacy updates
  useEffect(() => {
    const handleUpdate = () => {
      setBusiness(StorageService.getBusiness());
      setPendingSyncCount(StorageService.getSyncQueue().length);
      setIsPrivacyMode(StorageService.isPrivacyMode());

      // Recalculate alerts with current language
      const alerts = generateAlerts(
        StorageService.getCustomers(),
        StorageService.getVendors(),
        StorageService.getSales(),
        StorageService.getCustomerPayments(),
        StorageService.getCustomerAdjustments(),
        StorageService.getFollowups(),
        StorageService.getPromisesToPay(),
        lang
      );
      setAllAlerts(alerts);
      setAlertsCount(alerts.length);
    };

    handleUpdate();
    window.addEventListener('shopbook_storage_updated', handleUpdate);
    window.addEventListener('shopbook_privacy_updated', handleUpdate);
    window.addEventListener('shopbook_sync_updated', handleUpdate);

    // Initialize real-time continuous background sync worker
    const stopWorker = startBackgroundSyncWorker();

    return () => {
      window.removeEventListener('shopbook_storage_updated', handleUpdate);
      window.removeEventListener('shopbook_privacy_updated', handleUpdate);
      window.removeEventListener('shopbook_sync_updated', handleUpdate);
      stopWorker();
    };
  }, [lang]);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('shopbook_lang', newLang);
  };

  const handleToggleLang = () => {
    const nextLang = lang === 'en' ? 'gu' : 'en';
    handleSetLang(nextLang);
  };

  const handleTogglePrivacy = () => {
    const next = StorageService.togglePrivacyMode();
    setIsPrivacyMode(next);
  };

  const handleSelectQuickAction = (action: QuickActionType) => {
    switch (action) {
      case 'walk_in_sale':
        setIsWalkInSaleOpen(true);
        break;
      case 'customer_sale':
        setContextCustomerId(undefined);
        setIsCustomerSaleOpen(true);
        break;
      case 'receive_payment':
        setContextCustomerId(undefined);
        setIsPaymentReceivedOpen(true);
        break;
      case 'purchase':
        setContextVendorId(undefined);
        setIsPurchaseOpen(true);
        break;
      case 'pay_vendor':
        setContextVendorId(undefined);
        setIsPayVendorOpen(true);
        break;
      case 'expense':
        setIsExpenseOpen(true);
        break;
      case 'followup':
        setContextCustomerId(undefined);
        setIsFollowupOpen(true);
        break;
      case 'cash_close':
        setIsCashCloseOpen(true);
        break;
    }
  };

  const refreshData = () => {
    window.dispatchEvent(new Event('shopbook_storage_updated'));
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        business={business}
        lang={lang}
        onSetLang={handleSetLang}
        pendingSyncCount={pendingSyncCount}
        onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
        onOpenAlerts={() => setIsAlertsModalOpen(true)}
        alertsCount={alertsCount}
      />

      {/* Main View Router */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentTab === 'home' && (
          <HomeView
            lang={lang}
            isPrivacyMode={isPrivacyMode}
            onSelectAction={handleSelectQuickAction}
            onOpenCustomerDetail={(customerId) => {
              setContextCustomerId(customerId);
              setCurrentTab('customers');
            }}
            onOpenPromiseToPay={(customerId, amountPaise) => {
              setContextCustomerId(customerId);
              setContextAmountPaise(amountPaise);
              setIsPromiseToPayOpen(true);
            }}
            onReceivePayment={(customerId) => {
              setContextCustomerId(customerId);
              setIsPaymentReceivedOpen(true);
            }}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
            onOpenInfo={(docId) => setActiveInfoDocId(docId)}
          />
        )}

        {currentTab === 'sales' && (
          <SalesView
            lang={lang}
            isPrivacyMode={isPrivacyMode}
            onOpenWalkInSale={() => setIsWalkInSaleOpen(true)}
            onOpenCustomerSale={() => {
              setContextCustomerId(undefined);
              setIsCustomerSaleOpen(true);
            }}
            onOpenInfo={(docId) => setActiveInfoDocId(docId)}
          />
        )}

        {currentTab === 'customers' && (
          <CustomersView
            lang={lang}
            isPrivacyMode={isPrivacyMode}
            selectedCustomerId={contextCustomerId}
            onClearSelectedCustomer={() => setContextCustomerId(undefined)}
            onOpenCustomerSale={(cid) => {
              setContextCustomerId(cid);
              setIsCustomerSaleOpen(true);
            }}
            onReceivePayment={(cid) => {
              setContextCustomerId(cid);
              setIsPaymentReceivedOpen(true);
            }}
            onOpenPromiseToPay={(cid, amount) => {
              setContextCustomerId(cid);
              setContextAmountPaise(amount);
              setIsPromiseToPayOpen(true);
            }}
            onOpenInfo={(docId) => setActiveInfoDocId(docId)}
          />
        )}

        {currentTab === 'vendors' && (
          <VendorsView
            lang={lang}
            isPrivacyMode={isPrivacyMode}
            onOpenPurchase={(vid) => {
              setContextVendorId(vid);
              setIsPurchaseOpen(true);
            }}
            onOpenPayVendor={(vid) => {
              setContextVendorId(vid);
              setIsPayVendorOpen(true);
            }}
          />
        )}

        {currentTab === 'followups' && (
          <FollowupsView
            lang={lang}
            isPrivacyMode={isPrivacyMode}
            onOpenNewFollowup={() => {
              setContextCustomerId(undefined);
              setIsFollowupOpen(true);
            }}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            lang={lang}
            isPrivacyMode={isPrivacyMode}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
            onOpenInfo={(docId) => setActiveInfoDocId(docId)}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            lang={lang}
            onToggleLang={handleToggleLang}
            isPrivacyMode={isPrivacyMode}
            onTogglePrivacy={handleTogglePrivacy}
            onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
            onOpenInfo={(docId) => setActiveInfoDocId(docId)}
          />
        )}
      </main>

      {/* Floating Center Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        lang={lang}
      />

      {/* Modals & Dialogs */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSelectAction={handleSelectQuickAction}
        lang={lang}
      />

      <GoogleSheetsModal
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
        lang={lang}
      />

      <WalkInSaleModal
        isOpen={isWalkInSaleOpen}
        onClose={() => setIsWalkInSaleOpen(false)}
        lang={lang}
        onSuccess={refreshData}
      />

      <CustomerSaleModal
        isOpen={isCustomerSaleOpen}
        onClose={() => setIsCustomerSaleOpen(false)}
        lang={lang}
        onSuccess={refreshData}
        defaultCustomerId={contextCustomerId}
      />

      <PaymentReceivedModal
        isOpen={isPaymentReceivedOpen}
        onClose={() => setIsPaymentReceivedOpen(false)}
        lang={lang}
        onSuccess={refreshData}
        defaultCustomerId={contextCustomerId}
      />

      <PurchaseModal
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
        lang={lang}
        onSuccess={refreshData}
        defaultVendorId={contextVendorId}
      />

      <PayVendorModal
        isOpen={isPayVendorOpen}
        onClose={() => setIsPayVendorOpen(false)}
        lang={lang}
        onSuccess={refreshData}
        defaultVendorId={contextVendorId}
      />

      <ExpenseModal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        lang={lang}
        onSuccess={refreshData}
      />

      <FollowupModal
        isOpen={isFollowupOpen}
        onClose={() => setIsFollowupOpen(false)}
        lang={lang}
        onSuccess={refreshData}
        defaultCustomerId={contextCustomerId}
      />

      <PromiseToPayModal
        isOpen={isPromiseToPayOpen}
        onClose={() => setIsPromiseToPayOpen(false)}
        lang={lang}
        onSuccess={refreshData}
        defaultCustomerId={contextCustomerId}
        defaultAmountPaise={contextAmountPaise}
      />

      <CashCloseModal
        isOpen={isCashCloseOpen}
        onClose={() => setIsCashCloseOpen(false)}
        lang={lang}
        onSuccess={refreshData}
      />

      <InfoModal
        docId={activeInfoDocId}
        isOpen={!!activeInfoDocId}
        onClose={() => setActiveInfoDocId(null)}
        lang={lang}
      />

      <AlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        lang={lang}
        alerts={allAlerts}
        onOpenReceivePayment={(customerId, defaultAmountPaise) => {
          setContextCustomerId(customerId);
          setContextAmountPaise(defaultAmountPaise);
          setIsPaymentReceivedOpen(true);
        }}
        onOpenCustomerDetail={(customerId) => {
          setContextCustomerId(customerId);
          setCurrentTab('customers');
        }}
        onOpenPromiseToPay={(customerId, amountPaise) => {
          setContextCustomerId(customerId);
          setContextAmountPaise(amountPaise);
          setIsPromiseToPayOpen(true);
        }}
      />
    </div>
  );
}

export default App;
