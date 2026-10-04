import React, { useState } from 'react';
import { Sheet, Copy, Check, ExternalLink, RefreshCw, AlertCircle, Database, ShieldCheck, Download, X } from 'lucide-react';
import { Language, getTranslation } from '../lib/i18n';
import {
  getGoogleSheetsConfig,
  saveGoogleSheetsConfig,
  syncToGoogleSheets,
  generateAppsScriptTemplate,
} from '../services/googleSheets';
import {
  StorageService,
  triggerGoogleSheetsSync,
  triggerGoogleSheetsFetch,
  triggerBidirectionalSync,
} from '../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const GoogleSheetsModal: React.FC<Props> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;
  const t = getTranslation(lang);

  const [config, setConfig] = useState(getGoogleSheetsConfig());
  const [activeTab, setActiveTab] = useState<'status' | 'code' | 'export'>('status');
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const pendingCount = StorageService.getSyncQueue().length;
  const appsScriptCode = generateAppsScriptTemplate();

  const handleSave = () => {
    saveGoogleSheetsConfig(config);
    setMessage({
      text: lang === 'gu' ? 'ગુગલ શીટ્સ સેટિંગ્સ સફળતાપૂર્વક સાચવ્યા!' : 'Google Sheets settings saved successfully!',
      type: 'success',
    });
  };

  const handleTestConnection = async () => {
    if (!config.webAppUrl) {
      setMessage({
        text: lang === 'gu' ? 'કૃપા કરીને પહેલા તમારો ગુગલ એપ્સ સ્ક્રિપ્ટ Web App URL દાખલ કરો.' : 'Please enter your Google Apps Script Web App URL first.',
        type: 'error',
      });
      return;
    }
    setIsTesting(true);
    setMessage(null);
    const res = await syncToGoogleSheets(config.webAppUrl, { action: 'ping' });
    setIsTesting(false);
    if (res.success) {
      setMessage({
        text: (lang === 'gu' ? 'ગુગલ શીટ સાથે સફળ કનેક્શન: ' : 'Connected to Google Sheets: ') + res.message,
        type: 'success',
      });
    } else {
      setMessage({
        text: (lang === 'gu' ? 'કનેક્શન નિષ્ફળ: ' : 'Connection failed: ') + res.message,
        type: 'error',
      });
    }
  };

  const handleManualPush = async () => {
    setIsSyncing(true);
    setMessage(null);
    handleSave();
    const res = await triggerGoogleSheetsSync();
    setIsSyncing(false);
    if (res.success) {
      setMessage({
        text: lang === 'gu' ? 'બધો ડેટા ગુગલ શીટ્સમાં સફળતાપૂર્વક બેકઅપ / સિંક થઈ ગયો!' : 'All data successfully synced to Google Sheets!',
        type: 'success',
      });
    } else {
      setMessage({
        text: (lang === 'gu' ? 'સિંક નિષ્ફળ: ' : 'Sync failed: ') + res.message,
        type: 'error',
      });
    }
  };

  const handleManualFetch = async () => {
    setIsFetching(true);
    setMessage(null);
    handleSave();
    const res = await triggerGoogleSheetsFetch();
    setIsFetching(false);
    if (res.success) {
      setMessage({
        text: lang === 'gu' ? 'ગુગલ શીટ્સમાંથી લેટેસ્ટ ડેટા સફળતાપૂર્વક લોડ થઈ ગયો!' : 'Latest data successfully fetched from Google Sheets!',
        type: 'success',
      });
    } else {
      setMessage({
        text: (lang === 'gu' ? 'ડેટા ફેચ નિષ્ફળ: ' : 'Fetch failed: ') + res.message,
        type: 'error',
      });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleExportCSV = () => {
    const snapshot = StorageService.getFullSnapshot();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ShopBook_GoogleSheet_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setMessage({ text: 'Exported JSON backup file successfully!', type: 'success' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
              }}
            >
              <Sheet size={20} />
            </div>
            <h2>{t.googleSheetsDb}</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0 16px',
            background: 'var(--bg-secondary)',
          }}
        >
          <button
            onClick={() => setActiveTab('status')}
            style={{
              padding: '10px 14px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'status' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'status' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.82rem',
            }}
          >
            Connection & Sync
          </button>
          <button
            onClick={() => setActiveTab('code')}
            style={{
              padding: '10px 14px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'code' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'code' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>Apps Script Code</span>
            <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>1-Click</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            style={{
              padding: '10px 14px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'export' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'export' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.82rem',
            }}
          >
            Backup & Export
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {message && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background:
                  message.type === 'success'
                    ? 'var(--accent-emerald-bg)'
                    : message.type === 'error'
                    ? 'var(--accent-rose-bg)'
                    : 'var(--accent-cyan-bg)',
                color:
                  message.type === 'success'
                    ? 'var(--accent-emerald)'
                    : message.type === 'error'
                    ? 'var(--accent-rose)'
                    : 'var(--accent-cyan)',
                border: `1px solid ${
                  message.type === 'success'
                    ? 'var(--accent-emerald-border)'
                    : message.type === 'error'
                    ? 'var(--accent-rose-border)'
                    : 'var(--accent-cyan-border)'
                }`,
              }}
            >
              {message.type === 'success' ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          {activeTab === 'status' && (
            <>
              {/* Sync Status Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                <div className="glass-card" style={{ padding: 12 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sync Queue</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: pendingCount > 0 ? '#d97706' : '#059669', marginTop: 3 }}>
                    {pendingCount === 0 ? 'All Synced ✓' : `${pendingCount} Pending`}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 }}>
                    Auto-syncs in background
                  </div>
                </div>

                <div className="glass-card" style={{ padding: 12 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Last Sync</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: 3 }}>
                    {config.lastSyncedAt ? new Date(config.lastSyncedAt).toLocaleTimeString() : 'Not yet'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 }}>
                    Google Sheets Database
                  </div>
                </div>
              </div>

              {/* URL Inputs */}
              <div className="form-group">
                <label className="form-label">
                  Google Apps Script Web App URL
                </label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={config.webAppUrl || ''}
                  onChange={(e) => setConfig({ ...config, webAppUrl: e.target.value })}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  Deploy your Google Apps Script as Web App (Access: Anyone) and paste the URL here.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Google Spreadsheet Link (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={config.spreadsheetUrl || ''}
                  onChange={(e) => setConfig({ ...config, spreadsheetUrl: e.target.value })}
                />
              </div>

              {/* Background Sync Info Banner */}
              <div
                style={{
                  background: 'rgba(79, 70, 229, 0.06)',
                  border: '1px solid rgba(79, 70, 229, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: config.isAutoSyncEnabled ? '#10b981' : '#94a3b8',
                      boxShadow: config.isAutoSyncEnabled ? '0 0 8px #10b981' : 'none',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {lang === 'gu' ? 'ઓટોમેટિક રિયલ-ટાઇમ સિંક' : 'Auto Real-Time Sync'}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {lang === 'gu'
                        ? 'દર 20 સેકન્ડે અને ટેબ ખોલવા પર ઓટોમેટિક અપડેટ થાય છે'
                        : 'Syncs every 20s & whenever you switch back to this tab'}
                    </div>
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={config.isAutoSyncEnabled}
                    onChange={(e) => {
                      const updated = { ...config, isAutoSyncEnabled: e.target.checked };
                      setConfig(updated);
                      saveGoogleSheetsConfig(updated);
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {config.isAutoSyncEnabled ? (lang === 'gu' ? 'ચાલુ' : 'ON') : (lang === 'gu' ? 'બંધ' : 'OFF')}
                  </span>
                </label>
              </div>

              {/* Action Buttons Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleManualFetch}
                  disabled={isFetching || isSyncing}
                  style={{ padding: '8px 10px', fontSize: '0.8rem' }}
                >
                  <RefreshCw size={14} className={isFetching ? 'spin' : ''} />
                  <span>{isFetching ? (lang === 'gu' ? 'ફેચ થાય છે...' : 'Fetching...') : (lang === 'gu' ? 'શીટ્સમાંથી લાવો (Pull)' : 'Fetch from Sheets')}</span>
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleManualPush}
                  disabled={isSyncing || isFetching}
                  style={{ padding: '8px 10px', fontSize: '0.8rem' }}
                >
                  <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
                  <span>{isSyncing ? (lang === 'gu' ? 'સિંક થાય છે...' : 'Pushing...') : (lang === 'gu' ? 'શીટ્સમાં બેકઅપ (Push)' : 'Push to Sheets')}</span>
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 8px',
                  }}
                >
                  <RefreshCw size={12} className={isTesting ? 'spin' : ''} />
                  <span>{isTesting ? (lang === 'gu' ? 'કનેક્શન ચકાસાય છે...' : 'Testing...') : (lang === 'gu' ? 'કનેક્શન ટેસ્ટ કરો (Ping)' : 'Test Connection Ping')}</span>
                </button>
              </div>
            </>
          )}

          {activeTab === 'code' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 3 }}>
                  How to setup in Google Sheets (2 minutes):
                </div>
                <ol style={{ paddingLeft: 16, lineHeight: 1.5 }}>
                  <li>Create a new Google Sheet (or open existing).</li>
                  <li>Click <strong>Extensions &gt; Apps Script</strong>.</li>
                  <li>Delete default code, paste the script below, and click <strong>Save</strong>.</li>
                  <li>Click <strong>Deploy &gt; New deployment &gt; Select type: Web App</strong>.</li>
                  <li>Set <em>Execute as: Me</em> and <em>Who has access: Anyone</em>.</li>
                  <li>Copy the Web App URL and paste it in the Connection tab!</li>
                </ol>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={handleCopyCode} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                  {copiedCode ? <Check size={15} color="#059669" /> : <Copy size={15} />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Apps Script'}</span>
                </button>
              </div>

              <textarea
                readOnly
                className="form-textarea"
                style={{
                  height: 200,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  lineHeight: 1.4,
                  background: '#f8fafc',
                  color: '#1e293b',
                  border: '1px solid var(--border-strong)',
                }}
                value={appsScriptCode}
              />
            </div>
          )}

          {activeTab === 'export' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Download a local snapshot of your entire stationery ledger (Customers, Vendors, Sales, Collections, Purchases, Expenses, Follow-ups) to import into Google Sheets or keep as an offline archive.
              </div>

              <button className="btn-secondary" onClick={handleExportCSV} style={{ justifyContent: 'flex-start' }}>
                <Download size={18} color="#38bdf8" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>Download Full JSON Snapshot</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    All 11 tables with relations & timestamps
                  </div>
                </div>
              </button>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                You can also reset to default sample stationery data anytime from Settings.
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            {t.cancel}
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
