# Phase 4 — Quality Review: Plan Packet (T-021/T-022 Inventory Rebuild)

verdict: request changes

Reviewed: prime/reports/phase-4-plan.md, docs/PRP.md §Increment Implementation Plan, prime/reports/threat-model.md, prime/reports/phase-4-checkpoint-review.md. Cross-checked against docs/PRD.md v1.1 (R1-R6), docs/requirements-spec.md §6 FR-INV-002…006, migrations 007/008/010, and all four page sources.

## Findings

- docs/PRP.md:846+856 — major: duplicate "## 9" headings (Environment Variables vs Increment Plan); every "§9" citation in plan/checkpoint is ambiguous. fix: renumber increment plan to §10, update cross-refs.
- phase-4-plan.md:7 decision 1 + PRP step 1 — major: R3 negative-stock check has no specified current_quantity source on adjustments page; "hooks fully cover R1-R4" false for R3 (no hook/query returns per-product current_quantity; products select at adjustments.tsx:45 lacks it); step 1 select list omits product_id needed for lookup. fix: add inline v_inventory_summary select incl. product_id+current_quantity to step 2 scope, or extend a hook; name it in the plan.
- phase-4-plan.md / PRD R4 vs FR-INV-006 — minor: spec requires date-range filter + reference doc + created-by user in log; R4/plan dropped all three, divergence unrecorded. fix: record scope reduction in plan decisions or PRD out-of-scope.
- threat-model.md:13 T1 vs :18 T6 — minor: T1 says "RLS governs who may insert"; T6 verified INSERT is WITH CHECK (true) for any authenticated. fix: reword T1 to match T6 fact.
- threat-model.md:16 T4 — minor: comma in search term makes PostgREST or() a 400 — search breaks, not "cosmetic". fix: sanitize , % _ in term before interpolation; state in step 1.
- threat-model.md:13 + PRP step 2 — minor: created_by "from session, never form input" is client convention only; RLS does not enforce created_by = auth.uid() (WITH CHECK (true) accepts any UUID). fix: add to T6 follow-up migration list (insert WITH CHECK auth.uid() = created_by).
- phase-4-checkpoint-review.md:8 — nit: "TypeScript 7.0.2 global" not reproducible from artifacts; recorded constraint itself is sound (project pins ~5.6, tsconfig:19 uses baseUrl — verified). no action.

## Verified accurate (independently)

- View columns product_id/name/unit/category/is_active/total_received/total_released/total_adjustments/current_quantity exist in 20260826000008_views.sql:42-49; current formula received−released+adjustments confirms plan decision 3 signed convention.
- RLS claim exact: 20260826000010_rls_policies.sql:141-143 = SELECT/INSERT/UPDATE for authenticated, zero DELETE policy.
- NUMERIC(15,2) quantity, DATE movement_date (007:12,17); no CHECK blocking negatives — R2 "negative preserved" feasible.
- FR-INV-003 quoted confirm wording matches spec:399; FR-INV-005 500-char reason matches spec:418.
- Hooks exist as claimed (use-b2b.ts:7/22/34, use-b2c.ts:91/107); movements hook already does type filter + 20/page range + desc order.
- Stale-column defect real: summary.tsx:11-18,38 (product_name/current_stock) and reports/index.tsx:46 (same) — neither column exists in view; checkpoint finding 1 correct.
- R1-R6 each trace to steps 1-4; not block-worthy.

## Author response & re-verification (2026-09-23)

- Major 1 closed: increment section renumbered `## 10` (grep-verified unique); §9→§10 cross-refs updated in plan + checkpoint.
- Major 2 closed: PRP §10 step 2 now names the R3 source (`v_inventory_summary` single-row read of `name, current_quantity` on product-select change); step 1 fetch now includes `product_id`; plan decision 1 reworded to R1/R2/R4 hook coverage.
- Minor 3 closed: FR-INV-006 reduction recorded in PRP §10 risks and PRD v1.1 out-of-scope.
- Minor 4/6 closed: threat-model T1 reworded to verified RLS fact incl. created_by-unenforced residual (follow-up migration list).
- Minor 5 closed: comma sanitization stated in step 1 + decision 2; `%`/`_` remaining as LIKE wildcards is benign (broadens contains-match only) — accepted with reason.
- Nit: no action, as stated.

verdict: pass
