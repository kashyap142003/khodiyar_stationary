import React from 'react';
import { HelpCircle, X, CheckCircle2, Calculator, Lightbulb, Sparkles } from 'lucide-react';
import { Language } from '../lib/i18n';
import { CARD_HELP_DOCS } from '../lib/cardHelpDocs';

interface Props {
  docId: string | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const InfoModal: React.FC<Props> = ({ docId, isOpen, onClose, lang }) => {
  if (!isOpen || !docId) return null;

  const doc = CARD_HELP_DOCS[docId];
  if (!doc) return null;

  const isGu = lang === 'gu';
  const title = isGu ? doc.titleGu : doc.titleEn;
  const category = isGu ? doc.categoryGu : doc.categoryEn;
  const whatIsIt = isGu ? doc.whatIsItGu : doc.whatIsItEn;
  const calculation = isGu ? doc.calculationGu : doc.calculationEn;
  const actionGuide = isGu ? doc.actionGuideGu : doc.actionGuideEn;
  const example = isGu ? doc.exampleGu : doc.exampleEn;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480, width: '92vw' }}
      >
        <div className="modal-header" style={{ paddingBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(79, 70, 229, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5',
                flexShrink: 0,
              }}
            >
              <HelpCircle size={20} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#4f46e5',
                  letterSpacing: '0.04em',
                }}
              >
                {category}
              </div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {title}
              </h2>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close info">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 6 }}>
          {/* 1. What is this? */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Sparkles size={14} color="#4f46e5" />
              <span>{isGu ? 'આ કાર્ડ શું દર્શાવે છે?' : 'What does this show?'}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
              {whatIsIt}
            </p>
          </div>

          {/* 2. Calculation Formula (if applicable) */}
          {calculation && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#1d4ed8',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Calculator size={14} />
                <span>{isGu ? 'ગણતરીની રીત (Formula)' : 'Calculation Formula'}</span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e40af' }}>
                {calculation}
              </div>
            </div>
          )}

          {/* 3. What should the shopkeeper do? */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                color: '#059669',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <CheckCircle2 size={15} />
              <span>{isGu ? 'દુકાનદાર તરીકે શું કરવું?' : 'What should you do?'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {actionGuide.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    fontSize: '0.82rem',
                    lineHeight: 1.45,
                    color: 'var(--text-main)',
                    background: '#f0fdf4',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid #dcfce7',
                  }}
                >
                  <span style={{ color: '#059669', fontWeight: 800 }}>•</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Real-life example */}
          {example && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                fontSize: '0.8rem',
                color: '#92400e',
                lineHeight: 1.45,
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  marginBottom: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  color: '#b45309',
                }}
              >
                <Lightbulb size={14} />
                <span>{isGu ? 'ઉદાહરણ (Example)' : 'Real Example'}</span>
              </div>
              {example}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ marginTop: 6, paddingTop: 10 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={onClose}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {isGu ? 'સમજાઈ ગયું (Got it)' : 'Understood'}
          </button>
        </div>
      </div>
    </div>
  );
};
