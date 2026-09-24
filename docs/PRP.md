# Project Reference Prompt (PRP) — Inventory Management System

> **Version:** 1.0 | **Date:** 2026-08-26 | **Status:** Ready for Implementation
> **Currency:** Philippine Peso (₱) — `NUMERIC(15,2)` throughout
> **Primary Keys:** UUID v4 throughout

---

## 1. TypeScript Interfaces — Data Entities

### 1.1 Core / Master Data

```typescript
// === PROFILES ===
interface Profile {
  id: string;            // FK → auth.users(id)
  email: string;
  full_name: string;
  role: 'admin' | 'staff';
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

// === CUSTOMERS ===
interface Customer {
  id: string;
  name: string;          // UNIQUE
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  type: 'B2B' | 'B2C' | 'Both';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// === SUPPLIERS ===
interface Supplier {
  id: string;
  name: string;          // UNIQUE
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// === PRODUCTS ===
interface Product {
  id: string;
  name: string;          // UNIQUE
  description: string | null;
  unit: string;          // yards, meters, pieces, reams
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### 1.2 Finance Entities

```typescript
// === RECEIVABLES ===
type ReceivableStatus = 'Outstanding' | 'Partially Paid' | 'Fully Paid' | 'Voided';

interface Receivable {
  id: string;
  customer_id: string;
  source_type: 'B2B' | 'B2C';
  source_id: string;        // FK → b2b_fulfillments or b2c_printing_orders
  amount: string;           // NUMERIC(15,2) — use string to avoid float issues
  due_date: string;         // DATE
  status: ReceivableStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// === PAYABLES ===
type PayableStatus = 'Outstanding' | 'Partially Paid' | 'Fully Paid' | 'Voided';

interface Payable {
  id: string;
  supplier_id: string;
  source_type: 'B2B';
  source_id: string;        // FK → b2b_purchase_orders
  amount: string;
  due_date: string;
  status: PayableStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// === PAYMENTS ===
type PaymentType = 'receivable' | 'payable';
type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Check';

interface Payment {
  id: string;
  payment_type: PaymentType;
  source_id: string;        // FK → receivables.id or payables.id
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
```

### 1.3 B2B Entities

```typescript
// === PRE-ORDERS ===
type PreOrderStatus = 'Draft' | 'Submitted' | 'Converted' | 'Cancelled';

interface B2BPreOrder {
  id: string;
  customer_id: string;
  order_date: string;
  status: PreOrderStatus;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface B2BPreOrderItem {
  id: string;
  pre_order_id: string;
  product_id: string;
  quantity: string;         // NUMERIC(15,2), >= 1
  unit_price: string;       // NUMERIC(15,2), >= 0.01
  created_at: string;
  updated_at: string;
}

// === PURCHASE ORDERS ===
type POStatus = 'Draft' | 'Submitted' | 'Partially Received' | 'Fully Received' | 'Completed' | 'Cancelled';

interface B2BPurchaseOrder {
  id: string;
  pre_order_id: string | null;
  supplier_id: string;
  po_number: string;        // UNIQUE, human-readable
  order_date: string;
  status: POStatus;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface B2BPOItem {
  id: string;
  po_id: string;
  product_id: string;
  ordered_qty: string;      // NUMERIC(15,2), >= 1
  unit_price: string;
  received_qty: string;     // NUMERIC(15,2), default 0 — updated by triggers
  created_at: string;
  updated_at: string;
}

// === RECEIVING RECORDS ===
interface B2BReceivingRecord {
  id: string;
  po_id: string;
  receiving_date: string;
  received_by: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface B2BReceivingItem {
  id: string;
  receiving_id: string;
  po_item_id: string;
  received_qty: string;     // >= 0
  variance_qty: string;     // cumulative: received − ordered
  variance_reason: string | null;  // required when variance ≠ 0, max 500 chars
  created_at: string;
  updated_at: string;
}

// === FULFILLMENTS ===
type FulfillmentStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

interface B2BFulfillment {
  id: string;
  customer_id: string;
  fulfillment_date: string;
  status: FulfillmentStatus;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface B2BFulfillmentItem {
  id: string;
  fulfillment_id: string;
  product_id: string;
  quantity: string;         // >= 1
  unit_price: string;       // >= 0.01
  created_at: string;
  updated_at: string;
}
```

### 1.4 B2C Entities

```typescript
type PrintingOrderStatus = 'Pending' | 'In Production' | 'Completed' | 'Released' | 'Paid' | 'Cancelled';

interface B2CPrintingOrder {
  id: string;
  customer_id: string;
  order_date: string;
  status: PrintingOrderStatus;
  total_amount: string;     // NUMERIC(15,2), computed
  notes: string | null;
  production_notes: string | null;  // max 1000 chars
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

interface B2COrderItem {
  id: string;
  order_id: string;
  description: string;      // Free text — no product FK
  quantity: string;
  unit_price: string;
  total: string;            // quantity × unit_price
  created_at: string;
  updated_at: string;
}
```

### 1.5 Historical Debts & Inventory

```typescript
type VerificationStatus = 'Pending' | 'Verified' | 'Disputed' | 'Adjusted' | 'Written Off';

interface HistoricalDebt {
  id: string;
  entity_type: 'customer' | 'supplier';
  entity_id: string;
  amount: string;
  debt_date: string;        // must be <= CURRENT_DATE
  source: string | null;    // max 255 chars
  description: string | null; // max 500 chars
  verification_status: VerificationStatus;
  adjusted_amount: string | null;
  adjustment_reason: string | null;
  write_off_reason: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface HistoricalDebtStatusLog {
  id: string;
  debt_id: string;
  previous_status: VerificationStatus;
  new_status: VerificationStatus;
  reason: string | null;
  changed_by: string;
  changed_at: string;
}

type MovementType = 'received' | 'released' | 'adjustment';

interface InventoryMovement {
  id: string;
  product_id: string;
  movement_type: MovementType;
  quantity: string;         // positive=received/up, negative=released/down
  reference_type: 'receiving' | 'fulfillment' | 'adjustment' | null;
  reference_id: string | null;
  notes: string | null;
  created_by: string;
  movement_date: string;
  created_at: string;
}
```

### 1.6 Computed Views

```typescript
// === v_receivables ===
interface VReceivable {
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
  outstanding_balance: string;  // amount - SUM(non-voided payments)
  is_overdue: boolean;          // status IN (Outstanding, Partially Paid) AND due_date < today
}

// === v_payables ===
interface VPayable {
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

// === v_inventory_summary ===
interface VInventorySummary {
  product_id: string;
  name: string;
  unit: string;
  category: string | null;
  is_active: boolean;
  total_received: string;
  total_released: string;
  total_adjustments: string;
  current_quantity: string;     // received - released + adjustments
}

// === v_customer_outstanding ===
interface VCustomerOutstanding {
  customer_id: string;
  customer_name: string;
  receivable_outstanding: string;
  historical_debt_outstanding: string;
  total_outstanding: string;
}

// === v_supplier_outstanding ===
interface VSupplierOutstanding {
  supplier_id: string;
  supplier_name: string;
  payable_outstanding: string;
  historical_debt_outstanding: string;
  total_outstanding: string;
}
```

### 1.7 RPC Return Types

```typescript
interface DashboardSummary {
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

interface FinanceSearchResult {
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
```

---

## 2. Status State Machines

### 2.1 Receivables / Payables
```
Outstanding ──→ Partially Paid ──→ Fully Paid
     │                │
     └────────────────┘
                     (any → Voided, admin only)
```
- **Overdue** is NOT a stored status — computed: `status IN ('Outstanding','Partially Paid') AND due_date < CURRENT_DATE`

### 2.2 B2B Pre-Orders
```
Draft ──→ Submitted ──→ Converted
  │          │
  │          └──→ Cancelled
  └──→ Cancelled
```
- Converted/Cancelled are terminal states.

### 2.3 B2B Purchase Orders
```
Draft ──→ Submitted ──→ Partially Received ──→ Fully Received ──→ Completed
  │          │               │                       │
  │          └───→ Cancelled ←─┘                       │
  └───→ Cancelled                                      │
                                              (manual transition)
```
- Partially Received ↔ Partially Received (additional receiving, still not complete)
- Auto-determined by receiving records (trigger-based)

### 2.4 B2B Fulfillments
```
Pending ──→ In Progress ──→ Completed
  │             │
  │             └──→ Cancelled
  └──→ Cancelled
```
- On "Completed": trigger creates receivable + inventory movements (released)

### 2.5 B2C Printing Orders
```
Pending ──→ In Production ──→ Completed ──→ Released ──→ Paid
  │             │
  │             └──→ Cancelled
  └──→ Cancelled
```
- On "Released": trigger creates receivable
- On "Paid": receivable is fully paid
- Status timestamps auto-set by trigger

### 2.6 Historical Debt Verification
```
Pending ──→ Verified ──→ Adjusted ──→ Written Off
  │           │
  │           └──→ Written Off
  │
  └──→ Disputed ──→ Adjusted ──→ Written Off
                 │
                 └──→ Written Off
```
- "Adjusted" requires `adjusted_amount` + `adjustment_reason`
- "Written Off" requires `write_off_reason`

---

## 3. Key Business Logic Formulas

### 3.1 Outstanding Balance (computed in DB view, NEVER stored)
```
outstanding_balance = receivable.amount - COALESCE(SUM(payments.amount WHERE is_voided = false), 0)
```

### 3.2 Overdue Detection (computed flag, NEVER stored)
```
is_overdue = (status IN ('Outstanding', 'Partially Paid')) AND (due_date < CURRENT_DATE)
```

### 3.3 B2B Variance Calculation
```
variance_qty = cumulative_received_qty - ordered_qty   (per PO item)
// Negative = shortage, Positive = excess, Zero = exact
```

### 3.4 Inventory Current Quantity (computed in DB view)
```
current_qty = total_received - total_released + total_adjustments
```

### 3.5 Customer Outstanding Total (computed in DB view)
```
total_outstanding = SUM(receivable outstanding balances WHERE status IN ('Outstanding','Partially Paid'))
                  + SUM(historical_debt amounts WHERE status IN ('Pending','Verified','Disputed'))
```

### 3.6 Supplier Outstanding Total (computed in DB view)
```
total_outstanding = SUM(payable outstanding balances WHERE status IN ('Outstanding','Partially Paid'))
                  + SUM(historical_debt amounts WHERE status IN ('Pending','Verified','Disputed'))
```

### 3.7 Payment Status Auto-Update (trigger)
```
IF SUM(non-voided payments) >= receivable.amount → status = 'Fully Paid'
ELSIF SUM(non-voided payments) > 0 → status = 'Partially Paid'
```

### 3.8 B2C Order Item Total
```
item.total = item.quantity * item.unit_price
order.total_amount = SUM(all item totals)
```

---

## 4. Supabase Client Setup & Query Patterns

### 4.1 Client Initialization
```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: localStorage,
    autoRefreshToken: true,
  },
});
```

### 4.2 Auth Provider Pattern
```typescript
// src/providers/auth-provider.tsx
interface AuthContext {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}
```

### 4.3 TanStack Query Configuration
```typescript
// src/providers/query-provider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});
```

### 4.4 Common Query Patterns

**List with filters + pagination:**
```typescript
function useReceivables(filters: { status?: string; page: number }) {
  return useQuery({
    queryKey: ['receivables', filters],
    queryFn: async () => {
      let q = supabase.from('v_receivables').select('*', { count: 'exact' });
      if (filters.status) q = q.eq('status', filters.status);
      q = q.order('due_date', { ascending: false })
             .range(filters.page * 20, (filters.page + 1) * 20 - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return { items: data, total: count! };
    },
  });
}
```

**Record payment (mutation with invalidation):**
```typescript
function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payment: Insert<Payment>) => {
      const { data, error } = await supabase.from('payments').insert(payment).select().single();
      if (error) throw error;
      return data;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['receivables'] });
      qc.invalidateQueries({ queryKey: ['payables'] });
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
```

**Void payment (admin only):**
```typescript
async function voidPayment(paymentId: string, reason: string, adminId: string) {
  const { data, error } = await supabase
    .from('payments')
    .update({ is_voided: true, void_reason: reason, voided_by: adminId, voided_at: new Date().toISOString() })
    .eq('id', paymentId)
    .select().single();
  if (error) throw error;
  return data;
}
```

---

## 5. Component Specifications

### 5.1 UI Primitives (`src/components/ui/`)

| Component | File | Key Props |
|---|---|---|
| Button | `Button.tsx` | `variant: 'primary'\|'secondary'\|'danger'\|'ghost'`, `size: 'sm'\|'md'\|'lg'`, `loading`, `disabled` |
| Input | `Input.tsx` | `label`, `error`, `required`, `prefix` (for ₱), HTML input props |
| Select | `Select.tsx` | `label`, `options`, `value`, `onChange`, `searchable`, `placeholder` |
| Modal | `Modal.tsx` | `open`, `onClose`, `title`, `size: 'sm'\|'md'\|'lg'`, `footer` |
| Table | `Table.tsx` | `columns`, `data`, `sortable`, `paginated`, `loading`, `emptyMessage` |
| Badge | `Badge.tsx` | `status`, `variant` (auto-maps to colors per Section 4.7 of DESIGN.md) |
| Pagination | `Pagination.tsx` | `page`, `totalPages`, `totalItems`, `onPageChange` |
| SearchInput | `SearchInput.tsx` | `value`, `onChange`, `placeholder`, `debounceMs` |
| DateRangePicker | `DateRangePicker.tsx` | `fromDate`, `toDate`, `onChange` |
| ConfirmDialog | `ConfirmDialog.tsx` | `open`, `title`, `message`, `confirmLabel`, `onConfirm`, `onCancel`, `variant` |
| AmountDisplay | `AmountDisplay.tsx` | `value: string`, `showPesoSign`, `className` |
| LoadingSpinner | `LoadingSpinner.tsx` | `size`, `className` |

### 5.2 Layout Components (`src/components/layout/`)

| Component | File | Description |
|---|---|---|
| Sidebar | `Sidebar.tsx` | 240px expanded / 64px collapsed, dark bg (gray-900), module sections, active indicator |
| Header | `Header.tsx` | 48px top bar, breadcrumb left, user dropdown right |
| PageContainer | `PageContainer.tsx` | Standard page wrapper: title + action buttons + content area |

### 5.3 Finance Components (`src/components/finance/`)

| Component | File | Key Props |
|---|---|---|
| PaymentForm | `PaymentForm.tsx` | `paymentType`, `sourceId`, `outstandingBalance`, `onSubmit` |
| ReceivableCard | `ReceivableCard.tsx` | `receivable: VReceivable` |
| BalanceDisplay | `BalanceDisplay.tsx` | `amount`, `paid`, `outstanding`, `isOverdue` |

### 5.4 B2B Components (`src/components/b2b/`)

| Component | File | Key Props |
|---|---|---|
| ReceivingForm | `ReceivingForm.tsx` | `poId`, `poItems`, `onSubmit` |
| VarianceDisplay | `VarianceDisplay.tsx` | `ordered`, `received`, `variance`, `unit`, `reason` |
| POStatusBadge | `POStatusBadge.tsx` | `status: POStatus` |

### 5.5 Shared Components (`src/components/shared/`)

| Component | File | Key Props |
|---|---|---|
| EntitySelector | `EntitySelector.tsx` | `type: 'customer'\|'supplier'`, `value`, `onChange`, `searchable` |
| StatusBadge | `StatusBadge.tsx` | `status`, `statusMap` (color mapping) |
| DocumentPrintView | `DocumentPrintView.tsx` | `documentType`, `document`, `entity`, `items`, `payments` |

---

## 6. Complete File Structure

```
src/
├── main.tsx
├── App.tsx
├── index.css                          # Tailwind imports + design tokens
├── routes/
│   ├── __root.tsx                     # Layout wrapper
│   ├── _auth/
│   │   ├── login.tsx
│   │   └── forgot-password.tsx
│   └── _protected/
│       ├── dashboard.tsx
│       ├── finance/
│       │   ├── index.tsx              # Finance dashboard
│       │   ├── receivables.tsx
│       │   ├── payables.tsx
│       │   ├── payments.tsx
│       │   └── historical-debts.tsx
│       ├── b2b/
│       │   ├── pre-orders.tsx
│       │   ├── purchase-orders.tsx
│       │   └── fulfillments.tsx
│       ├── b2c/
│       │   └── printing-orders.tsx
│       ├── inventory/
│       │   ├── products.tsx
│       │   └── adjustments.tsx
│       ├── customers/
│       │   └── index.tsx
│       ├── suppliers/
│       │   └── index.tsx
│       ├── reports/
│       │   └── index.tsx
│       ├── documents/
│       │   └── index.tsx
│       └── settings/
│           └── users.tsx
├── components/
│   ├── ui/                            # 12 primitives (see 5.1)
│   ├── layout/                        # Sidebar, Header, PageContainer
│   ├── finance/                       # PaymentForm, ReceivableCard, BalanceDisplay
│   ├── b2b/                           # ReceivingForm, VarianceDisplay, POStatusBadge
│   └── shared/                        # EntitySelector, StatusBadge, DocumentPrintView
├── hooks/
│   ├── use-auth.ts
│   ├── use-session-timeout.ts
│   ├── use-role.ts
│   └── use-pagination.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── types.ts                   # Generated via supabase gen types
│   ├── utils/
│   │   ├── currency.ts                # formatPHP(), parsePHP()
│   │   ├── dates.ts                   # formatDate(), isOverdue()
│   │   ├── validators.ts             # Zod schemas
│   │   └── api-errors.ts             # handleSupabaseError()
│   └── constants.ts                   # Status enums, config
├── providers/
│   ├── auth-provider.tsx
│   └── query-provider.tsx
└── types/
    └── index.ts                       # App-level type definitions

supabase/
├── migrations/
│   ├── 20260826000001_create_base_tables.sql
│   ├── 20260826000002_create_finance_tables.sql
│   ├── 20260826000003_create_b2b_tables.sql
│   ├── 20260826000004_create_b2c_tables.sql
│   ├── 20260826000005_create_debts_inventory_tables.sql
│   ├── 20260826000006_create_views.sql
│   ├── 20260826000007_create_functions_triggers.sql
│   ├── 20260826000008_create_rls_policies.sql
│   └── 20260826000009_create_indexes.sql
└── functions/
    └── create-user/
        └── index.ts

.env.local                             # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

---

## 7. Design System Quick Reference

### 7.1 Status Badge Colors (from DESIGN.md Section 4.7)

| Status | BG | Text | Border |
|---|---|---|---|
| Outstanding | `blue-50` | `blue-700` | `blue-200` |
| Partially Paid | `amber-50` | `amber-700` | `amber-200` |
| Fully Paid | `green-50` | `green-700` | `green-200` |
| Voided / Cancelled | `gray-100` | `gray-500` | `gray-200` |
| Overdue | `red-50` | `red-700` | `red-200` |
| Draft / Pending | `gray-100` | `gray-600` | `gray-200` |
| Submitted / In Progress | `blue-50` | `blue-700` | `blue-200` |
| Converted | `emerald-50` | `emerald-700` | `emerald-200` |
| Partially Received | `amber-50` | `amber-700` | `amber-200` |
| Fully Received / Completed | `green-50` | `green-700` | `green-200` |
| In Production | `violet-50` | `violet-700` | `violet-200` |
| Released | `emerald-50` | `emerald-700` | `emerald-200` |
| Paid | `green-50` | `green-700` | `green-200` |
| Verified | `green-50` | `green-700` | `green-200` |
| Disputed | `red-50` | `red-700` | `red-200` |
| Adjusted | `blue-50` | `blue-700` | `blue-200` |
| Written Off | `gray-100` | `gray-500` | `gray-200` |

### 7.2 Variance Display Colors
| Condition | Color |
|---|---|
| Shortage (variance < 0) | `text-red-600` |
| Excess (variance > 0) | `text-blue-600` |
| Exact (variance = 0) | `text-green-600` |

### 7.3 Module Navigation Colors
| Module | Sidebar Accent |
|---|---|
| Finance | `blue-600` |
| B2B | `emerald-600` |
| B2C | `violet-600` |
| Inventory | `amber-600` |
| Customers | `cyan-600` |
| Suppliers | `slate-600` |
| Reports | `indigo-600` |
| Documents | `stone-600` |
| Settings | `gray-600` |

### 7.4 Key Design Specs
- **Font:** Inter, system-ui, sans-serif
- **Sidebar:** 240px expanded / 64px collapsed, bg `gray-900`
- **Top bar:** 48px height, white bg, border-bottom `gray-200`
- **Table rows:** 44px compact, cell padding `px-4 py-2.5`
- **Cards:** white bg, border `gray-200`, radius 6px, shadow-sm, padding 20px
- **Buttons:** Primary `bg-blue-600 hover:bg-blue-700 text-white`, height 36px (md)
- **Modal:** overlay `bg-black/50`, width 400/560/720px, radius 8px, shadow-lg
- **Page bg:** `gray-50`, content padding 24px

---

## 8. Error Handling Patterns

| Supabase Error Code | Meaning | User Message |
|---|---|---|
| `23505` | Unique violation | "A record with this name/number already exists." |
| `23503` | FK violation | "Cannot delete — this record is referenced by other data." |
| `23514` | CHECK constraint | "Invalid value — please check the field requirements." |
| `42501` | RLS violation | "You don't have permission to perform this action." |
| `PGRST116` | Row not found | "Record not found — it may have been deleted." |

---

## 9. Environment Variables

| Variable | Location | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Client (.env.local + Cloudflare) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Client (.env.local + Cloudflare) | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions secret only | Admin ops (NEVER in client) |

---

## 10. Increment Implementation Plan — Inventory Module Rebuild (v1.1, T-021/T-022)

Traceability: each step maps to PRD v1.1 increment acceptance criteria R1–R6 (docs/PRD.md) and requirements FR-INV-002…006. Verified acceptance criterion for every step is listed.

### Ordered steps

| # | Step | Files | Depends on | Effort estimate | Verification (acceptance) |
|---|---|---|---|---|---|
| 1 | Summary page onto real view columns: fetch `product_id, name, category, unit, total_received, total_released, total_adjustments, current_quantity` (product_id fetched for row identity/links, display columns per R1); status Badge from current_quantity (In ≥10 / Low <10 / Out ≤0); search `name`/`category` with 150 ms debounce and client-side comma sanitization (commas break PostgREST `or()` parsing → 400) ; shared tabs | `src/routes/_protected/inventory/summary.tsx` | — | ~0.5 day | R1: rows render vs mock+real schema; tsc clean |
| 2 | Adjustments page: signed non-zero qty (step 0.01, no min>0), mandatory reason ≤500 chars, date; negative-stock confirm dialog before decrease below zero — current quantity sourced on product-select change via `supabase.from('v_inventory_summary').select('name, current_quantity').eq('product_id', id).single()` (view is single derivation point, no client recompute); insert movement_type/reference_type `adjustment`, created_by=session user id (note: RLS permits any authenticated insert — role model, not RLS, is the control); PageTabs; movement log filter+pagination preserved | `src/routes/_protected/inventory/adjustments.tsx` | Step 1 (tabs), use-b2c hooks, v_inventory_summary read | ~1 day | R2/R3/R4: create ±adjustment appears in log with sign; cancel on warning inserts nothing |
| 3 | Tabs consistency + reports column alignment (R5/R6) | `src/routes/_protected/inventory/products.tsx`, `src/routes/_protected/reports/index.tsx` | Steps 1-2 | ~2 hours | R5/R6: all three tabs on all pages; report selects only view columns |
| 4 | Full verification: `pnpm build` (tsc+vite), dev server browser pass on 3 pages, guard Verify gates | — | Steps 1-3 | ~0.5 day | Build exit 0; pages render; console clean |

Total estimate: ~2.5 days elapsed (S/M complexity per execution-plan T-021=M, T-022=S).

### Risks, dependencies, constraints, prerequisites

- **Prerequisite (resolved):** node_modules absent → `pnpm install` done 2026-09-23; local `tsc` available.
- **Risk:** mock-client `.or(ilike)` support for view search — mitigated: filter client-side if mock query errors surface during Step 1 verification.
- **Risk:** existing `tsconfig baseUrl` deprecation warning under newer global tsc — constraint: verify with project-local typescript ~5.6 via `pnpm exec tsc`, not global npx fallback.
- **Dependency (external):** auto received/released movements come from B2B triggers (out of scope); summary correctness assumes they exist — no change needed in this increment.
- **Assumption:** low-stock threshold 10 units retained; sign convention for adjustment quantities is signed storage (confirmed by migration 008 + seed-data reference).
- **Recorded scope reduction (FR-INV-006):** per-product history tab with reference-document column, acting-user name, and date-range filter is NOT delivered in this increment; the global movement log with type filter + pagination + signed quantity + reason satisfies the T-022 literal completion criteria. Follow-up task proposed: product-detail history deep-link (needs `profiles(full_name)` join in `useInventoryMovements`).

### Rollback

All changes are page-level; revert the four touched files to restore prior behavior. No schema, migration, or hook-signature changes.

---

## 11. Increment Implementation Plan — UI/UX Enhancement (v1.2, 2026-09-24)

Requirements traceability: tasks below map to `docs/PRD.md` v1.2 acceptance criteria **U1–U8**; design constraints from `docs/DESIGN.md` v1.0 (§1 density principles, §2 token layers, §8 accessibility). Audit evidence: `prime/evidence/ui-audit/` (findings UX-1…UX-8).

### Milestones (ordered)

| # | Task | Files | Traces | Effort (est.) | Verification |
|---|---|---|---|---|---|
| T-101 | Responsive shell: sidebar becomes off-canvas drawer below `lg`; header menu button + overlay + Esc (focus returns to menu button) + close-on-nav; collapse rail (desktop) state lifted so content margin stays in sync. **Includes consolidating the duplicated shell at `App.tsx:105–119`** (`/settings/users` reuses `ProtectedLayout` + `AdminRoute` as inner element — also fixes its missing `DemoBanner`) | `src/App.tsx` (ProtectedLayout + settings route), `src/components/layout/Sidebar.tsx`, `src/components/layout/Header.tsx` | U1, U3 | 3h | Playwright 375/768: drawer opens, nav works, no horizontal overflow; 1280 collapse: content starts at rail edge (gap <8px); Esc closes drawer with focus on menu button; /settings/users shows banner and drawer |
| T-102 | Contained table scroll: `overflow-x-auto` wrapper in shared Table + audit-flagged custom grids | `src/components/ui/Table.tsx`, page-level wrappers as needed | U2 | 1h | `scrollWidth ≤ innerWidth + 2` at 768/375 on inventory, reports, users |
| T-103 | Visible keyboard focus: `focus-visible:ring-2 ring-primary-500` on Button/Input/Select/icon buttons; remove default outline suppression where present | `src/components/ui/Button.tsx`, `Input.tsx`, `Select.tsx`, `Header.tsx`, `Sidebar.tsx`, login role cards | U4 | 1h | Tab probe: focused control computed box-shadow ≠ unfocused |
| T-104 | Honest header: search button opens popover (input + Enter → `/finance/search?q=…`; `search.tsx` seeds query from `useSearchParams`); bell shows real counts (low-stock from `v_inventory_summary`, overdue from dashboard summary) with links, popover closes on Esc/outside | `Header.tsx`, `src/routes/_protected/finance/search.tsx` | U5 | 2.5h | Type "linen" + Enter → finance search filtered; bell counts match mock data; no dead buttons remain (source has handlers) |
| T-105 | Single page title: breadcrumb renders module context only (drop last crumb duplicating content H1) | `Header.tsx` | U6 | 0.5h | Breadcrumb text ≠ H1 text on all audited pages |
| T-106 | Dashboard density: "Needs Attention" (low/out-of-stock list) + "Recent Activity" (last 5 stock movements) sections under Modules, reusing existing view queries | `src/routes/_protected/dashboard.tsx`, possibly small hook in `use-b2b.ts` | U7 | 2.5h | 1280×800 screenshot: populated section below Modules, no dead zone >200px |
| T-107 | Token fidelity pass: all new classes from DESIGN.md token tables (gray/primary semantic layers); no new hex/fonts | diff review | U8 | 0.5h | grep diff for raw hex/new palette classes |

Total estimate ≈ 11h (PERT optimistic 8h / likely 11h / pessimistic 16h) — one working day.

### Risks, dependencies, constraints, assumptions

- **Risk R1 (regression):** drawer refactor could break desktop collapse → mitigation: keep `collapsed` behavior `lg+` only; audit script re-run covers 1280.
- **Risk R2 (demo data):** bell counts depend on mock views (`v_inventory_summary`, receivables overdue) — verified mock client supports `.or`/`ilike` (`mock-client.ts:78,193`); if a view query shape mismatches, degrade bell to overdue-only.
- **Risk R3 (deploy):** every push to main auto-deploys to Cloudflare Pages; incomplete work must not land on main → constraint: commit only after `tsc --noEmit` + `npm test` + local preview check.
- **Dependency:** none new — no package additions (constraint).
- **Constraint:** light theme + Inter + existing tokens only (DESIGN.md v1.0 is source of truth; ui-ux-pro-max dark-OLED suggestion rejected).
- **Assumption:** mobile target is "usable, non-overflowing", not a touch-redesigned UI (out of scope per PRD v1.2).

### Rollback

Frontend-only change set; revert the v1.2 commit(s) on main redeploys the previous release automatically via GitHub Actions. No schema or data impact.
