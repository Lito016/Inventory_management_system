# Execution Plan — UBMS

> **Version:** 1.0 | **Date:** 2026-08-26 | **Status:** Ready for Build
> **Total Tasks:** 30 | **Sprints:** 7 | **Requirements Covered:** 55 (all FR-xxx)

---

## Sprint 1: Foundation (Tasks 1–5)

### Task 1: Project Setup & Tooling

| Attribute | Value |
|---|---|
| **Task ID** | T-001 |
| **Requirements** | NFR-001, NFR-002, NFR-006 |
| **Complexity** | S |
| **Dependencies** | None |
| **Completion Criteria** | Vite dev server runs; `npm run dev` starts; Tailwind renders; Supabase client connects; login page shows "Hello" |

**Files to Create:**
- `package.json` — dependencies: react 19, react-router 7, @supabase/supabase-js, @tanstack/react-query 5, react-hook-form, zod, lucide-react, jspdf, html2canvas, papaparse
- `vite.config.ts` — React plugin, env vars, build config
- `tsconfig.json`, `tsconfig.app.json`
- `tailwind.config.ts` — design tokens (colors from DESIGN.md Section 2.1), Inter font
- `postcss.config.js`
- `src/main.tsx` — providers setup (AuthProvider → QueryClientProvider → RouterProvider)
- `src/App.tsx` — root router config
- `src/index.css` — Tailwind imports + CSS custom properties for design tokens
- `src/lib/supabase/client.ts` — Supabase browser client
- `src/lib/supabase/types.ts` — placeholder (generated later)
- `src/lib/constants.ts` — status enums, config values
- `src/lib/utils/currency.ts` — `formatPHP(value: string): string`, `parsePHP(value: string): string`
- `src/lib/utils/dates.ts` — `formatDate()`, `isOverdue()`
- `src/lib/utils/validators.ts` — Zod schemas for common fields
- `src/lib/utils/api-errors.ts` — `handleSupabaseError()`
- `src/providers/auth-provider.tsx` — auth context (user, profile, session, loading, signOut)
- `src/providers/query-provider.tsx` — TanStack Query client
- `src/hooks/use-auth.ts` — `useAuth()` hook
- `src/hooks/use-role.ts` — `useRole()` hook (isAdmin check)
- `src/hooks/use-session-timeout.ts` — 30-min inactivity timeout
- `src/hooks/use-pagination.ts` — pagination state helper
- `.env.local` — VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- `.env.example` — template without real values
- `.gitignore` — node_modules, dist, .env*, .env.local

---

### Task 2: Database Schema & Migrations

| Attribute | Value |
|---|---|
| **Task ID** | T-002 |
| **Requirements** | All FR-* (data layer), NFR-004 |
| **Complexity** | L |
| **Dependencies** | T-001 (Supabase project must exist) |
| **Completion Criteria** | All 20 tables, 5 views, 16 triggers created; RLS enabled on all tables; `supabase db push` succeeds; can INSERT/SELECT from all tables |

**Files to Create:**
- `supabase/migrations/20260826000001_create_base_tables.sql`
  - Enable `pgcrypto` extension
  - Helper functions: `get_user_role()`, `update_updated_at()`
  - Tables: `profiles`, `customers`, `suppliers`, `products`
- `supabase/migrations/20260826000002_create_finance_tables.sql`
  - Tables: `receivables`, `payables`, `payments` (all CHECK constraints, FK references)
- `supabase/migrations/20260826000003_create_b2b_tables.sql`
  - Tables: `b2b_pre_orders`, `b2b_pre_order_items`, `b2b_purchase_orders`, `b2b_po_items`, `b2b_receiving_records`, `b2b_receiving_items`, `b2b_fulfillments`, `b2b_fulfillment_items`
- `supabase/migrations/20260826000004_create_b2c_tables.sql`
  - Tables: `b2c_printing_orders`, `b2c_order_items`
- `supabase/migrations/20260826000005_create_debts_inventory_tables.sql`
  - Tables: `historical_debts`, `historical_debt_status_logs`, `inventory_movements`
- `supabase/migrations/20260826000006_create_views.sql`
  - Views: `v_receivables`, `v_payables`, `v_inventory_summary`, `v_customer_outstanding`, `v_supplier_outstanding`
- `supabase/migrations/20260826000007_create_functions_triggers.sql`
  - 16 trigger functions + triggers (see data-model.md Section 5.1–5.12)
  - DB-level status enforcement: CHECK constraints on all status columns
  - `trg_fulfillment_completed` → creates receivable
  - `trg_b2c_order_released` → creates receivable
  - `trg_po_fully_received` → creates payable
  - `trg_payment_inserted` → updates source status
  - `trg_payment_voided` → recalculates status
  - `trg_receiving_creates_inventory` → creates inventory movements
  - `trg_fulfillment_creates_inventory` → creates inventory movements
  - `trg_receiving_updates_po_status` → auto-updates PO status
  - `trg_b2c_status_timestamps` → sets status timestamps
  - `trg_debt_status_change` → logs status changes
  - `on_auth_user_created` → creates profile
  - `update_updated_at` triggers on all tables with updated_at
- `supabase/migrations/20260826000008_create_rls_policies.sql`
  - Enable RLS on ALL 20 tables
  - Business tables: SELECT/INSERT/UPDATE for authenticated
  - `payments`: void restriction (admin only via WITH CHECK)
  - `profiles`: admin-only user management policies
  - NO DELETE policy on any table
  - `historical_debt_status_logs`: SELECT only, trigger-only INSERT
- `supabase/migrations/20260826000009_create_indexes.sql`
  - All indexes from data-model.md (composite indexes for overdue, source lookups, etc.)
  - **Quality fix:** Add `idx_payments_is_voided` and composite `idx_receivables_overdue(status, due_date)`
- `supabase/migrations/20260826000010_create_rpc_functions.sql`
  - `get_dashboard_summary()` — aggregated metrics
  - `get_finance_search(search_term, filter_type, filter_from_date, filter_to_date, page_size, page_offset)` — unified search
  - `get_customer_statement(p_customer_id, p_from_date, p_to_date)` — running balance
  - `get_supplier_statement(p_supplier_id, p_from_date, p_to_date)` — running balance
  - **Quality fix:** Add `get_unified_documents()` RPC for FR-DOC-001
  - **Quality fix:** Add `get_sales_report()` RPC for FR-RPT-001

**Sub-tasks (Phase 3 quality review fixes):**
- [ ] DB-level status enforcement via CHECK constraints on all status columns
- [ ] Composite index on `payments(payment_type, source_id)` for balance lookups
- [ ] `payments` index on `is_voided` for balance calculations
- [ ] `idx_receivables_overdue(status, due_date)` for overdue queries

---

### Task 3: Authentication & Protected Routes

| Attribute | Value |
|---|---|
| **Task ID** | T-003 |
| **Requirements** | FR-AUTH-001, FR-AUTH-002 |
| **Complexity** | M |
| **Dependencies** | T-001, T-002 |
| **Completion Criteria** | User can login with email/password; session persists across refresh; 30-min timeout works; unauthenticated users redirected to /login; profile loaded after login |

**Files to Create/Modify:**
- `src/routes/_auth/login.tsx` — login form (email, password), error handling, redirect to /dashboard
- `src/routes/_auth/forgot-password.tsx` — password reset request form (placeholder, full flow in T-028)
- `src/routes/__root.tsx` — layout wrapper with auth check
- Modify `src/providers/auth-provider.tsx` — session listener, profile fetch, last_login_at update
- Modify `src/hooks/use-session-timeout.ts` — track interactions, signOut after 30 min
- `src/components/layout/ProtectedRoute.tsx` — auth guard component (redirect to /login if no session)
- `src/components/layout/AdminRoute.tsx` — admin guard (redirect to /dashboard if not admin)

**Key Implementation Details:**
- Generic error: "Invalid email or password" (never reveal which field)
- Deactivated account check: "Account deactivated. Contact administrator."
- On successful login: UPDATE profiles SET last_login_at = now()
- Session timeout: listen to click/keypress/scroll; reset timer on activity

---

### Task 4: Application Shell & Navigation

| Attribute | Value |
|---|---|
| **Task ID** | T-004 |
| **Requirements** | NFR-003 |
| **Complexity** | M |
| **Dependencies** | T-003 |
| **Completion Criteria** | Sidebar renders with all module links; Header shows breadcrumb + user dropdown; clicking nav items navigates to placeholder pages; sidebar collapses at 1024px; admin-only Settings hidden for staff |

**Files to Create:**
- `src/components/layout/Sidebar.tsx` — dark sidebar (gray-900), module sections, active indicator (left border + module color), collapsed/expanded states, user info at bottom
- `src/components/layout/Header.tsx` — 48px top bar, breadcrumb, user dropdown (name, role badge, logout)
- `src/components/layout/PageContainer.tsx` — page wrapper: title, action buttons slot, content area
- `src/components/ui/Breadcrumb.tsx` — breadcrumb navigation
- Modify `src/routes/__root.tsx` — integrate Sidebar + Header + PageContainer layout
- Create placeholder route files for ALL pages (empty components with page title):
  - `src/routes/_protected/dashboard.tsx`
  - `src/routes/_protected/finance/index.tsx`, `receivables.tsx`, `payables.tsx`, `payments.tsx`, `historical-debts.tsx`
  - `src/routes/_protected/b2b/pre-orders.tsx`, `purchase-orders.tsx`, `fulfillments.tsx`
  - `src/routes/_protected/b2c/printing-orders.tsx`
  - `src/routes/_protected/inventory/products.tsx`, `adjustments.tsx`
  - `src/routes/_protected/customers/index.tsx`
  - `src/routes/_protected/suppliers/index.tsx`
  - `src/routes/_protected/reports/index.tsx`
  - `src/routes/_protected/documents/index.tsx`
  - `src/routes/_protected/settings/users.tsx`

---

### Task 5: Customer & Supplier CRUD

| Attribute | Value |
|---|---|
| **Task ID** | T-005 |
| **Requirements** | FR-CS-001, FR-CS-002, FR-CS-004 |
| **Complexity** | M |
| **Dependencies** | T-004 |
| **Completion Criteria** | Can create/edit/search customers and suppliers; list paginated (20/page); deactivate (not delete); type filter for customers (B2B/B2C/Both); detail view shows contact info |

**Files to Create/Modify:**
- `src/routes/_protected/customers/index.tsx` — customer list + create/edit modal
- `src/routes/_protected/suppliers/index.tsx` — supplier list + create/edit modal
- `src/components/shared/EntitySelector.tsx` — searchable customer/supplier dropdown (reused across all modules)
- `src/hooks/use-customers.ts` — TanStack Query hooks: `useCustomers()`, `useCreateCustomer()`, `useUpdateCustomer()`
- `src/hooks/use-suppliers.ts` — same pattern for suppliers

**UI Components Used:** Table, SearchInput, Modal, Button, Input, Select, Badge, Pagination
**Key Patterns:**
- Search: `ilike` on name, contact_person, phone, email (case-insensitive)
- Create: Modal form with validation (name required, unique)
- Edit: Same modal, pre-populated
- Deactivate: ConfirmDialog → `UPDATE is_active = false` (prevent if referenced)
- Customer type: Select with B2B/B2C/Both options

---

## Sprint 2: Finance Core (Tasks 6–10) — HIGHEST PRIORITY

### Task 6: Finance — Receivables List + Detail

| Attribute | Value |
|---|---|
| **Task ID** | T-006 |
| **Requirements** | FR-FIN-001, FR-FIN-004, FR-FIN-005, FR-FIN-008 |
| **Complexity** | M |
| **Dependencies** | T-005 (needs customer data) |
| **Completion Criteria** | Receivables list shows all customer receivables from v_receivables; outstanding_balance computed; overdue items highlighted red; filter by status; pagination; detail view shows payment history |

**Files to Create/Modify:**
- `src/routes/_protected/finance/receivables.tsx` — list page + detail drawer
- `src/hooks/use-receivables.ts` — `useReceivables(filters)`, `useReceivable(id)`
- `src/components/finance/ReceivableCard.tsx` — summary card with balance
- `src/components/finance/BalanceDisplay.tsx` — amount, paid, outstanding, overdue flag

**Key Implementation:**
- Query `v_receivables` (includes outstanding_balance + is_overdue)
- Filter by status (Outstanding, Partially Paid, Fully Paid, Voided)
- Overdue rows: `bg-red-50` background, "OVERDUE" badge
- Amounts formatted with `formatPHP()`
- Detail view: receivable info + linked payments list

---

### Task 7: Finance — Payables List + Detail

| Attribute | Value |
|---|---|
| **Task ID** | T-007 |
| **Requirements** | FR-FIN-002, FR-FIN-004, FR-FIN-005, FR-FIN-009 |
| **Complexity** | M |
| **Dependencies** | T-005 (needs supplier data) |
| **Completion Criteria** | Payables list shows all supplier payables from v_payables; outstanding_balance computed; overdue highlighted; filter by status; detail view with payment history |

**Files to Create/Modify:**
- `src/routes/_protected/finance/payables.tsx` — list page + detail drawer
- `src/hooks/use-payables.ts` — `usePayables(filters)`, `usePayable(id)`

**Key Implementation:**
- Same pattern as receivables but queries `v_payables`
- Supplier name instead of customer name
- Same overdue highlighting, same badge colors

---

### Task 8: Finance — Payment Recording

| Attribute | Value |
|---|---|
| **Task ID** | T-008 |
| **Requirements** | FR-FIN-003, FR-FIN-006, FR-FIN-010 |
| **Complexity** | L |
| **Dependencies** | T-006, T-007 |
| **Completion Criteria** | Can record payment against receivable or payable; amount validation (>0, warn if > outstanding); method selection (Cash/Bank Transfer/Check); payment triggers status update; void button (admin only) with reason; payment history updates |

**Files to Create/Modify:**
- `src/routes/_protected/finance/payments.tsx` — payment recording page + history list
- `src/components/finance/PaymentForm.tsx` — form modal: payment type, entity selector, source selector, amount, date, method, reference
- `src/hooks/use-payments.ts` — `usePayments(filters)`, `useRecordPayment()`, `useVoidPayment()`

**Key Implementation:**
- PaymentForm: select receivable/payable → show outstanding balance → enter amount
- Warning if amount > outstanding: "Payment exceeds outstanding balance" + require confirmation
- Reject amount ≤ 0: "Payment amount must be greater than zero"
- On save: INSERT into payments → trigger auto-updates receivable/payable status
- Void: admin-only button, ConfirmDialog with reason textarea → UPDATE is_voided = true
- Payment history: reverse chronological, paginated (20/page), shows voided items grayed out

---

### Task 9: Finance — Dashboard

| Attribute | Value |
|---|
| **Task ID** | T-009 |
| **Requirements** | FR-FIN-008, FR-FIN-009, FR-RPT-008 |
| **Complexity** | M |
| **Dependencies** | T-006, T-007, T-008 |
| **Completion Criteria** | Dashboard shows: total receivables outstanding + overdue count, total payables outstanding + overdue count, recent transactions (last 10), low stock alerts; all data real-time via `get_dashboard_summary()` RPC |

**Files to Create/Modify:**
- `src/routes/_protected/dashboard.tsx` — main dashboard page
- `src/routes/_protected/finance/index.tsx` — finance-specific dashboard (receivables + payables summaries)
- `src/components/ui/StatCard.tsx` — stat card component (label, value, subtext)
- `src/hooks/use-dashboard.ts` — `useDashboardSummary()` (calls RPC)

**Key Implementation:**
- 4 stat cards: Total Receivables Outstanding, Overdue Receivables, Total Payables Outstanding, Overdue Payables
- Overdue counts in red text
- Recent transactions table (last 10)
- Low stock products alert section
- All from single RPC call: `get_dashboard_summary()`

---

### Task 10: Finance — Search + Payment History

| Attribute | Value |
|---|---|
| **Task ID** | T-010 |
| **Requirements** | FR-FIN-007, FR-FIN-006 |
| **Complexity** | M |
| **Dependencies** | T-008 |
| **Completion Criteria** | Search interface searches across receivables, payables, payments by keyword/date/type; results paginated and sortable; payment history per customer/supplier accessible from entity detail |

**Files to Create/Modify:**
- Add search section to `src/routes/_protected/finance/index.tsx` or create `finance/search.tsx`
- `src/hooks/use-finance-search.ts` — `useFinanceSearch(params)` (calls `get_finance_search()` RPC)

**Key Implementation:**
- SearchInput with debounce (300ms)
- Filter dropdowns: type (All/Receivable/Payable/Payment), date range
- Results table: date, type, entity name, amount, status, link to source
- Paginated (20/page), sortable by date/amount/entity
- Uses `get_finance_search()` RPC for unified search

---

## Sprint 3: B2B Module (Tasks 11–16)

### Task 11: Products / Inventory Records

| Attribute | Value |
|---|---|
| **Task ID** | T-011 |
| **Requirements** | FR-INV-001 |
| **Complexity** | S |
| **Dependencies** | T-004 |
| **Completion Criteria** | Can create/edit/search products; list with name, unit, category, active status; deactivate (not delete if referenced); used as FK in B2B/B2C forms |

**Files to Create/Modify:**
- `src/routes/_protected/inventory/products.tsx` — product list + create/edit modal
- `src/hooks/use-products.ts` — `useProducts()`, `useCreateProduct()`, `useUpdateProduct()`

---

### Task 12: B2B Pre-Orders

| Attribute | Value |
|---|---|
| **Task ID** | T-012 |
| **Requirements** | FR-B2B-001, FR-B2B-002 |
| **Complexity** | M |
| **Dependencies** | T-005, T-011 |
| **Completion Criteria** | Can create pre-order with customer + line items (product, qty, unit_price); status transitions: Draft→Submitted→Converted, Draft/Submitted→Cancelled; total auto-calculated; converted pre-order creates PO skeleton |

**Files to Create/Modify:**
- `src/routes/_protected/b2b/pre-orders.tsx` — list + detail/create page
- `src/hooks/use-pre-orders.ts` — CRUD + status transition hooks
- `src/components/b2b/PreOrderForm.tsx` — form with customer selector, date, line items (product + qty + price)

**Key Implementation:**
- Line items: dynamic add/remove rows (product selector, quantity, unit price)
- Total = SUM(qty × price) displayed at bottom
- Status buttons: Submit, Convert to PO, Cancel (context-sensitive based on current status)
- Convert to PO: create PO with same items, mark pre-order as Converted

---

### Task 13: B2B Purchase Orders

| Attribute | Value |
|---|---|
| **Task ID** | T-013 |
| **Requirements** | FR-B2B-003, FR-B2B-004 |
| **Complexity** | M |
| **Dependencies** | T-005, T-011, T-012 |
| **Completion Criteria** | Can create PO (manual or from converted pre-order); PO number unique; status transitions (Draft→Submitted→Partially/ Fully Received→Completed); PO detail shows items with ordered/received quantities |

**Files to Create/Modify:**
- `src/routes/_protected/b2b/purchase-orders.tsx` — list + detail/create page
- `src/hooks/use-purchase-orders.ts` — CRUD + status hooks
- `src/components/b2b/POForm.tsx` — form with supplier selector, PO number, date, line items
- `src/components/b2b/POStatusBadge.tsx` — status badge with PO-specific colors

---

### Task 14: B2B Receiving

| Attribute | Value |
|---|---|
| **Task ID** | T-014 |
| **Requirements** | FR-B2B-005, FR-B2B-006, FR-B2B-007, FR-B2B-008 |
| **Complexity** | L |
| **Dependencies** | T-013 |
| **Completion Criteria** | Can create receiving record against a PO; enter received qty per item; variance auto-calculated (received − ordered); variance reason required when ≠ 0; triggers auto-update PO status + inventory; PO detail shows ordered vs received side-by-side |

**Files to Create/Modify:**
- `src/components/b2b/ReceivingForm.tsx` — form: select PO, enter received qty per item, variance auto-shown, reason field
- `src/components/b2b/VarianceDisplay.tsx` — shows shortage (red), excess (blue), exact (green)
- `src/hooks/use-receiving.ts` — `useCreateReceiving()` (inserts receiving_record + receiving_items)
- Update `src/routes/_protected/b2b/purchase-orders.tsx` — add "Record Receiving" button + receiving history on PO detail

**Key Implementation:**
- For each PO item: show ordered_qty, input received_qty, auto-calc variance
- If variance ≠ 0: show variance_reason field as required
- On save: INSERT receiving_record + receiving_items → triggers fire:
  1. Update b2b_po_items.received_qty
  2. Create inventory_movements (received)
  3. Update PO status (Partially/Fully Received)
  4. If Fully Received → create payable

---

### Task 15: B2B Fulfillments

| Attribute | Value |
|---|---|
| **Task ID** | T-015 |
| **Requirements** | FR-B2B-009 |
| **Complexity** | L |
| **Dependencies** | T-005, T-011 |
| **Completion Criteria** | Can create fulfillment with customer + line items; status transitions: Pending→In Progress→Completed; on Completed: trigger creates receivable + inventory movements (released); can cancel (void receivable if unpaid) |

**Files to Create/Modify:**
- `src/routes/_protected/b2b/fulfillments.tsx` — list + detail/create page
- `src/hooks/use-fulfillments.ts` — CRUD + status hooks
- `src/components/b2b/FulfillmentForm.tsx` — form with customer, date, line items

**Key Implementation:**
- On status change to "Completed": trigger auto-creates receivable + inventory movements
- Cancel logic: if receivable exists and is Outstanding/Partially Paid → void it; if payments exist → block cancellation

---

### Task 16: B2B Transaction History

| Attribute | Value |
|---|---|
| **Task ID** | T-016 |
| **Requirements** | FR-B2B-010 |
| **Complexity** | S |
| **Dependencies** | T-012, T-015 |
| **Completion Criteria** | Customer detail page shows B2B transaction history tab: pre-orders, fulfillments, receivables, payments in reverse chronological order; paginated (20/page) |

**Files to Create/Modify:**
- Update `src/routes/_protected/customers/index.tsx` — add tabs: Info | B2B Transactions | B2C Transactions | Payments | Debts
- `src/hooks/use-customer-transactions.ts` — aggregated query across B2B + Finance tables

---

## Sprint 4: B2C Module (Tasks 17–19)

### Task 17: B2C Printing Orders

| Attribute | Value |
|---|---|
| **Task ID** | T-017 |
| **Requirements** | FR-B2C-001, FR-B2C-002, FR-B2C-003 |
| **Complexity** | M |
| **Dependencies** | T-005 |
| **Completion Criteria** | Can create printing order with customer + line items (free-text description, qty, price); status transitions: Pending→In Production→Completed→Released→Paid; production notes editable while In Production; status timestamps auto-set by trigger |

**Files to Create/Modify:**
- `src/routes/_protected/b2c/printing-orders.tsx` — list + detail/create page
- `src/hooks/use-printing-orders.ts` — CRUD + status hooks
- `src/components/b2c/PrintingOrderForm.tsx` — form with customer, date, line items (description, qty, price), notes
- `src/components/b2c/ProductionNotes.tsx` — editable notes area (visible when In Production)

**Key Implementation:**
- Line items: free-text description (no product FK), qty, unit_price, auto-calc total
- Status buttons context-sensitive
- On "Released": trigger creates receivable
- Production notes: textarea, editable only while In Production, max 1000 chars
- Status timestamps auto-set by trigger (pending_at, in_production_at, etc.)

---

### Task 18: B2C Payment Recording

| Attribute | Value |
|---|---|
| **Task ID** | T-018 |
| **Requirements** | FR-B2C-004 |
| **Complexity** | S |
| **Dependencies** | T-008, T-017 |
| **Completion Criteria** | Payment for B2C order recorded via Finance payment flow; full payment → order status changes to "Paid"; partial payment → receivable updates; same PaymentForm component reused |

**Files to Create/Modify:**
- Update `src/routes/_protected/b2c/printing-orders.tsx` — add "Record Payment" button on Released orders
- Reuse `src/components/finance/PaymentForm.tsx` — pre-fill with order's receivable info

**Key Implementation:**
- "Record Payment" button visible only on Released orders
- Opens PaymentForm pre-filled with receivable source_id and outstanding balance
- On save: same flow as T-008 (insert payment → trigger updates status)
- If full payment: B2C order auto-transitions to "Paid" (need trigger or app logic)

---

### Task 19: B2C Transaction History

| Attribute | Value |
|---|---|
| **Task ID** | T-019 |
| **Requirements** | FR-B2C-005 |
| **Complexity** | S |
| **Dependencies** | T-017 |
| **Completion Criteria** | Customer detail page shows B2C transaction history tab: printing orders + payments; paginated (20/page) |

**Files to Create/Modify:**
- Update customer detail page tabs (from T-016) — add B2C transactions tab
- `src/hooks/use-customer-transactions.ts` — extend to include B2C data

---

## Sprint 5: Historical Debts + Inventory (Tasks 20–22)

### Task 20: Historical Debts

| Attribute | Value |
|---|---|
| **Task ID** | T-020 |
| **Requirements** | FR-DEBT-001, FR-DEBT-002, FR-DEBT-003, FR-DEBT-004 |
| **Complexity** | M |
| **Dependencies** | T-005 |
| **Completion Criteria** | Can create customer/supplier debt records; verification status management (Pending→Verified→Disputed→Adjusted→Written Off); adjustment requires new amount + reason; write-off requires reason; status changes logged; list with filters (entity type, status, date range); paginated |

**Files to Create/Modify:**
- `src/routes/_protected/finance/historical-debts.tsx` — list + create/edit modal
- `src/hooks/use-historical-debts.ts` — CRUD + status transition hooks
- `src/components/finance/DebtForm.tsx` — form: entity type, entity selector, amount, date (past only), source, description
- `src/components/finance/DebtStatusForm.tsx` — status transition form: new status, reason, adjusted_amount (if Adjusted)

**Key Implementation:**
- Debt creation: select customer/supplier, enter amount, date (no future dates), source, description
- Status transitions: buttons based on valid transitions (see state machine Section 2.6)
- Adjusted: require adjusted_amount + adjustment_reason
- Written Off: require write_off_reason
- Status change trigger auto-logs to historical_debt_status_logs
- Filter by entity type, verification status, date range

---

### Task 21: Inventory Management

| Attribute | Value |
|---|---|
| **Task ID** | T-021 |
| **Requirements** | FR-INV-002, FR-INV-003, FR-INV-004, FR-INV-005 |
| **Complexity** | M |
| **Dependencies** | T-011, T-014, T-015 |
| **Completion Criteria** | Inventory summary view shows current stock per product (received − released + adjustments); manual adjustments with reason; stock auto-updated by receiving/fulfillment triggers; negative stock warning |

**Files to Create/Modify:**
- `src/routes/_protected/inventory/adjustments.tsx` — adjustment form + history
- `src/routes/_protected/inventory/index.tsx` — inventory summary page (redirect or merge with products)
- `src/hooks/use-inventory.ts` — `useInventorySummary()`, `useCreateAdjustment()`, `useInventoryMovements(productId)`

**Key Implementation:**
- Inventory summary: query `v_inventory_summary` — shows total_received, total_released, total_adjustments, current_quantity
- Manual adjustment: select product, enter qty (positive/negative), reason (required) → INSERT inventory_movement
- Negative stock warning: if adjustment would make current_qty < 0 → show warning + require confirmation
- Movement history: query inventory_movements by product, paginated, filterable by type/date

---

### Task 22: Inventory Summary + History View

| Attribute | Value |
|---|---|
| **Task ID** | T-022 |
| **Requirements** | FR-INV-006, FR-RPT-002 |
| **Complexity** | S |
| **Dependencies** | T-021 |
| **Completion Criteria** | Product detail shows movement history (received/released/adjustment); filterable by movement type and date; paginated; inventory report shows all products with stock levels |

**Files to Create/Modify:**
- Update `src/routes/_protected/inventory/products.tsx` — add detail view with movement history tab
- Inventory report integrated into reports page (T-024)

---

## Sprint 6: Reports + Documents (Tasks 23–26)

### Task 23: Reports — Sales, Receivables, Payables

| Attribute | Value |
|---|---|
| **Task ID** | T-023 |
| **Requirements** | FR-RPT-001, FR-RPT-003, FR-RPT-004 |
| **Complexity** | M |
| **Dependencies** | T-009, T-015, T-017 |
| **Completion Criteria** | Sales report: B2B + B2C totals by date range, top 10 customers; Receivables report: per-customer outstanding balances sorted by amount; Payables report: per-supplier outstanding balances; all exportable as CSV |

**Files to Create/Modify:**
- `src/routes/_protected/reports/index.tsx` — reports hub with tabs/sections for each report type
- `src/components/reports/SalesReport.tsx` — date range picker, B2B/B2C breakdown, top customers
- `src/components/reports/ReceivablesReport.tsx` — per-customer outstanding
- `src/components/reports/PayablesReport.tsx` — per-supplier outstanding
- `src/hooks/use-reports.ts` — report query hooks

---

### Task 24: Reports — Inventory, Payments, Transaction Reports

| Attribute | Value |
|---|---|
| **Task ID** | T-024 |
| **Requirements** | FR-RPT-002, FR-RPT-005, FR-RPT-006, FR-RPT-007 |
| **Complexity** | M |
| **Dependencies** | T-021, T-023 |
| **Completion Criteria** | Inventory report: current stock levels, out-of-stock highlighted; Payments report: received vs paid by date range, filterable by method; Customer/Supplier transaction reports: per-entity detail with running balance |

**Files to Create/Modify:**
- `src/components/reports/InventoryReport.tsx`
- `src/components/reports/PaymentsReport.tsx`
- `src/components/reports/CustomerTransactionReport.tsx`
- `src/components/reports/SupplierTransactionReport.tsx`
- Update `src/routes/_protected/reports/index.tsx`

---

### Task 25: Documents — Unified Transaction View

| Attribute | Value |
|---|---|
| **Task ID** | T-025 |
| **Requirements** | FR-DOC-001, FR-DOC-002 |
| **Complexity** | M |
| **Dependencies** | T-012, T-013, T-014, T-015, T-017 |
| **Completion Criteria** | Unified documents page shows all document types (Pre-Order, PO, Receiving, Fulfillment, Printing Order, Payment/Receipt, Receivable, Historical Debt, Adjustment); filterable by type/date/entity; searchable by doc number/entity; print view opens in new window (A4 layout) |

**Files to Create/Modify:**
- `src/routes/_protected/documents/index.tsx` — unified document list
- `src/components/shared/DocumentPrintView.tsx` — print-optimized layout (A4, clean)
- `src/hooks/use-documents.ts` — unified document query (uses `get_unified_documents()` RPC or UNION query)
- `src/lib/utils/print.ts` — open print window helper

**Key Implementation:**
- Query all document types via RPC or multiple queries merged client-side
- Filter by document type, date range, entity name
- Search by document number, entity name
- Print: open new window with print-optimized HTML, trigger window.print()

---

### Task 26: Documents — Export (PDF/CSV) + Statements

| Attribute | Value |
|---|---|
| **Task ID** | T-026 |
| **Requirements** | FR-DOC-003, FR-DOC-004 |
| **Complexity** | L |
| **Dependencies** | T-025 |
| **Completion Criteria** | Can export any document as PDF; can export list views as CSV; can generate customer/supplier statements with date range, running balance, printable |

**Files to Create/Modify:**
- `src/lib/utils/export-pdf.ts` — jsPDF + html2canvas helper
- `src/lib/utils/export-csv.ts` — papaparse CSV export helper
- `src/components/reports/StatementGenerator.tsx` — date range picker + statement preview
- Add export buttons to all list pages and report pages

---

## Sprint 7: Polish + Deploy (Tasks 27–30)

### Task 27: User Management (Admin)

| Attribute | Value |
|---|---|
| **Task ID** | T-027 |
| **Requirements** | FR-AUTH-003 |
| **Complexity** | M |
| **Dependencies** | T-003, T-004 |
| **Completion Criteria** | Admin can view all users (email, name, role, status, last login); create user (email, name, role → Edge Function); edit user (name, role); deactivate user (immediate session termination); Settings page hidden for staff |

**Files to Create/Modify:**
- `src/routes/_protected/settings/users.tsx` — user list + create/edit/deactivate
- `src/hooks/use-users.ts` — `useUsers()`, `useCreateUser()`, `useUpdateUser()`, `useDeactivateUser()`
- `supabase/functions/create-user/index.ts` — Edge Function (admin check → createUser with temp password)
- `src/components/settings/UserForm.tsx` — create/edit form
- `src/components/settings/DeactivateDialog.tsx` — confirm dialog

**Key Implementation:**
- Create user: call Edge Function `create-user` with {email, full_name, role}
- Edit user: PATCH profiles (name, role)
- Deactivate: UPDATE profiles SET is_active = false → user's session invalidated
- Admin-only route: AdminRoute guard

---

### Task 28: Password Reset Flow

| Attribute | Value |
|---|---|
| **Task ID** | T-028 |
| **Requirements** | FR-AUTH-004 |
| **Complexity** | S |
| **Dependencies** | T-003 |
| **Completion Criteria** | "Forgot Password" on login page → enter email → reset link sent; clicking link → new password form; password policy enforced (8+ chars, upper, lower, number); link expires after 1 hour |

**Files to Create/Modify:**
- Update `src/routes/_auth/forgot-password.tsx` — request form + success message
- `src/routes/_auth/reset-password.tsx` — new password form (after clicking email link)
- `src/lib/utils/validators.ts` — password Zod schema (8+ chars, upper, lower, number)

**Key Implementation:**
- Step 1: `supabase.auth.resetPasswordForEmail(email, { redirectTo })`
- Step 2: Detect recovery token in URL → show password form → `supabase.auth.updateUser({ password })`
- Password policy: Zod validation + Supabase Auth config

---

### Task 29: Final UI Polish

| Attribute | Value |
|---|---|
| **Task ID** | T-029 |
| **Requirements** | NFR-003 |
| **Complexity** | M |
| **Dependencies** | T-005 through T-028 (all features complete) |
| **Completion Criteria** | All pages have empty states; all loading states use skeleton/shimmer; all error states show user-friendly messages; form validation is inline and real-time; responsive at 1024px+; consistent status badge colors across all modules |

**Sub-tasks:**
- [ ] Empty states for all list pages (icon + message + "Create New" button)
- [ ] Loading states: skeleton screens for tables, spinners for buttons
- [ ] Error handling: toast notifications for all mutations, inline errors for forms
- [ ] Form validation: real-time on blur, required field indicators
- [ ] Responsive check: test at 1024px, 1280px, 1920px
- [ ] Status badge consistency: verify all modules use correct colors from DESIGN.md
- [ ] Currency formatting: all amounts use `formatPHP()` (₱ with 2 decimals)
- [ ] Keyboard navigation: tab order, focus states, Enter to submit forms
- [ ] ConfirmDialog on all destructive actions (void, deactivate, cancel)
- [ ] Breadcrumb accuracy on all pages

---

### Task 30: Testing + Deployment Preparation

| Attribute | Value |
|---|---|
| **Task ID** | T-030 |
| **Requirements** | NFR-001 through NFR-007 |
| **Complexity** | M |
| **Dependencies** | T-029 |
| **Completion Criteria** | Core workflows tested (create order → receive → fulfill → payment); RLS audit passed (all tables have policies); balance calculations verified for 10 test scenarios; production build succeeds; Cloudflare Pages configured; env vars set |

**Sub-tasks:**
- [ ] **RLS Audit (SR-01):** Query `pg_policies` — verify every table has SELECT/INSERT/UPDATE policies; verify NO DELETE policies; test with admin + staff accounts
- [ ] **Trigger Tests (TR-03):** Test all 16 triggers with known scenarios (fulfillment→receivable, receiving→inventory, payment→status)
- [ ] **Balance Verification (BR-03):** 10 test scenarios comparing system calculations vs manual
- [ ] **Security Scan:** Verify no `service_role` key in built bundle (`grep -r "service_role" dist/`)
- [ ] **Performance:** Verify page loads ≤ 3s, search ≤ 2s, balance calc ≤ 500ms
- [ ] **Build:** `npm run build` succeeds with no errors
- [ ] **Deploy Config:** Cloudflare Pages project configured with env vars
- [ ] **Browser Test:** Test on Chrome, Edge, Firefox (latest 2 versions)
- [ ] **Concurrent Access:** Test two users recording payments on same receivable
- [ ] **Backup:** Export database schema + seed data

---

## Requirements Traceability Matrix

| Task | Requirements Covered | Priority |
|---|---|---|
| T-001 | NFR-001, NFR-002, NFR-006 | P0 |
| T-002 | All FR-* (data layer), NFR-004 | P0 |
| T-003 | FR-AUTH-001, FR-AUTH-002 | P0 |
| T-004 | NFR-003 | P0 |
| T-005 | FR-CS-001, FR-CS-002, FR-CS-004 | P0 |
| T-006 | FR-FIN-001, FR-FIN-004, FR-FIN-005, FR-FIN-008 | P0 |
| T-007 | FR-FIN-002, FR-FIN-004, FR-FIN-005, FR-FIN-009 | P0 |
| T-008 | FR-FIN-003, FR-FIN-006, FR-FIN-010 | P0 |
| T-009 | FR-FIN-008, FR-FIN-009, FR-RPT-008 | P0/P2 |
| T-010 | FR-FIN-007, FR-FIN-006 | P0 |
| T-011 | FR-INV-001 | P1 |
| T-012 | FR-B2B-001, FR-B2B-002 | P1 |
| T-013 | FR-B2B-003, FR-B2B-004 | P1 |
| T-014 | FR-B2B-005, FR-B2B-006, FR-B2B-007, FR-B2B-008 | P1 |
| T-015 | FR-B2B-009 | P1 |
| T-016 | FR-B2B-010 | P1 |
| T-017 | FR-B2C-001, FR-B2C-002, FR-B2C-003 | P1 |
| T-018 | FR-B2C-004 | P1 |
| T-019 | FR-B2C-005 | P1 |
| T-020 | FR-DEBT-001, FR-DEBT-002, FR-DEBT-003, FR-DEBT-004 | P1/P2 |
| T-021 | FR-INV-002, FR-INV-003, FR-INV-004, FR-INV-005 | P1 |
| T-022 | FR-INV-006, FR-RPT-002 | P2 |
| T-023 | FR-RPT-001, FR-RPT-003, FR-RPT-004 | P2/P1 |
| T-024 | FR-RPT-002, FR-RPT-005, FR-RPT-006, FR-RPT-007 | P2 |
| T-025 | FR-DOC-001, FR-DOC-002 | P1 |
| T-026 | FR-DOC-003, FR-DOC-004 | P2 |
| T-027 | FR-AUTH-003 | P1 |
| T-028 | FR-AUTH-004 | P1 |
| T-029 | NFR-003 | — |
| T-030 | NFR-001 through NFR-007 | — |

**All 55 requirements covered (13 P0 + 32 P1 + 10 P2).**

---

## Dependency Graph (DAG)

```
T-001 (Setup)
  └──→ T-002 (Database)
         └──→ T-003 (Auth)
                └──→ T-004 (Shell)
                       ├──→ T-005 (Customers/Suppliers)
                       │      ├──→ T-006 (Receivables)
                       │      │      ├──→ T-008 (Payments)
                       │      │      │      ├──→ T-009 (Dashboard)
                       │      │      │      └──→ T-010 (Search)
                       │      │      └──→ T-007 (Payables) ──→ T-009
                       │      ├──→ T-011 (Products)
                       │      │      ├──→ T-012 (Pre-Orders)
                       │      │      │      └──→ T-013 (Purchase Orders)
                       │      │      │             └──→ T-014 (Receiving)
                       │      │      │                    └──→ T-021 (Inventory) ──→ T-022
                       │      │      ├──→ T-015 (Fulfillments) ──→ T-016
                       │      │      └──→ T-017 (B2C Orders)
                       │      │             ├──→ T-018 (B2C Payment)
                       │      │             └──→ T-019 (B2C History)
                       │      ├──→ T-020 (Historical Debts)
                       │      └──→ T-025 (Documents) ──→ T-026 (Export)
                       │             └──→ T-023 (Reports) ──→ T-024
                       ├──→ T-027 (User Mgmt)
                       └──→ T-028 (Password Reset)

T-029 (UI Polish) ← depends on ALL feature tasks
T-030 (Testing) ← depends on T-029
```

---

## Milestone Plan

| Milestone | Tasks | Gate Criteria | Target |
|---|---|---|---|
| **M1: Foundation** | T-001 to T-005 | App runs; auth works; can create customers/suppliers | Sprint 1 |
| **M2: Finance MVP** | T-006 to T-010 | Can view receivables/payables, record payments, search; dashboard works | Sprint 2 |
| **M3: B2B Complete** | T-011 to T-016 | Full B2B workflow: pre-order → PO → receiving → fulfillment → payment | Sprint 3 |
| **M4: B2C Complete** | T-017 to T-019 | Full B2C workflow: order → production → release → payment | Sprint 4 |
| **M5: Data Complete** | T-020 to T-022 | Historical debts + inventory management working | Sprint 5 |
| **M6: Reports + Docs** | T-023 to T-026 | All reports generate; documents viewable/printable/exportable | Sprint 6 |
| **M7: Shipped** | T-027 to T-030 | User management, password reset, UI polished, deployed to Cloudflare | Sprint 7 |

---

## Parallelization Strategy

| Sprint | Sequential Core | Can Parallelize |
|---|---|---|
| Sprint 1 | T-001 → T-002 → T-003 → T-004 → T-005 | None (strict chain) |
| Sprint 2 | T-006 + T-007 (parallel) → T-008 → T-009 + T-010 (parallel) | T-006 ‖ T-007; T-009 ‖ T-010 |
| Sprint 3 | T-011 → T-012 + T-013 (parallel after T-011) → T-014 → T-015 → T-016 | T-012 ‖ T-013; T-015 ‖ T-011 (products already done) |
| Sprint 4 | T-017 → T-018 + T-019 (parallel) | T-018 ‖ T-019 |
| Sprint 5 | T-020 + T-021 (parallel) → T-022 | T-020 ‖ T-021 |
| Sprint 6 | T-023 + T-025 (parallel) → T-024 + T-026 (parallel) | T-023 ‖ T-025; T-024 ‖ T-026 |
| Sprint 7 | T-027 + T-028 (parallel) → T-029 → T-030 | T-027 ‖ T-028 |

---

## Risk-Ordered Task Notes

| Risk | Mitigation in Plan |
|---|---|
| SR-01 (RLS misconfiguration) | T-002 includes RLS audit; T-030 includes pre-deployment RLS verification |
| TR-03 (Trigger complexity) | T-002 creates all triggers; T-030 includes trigger test scenarios |
| BR-03 (Calculation accuracy) | T-006/T-007 use DB views for balance; T-030 includes 10-scenario verification |
| SR-02 (API key exposure) | T-030 includes bundle scan for service_role key |
