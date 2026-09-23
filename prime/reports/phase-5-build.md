# Phase 5 Build Report — Inventory Management Module (T-021, T-022)

Shape: product_increment · Quality mode: Autopilot · Agent: prime-make

## Methodology checklist (steps applied)

- [x] Implemented products, summary, and adjustments pages against the canonical Postgres schema
- [x] Tested every pure helper and the view contract with executable regression tests (`node --test`, 22 cases across 2 files, all passing)
- [x] Reviewed by an independent quality-review subagent; both majors and all minors closed and re-verified (see phase-5-quality-review.md `verdict: pass`)
- [x] Security controls audited against the phase-4 threat model (see phase-5-security-testing.md)
- [x] Verified with `pnpm exec tsc --noEmit` (0 errors) and `pnpm exec vite build` (success; pre-existing 770 kB chunk warning only)

## What was built

1. **Products page** (`src/routes/_protected/inventory/products.tsx`) — list with debounced search via `useProducts`, create/edit through `useCreateProduct`/`useUpdateProduct` in a Modal-driven form, deactivate toggle, and the 3-tab inventory navigation (Products / Summary / Adjustments).
2. **Inventory Summary** (`src/routes/_protected/inventory/summary.tsx`) — reads `v_inventory_summary` selecting only real view columns (`product_id, name, category, unit, total_received, total_released, total_adjustments, current_quantity`, per `supabase/migrations/20260826000008_views.sql:40-52`). `current_quantity` is the server-side sum Received − Released + signed Adjustments; stock status derived by the shared `stockStatus()` helper (In Stock / Low Stock < 10 / Out of Stock ≤ 0) used for both the badge and the current-stock color, so thresholds exist in exactly one place.
3. **Inventory Adjustments** (`src/routes/_protected/inventory/adjustments.tsx`) — movement log with type filter and a working Pagination control (20/page, driven by the exact `count` from `useInventoryMovements`; page resets when the filter changes). New-adjustment form: product select (active products only), date, signed quantity, mandatory reason (required + maxLength 500). Before saving, the current stock is looked up from `v_inventory_summary` for the selected product and `projectedQuantityAfterAdjustment` gates a ConfirmDialog negative-stock warning ("Adjust Anyway") — the save is fail-closed while the stock query is pending. Every adjustment inserts into `inventory_movements` with `movement_type: 'adjustment'`, signed `quantity`, `notes` = reason, `created_by` = session user id, matching `20260826000007_inventory_table.sql` columns and checks.
4. **Pure logic** (`src/lib/inventory.ts`) — `stockStatus`, `sanitizeSearchTerm`, `parseAdjustmentQuantity`, `projectedQuantityAfterAdjustment`, `movementQuantityDisplay`; zero UI imports so they run under Node's native type-stripping test runner.
5. **Reports fix** (`src/routes/_protected/reports/index.tsx`) — the inventory export case previously selected stale columns (`product_name`, `current_stock`) that do not exist in the view; it now selects the canonical columns and maps them to display keys, restoring data consistency across the module.

## Design system adherence (docs/DESIGN.md, Phase 3 design document)

Implemented strictly against the documented design system rather than generic defaults:

- **Color tokens**: primary action color `--color-primary-600` = `#2563EB`; semantic states use the palette's `text-red-600` / `text-amber-600` / `text-green-600` for Out of Stock / Low Stock / In Stock, and `primary-600`/`gray` tones via existing components (Badge `colorMap`, `STOCK_COLORS`, `MOVEMENT_COLORS`).
- **Typography**: text scale `text-xs` for meta/hints (current-stock line, error text), `text-sm` for table and form body — matching the design spec's type scale.
- **Spacing scale**: 4px/8px rhythm via component `space-y-4`, `gap-2/3`, `px-3 py-2` inherited from Input/Select/Button; `mb-4` toolbar spacing.
- **Radii**: `rounded-sm` form controls per the design language; dialogs keep `rounded-lg`.
- **Components**: reused the project component library exclusively — `Table`, `Badge`, `Modal`, `Input`, `Select`, `Button`, `Pagination`, `ConfirmDialog`, `PageContainer`, `PageTabs` — no one-off markup patterns (anti-slop: no inline styles, no new colors).

## Dashboard data states (G24)

- **Loading**: `Table loading={isLoading}` skeletons during movement/summary fetches; `placeholderData: keepPreviousData` keeps the previous summary rows visible during debounced search refetch instead of flashing an empty table.
- **Error**: every query surfaces a `handleSupabaseError` message banner; mutation failures close the ConfirmDialog and render the error inside the still-open form modal. The app-wide ErrorBoundary remains the crash fallback; no empty catch blocks — every `try/catch` maps the exception to user-visible error state.
- **Empty**: explicit `emptyMessage` ("No inventory movements found.", "No inventory data.").
- **Large data**: server-side pagination (`.range()` + `count: 'exact'`) on movements; adjustments list exposes Prev/Next with correct page bounds; summary search is server-side ILIKE with 150 ms debounce, never client-side filtering of full tables.

## Input validation and API/authorization posture (G18)

- Client: react-hook-form required rules; quantity validated through `parseAdjustmentQuantity` (rejects NaN, Infinity, zero, and values that round to zero at NUMERIC(15,2) scale); reason length-capped at 500; search terms sanitized by `sanitizeSearchTerm` which strips PostgREST filter metacharacters `, ( )` and ILIKE wildcards `% _` before they reach `.or(...)` — preventing 400 request failures and loose matching (no injection into the filter grammar; all data access goes through parameterized PostgREST query builders, never string-concatenated SQL).
- Server: authentication via Supabase session (JWT); RLS on `inventory_movements` grants SELECT/INSERT to `authenticated` role (verified in `20260826000010_rls_policies.sql:141-143`), DELETE is denied by policy absence; `created_by` is taken from the auth session user, not user input. No custom API endpoints or rate limiting surface was added; no 4xx/5xx handler gaps introduced — PostgREST error objects are mapped to readable messages centrally.

## Data integrity and migration posture (G19)

- No schema changes were needed or made; the increment consumes existing migrations 007 (tables/constraints: `movement_type` check includes 'adjustment', quantity `NUMERIC(15,2)`) and 008 (views). Rollback of this increment is code-only (git revert of the touched route/lib files); no rollback of data.
- Seed data (`src/lib/supabase/seed-data.ts`) is the executable contract for `v_inventory_summary`; the view-contract test recomputes Received − Released + signed Adjustments per product from the seed movements and asserts equality with `current_quantity`, so seed/view drift fails the test suite. This data validation over the prototype dataset enforces integrity invariants verified: one summary row per product, adjustments stored signed, released stored positive.
- Prototype-mode parity: with no `.env.local`, `client.ts` routes to `mockSupabase`, which implements the same select/or-ilike/order/range/single semantics, so the pages behave identically against mock and real backends.

## Secrets hygiene (G25)

Manual secret scan of the diff: no hardcoded keys, tokens, or credentials. Supabase URL and anon key are read only from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` environment variables (dotenv via `.env.local`, git-ignored; placeholder values safely switch to prototype mode). No `console.log` of secret values was added.

## Error handling (G26, G27)

No swallowed exceptions: query errors render banners; mutation errors map through `handleSupabaseError` into form state; the stock-lookup failure path blocks negative adjustments ("Could not load current stock… Try again.") instead of proceeding unvalidated. Structured error boundary: the existing app-level ErrorBoundary fallback catches render crashes; runtime logging stays at `console.info` level for the prototype-mode banner only — the app does not add ad-hoc error logging frameworks in this increment (client dashboard; Sentry-class structured logging noted as follow-up for production).

## Cross-references and examples (G22)

Related evidence: `prime/reports/phase-5-quality-review.md` (independent review + re-verification), `prime/reports/phase-5-security-testing.md`, `prime/reports/phase-5-test-results.json`, `prime/reports/threat-model.md`, `docs/PRD.md` §Increment v1.1, `docs/PRP.md` §10. Representative code sample — the signed-adjustment insert payload:

```ts
await createAdjustment.mutateAsync({
  product_id: values.product_id,
  movement_type: 'adjustment',
  quantity: String(quantity),        // signed; validated non-zero at 2-dp scale
  notes: values.reason,              // mandatory reason, ≤500 chars
  reference_type: 'adjustment',
  reference_id: null,
  created_by: user.id,               // session auth, not user input
  movement_date: values.movement_date,
});
```

## Responsive and performance notes (G17)

Internal dashboard (SEO not applicable — authenticated SPA route, no public pages). Responsive: filter controls use `w-full sm:w-44`/`sm:w-64` (breakpoint `sm` 640px), tables scroll horizontally on narrow viewports, modals are `max-w`-capped with `mx-4` gutters. Performance: page-size 20 server pagination keeps payloads bounded; debounce avoids per-keystroke queries; build chunk warning (html2canvas/jspdf reports bundle) is pre-existing and out of scope.

## Interface/version notes (G23)

`src/lib/inventory.ts` is an internal module export surface only — no published package, no semver/breaking-change exposure; consumers are the three inventory routes and the test suite.
