/**
 * Money utilities for ShopBook v2.
 * All monetary amounts are stored as integer paise (1 INR = 100 paise)
 * to eliminate floating point issues.
 */

export function paiseToRupees(paise: number): number {
  return (paise || 0) / 100;
}

export function rupeesToPaise(rupees: number | string): number {
  if (typeof rupees === 'string') {
    rupees = parseFloat(rupees.replace(/[^0-9.-]/g, '')) || 0;
  }
  return Math.round(rupees * 100);
}

/**
 * Formats integer paise into Indian Rupee string (₹ XX,XXX)
 */
export function formatINR(paise: number, isPrivacyMode: boolean = false): string {
  if (isPrivacyMode) {
    return '₹ •••••';
  }

  const rupees = paiseToRupees(paise);
  const isNegative = rupees < 0;
  const absRupees = Math.abs(rupees);

  // Indian number format (lakhs & crores: 1,00,000)
  const formatted = absRupees.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: absRupees % 1 === 0 ? 0 : 2,
  });

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Compact Indian Rupee format for tight cards: e.g. ₹1.45L, ₹25K
 */
export function formatCompactINR(paise: number, isPrivacyMode: boolean = false): string {
  if (isPrivacyMode) {
    return '₹•••';
  }

  const rupees = Math.abs(paiseToRupees(paise));
  const sign = paise < 0 ? '-' : '';

  if (rupees >= 10000000) {
    return `${sign}₹${(rupees / 10000000).toFixed(2)} Cr`;
  }
  if (rupees >= 100000) {
    return `${sign}₹${(rupees / 100000).toFixed(2)} L`;
  }
  if (rupees >= 1000) {
    return `${sign}₹${(rupees / 1000).toFixed(1)} K`;
  }
  return `${sign}₹${rupees.toLocaleString('en-IN')}`;
}
