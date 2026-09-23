/**
 * Format an ISO date string to a human-readable format.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format an ISO datetime string to a human-readable format with time.
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Check if a date is overdue (before today) given a status.
 */
export function isOverdue(dueDate: string, status: string): boolean {
  const overdueStatuses = ['Outstanding', 'Partially Paid'];
  if (!overdueStatuses.includes(status)) return false;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

/**
 * Get today's date in YYYY-MM-DD format for date inputs.
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Format a date to YYYY-MM-DD for API submissions.
 */
export function toDateInput(dateStr: string): string {
  return dateStr.split('T')[0];
}
