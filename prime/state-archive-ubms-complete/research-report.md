# Research Report

## Technology Research

### React + TypeScript (Frontend)
- **Why:** Industry standard for SPAs, large ecosystem, component reusability
- **Supabase JS client** provides typed auto-generated API bindings
- **React Router** for client-side routing across B2B/B2C/Finance modules
- **TanStack Query** (React Query) for server state management, caching, and optimistic updates

### Supabase (Backend + Database)
- **PostgreSQL** — relational database ideal for multi-table business data with foreign keys, constraints, and triggers
- **Auth** — built-in email/password authentication with session management
- **Row Level Security (RLS)** — data isolation per user without custom auth middleware
- **Auto-generated REST API** — CRUD operations on all tables without writing backend code
- **Edge Functions** (Deno) — for complex business logic (balance calculations, variance computation)
- **Realtime** — optional live updates for multi-user scenarios
- **Storage** — for document/file attachments (receipts, invoices)

### Cloudflare Pages (Deployment)
- **Free tier** — generous limits for small business application
- **Automatic deployments** from Git
- **Global CDN** — fast access regardless of location
- **Custom domain** support

## Competitive Landscape
- **Existing solutions:** QuickBooks, Zoho Books, ERP systems
- **Why not use existing:** Client needs a unified system combining fabric trading + printing + finance in one platform; off-the-shelf solutions don't match the specific B2B pre-order workflow (ordered vs. received quantities, variance tracking)
- **Advantage of custom:** Tailored to exact business workflows, no per-user SaaS fees, full data ownership

## Key Technical Decisions
1. **Supabase over custom backend** — reduces development time significantly; auto-generated API eliminates boilerplate
2. **React over other frameworks** — proposal specifies React; large talent pool for future maintenance
3. **Cloudflare Pages over Vercel/Netlify** — proposal specifies Cloudflare; free tier is sufficient
4. **PostgreSQL over NoSQL** — relational data (customers ↔ orders ↔ payments ↔ debts) naturally fits SQL
5. **RLS over custom auth middleware** — Supabase-native, less code to maintain

## Risk Factors
- **Free tier limits** — Supabase free: 500MB DB, 50K monthly active users; Cloudflare free: unlimited bandwidth but 100K functions/day. Sufficient for small business but may need upgrade if usage grows
- **Client data preparation** — proposal places data seeding responsibility on client; delays here affect timeline
- **No offline support** — web-only means no access without internet
- **Single-region deployment** — Cloudflare CDN handles this, but Supabase free tier is single-region
