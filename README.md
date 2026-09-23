# UBMS — Unified Business Management System

A web-based business management system combining B2B Fabric Trading and B2C Printing operations with Finance as the main priority.

## Tech Stack

- **Frontend:** React 19 + TypeScript 5 + Vite 6 + Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL, Auth, RLS, auto-REST API)
- **State:** TanStack Query 5
- **Forms:** React Hook Form + Zod
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Deployment:** Cloudflare Pages

## Prerequisites

- Node.js 20+
- pnpm 9+
- A Supabase project (free tier works)

## Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables and fill in your Supabase credentials
cp .env.example .env

# Start development server
pnpm dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key (safe for client-side) |

## Database Setup

1. Create a new Supabase project
2. Run all migration files in `supabase/migrations/` in order (001 through 010)
3. The migrations create: 20 tables, 5 computed views, 16 triggers, RLS policies, and indexes

## Project Structure

```
src/
├── components/
│   ├── layout/          # Sidebar, Header, PageContainer, Route guards
│   └── ui/              # Reusable UI primitives (Button, Input, Table, Badge, Modal, etc.)
├── hooks/               # Data fetching hooks per module
├── lib/
│   ├── supabase/        # Supabase client configuration
│   └── utils/           # Currency formatting, date helpers, validators, error handling
├── providers/           # Auth provider, TanStack Query provider
├── routes/
│   ├── _auth/           # Login, Forgot Password (public)
│   └── _protected/      # All authenticated pages
│       ├── b2b/         # Pre-orders, Purchase Orders, Receiving, Fulfillments
│       ├── b2c/         # Printing Orders
│       ├── finance/     # Receivables, Payables, Payments, Search, Historical Debts
│       ├── inventory/   # Products, Adjustments, Summary
│       ├── reports/     # All report types
│       ├── documents/   # Unified document view
│       └── settings/    # User management
└── types/               # TypeScript interfaces for all entities
```

## Modules

| Module | Description |
|---|---|
| **Finance** (Priority) | Receivables, payables, payments, overdue tracking, historical debts |
| **B2B Trading** | Pre-orders → Purchase Orders → Receiving → Fulfillments (with variance tracking) |
| **B2C Printing** | Printing orders → Production → Completion → Release → Payment |
| **Inventory** | Product records, stock tracking, adjustments |
| **Customers/Suppliers** | Centralized records shared across all modules |
| **Reports** | Sales, receivables, payables, payments, inventory, transaction reports |
| **Documents** | Unified transaction document view with print/export |

## Build

```bash
# Production build
pnpm build

# Preview production build
pnpm preview
```

## Deployment (Cloudflare Pages)

1. Push code to a Git repository
2. Connect the repository to Cloudflare Pages
3. Set build command: `pnpm build`
4. Set output directory: `dist`
5. Add environment variables in Cloudflare dashboard: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## User Roles

| Role | Access |
|---|---|
| **Admin** | Full access including user management, payment voiding |
| **Staff** | Operational access (all modules except user management) |

## License

Proprietary — developed for the client per the project agreement.
