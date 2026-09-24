// ============================================================
// Status Enums
// ============================================================

export const RECEIVABLE_STATUSES = ['Outstanding', 'Partially Paid', 'Fully Paid', 'Voided'] as const;
export const PAYABLE_STATUSES = ['Outstanding', 'Partially Paid', 'Fully Paid', 'Voided'] as const;
export const PAYMENT_TYPES = ['receivable', 'payable'] as const;
export const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Check'] as const;
export const PRE_ORDER_STATUSES = ['Draft', 'Submitted', 'Converted', 'Cancelled'] as const;
export const PO_STATUSES = ['Draft', 'Submitted', 'Partially Received', 'Fully Received', 'Completed', 'Cancelled'] as const;
export const FULFILLMENT_STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled'] as const;
export const PRINTING_ORDER_STATUSES = ['Pending', 'In Production', 'Completed', 'Released', 'Paid', 'Cancelled'] as const;
export const VERIFICATION_STATUSES = ['Pending', 'Verified', 'Disputed', 'Adjusted', 'Written Off'] as const;
export const CUSTOMER_TYPES = ['B2B', 'B2C', 'Both'] as const;
export const MOVEMENT_TYPES = ['received', 'released', 'adjustment'] as const;
export const USER_ROLES = ['admin', 'staff'] as const;

// ============================================================
// Config Values
// ============================================================

export const PAGE_SIZE = 20;
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const SEARCH_DEBOUNCE_MS = 300;
export const CURRENCY = '₱';

// ============================================================
// Status Badge Color Maps
// ============================================================

export const FINANCE_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Outstanding': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Partially Paid': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Fully Paid': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'Voided': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  'Overdue': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

export const B2B_PRE_ORDER_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Draft': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  'Submitted': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Converted': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Cancelled': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
};

export const PO_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Draft': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  'Submitted': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Partially Received': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Fully Received': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'Completed': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'Cancelled': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
};

export const FULFILLMENT_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Pending': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  'In Progress': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Completed': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'Cancelled': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
};

export const PRINTING_ORDER_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Pending': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  'In Production': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  'Completed': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'Released': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Paid': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'Cancelled': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
};

export const VERIFICATION_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Pending': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  'Verified': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'Disputed': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'Adjusted': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Written Off': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
};
