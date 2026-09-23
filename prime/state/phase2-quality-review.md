# Phase 2 Requirements Quality Review — UBMS

> **Reviewer:** PRIME Quality Evaluator  
> **Date:** 2026-08-26  
> **Mode:** Super Prime Polish  
> **Documents Reviewed:** PRD.md (627 lines), requirements-spec.md (708 lines), feature-matrix.md (259 lines)  
> **Total Requirements:** 55 functional + 6 non-functional = 61  

---

## Verdict: REQUEST CHANGES

**3 Critical issues** must be resolved before proceeding to Phase 3 (Architecture). These would cause implementation failures or rework if left unresolved.

---

## Pass 1: Ambiguity Check

### Finding A-01 — CRITICAL: B2C Workflow Has Two Mutually Exclusive Designs
- **Location:** `requirements-spec.md` FR-B2C-002, lines 293–294
- **Description:** The requirement presents two alternative workflows using "OR" and "Alternative:":
  - Option A: When status → "Paid", auto-create receivable AND auto-record full payment
  - Option B: When status → "Released", create receivable; payment recorded separately (Released → Paid)
  
  These are **mutually exclusive designs**. An implementer cannot build both. This is a product decision, not a technical choice.
- **Recommendation:** Choose one workflow. Recommended: **Option B** (receivable on Released, payment separate) — this is consistent with B2B (FR-B2B-009 creates receivable on fulfillment completion) and allows partial payments. Remove the "Alternative" text entirely.

### Finding A-02 — MAJOR: Overdue Detection Timing Undefined
- **Location:** `requirements-spec.md` FR-FIN-005, line 103
- **Description:** States overdue detection runs "on page load or daily batch" — these are fundamentally different implementations with different complexity, performance characteristics, and user experience. Page-load detection is real-time but slow for many records; daily batch is fast but stale during the day.
- **Recommendation:** Specify one approach. Recommended: **computed on page load via database view/query** (consistent with "always computed, never stored" principle from FR-FIN-004). Remove "daily batch" reference.

### Finding A-03 — MAJOR: "Invoice" Document Type Has No Creation Workflow
- **Location:** `requirements-spec.md` FR-DOC-001, line 565
- **Description:** "Invoice" is listed as a document type in the unified documents view, but no module creates invoices. B2B fulfillments create receivables, B2C orders create receivables — but neither is called an "invoice." Either invoices are a new feature (scope creep) or this is a misnomer for receivables/payment receipts.
- **Recommendation:** Clarify whether "Invoice" is a distinct document type or a synonym for "Receivable" / "Fulfillment." If distinct, add a creation workflow or remove from the document types list.

### Finding A-04 — MAJOR: PO "Completed" Transition Criteria Vague
- **Location:** `requirements-spec.md` FR-B2B-004, line 200
- **Description:** "Fully Received → Completed (payment processed / finalized)" — it's unclear what triggers this transition. Is it manual? Automatic when the payable is fully paid? The parenthetical suggests payment is involved, but POs are supplier-side and the payable lifecycle is in Finance. This conflates two modules.
- **Recommendation:** Define the trigger explicitly. Recommended: "Fully Received → Completed" is a **manual transition** performed by the user after verifying receiving and confirming the payable is settled. Add a GIVEN/WHEN/THEN criterion.

### Finding A-05 — MINOR: PRD Balance Example Formatting Artifact
- **Location:** `PRD.md` line 196
- **Description:** Shows "Remaining: ₱     ₱0.00" — double peso sign with alignment artifact.
- **Recommendation:** Fix to "Remaining: ₱0.00"

### Finding A-06 — MINOR: Visual Overdue Highlighting Not Specific Enough to Test
- **Location:** `requirements-spec.md` FR-FIN-005, line 106
- **Description:** "Overdue items are highlighted visually (distinct color or badge)" — "distinct color" is subjective. A developer might choose green; a tester expects red.
- **Recommendation:** Specify: "Overdue items are highlighted with a red background/badge (e.g., `bg-red-100` or `text-red-600`)" or reference a design token.

### Finding A-07 — MINOR: Report "Running Balance" Undefined
- **Location:** `requirements-spec.md` FR-RPT-006 (line 532) and FR-RPT-007 (line 540)
- **Description:** Customer/Supplier transaction reports show a "running balance (₱)" but the calculation is never defined. Does it start from zero? Does it include historical debts? Is it the same as the outstanding balance formula?
- **Recommendation:** Add explicit formula: "Running balance = cumulative sum of all debits (orders, historical debts) minus cumulative sum of all credits (payments) from the beginning of the date range to the current row."

### Finding A-08 — MINOR: B2C Sales Report Ambiguous on Partial Payments
- **Location:** `requirements-spec.md` FR-RPT-001, line 482
- **Description:** "Total B2C sales (₱) — sum of all paid printing orders within the date range" — what about partially paid orders? Are they included with the paid amount or excluded entirely?
- **Recommendation:** Clarify: "sum of all payments received for B2C printing orders within the date range" OR "sum of total_amount for all printing orders with status 'Paid' within the date range."

---

## Pass 2: Completeness Check

### Finding C-01 — MAJOR: No Concurrent Edit / Conflict Resolution Requirement
- **Location:** Missing from all documents
- **Description:** PRD §3.3 states "2–10 concurrent users" but no requirement addresses what happens when two users edit the same record simultaneously (e.g., two users recording payments against the same receivable at the same time). This is critical for financial data integrity.
- **Recommendation:** Add a requirement (or NFR) specifying conflict resolution strategy: optimistic locking with version check, last-write-wins, or database-level transaction isolation. Recommended: rely on PostgreSQL transaction isolation (Supabase default) + optimistic UI with refetch on conflict.

### Finding C-02 — MAJOR: No Requirement for Cancelled Source Document Impact on Receivables/Payables
- **Location:** Missing from all documents
- **Description:** If a B2B fulfillment is cancelled AFTER it created a receivable (FR-B2B-009), what happens to the receivable? If a B2C order is cancelled after creating a receivable, same question. No requirement addresses this cascade.
- **Recommendation:** Add acceptance criteria to FR-B2B-009 and FR-B2C-002: "If the source document is cancelled and an unpaid receivable exists, the receivable status changes to 'Voided/Cancelled'. If payments exist, the receivable cannot be cancelled — void payments first per FR-FIN-010."

### Finding C-03 — MINOR: No Date Validation for Most Date Fields
- **Location:** Only FR-DEBT-001 (line 331) specifies "no future dates"
- **Description:** Payment dates, PO dates, fulfillment dates, receiving dates, printing order dates — none have explicit future-date validation. Should a user be able to create a PO dated 2030? Record a payment dated next year?
- **Recommendation:** Add a general NFR or per-module constraint: "All transaction dates must not be in the future. The system rejects future dates with an appropriate error message." Exception: due_dates can be in the future.

### Finding C-04 — MINOR: No Reactivation Flow for Deactivated Customers/Suppliers
- **Location:** FR-CS-001 (line 441), FR-CS-002 (line 451)
- **Description:** Customers/suppliers can be deactivated but there's no requirement for reactivating them. A deactivated customer with outstanding balances might need to be reactivated to record a payment.
- **Recommendation:** Add acceptance criteria: "GIVEN an admin user, WHEN the admin clicks 'Reactivate' on a deactivated customer/supplier, THEN the entity becomes active and can be referenced in new transactions."

### Finding C-05 — MINOR: No Audit Log for General Record Changes
- **Location:** Missing from all documents
- **Description:** Payment voiding (FR-FIN-010) and debt status changes (FR-DEBT-003) have audit trails. But customer/supplier edits, product edits, PO edits, fulfillment edits — no audit trail. For a financial system, this is a gap.
- **Recommendation:** Either add a general audit log NFR (e.g., "All record create/update/delete operations are logged with user_id, timestamp, previous values, new values") or explicitly scope this out as a future enhancement.

### Finding C-06 — MINOR: RLS Policy Specifics Not Defined
- **Location:** NFR-002 (line 616–617)
- **Description:** "Row Level Security (RLS) policies are applied to all database tables" but the actual access rules aren't defined. What can `staff` see vs `admin`? PRD §3.3 says admin has "full access including user management" and staff has "operational access, no user management" — but at the data level, can staff see ALL financial records or only their own?
- **Recommendation:** Add explicit RLS rules: "Both admin and staff roles can access all business data (customers, orders, payments, etc.). Only admin role can access user management (FR-AUTH-003). This is a single-tenant system with shared data."

---

## Pass 3: Testability Check

### Finding T-01 — CRITICAL: Receivable Status Model Is Internally Inconsistent
- **Location:** FR-FIN-001 (lines 58–62) and FR-FIN-005 (lines 103–106)
- **Description:** FR-FIN-001 defines the receivable lifecycle as: Outstanding → Partially Paid → Fully Paid. FR-FIN-005 adds "Overdue" as a status for Outstanding/Partially Paid records. But the combined model is broken:
  1. A receivable starts as "Outstanding"
  2. Past due_date → becomes "Overdue" (per FR-FIN-005)
  3. Payment received → becomes "Partially Paid" or "Fully Paid" (per FR-FIN-005 line 105)
  4. But "Fully Paid" was only reachable from "Outstanding" or "Partially Paid" in FR-FIN-001
  
  The status enum is: {Outstanding, Partially Paid, Fully Paid} ∪ {Overdue} — but Overdue is a **temporal state** (depends on current date), not a **lifecycle state**. This makes it impossible to write deterministic tests.
  
  **The core problem:** Overdue is not a true status — it's a derived condition (status ∈ {Outstanding, Partially Paid} AND due_date < today). Treating it as a stored status creates contradictions.
- **Recommendation:** Redefine the model:
  - **Stored statuses:** Outstanding, Partially Paid, Fully Paid, Voided
  - **Overdue is a computed flag:** `is_overdue = (status IN ('Outstanding', 'Partially Paid')) AND (due_date < CURRENT_DATE)`
  - This eliminates the contradiction and makes testing deterministic.
  - Update FR-FIN-001, FR-FIN-005, FR-FIN-008, FR-FIN-009 to reflect this model.

### Finding T-02 — CRITICAL: Historical Debt Balance Integration Into Entity Outstanding Balance Is Undefined
- **Location:** FR-CS-003 (line 459) vs FR-FIN-001/002 (lines 61, 72)
- **Description:** FR-CS-003 says the customer/supplier outstanding balance includes "historical debts with status Pending/Verified/Disputed." But FR-FIN-001/002 define outstanding balance as: `receivable.amount - SUM(payments)`. These formulas don't include historical debts.
  
  So: **customer_total_outstanding = SUM(receivable balances) + SUM(historical debt amounts)?** This is never explicitly stated. The integration point is implicit.
  
  Without this formula, an implementer will build Finance balances without historical debts, and a separate customer detail view that tries to add them — leading to inconsistent numbers across the UI.
- **Recommendation:** Add an explicit formula to FR-CS-003:
  ```
  customer_outstanding = SUM(receivable outstanding balances) + SUM(historical debt amounts where status IN ('Pending', 'Verified', 'Disputed'))
  supplier_outstanding = SUM(payable outstanding balances) + SUM(historical debt amounts where status IN ('Pending', 'Verified', 'Disputed'))
  ```

### Finding T-03 — MINOR: Payable Creation Trigger Not Explicitly Defined
- **Location:** FR-FIN-002, line 69
- **Description:** "WHEN the PO is marked as generating a payable" — this implies a manual trigger, but it's unclear WHO marks it and WHEN. For receivables, the trigger is automatic (fulfillment completion → receivable created). For payables, it's vague.
- **Recommendation:** Specify: "When a PO reaches 'Fully Received' status, the system automatically creates a payable record" OR "The user manually triggers payable creation from the PO detail view." Recommended: automatic on Fully Received, consistent with receivable creation on fulfillment completion.

### Finding T-04 — MINOR: Low Stock Alert Default of 0 Is Effectively Disabled
- **Location:** FR-RPT-008, line 551
- **Description:** "threshold configurable per product, default 0" — at threshold 0, only products with current_qty ≤ 0 trigger alerts. This means the feature is effectively off by default. Is this intentional?
- **Recommendation:** Either set a sensible default (e.g., 10 units) or explicitly note: "Default threshold is 0 (alerts only for out-of-stock products). Configure per product for proactive alerts."

---

## Pass 4: Contradiction Check

### Finding X-01 — CRITICAL: (Same as T-01) Receivable Status Model Contradiction
- Already documented above. The status model has Overdue as both a stored status and a temporal condition.

### Finding X-02 — MAJOR: PRD and Requirements-Spec Differ on Payable Creation
- **Location:** PRD §5.3 (no mention of payable creation) vs FR-FIN-002 (payable creation from PO)
- **Description:** The PRD's B2B workflow section (§5.3) describes the complete B2B flow from Pre-Order to Payment but never mentions that payables are created from POs. The requirements-spec adds this in FR-FIN-002. The PRD's data model diagram shows `finance_payables` connected to `supplier_id` but doesn't show the creation trigger.
- **Recommendation:** Update PRD §5.3 to include the payable creation step in the B2B workflow, or add a cross-reference to FR-FIN-002.

### Finding X-03 — MINOR: PRD B2B Workflow Doesn't Match Spec Status Transitions
- **Location:** PRD §5.3 line 227 vs FR-B2B-004 lines 194–203
- **Description:** PRD shows: "PO status: Submitted → Partially Received (or Fully Received)" — implying these are the only transitions during receiving. But FR-B2B-004 also includes "Partially Received → Partially Received" (additional receiving, still not complete) and "Fully Received → Completed." The PRD omits these.
- **Recommendation:** Minor — PRD is a summary; the spec is authoritative. But consider updating PRD §7.2 to show the complete PO lifecycle for consistency.

### Finding X-04 — MINOR: Traceability Matrix Missing Pain Point References for Some Requirements
- **Location:** requirements-spec.md §11 (lines 649–707)
- **Description:** Several requirements have generic source references ("B2C workflow", "Inventory", "Reports", "Error correction") instead of specific pain point numbers. This makes it harder to trace back to the original problem statement.
- **Recommendation:** Map all requirements to specific pain points from PRD §2.1, or explicitly note "No direct pain point — feature derived from business workflow."

---

## Pass 5: Scope Alignment Check

### Finding S-01 — NIT: Low Stock Alerts Are a Minor Scope Addition
- **Location:** FR-RPT-008, line 551
- **Description:** "Low stock alerts (products with current_qty ≤ threshold, threshold configurable per product)" — configurable per-product thresholds are not mentioned in the PRD. This is a minor scope addition beyond what the proposal describes.
- **Recommendation:** Either accept as a natural extension of inventory tracking (minor) or move to a future enhancement. Not blocking.

### Finding S-02 — NIT: No Scope Issues Found
- All explicitly excluded features (PRD §10) are properly absent from the requirements.
- No mobile apps, OCR, payment gateways, advanced RBAC, SMS/email automation, multi-currency, offline mode, or file attachments appear in any requirement.
- **Pass:** Scope boundaries are well-maintained. ✓

### Finding S-03 — NIT: Polish Mode Budget Check
- 55 functional requirements across 9 modules
- Feature matrix groups into 6 logical sprint phases
- Estimated feature groups for Polish mode: ~6 (within 7-feature budget) ✓
- **Pass:** Budget is not exceeded.

---

## Summary Statistics

| Metric | Value |
|---|---|
| Documents reviewed | 3 |
| Total lines reviewed | 1,594 |
| Functional requirements reviewed | 55 |
| Non-functional requirements reviewed | 6 |
| **Total requirements reviewed** | **61** |

### Findings by Severity

| Severity | Count | IDs |
|---|---|---|
| **Critical** | 3 | A-01, T-01/X-01, T-02 |
| **Major** | 5 | A-02, A-03, A-04, C-01, C-02, X-02 |
| **Minor** | 8 | A-06, A-07, A-08, C-03, C-04, C-05, C-06, T-03, T-04, X-03, X-04 |
| **Nit** | 3 | A-05, S-01, S-02, S-03 |

### Findings by Pass

| Pass | Critical | Major | Minor | Nit |
|---|---|---|---|---|
| 1. Ambiguity | 1 | 3 | 4 | 1 |
| 2. Completeness | 0 | 2 | 4 | 0 |
| 3. Testability | 2 | 0 | 2 | 0 |
| 4. Contradiction | 1* | 1 | 2 | 0 |
| 5. Scope Alignment | 0 | 0 | 0 | 3 |

*Cross-referenced with T-01

### Strengths (What's Done Well)

1. **Consistent GIVEN/WHEN/THEN format** across all 55 functional requirements — excellent testability foundation
2. **Explicit financial formulas** — balance calculations, variance, inventory all have clear math
3. **Feature matrix dependency graph** — cross-module dependencies are well-mapped
4. **Cross-module impact matrix** — clearly shows how actions propagate between modules
5. **Traceability matrix** — every requirement maps to a pain point or source
6. **Out-of-scope section** — explicit exclusions prevent scope creep
7. **Status workflows** — B2B pre-orders, POs, fulfillments, B2C orders, and historical debts all have defined state machines
8. **Priority alignment** — Finance as P0 is consistent across all three documents

---

## Recommendation

### ⚠️ REQUEST CHANGES — 3 Critical Issues Must Be Resolved

**Required before Phase 3 (Architecture):**

| # | Finding | Action Required | Owner |
|---|---|---|---|
| 1 | **A-01:** B2C workflow has two designs | Choose one workflow (Recommended: Option B — receivable on Released) | Requirements Author |
| 2 | **T-01/X-01:** Receivable status model is inconsistent | Redefine: Overdue = computed flag, not stored status. Update FR-FIN-001, 005, 008, 009 | Requirements Author |
| 3 | **T-02:** Historical debt balance integration undefined | Add explicit formula for customer/supplier outstanding balance including historical debts | Requirements Author |

**Required before Phase 5 (Build) — can be resolved during Architecture:**

| # | Finding | Action Required |
|---|---|---|
| 4 | A-02: Overdue detection timing | Specify: computed on query (recommended) |
| 5 | A-03: "Invoice" document type | Clarify or remove |
| 6 | A-04: PO "Completed" trigger | Define explicitly |
| 7 | C-01: Concurrent edit handling | Add NFR or design decision |
| 8 | C-02: Cancelled source document cascade | Add requirements |
| 9 | X-02: PRD payable creation gap | Update PRD §5.3 |

**Can be deferred to implementation:**

All Minor and Nit findings — address during Phase 4 (Architecture) or Phase 5 (Build) as they don't block design decisions.

---

## Review Metadata

- **Review method:** Manual 5-pass analysis (Ambiguity → Completeness → Testability → Contradiction → Scope Alignment)
- **Cross-reference validation:** PRD ↔ Requirements-Spec ↔ Feature Matrix
- **Vault knowledge retrieved:** Finance module architecture decision (balance computation pattern)
- **Review duration:** Single-pass, no iteration needed
- **Confidence:** High — all three documents were fully read and cross-referenced
