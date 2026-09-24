# Phase 3 Design Quality Review — UBMS

> **Reviewer:** PRIME Quality Evaluator  
> **Date:** 2026-08-26  
> **Mode:** Super Prime Polish — 5-Pass Convergent Review  
> **Documents Reviewed:** architecture-design.md, data-model.md, api-contracts.md, risk-assessment.md, DESIGN.md  
> **Requirements Reference:** requirements-spec.md (62 requirements: 55 functional + 7 NFR)

---

## Verdict: ⚠️ WARN

**The design is fundamentally sound and production-viable.** All critical-path requirements have a clear implementation path, the data model is well-normalized, triggers correctly implement core business logic, RLS provides strong security enforcement, and the design system is comprehensive. However, **5 major issues** should be addressed before Phase 4 (Instruction Packaging) to prevent implementation failures and rework during Phase 5.

---

## Pass 1: Architectural Correctness

### Finding 1.1 — MAJOR: No Database-Level Status Transition Enforcement

**Severity:** Major  
**Affects:** FR-B2B-002, FR-B2B-004, FR-B2C-002  
**Description:** B2B pre-order, PO, fulfillment, and B2C printing order status transitions are enforced ONLY at the frontend via React logic. The database CHECK constraints validate that a status value is in the allowed set, but there is NO mechanism to prevent invalid transitions (e.g., `Draft → Completed`, `Cancelled → Submitted`, `Fully Received → Draft`). A direct API call (or bug in frontend code) could set any valid status from any other valid status.

**Impact:** Data integrity violation. A fulfillment could be marked "Completed" without going through "In Progress", or a cancelled order could be reactivated. Financial triggers depend on specific transitions (e.g., receivable created only when fulfillment goes TO 'Completed' FROM non-'Completed'). If a fulfillment is accidentally set to 'Completed' then back to 'Pending', the trigger `OLD.status IS DISTINCT FROM 'Completed'` would not re-fire, but the receivable already exists with no way to undo it.

**Recommendation:** Add a `validate_status_transition()` PostgreSQL function + trigger for each workflow table that checks allowed transitions. Example:
```sql
-- For b2b_fulfillments:
-- Valid: Pending→In Progress, Pending→Completed, Pending→Cancelled, In Progress→Completed, In Progress→Cancelled
-- Invalid: Completed→anything, Cancelled→anything
```
Alternatively, document this as an accepted risk if the team is confident in frontend-only enforcement (small team, low concurrent access).

---

### Finding 1.2 — MAJOR: Missing View/RPC for Unified Document View (FR-DOC-001)

**Severity:** Major  
**Affects:** FR-DOC-001  
**Description:** The requirements specify a unified document view that displays ALL transaction documents (Pre-Orders, POs, Receiving Records, Fulfillments, Printing Orders, Payments, Receivables, Historical Debts, Adjustments) in a single filterable list. The architecture mentions `documents/index.tsx` as a route, but there is NO database view, RPC function, or query strategy to assemble this unified list.

**Impact:** The implementer will need to either (a) make 9+ separate API calls and merge client-side (slow, complex), or (b) create a UNION ALL view during implementation (unplanned work, inconsistent with other patterns).

**Recommendation:** Add a `v_unified_documents` view or `get_documents_unified(filters)` RPC function that UNIONs across all document types with columns: `document_type, document_id, document_number, date, entity_name, amount, status, source_type`. This should be defined in the data model before implementation.

---

### Finding 1.3 — MAJOR: Missing View/RPC for Sales Report (FR-RPT-001)

**Severity:** Major  
**Affects:** FR-RPT-001  
**Description:** The Sales Report requires aggregating B2B sales (completed fulfillments by date range) and B2C sales (paid printing orders by date range) with a breakdown by customer (top 10). No dedicated RPC function or view exists for this. The architecture defines `get_dashboard_summary()` and `get_customer/supplier_statement()` but no `get_sales_report()`.

**Impact:** The implementer must construct a complex cross-table aggregation query at build time. This is feasible but risks inconsistency with how other reports are handled.

**Recommendation:** Add `get_sales_report(from_date, to_date)` RPC function to the architecture's RPC function list (Section 3.3). Define the expected response schema.

---

### Finding 1.4 — Minor: No Dedicated View/RPC for Transaction History (FR-B2B-010, FR-B2C-005)

**Severity:** Minor  
**Affects:** FR-B2B-010, FR-B2C-005  
**Description:** Customer/supplier transaction history requires showing all pre-orders, fulfillments, receivables, and payments in reverse chronological order in a single unified list. No view or RPC exists for this. The implementer will need to UNION across 4+ tables.

**Recommendation:** Add `get_customer_transactions(customer_id, from_date, to_date)` and `get_supplier_transactions(supplier_id, from_date, to_date)` RPC functions. Note: `get_customer_statement()` exists but is designed for reports, not for the tabbed detail view.

---

### Finding 1.5 — Minor: Redundant Subquery in Outstanding Views

**Severity:** Minor  
**Affects:** v_customer_outstanding, v_supplier_outstanding  
**Description:** In both views, the `receivable_outstanding` (or `payable_outstanding`) subquery is computed TWICE — once for the individual column and once as part of the `total_outstanding` calculation. The subquery is identical in both places.

**Impact:** Doubles the execution cost of an already expensive correlated subquery. For a small business this is negligible, but it's a clear code quality issue.

**Recommendation:** Use a CTE (Common Table Expression) or lateral join to compute the subquery once:
```sql
WITH customer_totals AS (
    SELECT customer_id,
           SUM(outstanding_balance) AS receivable_outstanding
    FROM v_receivables
    WHERE status IN ('Outstanding','Partially Paid')
    GROUP BY customer_id
)
SELECT c.id, c.name,
       COALESCE(ct.receivable_outstanding, 0) AS receivable_outstanding,
       ...
       COALESCE(ct.receivable_outstanding, 0) + COALESCE(hd amounts, 0) AS total_outstanding
FROM customers c
LEFT JOIN customer_totals ct ON ct.customer_id = c.id
```

---

## Pass 2: Security Review

### Finding 2.1 — Minor: historical_debt_status_logs RLS Policy Ambiguity

**Severity:** Minor  
**Affects:** SR-01 (RLS misconfiguration risk)  
**Description:** The api-contracts.md RLS summary table (Section 6) lists `historical_debt_status_logs` INSERT as "Trigger only". However, the data-model.md RLS section (6.3) defines a generic "authenticated_insert" policy for all business tables. The `historical_debt_status_logs` table is NOT explicitly listed in Section 6.3's business table enumeration, but it's also not explicitly excluded. If the generic policy is applied, any authenticated user could INSERT status log rows directly, bypassing the trigger-based audit trail.

**Recommendation:** Explicitly define RLS for `historical_debt_status_logs`:
- SELECT: authenticated users
- INSERT: NO policy (trigger-only, via SECURITY DEFINER function)
- UPDATE: blocked
- DELETE: blocked

Or add it to the list of tables excluded from the generic business table policies.

---

### Finding 2.2 — Minor: Role Injection via auth.users Metadata

**Severity:** Minor  
**Affects:** SR-04 (Privilege escalation)  
**Description:** The `handle_new_user()` trigger function reads `role` from `NEW.raw_user_meta_data->>'role'` and inserts it into the `profiles` table. Currently, only the Edge Function (admin-only) creates users with metadata, so this is safe. However, if Supabase Auth is ever configured to allow public signup (e.g., email OTP, OAuth), a malicious user could set `role: 'admin'` in their metadata and escalate privileges.

**Recommendation:** Either:
1. Add a CHECK in the trigger: `IF COALESCE(NEW.raw_user_meta_data->>'role', 'staff') NOT IN ('admin','staff') THEN RAISE EXCEPTION...` (defensive)
2. Or hardcode the default: Always set role to 'staff' in the trigger, and have the Edge Function update the role AFTER profile creation via `supabaseAdmin.from('profiles').update({role}).eq('id', user_id)`.
3. Or document that public signup MUST remain disabled and add this to the deployment checklist.

---

### Finding 2.3 — Nit: get_user_role() Missing search_path Pinning

**Severity:** Nit  
**Affects:** Defense-in-depth  
**Description:** The `get_user_role()` function is `SECURITY DEFINER` but doesn't set `search_path`. In theory, if a malicious user creates a function in a schema that appears earlier in the search path, they could intercept the function's table lookup. This is an extremely unlikely attack vector in Supabase (requires superuser-like access), but PostgreSQL best practice recommends pinning `search_path`.

**Recommendation:** Add `SET search_path = public` to the function definition:
```sql
CREATE OR REPLACE FUNCTION get_user_role() RETURNS TEXT AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;
```

---

### Finding 2.4 — Nit: Supabase Auth Configuration Not Validated

**Severity:** Nit  
**Affects:** FR-AUTH-001 (account lockout), NFR-002  
**Description:** The architecture specifies "5 failed attempts → 15-min lockout" and password policy (8+ chars, upper/lower/number). These are Supabase Auth configuration settings that must be set in the Supabase dashboard. The design documents specify them but there's no automated validation or deployment checklist item to verify they're configured.

**Recommendation:** Add a pre-deployment checklist item: "Verify Supabase Auth configuration: lockout threshold = 5, lockout duration = 15min, minimum password length = 8, password requirements = upper+lower+number."

---

## Pass 3: Performance Review

### Finding 3.1 — MAJOR: Missing Composite Index on payments for View Performance

**Severity:** Major  
**Affects:** v_receivables, v_payables, v_customer_outstanding, v_supplier_outstanding  
**Description:** The balance calculation in `v_receivables` and `v_payables` runs this correlated subquery for every row:
```sql
SELECT SUM(p.amount) FROM payments p
WHERE p.source_id = r.id AND p.payment_type = 'receivable' AND p.is_voided = false
```
The existing index is `idx_payments_source(payment_type, source_id)` which covers the first two filter columns but NOT `is_voided`. This means PostgreSQL must scan all payments for a given source+type and filter `is_voided` at the row level.

**Impact:** With thousands of payments, the view queries will be slower than necessary. The `is_voided = false` filter eliminates most rows (voided payments are rare), so adding it to the index would dramatically reduce I/O.

**Recommendation:** Replace `idx_payments_source(payment_type, source_id)` with a composite index:
```sql
CREATE INDEX idx_payments_source_active ON payments (payment_type, source_id, is_voided) INCLUDE (amount);
```
This is a covering index — PostgreSQL can satisfy the entire subquery from the index without touching the table.

---

### Finding 3.2 — Minor: No Full-Text Search Strategy

**Severity:** Minor  
**Affects:** FR-FIN-007 (search), FR-CS-004 (customer/supplier search), NFR-001 (search ≤ 2s)  
**Description:** The architecture uses `ilike '%term%'` for text search. This requires a full table scan (cannot use B-tree indexes). For the stated dataset size (small business, likely < 100K records), this is acceptable. However, if the business grows, search performance will degrade.

**Recommendation:** Document that `ilike` is the initial strategy. For future optimization, consider `pg_trgm` extension with GIN indexes for trigram matching, which supports partial matching with index acceleration.

---

### Finding 3.3 — Minor: View Performance at Scale

**Severity:** Minor  
**Affects:** v_customer_outstanding, v_supplier_outstanding  
**Description:** These views nest correlated subqueries inside other views (v_receivables itself has a correlated subquery). For each customer, the query: (1) scans v_receivables (which scans payments for each receivable), then (2) scans historical_debts. This is O(customers × receivables × payments_per_receivable).

**Impact:** Acceptable for < 1000 receivables. Could become slow with 10,000+ receivables.

**Recommendation:** Monitor query performance. If slow, consider materialized views refreshed on payment insert/void, or denormalized `outstanding_balance` column on receivables/payables maintained by triggers.

---

## Pass 4: Design System Completeness

### Finding 4.1 — Minor: "In Progress" Badge Color Collision

**Severity:** Minor  
**Affects:** B2B fulfillments, B2C printing orders  
**Description:** The "In Progress" badge for B2B fulfillments uses `blue-50/blue-700/blue-200` — the same color scheme as "Submitted" (B2B pre-orders/POs) and "Outstanding" (finance). In a UI where users scan multiple statuses quickly, this color collision could cause momentary confusion.

**Recommendation:** Consider using a distinct color for "In Progress" — e.g., `sky-50/sky-700/sky-200` or `teal-50/teal-700/teal-200` — to differentiate active work from submitted/waiting states.

---

### Finding 4.2 — Minor: No Explicit Report Screen Designs

**Severity:** Minor  
**Affects:** FR-RPT-001 through FR-RPT-008  
**Description:** The design system defines excellent patterns for list, detail, form, and dashboard pages. However, report screens have no explicit layout specification. Reports have different needs than list pages: date range filters as primary controls, summary totals at the top, export buttons prominently placed, and tabular data with running balances.

**Impact:** The implementer will need to improvise report layouts, potentially creating inconsistency across the 8 report types.

**Recommendation:** Add a "Report Page Pattern" section to DESIGN.md that defines:
- Date range picker placement (prominent, top of page)
- Summary stat cards above the report table
- Export button placement (page header, secondary)
- Running balance column styling
- Print-optimized report layout (already partially covered in Section 10)

---

### Finding 4.3 — Nit: Drawer vs. Page Decision Not Guided

**Severity:** Nit  
**Affects:** Implementation consistency  
**Description:** The design system shows "Record Payment" as a drawer (right slide-over), but the architecture routes suggest all CRUD operations have dedicated routes (e.g., `finance/payments.tsx`). There's no explicit guidance on when to use a drawer/modal vs. a full page route for create/edit operations.

**Recommendation:** Add a design guideline: "Use drawers for quick actions that reference a list (Record Payment, Record Receiving). Use full pages for complex multi-section forms (Create PO, Create Fulfillment) or detail views with tabs."

---

## Pass 5: Requirement Traceability

### Coverage Matrix

| Module | Reqs | Covered | Partial | Gap |
|---|---|---|---|---|
| Auth | 4 | 4 | 0 | 0 |
| Finance | 10 | 10 | 0 | 0 |
| B2B | 10 | 9 | 1 (txn history) | 0 |
| B2C | 5 | 4 | 1 (txn history) | 0 |
| Historical Debts | 4 | 4 | 0 | 0 |
| Inventory | 6 | 6 | 0 | 0 |
| Customers/Suppliers | 4 | 4 | 0 | 0 |
| Reports | 8 | 7 | 0 | 1 (sales report) |
| Documents | 4 | 3 | 0 | 1 (unified view) |
| NFR | 7 | 7 | 0 | 0 |
| **Total** | **62** | **58** | **2** | **2** |

### Requirements Without Clear Implementation Path

| Requirement | Gap | Recommended Solution |
|---|---|---|
| FR-DOC-001 (Unified Document View) | No view/RPC for cross-table document aggregation | Add `v_unified_documents` view or `get_documents_unified()` RPC |
| FR-RPT-001 (Sales Report) | No RPC function for sales aggregation | Add `get_sales_report()` RPC function |
| FR-B2B-010 / FR-B2C-005 (Transaction History) | No dedicated view/RPC | Add `get_customer_transactions()` / `get_supplier_transactions()` RPC |

### Over-Engineering Check

**No over-engineering detected.** Every table, view, trigger, and Edge Function maps to at least one requirement. The optional `export-pdf` Edge Function is correctly deferred. The architecture is minimal and appropriate for the problem scope.

---

## Summary Statistics

| Metric | Value |
|---|---|
| **Total Requirements** | 62 (55 functional + 7 NFR) |
| **Requirements Covered** | 58 (93.5%) |
| **Requirements with Gaps** | 4 (6.5%) |
| **Tables** | 20 — all mapped to requirements |
| **Views** | 5 — all functional, 2 with performance issues |
| **Triggers** | 16 — all implement correct business logic |
| **Edge Functions** | 1 required + 1 optional — appropriate |
| **RPC Functions** | 4 defined — 2-3 more needed |

### Findings by Severity

| Severity | Count | IDs |
|---|---|---|
| **Critical** | 0 | — |
| **Major** | 4 | 1.1, 1.2, 1.3, 3.1 |
| **Minor** | 8 | 1.4, 1.5, 2.1, 2.2, 3.2, 3.3, 4.1, 4.2 |
| **Nit** | 3 | 2.3, 2.4, 4.3 |

### Recommendation

**WARN — Proceed with caution.** The design is solid and implementation-ready for the core modules (Auth, Finance, B2B, B2C, Inventory, Customers/Suppliers). The 4 major findings should be addressed before or early in Phase 5 to prevent rework:

1. **Add status transition validation** (Finding 1.1) — Either add DB-level enforcement or explicitly accept the risk with documentation.
2. **Define missing views/RPCs** (Findings 1.2, 1.3) — Add `v_unified_documents`, `get_sales_report()`, and transaction history RPCs to the data model.
3. **Add composite index** (Finding 3.1) — Replace `idx_payments_source` with a covering index that includes `is_voided` and `amount`.

The 8 minor findings should be tracked and addressed during implementation but are not blockers.

---

## Positive Observations

The design demonstrates several notable strengths:

1. **Excellent trigger design** — Business logic (receivable/payable creation, status updates, inventory movements) is correctly automated via triggers with proper edge case handling (`OLD.status IS DISTINCT FROM`).
2. **Strong security posture** — Three-layer defense (RLS → route guards → UI hiding), service_role key isolation, SECURITY DEFINER functions used correctly.
3. **NUMERIC(15,2) throughout** — No floating-point arithmetic for financial calculations. This is critical for a financial system.
4. **No hard deletes** — RLS blocks DELETE on all tables. Void with audit trail is the correct pattern for financial records.
5. **Design system quality** — Comprehensive, pattern-based, WCAG AA compliant, with excellent information density for business use. The 3-layer color architecture, detailed component specs, and print layout are production-quality.
6. **Appropriate tech stack** — React + Supabase + Cloudflare Pages is well-suited for a small business SPA. Minimal server-side complexity with only 1 required Edge Function.
7. **Risk assessment is thorough** — 19 risks identified with concrete mitigation strategies. SR-01 (RLS misconfiguration) correctly identified as the highest-priority risk.

---

*Review completed: 2026-08-26 | PRIME Quality Evaluator*
