# Project Charter

## Classification
- **Tier:** 1 — Moderate (Multi-table relational schema, Supabase API + auth, dynamic SPA)
- **Tech Stack:** React + TypeScript → Supabase (PostgreSQL, Auth, RLS, Edge Functions) → Cloudflare Pages
- **Approach:** Greenfield
- **Quality Mode:** Polish (deep refinement + S.U.P.E.R. audits)

## Complexity Scores

| Dimension | Score | Source | Rationale |
|---|---|---|---|
| Data layer | 2 | REQUIRED | Multi-table with relations (customers, suppliers, orders, payments, inventory, debts) |
| API surface | 2 | REQUIRED | Supabase auto-REST + RLS; 6-20+ endpoint equivalents across modules |
| Integrations | 1 | REQUIRED | Supabase (auth + DB) + Cloudflare deployment = 2 services |
| Auth complexity | 1 | REQUIRED | Individual login accounts, basic user management (not full RBAC) |
| Compliance | 0 | — | No compliance requirements stated |
| Traffic scale | 0 | ASSUMED | Small business, <1K users |
| UI complexity | 2 | REQUIRED | Dynamic SPA with state — multiple modules, forms, tables, dashboards |

**Confirmed Score:** 8 (Tier 1)
**Assumed Score:** 0 additional
**Total Score:** 8 → Tier 1 — Moderate

## Scope
Build a unified web-based business management system combining B2B fabric trading and B2C printing operations with finance as the main priority, addressing manual receipt tracking, calculations, customer/supplier balances, payments, and historical debts.

## Constraints
- Free-tier infrastructure (Supabase + Cloudflare Pages)
- 10-12 week timeline estimate
- Client handles all data preparation and seeding
- No mobile/desktop apps in v1
- No OCR, payment gateways, or advanced analytics
- Basic user management only (no advanced RBAC)
- PHP currency (Philippine Peso ₱)

## Ideation Summary
- **Problem:** Manual business operations (receipts, calculations, balance tracking) across two business lines (B2B fabric trading, B2C printing) cause errors, inefficiency, and difficulty retrieving financial records
- **Primary Persona:** Business owner/manager — handles daily operations, needs accurate financial visibility across both business lines
- **Secondary Persona:** Staff/operator — enters orders, processes payments, manages inventory
- **Opportunity Score:** 78/100 (high pain point, clear workflow, manageable scope, direct ROI via reduced manual work)
- **MVP Features:**
  1. User authentication & basic user management
  2. Finance module (receivables, payables, payments, historical debts, balance calculations)
  3. B2B Fabric Trading (pre-order → PO → receiving → inventory → fulfillment → payment)
  4. B2C Printing (customer → order → production → completion → release → payment)
  5. Inventory management (fabric/product records, stock tracking, variance)
  6. Customer & supplier centralized records
  7. Basic reports (sales, inventory, receivables, payables, payments, transactions)

## Integration Plan
- **MCP Servers:**
  - `context7` — Supabase/React docs lookup (Phases 2-6)
  - `fetch` — Web research (Phases 1-3)
  - `playwright` — Browser testing & prototype verification (Phases 5-6)
  - `genui` — Design previews (Phase 3)
  - `filesystem` — File operations (all phases)
  - `postgres` — Direct DB queries for validation (Phases 5-6)
  - `sequential-thinking` — Complex reasoning (Phases 2-4)
  - `quill` — Knowledge persistence (all phases)
  - `snapcheck` — Visual verification (Phases 5-6)
- **Skills (by phase):**
  - Phase 2: `database` (Supabase Postgres), `backend` (API design)
  - Phase 3: `frontend` (React design system), `software-architecture`
  - Phase 4: `research` (writing-plans)
  - Phase 5: `frontend`, `backend`, `database`, `testing`, `security-testing`
  - Phase 6: `testing`, `code-quality`
  - Phase 7: `devops` (Cloudflare deploy), `document`

## Phase Plan
- Phase 1 (Discover): **IN PROGRESS**
- Phase 2 (Define): Pending
- Phase 3 (Design): Pending
- Phase 4 (Plan): Pending
- Phase 5 (Build): Pending
- Phase 6 (Verify): Pending
- Phase 7 (Ship & Learn): Pending

## Scope Budget (Polish Mode)

| Component | Limit | Notes |
|---|---|---|
| Features | 7 | Auth, B2B, B2C, Finance, Inventory, Customers/Suppliers, Reports |
| Integrations | 8 | Supabase, Cloudflare |
| Data models | 15 | ~12-14 core tables expected |
| Dynamic skills | 3 | Available for phase-specific needs |
