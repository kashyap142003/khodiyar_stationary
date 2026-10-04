import React, { useState } from 'react';
import {
  PhoneCall,
  Plus,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, getTranslation } from '../lib/i18n';
import { formatINR } from '../lib/money';
import { formatDate, formatRelativeDate } from '../lib/dates';
import { StorageService } from '../services/storage';
import { PrivacyValue } from '../components/PrivacyValue';
import { Followup, FollowupStatus } from '../types';
import { parseISO, isToday, isBefore, startOfDay } from 'date-fns';

interface Props {
  lang: Language;
  isPrivacyMode: boolean;
  onOpenNewFollowup: () => void;
}

export const FollowupsView: React.FC<Props> = ({
  lang,
  isPrivacyMode,
  onOpenNewFollowup,
}) => {
  const t = getTranslation(lang);
  const followups = StorageService.getFollowups().filter(f => !f.deletedAt);

  const [tab, setTab] = useState<'today' | 'upcoming' | 'overdue' | 'won'>('today');
  const today = startOfDay(new Date());

  const categorized = followups.filter((f) => {
    if (f.status === 'won' || f.status === 'lost' || f.completedAt) {
      return tab === 'won';
    }
    const fDate = parseISO(f.followUpAt);
    if (isToday(fDate)) {
      return tab === 'today';
    }
    if (isBefore(fDate, today)) {
      return tab === 'overdue';
    }
    return tab === 'upcoming';
  });

  const handleMarkWon = (f: Followup) => {
    f.status = 'won';
    f.completedAt = new Date().toISOString();
    StorageService.saveFollowup(f);
    try {
      confetti({ particleCount: 70, spread: 80 });
    } catch {}
  };

  const handleUpdateStatus = (f: Followup, status: FollowupStatus) => {
    f.status = status;
    if (status === 'won' || status === 'lost') {
      f.completedAt = new Date().toISOString();
    }
    StorageService.saveFollowup(f);
    if (status === 'won') {
      try {
        confetti({ particleCount: 60, spread: 70 });
      } catch {}
    }
  };

  const handleReschedule = (f: Followup) => {
    const nextDate = prompt('Enter new follow-up date (YYYY-MM-DD):', new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
    if (nextDate) {
      f.followUpAt = new Date(nextDate).toISOString();
      StorageService.saveFollowup(f);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t.followups}</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Customer inquiry pipeline, school/office orders & timely reminders
          </p>
        </div>

        <button className="btn-primary" onClick={onOpenNewFollowup}>
          <Plus size={16} />
          <span>{t.newFollowup}</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        <button
          className={`btn-secondary ${tab === 'today' ? 'active' : ''}`}
          onClick={() => setTab('today')}
          style={{
            padding: '8px 14px',
            fontSize: '0.8rem',
            background: tab === 'today' ? 'var(--accent-primary)' : undefined,
            color: tab === 'today' ? '#fff' : undefined,
          }}
        >
          Due Today
        </button>
        <button
          className={`btn-secondary ${tab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setTab('upcoming')}
          style={{
            padding: '8px 14px',
            fontSize: '0.8rem',
            background: tab === 'upcoming' ? 'var(--accent-primary)' : undefined,
            color: tab === 'upcoming' ? '#fff' : undefined,
          }}
        >
          Upcoming
        </button>
        <button
          className={`btn-secondary ${tab === 'overdue' ? 'active' : ''}`}
          onClick={() => setTab('overdue')}
          style={{
            padding: '8px 14px',
            fontSize: '0.8rem',
            background: tab === 'overdue' ? 'var(--accent-primary)' : undefined,
            color: tab === 'overdue' ? '#fff' : undefined,
          }}
        >
          Overdue
        </button>
        <button
          className={`btn-secondary ${tab === 'won' ? 'active' : ''}`}
          onClick={() => setTab('won')}
          style={{
            padding: '8px 14px',
            fontSize: '0.8rem',
            background: tab === 'won' ? 'var(--accent-primary)' : undefined,
            color: tab === 'won' ? '#fff' : undefined,
          }}
        >
          Won & Closed
        </button>
      </div>

      {/* Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {categorized.length === 0 ? (
          <div className="glass-card" style={{ padding: 36, textAlign: 'center', color: 'var(--text-dim)' }}>
            No follow-ups in this tab. You are all caught up!
          </div>
        ) : (
          categorized.map((item) => (
            <div
              key={item.id}
              className="glass-card"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                borderLeft: `4px solid ${
                  item.status === 'won'
                    ? '#10b981'
                    : item.status === 'lost'
                    ? '#64748b'
                    : tab === 'overdue'
                    ? '#f43f5e'
                    : '#6366f1'
                }`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                      {item.personName}
                    </span>
                    {item.segment && (
                      <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>
                        {item.segment}
                      </span>
                    )}
                  </div>
                  {item.phone && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 2 }}>
                      {item.phone}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  {item.estimatedValuePaise && (
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--accent-primary)' }}>
                      <PrivacyValue paise={item.estimatedValuePaise} isPrivacyMode={isPrivacyMode} />
                    </div>
                  )}
                  <span
                    className={`badge ${
                      item.status === 'won'
                        ? 'badge-emerald'
                        : item.status === 'lost'
                        ? 'badge-rose'
                        : 'badge-amber'
                    }`}
                    style={{ marginTop: 4, textTransform: 'capitalize' }}
                  >
                    {item.status === 'quotation' ? 'Quotation Sent' : item.status}
                  </span>
                </div>
              </div>

              {/* Requirement Text */}
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.4,
                }}
              >
                {item.requirement}
              </div>

              {item.notes && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Note: {item.notes}
                </div>
              )}

              {/* Timing & Action Toolbar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 10,
                  borderTop: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <Clock size={14} color="#818cf8" />
                  <span>{formatRelativeDate(item.followUpAt)}</span>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  {item.phone && (
                    <button
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                      onClick={() => window.open(`tel:${item.phone}`)}
                    >
                      <Phone size={14} color="#34d399" />
                      <span>{t.call}</span>
                    </button>
                  )}

                  {item.status !== 'won' && item.status !== 'lost' && (
                    <>
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        onClick={() => handleReschedule(item)}
                      >
                        <Calendar size={14} color="#fbbf24" />
                        <span>Reschedule</span>
                      </button>

                      <button
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#059669' }}
                        onClick={() => handleMarkWon(item)}
                      >
                        <CheckCircle2 size={14} />
                        <span>Won!</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
