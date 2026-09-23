# Product Requirements Document — UBMS
# Unified Business Management System

> **Version:** 1.0 | **Date:** 2026-08-26 | **Status:** Draft for Review
> **Prepared by:** PRIME Requirements Agent
> **Currency:** Philippine Peso (₱)

---

## 1. Executive Summary

UBMS (Unified Business Management System) is a web-based application that consolidates two business lines — B2B Fabric Trading and B2C Printing — into a single platform with Finance as the central, highest-priority module. The system replaces manual processes (paper receipts, hand-calculated balances, scattered spreadsheets) with a structured digital workflow that automates financial calculations, tracks orders end-to-end, and provides searchable transaction records.

**Key outcomes:**
- Eliminate manual balance calculations and their associated errors
- Centralize customer, supplier, and financial data across both business lines
- Provide real-time visibility into receivables, payables, and overdue amounts
- Track B2B ordered vs. received quantities with automatic variance detection
- Maintain historical debt records with verification status tracking
- Make all transactions searchable, printable, and exportable

---

## 2. Problem Statement & Solution

### 2.1 Problem Statement

The business operates two lines (B2B fabric trading and B2C printing) using entirely manual processes:

| Problem | Impact |
|---|---|
| Physical receipts are the primary financial record | Difficult to search, verify, or retrieve; risk of loss |
| Customer/supplier balances computed by hand | Prone to arithmetic errors; time-consuming |
| No centralized financial view | Receivables, payables, and debts scattered across papers/spreadsheets |
| Same customer/supplier info entered separately per business line | Redundant data entry; risk of inconsistency |
| B2B ordered vs. received quantities not tracked systematically | Shortages and excesses go unnoticed |
| Historical debts not recorded or verified | Financial uncertainty; inability to distinguish confirmed from unverified debts |

### 2.2 Solution

A unified web-based system that:
1. **Centralizes** all customer, supplier, product, and financial data in a single PostgreSQL database
2. **Automates** balance calculations (receivables, payables, outstanding amounts) in real-time
3. **Structures** B2B workflow (Pre-Order → PO → Receiving → Inventory → Fulfillment → Payment) with automatic variance detection
4. **Structures** B2C workflow (Order → Production → Completion → Release → Payment) with status tracking
5. **Records** historical debts with verification lifecycle (Pending → Verified → Disputed → Adjusted → Written Off)
6. **Eliminates** redundant data entry via shared customer/supplier records across modules
7. **Makes searchable** all transactions with filtering, sorting, and export capabilities

---

## 3. Target Users

### 3.1 Primary Persona: Business Owner / Manager (Admin role)
- **Responsibilities:** Oversees both business lines, manages finances, makes decisions based on financial data
- **Key needs:**
  - Accurate, real-time view of receivables and payables
  - Ability to identify overdue accounts instantly
  - Quick access to any transaction record
  - User management (create/deactivate staff accounts)
  - Generate reports for decision-making
- **Technical proficiency:** Moderate — comfortable with web applications

### 3.2 Secondary Persona: Staff / Operator (Staff role)
- **Responsibilities:** Day-to-day data entry — creating orders, recording payments, managing inventory
- **Key needs:**
  - Fast, simple forms for data entry
  - Clear workflow guidance (what status comes next)
  - Ability to search and find records quickly
  - Print/export documents for physical records
- **Technical proficiency:** Basic to moderate — needs intuitive interface

### 3.3 User Count
- Estimated 2–10 concurrent users (small business)
- All users share the same data (no per-user data isolation)
- Two roles: `admin` (full access including user management) and `staff` (operational access, no user management)

---

## 4. Technical Specifications

### 4.1 Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React + TypeScript | Industry standard SPA framework; type safety; large ecosystem |
| **Routing** | React Router | Client-side routing across modules |
| **Server State** | TanStack Query (React Query) | Caching, optimistic updates, background refetch |
| **Backend/Database** | Supabase (PostgreSQL) | Auto-generated REST API; built-in Auth; Row Level Security |
| **Authentication** | Supabase Auth | Email/password auth with session management |
| **Authorization** | Supabase RLS | Data access policies enforced at database level |
| **Business Logic** | Supabase Edge Functions (Deno) | Complex calculations (balance computation, variance detection) |
| **Deployment** | Cloudflare Pages | Free tier; global CDN; automatic Git deployments |
| **Currency** | Philippine Peso (₱) | All monetary fields use `NUMERIC(15,2)` in PostgreSQL |

### 4.2 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│              Cloudflare Pages (CDN)              │
│         React + TypeScript SPA (static)         │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────┐
│                  Supabase Platform               │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐ │
│  │    Auth    │  │ Postgres │  │ Edge Functions│ │
│  │ (email/pw) │  │   (DB)   │  │  (Deno)      │ │
│  └───────────┘  └──────────┘  └──────────────┘ │
│  ┌───────────────────────────────────────────┐  │
│  │        Row Level Security (RLS)           │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────┐                                  │
│  │ REST API  │ (auto-generated from tables)     │
│  └───────────┘                                  │
└─────────────────────────────────────────────────┘
```

### 4.3 Infrastructure Constraints
- **Database:** Supabase free tier — 500 MB storage, sufficient for small business
- **Auth:** 50,000 monthly active users (free tier); far exceeds need
- **Hosting:** Cloudflare Pages free tier — unlimited bandwidth, 100K function invocations/day
- **No backend server to manage** — Supabase provides auto-generated API

---

## 5. Feature Requirements by Module

### 5.1 Module: User Authentication & Management

| ID | Feature | Priority |
|---|---|---|
| FR-AUTH-001 | User login with email/password | P0 |
| FR-AUTH-002 | Session management (30-min inactivity timeout) | P0 |
| FR-AUTH-003 | Admin user management (create/edit/deactivate) | P1 |
| FR-AUTH-004 | Password reset flow | P1 |

**User Flow — Login:**
1. User navigates to application URL
2. System displays login form (email, password)
3. User enters credentials and clicks "Sign In"
4. System validates via Supabase Auth
5. On success → redirect to Dashboard
6. On failure → display generic error message

**User Flow — Admin Creates User:**
1. Admin navigates to Settings → Users
2. Admin clicks "Add User"
3. Admin enters email, full name, selects role (admin/staff)
4. System creates account and sends password setup email
5. New user receives email, clicks link, sets password
6. New user can now log in

### 5.2 Module: Finance (HIGHEST PRIORITY)

| ID | Feature | Priority |
|---|---|---|
| FR-FIN-001 | Customer receivables tracking | P0 |
| FR-FIN-002 | Supplier payables tracking | P0 |
| FR-FIN-003 | Payment recording (partial/full) | P0 |
| FR-FIN-004 | Outstanding balance auto-calculation | P0 |
| FR-FIN-005 | Due date tracking and overdue identification | P0 |
| FR-FIN-006 | Payment history per entity | P0 |
| FR-FIN-007 | Searchable financial transactions | P0 |
| FR-FIN-008 | Receivables summary | P0 |
| FR-FIN-009 | Payables summary | P0 |
| FR-FIN-010 | Payment voiding (admin only) | P1 |

**User Flow — Record a Payment:**
1. User navigates to Finance → Payments → "Record Payment"
2. User selects payment type: "Receivable" or "Payable"
3. User searches and selects the customer/supplier
4. System displays all outstanding receivables/payables for that entity
5. User selects the specific receivable/payable
6. User enters: amount (₱), payment date, method (Cash/Bank Transfer/Check), reference number
7. System validates amount > 0 and warns if amount > outstanding balance
8. User confirms and saves
9. System creates payment record, recalculates outstanding balance
10. If payment = outstanding → status becomes "Fully Paid"
11. If payment < outstanding → status becomes "Partially Paid"

**User Flow — View Finance Dashboard:**
1. User navigates to Finance → Dashboard
2. System displays:
   - Total outstanding receivables (₱) with overdue count
   - Total outstanding payables (₱) with overdue count
   - Overdue items highlighted in red
3. User clicks on receivables summary → sees list of all customer receivables
4. User clicks on payables summary → sees list of all supplier payables

**Balance Calculation Example:**
```
Invoice amount:     ₱50,000.00
Payment 1:         ₱20,000.00  → Remaining: ₱30,000.00 (Partially Paid)
Payment 2:         ₱30,000.00  → Remaining: ₱0.00 (Fully Paid)
```

### 5.3 Module: B2B Fabric Trading

| ID | Feature | Priority |
|---|---|---|
| FR-B2B-001 | Pre-order creation | P1 |
| FR-B2B-002 | Pre-order status transitions | P1 |
| FR-B2B-003 | Purchase order creation | P1 |
| FR-B2B-004 | PO status transitions | P1 |
| FR-B2B-005 | Receiving record creation | P1 |
| FR-B2B-006 | Ordered vs received quantity tracking | P1 |
| FR-B2B-007 | Automatic shortage/excess calculation | P1 |
| FR-B2B-008 | Manual variance/reason entry | P1 |
| FR-B2B-009 | Fulfillment record creation | P1 |
| FR-B2B-010 | B2B customer transaction history | P1 |

**User Flow — B2B Complete Workflow:**
```
1. Create Pre-Order (customer requests fabric)
   Status: Draft → Submitted

2. Convert Pre-Order to Purchase Order (order from supplier)
   Pre-Order status: Submitted → Converted
   PO created with status: Draft → Submitted

3. Record Receiving (fabric arrives from supplier)
   Enter received qty per item
   System calculates variance: received - ordered
   If variance ≠ 0 → require reason
   PO status: Submitted → Partially Received (or Fully Received)
   On "Fully Received" → system automatically creates Finance payable

4. Create Fulfillment (deliver to customer)
   Status: Pending → In Progress → Completed
   On "Completed" → creates Finance receivable

5. Record Payment (customer pays)
   Via Finance module → payment against receivable
```

**Variance Calculation Example:**
```
PO Item: 1,000 yards of Cotton Fabric @ ₱150/yard
Receiving: 997 yards received
Variance: 997 - 1,000 = -3 yards (Shortage)
Reason: "Short received — supplier shortage"
```

### 5.4 Module: B2C Printing

| ID | Feature | Priority |
|---|---|---|
| FR-B2C-001 | Printing order creation | P1 |
| FR-B2C-002 | Order status transitions | P1 |
| FR-B2C-003 | Production status tracking | P1 |
| FR-B2C-004 | B2C payment recording | P1 |
| FR-B2C-005 | B2C customer transaction history | P1 |

**User Flow — B2C Complete Workflow:**
```
1. Create Printing Order (customer requests printing)
   Select customer, add line items (description, qty, price)
   Status: Pending

2. Start Production
   Status: Pending → In Production
   Add production notes as needed

3. Complete Production
   Status: In Production → Completed

4. Release Order (customer picks up)
   Status: Completed → Released
   System creates Finance receivable

5. Record Payment
   Status: Released → Paid
   Payment recorded via Finance module
```

**B2B and B2C Separation:**
- B2B and B2C workflows are completely separate
- They share only: Customer records, Finance module (receivables/payments)
- B2B has its own procurement/inventory workflow
- B2C has its own production workflow
- No cross-contamination between business lines

### 5.5 Module: Historical Debts

| ID | Feature | Priority |
|---|---|---|
| FR-DEBT-001 | Record customer historical debts | P1 |
| FR-DEBT-002 | Record supplier historical debts | P1 |
| FR-DEBT-003 | Verification status management | P1 |
| FR-DEBT-004 | Listing and filtering | P2 |

**User Flow — Record and Verify Historical Debt:**
1. User navigates to Finance → Historical Debts
2. User clicks "Add Debt"
3. User selects entity type (Customer or Supplier)
4. User selects the specific entity
5. User enters: amount (₱), date, source/reference, description
6. System saves with verification status: "Pending"
7. Later, admin verifies: status changes Pending → Verified
8. If disputed: Pending → Disputed → Adjusted (with new amount) or Written Off

**Verification Status Workflow:**
```
Pending ──→ Verified ──→ Adjusted ──→ Written Off
   │            │
   │            └──→ Written Off
   │
   └──→ Disputed ──→ Adjusted ──→ Written Off
                  │
                  └──→ Written Off
```

### 5.6 Module: Inventory Management

| ID | Feature | Priority |
|---|---|---|
| FR-INV-001 | Product/fabric records | P1 |
| FR-INV-002 | Stock received tracking (auto from receiving) | P1 |
| FR-INV-003 | Stock released tracking (auto from fulfillment) | P1 |
| FR-INV-004 | Current quantity calculation | P1 |
| FR-INV-005 | Manual inventory adjustments | P1 |
| FR-INV-006 | Inventory history log | P2 |

**Current Quantity Formula:**
```
current_qty = stock_received - stock_released + SUM(adjustments)
```

### 5.7 Module: Customers & Suppliers (Centralized)

| ID | Feature | Priority |
|---|---|---|
| FR-CS-001 | Centralized customer records | P0 |
| FR-CS-002 | Centralized supplier records | P0 |
| FR-CS-003 | Customer/supplier detail view with outstanding balance | P1 |
| FR-CS-004 | Search functionality | P1 |

**Key Design Principle:** Customer and supplier data is entered ONCE and referenced by all modules (B2B, B2C, Finance, Historical Debts). This eliminates redundant data entry.

### 5.8 Module: Reports

| ID | Feature | Priority |
|---|---|---|
| FR-RPT-001 | Sales report | P2 |
| FR-RPT-002 | Inventory report | P2 |
| FR-RPT-003 | Receivables report | P1 |
| FR-RPT-004 | Payables report | P1 |
| FR-RPT-005 | Payments report | P2 |
| FR-RPT-006 | Customer transaction report | P2 |
| FR-RPT-007 | Supplier transaction report | P2 |
| FR-RPT-008 | Simple dashboard | P2 |

### 5.9 Module: Digital Transaction & Document Records

| ID | Feature | Priority |
|---|---|---|
| FR-DOC-001 | View all transaction documents | P1 |
| FR-DOC-002 | Print documents | P1 |
| FR-DOC-003 | Export documents (PDF/CSV) | P2 |
| FR-DOC-004 | Customer/supplier statements | P2 |

---

## 6. Data Model Overview

### 6.1 Core Entities and Relationships

```
┌─────────────┐       ┌─────────────┐
│  customers   │       │  suppliers   │
│─────────────│       │─────────────│
│ id          │       │ id          │
│ name        │       │ name        │
│ contact_    │       │ contact_    │
│   person    │       │   person    │
│ phone       │       │ phone       │
│ email       │       │ email       │
│ address     │       │ address     │
│ type        │       │ is_active   │
│ is_active   │       └──────┬──────┘
└──────┬──────┘              │
       │                     │
       ├──────────────────────┤
       │                      │
       ▼                      ▼
┌──────────────┐    ┌─────────────────┐
│ b2b_pre_orders│    │b2b_purchase_orders│
│──────────────│    │─────────────────│
│ customer_id  │    │ supplier_id     │
│ date         │    │ pre_order_id?   │
│ status       │    │ po_number       │
└──────┬───────┘    │ status          │
       │            └──────┬──────────┘
       │ (converted to)    │
       └──────────────────→│
                           │
                           ▼
                    ┌─────────────────┐
                    │b2b_receiving_   │
                    │  records        │
                    │─────────────────│
                    │ po_id           │
                    │ receiving_date  │
                    └──────┬──────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │inventory │ │  finance │ │  finance │
       │ records  │ │receivables│ │payables  │
       └──────────┘ │──────────│ │──────────│
                    │customer_id│ │supplier_id│
                    │ amount    │ │ amount   │
                    │ due_date  │ │ due_date │
                    │ status    │ │ status   │
                    └─────┬────┘ └────┬─────┘
                          │           │
                          ▼           ▼
                    ┌──────────────────────┐
                    │   finance_payments   │
                    │──────────────────────│
                    │ payment_type         │
                    │ source_id            │
                    │ amount               │
                    │ payment_date         │
                    │ payment_method       │
                    └──────────────────────┘

       ┌──────────────────────┐
       │  historical_debts    │
       │──────────────────────│
       │ entity_type          │
       │ entity_id            │
       │ amount               │
       │ verification_status  │
       └──────────────────────┘

       ┌──────────────────────┐     ┌──────────────────────┐
       │ b2c_printing_orders  │     │inventory_adjustments │
       │──────────────────────│     │──────────────────────│
       │ customer_id          │     │ product_id           │
       │ order_date           │     │ adjustment_qty       │
       │ status               │     │ reason               │
       │ total_amount         │     └──────────────────────┘
       └──────────────────────┘
```

### 6.2 Key Entity Count
- **Core tables:** ~18-20
- **Key relationships:** customers ↔ orders ↔ payments ↔ inventory ↔ debts

---

## 7. User Flows Summary

### 7.1 Finance — Receivable Lifecycle
```
B2B Fulfillment Completed ──→ Create Receivable (Outstanding)
                                     │
                                     ▼
                              Record Payment(s)
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
             Partially Paid    Fully Paid        Overdue
              (if partial)    (if full)      (if past due_date)
```

### 7.2 B2B — Order to Payment
```
Pre-Order (Draft → Submitted → Converted)
    │
    ▼
Purchase Order (Draft → Submitted → Partially Received → Fully Received → Completed)
    │                                    │
    ▼                                    ▼
Receiving Record                    Inventory Updated
(ordered vs received, variance calculated)
    │
    ▼
Fulfillment (Pending → In Progress → Completed)
    │
    ▼
Finance Receivable → Payment → Fully Paid
```

### 7.3 B2C — Order to Payment
```
Printing Order (Pending → In Production → Completed → Released → Paid)
    │                                              │
    ▼                                              ▼
Production Notes                           Finance Receivable
Updated                                    → Payment Recorded
```

### 7.4 Historical Debt Lifecycle
```
Create Debt (Pending)
    │
    ├──→ Verified ──→ Adjusted ──→ Written Off
    │        │
    │        └──→ Written Off
    │
    └──→ Disputed ──→ Adjusted ──→ Written Off
                   │
                   └──→ Written Off
```

---

## 8. Non-Functional Requirements

### 8.1 Performance
| Metric | Target |
|---|---|
| Page load time | ≤ 3 seconds (95th percentile) |
| Search query response | ≤ 2 seconds (up to 100K records) |
| Balance calculation | ≤ 500ms (up to 1,000 linked payments) |

### 8.2 Security
| Requirement | Implementation |
|---|---|
| Data encryption in transit | TLS 1.2+ (Cloudflare + Supabase) |
| Password storage | bcrypt via Supabase Auth (cost factor ≥ 10) |
| Database access control | Row Level Security on all tables |
| API key protection | Only anon key in client bundle; service_role key server-side only |
| Account lockout | 5 failed attempts → 15-minute lockout |

### 8.3 Usability
| Requirement | Target |
|---|---|
| Form validation | Inline, real-time, with clear error messages |
| Monetary input | Numeric only, 2 decimal places max |
| Screen resolution support | 1024×768 to 1920×1080 |
| Session timeout | 30 minutes of inactivity |

### 8.4 Data Integrity
| Requirement | Implementation |
|---|---|
| Monetary precision | `NUMERIC(15,2)` in PostgreSQL; no floating-point arithmetic |
| No hard deletes | Soft-delete or void with audit trail for financial records |
| Referential integrity | Foreign keys on all relationships |

### 8.5 Availability
| Requirement | Target |
|---|---|
| Uptime | 99.5% during business hours (6 AM – 10 PM PHT, Mon–Sat) |
| Browser support | Latest 2 versions of Chrome, Edge, Firefox |

---

## 9. Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| Balance calculation accuracy | 100% | All computed balances match manual verification for 10 test scenarios |
| Time to find a transaction | < 30 seconds | User can search and locate any transaction by keyword/date/entity |
| Data entry reduction | ≥ 50% fewer redundant entries | Customer/supplier entered once, referenced everywhere |
| Variance detection | 100% automatic | Every receiving record triggers variance calculation |
| Overdue visibility | Immediate | Overdue items highlighted on dashboard without manual filtering |
| Payment recording accuracy | 100% | System prevents invalid amounts (≤0, non-numeric) |
| Report generation | < 5 seconds | Any report renders within 5 seconds for current data volume |
| User onboarding | < 15 minutes | New staff can complete core workflow (create order, record payment) after brief orientation |

---

## 10. Out of Scope (Explicitly Excluded)

The following are **NOT** part of this system:

| Excluded Feature | Reason |
|---|---|
| Mobile/desktop native apps | Web-only (responsive for desktop/laptop) |
| OCR / document scanning | Not in proposal |
| Advanced AI / analytics | Not in proposal |
| Advanced Role-Based Access Control (RBAC) | Only admin/staff roles |
| Complex approval workflows | Not in proposal |
| External accounting integrations (QuickBooks, Xero) | Not in proposal |
| Payment gateway integration | Not in proposal |
| SMS / email automation | Not in proposal |
| Multi-currency support | Philippine Peso only |
| Offline mode | Web-only, requires internet |
| File attachment storage for receipts | Not in proposal v1 |

---

## 11. Design Principles

1. **Minimize redundant data entry** — Enter customer/supplier once, reference everywhere
2. **Reduce unnecessary steps** — Direct paths to common tasks (record payment, create order)
3. **Simple forms, organized information, clear statuses** — Every screen has a clear purpose
4. **Financial records easy to find** — Searchable, filterable, always accessible
5. **Keep B2B and B2C workflows separate** — Shared data layer, separate operational flows
6. **Avoid unnecessary dashboards/features** — Simple, focused, useful information only

---

## 12. Assumptions & Dependencies

### Assumptions
- All users have access to a modern web browser and stable internet connection
- The business owner will provide initial data (customer/supplier lists, product catalogs, historical debt records) for seeding
- Philippine Peso (₱) is the only currency needed
- Business operates in the Philippines (PHT timezone)

### Dependencies
- Supabase platform availability (free tier)
- Cloudflare Pages availability (free tier)
- Client data preparation (customer lists, supplier lists, product catalogs, historical debts)

---

## Appendix A: Glossary

| Term | Definition |
|---|---|
| **Receivable** | Money owed TO the business by a customer |
| **Payable** | Money owed BY the business to a supplier |
| **Pre-Order** | Initial customer request for fabric (B2B) |
| **Purchase Order (PO)** | Order placed to a supplier for fabric procurement |
| **Receiving Record** | Record of actual quantities received from a supplier |
| **Variance** | Difference between ordered and received quantities |
| **Fulfillment** | Delivery of fabric to a B2B customer |
| **Historical Debt** | Pre-existing debt recorded in the system from before implementation |
| **Verification Status** | Lifecycle status of a historical debt (Pending → Verified → Disputed → Adjusted → Written Off) |

---

## Increment: Inventory Module Rebuild — T-021 / T-022 (v1.1, 2026-09-23)

Scope restatement of the user request as testable requirements; details and evidence in `prime/reports/phase-2-define.md`.

### Solution overview

Rebuild the three inventory pages onto the canonical `v_inventory_summary` view contract (migration `20260826000008_views.sql`) so operators can track stock movements, perform signed physical-count adjustments with mandatory reasons and negative-stock confirmation, and view real-time computed summaries.

### Increment requirements & acceptance criteria

| ID | Requirement (must) | Acceptance criterion |
|---|---|---|
| R1 | Summary page displays per product: name, category, unit, total_received, total_released, total_adjustments, current_quantity + status Badge (In Stock ≥10 · Low 0<q<10 · Out ≤0) | GIVEN summary loaded, WHEN rows render, THEN no query references non-view columns; quantity comes from the view, never recomputed in the page |
| R2 | Adjustment form accepts product, signed non-zero decimal quantity, date, mandatory reason ≤500 chars; inserts `movement_type='adjustment'`, `reference_type='adjustment'`, `created_by`=current user | GIVEN valid decrease, WHEN saved, THEN movement row appears with negative quantity preserved |
| R3 | Decrease driving quantity below zero shows negative-stock warning requiring explicit confirmation | GIVEN decrease > current quantity, WHEN submit, THEN confirm dialog; cancel inserts nothing |
| R4 | Movement history: reverse-chronological, paginated (20/page), filterable by movement type; rows show date, product, type badge, signed quantity, reason | GIVEN adjustment saved, WHEN list refreshed, THEN entry visible; type filter narrows results |
| R5 | All `v_inventory_summary` consumers (summary page, reports inventory export) select only real view columns | GIVEN inventory report, WHEN generated, THEN columns match migration 008 |
| R6 | Products · Summary · Adjustments PageTabs shared by all three pages | GIVEN any inventory page, WHEN rendered, THEN tab bar links all three routes |

### Out of scope (v1.1)

Auto-movement creation triggers in receiving/fulfillment (FR-INV-002/003 automation), per-product deep-link history view, schema migrations, deployment. **FR-INV-006 recorded reduction** (see docs/PRP.md §10): history is delivered as the global movement log (type filter + pagination + signed quantity + reason); reference-document column, acting-user name, and date-range filter are deferred follow-ups.
