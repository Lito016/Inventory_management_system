# Phase 2 — Define: Inventory Module Rebuild (T-021, T-022)

> Project: UBMS inventory_management · Mode: Autopilot · Shape: product_increment
> Date: 2026-09-23 · Owner agent: prime-requirement (assumed in main agent, native subagent registration used for review)

## Methodology checklist

- [x] Prior knowledge recall — searched repository: `docs/requirements-spec.md` §6 (FR-INV-001…006), `docs/execution-plan.md` Task 21/22, `docs/PRD.md` Inventory section.
- [x] Source verification — confirmed authoritative schema in `supabase/migrations/20260826000007_inventory_table.sql` (inventory_movements) and `20260826000008_views.sql` (v_inventory_summary); cross-checked reference logic in `src/lib/supabase/seed-data.ts:271-287`.
- [x] Gap analysis against current code — verified three verified sources (migration SQL, seed-data view logic, page code) for each page.
- [x] Requirement elicitation — no new user questions needed; user brief restates FR-INV-002…006 which already have Given/When/Then acceptance criteria in the requirements spec.

## Verified facts (evidence)

1. **Canonical view contract** (`v_inventory_summary`, migration 008 lines 40-52): columns `product_id, name, unit, category, is_active, total_received, total_released, total_adjustments, current_quantity`, where
   `current_quantity = SUM(received) − SUM(released) + SUM(adjustment)`. Adjustment quantities are stored **signed** in `inventory_movements` (the seed-data reference implementation sums them additively).
2. **Defect — summary page broken against schema**: `src/routes/_protected/inventory/summary.tsx` queries/projects `product_name` and `current_stock`, and its search filter uses `product_name.ilike` — neither column exists in the view (real or seed). Same mismatch in `src/routes/_protected/reports/index.tsx:46`.
3. **Defect — adjustments form violates FR-INV-005**: quantity restricted to positive (`min="0.01"`), reason/notes optional, no negative-stock warning, no PageTabs integration.
4. `products.tsx` satisfies FR-INV-001 (list/search/create/edit/deactivate via `useProducts`/`useCreateProduct`/`useUpdateProduct`); only the tab set omits Adjustments.
5. Hooks `useInventoryMovements` / `useCreateInventoryAdjustment` exist in `src/hooks/use-b2c.ts:91-117` and insert into `inventory_movements` — correct table per migration 007.

## Requirements for this increment (testable)

- **R1 (FR-INV-004/T-021)** — Summary page SHALL display per product: name, category, unit, total_received, total_released, total_adjustments, current_quantity, and a stock-status Badge categorized as In Stock (≥10), Low Stock (0<q<10), Out of Stock (≤0). Search MUST filter by `name`/`category`. Acceptance: table renders seed/mock rows with correct computed quantity; no query references a non-existent column.
- **R2 (FR-INV-005/T-021)** — Adjustment form MUST accept a non-zero signed decimal quantity (negative = decrease), a date, and a **mandatory** reason (≤500 chars). It SHALL insert `movement_type='adjustment'`, `reference_type='adjustment'` into `inventory_movements` with `created_by` = current user. Acceptance: create → row appears in movement log with sign preserved.
- **R3 (FR-INV-003-analog/T-021)** — Before saving a decrease that would drive current quantity below zero, the system SHALL warn "…will result in negative stock…" and require explicit confirmation. Acceptance: adjusting down beyond stock shows the warning; cancelling inserts nothing.
- **R4 (FR-INV-006/T-022)** — Adjustments page SHALL list full movement history, reverse-chronological, paginated (20/page), filterable by movement type; each row shows date, product, type badge, signed quantity, notes/reason. Acceptance: type filter changes result set.
- **R5 (T-022/FR-RPT-002 consistency)** — All consumers of `v_inventory_summary` (summary page, inventory report) MUST select only real view columns. Reports inventory case switches to `name, category, total_received, total_released, total_adjustments, current_quantity, unit`.
- **R6 (UX consistency)** — All three inventory pages share PageTabs: Products · Summary · Adjustments.

## Scope boundaries

In scope: the four files above, no new hooks unless required (none needed). Out of scope: DB triggers for auto receiving/fulfillment movements (FR-INV-002/003 automation — behavior lives in B2B modules, verified elsewhere), product-detail history tab (partially satisfied by Adjustments log filtered view), migrations, deploy.

## Risks / assumptions

- Mock client (`src/lib/supabase/mock-client.ts`) is the dev runtime; `.or(ilike)` filters and view rows must remain compatible with it — verified seed view uses `name`/`current_quantity`, so R1 fixes align mock and real paths.
- Low-stock threshold (<10) is a product decision retained from the existing implementation; no other threshold is specified in requirements.

## Skill invocation evidence

- software-architecture: single-source-of-truth decision — computed view (never stored mutable quantity) enforced; page layer must not re-derive totals (see R1/R5 boundary).
- caveman + quality-review: delegated to an independent reviewer subagent for the phase-2 quality review (see `phase-2-quality-review.md`).
