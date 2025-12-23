# CleanPro CRM - Project Structure

```
cleanpro/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Seed data for development
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Auth route group (no layout)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/       # Admin/Dispatcher dashboard
│   │   │   ├── layout.tsx     # Dashboard layout with sidebar
│   │   │   ├── page.tsx       # Dashboard home
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── cleaners/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── services/
│   │   │   │   └── page.tsx
│   │   │   ├── automations/
│   │   │   │   └── page.tsx
│   │   │   ├── reports/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (customer)/        # Customer portal
│   │   │   ├── layout.tsx     # Customer layout
│   │   │   ├── portal/
│   │   │   │   ├── page.tsx   # Customer dashboard
│   │   │   │   ├── book/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── bookings/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── payments/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── profile/
│   │   │   │       └── page.tsx
│   │   │
│   │   ├── (cleaner)/         # Cleaner app
│   │   │   ├── layout.tsx     # Cleaner layout
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx   # Today's jobs
│   │   │   │   ├── upcoming/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── profile/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/               # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── signup/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── workspaces/
│   │   │   │   ├── current/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── customers/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── addresses/
│   │   │   │           └── route.ts
│   │   │   ├── bookings/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── assign/
│   │   │   │           └── route.ts
│   │   │   ├── calendar/
│   │   │   │   └── route.ts
│   │   │   ├── cleaners/
│   │   │   │   ├── route.ts
│   │   │   │   ├── jobs/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [bookingId]/
│   │   │   │   │       ├── start/
│   │   │   │   │       │   └── route.ts
│   │   │   │   │       ├── complete/
│   │   │   │   │       │   └── route.ts
│   │   │   │   │       ├── photos/
│   │   │   │   │       │   └── route.ts
│   │   │   │   │       └── checklist/
│   │   │   │   │           └── [itemId]/
│   │   │   │   │               └── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── services/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── payments/
│   │   │   │   ├── create-intent/
│   │   │   │   │   └── route.ts
│   │   │   │   └── confirm/
│   │   │   │       └── route.ts
│   │   │   ├── messages/
│   │   │   │   ├── route.ts
│   │   │   │   └── send/
│   │   │   │       └── route.ts
│   │   │   ├── automations/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── reports/
│   │   │   │   ├── revenue/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── jobs/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── cleaners/
│   │   │   │   │   └── route.ts
│   │   │   │   └── customers/
│   │   │   │       └── route.ts
│   │   │   ├── recurring-rules/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── skip/
│   │   │   │           └── route.ts
│   │   │   ├── customer/
│   │   │   │   ├── bookings/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── reschedule/
│   │   │   │   │       │   └── route.ts
│   │   │   │   │       └── cancel/
│   │   │   │   │           └── route.ts
│   │   │   │   └── book/
│   │   │   │       └── route.ts
│   │   │   ├── webhooks/
│   │   │   │   └── stripe/
│   │   │   │       └── route.ts
│   │   │   └── cron/
│   │   │       ├── daily/
│   │   │       │   └── route.ts
│   │   │       └── hourly/
│   │   │           └── route.ts
│   │   │
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   │
│   ├── components/
│   │   ├── ui/                # Reusable UI components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── toast.tsx
│   │   │
│   │   ├── layouts/
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── customer-layout.tsx
│   │   │   └── cleaner-layout.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── sidebar.tsx
│   │   │   ├── calendar-view.tsx
│   │   │   ├── booking-card.tsx
│   │   │   ├── customer-table.tsx
│   │   │   └── stats-card.tsx
│   │   │
│   │   ├── customer/
│   │   │   ├── booking-form.tsx
│   │   │   ├── service-selector.tsx
│   │   │   └── payment-form.tsx
│   │   │
│   │   ├── cleaner/
│   │   │   ├── job-card.tsx
│   │   │   ├── checklist.tsx
│   │   │   ├── timer.tsx
│   │   │   └── photo-uploader.tsx
│   │   │
│   │   └── forms/
│   │       ├── customer-form.tsx
│   │       ├── booking-form.tsx
│   │       ├── service-form.tsx
│   │       └── cleaner-form.tsx
│   │
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── auth-options.ts     # NextAuth configuration
│   │   │   ├── session.ts          # Session helpers
│   │   │   └── permissions.ts      # Permission checks
│   │   │
│   │   ├── db/
│   │   │   └── prisma.ts           # Prisma client singleton
│   │   │
│   │   ├── services/
│   │   │   ├── booking-service.ts   # Business logic for bookings
│   │   │   ├── pricing-service.ts   # Pricing calculations
│   │   │   ├── recurring-service.ts # Recurring job generation
│   │   │   ├── payment-service.ts   # Stripe integration
│   │   │   ├── message-service.ts   # SMS/Email sending
│   │   │   └── automation-service.ts # Automation triggers
│   │   │
│   │   ├── integrations/
│   │   │   ├── stripe.ts            # Stripe client
│   │   │   ├── twilio.ts            # Twilio SMS
│   │   │   ├── email.ts             # Email provider
│   │   │   └── s3.ts                # S3 file storage
│   │   │
│   │   ├── validators/
│   │   │   ├── auth.ts              # Auth validation schemas
│   │   │   ├── booking.ts           # Booking validation schemas
│   │   │   ├── customer.ts          # Customer validation schemas
│   │   │   └── cleaner.ts           # Cleaner validation schemas
│   │   │
│   │   └── utils/
│   │       ├── date.ts              # Date utilities
│   │       ├── currency.ts          # Currency formatting
│   │       ├── errors.ts            # Error handling
│   │       └── api-response.ts      # API response helpers
│   │
│   ├── middleware.ts          # Next.js middleware (auth, tenant context)
│   │
│   ├── types/
│   │   ├── index.ts           # Shared types
│   │   ├── api.ts             # API types
│   │   └── next-auth.d.ts     # NextAuth type extensions
│   │
│   └── utils/
│       ├── cn.ts              # Tailwind class merge utility
│       └── constants.ts       # App constants
│
├── public/
│   ├── logo.svg
│   └── images/
│
├── .env.example               # Environment variables template
├── .env                       # Local environment variables (gitignored)
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── README.md
├── ARCHITECTURE.md
├── API_ROUTES.md
└── PROJECT_STRUCTURE.md
```

## Key Directories Explained

### `/src/app`
Next.js 14 App Router structure with route groups:
- **(auth)**: Authentication pages (login, signup)
- **(dashboard)**: Admin/Dispatcher interface
- **(customer)**: Customer self-service portal
- **(cleaner)**: Cleaner mobile-friendly app
- **api**: All API endpoints

### `/src/components`
Reusable React components organized by domain:
- **ui**: Base UI components (buttons, forms, etc.) from shadcn/ui
- **layouts**: Layout wrappers for different user types
- **dashboard**: Admin-specific components
- **customer**: Customer portal components
- **cleaner**: Cleaner app components
- **forms**: Complex form components

### `/src/lib`
Core business logic and integrations:
- **auth**: Authentication & authorization
- **db**: Database connection
- **services**: Business logic layer (isolated from API routes)
- **integrations**: External service clients
- **validators**: Zod schemas for input validation
- **utils**: Helper functions

### `/src/types`
TypeScript type definitions

### `/prisma`
Database schema and migrations

## Route Group Conventions

Next.js route groups (folders in parentheses) don't affect the URL path:
- `(dashboard)/calendar/page.tsx` → `/calendar`
- `(customer)/portal/book/page.tsx` → `/portal/book`
- `(cleaner)/jobs/page.tsx` → `/jobs`

Each group has its own `layout.tsx` for group-specific navigation and styling.

## Development Workflow

1. **Database changes**: Edit `prisma/schema.prisma` → Run `npm run db:migrate`
2. **New API route**: Create `route.ts` in `/src/app/api/{endpoint}`
3. **New page**: Create `page.tsx` in appropriate route group
4. **New component**: Add to `/src/components/{category}`
5. **Business logic**: Add to `/src/lib/services`
6. **Type definitions**: Add to `/src/types`

## File Naming Conventions

- **Components**: PascalCase (e.g., `BookingCard.tsx`)
- **Utilities**: kebab-case (e.g., `api-response.ts`)
- **Services**: kebab-case with suffix (e.g., `booking-service.ts`)
- **API routes**: `route.ts` (Next.js convention)
- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx` (Next.js convention)

## Import Aliases

TypeScript path alias configured: `@/*` → `/src/*`

```typescript
// Instead of: import { Button } from '../../../components/ui/button'
import { Button } from '@/components/ui/button'
```

## Next Steps for Implementation

1. Install dependencies: `npm install`
2. Set up database: `npm run db:migrate`
3. Seed test data: `npm run db:seed`
4. Start development: `npm run dev`
