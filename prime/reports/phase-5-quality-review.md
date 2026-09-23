# Phase 5 Quality Review — Inventory (Build phase)

verdict: request changes

## Findings

- src/lib/inventory.ts:16: 🔴 major: parseAdjustmentQuantity('0.0001') passes the non-zero check pre-rounding but returns 0 post-rounding — both the RHF validate (adjustments.tsx:169, `!== null`) and onSubmit check (adjustments.tsx:113-117) let 0 through, inserting a quantity-'0' movement, violating mandatory signed non-zero. Round first, then `if (rounded === 0) return null`; add a test for the 0<|v|<0.005 path.
- src/routes/_protected/inventory/adjustments.tsx:56: 🔴 major: movement list is fetched paginated (20/page via use-b2c.ts:99) but no Pagination control is rendered and `data.total` is unused — rows past page 0 are unreachable; requirement says list must be paginated. Render src/components/ui/Pagination.tsx with total, and call resetPage() when typeFilter changes.
- src/routes/_protected/inventory/summary.tsx:73: 🟡 minor: stock-color thresholds hardcode `10`, duplicating stockStatus/LOW_STOCK_THRESHOLD logic used one line below for the badge. Reuse stockStatus() for both color and badge.
- src/routes/_protected/inventory/adjustments.tsx:105: 🟡 minor: when saveAdjustment fails via the negative-confirm path (line 187), formError renders inside the Modal while the ConfirmDialog stays open on top and hides it. Show the error in the dialog or close it on failure.
- src/lib/inventory.ts:5: 🟡 minor: stockStatus(NaN) falls through both comparisons and returns 'In Stock' — a malformed current_quantity would badge as healthy. Guard !Number.isFinite → 'Out of Stock'.
- src/lib/inventory.ts:12: 🟡 minor: sanitizeSearchTerm strips PostgREST-reserved chars but not ILIKE wildcards `%`/`_`; a term like "50%" matches loosely. Not a failure/injection risk; escape or document.
- package.json:8: 🟡 minor: no `test` script — the two new node:test files only run via the ad-hoc per-file `node --test <file>` command recorded in prime/reports/phase-5-test-results.json. Add a test script so CI/devs run them.
- src/lib/inventory.ts:29: ⚪ nit: 'received' branch prints the raw string (`+${quantity}`) while 'released' reformats via Math.abs — inconsistent for stored values like '8.000'. Normalize both.

## Verified correct

- All queried columns match migrations exactly: v_inventory_summary select (summary.tsx:52) matches 20260826000008_views.sql:40-52 and seed-data.ts:271-287; inventory insert payload (adjustments.tsx:92-101) matches 20260826000007_inventory_table.sql columns/checks (movement_type='adjustment', reference_type='adjustment', reference_id null, created_by=session user id).
- Reports inventory case (reports/index.tsx:45-48) selects only real view columns.
- Summary badges use stockStatus with correct ≤0 Out / <10 Low / else In semantics; debounced (150ms) server-side search on real name/category columns via properly built or() filter.
- Adjustments form: product Select/Input integrate with react-hook-form correctly (both forward refs); signed quantity, required date, mandatory reason with required + maxLength 500; negative-stock projection (projectedQuantityAfterAdjustment) gates ConfirmDialog "Adjust Anyway" before save; save is fail-closed while stock query is pending (no stale-product race — query is keyed to the watched product_id).
- Movement type filter wired to useInventoryMovements (use-b2c.ts:91-105); Products/Summary/Adjustments tabs present on all 3 pages.
- No placeholder/TODO content; tests pass (19/19 via node --test, incl. view-contract test vs seed data); `tsc --noEmit` clean.

## Re-verification (post-fix, 2026-09-23)

verdict: pass

All findings closed by the implementer and independently re-checked:

- Major 1 (round-to-zero): `src/lib/inventory.ts` now returns null when the 2-dp rounding collapses a non-zero input to 0; regression tests `parseAdjustmentQuantity('0.0001') → null` and `-0.0001 → null` added.
- Major 2 (pagination): `adjustments.tsx` renders `Pagination` below the movements `Table` driven by `movementData.total` (PAGE_SIZE=20, matching `use-b2c.ts:99` range), page resets on typeFilter change, page changes re-query via `useInventoryMovements`.
- Minor (summary color duplication): current-stock color now derives from `stockStatus()` — single source of truth for the 0/10 thresholds.
- Minor (hidden save error): `saveAdjustment` catch closes the ConfirmDialog so the form error is visible.
- Minor (NaN status): `stockStatus` guards `!Number.isFinite` → 'Out of Stock'; tests for NaN/±Infinity added.
- Minor (ILIKE wildcards): `sanitizeSearchTerm` also strips `%` and `_`; wildcard test added.
- Minor (no test script): `package.json` now has `"test": "node --test tests/inventory-logic.test.ts tests/inventory-view-contract.test.ts"`.
- Nit (inconsistent received display): `movementQuantityDisplay` normalizes received/released/adjustment via parsed numbers.

Evidence: `pnpm exec tsc --noEmit` exit 0; `node --test` both files exit 0 (22/22 cases, 2 files); `pnpm exec vite build` success. See prime/reports/phase-5-test-results.json.
