# API Contracts — UBMS

> **Version:** 1.0 | **Date:** 2026-08-26 | **Status:** Approved for Build
> **API Style:** Supabase Auto-generated REST (PostgREST) + RPC Functions + Edge Functions
> **Auth:** Bearer token (JWT) on all requests

---

## 1. Authentication Flow

### 1.1 Login

**Client:** `supabase.auth.signInWithPassword({ email, password })`

```
POST https://{project}.supabase.co/auth/v1/token?grant_type=password
Content-Type: application/json
apikey: {anon_key}

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "dGhpcyBpcyBh...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "authenticated"
  }
}
```

**Error (400):**
```json
{
  "error": "invalid_grant",
  "error_description": "Invalid login credentials"
}
```

### 1.2 Session Management

**Client:** `supabase.auth.getSession()` — checks stored session validity

- Session persists across browser restarts (stored in `localStorage`)
- Access token auto-refreshed by Supabase client before expiry
- **30-min inactivity timeout** enforced client-side via `useSessionTimeout` hook:
  - Tracks user interactions (click, keypress, scroll)
  - Clears session and redirects to `/login` after 30 min of no activity
  - Calls `supabase.auth.signOut()` on timeout

### 1.3 Password Reset

**Step 1 — Request reset:**
```typescript
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://app.example.com/reset-password'
});
```

**Step 2 — Update password (after clicking email link):**
```typescript
await supabase.auth.updateUser({ password: newPassword });
```

**Password Policy:** Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number. Enforced client-side via Zod schema + Supabase Auth configuration.

### 1.4 Admin User Creation (Edge Function)

```
POST https://{project}.supabase.co/functions/v1/create-user
Authorization: Bearer {admin_access_token}
Content-Type: application/json

{
  "email": "newuser@example.com",
  "full_name": "Juan Dela Cruz",
  "role": "staff"
}
```

**Response (200):**
```json
{
  "success": true,
  "user_id": "uuid-of-created-user"
}
```

**Error (403):**
```json
{
  "error": "Forbidden",
  "message": "Only admins can create users"
}
```

**Edge Function Implementation:**
```typescript
// supabase/functions/create-user/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

  // Verify caller is admin
  const token = req.headers.get('Authorization')!.replace('Bearer ', '')
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user!.id).single()

  if (profile?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  const { email, full_name, role } = await req.json()

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: crypto.randomUUID(), // Temporary; user resets via email
    email_confirm: true,
    user_metadata: { full_name, role }
  })

  if (error) throw error
  return new Response(JSON.stringify({ success: true, user_id: data.user.id }), { status: 200 })
})
```

---

## 2. Auto-Generated REST API Endpoints

Supabase auto-generates CRUD endpoints for all tables via PostgREST. All endpoints require `Authorization: Bearer {access_token}` header.

### 2.1 Base URL
```
https://{project}.supabase.co/rest/v1/
```

### 2.2 Common Query Parameters

| Parameter | Example | Description |
|---|---|---|
| `select` | `?select=id,name,email` | Column selection |
| `order` | `?order=created_at.desc` | Sorting |
| `limit` | `?limit=20` | Row limit |
| `offset` | `?offset=40` | Row offset (for pagination) |
| `eq` | `?status=eq.Outstanding` | Exact match filter |
| `ilike` | `?name=ilike.*juan*` | Case-insensitive pattern match |
| `gte` / `lte` | `?due_date=gte.2026-01-01&due_date=lte.2026-12-31` | Range filter |
| `in` | `?status=in.(Outstanding,Partially Paid)` | IN filter |
| `is` | `?is_voided=is.false` | IS filter |

### 2.3 Endpoints by Table

#### Customers

| Method | Endpoint | Description |
|---|---|---|
| GET | `/rest/v1/customers` | List/search customers |
| GET | `/rest/v1/customers?id=eq.{uuid}` | Get single customer |
| POST | `/rest/v1/customers` | Create customer |
| PATCH | `/rest/v1/customers?id=eq.{uuid}` | Update customer |

**Common queries:**
```
# Search by name
GET /rest/v1/customers?name=ilike.*juan*&is_active=eq.true&order=name&limit=20

# Get customer with outstanding balance (via view)
GET /rest/v1/v_customer_outstanding?customer_id=eq.{uuid}
```

#### Suppliers

| Method | Endpoint | Description |
|---|---|---|
| GET | `/rest/v1/suppliers` | List/search suppliers |
| GET | `/rest/v1/suppliers?id=eq.{uuid}` | Get single supplier |
| POST | `/rest/v1/suppliers` | Create supplier |
| PATCH | `/rest/v1/suppliers?id=eq.{uuid}` | Update supplier |

#### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/rest/v1/products` | List/search products |
| POST | `/rest/v1/products` | Create product |
| PATCH | `/rest/v1/products?id=eq.{uuid}` | Update product |

**Inventory summary:**
```
GET /rest/v1/v_inventory_summary?is_active=eq.true&order=name
```

#### Receivables (via View)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/rest/v1/v_receivables` | List receivables with balance + overdue |
| GET | `/rest/v1/v_receivables?id=eq.{uuid}` | Get single receivable |

**Common queries:**
```
# Overdue receivables
GET /rest/v1/v_receivables?is_overdue=eq.true&status=in.(Outstanding,Partially Paid)&order=due_date

# Receivables for a customer
GET /rest/v1/v_receivables?customer_id=eq.{uuid}&order=created_at.desc

# Receivables summary (all)
GET /rest/v1/v_receivables?select=status,outstanding_balance,is_overdue
```

#### Payables (via View)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/rest/v1/v_payables` | List payables with balance + overdue |
| GET | `/rest/v1/v_payables?id=eq.{uuid}` | Get single payable |

#### Payments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/rest/v1/payments` | List payments |
| POST | `/rest/v1/payments` | Record payment |
| PATCH | `/rest/v1/payments?id=eq.{uuid}` | Void payment (admin only) |

**Common queries:**
```
# Payments for a receivable
GET /rest/v1/payments?source_id=eq.{receivable_id}&payment_type=eq.receivable&is_voided=eq.false&order=payment_date.desc

# Payment history for a customer (via receivables)
GET /rest/v1/payments?source_id=in.(select id from receivables where customer_id={uuid})&order=payment_date.desc&limit=20
```

#### B2B Pre-Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | `/rest/v1/b2b_pre_orders` | List pre-orders |
| GET | `/rest/v1/b2b_pre_orders?id=eq.{uuid}` | Get single pre-order |
| POST | `/rest/v1/b2b_pre_orders` | Create pre-order |
| PATCH | `/rest/v1/b2b_pre_orders?id=eq.{uuid}` | Update status |

**Line items:**
```
GET /rest/v1/b2b_pre_order_items?pre_order_id=eq.{uuid}
POST /rest/v1/b2b_pre_order_items (batch insert)
```

#### B2B Purchase Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | `/rest/v1/b2b_purchase_orders` | List POs |
| GET | `/rest/v1/b2b_purchase_orders?id=eq.{uuid}` | Get single PO |
| POST | `/rest/v1/b2b_purchase_orders` | Create PO |
| PATCH | `/rest/v1/b2b_purchase_orders?id=eq.{uuid}` | Update status |

**PO items + receiving:**
```
GET /rest/v1/b2b_po_items?po_id=eq.{uuid}
POST /rest/v1/b2b_po_items (batch insert)

# Receiving records
GET /rest/v1/b2b_receiving_records?po_id=eq.{uuid}&order=receiving_date.desc
POST /rest/v1/b2b_receiving_records (creates receiving + triggers inventory update)
POST /rest/v1/b2b_receiving_items (batch insert for receiving line items)
```

#### B2B Fulfillments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/rest/v1/b2b_fulfillments` | List fulfillments |
| GET | `/rest/v1/b2b_fulfillments?id=eq.{uuid}` | Get single fulfillment |
| POST | `/rest/v1/b2b_fulfillments` | Create fulfillment |
| PATCH | `/rest/v1/b2b_fulfillments?id=eq.{uuid}` | Update status |

**Fulfillment items:**
```
GET /rest/v1/b2b_fulfillment_items?fulfillment_id=eq.{uuid}
POST /rest/v1/b2b_fulfillment_items (batch insert)
```

#### B2C Printing Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | `/rest/v1/b2c_printing_orders` | List printing orders |
| GET | `/rest/v1/b2c_printing_orders?id=eq.{uuid}` | Get single order |
| POST | `/rest/v1/b2c_printing_orders` | Create order |
| PATCH | `/rest/v1/b2c_printing_orders?id=eq.{uuid}` | Update status/notes |

**Order items:**
```
GET /rest/v1/b2c_order_items?order_id=eq.{uuid}
POST /rest/v1/b2c_order_items (batch insert)
```

#### Historical Debts

| Method | Endpoint | Description |
|---|---|---|
| GET | `/rest/v1/historical_debts` | List debts |
| POST | `/rest/v1/historical_debts` | Create debt |
| PATCH | `/rest/v1/historical_debts?id=eq.{uuid}` | Update verification status |

**Status logs (read-only):**
```
GET /rest/v1/historical_debt_status_logs?debt_id=eq.{uuid}&order=changed_at.desc
```

#### Inventory Movements

| Method | Endpoint | Description |
|---|---|---|
| GET | `/rest/v1/inventory_movements` | List movements |
| POST | `/rest/v1/inventory_movements` | Create adjustment |

```
# Movements for a product
GET /rest/v1/inventory_movements?product_id=eq.{uuid}&order=movement_date.desc&limit=20
```

#### Profiles (User Management — Admin Only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/rest/v1/profiles` | List users (admin only) |
| PATCH | `/rest/v1/profiles?id=eq.{uuid}` | Update user (admin only) |

---

## 3. RPC Functions (Complex Queries)

### 3.1 `get_dashboard_summary()`

```typescript
const { data } = await supabase.rpc('get_dashboard_summary');
```

**Response:**
```json
{
  "total_receivable_outstanding": 150000.00,
  "total_receivable_overdue": 45000.00,
  "overdue_receivable_count": 3,
  "total_payable_outstanding": 80000.00,
  "total_payable_overdue": 25000.00,
  "overdue_payable_count": 2,
  "recent_transactions": [
    {
      "date": "2026-08-25",
      "type": "payment",
      "description": "Payment from Juan — Cash",
      "amount": 15000.00
    }
  ],
  "low_stock_products": [
    {
      "product_id": "uuid",
      "name": "Cotton Fabric",
      "current_quantity": 5,
      "unit": "yards"
    }
  ]
}
```

### 3.2 `get_finance_search(search_term, filters)`

```typescript
const { data } = await supabase.rpc('get_finance_search', {
  search_term: 'juan',
  filter_type: 'all',       // 'receivable' | 'payable' | 'payment' | 'all'
  filter_from_date: '2026-01-01',
  filter_to_date: '2026-12-31',
  page_size: 20,
  page_offset: 0
});
```

**Response:**
```json
[
  {
    "result_type": "receivable",
    "id": "uuid",
    "date": "2026-08-20",
    "entity_name": "Juan Dela Cruz",
    "amount": 50000.00,
    "outstanding_balance": 30000.00,
    "status": "Partially Paid",
    "is_overdue": true,
    "reference": "FUL-2026-001"
  },
  {
    "result_type": "payment",
    "id": "uuid",
    "date": "2026-08-22",
    "entity_name": "Juan Dela Cruz",
    "amount": 20000.00,
    "payment_method": "Cash",
    "reference_number": "REF-001"
  }
]
```

### 3.3 `get_customer_statement(customer_id, from_date, to_date)`

```typescript
const { data } = await supabase.rpc('get_customer_statement', {
  p_customer_id: 'uuid',
  p_from_date: '2026-01-01',
  p_to_date: '2026-08-26'
});
```

**Response:**
```json
{
  "customer": { "name": "Juan Dela Cruz", "contact_person": "...", "phone": "..." },
  "transactions": [
    {
      "date": "2026-08-20",
      "type": "Receivable",
      "document_number": "FUL-2026-001",
      "debit": 50000.00,
      "credit": 0,
      "running_balance": 50000.00
    },
    {
      "date": "2026-08-22",
      "type": "Payment",
      "document_number": "PAY-2026-001",
      "debit": 0,
      "credit": 20000.00,
      "running_balance": 30000.00
    }
  ],
  "final_outstanding": 30000.00
}
```

---

## 4. Request/Response Examples for Key Operations

### 4.1 Record a Payment

**Request:**
```typescript
// POST /rest/v1/payments
const { data, error } = await supabase
  .from('payments')
  .insert({
    payment_type: 'receivable',
    source_id: 'receivable-uuid',
    amount: 20000.00,
    payment_date: '2026-08-26',
    payment_method: 'Cash',
    reference_number: 'OR-2026-001',
    recorded_by: userId
  })
  .select()
  .single();
```

**Response (201):**
```json
{
  "id": "payment-uuid",
  "payment_type": "receivable",
  "source_id": "receivable-uuid",
  "amount": 20000.00,
  "payment_date": "2026-08-26",
  "payment_method": "Cash",
  "reference_number": "OR-2026-001",
  "is_voided": false,
  "void_reason": null,
  "voided_by": null,
  "voided_at": null,
  "recorded_by": "user-uuid",
  "created_at": "2026-08-26T10:30:00Z",
  "updated_at": "2026-08-26T10:30:00Z"
}
```

**Side effects (automatic via triggers):**
- `receivables.status` updated to `'Partially Paid'` or `'Fully Paid'`
- `receivables.updated_at` updated

### 4.2 Void a Payment (Admin Only)

**Request:**
```typescript
// PATCH /rest/v1/payments?id=eq.{uuid}
const { data, error } = await supabase
  .from('payments')
  .update({
    is_voided: true,
    void_reason: 'Incorrect amount recorded',
    voided_by: adminUserId,
    voided_at: new Date().toISOString()
  })
  .eq('id', paymentId)
  .select()
  .single();
```

**RLS enforcement:** The RLS policy WITH CHECK clause verifies `get_user_role() = 'admin'` when `is_voided` changes from false to true. Non-admin users get a 403 error.

**Side effects (automatic via triggers):**
- `receivables.status` recalculated (back to 'Outstanding' or 'Partially Paid')

### 4.3 Create B2B Fulfillment and Mark Completed

**Step 1 — Create fulfillment:**
```typescript
const { data: fulfillment } = await supabase
  .from('b2b_fulfillments')
  .insert({
    customer_id: 'customer-uuid',
    fulfillment_date: '2026-08-26',
    status: 'Pending',
    created_by: userId
  })
  .select()
  .single();

// Insert line items
await supabase.from('b2b_fulfillment_items').insert([
  { fulfillment_id: fulfillment.id, product_id: 'prod-1', quantity: 500, unit_price: 150.00 },
  { fulfillment_id: fulfillment.id, product_id: 'prod-2', quantity: 200, unit_price: 200.00 },
]);
```

**Step 2 — Mark as Completed (triggers receivable + inventory creation):**
```typescript
await supabase
  .from('b2b_fulfillments')
  .update({ status: 'Completed' })
  .eq('id', fulfillment.id);
// Trigger automatically:
// 1. Creates receivable (₱115,000.00)
// 2. Creates inventory movements (released)
```

### 4.4 Record B2B Receiving

```typescript
// Create receiving record
const { data: receiving } = await supabase
  .from('b2b_receiving_records')
  .insert({
    po_id: 'po-uuid',
    receiving_date: '2026-08-26',
    received_by: userId
  })
  .select()
  .single();

// Insert receiving items (with variance)
await supabase.from('b2b_receiving_items').insert([
  { receiving_id: receiving.id, po_item_id: 'item-1', received_qty: 997, variance_qty: -3, variance_reason: 'Short received — supplier shortage' },
  { receiving_id: receiving.id, po_item_id: 'item-2', received_qty: 500, variance_qty: 0, variance_reason: null },
]);
// Triggers automatically:
// 1. Updates b2b_po_items.received_qty
// 2. Creates inventory movements (received)
// 3. Updates PO status (Partially Received or Fully Received)
// 4. If Fully Received → creates payable
```

### 4.5 Update Historical Debt Verification Status

```typescript
// Verify a debt
await supabase
  .from('historical_debts')
  .update({ verification_status: 'Verified' })
  .eq('id', debtId);
// Trigger automatically logs the status change in historical_debt_status_logs

// Adjust a disputed debt
await supabase
  .from('historical_debts')
  .update({
    verification_status: 'Adjusted',
    adjusted_amount: 45000.00,
    adjustment_reason: 'Agreed upon lower amount after negotiation'
  })
  .eq('id', debtId);
```

---

## 5. Error Handling Patterns

### 5.1 Supabase Client Error Structure

```typescript
interface SupabaseError {
  message: string;
  details: string;
  hint: string;
  code: string; // PostgreSQL error code
}
```

### 5.2 Common Error Codes

| Code | Meaning | User Message |
|---|---|---|
| `23505` | Unique violation | "A record with this name/number already exists." |
| `23503` | Foreign key violation | "Cannot delete — this record is referenced by other data." |
| `23514` | Check constraint violation | "Invalid value — please check the field requirements." |
| `42501` | RLS policy violation | "You don't have permission to perform this action." |
| `PGRST301` | Invalid body (POST/PATCH) | "Invalid data — please check the form and try again." |
| `PGRST116` | Row not found | "Record not found — it may have been deleted." |

### 5.3 Client-Side Error Handling Pattern

```typescript
// lib/utils/api-errors.ts
export function handleSupabaseError(error: PostgrestError): string {
  switch (error.code) {
    case '23505':
      return 'A record with this name or number already exists.';
    case '23503':
      return 'Cannot delete this record because it is referenced by other data.';
    case '23514':
      return 'Invalid value. Please check the field requirements.';
    case '42501':
      return "You don't have permission to perform this action.";
    default:
      console.error('Supabase error:', error);
      return 'An unexpected error occurred. Please try again.';
  }
}

// Usage in mutations
try {
  const { data, error } = await supabase.from('payments').insert(payment);
  if (error) throw error;
  return data;
} catch (err) {
  const message = handleSupabaseError(err as PostgrestError);
  toast.error(message);
  throw err;
}
```

### 5.4 Optimistic Update Conflict Handling

```typescript
// When a concurrent write conflict occurs at the database level
onError: (error, variables, context) => {
  // Rollback optimistic update
  queryClient.setQueryData(['receivables'], context?.previous);

  if (error.message.includes('updated by another user') || error.code === 'PGRST116') {
    toast.error('This record was updated by another user. Please refresh and try again.');
  } else {
    toast.error(handleSupabaseError(error));
  }
}
```

---

## 6. RLS Policies per Table (Summary)

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | Own row + admin reads all | Admin only | Admin updates all + own row | ❌ Blocked |
| `customers` | ✅ Authenticated | ✅ Authenticated | ✅ Authenticated | ❌ Blocked |
| `suppliers` | ✅ Authenticated | ✅ Authenticated | ✅ Authenticated | ❌ Blocked |
| `products` | ✅ Authenticated | ✅ Authenticated | ✅ Authenticated | ❌ Blocked |
| `receivables` | ✅ Authenticated | ✅ Authenticated (trigger) | ✅ Authenticated | ❌ Blocked |
| `payables` | ✅ Authenticated | ✅ Authenticated (trigger) | ✅ Authenticated | ❌ Blocked |
| `payments` | ✅ Authenticated | ✅ Authenticated | ✅ Authenticated (void: admin only) | ❌ Blocked |
| `b2b_pre_orders` | ✅ Authenticated | ✅ Authenticated | ✅ Authenticated | ❌ Blocked |
| `b2b_pre_order_items` | ✅ Authenticated | ✅ Authenticated | ✅ Authenticated | ❌ Blocked |
| `b2b_purchase_orders` | ✅ Authenticated | ✅ Authenticated | ✅ Authenticated | ❌ Blocked |
| `b2b_po_items` | ✅ Authenticated | ✅ Authenticated | ✅ Authenticated | ❌ Blocked |
| `b2b_receiving_records` | ✅ Authenticated | ✅ Authenticated | ✅ Authenticated | ❌ Blocked |
| `b2b_receiving_items` | ✅ Authenticated | ✅ Authenticated | ✅ Authenticated | ❌ Blocked |
| `b2b_fulfillments` | ✅ Authenticated | ✅ Authenticated | ✅ Authenticated | ❌ Blocked |
| `b2b_fulfillment_items` | ✅ Authenticated | ✅ Authenticated | ✅ Authenticated | ❌ Blocked |
| `b2c_printing_orders` | ✅ Authenticated | ✅ Authenticated | ✅ Authenticated | ❌ Blocked |
| `b2c_order_items` | ✅ Authenticated | ✅ Authenticated | ✅ Authenticated | ❌ Blocked |
| `historical_debts` | ✅ Authenticated | ✅ Authenticated | ✅ Authenticated | ❌ Blocked |
| `historical_debt_status_logs` | ✅ Authenticated | Trigger only | ❌ Blocked | ❌ Blocked |
| `inventory_movements` | ✅ Authenticated | ✅ Authenticated + triggers | ✅ Authenticated | ❌ Blocked |

---

## 7. TypeScript Type Generation

Types are auto-generated from the database schema using Supabase CLI:

```bash
supabase gen types typescript --linked > src/lib/supabase/types.ts
```

This generates TypeScript interfaces for all tables, views, and RPC functions, ensuring type safety across the application:

```typescript
// Generated types example
export type Database = {
  public: {
    Tables: {
      customers: {
        Row: { id: string; name: string; contact_person: string | null; /* ... */ }
        Insert: { id?: string; name: string; contact_person?: string | null; /* ... */ }
        Update: { id?: string; name?: string; contact_person?: string | null; /* ... */ }
      }
      // ... all other tables
    }
    Views: {
      v_receivables: {
        Row: { id: string; customer_name: string; outstanding_balance: number; is_overdue: boolean; /* ... */ }
      }
      // ... all other views
    }
    Functions: {
      get_dashboard_summary: { Args: {}; Returns: DashboardSummary }
      get_finance_search: { Args: { search_term: string; /* ... */ }; Returns: SearchResult[] }
    }
  }
}
```
