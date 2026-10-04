import React from 'react';
import { formatINR } from '../lib/money';

interface Props {
  paise: number;
  isPrivacyMode: boolean;
  className?: string;
}

export const PrivacyValue: React.FC<Props> = ({ paise, isPrivacyMode, className = '' }) => {
  return (
    <span className={`privacy-val ${className} ${isPrivacyMode ? 'text-dim select-none' : ''}`}>
      {formatINR(paise, isPrivacyMode)}
    </span>
  );
};
