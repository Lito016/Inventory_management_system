# Phase 5 Build Report — UI/UX Enhancement (T-101…T-107, PRD v1.2)

Shape: product_increment · Quality mode: Autopilot · Agent: prime-make · Run: ims-uiux-enhance-muf6w3nv-7eyrph

## Methodology checklist (steps applied)

- [x] Implemented every planned task T-101…T-107 against the PRD v1.2 acceptance criteria U1–U8, with no new dependencies
- [x] Verified each requirement in a real browser against the built demo bundle via an executable acceptance harness (`prime/evidence/ui-audit/reaudit.py`, 19/19 checks pass)
- [x] Ran regression protection: `npm test` (node --test, 3 files, 24/24 cases), `tsc --noEmit` (0 errors), `vite build` (success)
- [x] Reviewed by an independent quality-review subagent against the actual diff (see phase-5-quality-review.md `verdict: pass`)
- [x] Security controls audited against the phase-4 threat model (see phase-5-security-testing.md)

## What was built

1. **Responsive shell (T-101, U1/U2/U3)** — `src/App.tsx`: `ProtectedLayout` now owns a single source of truth for `mobileOpen`/`collapsed` and the menu-button ref; the drawer closes on route change and on Escape (focus returns to the menu button); duplicated settings shell at the `/settings/users` route was consolidated into one `<ProtectedLayout requireAdmin>` (restores the missing DemoBanner there). `src/components/layout/Sidebar.tsx`: static at `lg`, off-canvas drawer below (`-translate-x-full` → `translate-x-0`), width-synced collapse (`lg:w-[68px]`/`lg:w-60`), overlay `bg-gray-900/40 lg:hidden`. Content wrapper margin uses the matching `lg:ml-[68px]`/`lg:ml-60` with `transition-[margin]`, eliminating the dead-gap defect class (UX-1, UX-3).
2. **Contained tables (T-102, U2)** — `src/components/ui/Table.tsx`: both render wrappers get `overflow-x-auto`; tables keep `min-w-[640px]` so wide grids scroll inside the card instead of stretching the page. `src/components/layout/PageTabs.tsx`: tab `nav` now `min-w-0 overflow-x-auto`, fixing the last 29px page-level horizontal overflow at 375px found by element-level Playwright diagnosis.
3. **Visible keyboard focus (T-103, U4)** — `Button.tsx` base classes carry `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1`; weak per-variant `focus:ring-primary-100`-style rings removed; `Input.tsx`/`Select.tsx` ring strengthened to `primary-500`; header controls and sidebar NavLinks share an explicit focus-ring class.
4. **Honest header affordances (T-104, U5)** — `src/components/layout/Header.tsx` rewritten: mobile menu button (aria-labelled, ref-driven), breadcrumb drops the terminal crumb so it no longer duplicates the page H1 (U6), search popover navigates to `/finance/search?q=…` (term passed through `encodeURIComponent`), notifications bell shows the real overdue count from the already-cached `['dashboard']` query (badge capped at "9+", popover links to receivables, honest "All clear." empty state). Popovers close on outside click and Escape. No dead buttons remain in the header.
5. **Search deep-link seeding (T-104 support)** — `src/routes/_protected/finance/search.tsx` reads `?q=` via `useSearchParams` and syncs the local query state, so header search results are truthful end-to-end.
6. **Dashboard density (T-105, U7)** — `src/routes/_protected/dashboard.tsx` adds "Needs Attention" (top 5 below-par stock via `v_inventory_summary` ordered by `current_quantity`, `stockStatus()` filtered client-side because the mock builder has no `.lt()`) and "Recent Activity" (last 5 movements) in a `lg:grid-cols-2` band with loading skeletons, honest error branches, empty states and footer `Link`s. Movement direction/sign/colors derive from the unit-tested `movementQuantityDisplay()` helper (single source of truth for received-positive/released-stored-positive semantics), and all new in-page navigation uses router `Link` so the memory-only demo session survives clicks. Zero new network patterns — both reuse existing hooks/queries.
7. **Token fidelity (T-106/T-107, U8)** — header avatar gradient replaced with `bg-primary-600`; all new classes come from the `docs/DESIGN.md` token tables (gray/primary/semantic scales, existing radii and spacing rhythm); no new colors, fonts, or dependencies were introduced.

## Design system adherence (docs/DESIGN.md — source of truth)

- **Color tokens**: `primary-600 #2563EB` actions/avatar, semantic `success/warning/error` 50–700 scales for status, gray layers for surfaces; sidebar keeps the established dark-surface pattern. Focus rings standardized on `primary-500`.
- **Typography**: Inter only; `text-xs` meta, `text-sm` controls/tables, `text-2xl` page titles — unchanged from spec §2.
- **Spacing/radii**: 4/8px rhythm (`gap-1/2/4`, `px-3 py-2`, `mb-4`), `rounded-sm` controls, drawer/sidebar transition 200ms per motion note.
- **Components**: only existing primitives (`Table`, `Badge`, `Input`, `Button`, `Pagination`, `PageContainer`, `PageTabs`, `Modal`) — anti-slop: no inline styles, no one-off markup, no new palette classes (U8 diff grep clean).

## Accessibility (WCAG AA target, DESIGN.md §8)

Focus indicator now ≥2px `primary-500` ring on every interactive control, verified by real keyboard-Tab focus in the acceptance harness (`:focus-visible` computed box-shadow ≠ none). Drawer is Escape-dismissible with focus return to the trigger; menu button, bell and search are aria-labelled; popover dismissal on outside click; contrast of new elements uses the already-audited token pairs (primary-600/white 5.17:1, gray-700/gray-50). Breadcrumb semantics are nav + ordered list.

## Responsive and performance notes (G17)

Three-viewport evidence at 375×812, 768×1024 and 1280×800 (screenshots in `prime/evidence/ui-audit/shots2/`): zero page-level horizontal overflow on inventory, reports and users pages; drawer/dock switch at `lg`; collapse gap measured 0px; closed drawer is `visibility: hidden` so off-canvas links are not tab stops. Performance: no new dependencies or bundles; bell reads the shared TanStack `['dashboard']` cache (no extra request); dashboard additions reuse `useInventoryMovements({ page: 0 })` and a single summary select bounded to the 20-row first page — no per-row queries. All internal navigation on new surfaces uses react-router `Link` (full-page `<a>` reloads wiped the memory-only demo session — closed in review round 1, verified by in-app click probes). Build warning (500kB chunk) is pre-existing reports-bundle size, out of scope. SEO not applicable — authenticated internal SPA.

## Input validation and API/authorization posture (G18)

No new data-access surface: every query goes through the existing parameterized hooks (`useProducts`, `useDashboardSummary`, `useInventoryMovements`, `v_inventory_summary` select). Search term crosses a URL boundary — it is encoded with `encodeURIComponent` before navigation and constrained by the existing `sanitizeSearchTerm` on the receiving page. Route authorization unchanged: admin-only user management stays inside `ProtectedLayout requireAdmin` → `AdminRoute`; all touched routes remain under the authenticated shell.

## Error handling (G26, G27)

Both new dashboard queries expose `isError` and render an explicit failure message ("Could not load stock levels." / "Could not load recent movements.") instead of collapsing an error into a false empty state (closed in review round 1). Query/mutation errors elsewhere surface as banners via `handleSupabaseError`; no empty catch blocks introduced. Fallback data path: if overdue inputs are missing the bell renders the "All clear." empty state rather than a fabricated count (risk R2 mitigation executed as designed). App-level error boundary (`ErrorBoundary`) unchanged; no ad-hoc logging added and no logging framework introduced — the client dashboard keeps its current console-level diagnostics posture, with structured error telemetry (Sentry-class) already recorded as a production follow-up, not a gate item for this increment.

## Secrets hygiene (G25)

Manual secret scan of the increment diff: no hardcoded keys, tokens or credentials; `grep -iE "api[_-]?key|secret|token|password|cfk_"` over the diff matched documentation vocabulary only. `.env*` untouched and git-ignored; runtime behavior still driven by `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` and `VITE_DEMO`.

## Verification summary

`npm test` 24/24 · `tsc --noEmit` clean · `vite build` success · acceptance harness 19/19 (`prime/evidence/ui-audit/reaudit-results.json` covering U1×4, U2×5, U3, U4×2, U5×3, U6, U7, U8 + settings banner). Two harness defects found and fixed during this phase (session-resetting `goto` → in-app nav; programmatic `.focus()` not triggering `:focus-visible` → keyboard-Tab driving; vacuous bell assertion → popover-scoped click-diff), and review round 1 findings closed — see phase-5-quality-review.md re-verification section.

## Cross-references (G22)

`docs/PRD.md` §Increment v1.2 (U1–U8), `docs/PRP.md` §11 (T-101…T-107, risks R1–R3), `prime/reports/phase-4-plan.md`, `prime/evidence/ui-audit/audit-findings.json` (UX-1…UX-8), `prime/evidence/ui-audit/reaudit.py` + `reaudit-results.json` + `shots2/`, `prime/evidence/ui-audit/design-system-recommendation.md`, `prime/reports/phase-5-security-testing.md`, `prime/reports/phase-5-test-results.json`, `prime/reports/phase-5-quality-review.md`, `prime/reports/output-intent.json`. Representative sample — focus-ring driving in the harness:

```python
pg.keyboard.press("Tab")
for _ in range(12):
    if pg.evaluate("document.activeElement.getAttribute('aria-label')") == "Search records":
        break
    pg.keyboard.press("Tab")
shadow = pg.evaluate("getComputedStyle(document.activeElement).boxShadow")
```

## Interface/version notes (G23)

All changes are internal component behavior with props added to `Sidebar`/`ProtectedLayout` in-repo; no published package, no external consumers, no breaking-change exposure.
