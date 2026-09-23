# Risk Assessment — Inventory Management System

> **Version:** 1.0 | **Date:** 2026-08-26 | **Status:** Approved for Build
> **Assessment Date:** 2026-08-26
> **Next Review:** After Sprint 2 (Finance module complete)

---

## 1. Risk Matrix Overview

| Severity | Likelihood | Risk Level | Action Required |
|---|---|---|---|
| High | High | **Critical** | Must mitigate before deployment |
| High | Medium | **High** | Must mitigate before deployment |
| High | Low | **Medium** | Mitigation plan required |
| Medium | Medium | **Medium** | Mitigation plan required |
| Medium | Low | **Low** | Monitor and prepare contingency |
| Low | Any | **Low** | Accept and monitor |

---

## 2. Technical Risks

### TR-01: Supabase Free Tier Database Limit (500 MB)

| Attribute | Value |
|---|---|
| **Severity** | Medium |
| **Likelihood** | Low |
| **Risk Level** | Low |
| **Category** | Infrastructure |

**Description:** The Supabase free tier provides 500 MB of database storage. As the business grows, accumulated transaction data (receivables, payables, payments, inventory movements, historical records) could approach this limit.

**Impact:** If the limit is reached, all write operations fail. Users cannot create new records until space is freed or the plan is upgraded.

**Mitigation:**
1. Monitor database size via Supabase dashboard (set alert at 400 MB)
2. Typical row size for this schema is ~500 bytes; 500 MB supports ~1 million rows — far exceeding small business needs for years
3. Upgrade path to Supabase Pro ($25/month) provides 8 GB storage
4. Archive strategy: old completed/voided records can be exported and removed if needed

**Residual Risk:** Very low. A small business with 2-10 users will likely never exceed 500 MB.

---

### TR-02: Supabase Platform Downtime

| Attribute | Value |
|---|---|
| **Severity** | High |
| **Likelihood** | Medium |
| **Risk Level** | Medium |
| **Category** | Infrastructure |

**Description:** The free tier has no SLA. Supabase outages (planned or unplanned) would make the system completely unavailable since there is no fallback backend.

**Impact:** Complete system unavailability. No access to any data. Business operations that depend on the system would be blocked.

**Mitigation:**
1. Supabase has good uptime history (~99.9% in practice)
2. Business hours are 6 AM – 10 PM PHT, Mon-Sat — schedule maintenance windows outside these hours
3. For critical periods, maintain a manual fallback process (paper receipts) that can be entered later
4. Supabase provides status page (status.supabase.com) for monitoring
5. Upgrade to Pro tier ($25/month) provides 99.9% SLA if needed in the future

**Residual Risk:** Medium. Acceptable for a small business with manual fallback capability.

---

### TR-03: Database Trigger Complexity and Debugging

| Attribute | Value |
|---|---|
| **Severity** | Medium |
| **Likelihood** | Medium |
| **Risk Level** | Medium |
| **Category** | Development |

**Description:** The architecture relies on 16 database triggers for critical business logic (auto-creating receivables/payables, updating inventory, recalculating statuses). Trigger bugs are harder to debug than application code because they execute silently in the database.

**Impact:** Silent data corruption if triggers have bugs. For example, a trigger that fails to create a receivable when a fulfillment is completed would result in lost revenue tracking.

**Mitigation:**
1. All trigger functions are documented in `data-model.md` with clear logic
2. Write comprehensive unit tests for each trigger using Supabase CLI local development (`supabase start`)
3. Test scenarios:
   - Fulfillment completed → verify receivable created with correct amount
   - PO fully received → verify payable created
   - Payment inserted → verify status updated
   - Payment voided → verify status recalculated
   - Receiving saved → verify inventory movements created
4. Add `RAISE NOTICE` logging in triggers during development for debugging
5. Use database transactions — if a trigger fails, the entire transaction rolls back
6. Consider adding an audit log table that records all trigger actions for traceability

**Residual Risk:** Low with proper testing. Triggers are well-documented and testable.

---

### TR-04: Browser Compatibility Issues

| Attribute | Value |
|---|---|
| **Severity** | Low |
| **Likelihood** | Low |
| **Risk Level** | Low |
| **Category** | Frontend |

**Description:** The system must work on the latest 2 versions of Chrome, Edge, and Firefox. React + TypeScript + Tailwind CSS generally have excellent cross-browser support, but edge cases may exist.

**Impact:** UI rendering issues or JavaScript errors on specific browser versions.

**Mitigation:**
1. React and Tailwind CSS have excellent cross-browser support
2. Use Vite's built-in browser compatibility (targets modern browsers by default)
3. Test on all three browsers during each sprint review
4. Use CSS `autoprefixer` (included in Tailwind) for vendor prefixes
5. Avoid bleeding-edge APIs; use established web standards

**Residual Risk:** Very low. Standard web technologies with mature browser support.

---

### TR-05: TanStack Query Cache Staleness

| Attribute | Value |
|---|---|
| **Severity** | Medium |
| **Likelihood** | Low |
| **Risk Level** | Low |
| **Category** | Frontend |

**Description:** TanStack Query caches data client-side. If cache invalidation is not properly configured after mutations, users may see stale data (e.g., outdated balance after a payment is recorded).

**Impact:** Users may make decisions based on outdated information. Financial data accuracy is critical.

**Mitigation:**
1. All mutations use `onSettled` to invalidate related queries (receivables, payables, payments, dashboard)
2. `staleTime` set to 30 seconds — prevents excessive refetches but ensures relatively fresh data
3. `refetchOnWindowFocus: true` — refreshes data when user switches back to the tab
4. Critical pages (Finance dashboard) can use shorter `staleTime` (10 seconds)
5. Manual refresh button available on all list pages

**Residual Risk:** Very low. TanStack Query's invalidation patterns are well-established.

---

### TR-06: Supabase Free Tier Edge Function Limits

| Attribute | Value |
|---|---|
| **Severity** | Low |
| **Likelihood** | Low |
| **Risk Level** | Low |
| **Category** | Infrastructure |

**Description:** Supabase free tier includes 500K Edge Function invocations/month. The `create-user` function is called infrequently (only when admin creates a new user).

**Impact:** If the limit is reached, the Edge Function would fail. However, user creation is rare (2-10 users total).

**Mitigation:**
1. 500K invocations/month far exceeds the need (admin creates users maybe 10 times total)
2. Monitor usage in Supabase dashboard
3. The only Edge Function (`create-user`) is called at most a few times per month

**Residual Risk:** Negligible.

---

## 3. Business Risks

### BR-01: Data Migration from Manual Processes

| Attribute | Value |
|---|---|
| **Severity** | Medium |
| **Likelihood** | Medium |
| **Risk Level** | Medium |
| **Category** | Data |

**Description:** The business currently uses paper receipts and manual spreadsheets. Migrating existing data (customer/supplier records, outstanding balances, historical debts, inventory counts) into the system requires careful data preparation and validation.

**Impact:** Incorrect initial data would lead to wrong balance calculations, undermining trust in the system.

**Mitigation:**
1. Provide CSV import templates for customers, suppliers, products, and historical debts
2. Create a data validation script that checks for:
   - Duplicate names
   - Missing required fields
   - Invalid amounts (negative, non-numeric)
   - Orphaned references
3. Phased migration:
   - Phase 1: Import master data (customers, suppliers, products)
   - Phase 2: Import historical debts with verification status
   - Phase 3: Import open receivables/payables (outstanding balances)
   - Phase 4: Import inventory counts
4. Run parallel manual process for 1-2 weeks to validate system calculations against manual calculations
5. Designate a data migration owner (business owner) responsible for data accuracy

**Residual Risk:** Low with proper planning and validation.

---

### BR-02: User Adoption Resistance

| Attribute | Value |
|---|---|
| **Severity** | Medium |
| **Likelihood** | Medium |
| **Risk Level** | Medium |
| **Category** | Organizational |

**Description:** Staff accustomed to manual processes may resist adopting the new system. The business has 2-10 users with varying technical proficiency.

**Impact:** Low adoption rates would result in incomplete data entry, undermining the system's value.

**Mitigation:**
1. Design intuitive UI with clear workflows (forms with inline validation, status badges, guided processes)
2. Keep the system simple — no unnecessary features or complex navigation
3. Provide brief orientation session (target: < 15 minutes to learn core workflows per NFR success metric)
4. Start with Finance module (highest value) to demonstrate immediate benefit
5. Show side-by-side comparison: manual calculation vs. system calculation to build trust
6. Admin can monitor adoption via user activity

**Residual Risk:** Low. The system solves real pain points (manual calculations) which motivates adoption.

---

### BR-03: Financial Calculation Accuracy

| Attribute | Value |
|---|---|
| **Severity** | High |
| **Likelihood** | Low |
| **Risk Level** | Medium |
| **Category** | Data Integrity |

**Description:** The system's core value proposition is accurate financial calculations. Any error in balance computation, overdue detection, or variance calculation would undermine trust and could cause financial harm.

**Impact:** Incorrect balances could lead to wrong collections, missed overdue accounts, or incorrect payments.

**Mitigation:**
1. All monetary fields use `NUMERIC(15,2)` — no floating-point arithmetic
2. Balance calculations performed in PostgreSQL (exact decimal arithmetic) — never in JavaScript
3. Views (`v_receivables`, `v_payables`) compute balances from source data — no mutable balance fields
4. Comprehensive test suite:
   - Test balance calculation with known values (e.g., ₱50,000 - ₱20,000 = ₱30,000.00)
   - Test edge cases: zero payments, overpayment, voided payments
   - Test floating-point problem values (0.1 + 0.2 should be 0.30, not 0.30000000000000004)
5. Manual verification: compare system calculations against spreadsheet for 10 test scenarios (per success metric)
6. Database constraints prevent invalid data (CHECK constraints on amounts > 0)

**Residual Risk:** Very low. NUMERIC type + PostgreSQL arithmetic + comprehensive testing.

---

### BR-04: Single Point of Failure (No Offline Capability)

| Attribute | Value |
|---|---|
| **Severity** | Medium |
| **Likelihood** | Low |
| **Risk Level** | Low |
| **Category** | Availability |

**Description:** The system requires internet connectivity. If the internet goes down, no access to the system.

**Impact:** Business operations that depend on the system would be blocked during internet outages.

**Mitigation:**
1. System is explicitly out of scope for offline mode (per PRD Section 10)
2. Maintain manual fallback process (paper receipts) during outages
3. Data can be entered retroactively when connectivity is restored
4. Cloudflare Pages provides global CDN — resilient to regional outages
5. Supabase has multiple availability zones

**Residual Risk:** Low. Internet dependency is acceptable for this business context.

---

## 4. Security Risks

### SR-01: RLS Misconfiguration

| Attribute | Value |
|---|---|
| **Severity** | High |
| **Likelihood** | Medium |
| **Risk Level** | High |
| **Category** | Security |

**Description:** Row Level Security is the ONLY authorization mechanism. If RLS policies are misconfigured (e.g., missing policy on a table, overly permissive policy), unauthorized access could occur. This is the single most critical security risk.

**Impact:** Data leak (staff accessing admin-only data), unauthorized data modification, or financial data exposure.

**Mitigation:**
1. **Pre-deployment audit:** Query `pg_policies` to verify every table has at least one RLS policy
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
   FROM pg_policies
   ORDER BY tablename;
   ```
2. **Verify no table is missing RLS:**
   ```sql
   SELECT n.nspname AS schema, c.relname AS table
   FROM pg_class c
   JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE c.relkind = 'r' AND n.nspname = 'public'
     AND NOT c.relrowsecurity;
   -- Should return zero rows
   ```
3. **Test with both roles:** Create test admin and staff accounts; verify each can only perform allowed actions
4. **Payment voiding:** Explicitly test that staff CANNOT void payments (RLS WITH CHECK blocks it)
5. **User management:** Verify staff CANNOT access profiles table (except own row)
6. **Code review:** All RLS policies reviewed by a second person before deployment
7. **Automated test:** Include RLS verification in CI/CD pipeline

**Residual Risk:** Medium. Mitigated by systematic audit and testing, but requires vigilance.

---

### SR-02: Client-Side API Key Exposure

| Attribute | Value |
|---|---|
| **Severity** | Medium |
| **Likelihood** | High |
| **Risk Level** | Low |
| **Category** | Security |

**Description:** The Supabase `anon` key is embedded in the client-side JavaScript bundle. This is by design — the anon key is intended to be public. However, developers might accidentally expose the `service_role` key.

**Impact:** If `service_role` key is exposed, anyone could bypass RLS and access/modify all data.

**Mitigation:**
1. Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are in the client bundle
2. `service_role` key is ONLY used in Edge Functions (server-side)
3. Pre-deployment check: scan built JavaScript bundle for `service_role` string
   ```bash
   grep -r "service_role" dist/
   # Should return zero matches
   ```
4. Environment variable naming convention: `VITE_` prefix = safe for client; no prefix = server-only
5. Never commit `.env` files to version control (add to `.gitignore`)
6. Rotate keys immediately if `service_role` is ever exposed

**Residual Risk:** Very low. Standard Supabase security pattern with clear safeguards.

---

### SR-03: Cross-Site Scripting (XSS)

| Attribute | Value |
|---|---|
| **Severity** | Medium |
| **Likelihood** | Low |
| **Risk Level** | Low |
| **Category** | Security |

**Description:** If user-supplied text (customer names, notes, variance reasons, descriptions) is rendered without proper escaping, it could execute malicious JavaScript.

**Impact:** Session hijacking, data theft, or unauthorized actions performed on behalf of the user.

**Mitigation:**
1. React auto-escapes all values rendered in JSX — `{variable}` is safe
2. NEVER use `dangerouslySetInnerHTML` — if needed, sanitize with DOMPurify first
3. Content Security Policy (CSP) headers via Cloudflare Pages configuration:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
   ```
4. Input validation: limit text field lengths (500 chars for notes, 255 for source references)
5. Supabase REST API returns data as JSON — no HTML rendering on the server side

**Residual Risk:** Very low. React's default escaping + CSP headers provide strong protection.

---

### SR-04: Privilege Escalation (Staff Accessing Admin Features)

| Attribute | Value |
|---|---|
| **Severity** | High |
| **Likelihood** | Low |
| **Risk Level** | Medium |
| **Category** | Security |

**Description:** A staff user might attempt to access admin-only features (user management, payment voiding) by directly calling API endpoints or manipulating the frontend.

**Impact:** Unauthorized user creation, unauthorized payment voiding, role manipulation.

**Mitigation:**
1. **Three layers of defense:**
   - **Database (RLS):** Authoritative enforcement — staff physically cannot void payments or access user management data
   - **Route guards:** Frontend redirects staff away from admin routes
   - **UI hiding:** Admin-only buttons/menus not rendered for staff
2. **Role stored server-side:** Role is in the `profiles` table, not in the JWT — cannot be spoofed client-side
3. **`get_user_role()` function:** Uses `SECURITY DEFINER` — reads role from database, not from client-provided data
4. **Test:** Attempt admin operations with staff credentials via API client (Postman/curl) — verify 403 responses

**Residual Risk:** Low. RLS provides bulletproof enforcement at the database level.

---

### SR-05: SQL Injection

| Attribute | Value |
|---|---|
| **Severity** | High |
| **Likelihood** | Very Low |
| **Risk Level** | Low |
| **Category** | Security |

**Description:** If user input is interpolated directly into SQL queries, it could allow SQL injection attacks.

**Impact:** Data theft, data modification, or complete database compromise.

**Mitigation:**
1. Supabase client uses parameterized queries for ALL operations — no raw SQL from client
2. PostgreSQL trigger functions use `EXECUTE format()` with `%I` (identifier) placeholders — safe from injection
3. RPC functions use typed parameters — PostgreSQL handles escaping
4. No `supabase.from('table').select().filter('column @> ' + userInput)` patterns — always use parameter binding
5. Code review checklist: flag any string concatenation in database queries

**Residual Risk:** Very low. Supabase client library is designed to prevent SQL injection.

---

### SR-06: Session Hijacking / Token Theft

| Attribute | Value |
|---|---|
| **Severity** | High |
| **Likelihood** | Very Low |
| **Risk Level** | Low |
| **Category** | Security |

**Description:** If an attacker obtains a user's JWT access token, they could impersonate that user.

**Impact:** Unauthorized access to all data the user can access.

**Mitigation:**
1. All communication over HTTPS (enforced by Cloudflare and Supabase)
2. JWT access tokens have short expiry (1 hour default)
3. Refresh token rotation — each refresh invalidates the previous refresh token
4. 30-min inactivity timeout clears tokens from memory
5. Tokens stored in `localStorage` — not vulnerable to CSRF (not sent with cross-origin requests)
6. CSP headers prevent XSS (primary vector for token theft)

**Residual Risk:** Very low. Standard JWT security with short expiry and HTTPS enforcement.

---

## 5. Dependency Risks

### DR-01: Supabase Platform Dependency

| Attribute | Value |
|---|---|
| **Severity** | High |
| **Likelihood** | Low |
| **Risk Level** | Medium |
| **Category** | Vendor Lock-in |

**Description:** The entire backend is Supabase. If Supabase shuts down, changes pricing, or degrades service, the system would need to migrate to a new backend.

**Impact:** Complete system unavailability or costly migration.

**Mitigation:**
1. Supabase is open-source (can self-host if needed)
2. All data is in standard PostgreSQL — portable to any PostgreSQL host
3. Database schema uses standard SQL — no vendor-specific features (except RLS, which PostgreSQL supports natively)
4. Edge Functions use Deno — portable to any Deno host
5. Regular database backups (Supabase provides automated backups on Pro tier)
6. Export schema + data monthly as backup

**Residual Risk:** Low. PostgreSQL portability provides strong exit strategy.

---

### DR-02: Cloudflare Pages Dependency

| Attribute | Value |
|---|---|
| **Severity** | Low |
| **Likelihood** | Very Low |
| **Risk Level** | Low |
| **Category** | Vendor Lock-in |

**Description:** The frontend is hosted on Cloudflare Pages. If Cloudflare changes pricing or shuts down, the static SPA would need to be re-hosted.

**Impact:** Brief downtime during migration.

**Mitigation:**
1. The build output is a standard static SPA (HTML/CSS/JS) — can be hosted anywhere
2. Migration to Netlify, Vercel, GitHub Pages, or any static host takes < 1 hour
3. No Cloudflare-specific features used (no Workers, no edge-side rendering)

**Residual Risk:** Negligible. Static SPAs are fully portable.

---

### DR-03: React/TypeScript Ecosystem Changes

| Attribute | Value |
|---|---|
| **Severity** | Low |
| **Likelihood** | Low |
| **Risk Level** | Low |
| **Category** | Technology |

**Description:** Major breaking changes in React, TypeScript, or key dependencies (TanStack Query, React Router) could require significant refactoring.

**Impact:** Development effort to upgrade dependencies.

**Mitigation:**
1. Pin dependency versions in `package.json` (no `^` for major versions)
2. Upgrade dependencies deliberately, not automatically
3. React, TypeScript, and TanStack Query have strong backward compatibility policies
4. Follow release notes and migration guides for major version upgrades

**Residual Risk:** Very low. Mature ecosystem with stable APIs.

---

## 6. Risk Summary Matrix

| ID | Risk | Severity | Likelihood | Level | Status |
|---|---|---|---|---|---|
| TR-01 | Supabase DB limit (500 MB) | Medium | Low | **Low** | Accept |
| TR-02 | Supabase platform downtime | High | Medium | **Medium** | Mitigate |
| TR-03 | DB trigger complexity | Medium | Medium | **Medium** | Mitigate |
| TR-04 | Browser compatibility | Low | Low | **Low** | Accept |
| TR-05 | TanStack Query cache staleness | Medium | Low | **Low** | Mitigate |
| TR-06 | Edge Function limits | Low | Low | **Low** | Accept |
| BR-01 | Data migration | Medium | Medium | **Medium** | Mitigate |
| BR-02 | User adoption resistance | Medium | Medium | **Medium** | Mitigate |
| BR-03 | Calculation accuracy | High | Low | **Medium** | Mitigate |
| BR-04 | No offline capability | Medium | Low | **Low** | Accept |
| SR-01 | RLS misconfiguration | High | Medium | **High** | **Must fix** |
| SR-02 | API key exposure | Medium | High | **Low** | Mitigate |
| SR-03 | XSS attacks | Medium | Low | **Low** | Mitigate |
| SR-04 | Privilege escalation | High | Low | **Medium** | Mitigate |
| SR-05 | SQL injection | High | Very Low | **Low** | Mitigate |
| SR-06 | Session hijacking | High | Very Low | **Low** | Mitigate |
| DR-01 | Supabase vendor lock-in | High | Low | **Medium** | Accept |
| DR-02 | Cloudflare dependency | Low | Very Low | **Low** | Accept |
| DR-03 | Ecosystem changes | Low | Low | **Low** | Accept |

---

## 7. Priority Actions (Before Deployment)

| Priority | Action | Risk Addressed | Owner |
|---|---|---|---|
| **P0** | Audit all RLS policies — verify every table has correct policies | SR-01 | Developer |
| **P0** | Test RLS with both admin and staff accounts via API | SR-01, SR-04 | Developer |
| **P0** | Test all trigger functions with comprehensive test scenarios | TR-03, BR-03 | Developer |
| **P0** | Verify balance calculations match manual computation for 10 test cases | BR-03 | Developer + Business Owner |
| **P1** | Scan production bundle for `service_role` key | SR-02 | Developer |
| **P1** | Configure CSP headers on Cloudflare Pages | SR-03 | Developer |
| **P1** | Set up Supabase dashboard alerts for DB size (400 MB threshold) | TR-01 | Developer |
| **P1** | Prepare data migration templates and validation scripts | BR-01 | Developer + Business Owner |
| **P2** | Conduct user orientation session | BR-02 | Business Owner |
| **P2** | Document manual fallback process for internet outages | BR-04 | Business Owner |

---

## 8. Monitoring Plan

| Metric | Tool | Threshold | Action |
|---|---|---|---|
| Database size | Supabase Dashboard | > 400 MB | Plan cleanup or upgrade |
| Edge Function invocations | Supabase Dashboard | > 400K/month | Monitor; upgrade if needed |
| Error rate | Browser console + user reports | > 5 errors/day | Investigate and fix |
| Uptime | status.supabase.com + manual | < 99.5% | Report to Supabase; activate fallback |
| Failed login attempts | Supabase Auth logs | > 10/day from same IP | Monitor for brute force |
| RLS violations | PostgreSQL logs | Any | Investigate immediately |
