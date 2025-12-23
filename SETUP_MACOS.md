# CleanPro CRM - macOS Setup Guide

Complete step-by-step instructions to set up CleanPro CRM on your MacBook from scratch.

## Prerequisites Check

First, check what you have installed:

```bash
# Check if Homebrew is installed
brew --version

# Check Node.js version (need 18+)
node --version

# Check npm version
npm --version

# Check if PostgreSQL is installed
psql --version
```

---

## Step 1: Install Prerequisites

### Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Install Node.js (if needed or version < 18)
```bash
brew install node@20
```

### Install PostgreSQL
```bash
brew install postgresql@14
brew services start postgresql@14
```

Wait 10 seconds for PostgreSQL to start, then verify:
```bash
psql postgres -c "SELECT version();"
```

---

## Step 2: Clone and Setup Project

```bash
# Navigate to your Desktop
cd ~/Desktop

# If you already have a cleanpro folder, remove it
rm -rf cleanpro

# Clone from GitHub (replace with your actual repo URL)
git clone https://github.com/prtkgpt/cleanpro.git
cd cleanpro

# Switch to the correct branch
git checkout claude/cleaning-crm-mvp-3jyld

# Install dependencies
npm install --legacy-peer-deps
```

---

## Step 3: Database Setup

```bash
# Create the database
createdb cleanpro

# Verify database was created
psql -l | grep cleanpro
```

---

## Step 4: Configure Environment

Create a `.env` file in the cleanpro directory:

```bash
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://localhost:5432/cleanpro?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="PigXXti/9G8NsujKW1uy54eOosxfob1Ew5wcEZvVs1g="

# Application
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOF
```

---

## Step 5: Database Migration & Seeding

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed the database with test data
npm run db:seed
```

If seed fails, manually insert data:
```bash
psql -d cleanpro < ~/Desktop/cleanpro/setup-data.sql
```

---

## Step 6: Start the Application

```bash
npm run dev
```

Wait for the message: `✓ Ready in X.Xs`

---

## Step 7: Access the Application

Open your browser and go to: **http://localhost:3000**

### Login Credentials:
- **Email:** `admin@cleansweep.com`
- **Password:** `password123`

---

## Troubleshooting

### Issue: PostgreSQL connection error
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Restart if needed
brew services restart postgresql@14

# Test connection
psql -d cleanpro -c "SELECT 1;"
```

### Issue: Port 3000 already in use
```bash
# Find and kill the process
lsof -ti :3000 | xargs kill -9

# Try starting again
npm run dev
```

### Issue: "invalid credentials" when logging in
The database might not be seeded. Run:
```bash
psql -d cleanpro -c "SELECT email, role FROM \"User\";"
```

If no results, run the manual seed script (see Step 5).

---

## What You Get

After successful setup:
- ✅ 1 Admin account (admin@cleansweep.com)
- ✅ 2 Test customers (Jane Doe, Bob Johnson)
- ✅ 2 Cleaners (Maria Garcia, John Smith)
- ✅ 3 Services (Standard, Deep, Move-out Cleaning)
- ✅ 2 Sample bookings
- ✅ Full dashboard with calendar, customers, bookings

---

## Quick Start Commands

```bash
# Start the app
npm run dev

# View database
npx prisma studio

# Run migrations
npm run db:migrate

# Reseed database
npm run db:seed
```
