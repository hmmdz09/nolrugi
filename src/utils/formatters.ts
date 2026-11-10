/**
 * Indonesian Rupiah and Date formatting utilities for NolRugi
 */

export const formatRupiah = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
};

export const formatPercent = (val: number, decimals: number = 1): string => {
  if (isNaN(val)) return '0%';
  return `${val.toFixed(decimals)}%`;
};

export const formatDateIndo = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Calculates days difference between target date and today.
 * Positive = days in the future (remaining before expiry)
 * Negative = already passed expiry
 */
export const getDaysRemaining = (expiryDateStr: string, baseDate: Date = new Date()): number => {
  const expiry = new Date(expiryDateStr);
  const today = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const exp = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
  const diffTime = exp.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculates dwell time (days since entry date until today)
 */
export const getDwellDays = (entryDateStr: string, baseDate: Date = new Date()): number => {
  const entry = new Date(entryDateStr);
  const today = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const ent = new Date(entry.getFullYear(), entry.getMonth(), entry.getDate());
  const diffTime = today.getTime() - ent.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
};

/**
 * Determine FEFO stock status:
 * - Kritis (H-3): Expiring in <= 3 days
 * - Waspada (H-7): Expiring in 4 to 7 days
 * - Dwell-Time Alert: Kemasan polos dwelling > 21 days
 * - Aman: Expiring in > 7 days and healthy dwell time
 */
export const getBatchStatus = (
  expiryDateStr: string,
  entryDateStr: string,
  packagingType: 'kemasan-berlabel' | 'kemasan-polos',
  baseDate: Date = new Date()
): { status: 'kritis' | 'waspada' | 'aman' | 'dwell-alert'; label: string; badgeClass: string; daysLeft: number; dwellDays: number } => {
  const daysLeft = getDaysRemaining(expiryDateStr, baseDate);
  const dwellDays = getDwellDays(entryDateStr, baseDate);

  if (daysLeft <= 3) {
    return {
      status: 'kritis',
      label: daysLeft <= 0 ? 'Kedaluwarsa Hari Ini' : `Kritis (H-${daysLeft})`,
      badgeClass: 'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-900/50 dark:text-rose-400',
      daysLeft,
      dwellDays,
    };
  }

  if (daysLeft <= 7) {
    return {
      status: 'waspada',
      label: `Waspada (H-${daysLeft})`,
      badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50 dark:text-amber-400',
      daysLeft,
      dwellDays,
    };
  }

  // Dwell time alert for plain unpackaged or unlabelled shelf items stored over 21 days
  if (packagingType === 'kemasan-polos' && dwellDays > 21) {
    return {
      status: 'dwell-alert',
      label: `Mengendap ${dwellDays} Hari (>21h)`,
      badgeClass: 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900/50 dark:text-orange-400',
      daysLeft,
      dwellDays,
    };
  }

  return {
    status: 'aman',
    label: `Aman (${daysLeft} hari lagi)`,
    badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/50 dark:text-emerald-400',
    daysLeft,
    dwellDays,
  };
};

