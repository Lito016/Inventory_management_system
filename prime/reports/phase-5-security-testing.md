# Phase 5 Security Testing — UI/UX Enhancement (ASVS L2 posture)

Scope: `src/App.tsx`, `src/components/layout/{Header,Sidebar,PageTabs}.tsx`, `src/components/ui/{Table,Button,Input,Select}.tsx`, `src/routes/_protected/dashboard.tsx`, `src/routes/_protected/finance/search.tsx`. This increment added no backend endpoints, edge functions, dependencies, or storage paths — the audit targets client behavior against the existing Supabase (BaaS) security model and the phase-4 threat model.

## Patterns checked and controls implemented

1. **Injection (V5)**: no new query surface. Dashboard additions use existing parameterized hooks (`useInventorySummary`-equivalent select on `v_inventory_summary`, `useInventoryMovements` order/range) — no string-concatenated filter grammar introduced. The one cross-boundary value (header search term → URL) is emitted with `encodeURIComponent` and sanitized through `sanitizeSearchTerm` (strips PostgREST reserved `, ( )` and ILIKE wildcards `% _`) inside the receiving page's `queryFn` before reaching `.or(...)` on both receivable and payable branches. All data access remains parameterized PostgREST builders; no raw SQL. (Review round 1 caught this sanitizer as claimed-but-absent on `finance/search.tsx`; it has since been applied and re-verified in the diff — sanitization now genuinely covers the seeded `?q=` term.)
2. **XSS / output encoding (V5)**: every new render path (breadcrumb items, popover labels, overdue count, needs-attention rows, recent activity) is React JSX text interpolation — React auto-escaping; the diff contains no `dangerouslySetInnerHTML`, `innerHTML`, or `eval` sinks. Search input from `?q=` is placed into component state, never into markup or a URL fragment constructed by string concatenation beyond the router's own navigation.
3. **Authorization / authn (V4/V6, ASVS V6)**: route guards unchanged — all touched routes remain under `_protected`; admin-only user management now sits in the single consolidated `<ProtectedLayout requireAdmin>` shell (the previously duplicated ad-hoc shell is gone, which *removes* a drift risk where a shell could omit guard-relevant chrome). Session/JWT handling still delegated entirely to supabase-js; demo-mode mock session is memory-only and build-time gated by `VITE_DEMO`.
4. **Sensitive data / secrets (V6)**: secret scan of the increment diff (`api[_-]?key|secret|token|password|cfk_|eyJ`) matched documentation vocabulary only — no hardcoded keys, tokens or connection strings; env usage unchanged (`VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`, anon key is the public browser token by design). No secret values logged; the bell badge shows an aggregate count, not customer-identifying data, on an auth-gated page.
5. **Supply chain (V8)**: zero new packages; lockfile untouched. Dependency risk unchanged.
6. **CORS / CSP / CSRF (V14 area of V3)**: no new origins, inline scripts, or storage paths; same Supabase REST/HTTPS posture; CSRF posture inherited from token-in-header auth (no ambient cookie trust).
7. **Click-jacking / dead affordance abuse**: header search and bell were previously dead controls (audit UX-5); they now perform real, honest navigations within the authenticated app — no external targets, no spoofable actions.
8. **Client-side filtering note**: the dashboard "Needs Attention" list filters `stockStatus()` client-side because the mock builder lacks `.lt()`; this is display-only convenience on data the user may already read in full on the Summary page — no access-control decision is made client-side (real enforcement stays in RLS).

## Static analysis performed

- Manual adversarial read of the full increment diff against SECURITY-AUDIT vocabulary (above).
- Grep sweep of the diff for forbidden sinks: `dangerouslySetInnerHTML`, `innerHTML`, `eval(`, secret-shaped literals — none present.
- `tsc --noEmit` as first-line defect filter: 0 errors.

## Verdict

No critical or major security findings open for this increment. Controls verified: parameterized-only data access, encoded cross-boundary input, auto-escaped rendering, unchanged server-side authorization posture, improved (consolidated) admin shell guarding, clean secret and supply-chain scans. Residual risks are the previously accepted ones from the module threat model (concurrent-adjustment race; production telemetry), untouched by this UI change.
