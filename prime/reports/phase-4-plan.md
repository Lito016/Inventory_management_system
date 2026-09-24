# Phase 4 — Plan: UI/UX Enhancement (v1.2)

**Run:** `ims-uiux-enhance` · **Owner role:** prime-instruct · **Date:** 2026-09-24

## Specification decisions

1. **Shell strategy (U1/U3):** single `ProtectedLayout` owns sidebar state (`open` drawer <lg, `collapsed` rail ≥lg) instead of Sidebar-local state — this is what fixes the dead-gap defect (UX-3) structurally rather than by patching a margin constant. The duplicated inline shell for `/settings/users` (`App.tsx:105–119`, which also lacks `DemoBanner`) is consolidated into `ProtectedLayout` with `AdminRoute` nested inside, so there is exactly one shell in the app. Drawer uses translate + overlay, not unmount, so nav links keep focus behavior identical on desktop.
2. **Breakpoint choice:** `lg` (1024px) as the drawer/desktop boundary — tablet (768) gets the drawer; this matches the audit evidence (overflow at 768) and DESIGN.md layout §3 density intent.
3. **Table containment (U2):** fix in the shared `Table.tsx` wrapper (`overflow-x-auto`) so all consumers inherit; page-level custom grids only patched where the audit flagged overflow (inventory/reports/users).
4. **Focus approach (U4):** Tailwind `focus-visible:ring-2` with `ring-primary-500` token — keyboard-only focus, no mouse-click rings; applied at primitive level (Button/Input/Select) plus icon buttons in Header/Sidebar/login cards.
5. **Honest affordances (U5):** search becomes a popover that submits to `/finance/search?q=` (page seeds from `useSearchParams`); bell becomes a real counts popover (low-stock + overdue from existing mock-backed view queries) rather than removal — demo data supports it (`mock-client.ts` supports `.or`/ilike; `useDashboardSummary` already returns overdueCount).
6. **Title de-duplication (U6):** Header drops the last breadcrumb crumb (module context remains); content H1 is the single title.
7. **Dashboard density (U7):** two compact sections under Modules — "Needs Attention" (low/out-of-stock from `v_inventory_summary`) and "Recent Activity" (last 5 movements) — reusing existing queries; no new endpoints.
8. **Token discipline (U8):** no new palette; slate sidebar surface is grandfathered (declared in PRD v1.2); all new UI uses gray-*/primary-*/semantic tokens.

## Ordering and verification

T-101 → T-107 in dependency order (shell before header features; primitives before page tweaks); full ordered table with effort estimates, risks, rollback in `docs/PRP.md` §11. Phase 6 re-runs `prime/evidence/ui-audit/audit.py` (extended with drawer/focus probes) as the done-check.

## Autopilot checkpoints

After T-101/T-102 (shell+tables render at 3 viewports) and after T-104/T-106 (header/dashboard features) — recorded in checkpoint review artifact.
