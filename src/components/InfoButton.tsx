import React from 'react';
import { Info } from 'lucide-react';

interface Props {
  docId: string;
  onClick: (docId: string) => void;
  size?: number;
  label?: string;
  color?: string;
}

export const InfoButton: React.FC<Props> = ({
  docId,
  onClick,
  size = 14,
  label,
  color = 'var(--text-dim)',
}) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(docId);
      }}
      aria-label="Info and guidance"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        padding: '2px 4px',
        borderRadius: '50%',
        background: 'transparent',
        border: 'none',
        color: color,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--accent-primary)';
        e.currentTarget.style.transform = 'scale(1.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = color;
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <Info size={size} />
      {label && <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{label}</span>}
    </button>
  );
};
