# Architecture Design — Inventory Management System

> **Version:** 1.0 | **Date:** 2026-08-26 | **Status:** Approved for Build
> **Architecture Pattern:** Serverless SPA + BaaS (Backend-as-a-Service)

---

## 1. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Browser)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │            React + TypeScript SPA                         │  │
│  │  ┌─────────┐  ┌──────────────┐  ┌─────────────────────┐  │  │
│  │  │  React   │  │  TanStack    │  │  UI Component       │  │  │
│  │  │  Router  │  │  Query       │  │  Library            │  │  │
│  │  │          │  │  (Server     │  │  (Tailwind CSS)     │  │  │
│  │  │          │  │   State)     │  │                     │  │  │
│  │  └─────────┘  └──────────────┘  └─────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS (REST + RPC)
                           │ Bearer Token (JWT)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SUPABASE PLATFORM (BaaS)                       │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Supabase    │  │  PostgreSQL  │  │  Edge Functions       │  │
│  │  Auth        │  │  Database    │  │  (Deno)               │  │
│  │              │  │              │  │                       │  │
│  │  • Email/PW  │  │  • 20 Tables │  │  • create-user        │  │
│  │  • Sessions  │  │  • 5 Views   │  │  • export-pdf         │  │
│  │  • JWT       │  │  • 16 Trig.  │  │    (optional)         │  │
│  │  • MFA       │  │  • RLS       │  │                       │  │
│  └──────────────┘  │  • Functions │  └───────────────────────┘  │
│                     │  • RPC      │                               │
│  ┌──────────────┐  └──────────────┘                               │
│  │  Auto-       │                                                  │
│  │  generated   │  ┌───────────────────────────────────────────┐  │
│  │  REST API    │  │  Row Level Security (RLS)                  │  │
│  │  (PostgREST) │  │  • Both roles access all business data     │  │
│  │              │  │  • Only admin can manage users             │  │
│  │  /rest/v1/*  │  │  • Only admin can void payments            │  │
│  └──────────────┘  │  • No DELETE on any business table         │  │
│                     └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               DEPLOYMENT LAYER                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           Cloudflare Pages (CDN)                           │  │
│  │  • Static asset hosting (React build output)               │  │
│  │  • Global CDN distribution                                 │  │
│  │  • Automatic Git-based deployments                         │  │
│  │  • Unlimited bandwidth (free tier)                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

### 2.1 Project Structure

```
src/
├── main.tsx                          # Entry point, providers setup
├── App.tsx                           # Root component with router
├── routes/                           # File-based route definitions
│   ├── __root.tsx                    # Layout wrapper (sidebar + header)
│   ├── _auth/
│   │   ├── login.tsx                 # Login page
│   │   └── forgot-password.tsx       # Password reset
│   └── _protected/                   # Auth-guarded routes
│       ├── dashboard.tsx             # Main dashboard
│       ├── finance/
│       │   ├── index.tsx             # Finance dashboard (summaries)
│       │   ├── receivables.tsx       # Receivables list + detail
│       │   ├── payables.tsx          # Payables list + detail
│       │   ├── payments.tsx          # Payment recording + history
│       │   └── historical-debts.tsx  # Historical debts management
│       ├── b2b/
│       │   ├── pre-orders.tsx        # Pre-orders list + CRUD
│       │   ├── purchase-orders.tsx   # POs list + CRUD + receiving
│       │   └── fulfillments.tsx      # Fulfillments list + CRUD
│       ├── b2c/
│       │   └── printing-orders.tsx   # Printing orders list + CRUD
│       ├── inventory/
│       │   ├── products.tsx          # Product catalog
│       │   └── adjustments.tsx       # Inventory adjustments
│       ├── customers/
│       │   └── index.tsx             # Customer list + detail
│       ├── suppliers/
│       │   └── index.tsx             # Supplier list + detail
│       ├── reports/
│       │   └── index.tsx             # Reports hub (all report types)
│       ├── documents/
│       │   └── index.tsx             # Unified document view
│       └── settings/
│           └── users.tsx             # User management (admin only)
├── components/
│   ├── ui/                           # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx                 # Sortable, paginated table
│   │   ├── Badge.tsx                 # Status badges
│   │   ├── Pagination.tsx
│   │   ├── SearchInput.tsx
│   │   ├── DateRangePicker.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── AmountDisplay.tsx         # PHP currency formatter
│   │   └── LoadingSpinner.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx               # Navigation sidebar
│   │   ├── Header.tsx                # Top bar with user info
│   │   └── PageContainer.tsx         # Standard page wrapper
│   ├── finance/
│   │   ├── PaymentForm.tsx           # Payment recording form
│   │   ├── ReceivableCard.tsx        # Receivable summary card
│   │   └── BalanceDisplay.tsx        # Computed balance display
│   ├── b2b/
│   │   ├── ReceivingForm.tsx         # Receiving record form
│   │   ├── VarianceDisplay.tsx       # Variance calculation display
│   │   └── POStatusBadge.tsx         # PO status badge
│   └── shared/
│       ├── EntitySelector.tsx        # Customer/supplier search-select
│       ├── StatusBadge.tsx           # Generic status badge
│       └── DocumentPrintView.tsx     # Print-optimized layout
├── hooks/
│   ├── use-auth.ts                   # Supabase auth state hook
│   ├── use-session-timeout.ts        # 30-min inactivity timeout
│   ├── use-role.ts                   # Role checking (admin/staff)
│   └── use-pagination.ts            # Pagination state helper
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client
│   │   └── types.ts                  # Generated DB types (supabase gen types)
│   ├── utils/
│   │   ├── currency.ts              # formatPHP(), parsePHP()
│   │   ├── dates.ts                 # formatDate(), isOverdue()
│   │   └── validators.ts            # Form validation helpers
│   └── constants.ts                  # Status enums, config values
├── providers/
│   ├── auth-provider.tsx             # Auth context + session management
│   └── query-provider.tsx            # TanStack Query client config
└── types/
    └── index.ts                      # App-level type definitions
```

### 2.2 Routing Strategy

- **React Router v7** with nested routes
- Route groups: `_auth/` (public) and `_protected/` (auth-guarded)
- Layout route `__root.tsx` provides sidebar + header shell
- Protected routes check `auth.session()` on mount; redirect to `/login` if unauthenticated
- Admin-only routes (`/settings/users`) check `role === 'admin'`; redirect to `/dashboard` if unauthorized

### 2.3 State Management

| State Type | Solution | Rationale |
|---|---|---|
| Server state (DB data) | **TanStack Query v5** | Caching, background refetch, optimistic updates, pagination |
| Auth state | **React Context** (AuthProvider) | Lightweight, global access to user/session |
| Form state | **React Hook Form + Zod** | Validation, controlled inputs, error messages |
| UI state (modals, tabs) | **useState/useReducer** | Local, ephemeral, no need for global store |

**TanStack Query Configuration:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30s before refetch
      gcTime: 5 * 60_000,       // 5min garbage collection
      retry: 1,                  // 1 retry on failure
      refetchOnWindowFocus: true,
    },
    mutations: {
      onSettled: () => queryClient.invalidateQueries(/* relevant key */),
    },
  },
});
```

### 2.4 Data Fetching Pattern

```typescript
// Example: Fetch receivables list
function useReceivables(filters: ReceivableFilters) {
  return useQuery({
    queryKey: ['receivables', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_receivables')
        .select('*, customer_name')
        .eq('status', filters.status)
        .gte('due_date', filters.fromDate)
        .lte('due_date', filters.toDate)
        .order('due_date', { ascending: false })
        .range(filters.page * 20, (filters.page + 1) * 20 - 1);
      if (error) throw error;
      return data;
    },
  });
}

// Example: Record payment with optimistic update
function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payment: InsertPayment) => {
      const { data, error } = await supabase
        .from('payments').insert(payment).select().single();
      if (error) throw error;
      return data;
    },
    onMutate: async (newPayment) => {
      // Optimistic update: cancel related queries
      await queryClient.cancelQueries({ queryKey: ['receivables'] });
      await queryClient.cancelQueries({ queryKey: ['payments'] });
      // Snapshot previous data
      const previous = queryClient.getQueryData(['receivables']);
      // Optimistically update UI (add payment, update balance display)
      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['receivables'], context?.previous);
    },
    onSettled: () => {
      // Always refetch after mutation to sync with server
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
```

### 2.5 Component Hierarchy

```
App
├── AuthProvider (context)
│   └── QueryClientProvider (TanStack Query)
│       └── RouterProvider (React Router)
│           ├── PublicLayout
│           │   ├── LoginPage
│           │   └── ForgotPasswordPage
│           └── ProtectedLayout
│               ├── Sidebar (navigation)
│               ├── Header (user info, logout)
│               └── PageContainer (content area)
│                   ├── Dashboard
│                   ├── FinancePages
│                   │   ├── FinanceDashboard (summaries)
│                   │   ├── ReceivablesList → ReceivableDetail
│                   │   ├── PayablesList → PayableDetail
│                   │   ├── PaymentsList → PaymentForm (Modal)
│                   │   └── HistoricalDebtsList
│                   ├── B2BPages
│                   │   ├── PreOrdersList → PreOrderDetail
│                   │   ├── PurchaseOrdersList → PODetail → ReceivingForm
│                   │   └── FulfillmentsList → FulfillmentDetail
│                   ├── B2CPages
│                   │   └── PrintingOrdersList → OrderDetail
│                   ├── InventoryPages
│                   │   ├── ProductsList
│                   │   └── AdjustmentsList
│                   ├── EntityPages
│                   │   ├── CustomersList → CustomerDetail
│                   │   └── SuppliersList → SupplierDetail
│                   ├── ReportsPage
│                   ├── DocumentsPage
│                   └── SettingsPages
│                       └── UserManagement (admin only)
```

---

## 3. Backend Architecture (Supabase Services)

### 3.1 Service Map

| Supabase Service | Usage | Configuration |
|---|---|---|
| **Auth** | Email/password login, session management, user creation | 30-min session timeout, password policy (8+ chars, upper/lower/number) |
| **PostgreSQL** | All data storage, business logic via triggers/functions | 20 tables, 5 views, 16 triggers, NUMERIC(15,2) for money |
| **Row Level Security** | Authorization for all tables | Both roles access business data; admin-only for user mgmt + voiding |
| **Auto-generated REST API** | CRUD operations from client | PostgREST endpoints for all tables + views |
| **Edge Functions** | Admin user creation (requires service_role key) | 1-2 functions (see Section 3.2) |

### 3.2 Edge Functions

Only **1 required** Edge Function (minimizes server-side complexity):

#### `create-user` (Required)
- **Purpose:** Admin creates a new user account
- **Why Edge Function:** Requires `service_role` key to call Supabase Auth Admin API (`supabase.auth.admin.createUser()`)
- **Input:** `{ email, full_name, role }`
- **Process:**
  1. Verify caller is admin (check profile role)
  2. Call `supabase.auth.admin.createUser()` with email + password setup
  3. Profile auto-created via DB trigger
- **Output:** `{ success: true, user_id: uuid }`

#### `export-pdf` (Optional — can be client-side)
- **Purpose:** Generate PDF documents for printing/export
- **Alternative:** Client-side PDF generation using `jspdf` or `@react-pdf/renderer`
- **Decision:** Start with client-side PDF generation. Move to Edge Function only if performance issues arise with large documents.

### 3.3 PostgreSQL Functions (RPC)

Complex queries exposed as RPC functions (called via `supabase.rpc()`):

| Function | Purpose | Called By |
|---|---|---|
| `get_dashboard_summary()` | Aggregated metrics for dashboard | Dashboard page |
| `get_finance_search(search_term, filters)` | Unified search across receivables, payables, payments | Finance search |
| `get_customer_statement(customer_id, from_date, to_date)` | Customer statement with running balance | Customer detail, Reports |
| `get_supplier_statement(supplier_id, from_date, to_date)` | Supplier statement with running balance | Supplier detail, Reports |

### 3.4 Data Flow Diagrams

#### 3.4.1 Payment Recording Flow

```
User fills PaymentForm
        │
        ▼
┌─────────────────────┐
│ TanStack Query      │
│ useRecordPayment()  │
│ mutation            │
└─────────┬───────────┘
          │ 1. INSERT into payments table
          ▼
┌─────────────────────┐
│ Supabase REST API   │
│ POST /rest/v1/      │
│ payments            │
└─────────┬───────────┘
          │ 2. Trigger fires: trg_payment_inserted
          ▼
┌─────────────────────────────────┐
│ update_source_status_on_payment()│
│                                  │
│ • SUM(all non-voided payments)  │
│ • IF total >= amount → 'Fully   │
│   Paid'                         │
│ • IF total < amount → 'Partially│
│   Paid'                         │
│ • UPDATE receivables/payables   │
└─────────┬───────────────────────┘
          │ 3. Mutation completes
          ▼
┌─────────────────────────────────┐
│ TanStack Query onSettled        │
│                                  │
│ • invalidateQueries('receivables')│
│ • invalidateQueries('payments') │
│ • invalidateQueries('dashboard') │
│                                  │
│ → Automatic refetch → UI update │
└─────────────────────────────────┘
```

#### 3.4.2 Balance Calculation Flow

```
Any component needs balance for receivable_id = X
        │
        ▼
┌─────────────────────────────────┐
│ useQuery('receivable', X)       │
│                                  │
│ SELECT * FROM v_receivables     │
│ WHERE id = X                    │
└─────────┬───────────────────────┘
          │ View computes:
          ▼
┌─────────────────────────────────┐
│ v_receivables view              │
│                                  │
│ outstanding_balance =            │
│   receivables.amount             │
│   - COALESCE(                    │
│       SUM(payments.amount)       │
│       WHERE source_id = X        │
│       AND is_voided = false      │
│     , 0)                         │
│                                  │
│ is_overdue =                     │
│   status IN ('Outstanding',      │
│   'Partially Paid')              │
│   AND due_date < CURRENT_DATE    │
└─────────┬───────────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│ UI displays:                    │
│ "Balance: ₱30,000.00"          │
│ Badge: "OVERDUE" (if applicable)│
└─────────────────────────────────┘
```

#### 3.4.3 Receivable Auto-Creation Flow (B2B Fulfillment Completed)

```
User changes fulfillment status to "Completed"
        │
        ▼
┌─────────────────────────────────┐
│ PATCH /rest/v1/b2b_fulfillments │
│ ?id=eq.X                        │
│ Body: { status: 'Completed' }   │
└─────────┬───────────────────────┘
          │ Two triggers fire:
          │
          ├──────────────────────────────────────┐
          ▼                                      ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│ trg_fulfillment_         │    │ trg_fulfillment_creates_ │
│ completed                │    │ inventory                │
│                          │    │                          │
│ • SUM(fulfillment_items) │    │ • FOR EACH item:         │
│ • INSERT receivable      │    │   INSERT inventory_      │
│   (customer_id, amount,  │    │   movements (released)   │
│    due_date, Outstanding)│    │                          │
└──────────────────────────┘    └──────────────────────────┘
          │                                      │
          ▼                                      ▼
┌─────────────────────────────────────────────────────────┐
│ TanStack Query invalidates:                              │
│ • fulfillments, receivables, inventory → auto-refetch   │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Module Decomposition

### 4.1 Module Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                        AUTH MODULE                           │
│  • Login/logout, session management                         │
│  • User CRUD (admin only)                                   │
│  • Password reset                                           │
│  Dependencies: Supabase Auth, profiles table                │
└──────────────────────────┬──────────────────────────────────┘
                           │ provides auth context
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   MASTER DATA MODULE                         │
│  • Customers CRUD, Suppliers CRUD, Products CRUD            │
│  • Search, filter, paginate                                 │
│  • Detail views with outstanding balance                    │
│  Dependencies: customers, suppliers, products tables        │
└──────────────────────────┬──────────────────────────────────┘
                           │ referenced by
              ┌────────────┼────────────┐
              ▼            ▼            ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  B2B MODULE  │  │  B2C MODULE  │  │  FINANCE     │
│              │  │              │  │  MODULE      │
│ • Pre-orders │  │ • Printing   │  │              │
│ • POs        │  │   orders     │  │ • Receivables│
│ • Receiving  │  │ • Production │  │ • Payables   │
│ • Fulfillment│  │   tracking   │  │ • Payments   │
│              │  │              │  │ • Hist. Debts│
│ Creates:     │  │ Creates:     │  │              │
│ receivables, │  │ receivables  │  │ Computed:    │
│ payables,    │  │              │  │ balances,    │
│ inventory    │  │              │  │ overdue flags│
│ movements    │  │              │  │              │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       └─────────────────┼──────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  INVENTORY MODULE                             │
│  • Product catalog (shared with Master Data)                │
│  • Stock levels (computed view)                             │
│  • Manual adjustments                                       │
│  • Movement history                                         │
│  Dependencies: products, inventory_movements, v_inventory_  │
│  summary                                                    │
│  Auto-updated by: B2B receiving triggers, B2B fulfillment   │
│  triggers                                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ feeds into
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                REPORTS & DOCUMENTS MODULE                    │
│  • Dashboard (summary metrics)                              │
│  • Reports (sales, inventory, receivables, payables, etc.)  │
│  • Documents (unified transaction view)                     │
│  • Print/export (PDF, CSV)                                  │
│  Dependencies: All modules (read-only aggregations)         │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Cross-Module Communication

| Source Module | Action | Target Module | Mechanism |
|---|---|---|---|
| B2B | Fulfillment completed | Finance | DB trigger → creates receivable |
| B2B | Fulfillment completed | Inventory | DB trigger → creates inventory_movement |
| B2B | Receiving saved | Inventory | DB trigger → creates inventory_movement |
| B2B | Receiving saved | B2B | DB trigger → updates PO status |
| B2B | PO fully received | Finance | DB trigger → creates payable |
| B2C | Order released | Finance | DB trigger → creates receivable |
| Finance | Payment recorded | Finance | DB trigger → updates receivable/payable status |
| Finance | Payment voided | Finance | DB trigger → recalculates status |
| All | Any data change | UI | TanStack Query invalidation → auto-refetch |

**Key principle:** Cross-module communication happens via **PostgreSQL triggers** (for data mutations) and **TanStack Query invalidation** (for UI updates). No direct module-to-module API calls.

---

## 5. Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│              DEVELOPMENT WORKFLOW                    │
│                                                      │
│  Developer ──► Git Push ──► GitHub/GitLab Repo      │
│                                    │                 │
│                                    ▼                 │
│                          Cloudflare Pages             │
│                          Auto-deploy                  │
│                          (preview + production)       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              PRODUCTION DEPLOYMENT                    │
│                                                      │
│  ┌─────────────────────┐                             │
│  │  Cloudflare Pages    │                             │
│  │  (Static SPA)        │                             │
│  │                      │                             │
│  │  • React build       │                             │
│  │  • CDN distribution  │──── HTTPS ────┐             │
│  │  • Custom domain     │               │             │
│  └─────────────────────┘               │             │
│                                         ▼             │
│  ┌─────────────────────────────────────────────┐     │
│  │  Supabase Project                            │     │
│  │                                              │     │
│  │  • Auth (email/password)                    │     │
│  │  • PostgreSQL (database + triggers)         │     │
│  │  • REST API (auto-generated)                │     │
│  │  • Edge Functions (create-user)             │     │
│  │  • RLS policies                             │     │
│  └─────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

### 5.1 Environment Configuration

| Variable | Location | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Cloudflare Pages env vars | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Cloudflare Pages env vars | Public anon key (safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Edge Functions secret | Admin operations (user creation) |

**Important:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are embedded in the client bundle. This is safe because:
- The anon key is designed to be public
- RLS policies protect all data at the database level
- The `service_role` key (which bypasses RLS) is NEVER in the client bundle

### 5.2 Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // No sourcemaps in production
  },
  define: {
    // Supabase credentials from environment
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
  },
});
```

---

## 6. Technology Stack & Versions

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| **Framework** | React | 19.x | Latest stable; concurrent features; large ecosystem |
| **Language** | TypeScript | 5.x | Type safety; better IDE support; catches errors at compile time |
| **Build Tool** | Vite | 6.x | Fast HMR; optimized builds; native ESM |
| **Routing** | React Router | 7.x | Industry standard; nested routes; data loaders |
| **Server State** | TanStack Query | 5.x | Caching, optimistic updates, background refetch, pagination |
| **Forms** | React Hook Form | 7.x | Performance (uncontrolled); Zod integration |
| **Validation** | Zod | 3.x | Runtime type validation; form schema validation |
| **Styling** | Tailwind CSS | 4.x | Utility-first; no CSS files; consistent design system |
| **Database** | PostgreSQL | 15.x (via Supabase) | NUMERIC type; triggers; RLS; views |
| **Backend** | Supabase | Latest | Auth + DB + RLS + REST API in one platform |
| **Edge Functions** | Deno (via Supabase) | Latest | Admin user creation; future PDF export |
| **Hosting** | Cloudflare Pages | Latest | Free tier; global CDN; Git-based deploys |
| **PDF Export** | jsPDF / html2canvas | Latest | Client-side PDF generation |
| **CSV Export** | papaparse | Latest | Client-side CSV generation |

---

## 7. Security Architecture

### 7.1 Authentication Flow

```
┌────────┐     POST /auth/v1/token     ┌────────────┐
│ Client │     { email, password }      │ Supabase   │
│        │ ────────────────────────────►│ Auth       │
│        │                              │            │
│        │ ◄────────────────────────────│            │
│        │     { access_token (JWT),    │            │
│        │       refresh_token }        │            │
└────┬───┘                              └────────────┘
     │
     │ Store tokens in memory (supabase client handles this)
     │ Attach Bearer token to all API requests
     │
     ▼
┌────────────────────────────────────────┐
│ Session Management                     │
│                                        │
│ • Supabase client auto-refreshes JWT   │
│ • 30-min inactivity timeout (client)   │
│ • Persistent sessions via localStorage │
│ • On app load: check session validity  │
└────────────────────────────────────────┘
```

### 7.2 Authorization Model

```
┌─────────────────────────────────────────────────────────┐
│                  ROLE PERMISSIONS                         │
│                                                          │
│  ┌─────────────────────┬───────────┬───────────┐        │
│  │ Permission          │  admin    │  staff    │        │
│  ├─────────────────────┼───────────┼───────────┤        │
│  │ Read business data  │    ✅     │    ✅     │        │
│  │ Create records      │    ✅     │    ✅     │        │
│  │ Update records      │    ✅     │    ✅     │        │
│  │ Delete records      │    ❌     │    ❌     │        │
│  │ Void payments       │    ✅     │    ❌     │        │
│  │ Manage users        │    ✅     │    ❌     │        │
│  │ View user mgmt page │    ✅     │    ❌     │        │
│  └─────────────────────┴───────────┴───────────┘        │
│                                                          │
│  Enforcement layers:                                     │
│  1. RLS policies (database) — authoritative              │
│  2. Route guards (frontend) — UX convenience             │
│  3. Conditional rendering (components) — hide UI         │
└─────────────────────────────────────────────────────────┘
```

### 7.3 Security Measures

| Threat | Mitigation |
|---|---|
| XSS | React auto-escapes; no dangerouslySetInnerHTML; CSP headers via Cloudflare |
| CSRF | Bearer token auth (not cookies); Supabase client handles token lifecycle |
| SQL Injection | Supabase client uses parameterized queries; no raw SQL from client |
| Privilege Escalation | RLS enforced at DB level; role stored in profiles table; `get_user_role()` is SECURITY DEFINER |
| Data Exfiltration | RLS on all tables; anon key can only access what RLS allows |
| Brute Force | Supabase Auth: 5 failed attempts → 15-min lockout |
| Session Hijacking | HTTPS only; JWT with short expiry; refresh token rotation |

---

## 8. Concurrent Access Strategy

```
┌─────────────────────────────────────────────────────────┐
│              CONCURRENCY MODEL                           │
│                                                          │
│  PostgreSQL Isolation Level: READ COMMITTED (default)    │
│                                                          │
│  Scenario: Two users record payments on same receivable  │
│                                                          │
│  User A: INSERT payment ₱10,000                         │
│  User B: INSERT payment ₱15,000                         │
│                                                          │
│  Both INSERTs succeed (different rows in payments table) │
│  Trigger fires for each:                                 │
│  • Trigger A: SUM = 10,000 → status = 'Partially Paid'  │
│  • Trigger B: SUM = 25,000 → status = 'Fully Paid'      │
│                                                          │
│  Result: Both payments recorded; final status correct    │
│                                                          │
│  UI Strategy:                                            │
│  • Optimistic update: show payment immediately           │
│  • Auto-refetch: invalidateQueries after mutation        │
│  • Conflict message: if DB error, show "Record updated   │
│    by another user. Please refresh and try again."       │
└─────────────────────────────────────────────────────────┘
```

---

## 9. Performance Considerations

| Concern | Strategy |
|---|---|
| Page load ≤ 3s | Code splitting (React.lazy per route); Vite tree-shaking; Cloudflare CDN |
| Search ≤ 2s | PostgreSQL indexes on search columns; `ilike` for text search; pagination (20/page) |
| Balance calc ≤ 500ms | Computed in PostgreSQL view; indexed on source_id; typically < 10 payments per receivable |
| Dashboard load | Single RPC function `get_dashboard_summary()` — one query instead of N |
| TanStack Query caching | 30s staleTime prevents excessive refetches; gcTime 5min keeps cache warm |
| Bundle size | Vite code splitting; lazy-load routes; no heavy UI library (Tailwind is utility-based) |
