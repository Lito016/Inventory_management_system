# UBMS Retrospective

## Project Summary

| Attribute | Value |
|---|---|
| **Project** | UBMS — Unified Business Management System |
| **Tier** | 1 — Moderate (Complexity Score: 8/21) |
| **Quality Mode** | Polish |
| **Tech Stack** | React 19 + TypeScript 5 → Supabase → Cloudflare Pages |
| **Total Phases** | 7/7 completed |

## Deliverables

| Category | Count | Details |
|---|---|---|
| Design Documents | 10 | PRD, Requirements Spec, Feature Matrix, Architecture, Data Model, API Contracts, Risk Assessment, Design System, PRP, Execution Plan |
| Source Files | 62 | 20 pages, 17 UI components, 10 hooks, 4 utility modules, 4 providers, 3 lib modules |
| Database | 20 tables, 5 views, 16 triggers | Full migration files in supabase/migrations/ |
| Quality Reviews | 3 | Phase 2 (requirements), Phase 3 (architecture), Phase 6 (code) |

## What Went Well

1. **Proposal was comprehensive** — The client's proposal document was detailed and well-structured, making requirements extraction straightforward
2. **Finance-first prioritization** — Clear priority enabled focused Sprint 2 delivery of the highest-value module
3. **Quality review caught critical issues** — Phase 2 review found 3 critical requirement contradictions (B2C workflow ambiguity, overdue status model, historical debt integration) that would have caused implementation failures
4. **Database trigger design** — Using PostgreSQL triggers for business logic (auto-create receivables/payables, status transitions) ensures data consistency regardless of client-side bugs
5. **Computed-over-stored pattern** — Never storing balances, always computing from source amounts + payments, eliminates an entire class of data inconsistency bugs

## What Could Be Improved

1. **Column name mismatches** — Phase 6 found 3 critical bugs where page components referenced non-existent view columns (`issue_date` vs `created_at`, `description` vs `notes`, `outstanding_amount` vs `outstanding_balance`). These should have been caught by generating TypeScript types from the Supabase schema.
2. **Pagination was non-functional** — `onPageChange` callbacks were empty stubs. Should have been tested during build.
3. **Supabase type generation** — Using placeholder types instead of auto-generated types from `supabase gen types` meant column name errors weren't caught at compile time.

## Key Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| Supabase triggers over Edge Functions | Transactional consistency for business logic | Good — atomic operations, no network round-trip |
| Computed views for balances | Never store what you can calculate | Good — eliminates balance drift bugs |
| Overdue as computed flag, not stored status | Temporal conditions shouldn't be stored states | Good — deterministic testing, no stale data |
| Single Edge Function (create-user) | Minimize server-side complexity | Good — PostgREST handles everything else |
| TanStack Query over Redux | Server state management without global store boilerplate | Good — less code, built-in caching |

## Phase 6 Remaining Issues (Major — Fix Before Production)

| Issue | Effort | Priority |
|---|---|---|
| Pagination callbacks are empty stubs | 30 min | P0 |
| Password validation min 6 chars (spec requires 8 + complexity) | 15 min | P0 |
| PO numbers use Date.now() (not sequential) | 1 hour | P1 |
| Customer/Supplier detail views lack outstanding balance | 2 hours | P1 |
| No payment overpayment warning dialog | 30 min | P1 |
| Supabase types are placeholder (gen types from schema) | 1 hour | P1 |

## V2 Backlog

The following are explicitly excluded from v1 per the proposal and should be considered for v2:
- Mobile application (Android/iOS)
- Automated OCR for document scanning
- Advanced role-based permissions
- Payment gateway integration
- SMS/email notifications
- Advanced analytics and reporting
- External accounting software integration

## Confidence Assessment

- **Confidence:** Medium-High
- **What's verified:** TypeScript compiles, Vite builds, database schema is complete, all 62 source files exist with correct structure
- **What's NOT tested:** Runtime behavior (no Supabase instance connected), E2E workflows, concurrent user scenarios, RLS policy enforcement
- **Next step:** Connect to a Supabase instance, run migrations, seed test data, and perform manual E2E testing of all workflows
