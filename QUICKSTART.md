# CleanPro CRM - Quick Start

## Setup on Your MacBook (2 Options)

### Option 1: Automated Setup (Easiest) ⚡

```bash
cd ~/Desktop/cleanpro
bash setup-mac.sh
```

That's it! The script will:
- ✓ Check all prerequisites
- ✓ Install dependencies
- ✓ Create database
- ✓ Setup environment
- ✓ Seed test data

### Option 2: Manual Setup 📖

Follow the detailed guide: [SETUP_MACOS.md](./SETUP_MACOS.md)

---

## Prerequisites

Before running setup, make sure you have:

1. **Homebrew** - [Install here](https://brew.sh)
2. **Node.js 18+** - `brew install node@20`
3. **PostgreSQL** - `brew install postgresql@14 && brew services start postgresql@14`

---

## Starting the App

```bash
npm run dev
```

Then open: **http://localhost:3000**

---

## Login

- **Email:** admin@cleansweep.com
- **Password:** password123

---

## Useful Commands

```bash
# View all database data in browser
npx prisma studio

# Reset and reseed database
npx prisma db push --force-reset
npm run db:seed

# Or use SQL file
psql -d cleanpro < setup-data.sql

# Run type checking
npm run type-check

# Format code
npm run format
```

---

## What's Included

After setup, you'll have:

- ✅ **1 Admin Account** - Full access to everything
- ✅ **2 Customers** - Jane Doe & Bob Johnson
- ✅ **2 Cleaners** - Maria Garcia & John Smith
- ✅ **3 Services** - Standard, Deep, Move-out Cleaning
- ✅ **2 Bookings** - Scheduled jobs with assigned cleaners

---

## Features

- 📊 **Dashboard** - Overview with stats and recent activity
- 👥 **Customer Management** - Add, edit, view customers
- 📅 **Calendar** - Week view with color-coded assignments
- 🧹 **Booking Management** - Create and track cleaning jobs
- 👤 **Cleaner Management** - Manage your team
- 💼 **Service Management** - Define cleaning services
- 🔐 **Multi-tenant** - Workspace isolation
- 🔑 **Role-based Access** - Admin, Dispatcher, Cleaner, Customer

---

## Troubleshooting

### PostgreSQL not running
```bash
brew services start postgresql@14
```

### Port 3000 in use
```bash
lsof -ti :3000 | xargs kill -9
```

### Login fails
Check database has users:
```bash
psql -d cleanpro -c "SELECT email, role FROM \"User\";"
```

If empty, reseed:
```bash
npm run db:seed
```

---

## Need Help?

1. Read [SETUP_MACOS.md](./SETUP_MACOS.md) for detailed instructions
2. Check troubleshooting section above
3. Verify PostgreSQL is running: `brew services list`

---

## Next Steps

Once logged in, try:

1. **View Dashboard** - See overview of your business
2. **Browse Customers** - Check out Jane and Bob's profiles
3. **Check Calendar** - See scheduled bookings
4. **Add a Customer** - Click "New Customer" button
5. **Explore Services** - View available cleaning services
