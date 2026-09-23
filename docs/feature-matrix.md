# Feature Matrix — Inventory Management System

> **Version:** 1.0 | **Date:** 2026-08-26 | **Status:** Draft for Review

---

## Legend

| Symbol | Meaning |
|---|---|
| **P0** | Critical — must have for system to function |
| **P1** | High — must have for business operations |
| **P2** | Medium — important but not blocking core operations |
| **Low** | Straightforward implementation, minimal complexity |
| **Medium** | Moderate logic, multiple states or calculations |
| **High** | Complex logic, multi-step workflows, or cross-module dependencies |

---

## 1. Feature Matrix by Module

### 1.1 User Authentication & Management

| ID | Feature | Priority | Complexity | Dependencies | Cross-References |
|---|---|---|---|---|---|
| FR-AUTH-001 | User login (email/password) | P0 | Low | Supabase Auth configured | All modules require authentication |
| FR-AUTH-002 | Session management (30-min timeout) | P0 | Low | FR-AUTH-001 | All modules (protected routes) |
| FR-AUTH-003 | Admin user management (CRUD) | P1 | Medium | FR-AUTH-001 | All modules (role-based access) |
| FR-AUTH-004 | Password reset flow | P1 | Low | FR-AUTH-001, Supabase Auth | Standalone |

### 1.2 Finance Module (HIGHEST PRIORITY)

| ID | Feature | Priority | Complexity | Dependencies | Cross-References |
|---|---|---|---|---|---|
| FR-FIN-001 | Customer receivables tracking | P0 | High | FR-CS-001, FR-B2B-009 or FR-B2C-002 | B2B fulfillments, B2C orders create receivables |
| FR-FIN-002 | Supplier payables tracking | P0 | High | FR-CS-002, FR-B2B-003 | B2B purchase orders create payables |
| FR-FIN-003 | Payment recording | P0 | High | FR-FIN-001, FR-FIN-002 | Updates receivable/payable balances |
| FR-FIN-004 | Outstanding balance auto-calculation | P0 | Medium | FR-FIN-003 | Computed from payments; displayed everywhere |
| FR-FIN-005 | Due date & overdue identification | P0 | Medium | FR-FIN-001, FR-FIN-002 | Finance dashboard, reports |
| FR-FIN-006 | Payment history per entity | P0 | Medium | FR-FIN-003 | Customer/supplier detail pages |
| FR-FIN-007 | Searchable financial transactions | P0 | Medium | FR-FIN-001, FR-FIN-002, FR-FIN-003 | Finance module, dashboard |
| FR-FIN-008 | Receivables summary | P0 | Low | FR-FIN-001, FR-FIN-004 | Finance dashboard |
| FR-FIN-009 | Payables summary | P0 | Low | FR-FIN-002, FR-FIN-004 | Finance dashboard |
| FR-FIN-010 | Payment voiding (admin only) | P1 | Medium | FR-FIN-003, FR-AUTH-003 | Recalculates balances on void |

### 1.3 B2B Fabric Trading

| ID | Feature | Priority | Complexity | Dependencies | Cross-References |
|---|---|---|---|---|---|
| FR-B2B-001 | Pre-order creation | P1 | Medium | FR-CS-001, FR-INV-001 | Creates receivable trigger on fulfillment |
| FR-B2B-002 | Pre-order status transitions | P1 | Medium | FR-B2B-001 | Workflow enforcement |
| FR-B2B-003 | Purchase order creation | P1 | Medium | FR-CS-002, FR-INV-001, FR-B2B-001 | Creates payable trigger on receiving |
| FR-B2B-004 | PO status transitions | P1 | High | FR-B2B-003, FR-B2B-005 | Auto-determined by receiving records |
| FR-B2B-005 | Receiving record creation | P1 | High | FR-B2B-003, FR-INV-001 | Updates inventory; triggers variance calc |
| FR-B2B-006 | Ordered vs received qty tracking | P1 | Medium | FR-B2B-005 | Display in PO detail view |
| FR-B2B-007 | Automatic shortage/excess calculation | P1 | Medium | FR-B2B-005 | Variance = received − ordered |
| FR-B2B-008 | Manual variance/reason entry | P1 | Low | FR-B2B-007 | Required when variance ≠ 0 |
| FR-B2B-009 | Fulfillment record creation | P1 | High | FR-CS-001, FR-INV-001 | Creates Finance receivable on completion; updates inventory |
| FR-B2B-010 | B2B customer transaction history | P1 | Medium | FR-CS-001, FR-B2B-001, FR-B2B-009, FR-FIN-003 | Aggregates across B2B + Finance |

### 1.4 B2C Printing

| ID | Feature | Priority | Complexity | Dependencies | Cross-References |
|---|---|---|---|---|---|
| FR-B2C-001 | Printing order creation | P1 | Medium | FR-CS-001 | Creates receivable on release/payment |
| FR-B2C-002 | Order status transitions | P1 | Medium | FR-B2C-001 | 5-step workflow |
| FR-B2C-003 | Production status tracking | P1 | Low | FR-B2C-002 | Notes + timestamps |
| FR-B2C-004 | B2C payment recording | P1 | High | FR-B2C-002, FR-FIN-003 | Uses Finance payment flow |
| FR-B2C-005 | B2C customer transaction history | P1 | Medium | FR-CS-001, FR-B2C-001, FR-FIN-003 | Aggregates across B2C + Finance |

### 1.5 Historical Debts

| ID | Feature | Priority | Complexity | Dependencies | Cross-References |
|---|---|---|---|---|---|
| FR-DEBT-001 | Record customer historical debts | P1 | Low | FR-CS-001 | Linked to customer; affects outstanding balance |
| FR-DEBT-002 | Record supplier historical debts | P1 | Low | FR-CS-002 | Linked to supplier; affects outstanding balance |
| FR-DEBT-003 | Verification status management | P1 | Medium | FR-DEBT-001, FR-DEBT-002 | Status workflow with adjustment logic |
| FR-DEBT-004 | Listing and filtering | P2 | Low | FR-DEBT-001, FR-DEBT-002 | Filter/sort/paginate |

### 1.6 Inventory Management

| ID | Feature | Priority | Complexity | Dependencies | Cross-References |
|---|---|---|---|---|---|
| FR-INV-001 | Product/fabric records | P1 | Low | None | Referenced by B2B, B2C, Reports |
| FR-INV-002 | Stock received tracking | P1 | Medium | FR-B2B-005, FR-INV-001 | Auto-triggered by receiving records |
| FR-INV-003 | Stock released tracking | P1 | Medium | FR-B2B-009, FR-INV-001 | Auto-triggered by fulfillment completion |
| FR-INV-004 | Current quantity calculation | P1 | Medium | FR-INV-002, FR-INV-003, FR-INV-005 | Computed: received − released + adjustments |
| FR-INV-005 | Manual inventory adjustments | P1 | Medium | FR-INV-001 | Affects current quantity |
| FR-INV-006 | Inventory history log | P2 | Low | FR-INV-002, FR-INV-003, FR-INV-005 | Aggregates all movements |

### 1.7 Customers & Suppliers (Centralized)

| ID | Feature | Priority | Complexity | Dependencies | Cross-References |
|---|---|---|---|---|---|
| FR-CS-001 | Centralized customer records | P0 | Low | None | Referenced by ALL modules |
| FR-CS-002 | Centralized supplier records | P0 | Low | None | Referenced by B2B, Finance, Historical Debts |
| FR-CS-003 | Customer/supplier detail view | P1 | Medium | FR-CS-001, FR-CS-002, FR-FIN-004 | Aggregates outstanding balance + transactions |
| FR-CS-004 | Customer/supplier search | P1 | Low | FR-CS-001, FR-CS-002 | Used across all modules |

### 1.8 Reports

| ID | Feature | Priority | Complexity | Dependencies | Cross-References |
|---|---|---|---|---|---|
| FR-RPT-001 | Sales report | P2 | Medium | FR-B2B-009, FR-B2C-001, FR-FIN-003 | Aggregates B2B + B2C data |
| FR-RPT-002 | Inventory report | P2 | Medium | FR-INV-001, FR-INV-004 | Displays current stock levels |
| FR-RPT-003 | Receivables report | P1 | Medium | FR-FIN-001, FR-FIN-004 | Customer outstanding balances |
| FR-RPT-004 | Payables report | P1 | Medium | FR-FIN-002, FR-FIN-004 | Supplier outstanding balances |
| FR-RPT-005 | Payments report | P2 | Medium | FR-FIN-003 | All payments received/paid |
| FR-RPT-006 | Customer transaction report | P2 | Medium | FR-CS-001, FR-FIN-001, FR-FIN-003 | Per-customer detail |
| FR-RPT-007 | Supplier transaction report | P2 | Medium | FR-CS-002, FR-FIN-002, FR-FIN-003 | Per-supplier detail |
| FR-RPT-008 | Simple dashboard | P2 | Medium | FR-FIN-008, FR-FIN-009, FR-INV-004 | Aggregates key metrics |

### 1.9 Digital Transaction & Document Records

| ID | Feature | Priority | Complexity | Dependencies | Cross-References |
|---|---|---|---|---|---|
| FR-DOC-001 | View all transaction documents | P1 | Medium | All document-creating modules | Unified view across all modules |
| FR-DOC-002 | Print documents | P1 | Medium | FR-DOC-001 | Print-optimized layouts |
| FR-DOC-003 | Export documents (PDF/CSV) | P2 | High | FR-DOC-001, FR-DOC-002 | PDF generation + CSV export |
| FR-DOC-004 | Customer/supplier statements | P2 | Medium | FR-CS-003, FR-DOC-002 | Date-range filtered statements |

---

## 2. Module Dependency Graph

```
                    ┌─────────────────────┐
                    │  Auth & Management   │
                    │  (FR-AUTH-*)         │
                    └──────────┬──────────┘
                               │ (all modules require auth)
                               ▼
         ┌─────────────────────────────────────────┐
         │   Customers & Suppliers (FR-CS-*)       │
         │   P0 — Foundation for all modules       │
         └──┬──────────┬──────────┬───────────┬───┘
            │          │          │           │
            ▼          ▼          ▼           ▼
     ┌──────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
     │  B2B     │ │  B2C   │ │Historic│ │ Inventory│
     │  Fabric  │ │Printing│ │  al    │ │  (FR-INV)│
     │  (B2B)   │ │ (B2C)  │ │ Debts  │ │          │
     └────┬─────┘ └───┬────┘ └───┬────┘ └────┬─────┘
          │           │          │            │
          │  creates   │ creates  │            │
          │  receivables│receivables│           │
          ▼           ▼          │            │
     ┌──────────────────────┐    │            │
     │   Finance (FR-FIN)   │◄───┘            │
     │   P0 — Highest       │                 │
     │   Priority           │                 │
     └──────────┬───────────┘                 │
                │                              │
                ▼                              │
     ┌──────────────────────┐                  │
     │   Reports (FR-RPT)   │◄─────────────────┘
     │   + Documents (DOC)  │
     └──────────────────────┘
```

### Dependency Direction (who depends on whom):
- **Finance** depends on: Customers/Suppliers, B2B, B2C, Historical Debts
- **B2B** depends on: Customers/Suppliers, Products (Inventory)
- **B2C** depends on: Customers/Suppliers
- **Inventory** depends on: Products, B2B (receiving/fulfillment trigger updates)
- **Reports** depends on: Finance, B2B, B2C, Inventory
- **Documents** depends on: All document-creating modules

---

## 3. Cross-Module Impact Matrix

Shows how actions in one module affect other modules.

| Source Action | Finance | B2B | B2C | Inventory | Customers/Suppliers |
|---|---|---|---|---|---|
| Create B2B fulfillment (complete) | Creates receivable | — | — | Decrements stock | Updates customer balance |
| Record B2B receiving | — | Updates PO status | — | Increments stock | Updates supplier balance |
| Create B2C order (release) | Creates receivable | — | — | — | Updates customer balance |
| Record payment (receivable) | Updates balance, status | — | Updates order status | — | Updates customer balance |
| Record payment (payable) | Updates balance, status | Updates PO status | — | — | Updates supplier balance |
| Create historical debt | Included in totals | — | — | — | Updates entity balance |
| Inventory adjustment | — | — | — | Updates current qty | — |
| Deactivate customer | — | Prevents new orders | Prevents new orders | — | — |

---

## 4. Priority Summary

### P0 — Critical (Must have for system to function)
| Module | Count | Features |
|---|---|---|
| Auth | 2 | Login, Session management |
| Finance | 9 | Receivables, Payables, Payments, Balance calc, Overdue, History, Search, Summaries |
| Customers/Suppliers | 2 | Centralized customer records, Centralized supplier records |
| **Total P0** | **13** | |

### P1 — High (Must have for business operations)
| Module | Count | Features |
|---|---|---|
| Auth | 2 | User management, Password reset |
| Finance | 1 | Payment voiding |
| B2B | 10 | Full B2B workflow |
| B2C | 5 | Full B2C workflow |
| Historical Debts | 3 | Record debts, verification, (listing is P2) |
| Inventory | 5 | Products, stock tracking, adjustments |
| Customers/Suppliers | 2 | Detail view, Search |
| Reports | 2 | Receivables report, Payables report |
| Documents | 2 | View documents, Print |
| **Total P1** | **32** | |

### P2 — Medium (Important but not blocking)
| Module | Count | Features |
|---|---|---|
| Historical Debts | 1 | Listing/filtering |
| Inventory | 1 | History log |
| Reports | 6 | Sales, Inventory, Payments, Customer/Supplier reports, Dashboard |
| Documents | 2 | Export, Statements |
| **Total P2** | **10** | |

### Grand Total: 55 functional requirements

---

## 5. Complexity Distribution

| Complexity | Count | Percentage | Examples |
|---|---|---|---|
| **Low** | 16 | 29% | Login, CRUD for customers/suppliers/products, password reset |
| **Medium** | 28 | 51% | Payment recording, status workflows, balance calculations, reports |
| **High** | 11 | 20% | B2B receiving with variance, fulfillment→receivable creation, PDF/CSV export |

---

## 6. Implementation Sequence (Recommended)

Based on dependencies and priorities:

| Phase | Module | Rationale |
|---|---|---|
| **Sprint 1** | Auth + Customers/Suppliers + Products | Foundation — all other modules depend on these |
| **Sprint 2** | Finance (receivables, payables, payments, balance calc) | Highest priority — core business pain point |
| **Sprint 3** | B2B Fabric Trading (pre-orders → POs → receiving → fulfillments) | Primary business workflow; integrates with Finance + Inventory |
| **Sprint 4** | Inventory Management + B2C Printing | Inventory auto-updates from B2B; B2C is independent workflow |
| **Sprint 5** | Historical Debts + Reports + Documents | Supporting features; depend on core modules being complete |
| **Sprint 6** | Dashboard + Polish + Export | Final integration, cross-module views, export features |

---

## 7. Risk-Complexity Hotspots

| Area | Risk | Mitigation |
|---|---|---|
| Finance balance calculations | Floating-point errors | Use `NUMERIC(15,2)` in PostgreSQL; compute in DB, not JS |
| B2B variance tracking | Complex cumulative calculations across multiple receiving events | Implement as DB trigger/function; test with edge cases |
| Cross-module status propagation | Fulfillment completion → receivable creation → balance update | Use Supabase Edge Functions for transactional consistency |
| Overdue detection | Requires date comparison on every page load | Use DB view or computed column; cache with invalidation |
| PDF/CSV export | Client-side PDF generation can be slow for large datasets | Use server-side rendering via Edge Function for large exports |
