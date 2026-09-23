# Phase 4 — Threat Model: Inventory Adjustment Surface

> Scope: T-021/T-022 increment (four page files, no schema change). ASVS L2 baseline (auth'd multi-tenant business data).

## Assets & trust boundary

`inventory_movements` rows (audit trail), product catalog, computed stock levels. Boundary: protected browser pages → Supabase (anon key + user JWT + RLS). Server remains the policy authority; client checks are UX only.

## Threats and controls

| # | Threat | Vector | Control (implemented/verified) | Residual risk |
|---|---|---|---|---|
| T1 | Forged/retroactive adjustments to skew stock | Direct insert with arbitrary date/user | `created_by` taken from session `useAuth().user.id`, never form input; `movement_date` is a date (not timestamp) per schema. **Verified:** RLS grants INSERT to all `authenticated` (00010:142) — role model at UI/ops level, not RLS, is the effective control | Any auth'd user can insert movements server-side (matches existing posture for all business tables); created_by is unenforced by RLS — follow-up: `WITH CHECK (created_by = auth.uid())` requires user-approved migration |
| T2 | Zero/huge/NaN quantity injection | Form manipulation | react-hook-form validation: required, non-zero check, `step=0.01`; DB column NUMERIC(15,2) bounds magnitude; view math is linear so no overflow UX risk | Values within NUMERIC range from a malicious but auth'd user are indistinguishable from legit — RLS/role is the real control |
| T3 | Reason field as injection/XSS payload (≤500 chars) | Stored notes rendered in tables | React text-node rendering escapes by default; Supabase parameterizes queries; maxLength enforced client-side (500) matching FR-INV-005 | None identified |
| T4 | Search wildcard abuse via `.or(ilike.%term%)` | Supabase PostgREST filter string | Term interpolated only into ilike pattern; worst case is noisier matching, not SQL execution; debounce bounds request rate | commas in term can split `or()` conditions — cosmetic only |
| T5 | Privilege escalation via deactivate/edit actions | Non-admin mutating products | Existing ProtectedLayout + role model; increment adds no new permission surface | Inherits existing RLS posture — not re-audited here |
| T6 | Audit log tampering (update/delete movements) | Direct client update | Not exposed by any page in this increment. **Verified** `20260826000010_rls_policies.sql:141-143`: SELECT/INSERT/UPDATE allowed for all `authenticated`; DELETE has no policy (denied) | UPDATE-any-row is a real integrity weakness (any auth'd user can edit movement history server-side); out of scope for page increment — recorded as follow-up: tighten to insert-only + admin update in a future migration, needs user approval (schema change) |

## Decision

No new secrets, no new endpoints, no client-side crypto. Confirm-before-negative (T-021 R3) is integrity UX, not security control — DB remains source of truth. Proceed to Build.
