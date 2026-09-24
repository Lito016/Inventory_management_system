# Demo Mode — Design

Date: 2026-09-24 · Status: approved by user ("yes proceed", "continue till it's done")

## Goal

Turn the existing published site into a shareable demo of the Inventory Management
System: visitors get a role-picker login (admin or staff), see a persistent DEMO
banner, and all data is in-memory mock data that resets on reload. The real-backend
development path must stay untouched.

## Approach (A — build-time flag)

A build-time environment flag `VITE_DEMO` switches the same codebase into demo mode.
No second project, no branch copies, no removal of the Supabase path.

## Changes

### 1. Flag & wiring
- `src/vite-env.d.ts`: declare `VITE_DEMO` (string env var).
- `src/lib/demo.ts` (new): export `isDemoMode(): boolean` — true when
  `import.meta.env.VITE_DEMO === 'true'`. Single source of truth for all branches.
- `.env.example`: document `VITE_DEMO=false`.
- `src/lib/supabase/mock-client.ts`: the module-level auto-login
  (`currentUser = ...admin`) runs only when `!isDemoMode()`. In demo mode the mock
  store still loads seed data but the session starts null.
- `src/lib/supabase/client.ts`: when `isDemoMode()`, use `mockSupabase` even if real
  Supabase credentials exist (prevents accidental exposure of the production backend
  through the public demo). Console info message notes demo mode.

### 2. Demo login (`src/routes/_auth/login.tsx`)
- When `isDemoMode()`: above the normal form, render two cards —
  **Admin** (`admin@ims.local`, "full access") and **Staff** (`staff@ims.local`,
  "restricted views/actions") — each with a Sign in button calling
  `supabase.auth.signInWithPassword({ email, password: 'demo' })` (mock accepts any
  password for known profile emails) and navigating to `/dashboard` on success,
  including the existing `is_active` profile check.
- Below the cards, a divider "or sign in manually" keeps the regular
  email/password form unchanged.
- Login card header gets a small amber "DEMO" badge when in demo mode.

### 3. Demo banner (`src/components/layout/DemoBanner.tsx`)
- Slim amber bar: "DEMO — sample data only. Edits reset when you reload the page."
- Rendered in `ProtectedLayout` (src/App.tsx) inside the content column, directly
  above `<Header />`. Not shown on auth pages (login badge covers those).

### 4. Site naming (existing user request)
- While republishing, rename the cloud project/site from "UBMS Inventory" to
  "Inventory Management System".

## Out of scope
- Data persistence across reloads, separate demo URL/site, offline package,
  scripted guided tours, changes to seed content.

## Error handling
- Sign-in via role buttons reuses existing error surface (`handleSupabaseError`
  pattern + error box). No new failure modes: mock auth cannot error beyond
  "unknown email" (pre-filled constants).

## Testing
- Unit (`tests/demo-mode.test.ts`): pure helper `demoFlagOn(value: string |
  undefined): boolean` exported from `src/lib/demo.ts`; `isDemoMode()` is a thin
  wrapper reading `import.meta.env.VITE_DEMO` (not unit-tested; browser-only and
  covered manually).
- Regression: existing 22 tests pass; `tsc --noEmit` clean; `vite build` succeeds
  with and without `VITE_DEMO=true`.
- Manual (preview build with flag): both role logins enter app as correct role,
  staff sees restricted actions, banner visible, sign-out returns to role picker,
  reload resets data.

## Deployment
- `vite build` with `VITE_DEMO=true`; publish to the existing site via Qoder Sites
  (same URL). User pre-authorized publication.
