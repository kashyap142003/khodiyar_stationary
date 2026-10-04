import React from 'react';
import { BookOpen, Sheet, Bell } from 'lucide-react';
import { Language, getTranslation } from '../lib/i18n';
import { BusinessProfile } from '../types';

interface HeaderProps {
  business: BusinessProfile;
  lang: Language;
  onSetLang: (lang: Language) => void;
  pendingSyncCount: number;
  onOpenGoogleSheets: () => void;
  onOpenAlerts: () => void;
  alertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  business,
  lang,
  onSetLang,
  pendingSyncCount,
  onOpenGoogleSheets,
  onOpenAlerts,
  alertsCount,
}) => {
  const t = getTranslation(lang);
  const todayDateFormatted = new Date().toLocaleDateString(lang === 'gu' ? 'gu-IN' : 'en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const shopDisplayName = lang === 'gu' ? 'ખોડિયાર સ્ટેશનરી' : 'Khodiyar Stationery';

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="shop-icon-badge">
          <BookOpen size={20} />
        </div>
        <div className="header-title-wrap">
          <h1>{shopDisplayName}</h1>
          <p>
            <span>{todayDateFormatted}</span>
          </p>
        </div>
      </div>

      <div className="header-actions">
        {/* Language Segmented Switcher: Gujarati <-> English */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f1f5f9',
            border: '1px solid var(--border-subtle)',
            borderRadius: 18,
            padding: 2,
            gap: 2,
          }}
        >
          <button
            type="button"
            onClick={() => onSetLang('gu')}
            style={{
              padding: '3px 7px',
              fontSize: '0.72rem',
              fontWeight: 800,
              borderRadius: 14,
              border: 'none',
              cursor: 'pointer',
              background: lang === 'gu' ? '#4f46e5' : 'transparent',
              color: lang === 'gu' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            ગુજરાતી
          </button>
          <button
            type="button"
            onClick={() => onSetLang('en')}
            style={{
              padding: '3px 7px',
              fontSize: '0.72rem',
              fontWeight: 800,
              borderRadius: 14,
              border: 'none',
              cursor: 'pointer',
              background: lang === 'en' ? '#4f46e5' : 'transparent',
              color: lang === 'en' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            ENG
          </button>
        </div>

        {/* Google Sheets Sync Pill */}
        <button
          className="btn-icon"
          onClick={onOpenGoogleSheets}
          title={t.googleSheetsDb}
          style={{
            position: 'relative',
            borderColor: pendingSyncCount > 0 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)',
          }}
        >
          <Sheet size={18} color={pendingSyncCount > 0 ? '#fbbf24' : '#34d399'} />
          {pendingSyncCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                background: '#f59e0b',
                color: '#000',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: 16,
                height: 16,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {pendingSyncCount}
            </span>
          )}
        </button>

        {/* Alerts Bell */}
        <button
          className="btn-icon"
          onClick={onOpenAlerts}
          title={t.needsAttention}
          style={{ position: 'relative' }}
        >
          <Bell size={18} />
          {alertsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                background: '#f43f5e',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: 16,
                height: 16,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {alertsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
