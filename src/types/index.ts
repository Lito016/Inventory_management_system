// ============================================================
// Core / Master Data
// ============================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'staff';
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  type: 'B2B' | 'B2C' | 'Both';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Finance Entities
// ============================================================

export type ReceivableStatus = 'Outstanding' | 'Partially Paid' | 'Fully Paid' | 'Voided';
export type PayableStatus = 'Outstanding' | 'Partially Paid' | 'Fully Paid' | 'Voided';
export type PaymentType = 'receivable' | 'payable';
export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Check';

export interface Receivable {
  id: string;
  customer_id: string;
  source_type: 'B2B' | 'B2C';
  source_id: string;
  amount: string;
  due_date: string;
  status: ReceivableStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payable {
  id: string;
  supplier_id: string;
  source_type: 'B2B';
  source_id: string;
  amount: string;
  due_date: string;
  status: PayableStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  payment_type: PaymentType;
  source_id: string;
  amount: string;
  payment_date: string;
  payment_method: PaymentMethod;
  reference_number: string | null;
  is_voided: boolean;
  void_reason: string | null;
  voided_by: string | null;
  voided_at: string | null;
  recorded_by: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// B2B Entities
// ============================================================

export type PreOrderStatus = 'Draft' | 'Submitted' | 'Converted' | 'Cancelled';
export type POStatus = 'Draft' | 'Submitted' | 'Partially Received' | 'Fully Received' | 'Completed' | 'Cancelled';
export type FulfillmentStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface B2BPreOrder {
  id: string;
  customer_id: string;
  order_date: string;
  status: PreOrderStatus;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface B2BPreOrderItem {
  id: string;
  pre_order_id: string;
  product_id: string;
  quantity: string;
  unit_price: string;
  created_at: string;
  updated_at: string;
}

export interface B2BPurchaseOrder {
  id: string;
  pre_order_id: string | null;
  supplier_id: string;
  po_number: string;
  order_date: string;
  status: POStatus;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface B2BPOItem {
  id: string;
  po_id: string;
  product_id: string;
  ordered_qty: string;
  unit_price: string;
  received_qty: string;
  created_at: string;
  updated_at: string;
}

export interface B2BReceivingRecord {
  id: string;
  po_id: string;
  receiving_date: string;
  received_by: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface B2BReceivingItem {
  id: string;
  receiving_id: string;
  po_item_id: string;
  received_qty: string;
  variance_qty: string;
  variance_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface B2BFulfillment {
  id: string;
  customer_id: string;
  fulfillment_date: string;
  status: FulfillmentStatus;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface B2BFulfillmentItem {
  id: string;
  fulfillment_id: string;
  product_id: string;
  quantity: string;
  unit_price: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// B2C Entities
// ============================================================

export type PrintingOrderStatus = 'Pending' | 'In Production' | 'Completed' | 'Released' | 'Paid' | 'Cancelled';

export interface B2CPrintingOrder {
  id: string;
  customer_id: string;
  order_date: string;
  status: PrintingOrderStatus;
  total_amount: string;
  notes: string | null;
  production_notes: string | null;
  pending_at: string | null;
  in_production_at: string | null;
  completed_at: string | null;
  released_at: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface B2COrderItem {
  id: string;
  order_id: string;
  description: string;
  quantity: string;
  unit_price: string;
  total: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Historical Debts & Inventory
// ============================================================

export type VerificationStatus = 'Pending' | 'Verified' | 'Disputed' | 'Adjusted' | 'Written Off';
export type MovementType = 'received' | 'released' | 'adjustment';

export interface HistoricalDebt {
  id: string;
  entity_type: 'customer' | 'supplier';
  entity_id: string;
  amount: string;
  debt_date: string;
  source: string | null;
  description: string | null;
  verification_status: VerificationStatus;
  adjusted_amount: string | null;
  adjustment_reason: string | null;
  write_off_reason: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HistoricalDebtStatusLog {
  id: string;
  debt_id: string;
  previous_status: VerificationStatus;
  new_status: VerificationStatus;
  reason: string | null;
  changed_by: string;
  changed_at: string;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  movement_type: MovementType;
  quantity: string;
  reference_type: 'receiving' | 'fulfillment' | 'adjustment' | null;
  reference_id: string | null;
  notes: string | null;
  created_by: string;
  movement_date: string;
  created_at: string;
}

// ============================================================
// Computed Views
// ============================================================

export interface VReceivable {
  id: string;
  customer_id: string;
  customer_name: string;
  source_type: 'B2B' | 'B2C';
  source_id: string;
  amount: string;
  due_date: string;
  status: ReceivableStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  outstanding_balance: string;
  is_overdue: boolean;
}

export interface VPayable {
  id: string;
  supplier_id: string;
  supplier_name: string;
  source_type: 'B2B';
  source_id: string;
  amount: string;
  due_date: string;
  status: PayableStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  outstanding_balance: string;
  is_overdue: boolean;
}

export interface VInventorySummary {
  product_id: string;
  name: string;
  unit: string;
  category: string | null;
  is_active: boolean;
  total_received: string;
  total_released: string;
  total_adjustments: string;
  current_quantity: string;
}

export interface VCustomerOutstanding {
  customer_id: string;
  customer_name: string;
  receivable_outstanding: string;
  historical_debt_outstanding: string;
  total_outstanding: string;
}

export interface VSupplierOutstanding {
  supplier_id: string;
  supplier_name: string;
  payable_outstanding: string;
  historical_debt_outstanding: string;
  total_outstanding: string;
}

// ============================================================
// RPC Return Types
// ============================================================

export interface DashboardSummary {
  total_receivable_outstanding: string;
  total_receivable_overdue: string;
  overdue_receivable_count: number;
  total_payable_outstanding: string;
  total_payable_overdue: string;
  overdue_payable_count: number;
  recent_transactions: Array<{
    date: string;
    type: string;
    description: string;
    amount: string;
  }>;
  low_stock_products: Array<{
    product_id: string;
    name: string;
    current_quantity: string;
    unit: string;
  }>;
}

export interface FinanceSearchResult {
  result_type: 'receivable' | 'payable' | 'payment';
  id: string;
  date: string;
  entity_name: string;
  amount: string;
  outstanding_balance?: string;
  status?: string;
  is_overdue?: boolean;
  reference?: string;
  payment_method?: string;
  reference_number?: string;
}
