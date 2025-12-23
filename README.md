# CleanPro CRM - Home Cleaning Business Management

A production-ready, multi-tenant SaaS CRM for home cleaning businesses. Built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## Features

### Multi-Tenant SaaS
- Each cleaning company is its own isolated workspace
- Complete data isolation between tenants
- Custom branding per workspace

### Role-Based Access Control
- **Admin/Owner**: Full access to all features
- **Dispatcher**: Manage bookings, customers, and cleaners
- **Cleaner**: View assigned jobs, update checklists, track time
- **Customer**: Self-service booking and payment portal

### Core Functionality
- 📅 **Booking Management**: Create, schedule, and track cleaning jobs
- 👥 **Customer Management**: Complete CRM with addresses, notes, and tags
- 🧹 **Cleaner Management**: Availability, assignments, time tracking
- 💳 **Payment Processing**: Stripe integration with deposits and invoices
- 📲 **Messaging**: Automated SMS and email notifications
- 🔄 **Recurring Schedules**: Weekly, biweekly, monthly recurring jobs
- ✅ **Checklists**: Service-specific task lists
- 📊 **Reporting**: Revenue, utilization, and performance metrics
- 🤖 **Automations**: Booking confirmations, reminders, review requests

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **SMS**: Twilio
- **Email**: Postmark/SendGrid
- **File Storage**: AWS S3
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Stripe account
- Twilio account (for SMS)
- Postmark or SendGrid account (for email)
- AWS S3 bucket (for file uploads)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd cleanpro
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cleanpro"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Twilio
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1234567890"

# Email (Postmark)
POSTMARK_API_TOKEN="..."
POSTMARK_FROM_EMAIL="noreply@yourdomain.com"

# AWS S3
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="cleanpro-files"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CRON_SECRET="<random-secret>"
```

### 3. Database Setup

```bash
# Run migrations
npm run db:migrate

# (Optional) Seed test data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Database Schema

The application uses a comprehensive multi-tenant schema. See `prisma/schema.prisma` for details.

### Key Models

- **Workspace**: Tenant isolation
- **User**: Authentication (linked to role-specific profiles)
- **Customer**: Customer profiles with addresses
- **Cleaner**: Employee profiles with availability
- **Booking**: Jobs/appointments
- **Service**: Cleaning service definitions
- **Invoice**: Payment tracking
- **Message**: Communication logs
- **Automation**: Automation rules

## API Documentation

See `API_ROUTES.md` for complete API reference.

### Key Endpoints

```
POST   /api/auth/signup              - Create workspace + admin
POST   /api/auth/signin              - Login
GET    /api/customers                - List customers
POST   /api/customers                - Create customer
GET    /api/bookings                 - List bookings
POST   /api/bookings                 - Create booking
GET    /api/calendar                 - Calendar view
GET    /api/cleaners/jobs            - Cleaner's jobs
POST   /api/payments/create-intent   - Create payment
POST   /api/webhooks/stripe          - Stripe webhooks
```

## Project Structure

See `PROJECT_STRUCTURE.md` for detailed file organization.

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Login/signup pages
│   ├── (dashboard)/    # Admin interface
│   ├── (customer)/     # Customer portal
│   ├── (cleaner)/      # Cleaner app
│   └── api/            # API routes
├── components/         # React components
├── lib/
│   ├── auth/          # Authentication
│   ├── services/      # Business logic
│   ├── integrations/  # External APIs
│   └── validators/    # Zod schemas
└── types/             # TypeScript types
```

## Authentication Flow

1. **Signup**: Creates workspace + admin user
2. **Login**: Returns NextAuth session with workspace context
3. **Middleware**: Injects `workspaceId` into all requests
4. **RBAC**: Permissions checked on every API call

## Multi-Tenant Architecture

Every database query is automatically scoped to the user's workspace:

```typescript
// Middleware injects workspaceId
const customers = await prisma.customer.findMany({
  where: { workspaceId } // Always filtered by workspace
})
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

Vercel will automatically:
- Run database migrations
- Set up serverless functions
- Configure edge caching

### Environment Variables in Production

Set all variables from `.env.example` in your deployment platform.

**Important**:
- Use production Stripe keys
- Set `NEXTAUTH_URL` to your domain
- Configure Stripe webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`

### Database Migrations

Production migrations:

```bash
npm run db:migrate:deploy
```

## Stripe Setup

### 1. Get API Keys
- Dashboard → Developers → API Keys
- Copy Secret Key and Publishable Key

### 2. Configure Webhook
- Dashboard → Developers → Webhooks → Add endpoint
- URL: `https://yourdomain.com/api/webhooks/stripe`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 3. Test Mode
Use test keys (`sk_test_...`) for development. Switch to live keys (`sk_live_...`) for production.

## Twilio Setup

1. Create account at twilio.com
2. Get phone number
3. Copy Account SID, Auth Token, and Phone Number
4. Add to `.env`

## Email Setup (Postmark)

1. Create account at postmarkapp.com
2. Add and verify sender signature
3. Get Server API Token
4. Add to `.env`

## AWS S3 Setup

1. Create S3 bucket
2. Create IAM user with S3 access
3. Generate access keys
4. Configure bucket CORS:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## Automations

Automations run via Vercel Cron or similar:

- **Daily 7am**: Send cleaner schedules
- **Hourly**: Check for reminders
- **Every 15min**: Process follow-ups
- **Daily**: Generate upcoming recurring jobs

Example cron configuration (`vercel.json`):

```json
{
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "0 7 * * *"
    },
    {
      "path": "/api/cron/hourly",
      "schedule": "0 * * * *"
    }
  ]
}
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ CSRF protection (NextAuth)
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection (React auto-escaping)
- ✅ Multi-tenant data isolation
- ✅ Role-based access control
- ✅ Stripe webhook signature verification
- ✅ Input validation (Zod)

## Development Scripts

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript check
npm run db:migrate       # Run migrations (dev)
npm run db:migrate:deploy # Run migrations (prod)
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed test data
```

## Testing

### Manual Testing

1. Create workspace: `POST /api/auth/signup`
2. Login: Visit `/login`
3. Create customer: `/customers/new`
4. Create booking: `/bookings/new`
5. View calendar: `/calendar`

### Test Cards (Stripe)

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry, any CVC

## Troubleshooting

### Database Connection Error
```bash
# Check DATABASE_URL format
# postgresql://user:password@host:port/database

# Test connection
npx prisma db pull
```

### Prisma Generate Error
```bash
# Regenerate Prisma Client
npx prisma generate
```

### Stripe Webhook 403 Error
- Verify webhook secret matches Stripe dashboard
- Check endpoint URL is correct
- Ensure no trailing slash

### SMS Not Sending
- Verify Twilio credentials
- Check phone number format (+1234567890)
- Verify Twilio account is active

## Production Checklist

- [ ] Set all environment variables
- [ ] Use production API keys (Stripe, Twilio, etc.)
- [ ] Configure custom domain
- [ ] Set up Stripe webhook endpoint
- [ ] Test payment flow end-to-end
- [ ] Configure email sender domain
- [ ] Set up database backups
- [ ] Enable error monitoring (Sentry)
- [ ] Test all user roles
- [ ] Configure CORS for S3 bucket
- [ ] Set up cron jobs for automations

## Performance Optimization

- Database indexes on `workspaceId`, `scheduledDate`, `status`
- Next.js image optimization
- API route caching where appropriate
- Prisma query optimization
- CDN for static assets

## Roadmap

### MVP (Current)
- ✅ Multi-tenant architecture
- ✅ Booking management
- ✅ Payment processing
- ✅ Messaging & automations
- ✅ Basic reporting

### V1 (Future)
- [ ] Google Calendar sync
- [ ] QuickBooks integration
- [ ] Two-cleaner team assignments
- [ ] Advanced reporting dashboard
- [ ] Mobile apps (React Native)
- [ ] Online booking widget for websites
- [ ] Customer reviews & ratings
- [ ] Inventory management
- [ ] Route optimization

## Support

For issues, please check:
1. This README
2. `ARCHITECTURE.md` for system design
3. `API_ROUTES.md` for API documentation
4. GitHub issues (if public repo)

## License

MIT License - See LICENSE file for details

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

**Built with ❤️ for cleaning businesses worldwide**
