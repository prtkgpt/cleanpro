# CleanPro CRM - System Architecture

## Overview
CleanPro is a multi-tenant SaaS CRM for home cleaning businesses, built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Admin UI   │  │ Cleaner App  │  │Customer Portal│          │
│  │              │  │              │  │              │          │
│  │ - Dashboard  │  │ - Today Jobs │  │ - Self-Book  │          │
│  │ - Calendar   │  │ - Checklist  │  │ - Bookings   │          │
│  │ - Bookings   │  │ - Timer      │  │ - Payments   │          │
│  │ - Customers  │  │ - Photos     │  │ - Invoices   │          │
│  │ - Reports    │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                    HTTPS / WebSocket
                            │
┌───────────────────────────┴─────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│                     (Next.js App Router)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Middleware Layer                        │  │
│  │  - Authentication (NextAuth)                              │  │
│  │  - Multi-tenant context injection (workspaceId)           │  │
│  │  - Role-based access control (RBAC)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Routes Layer                       │  │
│  │                                                            │  │
│  │  /api/auth/*           - Authentication endpoints         │  │
│  │  /api/workspaces/*     - Workspace management             │  │
│  │  /api/customers/*      - Customer CRUD                    │  │
│  │  /api/bookings/*       - Booking/Job management           │  │
│  │  /api/calendar/*       - Calendar views                   │  │
│  │  /api/cleaners/*       - Cleaner management & jobs        │  │
│  │  /api/payments/*       - Stripe integration               │  │
│  │  /api/messages/*       - SMS/Email logs                   │  │
│  │  /api/automations/*    - Automation config                │  │
│  │  /api/reports/*        - Analytics & reporting            │  │
│  │  /api/webhooks/*       - External webhooks (Stripe, etc)  │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Business Logic Layer                    │  │
│  │                                                            │  │
│  │  - Services (booking, pricing, scheduling)                │  │
│  │  - Recurring job processor                                │  │
│  │  - Payment processor                                      │  │
│  │  - Notification orchestrator                              │  │
│  │  - Audit logger                                           │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────────┐
│                       DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Prisma ORM                               │  │
│  │  - Type-safe queries                                      │  │
│  │  - Automatic workspaceId scoping                          │  │
│  │  - Transaction support                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│  ┌─────────────────────────┴────────────────────────────────┐  │
│  │              PostgreSQL Database                          │  │
│  │  - Multi-tenant data (workspace scoped)                   │  │
│  │  - Indexes on workspaceId + common queries               │  │
│  │  - Row-level security (optional)                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Stripe    │  │    Twilio    │  │  Postmark/   │          │
│  │              │  │              │  │  SendGrid    │          │
│  │ - Payments   │  │ - SMS        │  │ - Email      │          │
│  │ - Customers  │  │ - Status     │  │ - Templates  │          │
│  │ - Webhooks   │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │   AWS S3     │  │  Vercel Cron │                             │
│  │              │  │              │                             │
│  │ - Photos     │  │ - Automations│                             │
│  │ - Documents  │  │ - Reminders  │                             │
│  └──────────────┘  └──────────────┘                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    BACKGROUND JOBS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  - Daily 7am: Send cleaner schedules                             │
│  - Hourly: Check for 24h reminders                               │
│  - Hourly: Check for morning-of reminders                        │
│  - Every 15min: Check for post-completion follow-ups             │
│  - Daily: Generate recurring jobs for next 30 days               │
│  - Hourly: Process failed payment retries                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Multi-Tenant Architecture

### Tenant Isolation Strategy
- **Workspace-based**: Each cleaning company = 1 workspace
- **Database-level**: Single database, workspaceId column on all tenant-scoped tables
- **Application-level**: Middleware injects workspaceId into all requests
- **User-level**: Users belong to one workspace (no cross-tenant access)

### Security Model
```typescript
// Every tenant-scoped query includes workspace filter
const customers = await prisma.customer.findMany({
  where: {
    workspaceId: ctx.workspaceId, // Always scoped
    // ... other filters
  }
});
```

## Role-Based Access Control (RBAC)

### Roles
1. **ADMIN** - Full access to workspace
2. **DISPATCHER** - Manage bookings, customers, cleaners (no billing settings)
3. **CLEANER** - View assigned jobs, update status, checklists
4. **CUSTOMER** - Self-service portal

### Permission Matrix
```
Resource          | ADMIN | DISPATCHER | CLEANER | CUSTOMER
------------------|-------|------------|---------|----------
Workspace Settings|   ✓   |     -      |    -    |    -
Billing Settings  |   ✓   |     -      |    -    |    -
Services/Pricing  |   ✓   |     ✓      |    -    |    -
Customers         |   ✓   |     ✓      |    -    |  Own
Bookings (All)    |   ✓   |     ✓      |    -    |    -
Bookings (Own)    |   ✓   |     ✓      |    ✓    |    ✓
Cleaners          |   ✓   |     ✓      |  Self   |    -
Payments          |   ✓   |     ✓      |    -    |  Own
Messages          |   ✓   |     ✓      |  Rel.   |  Own
Reports           |   ✓   |     ✓      |    -    |    -
```

## Data Flow Examples

### 1. Customer Self-Booking Flow
```
Customer → /book → Select Service → Choose Date/Time → Enter Details
→ Payment Method → Confirm → API: POST /api/bookings → Prisma: Create Job
→ Stripe: Create Payment Intent → DB: Save Booking → Trigger: Confirmation Email
→ Trigger: Cleaner Assignment Logic → Return: Booking Confirmation
```

### 2. Cleaner Completing Job
```
Cleaner App → Mark Complete → Upload Photos → S3: Store Images
→ API: PATCH /api/cleaners/jobs/:id → DB: Update Status → Calculate Total Time
→ Trigger: Customer Review Request → Trigger: Payment Charge (if unpaid)
→ Return: Success
```

### 3. Recurring Job Generation
```
Cron (Daily) → Query: Recurring Rules due in next 30 days
→ For each rule: Calculate next occurrences → Check: Skip dates, conflicts
→ Create: Individual job instances → Assign: Based on cleaner preferences
→ Trigger: Confirmation to customer
```

### 4. Payment Webhook Flow
```
Stripe → Webhook: payment_intent.succeeded → Verify: Signature
→ API: POST /api/webhooks/stripe → Find: Invoice by payment_intent_id
→ Update: Invoice status = PAID, paidAt = now → Create: AuditLog entry
→ Trigger: Receipt email → Return: 200 OK
```

## Technology Choices & Rationale

### Frontend: Next.js 14 (App Router)
- **Why**: Server components reduce client JS, better SEO, simpler data fetching
- **Alternatives considered**: Remix, vanilla React SPA
- **Trade-off**: Learning curve vs. performance benefits

### Database: PostgreSQL + Prisma
- **Why**:
  - PostgreSQL: ACID compliance, JSON support, proven at scale
  - Prisma: Type safety, migrations, great DX
- **Alternatives**: MySQL + Drizzle, Supabase
- **Trade-off**: Vendor lock-in vs. productivity

### Auth: NextAuth (Auth.js)
- **Why**:
  - Built for Next.js
  - Session management included
  - Easy to extend with custom providers
- **Alternatives**: Clerk, custom JWT
- **Trade-off**: Less control vs. faster setup

### Payments: Stripe
- **Why**:
  - Industry standard
  - Excellent webhooks
  - PCI compliance handled
- **Alternatives**: Square, Braintree
- **Trade-off**: 2.9% + 30¢ fees

### File Storage: AWS S3
- **Why**:
  - Industry standard
  - Direct browser uploads (presigned URLs)
  - CDN integration
- **Alternatives**: Cloudflare R2, Vercel Blob
- **Trade-off**: Cost vs. reliability

## Scaling Considerations

### Current (MVP) Architecture
- Single Next.js deployment on Vercel
- Single PostgreSQL instance (Vercel Postgres or Railway)
- Vercel Cron for background jobs
- ~100 workspaces, ~1000 jobs/day

### Future Scaling Path (if needed)
1. **Database**: Read replicas, connection pooling (PgBouncer)
2. **Caching**: Redis for session store, frequently accessed data
3. **Background Jobs**: Migrate to dedicated queue (BullMQ, Inngest)
4. **File Storage**: CDN (CloudFront) in front of S3
5. **Monitoring**: Sentry for errors, DataDog for APM

## Security Features

1. **Authentication**: bcrypt password hashing, secure session cookies
2. **Authorization**: Middleware-enforced RBAC
3. **Multi-tenancy**: Automatic workspaceId scoping prevents data leaks
4. **Input Validation**: Zod schemas on all API endpoints
5. **SQL Injection**: Prisma parameterized queries
6. **XSS**: React auto-escaping, CSP headers
7. **CSRF**: NextAuth built-in protection
8. **Rate Limiting**: Vercel edge limits + application-level (if needed)
9. **Audit Logging**: Track who changed what, when

## Development Workflow

1. **Local Development**:
   ```bash
   npm run dev          # Start Next.js
   npm run db:migrate   # Run Prisma migrations
   npm run db:seed      # Seed test data
   ```

2. **Testing Strategy**:
   - Unit tests: Vitest for business logic
   - Integration tests: Playwright for API routes
   - E2E tests: Playwright for critical flows

3. **Deployment**:
   - Git push → Vercel auto-deploy
   - Migrations run on deploy (careful!)
   - Environment variables in Vercel dashboard

## API Design Principles

1. **RESTful**: Standard HTTP methods (GET, POST, PATCH, DELETE)
2. **Consistent responses**:
   ```typescript
   { success: true, data: {...} }
   { success: false, error: "message", code: "ERROR_CODE" }
   ```
3. **Pagination**: `?page=1&limit=50` with total count
4. **Filtering**: `?status=CONFIRMED&cleanerId=123`
5. **Sorting**: `?sortBy=createdAt&order=desc`
6. **Versioning**: `/api/v1/*` (start with v1)
