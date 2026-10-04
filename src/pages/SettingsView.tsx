import React, { useState } from 'react';
import {
  Settings,
  Sheet,
  Globe,
  Eye,
  RotateCcw,
  Download,
  Check,
  ShieldAlert,
  Database,
  Lock,
} from 'lucide-react';
import { Language, getTranslation } from '../lib/i18n';
import { StorageService } from '../services/storage';
import { getGoogleSheetsConfig } from '../services/googleSheets';
import { InfoButton } from '../components/InfoButton';
import { BusinessProfile } from '../types';

interface Props {
  lang: Language;
  onToggleLang: () => void;
  isPrivacyMode: boolean;
  onTogglePrivacy: () => void;
  onOpenGoogleSheets: () => void;
  onOpenInfo: (docId: string) => void;
}

export const SettingsView: React.FC<Props> = ({
  lang,
  onToggleLang,
  isPrivacyMode,
  onTogglePrivacy,
  onOpenGoogleSheets,
  onOpenInfo,
}) => {
  const t = getTranslation(lang);
  const isGu = lang === 'gu';
  const [business, setBusiness] = useState<BusinessProfile>(StorageService.getBusiness());
  const [isSaved, setIsSaved] = useState(false);

  const sheetsConfig = getGoogleSheetsConfig();
  const pendingSyncCount = StorageService.getSyncQueue().length;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveBusiness(business);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetData = () => {
    if (confirm(isGu ? 'શું તમે ખરેખર બધો ડેટા સાફ કરીને નવેસરથી શરૂ કરવા માંગો છો?' : 'Are you sure you want to clear all data and start fresh?')) {
      StorageService.resetSampleData();
      window.location.reload();
    }
  };

  const handleBackupDownload = () => {
    const snapshot = StorageService.getFullSnapshot();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ShopBook_Full_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '16px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t.settings}</h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {isGu
            ? 'દુકાનની વિગતો, ગૂગલ શીટ્સ ડેટાબેઝ, ભાષા અને સેટિંગ્સ'
            : 'Shop profile, Google Sheets database, language & preferences'}
        </p>
      </div>

      {/* Google Sheets Database Banner Card */}
      <section className="glass-panel" style={{ padding: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
              }}
            >
              <Sheet size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                  {t.googleSheetsDb}
                </div>
                <InfoButton docId="google_sheets" onClick={onOpenInfo} size={15} color="#059669" />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 2 }}>
                {sheetsConfig.webAppUrl
                  ? (isGu ? 'લાઇવ ૨-વે સિંક ચાલુ છે' : 'Connected with live 2-way sync')
                  : (isGu ? 'તમારી સ્પ્રેડશીટ કનેક્ટ કરો' : 'Connect your spreadsheet as primary database')}
              </div>
            </div>
          </div>

          <button className="btn-primary" onClick={onOpenGoogleSheets}>
            {isGu ? 'ગૂગલ શીટ્સ મેનેજ કરો' : 'Manage Sheets Sync'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Status: </span>
            <span style={{ fontWeight: 700, color: sheetsConfig.webAppUrl ? '#34d399' : '#fbbf24' }}>
              {sheetsConfig.webAppUrl ? 'Connected ✓' : 'Local Offline Mode'}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Queue: </span>
            <span style={{ fontWeight: 700 }}>{pendingSyncCount} pending</span>
          </div>
        </div>
      </section>

      {/* Language & Privacy Preferences */}
      <section className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>App Preferences</h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Globe size={18} color="#818cf8" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>App Language / ભાષા</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Currently: {lang === 'en' ? 'English' : 'ગુજરાતી (Gujarati)'}
              </div>
            </div>
          </div>
          <button className="btn-secondary" onClick={onToggleLang}>
            {lang === 'en' ? 'ગુજરાતી માં બદલો' : 'Switch to English'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Eye size={18} color="#f43f5e" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.privacyMode}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Mask balances when customers look at the screen
              </div>
            </div>
          </div>
          <button
            className={`btn-secondary ${isPrivacyMode ? 'active' : ''}`}
            onClick={onTogglePrivacy}
            style={{
              background: isPrivacyMode ? 'rgba(244, 63, 94, 0.2)' : undefined,
              borderColor: isPrivacyMode ? '#f43f5e' : undefined,
              color: isPrivacyMode ? '#fb7185' : undefined,
            }}
          >
            {isPrivacyMode ? 'Enabled (Masked)' : 'Disabled'}
          </button>
        </div>
      </section>

      {/* Shop Profile Form */}
      <section className="glass-panel" style={{ padding: '18px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 14 }}>Shop Profile</h3>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Shop Name</label>
            <input
              type="text"
              className="form-input"
              value={business.name}
              onChange={(e) => setBusiness({ ...business, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-input"
                value={business.phone}
                onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Opening Cash Float (₹)</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={(business.openingCashPaise || 0) / 100}
                onChange={(e) =>
                  setBusiness({ ...business, openingCashPaise: Math.round(parseFloat(e.target.value || '0') * 100) })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-input"
              value={business.address}
              onChange={(e) => setBusiness({ ...business, address: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
            <button type="submit" className="btn-primary">
              {isSaved ? <Check size={16} /> : null}
              <span>{isSaved ? 'Saved!' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Data Management & Backup */}
      <section className="glass-panel" style={{ padding: '18px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 14 }}>Data Backup & Reset</h3>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={handleBackupDownload}>
            <Download size={16} />
            <span>Download Full Backup (JSON)</span>
          </button>

          <button
            className="btn-secondary"
            onClick={handleResetData}
            style={{ color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.3)' }}
          >
            <RotateCcw size={16} />
            <span>{isGu ? 'બધો ડેટા સાફ કરો (Clear All Data)' : 'Clear All Data & Start Fresh'}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
