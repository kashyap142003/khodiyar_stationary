import { format, parseISO, isToday, isYesterday, differenceInDays } from 'date-fns';

export function formatDate(dateStrOrObj: string | Date | undefined): string {
  if (!dateStrOrObj) return '—';
  try {
    const d = typeof dateStrOrObj === 'string' ? parseISO(dateStrOrObj) : dateStrOrObj;
    if (isNaN(d.getTime())) return '—';
    return format(d, 'dd MMM yyyy');
  } catch {
    return '—';
  }
}

export function formatDateTime(dateStrOrObj: string | Date | undefined): string {
  if (!dateStrOrObj) return '—';
  try {
    const d = typeof dateStrOrObj === 'string' ? parseISO(dateStrOrObj) : dateStrOrObj;
    if (isNaN(d.getTime())) return '—';
    return format(d, 'dd MMM, hh:mm a');
  } catch {
    return '—';
  }
}

export function formatRelativeDate(dateStrOrObj: string | Date | undefined): string {
  if (!dateStrOrObj) return '—';
  try {
    const d = typeof dateStrOrObj === 'string' ? parseISO(dateStrOrObj) : dateStrOrObj;
    if (isNaN(d.getTime())) return '—';
    
    if (isToday(d)) {
      return `Today (${format(d, 'hh:mm a')})`;
    }
    if (isYesterday(d)) {
      return `Yesterday (${format(d, 'hh:mm a')})`;
    }

    const today = new Date();
    const diff = differenceInDays(d, today);
    if (diff > 0 && diff <= 7) {
      return `In ${diff} day${diff > 1 ? 's' : ''}`;
    }
    if (diff < 0) {
      const absDiff = Math.abs(diff);
      return `${absDiff} day${absDiff > 1 ? 's' : ''} overdue`;
    }

    return format(d, 'dd MMM yyyy');
  } catch {
    return '—';
  }
}

export function getTodayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
