/**
 * Date & Time utilities for real-time live synchronization.
 * Supports Pakistan Standard Time (PKT, UTC+5) and dynamic live calendar dates.
 */

export function getLiveDateStr(d: Date = new Date()): string {
  // Format as YYYY-MM-DD in local/PKT timezone
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLiveTimeStr(d: Date = new Date()): string {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function getLiveTimeShortStr(d: Date = new Date()): string {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getLiveMonthStr(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getLiveMonthName(monthStr: string): string {
  try {
    const [y, m] = monthStr.split('-');
    const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  } catch (e) {
    return monthStr;
  }
}

export function getAvailableMonthOptions(count: number = 6): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const current = new Date();

  // Current and past 5 months
  for (let i = 0; i < count; i++) {
    const d = new Date(current.getFullYear(), current.getMonth() - i, 1);
    const value = getLiveMonthStr(d);
    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    options.push({ value, label });
  }

  // Ensure default demo months (e.g., 2026-08) are included if not present
  if (!options.some(o => o.value === '2026-08')) {
    options.push({ value: '2026-08', label: 'August 2026' });
  }

  return options;
}

export function formatDateTimeStamp(d: Date = new Date()): string {
  return `${getLiveDateStr(d)} ${getLiveTimeStr(d)} PKT`;
}
