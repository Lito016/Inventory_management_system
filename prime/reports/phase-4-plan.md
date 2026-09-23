# Phase 4 — Plan: Inventory Module Rebuild (T-021/T-022)

> Owner: prime-instruct (assumed in main agent) · Autopilot mode · 2026-09-23

## Specification decisions recorded

1. **No new data layer.** Existing hooks (`useProducts`/`useCreateProduct`/`useUpdateProduct` in use-b2b.ts; `useInventoryMovements`/`useCreateInventoryAdjustment` in use-b2c.ts) cover R1/R2/R4 write-and-list paths; R3's current-stock lookup is a direct single-row read of `v_inventory_summary` on product-select change (no new hook warranted for one query). The increment is page-layer alignment, not backend work. Decision: zero hook or migration changes → smallest coherent slice, trivial rollback.
2. **View is the single derivation point.** current_quantity and totals are read from `v_inventory_summary`; pages must not recompute (guards against divergence from DB triggers). Search stays server-side via `.or(ilike)` with a 150 ms debounce; commas in the search term are stripped client-side because they break PostgREST `or()` parsing (400, not cosmetic).
3. **Signed adjustment storage.** Decreases insert negative `quantity`; increases positive. The view adds adjustments linearly, so sign semantics are the only convention that keeps received − released + adjustments exact. Zero rejected client-side.
4. **Negative-stock guard is confirm-then-commit**, mirroring FR-INV-003 wording ("will result in negative stock … Continue?"). Confirmation is advisory (operators may legitimately drive stock negative during count corrections) — recorded decision: do NOT hard-block; DB accepts either.
5. **Shared tabs constant** Products · Summary · Adjustments on all three inventory pages (single source in each page file — three literals, acceptable duplication vs. premature shared module; pages co-locate their tab arrays today).
6. **Reports page aligned** because it queries the same view with stale column names; leaving it broken would violate R5 data-consistency even though not in the original file list. Scope addition is minimal (one select + map).

## Sequencing, dependencies, verification points

See docs/PRP.md §10: 4 ordered steps, dependency chain 1→2→3→4, per-step acceptance criteria, ~2.5 day effort estimate, rollback = revert four files. Milestone verification per step maps to R1…R6; final gate is build + browser pass in Verify phase.

## Methodology

- [x] Reused PRD v1.1 acceptance criteria as verification points (no placeholder steps; every step names files, effort, and a checkable outcome).
- [x] Dependency/prerequisite audit: dependency install executed pre-plan (node_modules absent was a real blocker for verification); external B2B trigger behavior verified out of scope.
- [x] Concrete-planning check: each step's "done" is executable evidence (tsc pass, rendered row, insert visible), not assertion.
