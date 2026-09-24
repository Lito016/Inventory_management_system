# Phase 4 — Quality Review: Plan Packet (v1.2 UI/UX Enhancement)

**Run:** `ims-uiux-enhance` · **Reviewer:** prime-evaluate (independent) · **Revision:** re-review after M-1/M-2 corrections

verdict: pass

## Re-check of prior Majors

- **M-1 (duplicated shell outside ProtectedLayout) — RESOLVED.** `docs/PRP.md:894` T-101 now states in bold "Includes consolidating the duplicated shell at `App.tsx:105–119` (`/settings/users` reuses `ProtectedLayout` + `AdminRoute` as inner element — also fixes its missing `DemoBanner`)", and the verification column adds "/settings/users shows banner and drawer". `prime/reports/phase-4-plan.md:7` Decision 1 now records the consolidation ("exactly one shell in the app"). `prime/reports/phase-4-checkpoint-review.md:20` C6 documents the correction.
- **M-2 (C5 Esc focus-return absent from plan text) — RESOLVED.** `docs/PRP.md:894` T-101 task text: "Esc (focus returns to menu button)"; verification: "Esc closes drawer with focus on menu button". `phase-4-checkpoint-review.md:21` C7 records the propagation.

## Consolidation feasibility (independent verification)

Confirmed against source: `ProtectedLayout` (`src/App.tsx:36–51`) renders `{children}` inside `<main>` (`App.tsx:44–46`), already wrapped by `ProtectedRoute` (`:38`). `AdminRoute` (`src/components/layout/AdminRoute.tsx:8–16`) is a pure children pass-through (`<>{children}</>` at `:15`) or `<Navigate to="/dashboard" replace />` (`:12`). Nesting `<ProtectedLayout><AdminRoute><UsersPage /></AdminRoute></ProtectedLayout>` preserves the exact guard order (ProtectedRoute → AdminRoute) of the current inline shell (`App.tsx:105–119`), and the moved `DemoBanner` (`:42`) applies. No restructuring, no prop changes needed. Feasible as scoped.

## Regression check

Nothing new broke: traceability U1–U8 ↔ T-101…T-107 intact; scope guard holds (`docs/PRP.md:909–911`, no new deps, no dark theme/mobile redesign); estimates and rollback (`:902`, `:913–915`) unchanged; C1–C4 corrections still present in §11.

## Remaining Minors (do not block)

- **m-1:** No per-task "Depends on" column in §11 table; four tasks touch `Header.tsx` — serialization rests on the prose sentence (`phase-4-plan.md:18`).
- **m-2:** `Table.tsx:29` loading-skeleton container lacks the `overflow-x-auto` fix (fixed-width; low risk) — decide skip-or-wrap during T-102.
- **m-3:** Decision 3 over-scopes page-level patches (only `reports/index.tsx` renders a raw table; inventory/users inherit via shared `Table`).
- **n-1:** `mock-client.ts` cited without `src/lib/supabase/` directory prefix.
- **n-2:** T-103 "remove default outline suppression" — primitives already carry `focus:outline-none focus:ring-2`; word as focus→focus-visible upgrade to avoid double-apply.

## Execution recommendation

Proceed to Phase 5 in dependency order T-101 → T-107. T-101 now carries both the shell consolidation and the Esc focus-return probe; enforce its verification list (375/768 drawer, 1280 collapse gap <8px, /settings/users banner) at the first autopilot checkpoint (after T-101/T-102, `phase-4-plan.md:22`). Minors can be absorbed during execution. Confidence: high — both fixes verified directly in the artifacts and against source.
