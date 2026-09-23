# Phase 5 Security Testing — Inventory Module (ASVS L2 posture)

Scope: `src/lib/inventory.ts`, `src/routes/_protected/inventory/{products,summary,adjustments}.tsx`, `src/routes/_protected/reports/index.tsx`, consumed migrations 007/008/010, threat model `prime/reports/threat-model.md`. This increment added no new backend endpoints, edge functions, or dependencies — the audit targets client/data-access behavior against the existing Supabase (BaaS) security model.

## Threat-model traceability

Each finding maps to the phase-4 threat model entries (T1–T6). Verification method: static review of the diff plus executed tests; RLS facts re-read from `supabase/migrations/20260826000010_rls_policies.sql`.

## Patterns checked and controls implemented

1. **Injection — filter-grammar abuse (T-search)**: user search terms are interpolated into PostgREST `or(name.ilike.%term%,category.ilike.%term%)`. Risk: `,`/`(` /`)` break the filter grammar (400 request failure, potential filter logic alteration); `%`/`_` are ILIKE wildcards enabling loose matching. Control: `sanitizeSearchTerm` strips `, ( ) % _` before the term reaches any query builder. All other data access uses parameterized PostgREST builders (`.eq`, `.range`), never raw SQL — no SQL injection surface from the client. Regression test: `tests/inventory-logic.test.ts` (reserved chars and wildcards stripped).
2. **Input validation (T-adjust)**: adjustment quantity must parse to a finite, non-zero number at NUMERIC(15,2) scale — `parseAdjustmentQuantity` rejects NaN, Infinity, empty, zero, and sub-scale values (e.g. `0.0001`) that would round to a zero-quantity movement. Reason is mandatory and length-capped (500, matching column constraints); date required. Server-side checks in migration 007 (`movement_type` CHECK, `NUMERIC(15,2)`) provide defense in depth if a crafted REST insert bypasses the UI.
3. **Authorization / authn — RLS (T1, T2, T3)**: `created_by` is taken from the authenticated session user (`useAuth().user.id`), never from form input. RLS verified in `20260826000010_rls_policies.sql:141-143`: `inventory_movements` SELECT/INSERT/UPDATE for `authenticated`; DELETE has no policy → denied by default. JWT/session handling is delegated to supabase-js (`persistSession`, `autoRefreshToken`); anon key is the public browser token by design. No RBAC bypass was introduced: all three routes live under `_protected` (auth-gated layout).
4. **Data integrity — negative stock (T-adjust-neg)**: stock decrement is validated client-side against the live `v_inventory_summary` row for the *selected* product (query keyed to the watched `product_id`, save is fail-closed while the lookup is pending), and negative projections require explicit ConfirmDialog acknowledgement. Residual accepted risk (documented in threat model): a race between summary read and insert is possible under concurrent operators — mitigated by audit trail (`created_by`, `movement_date`, signed quantity), acceptable for a stock adjustment tool without reserved inventory semantics.
5. **XSS / output encoding (T-notes)**: all rendering goes through React JSX text interpolation (`{r.notes}`, `{stock.name}`); React auto-escapes — no `dangerouslySetInnerHTML`, no `eval`, no raw innerHTML sinks in the diff. Stored free-text (reason/notes) displays encoded.
6. **Secrets / credentials**: secret scan of the diff — no hardcoded API keys, tokens, or connection strings. Only `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (dotenv, git-ignored `.env.local`, placeholder-safe fallback to mock). No secret values logged; the prototype banner logs only a mode flag, not credentials.
7. **Supply chain / dependency audit**: no new packages added in this increment (react-hook-form, @tanstack/react-query, @supabase/supabase-js, lucide-react all pre-existing). Dependency risk unchanged; `pnpm install` reused existing lockfile.
8. **CORS / CSP / CSRF**: no self-hosted API; same-origin-anonymous access to Supabase REST over HTTPS with the anon JWT — CSRF posture inherited from token-in-header auth (no ambient cookie trust for REST writes). No CSP changes made or required by the diff (no new inline scripts, external origins, or storage paths).
9. **Rate limiting / DoS**: client debounce (150 ms) and server-side pagination bound request and payload size. PostgREST request-rate limits are platform-managed (Supabase); no edge functions added, so no new callable to secure.

## Static analysis performed

- Manual adversarial read of every touched file against SECURITY-AUDIT vocabulary (above).
- Grep sweep of the diff for forbidden sinks: `dangerouslySetInnerHTML`, `innerHTML`, `eval(`, `console.log` of env values — none present.
- Compile-time type checking as a first-line defect filter: `tsc --noEmit` 0 errors.

## Verdict

No critical or major security findings open. Controls for every threat-model entry are implemented and evidenced (tests + migrations citations above). One residual race-condition risk is accepted and documented; production hardening (server-side adjustment RPC with row locking, structured error telemetry) is recorded as follow-up, not a gate blocker for this increment.
